<script lang="ts">
  import PendingForm from '$lib/components/PendingForm.svelte';
  import type { Organization } from '$generated/com-bryzek-apibuilder';
  import { OriginalType } from '$generated/com-bryzek-apibuilder';
  import FormErrors from '$lib/components/FormErrors.svelte';

  interface Props {
    data: {
      org: Organization;
      isMember: boolean;
    };
    form: {
      errors?: { message: string }[];
      appKey?: string;
      specType?: string;
    } | null;
  }

  let { data, form }: Props = $props();

  const org = $derived(data.org);
  let fileName = $state('');
</script>

<svelte:head>
  <title>Upload API - {org.name} - API Builder</title>
</svelte:head>

<div class="max-w-2xl">
  <h1 class="text-ab-dark-blue mb-6 text-2xl font-bold">Upload API Specification</h1>

  <!--
    The action requires membership, so rendering the form to everyone offered a control the server
    was always going to refuse — a non-member filled in the whole thing, chose a file, and got a
    bare 403. Every sibling org write gates its page the same way.
  -->
  {#if !data.isMember}
    <div class="card">
      <p class="text-ab-gray text-sm">Only a member of this organization can upload a specification.</p>
    </div>
  {:else}
    <FormErrors errors={form?.errors} />

    <PendingForm enctype="multipart/form-data" class="space-y-5">
      {#snippet children(pending)}
        <div>
          <label for="file" class="mb-1 block text-sm font-medium text-gray-700">API Specification File</label>
          <div class="relative">
            <input
              type="file"
              id="file"
              name="file"
              accept=".json"
              required
              class="file:bg-ab-blue hover:file:bg-ab-light-blue block w-full text-sm text-gray-500 file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
              onchange={(e) => {
                const input = e.currentTarget as HTMLInputElement;
                fileName = input.files?.[0]?.name ?? '';
              }}
            />
          </div>
          {#if fileName}
            <p class="text-ab-gray mt-1 text-sm">Selected: {fileName}</p>
          {/if}
        </div>

        <div>
          <label for="spec_type" class="mb-1 block text-sm font-medium text-gray-700">Format</label>
          <select id="spec_type" name="spec_type" class="input-field w-full" value={form?.specType ?? ''}>
            {#each Object.values(OriginalType) as t}
              <option value={t}>{t}</option>
            {/each}
          </select>
        </div>

        <div>
          <label for="app_key" class="mb-1 block text-sm font-medium text-gray-700">
            Application Key
            <span class="text-ab-gray font-normal">(optional — derived from spec name if omitted)</span>
          </label>
          <input type="text" id="app_key" name="app_key" class="input-field w-full" placeholder="e.g. my-api" value={form?.appKey ?? ''} />
        </div>

        <div class="flex gap-3 pt-2">
          <button type="submit" class="btn-primary" disabled={pending}>
            {pending ? 'Uploading...' : 'Upload'}
          </button>
          <a href="/{org.key}" class="btn-secondary inline-block text-center">Cancel</a>
        </div>
      {/snippet}
    </PendingForm>
  {/if}
</div>
