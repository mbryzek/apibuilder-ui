<script lang="ts">
	import { onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import Pagination from '$lib/components/Pagination.svelte';
	import type { Item } from '$generated/com-bryzek-apibuilder';

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

	let debounceTimer: ReturnType<typeof setTimeout> | undefined;

	function search(query: string) {
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			goto(`/search?q=${encodeURIComponent(query)}`, { keepFocus: true });
		}, 250);
	}

	function handleInput(event: Event) {
		search((event.target as HTMLInputElement).value);
	}

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		const input = (event.currentTarget as HTMLFormElement).querySelector('input[name="q"]') as HTMLInputElement;
		clearTimeout(debounceTimer);
		goto(`/search?q=${encodeURIComponent(input.value)}`, { keepFocus: true });
	}

	onDestroy(() => {
		clearTimeout(debounceTimer);
	});

	function itemUrl(item: Item): string {
		return `/${item.organization_key}/${item.application_key}`;
	}
</script>

<svelte:head>
	<title>{data.q ? `${data.q} - Search` : 'Search'} - API Builder</title>
</svelte:head>

<div class="page-container">
	<h1 class="text-2xl font-bold text-ab-dark-blue mb-6">Search</h1>

	<form onsubmit={handleSubmit} class="mb-6">
		<div class="flex gap-3">
			<input
				type="text"
				name="q"
				value={data.q}
				oninput={handleInput}
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
			<div class="space-y-3">
				{#each items as item (item.id)}
					<div class="card">
						<a href={itemUrl(item)} class="text-ab-blue hover:text-ab-dark-blue font-medium">
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
