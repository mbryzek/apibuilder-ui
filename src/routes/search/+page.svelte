<script lang="ts">
  import LoadErrorBanner from '#lib/components/LoadErrorBanner.svelte';
  import Pagination from '#lib/components/Pagination.svelte';
  import { listUrl } from '#lib/pagination.ts';
  import { QueryInput } from '#lib/query-input.svelte.ts';
  import type { LoadError } from '#lib/api/load-error.ts';
  import type { Item } from '#generated/com-bryzek-apibuilder.ts';

  interface Props {
    data: {
      items: Item[];
      q: string;
      offset: number;
      limit: number;
      hasMore: boolean;
      loadError: LoadError | null;
    };
  }

  let { data }: Props = $props();

  const items = $derived(data.items);
  const paginationBaseUrl = $derived(listUrl('/search', { q: data.q }));

  const query = new QueryInput('/search', () => data.q);

  async function handleSubmit(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    await query.submit();
  }

  function itemUrl(item: Item): string {
    return `/${item.organization_key}/${item.application_key}`;
  }
</script>

<svelte:head>
  <title>{data.q ? `${data.q} - Search` : 'Search'} - API Builder</title>
</svelte:head>

<div class="page-container">
  <h1 class="text-ab-dark-blue mb-6 text-2xl font-bold">Search</h1>

  <form onsubmit={handleSubmit} class="mb-6">
    <div class="flex gap-3">
      <input
        type="text"
        name="q"
        value={query.text}
        oninput={(e) => query.input(e.currentTarget.value)}
        placeholder="Search APIs..."
        class="input-field flex-1"
      />
      <button type="submit" class="btn-primary">Search</button>
    </div>
  </form>

  {#if data.loadError}
    <LoadErrorBanner error={data.loadError} />
  {/if}

  {#if data.q}
    {#if items.length > 0}
      <div class="space-y-3">
        {#each items as item (item.id)}
          <div class="card">
            <a href={itemUrl(item)} class="text-ab-blue hover:text-ab-dark-blue font-medium">
              {item.label}
            </a>
            {#if item.description}
              <p class="text-ab-gray mt-1 text-sm">{item.description}</p>
            {/if}
          </div>
        {/each}
      </div>
    {:else if !data.loadError}
      <p class="text-ab-gray">No results found for "{data.q}".</p>
    {/if}

    <!-- Outside the list guard on purpose: an empty page still needs its Previous link. -->
    <Pagination offset={data.offset} limit={data.limit} hasMore={data.hasMore} baseUrl={paginationBaseUrl} />
  {/if}
</div>
