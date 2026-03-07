<script lang="ts">
	import Download from "$lib/components/Download.svelte";
	import Tile from "$lib/components/Tile.svelte";
	import { R2_PUBLIC_URL } from "$lib/constants";
	import { AnimatePresence } from "motion-sv";
	import { fade } from "svelte/transition";

	const { data } = $props();

	let heroIndex = $state(0);
	let selected = $state<number>();
	let query = $state("");

	$effect(() => {
		let i = 0;

		const interval = setInterval(() => {
			i = (i + 1) % data.wallpapers.length;
			heroIndex = i;
		}, 5000);

		return () => clearInterval(interval);
	});

	const heroWallpaper = $derived(data.wallpapers[heroIndex]);

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

<section class="relative aspect-2/1 overflow-hidden">
	{#key heroIndex}
		<img
			class="absolute inset-0 h-full w-full object-cover"
			src="{R2_PUBLIC_URL}/{heroWallpaper.file}.avif"
			alt=""
			aria-hidden="true"
			in:fade={{ duration: 1000 }}
			out:fade={{ duration: 1000 }}
		/>
	{/key}

	<div class="absolute inset-0 bg-linear-to-r from-black via-black/50 to-black/10"></div>

	<div class="relative flex h-full items-center px-10 py-16">
		<hgroup class="max-w-3xl">
			<h1 class="text-6xl font-normal tracking-tight text-neutral-50">
				Non reprehenderit in ea excepteur.
			</h1>

			<p class="mt-3 text-lg text-neutral-300/80">Cupidatat voluptate ullamco dolore tempor.</p>
		</hgroup>
	</div>
</section>

<input
	id="search"
	class="block w-full border-y bg-transparent px-4 py-3 outline-none placeholder:text-neutral-500"
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
