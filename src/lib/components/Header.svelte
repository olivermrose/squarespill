<script lang="ts">
	import { invalidate } from "$app/navigation";
	import { page } from "$app/state";
	import logo from "$lib/assets/favicon.svg?raw";
	import { authClient } from "$lib/auth-client";
	import Upload from "./Upload.svelte";

	const session = authClient.useSession();

	async function signOut() {
		await authClient.signOut();
		invalidate("app:admin");
	}
</script>

<header class="absolute inset-x-0 top-0 z-50">
	<div class="flex items-center justify-between px-12 py-4">
		<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
		<a class="inline-block size-8" href="/">
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html logo}
		</a>

		<div class="flex items-center gap-6">
			<a class="lowercase" href="https://github.com/olivermrose/squarespill" target="_blank">
				Request a wallpaper
			</a>

			<div class="h-6 w-px bg-neutral-500"></div>

			{#if $session.data}
				{#if page.data.admin}
					<Upload />
				{/if}

				<button class="base" type="button" onclick={signOut}>sign out</button>
			{:else}
				<button
					class="base flex items-center gap-2"
					type="button"
					onclick={() => authClient.signIn.social({ provider: "github" })}
				>
					sign in
				</button>
			{/if}
		</div>
	</div>
</header>
