<script lang="ts">
  import PendingForm from '$lib/components/PendingForm.svelte';
  import FormField from '$lib/components/FormField.svelte';
  import LoadErrorBanner from '$lib/components/LoadErrorBanner.svelte';
  import type { ApiErrorItem } from '$lib/api/error-handler';
  import type { LoadError } from '$lib/api/load-error';
  import type { User } from '$generated/com-bryzek-apibuilder';
  import FormErrors from '$lib/components/FormErrors.svelte';

  interface Props {
    data: { user: User | null; loadError: LoadError | null };
    form: { errors?: ApiErrorItem[]; email?: string; nickname?: string; name?: string } | null;
  }

  let { data, form }: Props = $props();

  const user = $derived(data.user);
</script>

<svelte:head>
  <title>Edit Profile - API Builder</title>
</svelte:head>

<div class="page-container">
  <div class="mx-auto max-w-lg">
    <h1 class="text-ab-dark-blue mb-8 text-2xl font-bold">Edit Profile</h1>

    {#if data.loadError}
      <LoadErrorBanner error={data.loadError} />
    {/if}

    <FormErrors errors={form?.errors} />

    {#if user}
      <PendingForm>
        {#snippet children(pending)}
          <div class="space-y-4">
            <FormField label="Email" name="email" value={form?.email ?? user.email} inputmode="email" autocomplete="email" />

            <FormField label="Nickname" name="nickname" value={form?.nickname ?? user.nickname} />

            <FormField label="Name" name="name" value={form?.name ?? user.name ?? ''} />

            <div class="flex gap-4 pt-4">
              <button type="submit" disabled={pending} class="btn-primary">
                {pending ? 'Saving...' : 'Save'}
              </button>
              <a href="/" class="btn-secondary inline-flex items-center"> Cancel </a>
            </div>
          </div>
        {/snippet}
      </PendingForm>
    {/if}
  </div>
</div>
