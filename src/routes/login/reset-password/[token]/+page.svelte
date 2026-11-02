<script lang="ts">
  /**
   * Choosing a new password from a mailed reset link.
   *
   * Three states, and only one of them is a form: `ready` takes the password, `invalid` is a link the
   * platform no longer holds, `unavailable` is our side failing while the link may still be good.
   */
  import PendingForm from '#lib/components/PendingForm.svelte';
  import FormField from '#lib/components/FormField.svelte';
  import type { ApiErrorItem } from '#lib/api/error-handler.ts';
  import FormErrors from '#lib/components/FormErrors.svelte';
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
    form: { errors?: ApiErrorItem[]; linkInvalid?: boolean } | null;
  }

  let { data, form }: Props = $props();

  // The link can die between the load and the submit, so the dead-link state is reachable from either side.
  let linkInvalid = $derived(data.outcome.kind === 'invalid' || form?.linkInvalid === true);

  let heading = $derived(
    linkInvalid ? 'This link is no longer valid' : data.outcome.kind === 'ready' ? 'Set New Password' : 'We could not open your reset link'
  );
</script>

<svelte:head>
  <title>{heading} - API Builder</title>
</svelte:head>

<div class="page-container">
  <div class="mx-auto mt-12 max-w-md" data-testid="password-reset-{linkInvalid ? 'invalid' : data.outcome.kind}">
    <h1 class="text-ab-dark-blue mb-8 text-center text-2xl font-bold">{heading}</h1>

    {#if linkInvalid}
      <p class="text-ab-gray mb-6 text-center">This reset link has already been used or has expired. Request a new one to continue.</p>
      <div class="space-y-3">
        <a href="/login/forgot-password" class="btn-primary block w-full text-center">Email Me a New Link</a>
        <a href="/login" class="btn-secondary block w-full text-center">Sign In</a>
      </div>
    {:else if data.outcome.kind === 'unavailable'}
      <p class="text-ab-gray mb-6 text-center">Something went wrong on our end. Your link is still good. Try again in a few minutes.</p>
      <a href={data.retryUrl} class="btn-primary block w-full text-center" data-sveltekit-reload>Try Again</a>
    {:else}
      <FormErrors errors={form?.errors} />

      <PendingForm>
        {#snippet children(pending)}
          <div class="space-y-4">
            <FormField label="New Password" name="password" type="password" autocomplete="new-password" />

            <FormField label="Confirm Password" name="confirm_password" type="password" autocomplete="new-password" />

            <button type="submit" disabled={pending} class="btn-primary w-full">
              {pending ? 'Resetting…' : 'Reset Password'}
            </button>
          </div>
        {/snippet}
      </PendingForm>

      <p class="text-ab-gray mt-4 text-center text-sm">
        <a href="/login" class="text-ab-blue hover:text-ab-dark-blue transition-colors"> Back to login </a>
      </p>
    {/if}
  </div>
</div>
