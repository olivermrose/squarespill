<script lang="ts">
	import Download from '@lucide/svelte/icons/download';
	import Monitor from '@lucide/svelte/icons/monitor';
	import Smartphone from '@lucide/svelte/icons/smartphone';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';

	const { data } = $props();
</script>

<div class="grid-auto grid gap-6">
	{#each data.items as item (item.Key)}
		<div class="flex flex-col gap-2">
			<img
				class="aspect-video"
				src="https://pub-bc71cc8fa1a24722b2c791c26ee50fb9.r2.dev/{item.Key}"
				alt=""
				width="1280"
				height="720"
			/>

			<div class="flex items-center justify-between">
				<div class="flex flex-col">
					<span class="font-semibold">Album name</span>
					<span class="text-sm text-muted-foreground">Artist name</span>
				</div>

				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						{#snippet child({ props })}
							<Button size="icon" variant="outline" {...props}>
								<Download class="size-4" />
							</Button>
						{/snippet}
					</DropdownMenu.Trigger>

					<DropdownMenu.Content>
						<DropdownMenu.Sub>
							<DropdownMenu.SubTrigger>
								<Smartphone /> Mobile
							</DropdownMenu.SubTrigger>

							<DropdownMenu.SubContent>
								<!-- Other -->
								<DropdownMenu.Item>4K Resolution</DropdownMenu.Item>
							</DropdownMenu.SubContent>
						</DropdownMenu.Sub>

						<DropdownMenu.Sub>
							<DropdownMenu.SubTrigger>
								<Monitor /> Desktop
							</DropdownMenu.SubTrigger>

							<DropdownMenu.SubContent>
								<!-- Other -->
								<DropdownMenu.Item>4K Resolution</DropdownMenu.Item>
							</DropdownMenu.SubContent>
						</DropdownMenu.Sub>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</div>
		</div>
	{/each}
</div>

<style>
	.grid-auto {
		grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
	}
</style>
