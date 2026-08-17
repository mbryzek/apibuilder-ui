<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ApiErrorItem } from '$lib/api/error-handler';
  import type { CreatedToken } from '$generated/com-bryzek-platform';

  interface Props {
    form: { errors?: ApiErrorItem[]; created?: CreatedToken } | null;
  }

  let { form: formResult }: Props = $props();
  let isSubmitting = $state(false);
  let copied = $state(false);
  let copyTimeout: ReturnType<typeof setTimeout> | undefined;

  let created = $derived(formResult?.created ?? null);

  function handleCopy(): void {
    if (created) {
      navigator.clipboard.writeText(created.cleartext).then(() => {
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
  <title>Create API Token - API Builder</title>
</svelte:head>

<div class="page-container">
  <div class="mb-6">
    <a href="/tokens" class="text-ab-blue hover:text-ab-dark-blue text-sm">&larr; Back to Tokens</a>
  </div>

  <h1 class="text-ab-dark-blue mb-6 text-2xl font-bold">Create API Token</h1>

  {#if formResult?.errors}
    <div class="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
      {#each formResult.errors as err}
        <p class="text-sm text-red-800">{err.message}</p>
      {/each}
    </div>
  {/if}

  {#if created}
    <div class="card mb-6">
      <div class="mb-2">
        <p class="text-ab-gray mb-1 text-sm font-semibold">Token</p>
        <div class="flex items-center gap-2">
          <code class="bg-ab-light-gray text-ab-dark-blue flex-1 rounded p-3 font-mono text-sm break-all select-all">
            {created.cleartext}
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
          This is the only time this token is shown. Copy it now and store it securely.
        </p>
      </div>
      <a href="/tokens/{created.token.id}" class="text-ab-blue hover:text-ab-dark-blue text-sm">View token details</a>
    </div>
  {:else}
    <div class="card">
      <form
        method="POST"
        use:enhance={() => {
          isSubmitting = true;
          return async ({ update }) => {
            isSubmitting = false;
            await update();
          };
        }}
      >
        <div class="mb-4">
          <label for="description" class="text-ab-dark-blue mb-1 block text-sm font-semibold">Description</label>
          <input
            type="text"
            id="description"
            name="description"
            placeholder="Optional description for this token"
            class="input-field w-full"
          />
          <p class="text-ab-gray mt-1 text-sm">A description to help you remember what this token is used for.</p>
        </div>
        <button type="submit" class="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Token'}
        </button>
      </form>
    </div>
  {/if}
</div>
