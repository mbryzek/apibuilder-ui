<script lang="ts">
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
</script>

<div class="page-container">
	<div class="flex gap-8">
		<OrgSidebar orgKey={data.org.key} isMember={data.isMember} isAdmin={data.isAdmin} />
		<div class="flex-1 min-w-0">
			{@render children()}
		</div>
	</div>
</div>
