<script lang="ts">
  import type { Enum } from '$generated/com-bryzek-apibuilder-spec';
  import SpecCard from './SpecCard.svelte';
  import SpecList from './SpecList.svelte';
  import SpecTable from './SpecTable.svelte';

  interface Props {
    enums: Enum[];
    exampleBaseUrl?: string | undefined;
  }

  let { enums, exampleBaseUrl }: Props = $props();

  function hasAnyDescriptions(enumDef: Enum): boolean {
    return enumDef.values.some((v) => v.description);
  }
</script>

<SpecList items={enums} key={(enumDef) => enumDef.name} noun="enums">
  {#snippet item(enumDef)}
    {@const showDescriptions = hasAnyDescriptions(enumDef)}
    <SpecCard id={enumDef.name} name={enumDef.name} description={enumDef.description} {exampleBaseUrl}>
      <SpecTable columns={showDescriptions ? ['Value', 'Description'] : ['Value']}>
        {#each enumDef.values as value (value.name)}
          <tr class="border-b border-gray-100 last:border-b-0">
            <td class="py-2.5 pr-6 align-top font-mono text-sm">
              {value.name}
              {#if value.value && value.value !== value.name}
                <span class="text-ab-gray ml-1 text-xs">({value.value})</span>
              {/if}
            </td>
            {#if showDescriptions}
              <td class="text-ab-dark-gray py-2.5 align-top">{value.description ?? ''}</td>
            {/if}
          </tr>
        {/each}
      </SpecTable>
    </SpecCard>
  {/snippet}
</SpecList>
