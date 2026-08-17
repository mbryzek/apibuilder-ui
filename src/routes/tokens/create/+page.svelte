<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ApiErrorItem } from '$lib/api/error-handler';
  import FormErrors from '$lib/components/FormErrors.svelte';

  interface Props {
    form: { errors?: ApiErrorItem[] } | null;
  }

  let { form: formResult }: Props = $props();
  let isSubmitting = $state(false);
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
</div>
