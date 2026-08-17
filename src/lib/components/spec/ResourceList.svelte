<script lang="ts">
  import type { Resource, Service } from '$generated/com-bryzek-apibuilder-spec';
  import OperationDetail from './OperationDetail.svelte';
  import SpecList from './SpecList.svelte';

  interface Props {
    resources: Resource[];
    service: Service;
  }

  let { resources, service }: Props = $props();
</script>

<!-- A resource is a section heading over its operations, not a `SpecCard`: each operation is
     already a bordered block, and a border around a resource would box twenty of them. -->
<SpecList items={resources} key={(resource) => resource.type} noun="resources">
  {#snippet item(resource)}
    <div id={resource.type} class="scroll-mt-16">
      <h3 class="text-ab-dark-blue mb-3 text-lg font-bold">{resource.type}</h3>
      {#if resource.description}
        <p class="text-ab-dark-gray mb-4 text-sm">{resource.description}</p>
      {/if}
      {#if resource.path}
        <p class="text-ab-gray mb-3 text-sm">Path: <code class="font-mono">{resource.path}</code></p>
      {/if}
      <div class="space-y-4">
        {#each resource.operations as operation (`${operation.method} ${operation.path}`)}
          <OperationDetail {operation} {service} />
        {/each}
      </div>
    </div>
  {/snippet}
</SpecList>
