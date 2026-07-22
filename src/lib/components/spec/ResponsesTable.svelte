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
    <table class="w-full text-sm text-left">
      <thead>
        <tr class="border-b border-gray-200">
          <th class="pb-2 pr-4 font-semibold text-ab-gray">Code</th>
          <th class="pb-2 pr-4 font-semibold text-ab-gray">Type</th>
          <th class="pb-2 font-semibold text-ab-gray">Description</th>
        </tr>
      </thead>
      <tbody>
        {#each responses as resp}
          {@const code = getStatusCode(resp)}
          <tr class="border-b border-gray-100">
            <td class="py-2 pr-4">
              <span class="inline-block px-2 py-0.5 rounded text-xs font-mono font-semibold {getStatusColorClass(code)}">{code}</span>
            </td>
            <td class="py-2 pr-4 font-mono text-sm">
              <TypeLink typeStr={resp.type} {service} />
            </td>
            <td class="py-2 text-ab-dark-gray">{resp.description ?? ''}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{/if}
