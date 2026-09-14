export interface TransformRequest {
	id: number;
	url: string;
	width: number;
	height: number;
	type: string;
	quality: number;
}

export interface TransformResult {
	blob: Blob;
	encoder: Encoder;
}

interface TransformSuccess {
	id: number;
	ok: true;
	blob: Blob;
	encoder: Encoder;
}

interface TransformFailure {
	id: number;
	ok: false;
	error: string;
}

export type TransformResponse = TransformSuccess | TransformFailure;

export type Encoder = "copy" | "native" | "wasm";

self.addEventListener("message", async (event: MessageEvent<TransformRequest>) => {
	const { id, url, width, height, type, quality } = event.data;

	try {
		const { blob, encoder } = await transform(url, width, height, type, quality);

		self.postMessage({
			id,
			ok: true,
			blob,
			encoder,
		} satisfies TransformResponse);
	} catch (error) {
		self.postMessage({
			id,
			ok: false,
			error: error instanceof Error ? error.message : String(error),
		} satisfies TransformResponse);
	}
});

async function resize(bitmap: ImageBitmap, width: number, height: number) {
	if (bitmap.width === width && bitmap.height === height) {
		return bitmap;
	}

	try {
		return await createImageBitmap(bitmap, {
			resizeWidth: width,
			resizeHeight: height,
			resizeQuality: "high",
		});
	} catch {
		return bitmap;
	}
}

async function nativeEncode(canvas: OffscreenCanvas, type: string, quality: number) {
	try {
		const blob = await canvas.convertToBlob(
			type === "image/png" ? { type } : { type, quality },
		);

		return blob.type === type ? blob : null;
	} catch {
		return null;
	}
}

async function wasmEncode(pixels: ImageData, type: string, quality: number) {
	if (type === "image/webp") {
		const { default: webp } = await import("@jsquash/webp/encode.js");

		return new Blob([await webp(pixels, { quality: quality * 100 })], { type });
	}

	if (type === "image/avif") {
		const { default: avif } = await import("@jsquash/avif/encode.js");

		return new Blob([await avif(pixels, { quality: quality * 100 })], { type });
	}

	throw new Error(`This browser cannot encode ${type}`);
}

async function transform(
	url: string,
	width: number,
	height: number,
	type: string,
	quality: number,
): Promise<TransformResult> {
	const response = await fetch(url);

	if (!response.ok) {
		throw new Error(`Could not fetch the wallpaper (${response.status})`);
	}

	const source = await response.blob();
	const decoded = await createImageBitmap(source);

	if (type === "image/avif" && decoded.width === width && decoded.height === height) {
		decoded.close();

		return {
			blob: source,
			encoder: "copy",
		};
	}

	const scaled = await resize(decoded, width, height);

	try {
		const canvas = new OffscreenCanvas(width, height);
		const context = canvas.getContext("2d");

		if (!context) {
			throw new Error("Could not get a 2D context");
		}

		context.imageSmoothingQuality = "high";
		context.drawImage(scaled, 0, 0, width, height);

		const native = await nativeEncode(canvas, type, quality);

		if (native) {
			return {
				blob: native,
				encoder: "native",
			};
		}

		const pixels = context.getImageData(0, 0, width, height);

		return {
			blob: await wasmEncode(pixels, type, quality),
			encoder: "wasm",
		};
	} finally {
		scaled.close();

		if (scaled !== decoded) {
			decoded.close();
		}
	}
}
