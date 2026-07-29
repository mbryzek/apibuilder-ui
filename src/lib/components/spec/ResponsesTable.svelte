<script lang="ts">
  import type { Response, Service } from '$generated/com-bryzek-apibuilder-spec';
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
  <div class="overflow-x-auto">
    <table class="w-full text-left text-sm">
      <thead>
        <tr class="border-b border-gray-200">
          <th class="text-ab-gray pr-4 pb-2 font-semibold">Code</th>
          <th class="text-ab-gray pr-4 pb-2 font-semibold">Type</th>
          <th class="text-ab-gray pb-2 font-semibold">Description</th>
        </tr>
      </thead>
      <tbody>
        {#each responses as resp}
          <tr class="border-b border-gray-100">
            <td class="py-2 pr-4">
              <span class="inline-block rounded px-2 py-0.5 font-mono text-xs font-semibold {statusColorClass(resp.code)}">{resp.code}</span
              >
            </td>
            <td class="py-2 pr-4 font-mono text-sm">
              <TypeLink typeStr={resp.type} {service} />
            </td>
            <td class="text-ab-dark-gray py-2">{resp.description ?? ''}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{/if}
