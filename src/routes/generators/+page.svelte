<script lang="ts">
  import { onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import LoadErrorBanner from '$lib/components/LoadErrorBanner.svelte';
  import Pagination from '$lib/components/Pagination.svelte';
  import { listUrl } from '$lib/pagination';
  import type { LoadError } from '$lib/api/load-error';
  import type { Generator } from '$generated/com-bryzek-apibuilder-generator';

  interface Props {
    data: {
      generators: Generator[];
      q: string;
      offset: number;
      limit: number;
      hasMore: boolean;
      loadError: LoadError | null;
    };
  }

  let { data }: Props = $props();

  // Carries the filter, drops the offset — so Previous/Next page through the matches, and typing
  // a narrower filter restarts at page one instead of landing past the end of the smaller set.
  const paginationBaseUrl = $derived(listUrl('/generators', { q: data.q }));

  let debounceTimer: ReturnType<typeof setTimeout> | undefined;

  function filter(query: string) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      // Fire-and-forget: the timer fires after the user stopped typing, with nothing awaiting it.
      void goto(listUrl('/generators', { q: query }), { keepFocus: true });
    }, 250);
  }

  function handleInput(event: Event) {
    filter((event.target as HTMLInputElement).value);
  }

  onDestroy(() => {
    clearTimeout(debounceTimer);
  });
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
      name="q"
      value={data.q}
      oninput={handleInput}
      placeholder="Filter generators..."
      class="input-field w-full rounded-lg border px-3 py-2 text-sm sm:w-80"
    />
  </div>

  {#if data.loadError}
    <LoadErrorBanner error={data.loadError} />
  {/if}

  {#if data.generators.length > 0}
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
          {#each data.generators as gen (gen.key)}
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
    <p class="text-ab-gray">{data.q ? `No generators match "${data.q}".` : 'No generators found.'}</p>
  {/if}

  <!-- Outside the list guard on purpose: an empty page still needs its Previous link. No longer
       suppressed while a filter is active — the API applies the filter, so the pages these links
       point at are pages of the matches. -->
  <Pagination offset={data.offset} limit={data.limit} hasMore={data.hasMore} baseUrl={paginationBaseUrl} />
</div>
