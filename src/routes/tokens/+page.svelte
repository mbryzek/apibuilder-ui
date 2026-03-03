<script lang="ts">
	import Pagination from '$lib/components/Pagination.svelte';
	import type { Token } from '$generated/types';

	interface Props {
		data: {
			tokens: Token[];
			offset: number;
			hasMore: boolean;
		};
	}

	let { data }: Props = $props();

	const tokens = $derived(data.tokens);
</script>

<svelte:head>
	<title>API Tokens - API Builder</title>
</svelte:head>

<div>
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
		<h1 class="text-2xl font-bold text-ab-dark-blue">API Tokens</h1>
		<a href="/tokens/create" class="btn-primary mt-3 sm:mt-0 inline-block text-center">
			Create Token
		</a>
	</div>

	{#if tokens.length === 0}
		<p class="text-ab-gray">No API tokens found.</p>
	{:else}
		<div class="space-y-3">
			{#each tokens as token (token.guid)}
				<a
					href="/tokens/{token.guid}"
					class="block border border-gray-200 rounded-lg p-4 hover:border-ab-blue/30 hover:bg-ab-light-gray/50 transition-colors"
				>
					<div class="font-mono text-sm text-ab-blue font-medium">{token.masked_token}</div>
					{#if token.description}
						<p class="text-sm text-ab-dark-gray mt-1">{token.description}</p>
					{/if}
					<p class="text-xs text-ab-gray mt-1">
						Created {new Date(token.audit.created_at).toLocaleDateString()}
					</p>
				</a>
			{/each}
		</div>

		<Pagination offset={data.offset} limit={25} hasMore={data.hasMore} baseUrl="/tokens" />
	{/if}
</div>
