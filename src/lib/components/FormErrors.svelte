<script lang="ts">
  /**
   * FormErrors Component
   *
   * The errors a form action returned, above the form. Renders nothing when there are
   * none — including when the action returned an empty list, which several hand-rolled
   * copies of this box used to render as an empty red rectangle.
   */

  import type { ApiErrorItem } from '$lib/api/error-handler';
  import Banner from './Banner.svelte';

  interface Props {
    errors?: ApiErrorItem[] | undefined;
    /** Box-level classes the caller owns — margin, usually. */
    class?: string | undefined;
  }

  let { errors = [], class: className = 'mb-6' }: Props = $props();
</script>

{#if errors.length > 0}
  <Banner class={className}>
    {#each errors as error}
      <p class="text-sm">{error.message}</p>
    {/each}
  </Banner>
{/if}
