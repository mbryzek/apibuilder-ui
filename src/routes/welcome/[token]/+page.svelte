<script lang="ts">
  /**
   * The invited user's first password.
   *
   * Three states, and only one of them is a form: `ready` takes the password, `invalid` is a token
   * the platform does not hold, `unavailable` is our side failing while the invitation is still good.
   */
  import PendingForm from '#lib/components/PendingForm.svelte';
  import FormField from '#lib/components/FormField.svelte';
  import FormErrors from '#lib/components/FormErrors.svelte';
  import type { ApiErrorItem } from '#lib/api/error-handler.ts';
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
    form: { errors?: ApiErrorItem[]; linkInvalid?: boolean } | null;
  }

  let { data, form }: Props = $props();

  // The activation can die between the load and the submit, so the dead-link state is reachable from either side.
  let linkInvalid = $derived(data.outcome.kind === 'invalid' || form?.linkInvalid === true);

  let name = $derived(data.outcome.kind === 'ready' ? data.outcome.name : undefined);
  let email = $derived(data.outcome.kind === 'ready' ? data.outcome.email : undefined);

  let heading = $derived(
    linkInvalid ? 'This link is no longer valid' : data.outcome.kind === 'ready' ? 'Set your password' : 'We could not open your invitation'
  );
</script>

<svelte:head>
  <title>{heading} - API Builder</title>
</svelte:head>

<div class="page-container">
  <div class="mx-auto mt-12 max-w-md" data-testid="account-activation-{linkInvalid ? 'invalid' : data.outcome.kind}">
    <h1 class="text-ab-dark-blue mb-8 text-center text-2xl font-bold">{heading}</h1>

    {#if linkInvalid}
      <p class="text-ab-gray mb-6 text-center">
        This invitation has already been used or has expired. If you have already set a password, sign in. Otherwise request a password
        reset and we will email you a new link.
      </p>
      <div class="space-y-3">
        <a href="/login/forgot-password" class="btn-primary block w-full text-center">Email Me a New Link</a>
        <a href="/login" class="btn-secondary block w-full text-center">Sign In</a>
      </div>
    {:else if data.outcome.kind === 'unavailable'}
      <p class="text-ab-gray mb-6 text-center">
        Something went wrong on our end. Your invitation is still good. Try again in a few minutes.
      </p>
      <a href={data.retryUrl} class="btn-primary block w-full text-center" data-sveltekit-reload>Try Again</a>
    {:else}
      <p class="text-ab-gray mb-6 text-center">
        {#if name}Welcome, {name}.
        {/if}Choose a password to finish setting up{#if email}
          <span class="font-medium">{email}</span>{/if}.
      </p>

      <FormErrors errors={form?.errors} />

      <PendingForm>
        {#snippet children(pending)}
          <div class="space-y-4">
            <FormField label="Password" name="password" type="password" autocomplete="new-password" />

            <FormField label="Confirm Password" name="confirm_password" type="password" autocomplete="new-password" />

            <button type="submit" disabled={pending} class="btn-primary w-full">
              {pending ? 'Setting password...' : 'Set Password'}
            </button>
          </div>
        {/snippet}
      </PendingForm>
    {/if}
  </div>
</div>
