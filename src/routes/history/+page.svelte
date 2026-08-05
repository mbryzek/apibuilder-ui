<script lang="ts">
  import LoadErrorBanner from '$lib/components/LoadErrorBanner.svelte';
  import Pagination from '$lib/components/Pagination.svelte';
  import type { LoadError } from '$lib/api/load-error';
  import type { Change } from '$generated/com-bryzek-apibuilder';

  interface Props {
    data: {
      changes: Change[];
      offset: number;
      limit: number;
      hasMore: boolean;
      loadError: LoadError | null;
    };
  }

  let { data }: Props = $props();

  const changes = $derived(data.changes);
</script>

<svelte:head>
  <title>History - API Builder</title>
</svelte:head>

<div>
  <h1 class="text-ab-dark-blue mb-6 text-2xl font-bold">History</h1>

  {#if data.loadError}
    <LoadErrorBanner error={data.loadError} />
  {/if}

  {#if changes.length > 0}
    <div class="overflow-x-auto">
      <table class="w-full text-left">
        <thead>
          <tr class="border-b border-gray-200">
            <th class="text-ab-gray pb-3 text-sm font-semibold">Application</th>
            <th class="text-ab-gray hidden pb-3 text-sm font-semibold sm:table-cell">Version</th>
            <th class="text-ab-gray pb-3 text-sm font-semibold">Change</th>
            <th class="text-ab-gray hidden pb-3 text-sm font-semibold lg:table-cell">Date</th>
          </tr>
        </thead>
        <tbody>
          {#each changes as change (change.id)}
            <tr class="hover:bg-ab-light-gray/50 border-b border-gray-100 transition-colors">
              <td class="py-3">
                <a href="/{change.organization.key}/{change.application.key}" class="text-ab-blue hover:text-ab-dark-blue font-medium">
                  {change.organization.key}/{change.application.key}
                </a>
              </td>
              <td class="text-ab-dark-blue hidden py-3 pr-4 text-sm whitespace-nowrap sm:table-cell">
                {change.from_version} &rarr; {change.to_version}
              </td>
              <td class="py-3 text-sm">
                {#if change.is_material}
                  <span class="text-red-600">{change.description}</span>
                {:else}
                  <span class="text-green-700">{change.description}</span>
                {/if}
              </td>
              <td class="text-ab-gray hidden py-3 text-sm lg:table-cell">
                {new Date(change.changed_at).toLocaleDateString()}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {:else if !data.loadError}
    <p class="text-ab-gray">No changes found.</p>
  {/if}

  <!-- Outside the list guard on purpose: an empty page still needs its Previous link. -->
  <Pagination offset={data.offset} limit={data.limit} hasMore={data.hasMore} baseUrl="/history" />
</div>
