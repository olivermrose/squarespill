import type { R2Bucket } from "@cloudflare/workers-types";
import { command, form, getRequestEvent, query } from "$app/server";
import { env } from "$env/dynamic/public";
import { error } from "@sveltejs/kit";
import z from "zod";
import { R2_PUBLIC_URL, RESOLUTIONS, THUMBNAIL } from "./constants";

export interface Wallpaper {
	id: number;
	slug: string;
	title: string;
	artist: string;
	tags: string | null;
}

export const getWallpapers = query(async () => {
	const { locals } = getRequestEvent();

	const rv = await locals.db
		.prepare("SELECT * FROM wallpapers ORDER BY title COLLATE NOCASE")
		.all<Wallpaper>();

	return rv.results;
});

export const downloadWallpaper = command(
	z.object({
		slug: z.string(),
		format: z.enum(["png", "jpg", "webp", "avif"]),
		resolution: z.enum(["qhd", "hd", "hdplus", "fhd", "wqhd", "threek", "uhd4k", "fivek", "uhd8k"]),
	}),
	async (data) => {
		const { width, height } = RESOLUTIONS[data.resolution];

		const response = await fetch(`${R2_PUBLIC_URL}/${data.slug}.avif`);

		if (!response.ok) {
			error(response.status, "Failed to fetch wallpaper");
		}

		const format = data.format === "jpg" ? "jpeg" : data.format;

		const blob = await response.blob();

		const body = formData({
			file: new File([blob], `${data.slug}.avif`, { type: "image/avif" }),
			format,
			width: width.toString(),
			height: height.toString(),
		});

		const transformResponse = await fetch(`${env.PUBLIC_TRANSFORM_URL}/transform`, {
			method: "POST",
			body,
		});

		if (!transformResponse.ok) {
			error(transformResponse.status, "Failed to transform wallpaper");
		}

		const output = await transformResponse.text();

		return {
			data: output,
			mimeType: `image/${format}`,
			filename: `${data.slug}.${data.format}`,
		};
	},
);

const wallpaperSchema = z.object({
	file: z.file(),
	title: z.string().trim(),
	artist: z.string().trim(),
	tags: z.string().optional(),
});

const slugify = (text: string) =>
	text
		.toLowerCase()
		.normalize("NFKD")
		// eslint-disable-next-line e18e/prefer-static-regex
		.replace(/[^a-z0-9]+/g, "_");

export const uploadWallpaper = form(wallpaperSchema, async (data) => {
	const { locals } = getRequestEvent();

	const blob = await ensureAvif(data.file);
	const slug = `${slugify(data.title)}-${slugify(data.artist)}`;

	const tags =
		data.tags
			?.split(",")
			.map((t) => t.trim())
			.filter(Boolean)
			.join(",") || null;

	await locals.r2.put(`${slug}.avif`, blob);
	await generateThumbnail(locals.r2, slug, blob);

	await locals.db
		.prepare(
			`INSERT INTO
				wallpapers (slug, title, artist, tags)
			VALUES
				(?, ?, ?, ?)`,
		)
		.bind(slug, data.title, data.artist, tags)
		.run();

	return { success: true };
});

export const editWallpaper = form(
	wallpaperSchema.extend({
		id: z.number(),
		file: z.file().optional(),
	}),
	async (data) => {
		const { locals } = getRequestEvent();

		const existing = await locals.db
			.prepare(`SELECT slug FROM wallpapers WHERE id = ?`)
			.bind(data.id)
			.first<{ slug: string }>();

		if (!existing) {
			error(404, "Wallpaper not found");
		}

		let slug = existing.slug;

		if (data.file) {
			const blob = await ensureAvif(data.file);
			slug = `${slugify(data.title)}-${slugify(data.artist)}`;

			if (existing.slug !== slug) {
				await locals.r2.delete(`${existing.slug}.avif`);
				await locals.r2.delete(`thumbnails/${existing.slug}.avif`);
			}

			await locals.r2.put(`${slug}.avif`, blob);
			await generateThumbnail(locals.r2, slug, blob);
		}

		const tags =
			data.tags
				?.split(",")
				.map((t) => t.trim())
				.filter(Boolean)
				.join(",") || null;

		await locals.db
			.prepare(
				`UPDATE
					wallpapers
				SET
					slug = ?,
					title = ?,
					artist = ?,
					tags = ?
				WHERE
					id = ?`,
			)
			.bind(slug, data.title, data.artist, tags, data.id)
			.run();

		return { success: true };
	},
);

export const deleteWallpaper = command(z.number(), async (id) => {
	const { locals } = getRequestEvent();

	const existing = await locals.db
		.prepare(`DELETE FROM wallpapers WHERE id = ? RETURNING slug`)
		.bind(id)
		.first<{ slug: string }>();

	if (!existing) {
		error(404, "Wallpaper not found");
	}

	await locals.r2.delete([`${existing.slug}.avif`, `thumbnails/${existing.slug}.avif`]);

	return { success: true };
});

async function generateThumbnail(r2: R2Bucket, slug: string, source: Blob) {
	const body = formData({
		file: new File([source], `${slug}.avif`, { type: "image/avif" }),
		format: "avif",
		width: THUMBNAIL.width.toString(),
		height: THUMBNAIL.height.toString(),
	});

	const response = await fetch(`${env.PUBLIC_TRANSFORM_URL}/transform`, {
		method: "POST",
		body,
	});

	if (!response.ok) {
		error(response.status, "Failed to generate thumbnail");
	}

	const base64 = await response.text();
	const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

	await r2.put(`thumbnails/${slug}.avif`, bytes, {
		httpMetadata: { contentType: "image/avif" },
	});
}

async function ensureAvif(file: File) {
	const buffer = await file.arrayBuffer();

	const body = formData({
		file: new File([buffer], file.name || "upload", {
			type: file.type || "application/octet-stream",
		}),
	});

	const response = await fetch(`${env.PUBLIC_TRANSFORM_URL}/normalize`, {
		method: "POST",
		body,
	});

	return response.blob() as never;
}

function formData(data: Record<string, string | number | File>) {
	const fd = new FormData();

	for (const [key, value] of Object.entries(data)) {
		if (value instanceof File) {
			fd.append(key, value, value.name);
		} else {
			fd.append(key, value.toString());
		}
	}

	return fd;
}
