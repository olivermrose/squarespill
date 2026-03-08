<script lang="ts">
	import { getWallpapers, uploadWallpaper } from "$lib/wallpaper.remote";
	import { Dialog } from "bits-ui";

	let open = $state(false);
	let uploading = $state(false);

	const uploadForm = uploadWallpaper.enhance(async ({ form, submit }) => {
		uploading = true;

		try {
			await submit().updates(getWallpapers());
			form.reset();
		} finally {
			open = false;
			uploading = false;
		}
	});
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger class="base lowercase" type="button">Upload</Dialog.Trigger>

	<Dialog.Portal>
		<Dialog.Overlay />

		<Dialog.Content>
			<Dialog.Title class="text-xl">Upload Wallpaper</Dialog.Title>

			<form id="upload-wallpaper" enctype="multipart/form-data" {...uploadForm}>
				<div class="grid gap-4 sm:grid-cols-2">
					<div class="sm:col-span-2">
						<label
							class="mb-1 block font-mono text-xs text-neutral-400 uppercase"
							for="upload-file"
						>
							Image
						</label>

						<input
							id="upload-file"
							class="w-full file:mr-3 file:border-0 file:bg-neutral-700 file:px-3 file:py-1 file:text-sm file:text-neutral-200"
							accept="image/*"
							required
							{...uploadWallpaper.fields.file.as("file")}
						/>
					</div>

					<div>
						<label
							class="mb-1 block font-mono text-xs text-neutral-400 uppercase"
							for="upload-title"
						>
							Title
						</label>

						<input
							id="upload-title"
							class="w-full"
							required
							{...uploadWallpaper.fields.title.as("text")}
						/>
					</div>

					<div>
						<label
							class="mb-1 block font-mono text-xs text-neutral-400 uppercase"
							for="upload-artist"
						>
							Artist
						</label>

						<input
							id="upload-artist"
							class="w-full"
							required
							{...uploadWallpaper.fields.artist.as("text")}
						/>
					</div>

					<div class="sm:col-span-2">
						<label
							class="mb-1 block font-mono text-xs text-neutral-400 uppercase"
							for="upload-tags"
						>
							Tags (comma-separated)
						</label>

						<input
							id="upload-tags"
							class="w-full"
							placeholder="ambient, electronic, chill"
							{...uploadWallpaper.fields.tags.as("text")}
						/>
					</div>
				</div>
			</form>

			<div class="flex items-center justify-end gap-2">
				<Dialog.Close type="button" data-variant="outline">Cancel</Dialog.Close>

				<button
					type="submit"
					form="upload-wallpaper"
					disabled={uploading || !!uploadWallpaper.pending}
					data-variant="primary"
				>
					{#if uploading}
						Uploading...
					{:else}
						Upload
					{/if}
				</button>
			</div>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
