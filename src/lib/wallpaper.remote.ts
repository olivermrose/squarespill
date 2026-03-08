import { Buffer } from "node:buffer";
import { command, form, query } from "$app/server";
import { error } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import sharp from "sharp";
import z from "zod";
import { R2_PUBLIC_URL, RESOLUTIONS } from "./constants";
import { db } from "./server/db";
import { wallpapers } from "./server/db/schema";
import { deleteFile, uploadFile } from "./server/r2";

export const getWallpapers = query(async () => {
	return await db.select().from(wallpapers).orderBy(wallpapers.title);
});

export const downloadWallpaper = command(
	z.object({
		file: z.string().regex(/^[\w-]+$/, "Invalid file name"),
		format: z.enum(["png", "jpg", "webp", "avif"]),
		resolution: z.enum(["qhd", "hd", "hdplus", "fhd", "wqhd", "threek", "uhd4k", "fivek", "uhd8k"]),
	}),
	async (data) => {
		const { width, height } = RESOLUTIONS[data.resolution];

		const response = await fetch(`${R2_PUBLIC_URL}/${data.file}.avif`);

		if (!response.ok) {
			error(response.status, "Failed to fetch wallpaper");
		}

		const buffer = await response.arrayBuffer();
		const format = data.format === "jpg" ? "jpeg" : data.format;

		const output = await sharp(buffer)
			.resize(width, height, { fit: "cover" })
			.toFormat(format)
			.toBuffer();

		return {
			data: output.toString("base64"),
			mimeType: `image/${format}`,
			filename: `${data.file}.${data.format}`,
		};
	},
);

const wallpaperSchema = z.object({
	file: z.file(),
	title: z.string().trim(),
	artist: z.string().trim(),
	tags: z.string().optional(),
});

const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "_");

export const uploadWallpaper = form(wallpaperSchema, async (data) => {
	const buffer = await ensureAvif(data.file);
	const slug = `${slugify(data.title)}-${slugify(data.artist)}`;

	await uploadFile(`${slug}.avif`, buffer);

	await db.insert(wallpapers).values({
		file: slug,
		title: data.title,
		artist: data.artist,
		tags:
			data.tags
				?.split(",")
				.map((t) => t.trim())
				.filter(Boolean) ?? [],
	});

	return { success: true };
});

export const editWallpaper = form(
	wallpaperSchema.extend({
		id: z.number(),
		file: z.file().optional(),
	}),
	async (data) => {
		const [existing] = await db.select().from(wallpapers).where(eq(wallpapers.id, data.id));

		if (!existing) {
			error(404, "Wallpaper not found");
		}

		let slug = existing.file;

		if (data.file) {
			const buffer = await ensureAvif(data.file);
			slug = `${slugify(data.title)}-${slugify(data.artist)}`;

			if (existing.file !== slug) {
				await deleteFile(`${existing.file}.avif`);
			}

			await uploadFile(`${slug}.avif`, buffer);
		}

		await db
			.update(wallpapers)
			.set({
				file: slug,
				title: data.title,
				artist: data.artist,
				tags:
					data.tags
						?.split(",")
						.map((t) => t.trim())
						.filter(Boolean) ?? [],
			})
			.where(eq(wallpapers.id, data.id));

		return { success: true };
	},
);

export const deleteWallpaper = command(z.number(), async (id) => {
	const [existing] = await db.select().from(wallpapers).where(eq(wallpapers.id, id));

	if (!existing) {
		error(404, "Wallpaper not found");
	}

	await deleteFile(`${existing.file}.avif`);
	await db.delete(wallpapers).where(eq(wallpapers.id, id));

	return { success: true };
});

async function ensureAvif(file: File) {
	let buffer = Buffer.from<ArrayBufferLike>(await file.arrayBuffer());

	if (file.type !== "image/avif") {
		buffer = await sharp(buffer).avif({ quality: 60 }).toBuffer();
	}

	return buffer;
}
