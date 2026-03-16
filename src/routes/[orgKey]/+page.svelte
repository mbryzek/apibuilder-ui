<script lang="ts">
	import type { Organization, Application } from '$generated/com-bryzek-bryzek-apibuilder-v0';
	import Pagination from '$lib/components/Pagination.svelte';

	interface Props {
		data: {
			org: Organization;
			isMember: boolean;
			isAdmin: boolean;
			applications: Application[];
			offset: number;
			hasMore: boolean;
			hasPendingRequests: boolean;
			session?: { id: string; user: { id: string; person: { email?: { address: string } } } };
		};
	}

	let { data }: Props = $props();

	const org = $derived(data.org);
	const apps = $derived(data.applications);
</script>

<svelte:head>
	<title>{org.name} - API Builder</title>
</svelte:head>

<div>
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
		<h1 class="text-2xl font-bold text-ab-dark-blue">{org.name}</h1>
		{#if data.isMember}
			<a href="/{org.key}/upload" class="btn-primary mt-3 sm:mt-0 inline-block text-center">
				Upload API
			</a>
		{/if}
	</div>

	{#if data.isAdmin && data.hasPendingRequests}
		<div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
			<p class="text-yellow-800 text-sm">
				There are pending membership requests.
				<a href="/{org.key}/membership-requests" class="font-semibold underline hover:no-underline">Review requests</a>
			</p>
		</div>
	{/if}

	{#if !data.isMember && data.session}
		<div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
			<p class="text-blue-800 text-sm">
				You are not a member of this organization.
				<a href="/{org.key}/memberships/request" class="font-semibold underline hover:no-underline">Request to join</a>
			</p>
		</div>
	{/if}

	{#if apps.length === 0}
		<p class="text-ab-gray">No applications with published versions.</p>
	{:else}
		<div class="overflow-x-auto">
			<table class="w-full text-left">
				<thead>
					<tr class="border-b border-gray-200">
						<th class="pb-3 text-sm font-semibold text-ab-gray">Application</th>
						<th class="pb-3 text-sm font-semibold text-ab-gray hidden sm:table-cell">Visibility</th>
					</tr>
				</thead>
				<tbody>
					{#each apps as app (app.id)}
						<tr class="border-b border-gray-100 hover:bg-ab-light-gray/50 transition-colors">
							<td class="py-3">
								<a href="/{org.key}/{app.key}/latest" class="text-ab-blue hover:text-ab-dark-blue font-medium">
									{app.name}
								</a>
								{#if app.description}
									<p class="text-sm text-ab-gray mt-0.5">{app.description}</p>
								{/if}
							</td>
							<td class="py-3 hidden sm:table-cell">
								<span class="inline-block text-xs font-medium px-2 py-0.5 rounded-full {app.visibility === 'public' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}">
									{app.visibility}
								</span>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<Pagination offset={data.offset} limit={25} hasMore={data.hasMore} baseUrl="/{org.key}" />
	{/if}
</div>
