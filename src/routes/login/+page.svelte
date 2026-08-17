<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ApiErrorItem } from '$lib/api/error-handler';
  import FormErrors from '$lib/components/FormErrors.svelte';

  interface Props {
    data: {
      redirectTo: string;
    };
    form: { errors?: ApiErrorItem[] } | null;
  }

  let { data, form }: Props = $props();

  let isSubmitting = $state(false);
</script>

<svelte:head>
  <title>Sign In - API Builder</title>
</svelte:head>

<div class="page-container">
  <div class="mx-auto mt-16 max-w-md">
    <h1 class="text-ab-dark-blue mb-10 text-center text-3xl font-light">Sign in to API Builder</h1>

    <FormErrors errors={form?.errors} />

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
      <input type="hidden" name="redirectTo" value={data.redirectTo} />

      <div class="space-y-4">
        <div>
          <label for="email" class="text-ab-dark-blue mb-1 block text-sm font-medium">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            required
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
            autocomplete="current-password"
            class="input-field w-full rounded-lg border px-3 py-2"
          />
        </div>

        <button type="submit" disabled={isSubmitting} class="btn-primary w-full">
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </button>
      </div>
    </form>

    <p class="text-ab-gray mt-4 text-center text-sm">
      <a href="/login/forgot-password" class="text-ab-blue hover:text-ab-dark-blue transition-colors"> Forgot password? </a>
    </p>

    <p class="text-ab-gray mt-6 text-center text-sm">
      Don't have an account?
      <a href="/signup" class="text-ab-blue hover:text-ab-dark-blue transition-colors"> Sign up </a>
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
