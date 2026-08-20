<script lang="ts">
  import PendingForm from '$lib/components/PendingForm.svelte';
  import FormField from '$lib/components/FormField.svelte';
  import type { ApiErrorItem } from '$lib/api/error-handler';
  import type { CreatedToken } from '$generated/com-bryzek-platform';
  import FormErrors from '$lib/components/FormErrors.svelte';

  interface Props {
    form: { errors?: ApiErrorItem[]; created?: CreatedToken; description?: string } | null;
  }

  let { form: formResult }: Props = $props();
  let copyState = $state<'idle' | 'copied' | 'failed'>('idle');
  let copyTimeout: ReturnType<typeof setTimeout> | undefined;

  let created = $derived(formResult?.created ?? null);

  /**
   * The copy has to report its own failure, because this is the only time the value exists.
   *
   * `navigator.clipboard` is undefined on a non-secure origin (a TypeError, not a rejection) and
   * `writeText` rejects on a denied permission or an unfocused document. Silently doing nothing
   * costs the user the token: the page says, truthfully, that it is not shown again.
   */
  async function handleCopy(): Promise<void> {
    if (!created) return;
    clearTimeout(copyTimeout);
    try {
      await navigator.clipboard.writeText(created.cleartext);
      copyState = 'copied';
    } catch {
      copyState = 'failed';
    }
    copyTimeout = setTimeout(() => {
      copyState = 'idle';
    }, 2000);
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

  <FormErrors errors={formResult?.errors} />

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
            {#if copyState === 'copied'}
              <svg class="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            {:else if copyState === 'failed'}
              <span class="text-ab-error-red text-xs font-semibold">Failed</span>
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
        {#if copyState === 'failed'}
          <p class="text-ab-error-red mt-2 text-sm">Copy failed. Select the token above and copy it manually.</p>
        {/if}
        <p class="mt-2 rounded border border-amber-200 bg-amber-50 p-2 text-sm text-amber-700">
          This is the only time this token is shown. Copy it now and store it securely.
        </p>
      </div>
      <a href="/tokens/{created.token.id}" class="text-ab-blue hover:text-ab-dark-blue text-sm">View token details</a>
    </div>
  {:else}
    <div class="card">
      <PendingForm>
        {#snippet children(pending)}
          <div class="mb-4">
            <FormField
              label="Description"
              name="description"
              placeholder="Optional description for this token"
              value={formResult?.description ?? ''}
              hint="A description to help you remember what this token is used for."
            />
          </div>
          <button type="submit" class="btn-primary" disabled={pending}>
            {pending ? 'Creating...' : 'Create Token'}
          </button>
        {/snippet}
      </PendingForm>
    </div>
  {/if}
</div>
