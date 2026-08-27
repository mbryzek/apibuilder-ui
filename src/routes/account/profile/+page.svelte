<script lang="ts">
  import { enhance } from '$app/forms';
  import FormErrors from '$lib/components/FormErrors.svelte';
  import LoadErrorBanner from '$lib/components/LoadErrorBanner.svelte';
  import type { ApiErrorItem } from '$lib/api/error-handler';
  import type { LoadError } from '$lib/api/load-error';
  import type { User } from '$generated/com-bryzek-apibuilder';

  interface Props {
    data: { user: User | null; loadError: LoadError | null };
    form: { errors?: ApiErrorItem[] } | null;
  }

  let { data, form }: Props = $props();

  let isSubmitting = $state(false);

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
      <form
        method="POST"
        use:enhance={() => {
          isSubmitting = true;
          return async ({ update }) => {
            isSubmitting = false;
            await update();
          };
        }}
      >
        <div class="space-y-4">
          <div>
            <label for="email" class="text-ab-dark-blue mb-1 block text-sm font-medium">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={user.email}
              class="input-field w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div>
            <label for="nickname" class="text-ab-dark-blue mb-1 block text-sm font-medium">Nickname</label>
            <input
              type="text"
              id="nickname"
              name="nickname"
              required
              value={user.nickname}
              class="input-field w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div>
            <label for="name" class="text-ab-dark-blue mb-1 block text-sm font-medium">Name</label>
            <input type="text" id="name" name="name" value={user.name ?? ''} class="input-field w-full rounded-lg border px-3 py-2" />
          </div>

          <div class="flex gap-4 pt-4">
            <button type="submit" disabled={isSubmitting} class="btn-primary">
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
            <a href="/" class="btn-secondary inline-flex items-center"> Cancel </a>
          </div>
        </div>
      </form>
    {/if}
  </div>
</div>
