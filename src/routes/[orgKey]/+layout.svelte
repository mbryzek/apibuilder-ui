<script lang="ts">
  import { page } from '$app/stores';
  import LoadErrorBanner from '$lib/components/LoadErrorBanner.svelte';
  import OrgSidebar from '$lib/components/OrgSidebar.svelte';
  import type { LoadError } from '$lib/api/load-error';
  import type { Organization } from '$generated/com-bryzek-apibuilder';
  import type { Snippet } from 'svelte';

  interface Props {
    data: {
      org: Organization;
      isMember: boolean;
      isAdmin: boolean;
      membershipLoadError: LoadError | null;
    };
    children: Snippet;
  }

  let { data, children }: Props = $props();

  // Version routes have their own AppSidebar; skip OrgSidebar for them
  const isAppVersionRoute = $derived($page.route.id?.includes('/[version]') ?? false);
</script>

<div class="page-container">
  {#if data.membershipLoadError}
    <LoadErrorBanner error={data.membershipLoadError} />
  {/if}

  {#if isAppVersionRoute}
    {@render children()}
  {:else}
    <div class="flex gap-10">
      <OrgSidebar orgKey={data.org.key} isMember={data.isMember} isAdmin={data.isAdmin} />
      <div class="min-w-0 flex-1">
        {@render children()}
      </div>
    </div>
  {/if}
</div>
