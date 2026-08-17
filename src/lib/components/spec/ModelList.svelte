<script lang="ts">
  import type { Model, Service } from '$generated/com-bryzek-apibuilder-spec';
  import ExampleJsonLinks from './ExampleJsonLinks.svelte';
  import PropertiesTable from './PropertiesTable.svelte';
  import SpecCard from './SpecCard.svelte';
  import SpecList from './SpecList.svelte';

  interface Props {
    models: Model[];
    service: Service;
    exampleBaseUrl?: string;
  }

  let { models, service, exampleBaseUrl }: Props = $props();
</script>

<SpecList items={models} key={(model) => model.name} noun="models">
  {#snippet item(model)}
    <SpecCard id={model.name} name={model.name} description={model.description}>
      {#snippet headerRight()}
        {#if exampleBaseUrl}
          <ExampleJsonLinks baseUrl={exampleBaseUrl} typeName={model.name} />
        {/if}
      {/snippet}
      {#if model.interfaces && model.interfaces.length > 0}
        <p class="text-ab-gray mb-2 text-xs">
          Implements: {model.interfaces.join(', ')}
        </p>
      {/if}
      <PropertiesTable rows={model.fields} {service} nameLabel="Field" />
    </SpecCard>
  {/snippet}
</SpecList>
