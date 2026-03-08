<script lang="ts">
	import favicon from "$lib/assets/favicon.svg";
	import Header from "$lib/components/Header.svelte";
	import "geist-svelte/font/pixel";
	import "geist-svelte/font/mono";
	import "../app.css";

	const { children } = $props();
</script>

<svelte:head>
	<link rel="icon" type="image/svg+xml" href={favicon} />

	<title>squarespill</title>
	<meta
		name="description"
		content="Visualize your taste. Extended cover arts as wallpapers, free to download."
	/>

	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://squarespill.com" />
	<meta property="og:title" content="squarespill" />
	<meta
		property="og:description"
		content="Visualize your taste. Extended cover arts as wallpapers, free to download."
	/>
</svelte:head>

<Header />

<main class="relative z-10">
	{@render children?.()}
</main>

<div class="h-[15vw]" aria-hidden="true"></div>

<footer
	class="fixed inset-x-0 bottom-0 z-0 flex h-screen items-end justify-center bg-neutral-950 px-4"
>
	<p class="font-pixel text-[15vw]/none text-neutral-50 uppercase">squarespill</p>
</footer>
