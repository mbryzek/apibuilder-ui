<script lang="ts">
  import type { Union, Service, Variant, VariantType, VariantLiteral } from '$generated/com-bryzek-apibuilder-spec';
  import TypeLink from './TypeLink.svelte';
  import ExampleJsonLinks from './ExampleJsonLinks.svelte';

  interface Props {
    unions: Union[];
    service: Service;
    exampleBaseUrl?: string;
  }

  let { unions, service, exampleBaseUrl }: Props = $props();

  function isVariantLiteral(v: Variant): v is VariantLiteral {
    return 'literal' in v;
  }

  function isVariantType(v: Variant): v is VariantType {
    return 'type' in v;
  }

  function hasAnyDetails(union: Union): boolean {
    return union.variants.some((t) => {
      if (t.description) return true;
      if (isVariantType(t) && t.default) return true;
      if (isVariantLiteral(t) && t.aliases && t.aliases.length > 0) return true;
      return false;
    });
  }
</script>

{#if unions.length > 0}
  <div class="space-y-6">
    {#each unions as union}
      {@const showDetails = hasAnyDetails(union)}
      <div id={union.name} class="scroll-mt-16 overflow-hidden rounded-lg border border-gray-200">
        <div class="bg-ab-light-gray flex items-center justify-between gap-2 px-4 py-3">
          <div class="flex min-w-0 items-center gap-2">
            <h3 class="text-ab-dark-blue truncate font-mono text-base font-bold">{union.name}</h3>
          </div>
          {#if exampleBaseUrl}
            <ExampleJsonLinks baseUrl={exampleBaseUrl} typeName={union.name} />
          {/if}
        </div>
        <div class="px-4 py-3">
          {#if union.description}
            <p class="text-ab-dark-gray mb-3 text-sm">{union.description}</p>
          {/if}
          {#if union.discriminator}
            <p class="text-ab-gray mb-2 text-xs">Discriminator: <code class="font-mono">{union.discriminator}</code></p>
          {/if}
          {#if union.interfaces && union.interfaces.length > 0}
            <p class="text-ab-gray mb-2 text-xs">
              Implements: {union.interfaces.join(', ')}
            </p>
          {/if}
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead>
                <tr class="border-b border-gray-200">
                  <th class="text-ab-gray pr-6 pb-2 font-semibold">Type</th>
                  {#if showDetails}
                    <th class="text-ab-gray pb-2 font-semibold">Description</th>
                  {/if}
                </tr>
              </thead>
              <tbody>
                {#each union.variants as variant}
                  <tr class="border-b border-gray-100 last:border-b-0">
                    <td class="py-2.5 pr-6 align-top font-mono text-sm">
                      {#if isVariantLiteral(variant)}
                        <span class="text-green-700">"{variant.literal}"</span>
                        <span class="text-ab-gray ml-1 font-sans text-xs">literal</span>
                      {:else if isVariantType(variant)}
                        <TypeLink typeStr={variant.type} {service} />
                        {#if variant.discriminator_value}
                          <span class="text-ab-gray ml-1 text-xs">({variant.discriminator_value})</span>
                        {/if}
                      {/if}
                    </td>
                    {#if showDetails}
                      <td class="text-ab-dark-gray py-2.5 align-top">
                        {#if isVariantType(variant) && variant.default}
                          <span class="text-ab-gray text-xs">default</span>
                          {#if variant.description}
                            <span class="mx-0.5"></span>
                          {/if}
                        {/if}
                        {#if isVariantLiteral(variant) && variant.aliases && variant.aliases.length > 0}
                          <span class="text-ab-gray text-xs">aliases: {variant.aliases.join(', ')}</span>
                          {#if variant.description}
                            <span class="mx-0.5"></span>
                          {/if}
                        {/if}
                        {#if variant.description}
                          {variant.description}
                        {/if}
                      </td>
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
  <p class="text-ab-gray text-sm">No unions defined.</p>
{/if}
