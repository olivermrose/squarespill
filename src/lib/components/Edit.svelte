<script lang="ts">
	import type { Wallpaper } from "$lib/wallpaper.remote";
	import { editWallpaper, getWallpapers } from "$lib/wallpaper.remote";
	import { Dialog } from "bits-ui";

	interface Props {
		wallpaper: Wallpaper;
	}

	const { wallpaper }: Props = $props();

	let open = $state(false);
	let saving = $state(false);

	const editForm = $derived(editWallpaper.for(wallpaper.id));

	function populateFields() {
		editForm.fields.set({
			id: wallpaper.id,
			title: wallpaper.title,
			artist: wallpaper.artist,
		});
	}
</script>

<Dialog.Root
	onOpenChange={(value) => {
		if (value) populateFields();
	}}
	bind:open
>
	<Dialog.Trigger class="grow" type="button" data-variant="outline">Edit</Dialog.Trigger>

	<Dialog.Portal>
		<Dialog.Overlay />

		<Dialog.Content>
			<Dialog.Title class="text-xl">Edit Wallpaper</Dialog.Title>

			<form
				id="edit-wallpaper"
				enctype="multipart/form-data"
				{...editForm.enhance(async ({ form, submit }) => {
					saving = true;

					try {
						await submit().updates(getWallpapers());
						form.reset();
					} finally {
						open = false;
						saving = false;
					}
				})}
			>
				<div class="grid gap-4 sm:grid-cols-2">
					<div class="sm:col-span-2">
						<label class="mb-1 block font-mono text-xs text-neutral-400 uppercase" for="edit-file">
							Image
						</label>

						<input
							id="edit-file"
							class="w-full text-sm file:mr-3 file:border-0 file:bg-neutral-700 file:px-3 file:py-1 file:text-sm file:text-neutral-200"
							accept="image/*"
							{...editForm.fields.file.as("file")}
						/>
					</div>

					<div>
						<label class="mb-1 block font-mono text-xs text-neutral-400 uppercase" for="edit-title">
							Title
						</label>

						<input id="edit-title" class="w-full" {...editForm.fields.title.as("text")} />
					</div>

					<div>
						<label
							class="mb-1 block font-mono text-xs text-neutral-400 uppercase"
							for="edit-artist"
						>
							Artist
						</label>

						<input id="edit-artist" class="w-full" {...editForm.fields.artist.as("text")} />
					</div>

					<div class="sm:col-span-2">
						<label class="mb-1 block font-mono text-xs text-neutral-400 uppercase" for="edit-tags">
							Tags (comma-separated)
						</label>

						<input
							id="edit-tags"
							class="w-full"
							placeholder="ambient, electronic, chill"
							{...editForm.fields.tags.as("text")}
						/>
					</div>
				</div>
			</form>

			<div class="flex items-center justify-end gap-2">
				<Dialog.Close type="button" data-variant="outline">Cancel</Dialog.Close>

				<button
					type="submit"
					form="edit-wallpaper"
					disabled={saving || !!editForm.pending}
					data-variant="primary"
				>
					{#if saving}
						Saving...
					{:else}
						Save
					{/if}
				</button>
			</div>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
