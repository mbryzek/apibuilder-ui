<script lang="ts">
	import { enhance } from '$app/forms';
	import type { Organization } from '$generated/com-bryzek-apibuilder-v0';
	import type { ApiErrorItem } from '$lib/api/error-handler';
	import { Visibility } from '$generated/com-bryzek-apibuilder-v0';

	interface Props {
		data: {
			org: Organization;
			isAdmin: boolean;
		};
		form: { errors?: ApiErrorItem[] } | null;
	}

	let { data, form: formResult }: Props = $props();

	const org = $derived(data.org);
	let isSubmitting = $state(false);
	let showDeleteConfirm = $state(false);
</script>

<svelte:head>
	<title>Details - {org.name} - API Builder</title>
</svelte:head>

<div>
	<h1 class="text-2xl font-bold text-ab-dark-blue mb-6">Organization Details</h1>

	{#if formResult?.errors}
		<div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
			{#each formResult.errors as err}
				<p class="text-red-800 text-sm">{err.message}</p>
			{/each}
		</div>
	{/if}

	{#if data.isAdmin}
		<form method="POST" action="?/update" use:enhance={() => { isSubmitting = true; return async ({ update }) => { isSubmitting = false; await update(); }; }}>
			<div class="space-y-4 max-w-lg">
				<div>
					<label for="name" class="block text-sm font-medium text-ab-dark-blue mb-1">Name</label>
					<input type="text" id="name" name="name" value={org.name} required class="input-field w-full px-3 py-2 border rounded-lg" />
				</div>
				<div>
					<label for="key" class="block text-sm font-medium text-ab-dark-blue mb-1">Key</label>
					<input type="text" id="key" name="key" value={org.key} class="input-field w-full px-3 py-2 border rounded-lg" />
				</div>
				<div>
					<label for="namespace" class="block text-sm font-medium text-ab-dark-blue mb-1">Namespace</label>
					<input type="text" id="namespace" name="namespace" value={org.namespace} required class="input-field w-full px-3 py-2 border rounded-lg" />
				</div>
				<div>
					<label for="visibility" class="block text-sm font-medium text-ab-dark-blue mb-1">Visibility</label>
					<select id="visibility" name="visibility" class="input-field w-full px-3 py-2 border rounded-lg">
						{#each Object.values(Visibility) as v}
							<option value={v} selected={org.visibility === v}>{v}</option>
						{/each}
					</select>
				</div>
				<div>
					<button type="submit" class="btn-primary" disabled={isSubmitting}>
						{isSubmitting ? 'Saving...' : 'Save Changes'}
					</button>
				</div>
			</div>
		</form>

		<div class="mt-12 border-t border-red-200 pt-8">
			<h2 class="text-lg font-bold text-red-600 mb-2">Danger Zone</h2>
			<p class="text-sm text-ab-gray mb-4">Deleting an organization is permanent and cannot be undone.</p>

			{#if showDeleteConfirm}
				<div class="bg-red-50 border border-red-200 rounded-lg p-4">
					<p class="text-red-800 text-sm mb-3">Are you sure you want to delete <strong>{org.name}</strong>?</p>
					<div class="flex gap-3">
						<form method="POST" action="?/delete" use:enhance={() => { isSubmitting = true; return async ({ update }) => { isSubmitting = false; await update(); }; }}>
							<button type="submit" class="btn-danger" disabled={isSubmitting}>
								{isSubmitting ? 'Deleting...' : 'Yes, delete'}
							</button>
						</form>
						<button type="button" class="btn-secondary" onclick={() => showDeleteConfirm = false}>Cancel</button>
					</div>
				</div>
			{:else}
				<button type="button" class="btn-danger" onclick={() => showDeleteConfirm = true}>Delete Organization</button>
			{/if}
		</div>
	{:else}
		<dl class="space-y-4 max-w-lg">
			<div>
				<dt class="text-sm font-medium text-ab-gray">Name</dt>
				<dd class="text-ab-dark-blue">{org.name}</dd>
			</div>
			<div>
				<dt class="text-sm font-medium text-ab-gray">Key</dt>
				<dd class="text-ab-dark-blue">{org.key}</dd>
			</div>
			<div>
				<dt class="text-sm font-medium text-ab-gray">Namespace</dt>
				<dd class="text-ab-dark-blue">{org.namespace}</dd>
			</div>
			<div>
				<dt class="text-sm font-medium text-ab-gray">Visibility</dt>
				<dd class="text-ab-dark-blue">{org.visibility}</dd>
			</div>
		</dl>
	{/if}
</div>
