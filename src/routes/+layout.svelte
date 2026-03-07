<script lang="ts">
	import "../app.css";

	const { children } = $props();
</script>

<header class="fixed inset-x-0 top-0 z-50 border-b backdrop-blur-2xl">
	<div class="mx-auto max-w-7xl p-4">
		<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
		<a href="/">
			<span class="text-xl/none font-bold text-neutral-50">
				square<span class="text-neutral-400">spill</span>
			</span>
		</a>
	</div>
</header>

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
