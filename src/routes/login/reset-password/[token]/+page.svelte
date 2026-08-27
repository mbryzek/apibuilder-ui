<script lang="ts">
  import { enhance } from '$app/forms';
  import FormErrors from '$lib/components/FormErrors.svelte';
  import type { ApiErrorItem } from '$lib/api/error-handler';

  interface Props {
    data: { token: string };
    form: { errors?: ApiErrorItem[] } | null;
  }

  let { form }: Props = $props();

  let isSubmitting = $state(false);
</script>

<svelte:head>
  <title>Reset Password - API Builder</title>
</svelte:head>

<div class="page-container">
  <div class="mx-auto mt-12 max-w-md">
    <h1 class="text-ab-dark-blue mb-8 text-center text-2xl font-bold">Set New Password</h1>

    <FormErrors errors={form?.errors} />

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
          <label for="password" class="text-ab-dark-blue mb-1 block text-sm font-medium">New Password</label>
          <input
            type="password"
            id="password"
            name="password"
            required
            autocomplete="new-password"
            class="input-field w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div>
          <label for="confirm_password" class="text-ab-dark-blue mb-1 block text-sm font-medium">Confirm Password</label>
          <input
            type="password"
            id="confirm_password"
            name="confirm_password"
            required
            autocomplete="new-password"
            class="input-field w-full rounded-lg border px-3 py-2"
          />
        </div>

        <button type="submit" disabled={isSubmitting} class="btn-primary w-full">
          {isSubmitting ? 'Resetting...' : 'Reset Password'}
        </button>
      </div>
    </form>

    <p class="text-ab-gray mt-4 text-center text-sm">
      <a href="/login" class="text-ab-blue hover:text-ab-dark-blue transition-colors"> Back to login </a>
    </p>
  </div>
</div>
