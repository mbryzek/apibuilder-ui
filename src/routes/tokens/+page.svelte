<script lang="ts">
  import LoadErrorBanner from '$lib/components/LoadErrorBanner.svelte';
  import Pagination from '$lib/components/Pagination.svelte';
  import type { LoadError } from '$lib/api/load-error';
  import type { Token } from '$generated/com-bryzek-platform';

  interface Props {
    data: {
      tokens: Token[];
      offset: number;
      limit: number;
      hasMore: boolean;
      loadError: LoadError | null;
    };
  }

  let { data }: Props = $props();

  const tokens = $derived(data.tokens);
</script>

<svelte:head>
  <title>API Tokens - API Builder</title>
</svelte:head>

<div class="page-container">
  <div class="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
    <h1 class="text-ab-dark-blue text-2xl font-bold">API Tokens</h1>
    <a href="/tokens/create" class="btn-primary mt-3 inline-block text-center sm:mt-0"> Create Token </a>
  </div>

  {#if data.loadError}
    <LoadErrorBanner error={data.loadError} />
  {/if}

  {#if tokens.length > 0}
    <div class="space-y-3">
      {#each tokens as token (token.id)}
        <a
          href="/tokens/{token.id}"
          class="hover:border-ab-blue/30 hover:bg-ab-light-gray/50 block rounded-lg border border-gray-200 p-4 transition-colors"
        >
          <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div class="text-ab-blue font-mono text-sm font-medium">{token.masked_token}</div>
            <div class="text-ab-gray text-xs">Created {new Date(token.created_at).toLocaleDateString()}</div>
          </div>
          {#if token.description}
            <p class="text-ab-dark-gray mt-1 text-sm">{token.description}</p>
          {/if}
        </a>
      {/each}
    </div>

    <Pagination offset={data.offset} limit={data.limit} hasMore={data.hasMore} baseUrl="/tokens" />
  {:else if !data.loadError}
    <p class="text-ab-gray">No API tokens found.</p>
  {/if}
</div>
