<script lang="ts">
  import type { Model, Service } from '$generated/com-bryzek-apibuilder-spec';
  import ExampleJsonLinks from './ExampleJsonLinks.svelte';
  import FieldsTable from './FieldsTable.svelte';

  interface Props {
    models: Model[];
    service: Service;
    exampleBaseUrl?: string;
  }

  let { models, service, exampleBaseUrl }: Props = $props();
</script>

{#if models.length > 0}
  <div class="space-y-6">
    {#each models as model}
      <div id={model.name} class="scroll-mt-16 overflow-hidden rounded-lg border border-gray-200">
        <div class="bg-ab-light-gray flex items-center justify-between gap-2 px-4 py-3">
          <div class="flex min-w-0 items-center gap-2">
            <h3 class="text-ab-dark-blue truncate font-mono text-base font-bold">{model.name}</h3>
          </div>
          {#if exampleBaseUrl}
            <ExampleJsonLinks baseUrl={exampleBaseUrl} typeName={model.name} />
          {/if}
        </div>
        <div class="px-4 py-3">
          {#if model.description}
            <p class="text-ab-dark-gray mb-3 text-sm">{model.description}</p>
          {/if}
          {#if model.interfaces && model.interfaces.length > 0}
            <p class="text-ab-gray mb-2 text-xs">
              Implements: {model.interfaces.join(', ')}
            </p>
          {/if}
          <FieldsTable fields={model.fields} {service} />
        </div>
      </div>
    {/each}
  </div>
{:else}
  <p class="text-ab-gray text-sm">No models defined.</p>
{/if}
