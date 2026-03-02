<script lang="ts">
	import Pagination from '$lib/components/Pagination.svelte';
	import type { Change } from '$generated/types';

	interface Props {
		data: {
			changes: Change[];
			offset: number;
			hasMore: boolean;
		};
	}

	let { data }: Props = $props();

	const changes = $derived(data.changes);
</script>

<svelte:head>
	<title>History - API Builder</title>
</svelte:head>

<div>
	<h1 class="text-2xl font-bold text-ab-dark-blue mb-6">History</h1>

	{#if changes.length === 0}
		<p class="text-ab-gray">No changes found.</p>
	{:else}
		<div class="overflow-x-auto">
			<table class="w-full text-left">
				<thead>
					<tr class="border-b border-gray-200">
						<th class="pb-3 text-sm font-semibold text-ab-gray">Application</th>
						<th class="pb-3 text-sm font-semibold text-ab-gray hidden sm:table-cell">Version</th>
						<th class="pb-3 text-sm font-semibold text-ab-gray">Change</th>
						<th class="pb-3 text-sm font-semibold text-ab-gray hidden md:table-cell">By</th>
						<th class="pb-3 text-sm font-semibold text-ab-gray hidden lg:table-cell">Date</th>
					</tr>
				</thead>
				<tbody>
					{#each changes as change (change.guid)}
						<tr class="border-b border-gray-100 hover:bg-ab-light-gray/50 transition-colors">
							<td class="py-3">
								<a href="/{change.organization.key}/{change.application.key}" class="text-ab-blue hover:text-ab-dark-blue font-medium">
									{change.organization.key}/{change.application.key}
								</a>
							</td>
							<td class="py-3 hidden sm:table-cell text-sm text-ab-dark-blue">
								{change.from_version.version} &rarr; {change.to_version.version}
							</td>
							<td class="py-3 text-sm">
								{#if change.diff.type === 'diff_breaking'}
									<span class="text-red-600">{change.diff.description}</span>
								{:else}
									<span class="text-green-700">{change.diff.description}</span>
								{/if}
							</td>
							<td class="py-3 hidden md:table-cell text-sm text-ab-gray">
								{change.changed_by.nickname}
							</td>
							<td class="py-3 hidden lg:table-cell text-sm text-ab-gray">
								{new Date(change.changed_at).toLocaleDateString()}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<Pagination offset={data.offset} limit={25} hasMore={data.hasMore} baseUrl="/history" />
	{/if}
</div>
