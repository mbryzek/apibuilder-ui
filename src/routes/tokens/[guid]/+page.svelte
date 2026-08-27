<script lang="ts">
  import { enhance } from '$app/forms';
  import Banner from '$lib/components/Banner.svelte';
  import FormErrors from '$lib/components/FormErrors.svelte';
  import LoadErrorBanner from '$lib/components/LoadErrorBanner.svelte';
  import type { ApiErrorItem } from '$lib/api/error-handler';
  import type { LoadError } from '$lib/api/load-error';

  interface Props {
    data: {
      tokenGuid: string;
      cleartextToken: string | null;
      loadError: LoadError | null;
    };
    form: { errors?: ApiErrorItem[] } | null;
  }

  let { data, form: formResult }: Props = $props();

  let confirmDelete = $state(false);
  let isSubmitting = $state(false);
  let copied = $state(false);
  let copyTimeout: ReturnType<typeof setTimeout> | undefined;

  function handleCopy(): void {
    if (data.cleartextToken) {
      navigator.clipboard.writeText(data.cleartextToken).then(() => {
        copied = true;
        clearTimeout(copyTimeout);
        copyTimeout = setTimeout(() => {
          copied = false;
        }, 2000);
      });
    }
  }
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

  {#if data.loadError}
    <LoadErrorBanner error={data.loadError} />
  {:else if data.cleartextToken}
    <div class="card mb-6">
      <div class="mb-2">
        <p class="text-ab-gray mb-1 text-sm font-semibold">Token</p>
        <div class="flex items-center gap-2">
          <code class="bg-ab-light-gray text-ab-dark-blue flex-1 rounded p-3 font-mono text-sm break-all select-all">
            {data.cleartextToken}
          </code>
          <button
            type="button"
            class="hover:bg-ab-light-gray shrink-0 rounded p-2 transition-colors"
            title="Copy to clipboard"
            onclick={handleCopy}
          >
            {#if copied}
              <svg class="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            {:else}
              <svg class="text-ab-gray hover:text-ab-dark-blue h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            {/if}
          </button>
        </div>
        <p class="mt-2 rounded border border-amber-200 bg-amber-50 p-2 text-sm text-amber-700">
          This token will only be displayed once. Copy it now and store it securely.
        </p>
      </div>
    </div>
  {:else}
    <div class="card mb-6">
      <p class="text-ab-gray text-sm">This token has already been displayed. For security, tokens are only shown once after creation.</p>
    </div>
  {/if}

  <div>
    {#if confirmDelete}
      <Banner variant="error">
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
