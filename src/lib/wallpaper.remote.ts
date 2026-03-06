import { command } from '$app/server';
import z from 'zod';
import sharp from 'sharp';
import { error } from '@sveltejs/kit';
import { R2_PUBLIC_URL, RESOLUTIONS } from './constants';

export const downloadWallpaper = command(
	z.object({
		file: z.string().regex(/^[\w-]+$/, 'Invalid file name'),
		format: z.enum(['png', 'jpg', 'webp', 'avif']),
		resolution: z.enum(['fhd', 'qhd', 'uhd'])
	}),
	async (data) => {
		const { width, height } = RESOLUTIONS[data.resolution];

		const response = await fetch(`${R2_PUBLIC_URL}/${data.file}.avif`);

		if (!response.ok) {
			error(response.status, 'Failed to fetch wallpaper');
		}

		const buffer = await response.arrayBuffer();
		const format = data.format === 'jpg' ? 'jpeg' : data.format;

		const output = await sharp(buffer)
			.resize(width, height, { fit: 'cover' })
			.toFormat(format)
			.toBuffer();

		return {
			data: output.toString('base64'),
			mimeType: `image/${format}`,
			filename: `${data.file}.${data.format}`
		};
	}
);
