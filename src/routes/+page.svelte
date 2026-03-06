<script lang="ts">
	import Download from "$lib/components/Download.svelte";
	import Tile from "$lib/components/Tile.svelte";
	import { AnimatePresence } from "motion-sv";

	const { data } = $props();

	let selected = $state<number>();
	let query = $state("");

	const filtered = $derived.by(() => {
		const q = query.trim().toLowerCase();
		if (!q) return data.wallpapers;

		return data.wallpapers.filter((w) => {
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
	class="block w-full border-y border-neutral-500/20 bg-transparent px-4 py-3 outline-none placeholder:text-neutral-500"
	type="search"
	placeholder="Search by title, artist, or tag..."
	bind:value={query}
/>

<div class="grid-auto grid w-full grid-flow-dense">
	{#each filtered as wallpaper (wallpaper.id)}
		{@const expanded = wallpaper.id === selected ? wallpaper : undefined}

		<Tile {wallpaper} bind:selected />

		<AnimatePresence>
			{#if expanded}
				<Download wallpaper={expanded} onclose={() => (selected = undefined)} />
			{/if}
		</AnimatePresence>
	{/each}
</div>

<style>
	.grid-auto {
		grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
	}
</style>
