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
		<div class="overflow-x-auto">
			<table class="w-full text-left">
				<thead>
					<tr class="border-b border-gray-200">
						<th class="pb-3 text-sm font-semibold text-ab-gray">Token</th>
						<th class="pb-3 text-sm font-semibold text-ab-gray hidden sm:table-cell">Description</th>
						<th class="pb-3 text-sm font-semibold text-ab-gray hidden md:table-cell">Created</th>
					</tr>
				</thead>
				<tbody>
					{#each tokens as token (token.guid)}
						<tr class="border-b border-gray-100 hover:bg-ab-light-gray/50 transition-colors">
							<td class="py-3">
								<a href="/tokens/{token.guid}" class="text-ab-blue hover:text-ab-dark-blue font-medium font-mono text-sm">
									{token.masked_token}
								</a>
							</td>
							<td class="py-3 hidden sm:table-cell text-sm text-ab-gray">{token.description ?? ''}</td>
							<td class="py-3 hidden md:table-cell text-sm text-ab-gray">
								{new Date(token.audit.created_at).toLocaleDateString()}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<Pagination offset={data.offset} limit={25} hasMore={data.hasMore} baseUrl="/tokens" />
	{/if}
</div>
