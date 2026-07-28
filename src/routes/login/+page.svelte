<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ApiErrorItem } from '$lib/api/error-handler';

  interface Props {
    data: {
      githubClientId: string;
      appBaseUrl: string;
      redirectTo: string;
    };
    form: { errors?: ApiErrorItem[] } | null;
  }

  let { data, form }: Props = $props();

  let isSubmitting = $state(false);

  const errors = $derived(form?.errors ?? []);
  const githubUrl = $derived(
    data.githubClientId
      ? `https://github.com/login/oauth/authorize?scope=user:email&client_id=${data.githubClientId}&redirect_uri=${encodeURIComponent(data.appBaseUrl + '/login/github/callback')}`
      : ''
  );
</script>

<svelte:head>
  <title>Sign In - API Builder</title>
</svelte:head>

<div class="page-container">
  <div class="mx-auto mt-16 max-w-md">
    <h1 class="text-ab-dark-blue mb-10 text-center text-3xl font-light">Sign in to API Builder</h1>

    {#if githubUrl}
      <a
        href={githubUrl}
        class="flex w-full items-center justify-center gap-2 rounded-full bg-gray-900 px-6 py-4 font-semibold text-white transition-all duration-200 ease-out hover:scale-105 hover:bg-gray-800"
      >
        <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill-rule="evenodd"
            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            clip-rule="evenodd"
          />
        </svg>
        Sign in with GitHub
      </a>

      <div class="relative my-8">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-gray-200"></div>
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="text-ab-gray bg-white px-4">or</span>
        </div>
      </div>
    {/if}

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
