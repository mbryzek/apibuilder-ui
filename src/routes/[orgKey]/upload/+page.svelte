<script lang="ts">
  import { enhance } from '$app/forms';
  import FormErrors from '$lib/components/FormErrors.svelte';
  import type { Organization } from '$generated/com-bryzek-apibuilder';
  import { Visibility, OriginalType } from '$generated/com-bryzek-apibuilder';

  interface Props {
    data: {
      org: Organization;
      isMember: boolean;
    };
    form: {
      errors?: { message: string }[];
      appKey?: string;
      visibility?: string;
      specType?: string;
    } | null;
  }

  let { data, form }: Props = $props();

  const org = $derived(data.org);
  let isSubmitting = $state(false);
  let fileName = $state('');
</script>

<svelte:head>
  <title>Upload API - {org.name} - API Builder</title>
</svelte:head>

<div class="max-w-2xl">
  <h1 class="text-ab-dark-blue mb-6 text-2xl font-bold">Upload API Specification</h1>

  <FormErrors errors={form?.errors} />

  <form
    method="POST"
    enctype="multipart/form-data"
    use:enhance={() => {
      isSubmitting = true;
      return async ({ update }) => {
        isSubmitting = false;
        await update();
      };
    }}
    class="space-y-5"
  >
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

    <div>
      <label for="visibility" class="mb-1 block text-sm font-medium text-gray-700">Visibility</label>
      <select id="visibility" name="visibility" class="input-field w-full" value={form?.visibility ?? 'organization'}>
        {#each Object.values(Visibility) as v}
          <option value={v}>{v}</option>
        {/each}
      </select>
    </div>

    <div class="flex gap-3 pt-2">
      <button type="submit" class="btn-primary" disabled={isSubmitting}>
        {isSubmitting ? 'Uploading...' : 'Upload'}
      </button>
      <a href="/{org.key}" class="btn-secondary inline-block text-center">Cancel</a>
    </div>
  </form>
</div>
