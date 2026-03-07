<script lang="ts">
	import type { Wallpaper } from "$lib/server/db/schema";
	import Download from "$lib/components/Download.svelte";
	import Tile from "$lib/components/Tile.svelte";
	import { AnimatePresence } from "motion-sv";

	interface Props {
		wallpapers: Wallpaper[];
	}

	const { wallpapers }: Props = $props();

	let selected = $state<number>();
	let query = $state("");

	const filtered = $derived.by(() => {
		const q = query.trim().toLowerCase();
		if (!q) return wallpapers;

		return wallpapers.filter((w) => {
			return (
				w.title.toLowerCase().includes(q) ||
				w.artist.toLowerCase().includes(q) ||
				w.tags?.some((t) => t.toLowerCase().includes(q))
			);
		});
	});
</script>

<input
	id="search"
	class="block w-full border-y bg-transparent px-4 py-3 font-mono outline-none placeholder:text-neutral-500"
	type="search"
	placeholder="Search by title, artist, or tag..."
	bind:value={query}
/>

<section id="gallery" class="grid-auto grid w-full grid-flow-dense">
	{#each filtered as wallpaper (wallpaper.id)}
		{@const expanded = wallpaper.id === selected ? wallpaper : undefined}

		<Tile {wallpaper} bind:selected />

		<AnimatePresence>
			{#if expanded}
				<Download wallpaper={expanded} onclose={() => (selected = undefined)} />
			{/if}
		</AnimatePresence>
	{/each}
</section>

<style>
	.grid-auto {
		grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
	}
</style>
