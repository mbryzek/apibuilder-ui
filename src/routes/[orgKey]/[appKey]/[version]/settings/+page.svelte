<script lang="ts">
  import PendingForm from '$lib/components/PendingForm.svelte';
  import type { Application } from '$generated/com-bryzek-apibuilder';
  import type { Service } from '$generated/com-bryzek-apibuilder-spec';
  import { Visibility } from '$generated/com-bryzek-apibuilder';
  import FormErrors from '$lib/components/FormErrors.svelte';
  import LoadErrorBanner from '$lib/components/LoadErrorBanner.svelte';
  import type { LoadError } from '$lib/api/load-error';

  interface Props {
    data: {
      isAdmin: boolean;
      service: Service;
      application: Application | null;
      applicationLoadError: LoadError | null;
    };
    form: {
      errors?: { message: string }[];
    } | null;
  }

  let { data, form }: Props = $props();

  const service = $derived(data.service);
  const application = $derived(data.application);
  let showDeleteConfirm = $state(false);
</script>

<svelte:head>
  <title>Settings - {service.name} - API Builder</title>
</svelte:head>

<div class="max-w-2xl space-y-8">
  <h2 class="text-ab-dark-blue text-xl font-bold">Application Settings</h2>

  <FormErrors errors={form?.errors} class="" />

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
      {#if data.applicationLoadError}
        <LoadErrorBanner error={data.applicationLoadError} />
      {:else if application}
        <PendingForm action="?/updateVisibility" class="space-y-4">
          {#snippet children(pending)}
            <div>
              <select name="visibility" class="input-field w-full" value={application.visibility}>
                {#each Object.values(Visibility) as v}
                  <option value={v}>{v}</option>
                {/each}
              </select>
            </div>
            <button type="submit" class="btn-primary" disabled={pending}>
              {pending ? 'Updating...' : 'Update Visibility'}
            </button>
          {/snippet}
        </PendingForm>
      {/if}
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
          <PendingForm action="?/deleteApp">
            {#snippet children(pending)}
              <button type="submit" class="btn-danger" disabled={pending}>
                {pending ? 'Deleting...' : 'Yes, Delete Application'}
              </button>
            {/snippet}
          </PendingForm>
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
