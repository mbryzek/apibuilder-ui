<script lang="ts">
  import PendingForm from '$lib/components/PendingForm.svelte';
  import type { Organization } from '$generated/com-bryzek-apibuilder';
  import type { ApiErrorItem } from '$lib/api/error-handler';
  import type { LoadError } from '$lib/api/load-error';
  import LoadErrorBanner from '$lib/components/LoadErrorBanner.svelte';
  import FormErrors from '$lib/components/FormErrors.svelte';

  interface Props {
    data: {
      org: Organization;
      isMember: boolean;
      hasPendingRequest: boolean;
      loadError: LoadError | null;
    };
    form: { errors?: ApiErrorItem[]; success?: boolean } | null;
  }

  let { data, form: formResult }: Props = $props();

  const org = $derived(data.org);
</script>

<svelte:head>
  <title>Join {org.name} - API Builder</title>
</svelte:head>

<div>
  <h1 class="text-ab-dark-blue mb-6 text-2xl font-bold">Join {org.name}</h1>

  <FormErrors errors={formResult?.errors} />

  {#if data.loadError}
    <LoadErrorBanner error={data.loadError} />
  {:else if data.isMember}
    <div class="rounded-lg border border-green-200 bg-green-50 p-4">
      <p class="text-green-800">You are already a member of this organization.</p>
    </div>
  {:else if data.hasPendingRequest || formResult?.success}
    <div class="rounded-lg border border-blue-200 bg-blue-50 p-4">
      <p class="text-blue-800">Your membership request is pending review by an admin.</p>
    </div>
  {:else}
    <p class="text-ab-gray mb-4">Request to join <strong>{org.name}</strong> as a member.</p>
    <PendingForm>
      {#snippet children(pending)}
        <button type="submit" class="btn-primary" disabled={pending}>
          {pending ? 'Requesting...' : 'Request Membership'}
        </button>
      {/snippet}
    </PendingForm>
  {/if}
</div>
