<script lang="ts">
	import Pagination from '$lib/components/Pagination.svelte';
	import type { Change } from '$generated/com-bryzek-bryzek-apibuilder-v0';

	interface Props {
		data: {
			changes: Change[];
			offset: number;
			hasMore: boolean;
			orgKey: string;
			appKey: string;
			versionName: string;
		};
	}

	let { data }: Props = $props();

	const changes = $derived(data.changes);
</script>

<svelte:head>
	<title>History - {data.orgKey}/{data.appKey} - API Builder</title>
</svelte:head>

<div>
	<h2 class="text-xl font-bold text-ab-dark-blue mb-6">History</h2>

	{#if changes.length === 0}
		<p class="text-ab-gray">No changes found for this application.</p>
	{:else}
		<div class="overflow-x-auto">
			<table class="w-full text-left">
				<thead>
					<tr class="border-b border-gray-200">
						<th class="pb-3 text-sm font-semibold text-ab-gray hidden sm:table-cell">Version</th>
						<th class="pb-3 text-sm font-semibold text-ab-gray">Change</th>
						<th class="pb-3 text-sm font-semibold text-ab-gray hidden lg:table-cell">Date</th>
					</tr>
				</thead>
				<tbody>
					{#each changes as change (change.id)}
						<tr class="border-b border-gray-100 hover:bg-ab-light-gray/50 transition-colors">
							<td class="py-3 pr-4 hidden sm:table-cell text-sm text-ab-dark-blue whitespace-nowrap">
								<a href="/{data.orgKey}/{data.appKey}/{change.from_version}" class="text-ab-blue hover:text-ab-dark-blue">
									{change.from_version}
								</a>
								&rarr;
								<a href="/{data.orgKey}/{data.appKey}/{change.to_version}" class="text-ab-blue hover:text-ab-dark-blue">
									{change.to_version}
								</a>
							</td>
							<td class="py-3 text-sm">
								{#if change.is_material}
									<span class="text-red-600">{change.description}</span>
								{:else}
									<span class="text-green-700">{change.description}</span>
								{/if}
							</td>
							<td class="py-3 hidden lg:table-cell text-sm text-ab-gray">
								{new Date(change.changed_at).toLocaleDateString()}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<Pagination offset={data.offset} limit={25} hasMore={data.hasMore} baseUrl="/{data.orgKey}/{data.appKey}/{data.versionName}/history" />
	{/if}
</div>
