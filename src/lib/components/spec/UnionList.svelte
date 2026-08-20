<script lang="ts">
  import type { Union, Service, Variant, VariantType, VariantLiteral } from '$generated/com-bryzek-apibuilder-spec';
  import TypeLink from './TypeLink.svelte';
  import SpecCard from './SpecCard.svelte';
  import SpecList from './SpecList.svelte';
  import SpecTable from './SpecTable.svelte';

  interface Props {
    unions: Union[];
    service: Service;
    exampleBaseUrl?: string | undefined;
  }

  let { unions, service, exampleBaseUrl }: Props = $props();

  function isVariantLiteral(v: Variant): v is VariantLiteral {
    return 'literal' in v;
  }

  function isVariantType(v: Variant): v is VariantType {
    return 'type' in v;
  }

  function variantKey(v: Variant, index: number): string {
    if (isVariantLiteral(v)) return `literal:${v.literal}`;
    if (isVariantType(v)) return `type:${v.type}`;
    return `unknown:${index}`;
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

<SpecList items={unions} key={(union) => union.name} noun="unions">
  {#snippet item(union)}
    {@const showDetails = hasAnyDetails(union)}
    <SpecCard id={union.name} name={union.name} description={union.description} {exampleBaseUrl}>
      {#if union.discriminator}
        <p class="text-ab-gray mb-2 text-xs">
          Discriminator: <code class="font-mono">{union.discriminator.name}</code>
          {#if union.discriminator.enum}
            <span class="ml-1">enum: <TypeLink typeStr={union.discriminator.enum} {service} /></span>
          {/if}
        </p>
      {/if}
      {#if union.interfaces && union.interfaces.length > 0}
        <p class="text-ab-gray mb-2 text-xs">
          Implements: {union.interfaces.join(', ')}
        </p>
      {/if}
      <SpecTable columns={showDetails ? ['Type', 'Description'] : ['Type']}>
        <!-- Keyed on a TOTAL function of the variant. A variant that is neither kind has no `type`,
             so keying on `type:${variant.type}` gives every one of them the key "type:undefined" —
             and a second such variant trips Svelte's duplicate-key check instead of rendering the
             "unsupported variant" marker below, which exists precisely for that case. -->
        {#each union.variants as variant, i (variantKey(variant, i))}
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
              {:else}
                <!-- `Variant` is dispatched by duck-typing, so a third variant kind added to
                     the spec would render an empty cell and vanish from the docs with nothing
                     red anywhere. Say so instead. -->
                <span class="text-red-600">unsupported variant</span>
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
      </SpecTable>
    </SpecCard>
  {/snippet}
</SpecList>
