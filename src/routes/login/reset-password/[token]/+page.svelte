<script lang="ts">
  import PendingForm from '$lib/components/PendingForm.svelte';
  import FormField from '$lib/components/FormField.svelte';
  import type { ApiErrorItem } from '$lib/api/error-handler';
  import FormErrors from '$lib/components/FormErrors.svelte';

  interface Props {
    form: { errors?: ApiErrorItem[] } | null;
  }

  let { form }: Props = $props();
</script>

<svelte:head>
  <title>Reset Password - API Builder</title>
</svelte:head>

<div class="page-container">
  <div class="mx-auto mt-12 max-w-md">
    <h1 class="text-ab-dark-blue mb-8 text-center text-2xl font-bold">Set New Password</h1>

    <FormErrors errors={form?.errors} />

    <PendingForm>
      {#snippet children(pending)}
        <div class="space-y-4">
          <FormField label="New Password" name="password" type="password" autocomplete="new-password" />

          <FormField label="Confirm Password" name="confirm_password" type="password" autocomplete="new-password" />

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
