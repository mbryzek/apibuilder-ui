<script lang="ts">
  import type { Interface, Service } from '$generated/com-bryzek-apibuilder-spec';
  import FieldsTable from './FieldsTable.svelte';

  interface Props {
    interfaces: Interface[];
    service: Service;
  }

  let { interfaces, service }: Props = $props();
</script>

{#if interfaces.length > 0}
  <div class="space-y-6">
    {#each interfaces as iface}
      <div id={iface.name} class="scroll-mt-16 overflow-hidden rounded-lg border border-gray-200">
        <div class="bg-ab-light-gray flex items-center gap-2 px-4 py-3">
          <h3 class="text-ab-dark-blue truncate font-mono text-base font-bold">{iface.name}</h3>
        </div>
        <div class="px-4 py-3">
          {#if iface.description}
            <p class="text-ab-dark-gray mb-3 text-sm">{iface.description}</p>
          {/if}
          <FieldsTable fields={iface.fields} {service} />
        </div>
      </div>
    {/each}
  </div>
{:else}
  <p class="text-ab-gray text-sm">No interfaces defined.</p>
{/if}
