<script lang="ts">
  import PendingForm from '$lib/components/PendingForm.svelte';
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
          <div>
            <label for="name" class="text-ab-dark-blue mb-1 block text-sm font-medium">Name <span class="text-ab-error-red">*</span></label>
            <input type="text" id="name" name="name" required class="input-field w-full rounded-lg border px-3 py-2" />
          </div>

          <div>
            <label for="namespace" class="text-ab-dark-blue mb-1 block text-sm font-medium"
              >Namespace <span class="text-ab-error-red">*</span></label
            >
            <input
              type="text"
              id="namespace"
              name="namespace"
              required
              placeholder="e.g. com.example"
              class="input-field w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div>
            <label for="key" class="text-ab-dark-blue mb-1 block text-sm font-medium">Key</label>
            <input
              type="text"
              id="key"
              name="key"
              placeholder="Auto-generated from name if left blank"
              class="input-field w-full rounded-lg border px-3 py-2"
            />
            <p class="text-ab-gray mt-1 text-xs">Used in URLs. Auto-generated if left blank.</p>
          </div>

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
