import { env } from "$env/dynamic/private";
import { db } from "$lib/server/db";
import { account } from "$lib/server/db/schema";
import { and, eq } from "drizzle-orm";

export async function load({ locals, depends }) {
	depends("app:admin");

	if (!locals.session) {
		return { admin: false };
	}

	const [ghAccount] = await db
		.select()
		.from(account)
		.where(
			and(
				eq(account.userId, locals.session.userId),
				eq(account.providerId, "github"),
				eq(account.accountId, env.GITHUB_ADMIN_ID),
			),
		);

	return { admin: typeof ghAccount !== "undefined" };
}
