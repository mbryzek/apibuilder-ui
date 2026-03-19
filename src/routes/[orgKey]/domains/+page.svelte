<script lang="ts">
	import { enhance } from '$app/forms';
	import type { Organization } from '$generated/com-bryzek-apibuilder-v0';
	import type { ApiErrorItem } from '$lib/api/error-handler';

	interface Props {
		data: {
			org: Organization;
			isAdmin: boolean;
		};
		form: { errors?: ApiErrorItem[]; success?: boolean } | null;
	}

	let { data, form: formResult }: Props = $props();

	const org = $derived(data.org);
	const domains = $derived(org.domains);
	let isSubmitting = $state(false);
	let confirmRemoveName = $state<string | null>(null);
</script>

<svelte:head>
	<title>Domains - {org.name} - API Builder</title>
</svelte:head>

<div>
	<h1 class="text-2xl font-bold text-ab-dark-blue mb-2">Domains</h1>
	<p class="text-ab-gray text-sm mb-6">
		Users with email addresses matching a registered domain will automatically be added as members of this organization.
	</p>

	{#if formResult?.errors}
		<div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
			{#each formResult.errors as err}
				<p class="text-red-800 text-sm">{err.message}</p>
			{/each}
		</div>
	{/if}

	{#if data.isAdmin}
		<div class="card mb-6">
			<h2 class="text-lg font-semibold text-ab-dark-blue mb-3">Add Domain</h2>
			<form method="POST" action="?/addDomain" use:enhance={() => { isSubmitting = true; return async ({ update }) => { isSubmitting = false; await update(); }; }} class="flex flex-col sm:flex-row gap-3">
				<input type="text" name="name" placeholder="example.com" required class="input-field flex-1 px-3 py-2 border rounded-lg" />
				<button type="submit" class="btn-primary" disabled={isSubmitting}>
					{isSubmitting ? 'Adding...' : 'Add Domain'}
				</button>
			</form>
		</div>
	{/if}

	{#if domains.length === 0}
		<p class="text-ab-gray">No domains registered.</p>
	{:else}
		<div class="space-y-2">
			{#each domains as domain (domain.name)}
				<div class="flex items-center justify-between py-3 px-4 bg-white border border-gray-200 rounded-lg">
					<span class="font-medium text-ab-dark-blue">{domain.name}</span>
					{#if data.isAdmin}
						{#if confirmRemoveName === domain.name}
							<div class="flex gap-2">
								<form method="POST" action="?/removeDomain" use:enhance={() => { isSubmitting = true; return async ({ update }) => { isSubmitting = false; confirmRemoveName = null; await update(); }; }}>
									<input type="hidden" name="name" value={domain.name} />
									<button type="submit" class="text-sm text-red-600 hover:text-red-800 font-semibold" disabled={isSubmitting}>
										Confirm
									</button>
								</form>
								<button type="button" class="text-sm text-ab-gray hover:text-ab-dark-blue" onclick={() => confirmRemoveName = null}>
									Cancel
								</button>
							</div>
						{:else}
							<button type="button" class="text-sm text-red-600 hover:text-red-800" onclick={() => confirmRemoveName = domain.name}>
								Remove
							</button>
						{/if}
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>
