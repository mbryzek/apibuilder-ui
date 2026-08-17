<script lang="ts">
  import type { Response, Service } from '$generated/com-bryzek-apibuilder-spec';
  import SpecTable from './SpecTable.svelte';
  import TypeLink from './TypeLink.svelte';

  interface Props {
    responses: Response[];
    service: Service;
  }

  let { responses, service }: Props = $props();

  // `Response.code` is an integer in the apibuilder spec, so the status class is a plain
  // range check on the number the API sends.
  function statusColorClass(code: number): string {
    if (code < 200) return 'bg-gray-100 text-gray-800';
    if (code < 300) return 'bg-green-100 text-green-800';
    if (code < 400) return 'bg-blue-100 text-blue-800';
    if (code < 500) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  }
</script>

{#if responses.length > 0}
  <!-- No hidden column here: every response has a code and a type, and a response without a
       description still renders the cell. -->
  <SpecTable columns={['Code', 'Type', 'Description']}>
    {#each responses as resp (resp.code)}
      <tr class="border-b border-gray-100 last:border-b-0">
        <td class="py-2.5 pr-6 align-top">
          <span class="spec-chip font-semibold {statusColorClass(resp.code)}">{resp.code}</span>
        </td>
        <td class="py-2.5 pr-6 align-top font-mono text-sm whitespace-nowrap">
          <TypeLink typeStr={resp.type} {service} />
        </td>
        <td class="text-ab-dark-gray py-2.5 align-top">{resp.description ?? ''}</td>
      </tr>
    {/each}
  </SpecTable>
{/if}
