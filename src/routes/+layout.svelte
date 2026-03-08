<script lang="ts">
	import favicon from "$lib/assets/favicon.svg";
	import logo from "$lib/assets/favicon.svg?raw";
	import "geist-svelte/font/pixel";
	import "geist-svelte/font/mono";
	import "../app.css";

	const { children } = $props();
</script>

<svelte:head>
	<link rel="icon" type="image/svg+xml" href={favicon} />
</svelte:head>

<header class="absolute inset-x-0 top-0 z-50">
	<div class="mx-auto flex items-center justify-between px-12 py-4">
		<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
		<a class="inline-block size-8" href="/">
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html logo}
		</a>

		<a class="flex items-center" href="https://github.com/olivermrose/squarespill" target="_blank">
			request a wallpaper
		</a>
	</div>
</header>

<main class="relative z-10">
	{@render children?.()}
</main>

<div class="h-[15vw]" aria-hidden="true"></div>

<footer
	class="fixed inset-x-0 bottom-0 z-0 flex h-screen items-end justify-center bg-neutral-950 px-4"
>
	<p class="font-pixel text-[15vw]/none text-neutral-50 uppercase">squarespill</p>
</footer>
