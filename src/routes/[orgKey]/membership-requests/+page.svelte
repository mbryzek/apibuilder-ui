<script lang="ts">
  import { enhance } from '$app/forms';
  import type { Organization, MembershipRequest } from '$generated/com-bryzek-apibuilder';
  import type { ApiErrorItem } from '$lib/api/error-handler';

  interface Props {
    data: {
      org: Organization;
      requests: MembershipRequest[];
    };
    form: { errors?: ApiErrorItem[]; success?: boolean } | null;
  }

  let { data, form: formResult }: Props = $props();

  const org = $derived(data.org);
  const requests = $derived(data.requests);
  let isSubmitting = $state(false);
</script>

<svelte:head>
  <title>Membership Requests - {org.name} - API Builder</title>
</svelte:head>

<div>
  <h1 class="text-ab-dark-blue mb-6 text-2xl font-bold">Membership Requests</h1>

  {#if formResult?.errors}
    <div class="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
      {#each formResult.errors as err}
        <p class="text-sm text-red-800">{err.message}</p>
      {/each}
    </div>
  {/if}

  {#if requests.length === 0}
    <p class="text-ab-gray">No pending membership requests.</p>
  {:else}
    <div class="space-y-4">
      {#each requests as req (req.id)}
        <div class="card flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div class="text-ab-dark-blue font-medium">{req.user.nickname}</div>
            <div class="text-ab-gray text-sm">{req.user.email}</div>
            <div class="text-ab-gray text-sm">Requested role: <span class="font-medium">{req.role}</span></div>
          </div>
          <div class="flex gap-2">
            <form
              method="POST"
              action="?/accept"
              use:enhance={() => {
                isSubmitting = true;
                return async ({ update }) => {
                  isSubmitting = false;
                  await update();
                };
              }}
            >
              <input type="hidden" name="guid" value={req.id} />
              <button type="submit" class="btn-primary px-4 py-2 text-sm" disabled={isSubmitting}>Accept</button>
            </form>
            <form
              method="POST"
              action="?/decline"
              use:enhance={() => {
                isSubmitting = true;
                return async ({ update }) => {
                  isSubmitting = false;
                  await update();
                };
              }}
            >
              <input type="hidden" name="guid" value={req.id} />
              <button type="submit" class="btn-secondary px-4 py-2 text-sm" disabled={isSubmitting}>Decline</button>
            </form>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
