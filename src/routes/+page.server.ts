import { db } from "$lib/server/db";
import { wallpapers } from "$lib/server/db/schema";

export async function load() {
	return { wallpapers: await db.select().from(wallpapers) };
}
