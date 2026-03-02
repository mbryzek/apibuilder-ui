<script lang="ts">
	import Pagination from '$lib/components/Pagination.svelte';
	import type { Item } from '$generated/types';

	interface Props {
		data: {
			items: Item[];
			q: string;
			offset: number;
			hasMore: boolean;
		};
	}

	let { data }: Props = $props();

	const items = $derived(data.items);
	const paginationBaseUrl = $derived(`/search?q=${encodeURIComponent(data.q)}`);

	function itemUrl(item: Item): string {
		if (item.detail.type === 'application_summary') {
			return `/${item.detail.organization.key}/${item.detail.key}`;
		}
		return '#';
	}
</script>

<svelte:head>
	<title>{data.q ? `${data.q} - Search` : 'Search'} - API Builder</title>
</svelte:head>

<div>
	<h1 class="text-2xl font-bold text-ab-dark-blue mb-6">Search</h1>

	<form method="GET" action="/search" class="mb-6">
		<div class="flex gap-3">
			<input
				type="text"
				name="q"
				value={data.q}
				placeholder="Search APIs..."
				class="input-field flex-1"
			/>
			<button type="submit" class="btn-primary">Search</button>
		</div>
	</form>

	{#if data.q}
		{#if items.length === 0}
			<p class="text-ab-gray">No results found for "{data.q}".</p>
		{:else}
			<div class="space-y-4">
				{#each items as item (item.guid)}
					<div class="card">
						<a href={itemUrl(item)} class="text-ab-blue hover:text-ab-dark-blue font-medium text-lg">
							{item.label}
						</a>
						{#if item.description}
							<p class="text-sm text-ab-gray mt-1">{item.description}</p>
						{/if}
					</div>
				{/each}
			</div>

			<Pagination offset={data.offset} limit={25} hasMore={data.hasMore} baseUrl={paginationBaseUrl} />
		{/if}
	{/if}
</div>
