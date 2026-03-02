<script lang="ts">
	import Pagination from '$lib/components/Pagination.svelte';
	import type { ApiAttribute } from '$generated/types';

	interface Props {
		data: {
			attributes: ApiAttribute[];
			offset: number;
			hasMore: boolean;
		};
	}

	let { data }: Props = $props();

	const attributes = $derived(data.attributes);
</script>

<svelte:head>
	<title>Attributes - API Builder</title>
</svelte:head>

<div>
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
		<h1 class="text-2xl font-bold text-ab-dark-blue">Attributes</h1>
		<a href="/attributes/create" class="btn-primary mt-3 sm:mt-0 inline-block text-center">
			Create Attribute
		</a>
	</div>

	{#if attributes.length === 0}
		<p class="text-ab-gray">No attributes found.</p>
	{:else}
		<div class="overflow-x-auto">
			<table class="w-full text-left">
				<thead>
					<tr class="border-b border-gray-200">
						<th class="pb-3 text-sm font-semibold text-ab-gray">Name</th>
						<th class="pb-3 text-sm font-semibold text-ab-gray hidden sm:table-cell">Description</th>
					</tr>
				</thead>
				<tbody>
					{#each attributes as attr (attr.guid)}
						<tr class="border-b border-gray-100 hover:bg-ab-light-gray/50 transition-colors">
							<td class="py-3">
								<a href="/attributes/{attr.name}" class="text-ab-blue hover:text-ab-dark-blue font-medium">
									{attr.name}
								</a>
							</td>
							<td class="py-3 hidden sm:table-cell text-sm text-ab-gray">{attr.description ?? ''}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<Pagination offset={data.offset} limit={25} hasMore={data.hasMore} baseUrl="/attributes" />
	{/if}
</div>
