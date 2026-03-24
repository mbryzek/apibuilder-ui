<script lang="ts">
	import { page } from '$app/stores';
	import OrgSidebar from '$lib/components/OrgSidebar.svelte';
	import type { Organization } from '$generated/com-bryzek-apibuilder';
	import type { Snippet } from 'svelte';

	interface Props {
		data: {
			org: Organization;
			isMember: boolean;
			isAdmin: boolean;
		};
		children: Snippet;
	}

	let { data, children }: Props = $props();

	// Version routes have their own AppSidebar; skip OrgSidebar for them
	const isAppVersionRoute = $derived($page.route.id?.includes('/[version]') ?? false);
</script>

<div class="page-container">
	{#if isAppVersionRoute}
		{@render children()}
	{:else}
		<div class="flex gap-10">
			<OrgSidebar orgKey={data.org.key} isMember={data.isMember} isAdmin={data.isAdmin} />
			<div class="flex-1 min-w-0">
				{@render children()}
			</div>
		</div>
	{/if}
</div>
