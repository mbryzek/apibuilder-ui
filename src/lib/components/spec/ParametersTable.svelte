<script lang="ts">
	import type { Parameter, Service } from '$generated/types';
	import TypeLink from './TypeLink.svelte';

	interface Props {
		parameters: Parameter[];
		service: Service;
	}

	let { parameters, service }: Props = $props();

	const hasDetails = $derived(parameters.some((p) => p.description || p.default || p.location));
</script>

{#if parameters.length > 0}
	<div class="overflow-x-auto">
		<table class="w-full text-sm text-left">
			<thead>
				<tr class="border-b border-gray-200">
					<th class="pb-2 pr-6 font-semibold text-ab-gray">Name</th>
					<th class="pb-2 pr-6 font-semibold text-ab-gray">Type</th>
					{#if hasDetails}
						<th class="pb-2 font-semibold text-ab-gray">Description</th>
					{/if}
				</tr>
			</thead>
			<tbody>
				{#each parameters as param}
					<tr class="border-b border-gray-100 last:border-b-0">
						<td class="py-2.5 pr-6 align-top">
							<span class="font-mono text-sm">{param.name}</span>
							{#if param.required}
								<span class="block text-[11px] text-ab-success-green font-medium mt-0.5">required</span>
							{/if}
						</td>
						<td class="py-2.5 pr-6 font-mono text-sm whitespace-nowrap align-top">
							<TypeLink typeStr={param.type} {service} />
						</td>
						{#if hasDetails}
							<td class="py-2.5 text-ab-dark-gray align-top">
								{#if param.location}
									<span class="inline-block px-1.5 py-0.5 rounded bg-gray-100 text-ab-dark-gray text-xs mr-1">{param.location}</span>
								{/if}
								{#if param.default}
									<span class="text-xs text-ab-gray">default: {param.default}</span>
								{/if}
								{#if param.description}
									{#if param.location || param.default}
										<span class="mx-0.5"></span>
									{/if}
									{param.description}
								{/if}
								{#if param.minimum !== undefined || param.maximum !== undefined}
									<span class="text-xs text-ab-gray ml-1">
										({#if param.minimum !== undefined}min: {param.minimum}{/if}{#if param.minimum !== undefined && param.maximum !== undefined}, {/if}{#if param.maximum !== undefined}max: {param.maximum}{/if})
									</span>
								{/if}
							</td>
						{/if}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}
