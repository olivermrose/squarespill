import { building } from "$app/environment";
import { createAuth } from "$lib/server/auth";
import { svelteKitHandler } from "better-auth/svelte-kit";

export async function handle({ event, resolve }) {
	if (!event.platform) {
		return resolve(event);
	}

	const auth = createAuth(event.platform);

	event.locals.db = event.platform.env.DB;
	event.locals.auth = auth;

	const session = await auth.api.getSession({
		headers: event.request.headers,
	});

	event.locals.user = session?.user ?? null;
	event.locals.session = session?.session ?? null;

	return svelteKitHandler({ event, resolve, auth, building });
}
