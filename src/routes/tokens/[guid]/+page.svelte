<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ApiErrorItem } from '$lib/api/error-handler';

	interface Props {
		data: {
			tokenGuid: string;
			cleartextToken: string;
		};
		form: { errors?: ApiErrorItem[] } | null;
	}

	let { data, form: formResult }: Props = $props();

	let confirmDelete = $state(false);
	let isSubmitting = $state(false);
</script>

<svelte:head>
	<title>API Token - API Builder</title>
</svelte:head>

<div>
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

	<div class="card mb-6">
		<div class="mb-2">
			<p class="text-sm font-semibold text-ab-gray mb-1">Token</p>
			<code class="block bg-ab-light-gray rounded p-3 text-sm text-ab-dark-blue font-mono break-all select-all">
				{data.cleartextToken}
			</code>
			<p class="text-sm text-ab-gray mt-2">Click the token above to select it, then copy to your clipboard.</p>
		</div>
	</div>

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
