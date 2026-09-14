import { error } from "@sveltejs/kit";

export async function GET({ params, locals, request }) {
	if (!locals.r2) {
		error(500, "Storage unavailable");
	}

	const object = await locals.r2.get(`${params.slug}.avif`);

	if (!object) {
		error(404, "Wallpaper not found");
	}

	const headers = {
		"Content-Type": "image/avif",
		// Slugs are reused when a wallpaper is edited in place, so revalidate
		// rather than marking these immutable.
		"Cache-Control": "public, max-age=3600",
		ETag: object.httpEtag,
	};

	if (isFresh(request.headers.get("if-none-match"), object.httpEtag)) {
		await object.body?.cancel();

		return new Response(null, { status: 304, headers });
	}

	// oxlint-disable-next-line
	return new Response(object.body as unknown as ReadableStream, { headers });
}

const strong = (value: string) => value.trim().replace(/^W\//, "");

function isFresh(ifNoneMatch: string | null, etag: string) {
	if (!ifNoneMatch) {
		return false;
	}

	if (ifNoneMatch.trim() === "*") {
		return true;
	}

	return ifNoneMatch.split(",").some((candidate) => strong(candidate) === strong(etag));
}
