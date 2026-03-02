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

	// Detect version routes: /{orgKey}/{appKey}/{version} (3+ path segments)
	// Exclude /upload to avoid matching /{orgKey}/upload as an app route
	const isAppVersionRoute = $derived(
		/^\/[^/]+\/[^/]+\/[^/]+/.test($page.url.pathname) &&
		!$page.url.pathname.includes('/upload')
	);
</script>

{#if isAppVersionRoute}
	<div class="page-container">
		{@render children()}
	</div>
{:else}
	<div class="page-container">
		<div class="flex gap-10">
			<OrgSidebar orgKey={data.org.key} isMember={data.isMember} isAdmin={data.isAdmin} />
			<div class="flex-1 min-w-0">
				{@render children()}
			</div>
		</div>
	</div>
{/if}
