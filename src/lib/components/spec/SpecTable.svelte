<script lang="ts">
  /**
   * The one definition of a detail table in the spec view — fields, parameters, responses, enum
   * values and union variants are all this table with different rows.
   *
   * The header is data rather than markup because most of these tables drop their last column when
   * no row would fill it. Omitting a label from `columns` is that decision, expressed beside the
   * `{#if}` on the matching cell rather than as a second `<th>` guarded separately.
   */

  import type { Snippet } from 'svelte';

  interface Props {
    /** Header labels, in order. */
    columns: string[];
    /** The `<tbody>` rows. */
    children: Snippet;
  }

  let { columns, children }: Props = $props();
</script>

<div class="overflow-x-auto">
  <table class="w-full text-left text-sm">
    <thead>
      <tr class="border-b border-gray-200">
        {#each columns as column, i}
          <th class="text-ab-gray pb-2 font-semibold{i < columns.length - 1 ? ' pr-6' : ''}">{column}</th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {@render children()}
    </tbody>
  </table>
</div>
