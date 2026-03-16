<script lang="ts">
	import { enhance } from '$app/forms';
	import type { Attribute } from '$generated/com-bryzek-bryzek-apibuilder-v0';
	import type { ApiErrorItem } from '$lib/api/error-handler';

	interface Props {
		data: {
			attribute: Attribute;
		};
		form: { errors?: ApiErrorItem[] } | null;
	}

	let { data, form: formResult }: Props = $props();

	const attribute = $derived(data.attribute);
	let confirmDelete = $state(false);
	let isSubmitting = $state(false);
</script>

<svelte:head>
	<title>{attribute.name} - Attributes - API Builder</title>
</svelte:head>

<div>
	<div class="mb-6">
		<a href="/attributes" class="text-ab-blue hover:text-ab-dark-blue text-sm">&larr; Back to Attributes</a>
	</div>

	<h1 class="text-2xl font-bold text-ab-dark-blue mb-6">{attribute.name}</h1>

	{#if formResult?.errors}
		<div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
			{#each formResult.errors as err}
				<p class="text-red-800 text-sm">{err.message}</p>
			{/each}
		</div>
	{/if}

	<div class="card mb-6">
		<dl class="space-y-4">
			<div>
				<dt class="text-sm font-semibold text-ab-gray">Name</dt>
				<dd class="text-ab-dark-blue mt-1">{attribute.name}</dd>
			</div>
			{#if attribute.description}
				<div>
					<dt class="text-sm font-semibold text-ab-gray">Description</dt>
					<dd class="text-ab-dark-blue mt-1">{attribute.description}</dd>
				</div>
			{/if}
		</dl>
	</div>

	<div>
		{#if confirmDelete}
			<div class="bg-red-50 border border-red-200 rounded-lg p-4">
				<p class="text-red-800 text-sm mb-3">Are you sure you want to delete this attribute? This cannot be undone.</p>
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
			<button type="button" class="btn-danger" onclick={() => confirmDelete = true}>Delete Attribute</button>
		{/if}
	</div>
</div>
