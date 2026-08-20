<script lang="ts">
  import PendingForm from '$lib/components/PendingForm.svelte';
  import FormField from '$lib/components/FormField.svelte';
  import type { ApiErrorItem } from '$lib/api/error-handler';
  import FormErrors from '$lib/components/FormErrors.svelte';

  interface Props {
    data: {
      redirectTo: string;
    };
    form: { errors?: ApiErrorItem[] } | null;
  }

  let { data, form }: Props = $props();
</script>

<svelte:head>
  <title>Sign In - API Builder</title>
</svelte:head>

<div class="page-container">
  <div class="mx-auto mt-16 max-w-md">
    <h1 class="text-ab-dark-blue mb-10 text-center text-3xl font-light">Sign in to API Builder</h1>

    <FormErrors errors={form?.errors} />

    <PendingForm>
      {#snippet children(pending)}
        <input type="hidden" name="redirectTo" value={data.redirectTo} />

        <div class="space-y-4">
          <FormField label="Email" name="email" inputmode="email" autocomplete="email" />

          <FormField label="Password" name="password" type="password" autocomplete="current-password" />

          <button type="submit" disabled={pending} class="btn-primary w-full">
            {pending ? 'Signing in...' : 'Sign in'}
          </button>
        </div>
      {/snippet}
    </PendingForm>

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
