<script lang="ts">
  import { enhance } from '$app/forms';
  import FormErrors from '$lib/components/FormErrors.svelte';
  import type { Organization } from '$generated/com-bryzek-apibuilder';
  import type { Service } from '$generated/com-bryzek-apibuilder-spec';
  import { Visibility } from '$generated/com-bryzek-apibuilder';

  interface Props {
    data: {
      org: Organization;
      isAdmin: boolean;
      service: Service;
    };
    form: {
      errors?: { message: string }[];
    } | null;
  }

  let { data, form }: Props = $props();

  const service = $derived(data.service);

  let isDeleting = $state(false);
  let showDeleteConfirm = $state(false);
</script>

<svelte:head>
  <title>Settings - {service.name} - API Builder</title>
</svelte:head>

<div class="max-w-2xl space-y-8">
  <h2 class="text-ab-dark-blue text-xl font-bold">Application Settings</h2>

  <FormErrors errors={form?.errors} />

  <!-- Visibility -->
  <!--
    Both forms on this page post to actions that require `requireAdminForAction`, so rendering
    them to everyone offered controls the server was always going to refuse. Every sibling
    org-admin page already gates this way (`details`, `domains`, `members`); this page declared
    `isMember` in its props and then never read it, so the check was clearly intended and dropped.
  -->
  {#if data.isAdmin}
    <div class="card">
      <h3 class="text-ab-dark-blue mb-4 text-lg font-semibold">Visibility</h3>
      <form method="POST" action="?/updateVisibility" use:enhance class="space-y-4">
        <input type="hidden" name="name" value={service.name} />
        <div>
          <select name="visibility" class="input-field w-full" value={data.org.visibility}>
            {#each Object.values(Visibility) as v}
              <option value={v}>{v}</option>
            {/each}
          </select>
        </div>
        <button type="submit" class="btn-primary">Update Visibility</button>
      </form>
    </div>

    <!-- Delete -->
    <div class="card border border-red-200">
      <h3 class="mb-4 text-lg font-semibold text-red-700">Danger Zone</h3>

      {#if !showDeleteConfirm}
        <p class="text-ab-gray mb-4 text-sm">Permanently delete this application and all its versions. This cannot be undone.</p>
        <button class="btn-danger" onclick={() => (showDeleteConfirm = true)}> Delete Application </button>
      {:else}
        <p class="mb-4 text-sm font-medium text-red-700">
          Are you sure you want to delete <strong>{service.name}</strong>? This action cannot be undone.
        </p>
        <div class="flex gap-3">
          <form
            method="POST"
            action="?/deleteApp"
            use:enhance={() => {
              isDeleting = true;
              return async ({ update }) => {
                isDeleting = false;
                await update();
              };
            }}
          >
            <button type="submit" class="btn-danger" disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Yes, Delete Application'}
            </button>
          </form>
          <button class="btn-secondary" onclick={() => (showDeleteConfirm = false)}> Cancel </button>
        </div>
      {/if}
    </div>
  {:else}
    <div class="card">
      <p class="text-ab-gray text-sm">Only an administrator of this organization can change these settings.</p>
    </div>
  {/if}
</div>
