import type { TransformResult, TransformRequest, TransformResponse } from "./download.worker";
import { FORMATS, RESOLUTIONS, type Format, type Resolution } from "./constants";
import { resolve } from "$app/paths";

const QUALITY = 0.92;

let worker: Worker | undefined;
let nextId = 0;

interface Handlers {
	resolve: (value: TransformResult) => void;
	reject: (error: Error) => void;
}

const pending = new Map<number, Handlers>();

function getWorker() {
	if (worker) return worker;

	worker = new Worker(new URL("./download.worker.ts", import.meta.url), { type: "module" });

	worker.addEventListener("message", (event: MessageEvent<TransformResponse>) => {
		const handlers = pending.get(event.data.id);
		if (!handlers) return;

		pending.delete(event.data.id);

		if (event.data.ok) {
			handlers.resolve(event.data);
		} else {
			handlers.reject(new Error(event.data.error));
		}
	});

	worker.addEventListener("error", (event) => {
		for (const handlers of pending.values()) {
			handlers.reject(new Error(event.message || "Transform worker failed"));
		}

		pending.clear();
	});

	return worker;
}

export function transform(slug: string, resolution: Resolution, format: Format) {
	const { width, height } = RESOLUTIONS[resolution];
	const id = nextId++;

	const request: TransformRequest = {
		id,
		url: resolve("/w/[slug]", { slug }),
		width,
		height,
		type: FORMATS[format],
		quality: QUALITY,
	};

	const { promise, ...resolvers } = Promise.withResolvers<TransformResult>();

	pending.set(id, resolvers);
	getWorker().postMessage(request);

	return promise;
}

export function save(blob: Blob, filename: string) {
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement("a");

	anchor.href = url;
	anchor.download = filename;

	document.body.appendChild(anchor);
	anchor.click();
	document.body.removeChild(anchor);

	URL.revokeObjectURL(url);
}
