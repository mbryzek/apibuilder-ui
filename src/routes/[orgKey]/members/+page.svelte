<script lang="ts">
  import PendingForm from '$lib/components/PendingForm.svelte';
  import type { Organization, Membership } from '$generated/com-bryzek-apibuilder';
  import { MembershipRole } from '$generated/com-bryzek-apibuilder';
  import type { ApiErrorItem } from '$lib/api/error-handler';
  import type { LoadError } from '$lib/api/load-error';
  import LoadErrorBanner from '$lib/components/LoadErrorBanner.svelte';
  import Pagination from '$lib/components/Pagination.svelte';
  import FormErrors from '$lib/components/FormErrors.svelte';

  interface Props {
    data: {
      org: Organization;
      isAdmin: boolean;
      memberships: Membership[];
      offset: number;
      limit: number;
      hasMore: boolean;
      pendingRequestsCount: number;
      pendingRequestsCapped: boolean;
      loadError: LoadError | null;
    };
    form: { errors?: ApiErrorItem[]; success?: boolean } | null;
  }

  let { data, form: formResult }: Props = $props();

  const org = $derived(data.org);
  const memberships = $derived(data.memberships);
  let confirmRemoveId = $state<string | null>(null);
</script>

<svelte:head>
  <title>Members - {org.name} - API Builder</title>
</svelte:head>

<div>
  <div class="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
    <h1 class="text-ab-dark-blue text-2xl font-bold">Members</h1>
    {#if data.isAdmin && data.pendingRequestsCount > 0}
      <a href="/{org.key}/membership-requests" class="btn-secondary mt-3 inline-block text-center sm:mt-0">
        Pending Requests ({data.pendingRequestsCount}{data.pendingRequestsCapped ? '+' : ''})
      </a>
    {/if}
  </div>

  {#if data.loadError}
    <LoadErrorBanner error={data.loadError} />
  {/if}

  <FormErrors errors={formResult?.errors} />

  {#if data.isAdmin}
    <div class="card mb-6">
      <h2 class="text-ab-dark-blue mb-3 text-lg font-semibold">Add Member</h2>
      <PendingForm action="?/addMember" class="flex flex-col gap-3 sm:flex-row">
        {#snippet children(pending)}
          <input
            type="text"
            name="email_or_nickname"
            placeholder="Email or nickname"
            required
            class="input-field flex-1 rounded-lg border px-3 py-2"
          />
          <select name="role" class="input-field rounded-lg border px-3 py-2">
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
          <button type="submit" class="btn-primary" disabled={pending}>
            {pending ? 'Adding...' : 'Add'}
          </button>
        {/snippet}
      </PendingForm>
    </div>
  {/if}

  {#if memberships.length > 0}
    <div class="overflow-x-auto">
      <table class="w-full text-left">
        <thead>
          <tr class="border-b border-gray-200">
            <th class="text-ab-gray pb-3 text-sm font-semibold">User</th>
            <th class="text-ab-gray pb-3 text-sm font-semibold">Role</th>
            {#if data.isAdmin}
              <th class="text-ab-gray pb-3 text-right text-sm font-semibold">Actions</th>
            {/if}
          </tr>
        </thead>
        <tbody>
          {#each memberships as membership (membership.id)}
            <tr class="border-b border-gray-100">
              <td class="py-3">
                <div class="text-ab-dark-blue font-medium">{membership.user.nickname}</div>
                <div class="text-ab-gray text-sm">{membership.user.email}</div>
                {#if membership.user.name}
                  <div class="text-ab-gray text-sm">{membership.user.name}</div>
                {/if}
              </td>
              <td class="py-3">
                <span
                  class="inline-block rounded-full px-2 py-0.5 text-xs font-medium {membership.role === MembershipRole.Admin
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-blue-100 text-blue-800'}"
                >
                  {membership.role}
                </span>
              </td>
              {#if data.isAdmin}
                <td class="py-3 text-right">
                  <div class="flex justify-end gap-2">
                    {#if membership.role === MembershipRole.Admin}
                      <PendingForm action="?/revokeAdmin">
                        {#snippet children(pending)}
                          <input type="hidden" name="guid" value={membership.id} />
                          <button type="submit" class="text-ab-blue hover:text-ab-dark-blue text-sm" disabled={pending}>
                            Revoke Admin
                          </button>
                        {/snippet}
                      </PendingForm>
                    {:else}
                      <PendingForm action="?/makeAdmin">
                        {#snippet children(pending)}
                          <input type="hidden" name="guid" value={membership.id} />
                          <button type="submit" class="text-ab-blue hover:text-ab-dark-blue text-sm" disabled={pending}>
                            Make Admin
                          </button>
                        {/snippet}
                      </PendingForm>
                    {/if}

                    {#if confirmRemoveId === membership.id}
                      <PendingForm action="?/removeMember" onSettled={() => (confirmRemoveId = null)}>
                        {#snippet children(pending)}
                          <input type="hidden" name="guid" value={membership.id} />
                          <button type="submit" class="text-sm font-semibold text-red-600 hover:text-red-800" disabled={pending}>
                            Confirm Remove
                          </button>
                        {/snippet}
                      </PendingForm>
                      <button type="button" class="text-ab-gray hover:text-ab-dark-blue text-sm" onclick={() => (confirmRemoveId = null)}>
                        Cancel
                      </button>
                    {:else}
                      <button
                        type="button"
                        class="text-sm text-red-600 hover:text-red-800"
                        onclick={() => (confirmRemoveId = membership.id)}
                      >
                        Remove
                      </button>
                    {/if}
                  </div>
                </td>
              {/if}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {:else if !data.loadError}
    <p class="text-ab-gray">No members found.</p>
  {/if}

  <!-- Outside the list guard on purpose: an empty page still needs its Previous link. -->
  <Pagination offset={data.offset} limit={data.limit} hasMore={data.hasMore} baseUrl="/{org.key}/members" />
</div>
