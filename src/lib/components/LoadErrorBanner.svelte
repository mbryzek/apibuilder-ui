<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import type { LoadError } from '$lib/api/load-error';

  interface Props {
    error: LoadError;
  }

  let { error }: Props = $props();

  let retrying = $state(false);

  async function retry(): Promise<void> {
    retrying = true;
    try {
      await invalidateAll();
    } finally {
      retrying = false;
    }
  }
</script>

<div role="alert" class="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
  <p class="text-sm text-red-800">{error.message}</p>
  <button
    type="button"
    onclick={retry}
    disabled={retrying}
    class="mt-2 text-sm font-semibold text-red-800 underline hover:no-underline disabled:cursor-not-allowed disabled:opacity-60"
  >
    {retrying ? 'Retrying...' : 'Try again'}
  </button>
</div>
