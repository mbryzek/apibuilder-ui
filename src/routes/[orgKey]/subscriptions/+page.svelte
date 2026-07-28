<script lang="ts">
  import { enhance } from '$app/forms';
  import type { Organization, Subscription } from '$generated/com-bryzek-apibuilder';
  import { Publication } from '$generated/com-bryzek-apibuilder';
  import type { ApiErrorItem } from '$lib/api/error-handler';

  interface Props {
    data: {
      org: Organization;
      isAdmin: boolean;
      subscriptions: Subscription[];
    };
    form: { errors?: ApiErrorItem[]; success?: boolean } | null;
  }

  let { data, form: formResult }: Props = $props();

  const org = $derived(data.org);
  const subscriptions = $derived(data.subscriptions);
  let isSubmitting = $state(false);

  const publicationLabels: Record<string, string> = {
    [Publication.MembershipRequestsCreate]: 'New membership requests',
    [Publication.MembershipsCreate]: 'New members added',
    [Publication.ApplicationsCreate]: 'New applications created',
    [Publication.VersionsCreate]: 'New versions published',
    [Publication.VersionsMaterialChange]: 'Material version changes'
  };

  const adminOnlyPublications = new Set([Publication.MembershipRequestsCreate, Publication.MembershipsCreate]);

  const visiblePublications = $derived(Object.values(Publication).filter((p) => data.isAdmin || !adminOnlyPublications.has(p)));

  function getSubscriptionId(publication: string): string | undefined {
    return subscriptions.find((s) => s.publication === publication)?.id;
  }
</script>

<svelte:head>
  <title>Subscriptions - {org.name} - API Builder</title>
</svelte:head>

<div>
  <h1 class="text-ab-dark-blue mb-2 text-2xl font-bold">Subscriptions</h1>
  <p class="text-ab-gray mb-6 text-sm">Manage email notifications for this organization.</p>

  {#if formResult?.errors}
    <div class="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
      {#each formResult.errors as err}
        <p class="text-sm text-red-800">{err.message}</p>
      {/each}
    </div>
  {/if}

  <div class="space-y-3">
    {#each visiblePublications as publication (publication)}
      {@const subId = getSubscriptionId(publication)}
      {@const isSubscribed = !!subId}
      <div class="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3">
        <div>
          <div class="text-ab-dark-blue font-medium">{publicationLabels[publication] || publication}</div>
          <span
            class="mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium {isSubscribed
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-600'}"
          >
            {isSubscribed ? 'Subscribed' : 'Not subscribed'}
          </span>
        </div>
        <form
          method="POST"
          action="?/toggle"
          use:enhance={() => {
            isSubmitting = true;
            return async ({ update }) => {
              isSubmitting = false;
              await update();
            };
          }}
        >
          <input type="hidden" name="publication" value={publication} />
          {#if subId}
            <input type="hidden" name="subscription_id" value={subId} />
          {/if}
          <button type="submit" class="{isSubscribed ? 'btn-secondary' : 'btn-primary'} px-4 py-2 text-sm" disabled={isSubmitting}>
            {isSubscribed ? 'Unsubscribe' : 'Subscribe'}
          </button>
        </form>
      </div>
    {/each}
  </div>
</div>
