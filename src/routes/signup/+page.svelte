<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ApiErrorItem } from '$lib/api/error-handler';

  interface Props {
    form: { errors?: ApiErrorItem[]; email?: string; name?: string } | null;
  }

  let { form }: Props = $props();

  let isSubmitting = $state(false);

  const errors = $derived(form?.errors ?? []);
</script>

<svelte:head>
  <title>Sign Up - API Builder</title>
</svelte:head>

<div class="page-container">
  <div class="mx-auto mt-16 max-w-md">
    <h1 class="text-ab-dark-blue mb-10 text-center text-3xl font-light">Create your account</h1>

    {#if errors.length > 0}
      <div class="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
        {#each errors as error}
          <p class="text-sm text-red-800">{error.message}</p>
        {/each}
      </div>
    {/if}

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
      <div class="space-y-4">
        <div>
          <label for="name" class="text-ab-dark-blue mb-1 block text-sm font-medium">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={form?.name ?? ''}
            autocomplete="name"
            class="input-field w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div>
          <label for="email" class="text-ab-dark-blue mb-1 block text-sm font-medium">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={form?.email ?? ''}
            autocomplete="email"
            class="input-field w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div>
          <label for="password" class="text-ab-dark-blue mb-1 block text-sm font-medium">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            required
            autocomplete="new-password"
            class="input-field w-full rounded-lg border px-3 py-2"
          />
        </div>

        <button type="submit" disabled={isSubmitting} class="btn-primary w-full">
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </button>
      </div>
    </form>

    <p class="text-ab-gray mt-6 text-center text-sm">
      Already have an account?
      <a href="/login" class="text-ab-blue hover:text-ab-dark-blue transition-colors"> Sign in </a>
    </p>

    <div class="mt-8 border-t border-gray-200 pt-6 text-center">
      <p class="text-ab-gray text-sm">
        AI Agent? Skip the account —
        <a href="/doc/start#quick-start" class="text-ab-blue hover:text-ab-dark-blue transition-colors">
          run <code class="rounded bg-gray-100 px-1.5 py-0.5 text-xs">api init</code>
        </a>
        to get started instantly.
      </p>
    </div>
  </div>
</div>
