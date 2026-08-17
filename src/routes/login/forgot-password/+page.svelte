<script lang="ts">
  import PendingForm from '$lib/components/PendingForm.svelte';

  interface Props {
    form: { success?: boolean; errors?: { message: string }[] } | null;
  }

  let { form }: Props = $props();

  const success = $derived(form?.success ?? false);
  const errors = $derived(form?.errors ?? []);
</script>

<svelte:head>
  <title>Forgot Password - API Builder</title>
</svelte:head>

<div class="page-container">
  <div class="mx-auto mt-12 max-w-md">
    <h1 class="text-ab-dark-blue mb-8 text-center text-2xl font-bold">Reset Your Password</h1>

    {#if success}
      <div class="mb-4 rounded-lg border border-green-200 bg-green-50 p-4">
        <p class="text-sm text-green-800">If an account exists with that email address, you will receive a password reset link shortly.</p>
      </div>
    {/if}

    {#if errors.length > 0}
      <div class="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
        {#each errors as error}
          <p class="text-sm text-red-800">{error.message}</p>
        {/each}
      </div>
    {/if}

    {#if !success}
      <PendingForm>
        {#snippet children(pending)}
          <div class="space-y-4">
            <div>
              <label for="email" class="text-ab-dark-blue mb-1 block text-sm font-medium">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                required
                autocomplete="email"
                class="input-field w-full rounded-lg border px-3 py-2"
              />
            </div>

            <button type="submit" disabled={pending} class="btn-primary w-full">
              {pending ? 'Sending...' : 'Send Reset Link'}
            </button>
          </div>
        {/snippet}
      </PendingForm>
    {/if}

    <p class="text-ab-gray mt-4 text-center text-sm">
      <a href="/login" class="text-ab-blue hover:text-ab-dark-blue transition-colors"> Back to login </a>
    </p>
  </div>
</div>
