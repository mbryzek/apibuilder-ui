<script lang="ts">
  import type { Interface, Service } from '$generated/com-bryzek-apibuilder-spec';
  import PropertiesTable from './PropertiesTable.svelte';
  import SpecCard from './SpecCard.svelte';
  import SpecList from './SpecList.svelte';

  interface Props {
    interfaces: Interface[];
    service: Service;
  }

  let { interfaces, service }: Props = $props();
</script>

<SpecList items={interfaces} key={(iface) => iface.name} noun="interfaces">
  {#snippet item(iface)}
    <SpecCard id={iface.name} name={iface.name} description={iface.description}>
      {#if iface.type_parameters && iface.type_parameters.length > 0}
        <p class="text-ab-gray mb-2 text-xs">
          Type parameters: {iface.type_parameters.join(', ')}
        </p>
      {/if}
      <PropertiesTable rows={iface.fields} {service} nameLabel="Field" />
    </SpecCard>
  {/snippet}
</SpecList>
