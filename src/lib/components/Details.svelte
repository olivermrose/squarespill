<script lang="ts">
	import type { Wallpaper } from "$lib/server/db/schema";
	import { page } from "$app/state";
	import { R2_PUBLIC_URL, RESOLUTIONS } from "$lib/constants";
	import { deleteWallpaper, downloadWallpaper, getWallpapers } from "$lib/wallpaper.remote";
	import { RadioGroup } from "bits-ui";
	import { motion } from "motion-sv";
	import Edit from "./Edit.svelte";

	interface Props {
		wallpaper: Wallpaper;
		onclose: () => void;
	}

	const { wallpaper, onclose }: Props = $props();

	let details = $state<HTMLDivElement>();
	let resolution = $state<keyof typeof RESOLUTIONS>("uhd4k");
	let format = $state<"png" | "jpg" | "webp" | "avif">("webp");
	let downloading = $state(false);

	async function handleDelete() {
		await deleteWallpaper(wallpaper.id);
		await getWallpapers().refresh();
		onclose();
	}

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
	class="col-span-full overflow-hidden bg-neutral-950"
	initial={{ height: 0 }}
	animate={{ height: "auto" }}
	exit={{ height: 0 }}
	transition={{ duration: 0.25, ease: "circOut" }}
	onAnimationComplete={() => {
		details?.scrollIntoView({ behavior: "smooth", block: "center" });
	}}
	bind:ref={details}
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
				<svg class="size-4" width="32" height="32" viewBox="0 0 24 24">
					<path
						fill="currentColor"
						d="M6.4 19L5 17.6l5.6-5.6L5 6.4L6.4 5l5.6 5.6L17.6 5L19 6.4L13.4 12l5.6 5.6l-1.4 1.4l-5.6-5.6z"
					/>
				</svg>
			</button>
		</div>

		<div class="flex w-full shrink flex-col justify-between gap-y-6 p-6 md:p-8">
			<div>
				<h2 class="text-2xl font-semibold tracking-tight text-balance">
					{wallpaper.title}
				</h2>

				<span class="mt-1 inline-block text-sm text-neutral-500">{wallpaper.artist}</span>
			</div>

			{#if wallpaper.tags?.length}
				<div class="space-y-2">
					<span class="inline-block font-mono text-xs font-medium text-neutral-500 uppercase">
						Tags
					</span>

					<div class="flex flex-wrap gap-2">
						{#each wallpaper.tags as tag (tag)}
							<span class="rounded-full bg-neutral-800 px-2.5 py-1 text-xs">tag</span>
						{/each}
					</div>
				</div>
			{/if}

			<div class="space-y-2">
				<span class="inline-block font-mono text-xs font-medium text-neutral-500 uppercase">
					Resolution
				</span>

				<RadioGroup.Root class="flex flex-wrap items-center gap-2" bind:value={resolution}>
					{#each Object.entries(RESOLUTIONS) as [key, res] (key)}
						<RadioGroup.Item
							class="flex items-center border border-neutral-700 px-3 text-xs normal-case data-[state=checked]:bg-neutral-50 data-[state=checked]:text-neutral-950"
							value={key}
						>
							<span class="font-medium">{res.label}</span>
							<span class="ml-1 text-[10px] opacity-60">{res.width}x{res.height}</span>
						</RadioGroup.Item>
					{/each}
				</RadioGroup.Root>
			</div>

			<div class="space-y-2">
				<span class="inline-block font-mono text-xs font-medium text-neutral-500 uppercase">
					Format
				</span>

				<RadioGroup.Root class="flex items-center gap-2" bind:value={format}>
					{#each ["png", "jpg", "webp", "avif"] as format (format)}
						<RadioGroup.Item
							class="border border-neutral-700 px-3 text-xs data-[state=checked]:bg-neutral-50 data-[state=checked]:text-neutral-950"
							value={format}
						>
							{format.toUpperCase()}
						</RadioGroup.Item>
					{/each}
				</RadioGroup.Root>
			</div>

			<div class="mt-auto flex flex-wrap gap-2">
				{#if page.data.admin}
					<Edit {wallpaper} />

					<button
						class="grow bg-red-700/50 outline outline-red-700"
						type="button"
						onclick={handleDelete}
					>
						Delete
					</button>
				{/if}

				<button
					class="w-full py-3"
					type="button"
					disabled={downloading}
					data-variant="primary"
					onclick={handleDownload}
				>
					{downloading ? "Downloading..." : "Download"}
				</button>
			</div>
		</div>
	</motion.div>
</motion.div>
