import { env } from "$env/dynamic/private";

export async function load({ locals, depends }) {
	depends("app:admin");

	if (!locals.session) {
		return { admin: false };
	}

	const ghAccount = await locals.db
		.prepare(
			`SELECT * FROM
				account
			WHERE
				userId = ? AND
				providerId = 'github' AND
				accountId = ?`,
		)
		.bind(locals.session.userId, env.GITHUB_ADMIN_ID)
		.first();

	return { admin: typeof ghAccount !== "undefined" };
}
