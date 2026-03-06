<script lang="ts">
	import type { Wallpaper } from "$lib/server/db/schema";
	import { R2_PUBLIC_URL, RESOLUTIONS } from "$lib/constants";
	import { downloadWallpaper } from "$lib/wallpaper.remote";
	import { Download, Eye, Loader, Monitor, Tag, X } from "@lucide/svelte";
	import { RadioGroup } from "bits-ui";
	import { motion } from "motion-sv";

	interface Props {
		wallpaper: Wallpaper;
		onclose: () => void;
	}

	const { wallpaper, onclose }: Props = $props();

	let el = $state<HTMLDivElement>();
	let resolution = $state<keyof typeof RESOLUTIONS>("uhd");
	let format = $state<"png" | "jpg" | "webp" | "avif">("webp");
	let downloading = $state(false);

	async function handleDownload() {
		downloading = true;

		try {
			const result = await downloadWallpaper({
				file: wallpaper.file,
				format,
				resolution,
			});

			const bytes = Uint8Array.from(atob(result.data), (c) => c.charCodeAt(0));
			const blob = new Blob([bytes], { type: result.mimeType });
			const url = URL.createObjectURL(blob);

			const a = document.createElement("a");
			a.href = url;
			a.download = result.filename;

			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);

			URL.revokeObjectURL(url);
		} finally {
			downloading = false;
		}
	}
</script>

<motion.div
	class="overflow-hidden bg-black"
	initial={{ height: 0 }}
	animate={{ height: "auto" }}
	exit={{ height: 0 }}
	transition={{ duration: 0.25, ease: "circOut" }}
	onAnimationComplete={() => {
		el?.scrollIntoView({ behavior: "smooth", block: "center" });
	}}
	bind:ref={el}
>
	<motion.div
		class="flex w-full flex-col md:flex-row"
		initial={{ opacity: 0 }}
		animate={{ opacity: 1 }}
		exit={{ opacity: 0 }}
		transition={{ duration: 0.1, delay: 0.1 }}
	>
		<div class="relative aspect-video w-full shrink-0 max-md:hidden md:max-w-3/5">
			<img
				class="h-full object-cover"
				src="{R2_PUBLIC_URL}/{wallpaper.file}.avif"
				alt="{wallpaper.title} by {wallpaper.artist}"
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

		<div class="flex w-full shrink flex-col justify-between gap-y-6 p-6 md:p-8">
			<div>
				<h2 class="text-2xl font-semibold tracking-tight text-balance text-white">
					{wallpaper.title}
				</h2>

				<span class="mt-1 inline-block text-sm text-neutral-500">{wallpaper.artist}</span>
			</div>

			<div class="space-y-2">
				<div class="flex items-center gap-1.5 text-xs font-medium text-neutral-500 uppercase">
					<Tag class="size-3" />
					<span>Tags</span>
				</div>

				<div class="flex flex-wrap gap-1.5">
					{#each { length: 5 }}
						<span class="rounded-full bg-neutral-800 px-2.5 py-1 text-xs text-white">tag</span>
					{/each}
				</div>
			</div>

			<div class="space-y-2">
				<div class="flex items-center gap-1.5 text-xs font-medium text-neutral-500 uppercase">
					<Monitor class="size-3" />
					<span>Resolution</span>
				</div>

				<RadioGroup.Root class="flex flex-wrap items-center gap-2" bind:value={resolution}>
					{#each Object.entries(RESOLUTIONS) as [name, res] (name)}
						<RadioGroup.Item
							class="flex items-center border border-neutral-700 px-3 py-1.5 text-xs text-white data-[state=checked]:bg-white data-[state=checked]:text-black"
							value={name}
						>
							<span class="font-medium">{name.toUpperCase()}</span>
							<span class="ml-1 text-[10px] opacity-60">{res.width}x{res.height}</span>
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
					{#each ["png", "jpg", "webp", "avif"] as format (format)}
						<RadioGroup.Item
							class="flex items-center border border-neutral-700 px-3 py-1.5 text-xs text-white data-[state=checked]:bg-white data-[state=checked]:text-black"
							value={format}
						>
							{format.toUpperCase()}
						</RadioGroup.Item>
					{/each}
				</RadioGroup.Root>
			</div>

			<button
				class="mt-auto flex w-full cursor-pointer items-center justify-center gap-2 bg-white px-6 py-3 text-sm font-medium hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
				type="button"
				onclick={handleDownload}
				disabled={downloading}
			>
				{#if downloading}
					<Loader class="size-4 animate-spin" />
				{:else}
					<Download class="size-4" />
				{/if}

				{downloading ? "Downloading..." : "Download"}
			</button>
		</div>
	</motion.div>
</motion.div>
