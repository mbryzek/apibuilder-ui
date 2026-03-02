<script lang="ts">
	import type { Parameter, Service } from '$generated/types';
	import TypeLink from './TypeLink.svelte';
	import DeprecationBadge from './DeprecationBadge.svelte';

	interface Props {
		parameters: Parameter[];
		service: Service;
	}

	let { parameters, service }: Props = $props();
</script>

{#if parameters.length > 0}
	<div class="overflow-x-auto">
		<table class="w-full text-sm text-left">
			<thead>
				<tr class="border-b border-gray-200">
					<th class="pb-2 pr-4 font-semibold text-ab-gray">Name</th>
					<th class="pb-2 pr-4 font-semibold text-ab-gray">Type</th>
					<th class="pb-2 pr-4 font-semibold text-ab-gray hidden sm:table-cell">Location</th>
					<th class="pb-2 pr-4 font-semibold text-ab-gray hidden sm:table-cell">Required</th>
					<th class="pb-2 font-semibold text-ab-gray">Description</th>
				</tr>
			</thead>
			<tbody>
				{#each parameters as param}
					<tr class="border-b border-gray-100">
						<td class="py-2 pr-4 font-mono text-sm whitespace-nowrap">
							{param.name}
							{#if param.deprecation}
								<DeprecationBadge deprecation={param.deprecation} />
							{/if}
						</td>
						<td class="py-2 pr-4 font-mono text-sm whitespace-nowrap">
							<TypeLink typeStr={param.type} {service} />
						</td>
						<td class="py-2 pr-4 text-xs hidden sm:table-cell">
							<span class="inline-block px-1.5 py-0.5 rounded bg-gray-100 text-ab-dark-gray">{param.location}</span>
						</td>
						<td class="py-2 pr-4 hidden sm:table-cell">
							{#if param.required}
								<span class="text-ab-success-green">yes</span>
							{:else}
								<span class="text-ab-gray">no</span>
							{/if}
						</td>
						<td class="py-2 text-ab-dark-gray">
							{param.description ?? ''}
							{#if param.default}
								<span class="text-xs text-ab-gray ml-1">(default: {param.default})</span>
							{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}
