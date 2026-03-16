<script lang="ts">
	import { enhance } from '$app/forms';
	import type { Organization, AttributeValue, Attribute } from '$generated/com-bryzek-bryzek-apibuilder-v0';
	import type { ApiErrorItem } from '$lib/api/error-handler';

	interface Props {
		data: {
			org: Organization;
			isAdmin: boolean;
			orgAttributes: AttributeValue[];
			allAttributes: Attribute[];
		};
		form: { errors?: ApiErrorItem[]; success?: boolean } | null;
	}

	let { data, form: formResult }: Props = $props();

	const org = $derived(data.org);
	const orgAttributes = $derived(data.orgAttributes);
	const allAttributes = $derived(data.allAttributes);
	let isSubmitting = $state(false);
	let confirmRemoveName = $state<string | null>(null);
	let editingName = $state<string | null>(null);
	let editValue = $state('');

	const setAttributeNames = $derived(new Set(orgAttributes.map((a) => a.attribute.name)));
	const availableAttributes = $derived(allAttributes.filter((a) => !setAttributeNames.has(a.name)));
</script>

<svelte:head>
	<title>Attributes - {org.name} - API Builder</title>
</svelte:head>

<div>
	<h1 class="text-2xl font-bold text-ab-dark-blue mb-6">Organization Attributes</h1>

	{#if formResult?.errors}
		<div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
			{#each formResult.errors as err}
				<p class="text-red-800 text-sm">{err.message}</p>
			{/each}
		</div>
	{/if}

	{#if data.isAdmin && (availableAttributes.length > 0 || allAttributes.length === 0)}
		<div class="card mb-6">
			<h2 class="text-lg font-semibold text-ab-dark-blue mb-3">Set Attribute</h2>
			<form method="POST" action="?/setAttribute" use:enhance={() => { isSubmitting = true; return async ({ update }) => { isSubmitting = false; await update(); }; }} class="flex flex-col sm:flex-row gap-3">
				{#if availableAttributes.length > 0}
					<select name="name" required class="input-field px-3 py-2 border rounded-lg">
						<option value="">Select attribute...</option>
						{#each availableAttributes as attr (attr.name)}
							<option value={attr.name}>{attr.name}</option>
						{/each}
					</select>
				{:else}
					<input type="text" name="name" placeholder="Attribute name" required class="input-field flex-1 px-3 py-2 border rounded-lg" />
				{/if}
				<input type="text" name="value" placeholder="Value" required class="input-field flex-1 px-3 py-2 border rounded-lg" />
				<button type="submit" class="btn-primary" disabled={isSubmitting}>
					{isSubmitting ? 'Setting...' : 'Set'}
				</button>
			</form>
		</div>
	{/if}

	{#if orgAttributes.length === 0}
		<p class="text-ab-gray">No attributes set for this organization.</p>
	{:else}
		<div class="overflow-x-auto">
			<table class="w-full text-left">
				<thead>
					<tr class="border-b border-gray-200">
						<th class="pb-3 text-sm font-semibold text-ab-gray">Name</th>
						<th class="pb-3 text-sm font-semibold text-ab-gray">Value</th>
						{#if data.isAdmin}
							<th class="pb-3 text-sm font-semibold text-ab-gray text-right">Actions</th>
						{/if}
					</tr>
				</thead>
				<tbody>
					{#each orgAttributes as attr (attr.attribute.name)}
						<tr class="border-b border-gray-100">
							<td class="py-3 font-medium text-ab-dark-blue">{attr.attribute.name}</td>
							<td class="py-3">
								{#if editingName === attr.attribute.name}
									<form method="POST" action="?/setAttribute" use:enhance={() => { isSubmitting = true; return async ({ update }) => { isSubmitting = false; editingName = null; await update(); }; }} class="flex gap-2">
										<input type="hidden" name="name" value={attr.attribute.name} />
										<input type="text" name="value" bind:value={editValue} required class="input-field flex-1 px-2 py-1 border rounded text-sm" />
										<button type="submit" class="text-sm text-ab-blue hover:text-ab-dark-blue font-semibold" disabled={isSubmitting}>Save</button>
										<button type="button" class="text-sm text-ab-gray hover:text-ab-dark-blue" onclick={() => editingName = null}>Cancel</button>
									</form>
								{:else}
									<span class="text-ab-dark-blue">{attr.value}</span>
								{/if}
							</td>
							{#if data.isAdmin}
								<td class="py-3 text-right">
									{#if editingName !== attr.attribute.name}
										<div class="flex gap-2 justify-end">
											<button type="button" class="text-sm text-ab-blue hover:text-ab-dark-blue" onclick={() => { editingName = attr.attribute.name; editValue = attr.value; }}>
												Edit
											</button>
											{#if confirmRemoveName === attr.attribute.name}
												<form method="POST" action="?/removeAttribute" use:enhance={() => { isSubmitting = true; return async ({ update }) => { isSubmitting = false; confirmRemoveName = null; await update(); }; }}>
													<input type="hidden" name="name" value={attr.attribute.name} />
													<button type="submit" class="text-sm text-red-600 hover:text-red-800 font-semibold" disabled={isSubmitting}>Confirm</button>
												</form>
												<button type="button" class="text-sm text-ab-gray hover:text-ab-dark-blue" onclick={() => confirmRemoveName = null}>Cancel</button>
											{:else}
												<button type="button" class="text-sm text-red-600 hover:text-red-800" onclick={() => confirmRemoveName = attr.attribute.name}>Remove</button>
											{/if}
										</div>
									{/if}
								</td>
							{/if}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
