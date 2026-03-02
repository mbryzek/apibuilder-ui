<script lang="ts">
	import { page } from '$app/stores';
	import OrgSidebar from '$lib/components/OrgSidebar.svelte';
	import type { Organization } from '$generated/types';
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

	// Version layout provides its own AppSidebar, so skip OrgSidebar when version data is present
	const isAppVersionRoute = $derived('service' in $page.data);
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
