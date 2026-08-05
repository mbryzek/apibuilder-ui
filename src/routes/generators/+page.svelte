<script lang="ts">
  import LoadErrorBanner from '$lib/components/LoadErrorBanner.svelte';
  import Pagination from '$lib/components/Pagination.svelte';
  import type { LoadError } from '$lib/api/load-error';
  import type { Generator } from '$generated/com-bryzek-apibuilder-generator';

  interface Props {
    data: {
      generators: Generator[];
      offset: number;
      limit: number;
      hasMore: boolean;
      loadError: LoadError | null;
    };
  }

  let { data }: Props = $props();

  let searchQuery = $state('');

  const filtered = $derived(
    searchQuery
      ? data.generators.filter((gen) => {
          const q = searchQuery.toLowerCase();
          return gen.key.toLowerCase().includes(q) || gen.name.toLowerCase().includes(q) || (gen.language ?? '').toLowerCase().includes(q);
        })
      : data.generators
  );
</script>

<svelte:head>
  <title>Generators - API Builder</title>
</svelte:head>

<div class="page-container">
  <div class="mb-6">
    <h1 class="text-ab-dark-blue text-2xl font-bold">Generators</h1>
  </div>

  <div class="mb-4">
    <input
      type="text"
      placeholder="Filter generators..."
      bind:value={searchQuery}
      class="input-field w-full rounded-lg border px-3 py-2 text-sm sm:w-80"
    />
  </div>

  {#if data.loadError}
    <LoadErrorBanner error={data.loadError} />
  {/if}

  {#if filtered.length > 0}
    <div class="overflow-x-auto">
      <table class="w-full text-left">
        <thead>
          <tr class="border-b border-gray-200">
            <th class="text-ab-gray pb-3 text-sm font-semibold">Key</th>
            <th class="text-ab-gray hidden pb-3 text-sm font-semibold sm:table-cell">Name</th>
            <th class="text-ab-gray hidden pb-3 text-sm font-semibold md:table-cell">Language</th>
          </tr>
        </thead>
        <tbody>
          {#each filtered as gen (gen.key)}
            <tr class="hover:bg-ab-light-gray/50 border-b border-gray-100 transition-colors">
              <td class="py-3">
                <a href="/generators/{gen.key}" class="text-ab-blue hover:text-ab-dark-blue font-medium">
                  {gen.key}
                </a>
              </td>
              <td class="text-ab-dark-blue hidden py-3 sm:table-cell">{gen.name}</td>
              <td class="text-ab-gray hidden py-3 md:table-cell">{gen.language ?? '-'}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {:else if !data.loadError}
    <p class="text-ab-gray">{searchQuery ? 'No generators match your filter.' : 'No generators found.'}</p>
  {/if}

  <!-- Outside the list guard on purpose: an empty page still needs its Previous link. Still
       suppressed while a client-side filter is active, since the filter only sees this page. -->
  {#if !searchQuery}
    <Pagination offset={data.offset} limit={data.limit} hasMore={data.hasMore} baseUrl="/generators" />
  {/if}
</div>
