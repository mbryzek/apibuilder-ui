<script lang="ts">
  import type { Response, Service } from '$generated/com-bryzek-apibuilder-spec';
  import TypeLink from './TypeLink.svelte';
  import { getStatusCode, getStatusColorClass } from './responseCode';

  interface Props {
    responses: Response[];
    service: Service;
  }

  let { responses, service }: Props = $props();
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
          {@const code = getStatusCode(resp)}
          <tr class="border-b border-gray-100">
            <td class="py-2 pr-4">
              <span class="inline-block rounded px-2 py-0.5 font-mono text-xs font-semibold {getStatusColorClass(code)}">{code}</span>
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
