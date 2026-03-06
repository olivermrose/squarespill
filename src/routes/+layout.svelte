<script lang="ts">
	import favicon from "$lib/assets/favicon.svg";
	import "../app.css";

	const { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<header class="sticky top-0 z-50 border-b border-neutral-500/20 backdrop-blur-2xl">
	<div class="mx-auto max-w-7xl p-4">
		<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
		<a href="/">
			<h1 class="text-xl/none font-bold">
				square<span class="text-neutral-400">spill</span>
			</h1>
		</a>
	</div>
</header>

<main>
	{@render children?.()}
</main>

<footer class="border-t border-neutral-500/20">
	<div class="mx-auto flex max-w-7xl items-center justify-between px-6 py-8">
		<p class="text-xs text-neutral-500">
			&copy; {new Date().getFullYear()} squarespill
		</p>
	</div>
</footer>
