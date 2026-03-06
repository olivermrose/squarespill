import { pgTable, serial, text } from "drizzle-orm/pg-core";

export const wallpapers = pgTable("wallpapers", {
	id: serial().primaryKey(),
	file: text().notNull(),
	title: text().notNull(),
	artist: text().notNull(),
});

export type Wallpaper = typeof wallpapers.$inferSelect;
