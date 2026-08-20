<script lang="ts">
  import PendingForm from '$lib/components/PendingForm.svelte';
  import FormField from '$lib/components/FormField.svelte';
  import type { ApiErrorItem } from '$lib/api/error-handler';
  import FormErrors from '$lib/components/FormErrors.svelte';

  interface Props {
    form: { errors?: ApiErrorItem[]; email?: string; name?: string } | null;
  }

  let { form }: Props = $props();
</script>

<svelte:head>
  <title>Sign Up - API Builder</title>
</svelte:head>

<div class="page-container">
  <div class="mx-auto mt-16 max-w-md">
    <h1 class="text-ab-dark-blue mb-10 text-center text-3xl font-light">Create your account</h1>

    <FormErrors errors={form?.errors} />

    <PendingForm>
      {#snippet children(pending)}
        <div class="space-y-4">
          <FormField label="Name" name="name" value={form?.name ?? ''} autocomplete="name" />

          <FormField label="Email" name="email" value={form?.email ?? ''} inputmode="email" autocomplete="email" />

          <FormField label="Password" name="password" type="password" autocomplete="new-password" />

          <button type="submit" disabled={pending} class="btn-primary w-full">
            {pending ? 'Creating account...' : 'Create account'}
          </button>
        </div>
      {/snippet}
    </PendingForm>

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
