<script lang="ts">
  import type { Resource, Service } from '$generated/com-bryzek-apibuilder-spec';
  import OperationDetail from './OperationDetail.svelte';

  interface Props {
    resources: Resource[];
    service: Service;
  }

  let { resources, service }: Props = $props();
</script>

{#if resources.length > 0}
  <div class="space-y-8">
    {#each resources as resource}
      <div id={resource.type} class="scroll-mt-16">
        <div class="mb-3 flex items-center gap-2">
          <h3 class="text-ab-dark-blue text-lg font-bold">{resource.type}</h3>
        </div>
        {#if resource.description}
          <p class="text-ab-dark-gray mb-4 text-sm">{resource.description}</p>
        {/if}
        {#if resource.path}
          <p class="text-ab-gray mb-3 text-sm">Path: <code class="font-mono">{resource.path}</code></p>
        {/if}
        <div class="space-y-4">
          {#each resource.operations as operation}
            <OperationDetail {operation} {service} />
          {/each}
        </div>
      </div>
    {/each}
  </div>
{:else}
  <p class="text-ab-gray text-sm">No resources defined.</p>
{/if}
