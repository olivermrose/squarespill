<script lang="ts">
	import type { _Object } from '@aws-sdk/client-s3';

	interface Props {
		wallpaper: _Object;
		selected?: string;
	}

	let { wallpaper, selected = $bindable() }: Props = $props();

	function select() {
		selected = selected === wallpaper.Key ? undefined : wallpaper.Key;
	}
</script>

<div
	class="group relative aspect-video cursor-pointer overflow-hidden"
	role="none"
	onclick={select}
	onkeydown={(event) => {
		if (event.key === 'Enter' || event.key === ' ') {
			select();
		}
	}}
>
	<img
		class="object-cover transition-transform duration-500 group-hover:scale-105"
		src="https://pub-bc71cc8fa1a24722b2c791c26ee50fb9.r2.dev/{wallpaper.Key}"
		alt=""
	/>

	<div
		class="absolute inset-0 flex items-end bg-black/0 transition-all duration-300 group-hover:bg-black/40"
	>
		<div
			class="w-full translate-y-full p-3 transition-transform duration-300 group-hover:translate-y-0"
		>
			<p class="truncate text-sm font-medium text-white">Album name</p>
			<p class="truncate text-xs text-white/60">Artist name</p>
		</div>
	</div>
</div>
