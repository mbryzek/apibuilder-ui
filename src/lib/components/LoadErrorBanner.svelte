<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import Banner from '$lib/components/Banner.svelte';
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

<Banner variant="error" role="alert" class="mb-6">
  <p class="text-sm">{error.message}</p>
  <button
    type="button"
    onclick={retry}
    disabled={retrying}
    class="mt-2 text-sm font-semibold underline hover:no-underline disabled:cursor-not-allowed disabled:opacity-60"
  >
    {retrying ? 'Retrying...' : 'Try again'}
  </button>
</Banner>
