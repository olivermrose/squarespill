import { pgTable, serial, text } from 'drizzle-orm/pg-core';

export const wallpapers = pgTable('wallpapers', {
	id: serial('id').primaryKey(),
	file: text().notNull(),
	title: text('title').notNull(),
	artist: text('artist').notNull()
});

export type Wallpaper = typeof wallpapers.$inferSelect;
