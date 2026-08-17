<script lang="ts">
  /**
   * The named properties of a type: a model's or interface's fields, or an operation's parameters.
   *
   * These were two tables that had drifted into two spellings of one thing — the same name cell,
   * the same type cell, and a details cell whose parts were ordered and punctuated differently in
   * each. They are one table now, and `$lib/utils/spec-properties` decides what the details cell
   * says so that the decision is testable and made once.
   */

  import type { Service } from '$generated/com-bryzek-apibuilder-spec';
  import { anyPropertyDetails, propertyDetails, type PropertyRow } from '$lib/utils/spec-properties';
  import SpecTable from './SpecTable.svelte';
  import TypeLink from './TypeLink.svelte';

  interface Props {
    rows: PropertyRow[];
    service: Service;
    /** First column header — a model declares `Field`s, an operation takes parameters by `Name`. */
    nameLabel: string;
  }

  let { rows, service, nameLabel }: Props = $props();

  const showDetails = $derived(anyPropertyDetails(rows));
</script>

{#if rows.length > 0}
  <SpecTable columns={showDetails ? [nameLabel, 'Type', 'Description'] : [nameLabel, 'Type']}>
    {#each rows as row (row.name)}
      <tr class="border-b border-gray-100 last:border-b-0">
        <td class="py-2.5 pr-6 align-top">
          <span class="font-mono text-sm">{row.name}</span>
          {#if row.required}
            <span class="text-ab-success-green mt-0.5 block text-[11px] font-medium">required</span>
          {/if}
        </td>
        <td class="py-2.5 pr-6 align-top font-mono text-sm whitespace-nowrap">
          <TypeLink typeStr={row.type} {service} />
        </td>
        {#if showDetails}
          <td class="text-ab-dark-gray py-2.5 align-top">
            {#each propertyDetails(row) as detail, i (detail.kind)}
              {#if i > 0}<span class="mx-0.5"></span>{/if}
              {#if detail.kind === 'description'}{detail.text}{:else if detail.kind === 'location'}<span
                  class="spec-chip text-ab-dark-gray bg-gray-100">{detail.text}</span
                >{:else}<span class="text-ab-gray text-xs">{detail.text}</span>{/if}
            {/each}
          </td>
        {/if}
      </tr>
    {/each}
  </SpecTable>
{/if}
