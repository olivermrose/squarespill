import type { auth } from "$lib/server/auth";
import type { R2Bucket } from "@cloudflare/workers-types";

type Session = typeof auth.$Infer.Session.session;
type User = typeof auth.$Infer.Session.user;

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: User | null;
			session: Session | null;
		}
		// interface PageData {}
		// interface PageState {}
		interface Platform {
			env: {
				R2_BUCKET: R2Bucket;
			};
		}
	}
}

export {};
