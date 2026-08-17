<script lang="ts">
  import PendingForm from '$lib/components/PendingForm.svelte';
  import type { Organization } from '$generated/com-bryzek-apibuilder';
  import type { ApiErrorItem } from '$lib/api/error-handler';
  import { Visibility } from '$generated/com-bryzek-apibuilder';

  interface Props {
    data: {
      org: Organization;
      isAdmin: boolean;
    };
    form: { errors?: ApiErrorItem[] } | null;
  }

  let { data, form: formResult }: Props = $props();

  const org = $derived(data.org);
  let showDeleteConfirm = $state(false);
</script>

<svelte:head>
  <title>Details - {org.name} - API Builder</title>
</svelte:head>

<div>
  <h1 class="text-ab-dark-blue mb-6 text-2xl font-bold">Organization Details</h1>

  {#if formResult?.errors}
    <div class="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
      {#each formResult.errors as err}
        <p class="text-sm text-red-800">{err.message}</p>
      {/each}
    </div>
  {/if}

  {#if data.isAdmin}
    <PendingForm action="?/update">
      {#snippet children(pending)}
        <div class="max-w-lg space-y-4">
          <div>
            <label for="name" class="text-ab-dark-blue mb-1 block text-sm font-medium">Name</label>
            <input type="text" id="name" name="name" value={org.name} required class="input-field w-full rounded-lg border px-3 py-2" />
          </div>
          <div>
            <label for="key" class="text-ab-dark-blue mb-1 block text-sm font-medium">Key</label>
            <input type="text" id="key" name="key" value={org.key} class="input-field w-full rounded-lg border px-3 py-2" />
          </div>
          <div>
            <label for="namespace" class="text-ab-dark-blue mb-1 block text-sm font-medium">Namespace</label>
            <input
              type="text"
              id="namespace"
              name="namespace"
              value={org.namespace}
              required
              class="input-field w-full rounded-lg border px-3 py-2"
            />
          </div>
          <div>
            <label for="visibility" class="text-ab-dark-blue mb-1 block text-sm font-medium">Visibility</label>
            <select id="visibility" name="visibility" class="input-field w-full rounded-lg border px-3 py-2">
              {#each Object.values(Visibility) as v}
                <option value={v} selected={org.visibility === v}>{v}</option>
              {/each}
            </select>
          </div>
          <div>
            <button type="submit" class="btn-primary" disabled={pending}>
              {pending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      {/snippet}
    </PendingForm>

    <div class="mt-12 border-t border-red-200 pt-8">
      <h2 class="mb-2 text-lg font-bold text-red-600">Danger Zone</h2>
      <p class="text-ab-gray mb-4 text-sm">Deleting an organization is permanent and cannot be undone.</p>

      {#if showDeleteConfirm}
        <div class="rounded-lg border border-red-200 bg-red-50 p-4">
          <p class="mb-3 text-sm text-red-800">Are you sure you want to delete <strong>{org.name}</strong>?</p>
          <div class="flex gap-3">
            <PendingForm action="?/delete">
              {#snippet children(pending)}
                <button type="submit" class="btn-danger" disabled={pending}>
                  {pending ? 'Deleting...' : 'Yes, delete'}
                </button>
              {/snippet}
            </PendingForm>
            <button type="button" class="btn-secondary" onclick={() => (showDeleteConfirm = false)}>Cancel</button>
          </div>
        </div>
      {:else}
        <button type="button" class="btn-danger" onclick={() => (showDeleteConfirm = true)}>Delete Organization</button>
      {/if}
    </div>
  {:else}
    <dl class="max-w-lg space-y-4">
      <div>
        <dt class="text-ab-gray text-sm font-medium">Name</dt>
        <dd class="text-ab-dark-blue">{org.name}</dd>
      </div>
      <div>
        <dt class="text-ab-gray text-sm font-medium">Key</dt>
        <dd class="text-ab-dark-blue">{org.key}</dd>
      </div>
      <div>
        <dt class="text-ab-gray text-sm font-medium">Namespace</dt>
        <dd class="text-ab-dark-blue">{org.namespace}</dd>
      </div>
      <div>
        <dt class="text-ab-gray text-sm font-medium">Visibility</dt>
        <dd class="text-ab-dark-blue">{org.visibility}</dd>
      </div>
    </dl>
  {/if}
</div>
