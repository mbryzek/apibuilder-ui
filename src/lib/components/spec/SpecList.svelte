<script lang="ts" generics="T">
  /**
   * A section of the spec view: every entity of one kind, or a line saying there are none.
   *
   * The empty message is here rather than at each call site so that "an empty list renders the
   * message" is structural — a section cannot acquire a second guard idiom, or drift on the
   * spacing between its entities, without changing this file.
   */

  import type { Snippet } from 'svelte';

  interface Props {
    items: T[];
    /** Stable identity for the keyed each — a type name, usually. */
    key: (item: T) => string;
    /** Plural noun for the empty line: `models` renders "No models defined." */
    noun: string;
    item: Snippet<[T]>;
  }

  let { items, key, noun, item }: Props = $props();
</script>

{#if items.length > 0}
  <div class="space-y-6">
    {#each items as entry (key(entry))}
      {@render item(entry)}
    {/each}
  </div>
{:else}
  <p class="text-ab-gray text-sm">No {noun} defined.</p>
{/if}
