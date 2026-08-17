<script lang="ts">
  import PendingForm from '$lib/components/PendingForm.svelte';
  import type { Organization, Subscription } from '$generated/com-bryzek-apibuilder';
  import { Publication } from '$generated/com-bryzek-apibuilder';
  import type { ApiErrorItem } from '$lib/api/error-handler';
  import type { LoadError } from '$lib/api/load-error';
  import LoadErrorBanner from '$lib/components/LoadErrorBanner.svelte';

  interface Props {
    data: {
      org: Organization;
      isAdmin: boolean;
      subscriptions: Subscription[];
      loadError: LoadError | null;
    };
    form: { errors?: ApiErrorItem[]; success?: boolean } | null;
  }

  let { data, form: formResult }: Props = $props();

  const org = $derived(data.org);
  const subscriptions = $derived(data.subscriptions);

  const publicationLabels: Record<string, string> = {
    [Publication.MembershipRequestsCreate]: 'New membership requests',
    [Publication.MembershipsCreate]: 'New members added',
    [Publication.ApplicationsCreate]: 'New applications created',
    [Publication.VersionsCreate]: 'New versions published',
    [Publication.VersionsMaterialChange]: 'Material version changes'
  };

  const adminOnlyPublications = new Set([Publication.MembershipRequestsCreate, Publication.MembershipsCreate]);

  const visiblePublications = $derived(Object.values(Publication).filter((p) => data.isAdmin || !adminOnlyPublications.has(p)));

  // Only whether the caller is subscribed — the id is deliberately not sent to the server, which
  // resolves the subscription itself from the org and publication. See `+page.server.ts`.
  function isSubscribedTo(publication: string): boolean {
    return subscriptions.some((s) => s.publication === publication);
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

  <!-- With no subscription list every row would read "Not subscribed", and subscribing
       again would file a duplicate. Say so instead of guessing. -->
  {#if data.loadError}
    <LoadErrorBanner error={data.loadError} />
  {:else}
    <div class="space-y-3">
      {#each visiblePublications as publication (publication)}
        {@const isSubscribed = isSubscribedTo(publication)}
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
          <PendingForm action="?/toggle">
            {#snippet children(pending)}
              <input type="hidden" name="publication" value={publication} />
              <button type="submit" class="{isSubscribed ? 'btn-secondary' : 'btn-primary'} px-4 py-2 text-sm" disabled={pending}>
                {isSubscribed ? 'Unsubscribe' : 'Subscribe'}
              </button>
            {/snippet}
          </PendingForm>
        </div>
      {/each}
    </div>
  {/if}
</div>
