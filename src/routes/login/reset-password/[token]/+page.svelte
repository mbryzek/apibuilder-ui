<script lang="ts">
  import PendingForm from '$lib/components/PendingForm.svelte';
  import type { ApiErrorItem } from '$lib/api/error-handler';

  interface Props {
    data: { token: string };
    form: { errors?: ApiErrorItem[] } | null;
  }

  let { form }: Props = $props();

  const errors = $derived(form?.errors ?? []);
</script>

<svelte:head>
  <title>Reset Password - API Builder</title>
</svelte:head>

<div class="page-container">
  <div class="mx-auto mt-12 max-w-md">
    <h1 class="text-ab-dark-blue mb-8 text-center text-2xl font-bold">Set New Password</h1>

    {#if errors.length > 0}
      <div class="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
        {#each errors as error}
          <p class="text-sm text-red-800">{error.message}</p>
        {/each}
      </div>
    {/if}

    <PendingForm>
      {#snippet children(pending)}
        <div class="space-y-4">
          <div>
            <label for="password" class="text-ab-dark-blue mb-1 block text-sm font-medium">New Password</label>
            <input
              type="password"
              id="password"
              name="password"
              required
              autocomplete="new-password"
              class="input-field w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div>
            <label for="confirm_password" class="text-ab-dark-blue mb-1 block text-sm font-medium">Confirm Password</label>
            <input
              type="password"
              id="confirm_password"
              name="confirm_password"
              required
              autocomplete="new-password"
              class="input-field w-full rounded-lg border px-3 py-2"
            />
          </div>

          <button type="submit" disabled={pending} class="btn-primary w-full">
            {pending ? 'Resetting...' : 'Reset Password'}
          </button>
        </div>
      {/snippet}
    </PendingForm>

    <p class="text-ab-gray mt-4 text-center text-sm">
      <a href="/login" class="text-ab-blue hover:text-ab-dark-blue transition-colors"> Back to login </a>
    </p>
  </div>
</div>
