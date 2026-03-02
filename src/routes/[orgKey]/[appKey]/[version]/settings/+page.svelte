<script lang="ts">
	import { enhance } from '$app/forms';
	import type { Organization, Service } from '$generated/types';

	interface Props {
		data: {
			org: Organization;
			isMember: boolean;
			service: Service;
		};
		form: {
			errors?: { message: string }[];
		} | null;
	}

	let { data, form }: Props = $props();

	const service = $derived(data.service);

	let isDeleting = $state(false);
	let showDeleteConfirm = $state(false);
	let isMoving = $state(false);
</script>

<svelte:head>
	<title>Settings - {service.name} - API Builder</title>
</svelte:head>

<div class="max-w-2xl space-y-8">
	<h2 class="text-xl font-bold text-ab-dark-blue">Application Settings</h2>

	{#if form?.errors}
		<div class="bg-red-50 border border-red-200 rounded-lg p-4">
			{#each form.errors as error}
				<p class="text-red-700 text-sm">{error.message}</p>
			{/each}
		</div>
	{/if}

	<!-- Visibility -->
	<div class="card">
		<h3 class="text-lg font-semibold text-ab-dark-blue mb-4">Visibility</h3>
		<form method="POST" action="?/updateVisibility" use:enhance class="space-y-4">
			<input type="hidden" name="name" value={service.name} />
			<div>
				<select name="visibility" class="input-field w-full" value={data.org.visibility}>
					<option value="organization">Organization — visible to members only</option>
					<option value="public">Public — visible to everyone</option>
				</select>
			</div>
			<button type="submit" class="btn-primary">Update Visibility</button>
		</form>
	</div>

	<!-- Move to different org -->
	<div class="card">
		<h3 class="text-lg font-semibold text-ab-dark-blue mb-4">Move Application</h3>
		<p class="text-sm text-ab-gray mb-4">Move this application to a different organization.</p>
		<form
			method="POST"
			action="?/move"
			use:enhance={() => {
				isMoving = true;
				return async ({ update }) => {
					isMoving = false;
					await update();
				};
			}}
			class="space-y-4"
		>
			<div>
				<label for="org_key" class="block text-sm font-medium text-gray-700 mb-1">New Organization Key</label>
				<input type="text" id="org_key" name="org_key" class="input-field w-full" required placeholder="e.g. my-other-org" />
			</div>
			<button type="submit" class="btn-secondary" disabled={isMoving}>
				{isMoving ? 'Moving...' : 'Move Application'}
			</button>
		</form>
	</div>

	<!-- Delete -->
	<div class="card border border-red-200">
		<h3 class="text-lg font-semibold text-red-700 mb-4">Danger Zone</h3>

		{#if !showDeleteConfirm}
			<p class="text-sm text-ab-gray mb-4">Permanently delete this application and all its versions. This cannot be undone.</p>
			<button
				class="btn-danger"
				onclick={() => (showDeleteConfirm = true)}
			>
				Delete Application
			</button>
		{:else}
			<p class="text-sm text-red-700 font-medium mb-4">
				Are you sure you want to delete <strong>{service.name}</strong>? This action cannot be undone.
			</p>
			<div class="flex gap-3">
				<form
					method="POST"
					action="?/deleteApp"
					use:enhance={() => {
						isDeleting = true;
						return async ({ update }) => {
							isDeleting = false;
							await update();
						};
					}}
				>
					<button type="submit" class="btn-danger" disabled={isDeleting}>
						{isDeleting ? 'Deleting...' : 'Yes, Delete Application'}
					</button>
				</form>
				<button class="btn-secondary" onclick={() => (showDeleteConfirm = false)}>
					Cancel
				</button>
			</div>
		{/if}
	</div>
</div>
