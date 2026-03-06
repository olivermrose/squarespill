<script lang="ts">
	import Download from "$lib/components/Download.svelte";
	import Tile from "$lib/components/Tile.svelte";
	import { AnimatePresence } from "motion-sv";

	const { data } = $props();

	let container = $state<HTMLDivElement>();
	let selected = $state<number>();
	let columns = $state(4);

	const rows = $derived.by(() => {
		const rows = [];

		for (let i = 0; i < data.wallpapers.length; i += columns) {
			rows.push(data.wallpapers.slice(i, i + columns));
		}

		return rows;
	});

	function updateColumns() {
		if (container) {
			columns = Math.max(1, Math.floor(container.offsetWidth / 350));
		}
	}
</script>

<svelte:window onresize={updateColumns} />

<div class="w-full" bind:this={container}>
	<!-- eslint-disable-next-line svelte/require-each-key -->
	{#each rows as row}
		{@const expanded = row.find((w) => w.id === selected)}

		<div>
			<div class="grid-auto grid">
				{#each row as wallpaper (wallpaper.id)}
					<Tile {wallpaper} bind:selected />
				{/each}
			</div>

			<AnimatePresence>
				{#if expanded}
					<Download wallpaper={expanded} onclose={() => (selected = undefined)} />
				{/if}
			</AnimatePresence>
		</div>
	{/each}
</div>

<style>
	.grid-auto {
		grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
	}
</style>
