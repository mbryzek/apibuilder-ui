<script lang="ts">
  import type { Field, Service } from '$generated/com-bryzek-apibuilder-spec';
  import TypeLink from './TypeLink.svelte';

  interface Props {
    fields: Field[];
    service: Service;
  }

  let { fields, service }: Props = $props();

  const hasDetails = $derived(
    fields.some(
      (f) =>
        f.description || (f.default !== undefined && f.default !== null) || f.minimum !== undefined || f.maximum !== undefined || f.example
    )
  );
</script>

{#if fields.length > 0}
  <div class="overflow-x-auto">
    <table class="w-full text-left text-sm">
      <thead>
        <tr class="border-b border-gray-200">
          <th class="text-ab-gray pr-6 pb-2 font-semibold">Field</th>
          <th class="text-ab-gray pr-6 pb-2 font-semibold">Type</th>
          {#if hasDetails}
            <th class="text-ab-gray pb-2 font-semibold">Description</th>
          {/if}
        </tr>
      </thead>
      <tbody>
        {#each fields as field}
          <tr class="border-b border-gray-100 last:border-b-0">
            <td class="py-2.5 pr-6 align-top">
              <span class="font-mono text-sm">{field.name}</span>
              {#if field.required}
                <span class="text-ab-success-green mt-0.5 block text-[11px] font-medium">required</span>
              {/if}
            </td>
            <td class="py-2.5 pr-6 align-top font-mono text-sm whitespace-nowrap">
              <TypeLink typeStr={field.type} {service} />
            </td>
            {#if hasDetails}
              <td class="text-ab-dark-gray py-2.5 align-top">
                {#if field.default !== undefined && field.default !== null}
                  <span class="text-ab-gray text-xs">default: {field.default}</span>
                  {#if field.description || field.minimum !== undefined || field.maximum !== undefined || field.example}
                    <span class="mx-0.5"></span>
                  {/if}
                {/if}
                {#if field.minimum !== undefined || field.maximum !== undefined}
                  <span class="text-ab-gray text-xs">
                    {#if field.minimum !== undefined}min: {field.minimum}{/if}{#if field.minimum !== undefined && field.maximum !== undefined},
                    {/if}{#if field.maximum !== undefined}max: {field.maximum}{/if}
                  </span>
                  {#if field.description || field.example}
                    <span class="mx-0.5"></span>
                  {/if}
                {/if}
                {#if field.description}
                  {field.description}
                {/if}
                {#if field.example}
                  <span class="text-ab-gray ml-1 text-xs">e.g. {field.example}</span>
                {/if}
              </td>
            {/if}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{/if}
