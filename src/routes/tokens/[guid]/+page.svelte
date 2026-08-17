<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ApiErrorItem } from '$lib/api/error-handler';
  import type { Token } from '$generated/com-bryzek-platform';
  import FormErrors from '$lib/components/FormErrors.svelte';
  import Banner from '$lib/components/Banner.svelte';

  interface Props {
    data: { token: Token };
    form: { errors?: ApiErrorItem[] } | null;
  }

  let { data, form: formResult }: Props = $props();

  let confirmDelete = $state(false);
  let isSubmitting = $state(false);

  const token = $derived(data.token);
</script>

<svelte:head>
  <title>API Token - API Builder</title>
</svelte:head>

<div class="page-container">
  <div class="mb-6">
    <a href="/tokens" class="text-ab-blue hover:text-ab-dark-blue text-sm">&larr; Back to Tokens</a>
  </div>

  <h1 class="text-ab-dark-blue mb-6 text-2xl font-bold">API Token</h1>

  <FormErrors errors={formResult?.errors} />

  <div class="card mb-6">
    <dl class="space-y-3">
      <div>
        <dt class="text-ab-gray mb-1 text-sm font-semibold">Token</dt>
        <dd class="text-ab-dark-blue font-mono text-sm">{token.masked_token}</dd>
      </div>
      {#if token.description}
        <div>
          <dt class="text-ab-gray mb-1 text-sm font-semibold">Description</dt>
          <dd class="text-ab-dark-blue text-sm">{token.description}</dd>
        </div>
      {/if}
      <div>
        <dt class="text-ab-gray mb-1 text-sm font-semibold">Created</dt>
        <dd class="text-ab-dark-blue text-sm">{new Date(token.created_at).toLocaleString()}</dd>
      </div>
      {#if token.expires_at}
        <div>
          <dt class="text-ab-gray mb-1 text-sm font-semibold">Expires</dt>
          <dd class="text-ab-dark-blue text-sm">{new Date(token.expires_at).toLocaleString()}</dd>
        </div>
      {/if}
    </dl>
  </div>

  <div>
    {#if confirmDelete}
      <Banner class="">
        <p class="mb-3 text-sm">Are you sure you want to delete this token? This cannot be undone.</p>
        <div class="flex gap-3">
          <form
            method="POST"
            action="?/delete"
            use:enhance={() => {
              isSubmitting = true;
              return async ({ update }) => {
                isSubmitting = false;
                await update();
              };
            }}
          >
            <button type="submit" class="btn-danger" disabled={isSubmitting}>
              {isSubmitting ? 'Deleting...' : 'Yes, Delete'}
            </button>
          </form>
          <button type="button" class="btn-secondary" onclick={() => (confirmDelete = false)}>Cancel</button>
        </div>
      </Banner>
    {:else}
      <button type="button" class="btn-danger" onclick={() => (confirmDelete = true)}>Delete Token</button>
    {/if}
  </div>
</div>
