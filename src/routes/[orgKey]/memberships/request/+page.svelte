<script lang="ts">
	import { enhance } from '$app/forms';
	import type { Organization } from '$generated/com-bryzek-apibuilder-v0';
	import type { ApiErrorItem } from '$lib/api/error-handler';

	interface Props {
		data: {
			org: Organization;
			isMember: boolean;
			hasPendingRequest: boolean;
		};
		form: { errors?: ApiErrorItem[]; success?: boolean } | null;
	}

	let { data, form: formResult }: Props = $props();

	const org = $derived(data.org);
	let isSubmitting = $state(false);
</script>

<svelte:head>
	<title>Join {org.name} - API Builder</title>
</svelte:head>

<div>
	<h1 class="text-2xl font-bold text-ab-dark-blue mb-6">Join {org.name}</h1>

	{#if formResult?.errors}
		<div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
			{#each formResult.errors as err}
				<p class="text-red-800 text-sm">{err.message}</p>
			{/each}
		</div>
	{/if}

	{#if data.isMember}
		<div class="bg-green-50 border border-green-200 rounded-lg p-4">
			<p class="text-green-800">You are already a member of this organization.</p>
		</div>
	{:else if data.hasPendingRequest || formResult?.success}
		<div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
			<p class="text-blue-800">Your membership request is pending review by an admin.</p>
		</div>
	{:else}
		<p class="text-ab-gray mb-4">Request to join <strong>{org.name}</strong> as a member.</p>
		<form method="POST" use:enhance={() => { isSubmitting = true; return async ({ update }) => { isSubmitting = false; await update(); }; }}>
			<button type="submit" class="btn-primary" disabled={isSubmitting}>
				{isSubmitting ? 'Requesting...' : 'Request Membership'}
			</button>
		</form>
	{/if}
</div>
