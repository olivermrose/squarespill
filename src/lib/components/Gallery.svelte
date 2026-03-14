<script lang="ts">
	import type { Wallpaper } from "$lib/wallpaper.remote";
	import Details from "$lib/components/Details.svelte";
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
			const tags = w.tags?.split(",");

			return (
				w.title.toLowerCase().includes(q) ||
				w.artist.toLowerCase().includes(q) ||
				tags?.some((t) => t.toLowerCase().includes(q))
			);
		});
	});
</script>

<input
	id="search"
	class="block w-full border-x-0 border-neutral-700/50 bg-neutral-950 px-6 py-4 text-base placeholder:font-mono placeholder:text-neutral-500"
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
				<Details wallpaper={expanded} onclose={() => (selected = undefined)} />
			{/if}
		</AnimatePresence>
	{/each}
</section>

<style>
	.grid-auto {
		grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
	}
</style>
