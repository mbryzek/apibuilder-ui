<script lang="ts">
  import Banner from '$lib/components/Banner.svelte';
  import type { ApiErrorItem } from '$lib/api/error-handler';

  /**
   * The errors a failed form action returned, rendered above the form. An empty or absent
   * list renders nothing, so a response carrying `errors: []` cannot produce an empty box.
   */
  interface Props {
    errors: ApiErrorItem[] | undefined;
  }

  let { errors }: Props = $props();
</script>

{#if errors && errors.length > 0}
  <Banner variant="error" role="alert" class="mb-6">
    {#each errors as error}
      <p class="text-sm">{error.message}</p>
    {/each}
  </Banner>
{/if}
