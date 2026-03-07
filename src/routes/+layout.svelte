<script lang="ts">
	import favicon from "$lib/assets/favicon.svg";
	import logo from "$lib/assets/favicon.svg?raw";
	import "../app.css";

	const { children } = $props();
</script>

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

<svelte:head>
	<link rel="icon" type="image/svg+xml" href={favicon} />
</svelte:head>

<main>
	{@render children?.()}
</main>

<footer>
	<div class="mx-auto flex max-w-7xl items-center justify-between px-6 py-8">
		<p class="text-xs text-neutral-500">
			&copy; {new Date().getFullYear()} squarespill
		</p>
	</div>
</footer>
