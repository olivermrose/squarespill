import type { createAuth } from "$lib/server/auth";
import type { D1Database, KVNamespace, R2Bucket } from "@cloudflare/workers-types";

type Auth = ReturnType<typeof createAuth>;

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			db: D1Database;
			auth: Auth;
			user: Auth["$Infer"]["Session"]["user"] | null;
			session: Auth["$Infer"]["Session"]["session"] | null;
		}
		// interface PageData {}
		// interface PageState {}
		interface Platform {
			env: {
				DB: D1Database;
				KV: KVNamespace;
				R2: R2Bucket;
			};
		}
	}
}

export {};
