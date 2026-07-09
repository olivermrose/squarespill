import { command, form, getRequestEvent, query } from "$app/server";
import { env } from "$env/dynamic/public";
import { error } from "@sveltejs/kit";
import z from "zod";
import { R2_PUBLIC_URL, RESOLUTIONS } from "./constants";

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

		const formData = new FormData();
		formData.append("file", await response.blob());
		formData.append("format", format);
		formData.append("width", width.toString());
		formData.append("height", height.toString());

		const transformResponse = await fetch(`${env.PUBLIC_TRANSFORM_URL}/transform`, {
			method: "POST",
			body: formData,
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
			}

			await locals.r2.put(`${slug}.avif`, blob);
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

	await locals.r2.delete(`${existing.slug}.avif`);

	return { success: true };
});

async function ensureAvif(file: File) {
	const formData = new FormData();
	formData.append("file", file);

	const response = await fetch(`${env.PUBLIC_TRANSFORM_URL}/normalize`, {
		method: "POST",
		body: formData,
	});

	return response.blob() as never;
}
