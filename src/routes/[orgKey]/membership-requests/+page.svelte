<script lang="ts">
  import PendingForm from '$lib/components/PendingForm.svelte';
  import type { Organization, MembershipRequest } from '$generated/com-bryzek-apibuilder';
  import type { ApiErrorItem } from '$lib/api/error-handler';
  import type { LoadError } from '$lib/api/load-error';
  import LoadErrorBanner from '$lib/components/LoadErrorBanner.svelte';
  import FormErrors from '$lib/components/FormErrors.svelte';
  import Pagination from '$lib/components/Pagination.svelte';

  interface Props {
    data: {
      org: Organization;
      requests: MembershipRequest[];
      offset: number;
      limit: number;
      hasMore: boolean;
      loadError: LoadError | null;
    };
    form: { errors?: ApiErrorItem[]; success?: boolean } | null;
  }

  let { data, form: formResult }: Props = $props();

  const org = $derived(data.org);
  const requests = $derived(data.requests);
</script>

<svelte:head>
  <title>Membership Requests - {org.name} - API Builder</title>
</svelte:head>

<div>
  <h1 class="text-ab-dark-blue mb-6 text-2xl font-bold">Membership Requests</h1>

  {#if data.loadError}
    <LoadErrorBanner error={data.loadError} />
  {/if}

  <FormErrors errors={formResult?.errors} />

  {#if requests.length > 0}
    <div class="space-y-4">
      {#each requests as req (req.id)}
        <div class="card flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div class="text-ab-dark-blue font-medium">{req.user.nickname}</div>
            <div class="text-ab-gray text-sm">{req.user.email}</div>
            <div class="text-ab-gray text-sm">Requested role: <span class="font-medium">{req.role}</span></div>
          </div>
          <div class="flex gap-2">
            <PendingForm action="?/accept">
              {#snippet children(pending)}
                <input type="hidden" name="guid" value={req.id} />
                <button type="submit" class="btn-primary px-4 py-2 text-sm" disabled={pending}>Accept</button>
              {/snippet}
            </PendingForm>
            <PendingForm action="?/decline">
              {#snippet children(pending)}
                <input type="hidden" name="guid" value={req.id} />
                <button type="submit" class="btn-secondary px-4 py-2 text-sm" disabled={pending}>Decline</button>
              {/snippet}
            </PendingForm>
          </div>
        </div>
      {/each}
    </div>
  {:else if !data.loadError}
    <p class="text-ab-gray">No pending membership requests.</p>
  {/if}

  <Pagination offset={data.offset} limit={data.limit} hasMore={data.hasMore} baseUrl="/{org.key}/membership-requests" />
</div>
