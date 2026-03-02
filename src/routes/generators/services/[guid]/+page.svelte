<script lang="ts">
	import { enhance } from '$app/forms';
	import type { GeneratorService, GeneratorWithService } from '$generated/types';
	import type { ApiErrorItem } from '$lib/api/error-handler';

	interface Props {
		data: {
			service: GeneratorService;
			generators: GeneratorWithService[];
		};
		form: { errors?: ApiErrorItem[] } | null;
	}

	let { data, form: formResult }: Props = $props();

	const service = $derived(data.service);
	const generators = $derived(data.generators);
	let confirmDelete = $state(false);
	let isSubmitting = $state(false);
</script>

<svelte:head>
	<title>{service.uri} - Generator Services - API Builder</title>
</svelte:head>

<div>
	<div class="mb-6">
		<a href="/generators" class="text-ab-blue hover:text-ab-dark-blue text-sm">&larr; Back to Generators</a>
	</div>

	<h1 class="text-2xl font-bold text-ab-dark-blue mb-6">Generator Service</h1>

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
				<dt class="text-sm font-semibold text-ab-gray">URI</dt>
				<dd class="text-ab-dark-blue mt-1">{service.uri}</dd>
			</div>
		</dl>
	</div>

	{#if generators.length > 0}
		<h2 class="text-lg font-semibold text-ab-dark-blue mb-4">Generators</h2>
		<div class="overflow-x-auto mb-6">
			<table class="w-full text-left">
				<thead>
					<tr class="border-b border-gray-200">
						<th class="pb-3 text-sm font-semibold text-ab-gray">Key</th>
						<th class="pb-3 text-sm font-semibold text-ab-gray hidden sm:table-cell">Name</th>
						<th class="pb-3 text-sm font-semibold text-ab-gray hidden md:table-cell">Language</th>
						<th class="pb-3 text-sm font-semibold text-ab-gray hidden lg:table-cell">Description</th>
					</tr>
				</thead>
				<tbody>
					{#each generators as gws (gws.generator.key)}
						<tr class="border-b border-gray-100 hover:bg-ab-light-gray/50 transition-colors">
							<td class="py-3">
								<a href="/generators/{gws.generator.key}" class="text-ab-blue hover:text-ab-dark-blue font-medium">
									{gws.generator.key}
								</a>
							</td>
							<td class="py-3 hidden sm:table-cell text-ab-dark-blue">{gws.generator.name}</td>
							<td class="py-3 hidden md:table-cell text-ab-gray">{gws.generator.language ?? '-'}</td>
							<td class="py-3 hidden lg:table-cell text-sm text-ab-gray">{gws.generator.description ?? ''}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{:else}
		<p class="text-ab-gray mb-6">No generators found for this service.</p>
	{/if}

	<div>
		{#if confirmDelete}
			<div class="bg-red-50 border border-red-200 rounded-lg p-4">
				<p class="text-red-800 text-sm mb-3">Are you sure? This will also remove all generators associated with this service.</p>
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
			<button type="button" class="btn-danger" onclick={() => confirmDelete = true}>Delete Service</button>
		{/if}
	</div>
</div>
