<script lang="ts">
	import Pagination from '$lib/components/Pagination.svelte';
	import type { GeneratorWithService } from '$generated/types';

	interface Props {
		data: {
			generators: GeneratorWithService[];
			offset: number;
			hasMore: boolean;
		};
	}

	let { data }: Props = $props();

	const generators = $derived(data.generators);
</script>

<svelte:head>
	<title>Generators - API Builder</title>
</svelte:head>

<div>
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
		<h1 class="text-2xl font-bold text-ab-dark-blue">Generators</h1>
		<a href="/generators/create" class="btn-primary mt-3 sm:mt-0 inline-block text-center">
			Register Generator
		</a>
	</div>

	{#if generators.length === 0}
		<p class="text-ab-gray">No generators found.</p>
	{:else}
		<div class="overflow-x-auto">
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

		<Pagination offset={data.offset} limit={25} hasMore={data.hasMore} baseUrl="/generators" />
	{/if}
</div>
