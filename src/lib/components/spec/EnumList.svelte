<script lang="ts">
  import type { Enum } from '$generated/com-bryzek-apibuilder-spec';
  import ExampleJsonLinks from './ExampleJsonLinks.svelte';

  interface Props {
    enums: Enum[];
    exampleBaseUrl?: string;
  }

  let { enums, exampleBaseUrl }: Props = $props();

  function hasAnyDescriptions(enumDef: Enum): boolean {
    return enumDef.values.some((v) => v.description);
  }
</script>

{#if enums.length > 0}
  <div class="space-y-6">
    {#each enums as enumDef}
      <div id={enumDef.name} class="scroll-mt-16 overflow-hidden rounded-lg border border-gray-200">
        <div class="bg-ab-light-gray flex items-center justify-between gap-2 px-4 py-3">
          <div class="flex min-w-0 items-center gap-2">
            <h3 class="text-ab-dark-blue truncate font-mono text-base font-bold">{enumDef.name}</h3>
          </div>
          {#if exampleBaseUrl}
            <ExampleJsonLinks baseUrl={exampleBaseUrl} typeName={enumDef.name} />
          {/if}
        </div>
        <div class="px-4 py-3">
          {#if enumDef.description}
            <p class="text-ab-dark-gray mb-3 text-sm">{enumDef.description}</p>
          {/if}
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead>
                <tr class="border-b border-gray-200">
                  <th class="text-ab-gray pr-6 pb-2 font-semibold">Value</th>
                  {#if hasAnyDescriptions(enumDef)}
                    <th class="text-ab-gray pb-2 font-semibold">Description</th>
                  {/if}
                </tr>
              </thead>
              <tbody>
                {#each enumDef.values as value}
                  <tr class="border-b border-gray-100 last:border-b-0">
                    <td class="py-2.5 pr-6 align-top font-mono text-sm">
                      {value.name}
                      {#if value.value && value.value !== value.name}
                        <span class="text-ab-gray ml-1 text-xs">({value.value})</span>
                      {/if}
                    </td>
                    {#if hasAnyDescriptions(enumDef)}
                      <td class="text-ab-dark-gray py-2.5 align-top">{value.description ?? ''}</td>
                    {/if}
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    {/each}
  </div>
{:else}
  <p class="text-ab-gray text-sm">No enums defined.</p>
{/if}
