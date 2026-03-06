<script lang="ts">
	import type { Wallpaper } from "$lib/server/db/schema";
	import { R2_PUBLIC_URL } from "$lib/constants";

	interface Props {
		wallpaper: Wallpaper;
		selected?: number;
	}

	let { wallpaper, selected = $bindable() }: Props = $props();

	function select() {
		selected = selected === wallpaper.id ? undefined : wallpaper.id;
	}
</script>

<div
	class="group relative aspect-video cursor-pointer overflow-hidden"
	role="none"
	onclick={select}
	onkeydown={(event) => {
		if (event.key === "Enter" || event.key === " ") {
			select();
		}
	}}
>
	<img
		class="object-cover transition-transform duration-500 group-hover:scale-105"
		src="{R2_PUBLIC_URL}/{wallpaper.file}.avif"
		alt="{wallpaper.title} by {wallpaper.artist}"
	/>

	<div
		class="absolute inset-0 flex items-end bg-black/0 transition-all duration-300 group-hover:bg-black/40"
	>
		<div
			class="w-full translate-y-full p-3 transition-transform duration-300 group-hover:translate-y-0"
		>
			<p class="truncate text-sm font-medium text-white">{wallpaper.title}</p>
			<p class="truncate text-xs text-white/60">{wallpaper.artist}</p>
		</div>
	</div>
</div>
