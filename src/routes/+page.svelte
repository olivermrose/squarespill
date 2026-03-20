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

<section id="hero" class="relative overflow-hidden bg-neutral-950 max-md:grid md:aspect-2/1">
	{#key heroIndex}
		<img
			class="inset-0 col-start-1 row-start-1 h-full w-full object-cover md:absolute"
			src="{R2_PUBLIC_URL}/{heroWallpaper.slug}.avif"
			alt=""
			fetchpriority="high"
			aria-hidden="true"
			in:fade={{ duration: 1000 }}
			out:fade={{ duration: 1000 }}
		/>
	{/key}

	<div
		class={[
			"inset-0 z-10 col-start-1 row-start-1 bg-linear-to-b from-transparent to-neutral-950",
			"md:absolute md:bg-linear-to-tr md:from-neutral-950 md:via-black/50 md:to-transparent",
		]}
	></div>

	<div class="relative z-20 flex h-full items-end p-8 md:p-12">
		<hgroup class="max-w-3xl">
			<h1 class="text-5xl font-normal tracking-tight text-neutral-50 md:text-6xl">
				Soundtrack your setup.
			</h1>

			<p class="mt-3 font-mono text-lg text-neutral-300/80">
				Visualize your taste. Extended cover arts as wallpapers, free to download.
			</p>
		</hgroup>
	</div>
</section>

<Gallery {wallpapers} />
