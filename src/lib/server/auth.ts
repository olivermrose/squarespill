import { getRequestEvent } from "$app/server";
import { env } from "$env/dynamic/private";
import { betterAuth } from "better-auth";
import { sveltekitCookies } from "better-auth/svelte-kit";

export function createAuth(platform: App.Platform) {
	const kv = platform.env.KV;

	return betterAuth({
		baseURL: env.BETTER_AUTH_URL,
		secret: env.BETTER_AUTH_SECRET,
		plugins: [sveltekitCookies(getRequestEvent)],
		database: platform.env.DB,
		rateLimit: {
			enabled: true,
			storage: "secondary-storage",
		},
		secondaryStorage: {
			get: async (key) => kv.get(`auth:${key}`),
			set: async (key, val, ttl) =>
				kv.put(`auth:${key}`, val, {
					expirationTtl: ttl ? Math.max(ttl, 60) : undefined,
				}),
			delete: async (key) => kv.delete(`auth:${key}`),
		},
		socialProviders: {
			github: {
				clientId: env.GITHUB_CLIENT_ID,
				clientSecret: env.GITHUB_CLIENT_SECRET,
			},
		},
	});
}
