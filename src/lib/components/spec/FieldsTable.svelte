<script lang="ts">
	import type { Field, Service } from '$generated/types';
	import TypeLink from './TypeLink.svelte';
	import DeprecationBadge from './DeprecationBadge.svelte';

	interface Props {
		fields: Field[];
		service: Service;
	}

	let { fields, service }: Props = $props();
</script>

{#if fields.length > 0}
	<div class="overflow-x-auto">
		<table class="w-full text-sm text-left">
			<thead>
				<tr class="border-b border-gray-200">
					<th class="pb-2 pr-4 font-semibold text-ab-gray">Field</th>
					<th class="pb-2 pr-4 font-semibold text-ab-gray">Type</th>
					<th class="pb-2 pr-4 font-semibold text-ab-gray hidden sm:table-cell">Required</th>
					<th class="pb-2 pr-4 font-semibold text-ab-gray hidden md:table-cell">Default</th>
					<th class="pb-2 font-semibold text-ab-gray">Description</th>
				</tr>
			</thead>
			<tbody>
				{#each fields as field}
					<tr class="border-b border-gray-100">
						<td class="py-2 pr-4 font-mono text-sm whitespace-nowrap">
							{field.name}
							{#if field.deprecation}
								<DeprecationBadge deprecation={field.deprecation} />
							{/if}
						</td>
						<td class="py-2 pr-4 font-mono text-sm whitespace-nowrap">
							<TypeLink typeStr={field.type} {service} />
						</td>
						<td class="py-2 pr-4 hidden sm:table-cell">
							{#if field.required}
								<span class="text-ab-success-green">yes</span>
							{:else}
								<span class="text-ab-gray">no</span>
							{/if}
						</td>
						<td class="py-2 pr-4 font-mono text-xs hidden md:table-cell">
							{#if field.default}
								{field.default}
							{:else}
								<span class="text-gray-300">-</span>
							{/if}
						</td>
						<td class="py-2 text-ab-dark-gray">
							{field.description ?? ''}
							{#if field.minimum !== undefined || field.maximum !== undefined}
								<span class="text-xs text-ab-gray ml-1">
									({#if field.minimum !== undefined}min: {field.minimum}{/if}{#if field.minimum !== undefined && field.maximum !== undefined}, {/if}{#if field.maximum !== undefined}max: {field.maximum}{/if})
								</span>
							{/if}
							{#if field.example}
								<span class="text-xs text-ab-gray ml-1">e.g. {field.example}</span>
							{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}
