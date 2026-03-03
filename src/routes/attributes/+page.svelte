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
		<div class="space-y-3">
			{#each attributes as attr (attr.guid)}
				<a
					href="/attributes/{attr.name}"
					class="block border border-gray-200 rounded-lg p-4 hover:border-ab-blue/30 hover:bg-ab-light-gray/50 transition-colors"
				>
					<div class="text-sm text-ab-blue font-medium">{attr.name}</div>
					{#if attr.description}
						<p class="text-sm text-ab-dark-gray mt-1">{attr.description}</p>
					{/if}
				</a>
			{/each}
		</div>

		<Pagination offset={data.offset} limit={25} hasMore={data.hasMore} baseUrl="/attributes" />
	{/if}
</div>
