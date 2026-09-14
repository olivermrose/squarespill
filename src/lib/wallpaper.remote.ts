import type { R2Bucket } from "@cloudflare/workers-types";
import { command, form, getRequestEvent, query } from "$app/server";
import { error } from "@sveltejs/kit";
import sharp from "sharp";
import z from "zod";
import { THUMBNAIL } from "./constants";

const AVIF_QUALITY = 60;

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
	if (!import.meta.env.DEV) {
		error(500, "Wallpaper uploads need to be ran locally");
	}

	const { locals } = getRequestEvent();

	const bytes = await ensureAvif(data.file);
	const slug = `${slugify(data.title)}-${slugify(data.artist)}`;

	const tags =
		data.tags
			?.split(",")
			.map((t) => t.trim())
			.filter(Boolean)
			.join(",") || null;

	await locals.r2.put(`${slug}.avif`, bytes);
	await generateThumbnail(locals.r2, slug, bytes);

	await locals.db
		.prepare(
			`INSERT INTO
				wallpapers (slug, title, artist, tags)
			VALUES
				(?, ?, ?, ?)`,
		)
		.bind(slug, data.title, data.artist, tags)
		.run();

	await getWallpapers().refresh();

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
			if (!import.meta.env.DEV) {
				error(500, "Wallpaper file edits need to be ran locally");
			}

			const bytes = await ensureAvif(data.file);
			slug = `${slugify(data.title)}-${slugify(data.artist)}`;

			if (existing.slug !== slug) {
				await locals.r2.delete(`${existing.slug}.avif`);
				await locals.r2.delete(`thumbnails/${existing.slug}.avif`);
			}

			await locals.r2.put(`${slug}.avif`, bytes);
			await generateThumbnail(locals.r2, slug, bytes);
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

		await getWallpapers().refresh();

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

async function generateThumbnail(r2: R2Bucket, slug: string, source: Uint8Array<ArrayBuffer>) {
	const thumbnail = await sharp(source)
		.resize(THUMBNAIL.width, THUMBNAIL.height, { fit: "cover" })
		.avif({ quality: AVIF_QUALITY })
		.toBuffer();

	await r2.put(`thumbnails/${slug}.avif`, new Uint8Array(thumbnail), {
		httpMetadata: { contentType: "image/avif" },
	});
}

async function ensureAvif(file: File) {
	const buffer = new Uint8Array(await file.arrayBuffer());

	if (file.type === "image/avif") {
		return buffer;
	}

	return new Uint8Array(await sharp(buffer).avif({ quality: AVIF_QUALITY }).toBuffer());
}
