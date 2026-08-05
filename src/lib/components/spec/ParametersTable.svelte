<script lang="ts">
  import type { Parameter, Service } from '$generated/com-bryzek-apibuilder-spec';
  import TypeLink from './TypeLink.svelte';

  interface Props {
    parameters: Parameter[];
    service: Service;
  }

  let { parameters, service }: Props = $props();
</script>

{#if parameters.length > 0}
  <div class="overflow-x-auto">
    <table class="w-full text-left text-sm">
      <thead>
        <tr class="border-b border-gray-200">
          <th class="text-ab-gray pr-6 pb-2 font-semibold">Name</th>
          <th class="text-ab-gray pr-6 pb-2 font-semibold">Type</th>
          <!-- `location` is a required field, so this column always has content. -->
          <th class="text-ab-gray pb-2 font-semibold">Description</th>
        </tr>
      </thead>
      <tbody>
        {#each parameters as param (param.name)}
          <tr class="border-b border-gray-100 last:border-b-0">
            <td class="py-2.5 pr-6 align-top">
              <span class="font-mono text-sm">{param.name}</span>
              {#if param.required}
                <span class="text-ab-success-green mt-0.5 block text-[11px] font-medium">required</span>
              {/if}
            </td>
            <td class="py-2.5 pr-6 align-top font-mono text-sm whitespace-nowrap">
              <TypeLink typeStr={param.type} {service} />
            </td>
            <td class="text-ab-dark-gray py-2.5 align-top">
              {#if param.location}
                <span class="text-ab-dark-gray mr-1 inline-block rounded bg-gray-100 px-1.5 py-0.5 text-xs">{param.location}</span>
              {/if}
              {#if param.default !== undefined && param.default !== null}
                <span class="text-ab-gray text-xs">default: {param.default}</span>
              {/if}
              {#if param.description}
                {#if param.location || param.default}
                  <span class="mx-0.5"></span>
                {/if}
                {param.description}
              {/if}
              {#if param.minimum !== undefined || param.maximum !== undefined}
                <span class="text-ab-gray ml-1 text-xs">
                  ({#if param.minimum !== undefined}min: {param.minimum}{/if}{#if param.minimum !== undefined && param.maximum !== undefined},
                  {/if}{#if param.maximum !== undefined}max: {param.maximum}{/if})
                </span>
              {/if}
              {#if param.example}
                <span class="text-ab-gray ml-1 text-xs">e.g. {param.example}</span>
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{/if}
