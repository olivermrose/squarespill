<script lang="ts">
	import { motion } from 'motion-sv';
	import { X, Download, Eye, Tag, Monitor } from '@lucide/svelte';
	import { RadioGroup } from 'bits-ui';
	import type { _Object } from '@aws-sdk/client-s3';

	interface Props {
		wallpaper: _Object;
		onclose: () => void;
	}

	const { wallpaper, onclose }: Props = $props();

	const resolutions = {
		fhd: '1920x1080',
		qhd: '2560x1440',
		uhd: '3840x2160'
	};

	let resolution = $state<keyof typeof resolutions>('uhd');
	let format = $state('webp');
</script>

<motion.div
	class="overflow-hidden"
	initial={{ height: 0, opacity: 0 }}
	animate={{ height: 'auto', opacity: 1 }}
	exit={{ height: 0, opacity: 0 }}
	transition={{
		height: { type: 'spring', stiffness: 300, damping: 30 },
		opacity: { duration: 0.2 }
	}}
>
	<div class="flex w-full flex-col md:flex-row">
		<div class="relative aspect-video w-full max-w-3/5 shrink-0">
			<img
				class="object-cover"
				src="https://pub-bc71cc8fa1a24722b2c791c26ee50fb9.r2.dev/{wallpaper.Key}"
				alt=""
				fetchpriority="high"
			/>

			<button
				class="absolute top-4 right-4 cursor-pointer rounded-full bg-black/50 p-2 text-white/80 backdrop-blur-sm transition-colors hover:bg-black/70 hover:text-white"
				aria-label="Close expanded view"
				onclick={onclose}
			>
				<X class="size-4" />
			</button>
		</div>

		<div class="flex w-full flex-col justify-between gap-y-6 p-6 md:p-8">
			<div>
				<h2 class="text-2xl font-semibold tracking-tight text-balance">Album name</h2>

				<div class="mt-2 flex items-center gap-2">
					<span class="text-sm">Album artist</span>
				</div>
			</div>

			<div class="space-y-2">
				<div class="flex items-center gap-1.5 text-xs font-medium text-neutral-500 uppercase">
					<Tag class="size-3" />
					<span>Tags</span>
				</div>

				<div class="flex flex-wrap gap-1.5">
					{#each { length: 5 }}
						<span class="rounded-full bg-neutral-100 px-2.5 py-1 text-xs">tag</span>
					{/each}
				</div>
			</div>

			<div class="space-y-2">
				<div class="flex items-center gap-1.5 text-xs font-medium text-neutral-500 uppercase">
					<Monitor class="size-3" />
					<span>Resolution</span>
				</div>

				<RadioGroup.Root class="flex items-center gap-2" bind:value={resolution}>
					{#each Object.entries(resolutions) as [name, res] (name)}
						<RadioGroup.Item
							class="flex items-center border border-neutral-200 px-3 py-1.5 text-xs data-[state=checked]:bg-black data-[state=checked]:text-white"
							value={name}
						>
							<span class="font-medium">{name.toUpperCase()}</span>
							<span class="ml-1 text-[10px] opacity-60">{res}</span>
						</RadioGroup.Item>
					{/each}
				</RadioGroup.Root>
			</div>

			<div class="space-y-2">
				<div class="flex items-center gap-1.5 text-xs font-medium text-neutral-500 uppercase">
					<Eye class="size-3" />
					<span>Format</span>
				</div>

				<RadioGroup.Root class="flex items-center gap-2" bind:value={format}>
					{#each ['png', 'jpg', 'webp', 'avif'] as format (format)}
						<RadioGroup.Item
							class="flex items-center border border-neutral-200 px-3 py-1.5 text-xs data-[state=checked]:bg-black data-[state=checked]:text-white"
							value={format}
						>
							{format.toUpperCase()}
						</RadioGroup.Item>
					{/each}
				</RadioGroup.Root>
			</div>

			<button
				class="mt-auto flex w-full cursor-pointer items-center justify-center gap-2 bg-black px-6 py-3 text-sm font-medium text-white hover:opacity-90"
				type="button"
			>
				<Download class="size-4" />
				Download
			</button>
		</div>
	</div>
</motion.div>
