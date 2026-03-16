<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ApiErrorItem } from '$lib/api/error-handler';

	interface Props {
		data: {
			tokenGuid: string;
			cleartextToken: string | null;
		};
		form: { errors?: ApiErrorItem[] } | null;
	}

	let { data, form: formResult }: Props = $props();

	let confirmDelete = $state(false);
	let isSubmitting = $state(false);
	let copied = $state(false);
	let copyTimeout: ReturnType<typeof setTimeout> | undefined;

	function handleCopy(): void {
		if (data.cleartextToken) {
			navigator.clipboard.writeText(data.cleartextToken).then(() => {
				copied = true;
				clearTimeout(copyTimeout);
				copyTimeout = setTimeout(() => { copied = false; }, 2000);
			});
		}
	}
</script>

<svelte:head>
	<title>API Token - API Builder</title>
</svelte:head>

<div class="page-container">
	<div class="mb-6">
		<a href="/tokens" class="text-ab-blue hover:text-ab-dark-blue text-sm">&larr; Back to Tokens</a>
	</div>

	<h1 class="text-2xl font-bold text-ab-dark-blue mb-6">API Token</h1>

	{#if formResult?.errors}
		<div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
			{#each formResult.errors as err}
				<p class="text-red-800 text-sm">{err.message}</p>
			{/each}
		</div>
	{/if}

	{#if data.cleartextToken}
		<div class="card mb-6">
			<div class="mb-2">
				<p class="text-sm font-semibold text-ab-gray mb-1">Token</p>
				<div class="flex items-center gap-2">
					<code class="flex-1 bg-ab-light-gray rounded p-3 text-sm text-ab-dark-blue font-mono break-all select-all">
						{data.cleartextToken}
					</code>
					<button
						type="button"
						class="shrink-0 p-2 rounded hover:bg-ab-light-gray transition-colors"
						title="Copy to clipboard"
						onclick={handleCopy}
					>
						{#if copied}
							<svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
							</svg>
						{:else}
							<svg class="w-5 h-5 text-ab-gray hover:text-ab-dark-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
							</svg>
						{/if}
					</button>
				</div>
				<p class="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded p-2 mt-2">
					This token will only be displayed once. Copy it now and store it securely.
				</p>
			</div>
		</div>
	{:else}
		<div class="card mb-6">
			<p class="text-sm text-ab-gray">
				This token has already been displayed. For security, tokens are only shown once after creation.
			</p>
		</div>
	{/if}

	<div>
		{#if confirmDelete}
			<div class="bg-red-50 border border-red-200 rounded-lg p-4">
				<p class="text-red-800 text-sm mb-3">Are you sure you want to delete this token? This cannot be undone.</p>
				<div class="flex gap-3">
					<form method="POST" action="?/delete" use:enhance={() => { isSubmitting = true; return async ({ update }) => { isSubmitting = false; await update(); }; }}>
						<button type="submit" class="btn-danger" disabled={isSubmitting}>
							{isSubmitting ? 'Deleting...' : 'Yes, Delete'}
						</button>
					</form>
					<button type="button" class="btn-secondary" onclick={() => confirmDelete = false}>Cancel</button>
				</div>
			</div>
		{:else}
			<button type="button" class="btn-danger" onclick={() => confirmDelete = true}>Delete Token</button>
		{/if}
	</div>
</div>
