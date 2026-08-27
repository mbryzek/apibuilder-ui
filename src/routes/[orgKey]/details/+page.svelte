<script lang="ts">
  import { enhance } from '$app/forms';
  import Banner from '$lib/components/Banner.svelte';
  import FormErrors from '$lib/components/FormErrors.svelte';
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
  let isSubmitting = $state(false);
  let showDeleteConfirm = $state(false);
</script>

<svelte:head>
  <title>Details - {org.name} - API Builder</title>
</svelte:head>

<div>
  <h1 class="text-ab-dark-blue mb-6 text-2xl font-bold">Organization Details</h1>

  <FormErrors errors={formResult?.errors} />

  {#if data.isAdmin}
    <form
      method="POST"
      action="?/update"
      use:enhance={() => {
        isSubmitting = true;
        return async ({ update }) => {
          isSubmitting = false;
          await update();
        };
      }}
    >
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
          <button type="submit" class="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </form>

    <div class="mt-12 border-t border-red-200 pt-8">
      <h2 class="mb-2 text-lg font-bold text-red-600">Danger Zone</h2>
      <p class="text-ab-gray mb-4 text-sm">Deleting an organization is permanent and cannot be undone.</p>

      {#if showDeleteConfirm}
        <Banner variant="error">
          <p class="mb-3 text-sm">Are you sure you want to delete <strong>{org.name}</strong>?</p>
          <div class="flex gap-3">
            <form
              method="POST"
              action="?/delete"
              use:enhance={() => {
                isSubmitting = true;
                return async ({ update }) => {
                  isSubmitting = false;
                  await update();
                };
              }}
            >
              <button type="submit" class="btn-danger" disabled={isSubmitting}>
                {isSubmitting ? 'Deleting...' : 'Yes, delete'}
              </button>
            </form>
            <button type="button" class="btn-secondary" onclick={() => (showDeleteConfirm = false)}>Cancel</button>
          </div>
        </Banner>
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
