<script lang="ts">
  import PendingForm from '$lib/components/PendingForm.svelte';
  import FormField from '$lib/components/FormField.svelte';
  import { Visibility } from '$generated/com-bryzek-apibuilder';
  import type { ApiErrorItem } from '$lib/api/error-handler';
  import FormErrors from '$lib/components/FormErrors.svelte';

  interface Props {
    form: { errors?: ApiErrorItem[] } | null;
  }

  let { form }: Props = $props();
</script>

<svelte:head>
  <title>Create Organization - API Builder</title>
</svelte:head>

<div class="page-container">
  <div class="mx-auto max-w-lg">
    <h1 class="text-ab-dark-blue mb-8 text-2xl font-bold">Create Organization</h1>

    <FormErrors errors={form?.errors} />

    <PendingForm>
      {#snippet children(pending)}
        <div class="space-y-4">
          <FormField label="Name" name="name" markRequired />

          <FormField label="Namespace" name="namespace" placeholder="e.g. com.example" markRequired />

          <FormField
            label="Key"
            name="key"
            placeholder="Auto-generated from name if left blank"
            hint="Used in URLs. Auto-generated if left blank."
          />

          <div>
            <label for="visibility" class="text-ab-dark-blue mb-1 block text-sm font-medium">Visibility</label>
            <select id="visibility" name="visibility" class="input-field w-full rounded-lg border px-3 py-2">
              {#each Object.values(Visibility) as v}
                <option value={v} selected={v === Visibility.Organization}>{v}</option>
              {/each}
            </select>
          </div>

          <div class="flex gap-4 pt-4">
            <button type="submit" disabled={pending} class="btn-primary">
              {pending ? 'Creating...' : 'Create Organization'}
            </button>
            <a href="/" class="btn-secondary inline-flex items-center"> Cancel </a>
          </div>
        </div>
      {/snippet}
    </PendingForm>
  </div>
</div>
