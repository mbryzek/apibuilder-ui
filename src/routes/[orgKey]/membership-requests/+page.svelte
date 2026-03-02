<script lang="ts">
	import { enhance } from '$app/forms';
	import type { Organization, MembershipRequest } from '$generated/types';
	import type { ApiErrorItem } from '$lib/api/error-handler';

	interface Props {
		data: {
			org: Organization;
			requests: MembershipRequest[];
		};
		form: { errors?: ApiErrorItem[]; success?: boolean } | null;
	}

	let { data, form: formResult }: Props = $props();

	const org = $derived(data.org);
	const requests = $derived(data.requests);
	let isSubmitting = $state(false);
</script>

<svelte:head>
	<title>Membership Requests - {org.name} - API Builder</title>
</svelte:head>

<div>
	<h1 class="text-2xl font-bold text-ab-dark-blue mb-6">Membership Requests</h1>

	{#if formResult?.errors}
		<div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
			{#each formResult.errors as err}
				<p class="text-red-800 text-sm">{err.message}</p>
			{/each}
		</div>
	{/if}

	{#if requests.length === 0}
		<p class="text-ab-gray">No pending membership requests.</p>
	{:else}
		<div class="space-y-4">
			{#each requests as req (req.guid)}
				<div class="card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
					<div>
						<div class="font-medium text-ab-dark-blue">{req.user.nickname}</div>
						<div class="text-sm text-ab-gray">{req.user.email}</div>
						<div class="text-sm text-ab-gray">Requested role: <span class="font-medium">{req.role}</span></div>
					</div>
					<div class="flex gap-2">
						<form method="POST" action="?/accept" use:enhance={() => { isSubmitting = true; return async ({ update }) => { isSubmitting = false; await update(); }; }}>
							<input type="hidden" name="guid" value={req.guid} />
							<button type="submit" class="btn-primary text-sm px-4 py-2" disabled={isSubmitting}>Accept</button>
						</form>
						<form method="POST" action="?/decline" use:enhance={() => { isSubmitting = true; return async ({ update }) => { isSubmitting = false; await update(); }; }}>
							<input type="hidden" name="guid" value={req.guid} />
							<button type="submit" class="btn-secondary text-sm px-4 py-2" disabled={isSubmitting}>Decline</button>
						</form>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
