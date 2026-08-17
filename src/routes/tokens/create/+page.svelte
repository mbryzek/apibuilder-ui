<script lang="ts">
  import PendingForm from '$lib/components/PendingForm.svelte';
  import type { ApiErrorItem } from '$lib/api/error-handler';

  interface Props {
    form: { errors?: ApiErrorItem[] } | null;
  }

  let { form: formResult }: Props = $props();
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

  <div class="card">
    <PendingForm>
      {#snippet children(pending)}
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
        <button type="submit" class="btn-primary" disabled={pending}>
          {pending ? 'Creating...' : 'Create Token'}
        </button>
      {/snippet}
    </PendingForm>
  </div>
</div>
