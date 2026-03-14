<script lang="ts">
	import Gallery from "$lib/components/Gallery.svelte";
	import { R2_PUBLIC_URL } from "$lib/constants";
	import { getWallpapers } from "$lib/wallpaper.remote";
	import { fade } from "svelte/transition";

	let heroIndex = $state(0);

	// eslint-disable-next-line antfu/no-top-level-await
	const wallpapers = $derived(await getWallpapers());
	const heroWallpaper = $derived(wallpapers[heroIndex]);

	$effect(() => {
		let i = 0;

		const interval = setInterval(() => {
			i = (i + 1) % wallpapers.length;
			heroIndex = i;
		}, 5000);

		return () => clearInterval(interval);
	});
</script>

<section id="hero" class="relative aspect-2/1 overflow-hidden bg-neutral-950">
	{#key heroIndex}
		<img
			class="absolute inset-0 h-full w-full object-cover"
			src="{R2_PUBLIC_URL}/{heroWallpaper.slug}.avif"
			alt=""
			aria-hidden="true"
			in:fade={{ duration: 1000 }}
			out:fade={{ duration: 1000 }}
		/>
	{/key}

	<div class="absolute inset-0 bg-linear-to-r from-black via-black/50 to-black/10"></div>

	<div class="relative flex h-full items-end p-12">
		<hgroup class="max-w-3xl">
			<h1 class="text-6xl font-normal tracking-tight text-neutral-50">Soundtrack your setup.</h1>

			<p class="mt-3 font-mono text-lg text-neutral-300/80">
				Visualize your taste. Extended cover arts as wallpapers, free to download.
			</p>
		</hgroup>
	</div>
</section>

<Gallery {wallpapers} />
