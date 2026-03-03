<script lang="ts">
	import type { Field, Service } from '$generated/types';
	import TypeLink from './TypeLink.svelte';
	import DeprecationBadge from './DeprecationBadge.svelte';

	interface Props {
		fields: Field[];
		service: Service;
	}

	let { fields, service }: Props = $props();

	const hasDetails = $derived(fields.some((f) => f.description || (f.default !== undefined && f.default !== null) || f.minimum !== undefined || f.maximum !== undefined || f.example));
</script>

{#if fields.length > 0}
	<div class="overflow-x-auto">
		<table class="w-full text-sm text-left">
			<thead>
				<tr class="border-b border-gray-200">
					<th class="pb-2 pr-6 font-semibold text-ab-gray">Field</th>
					<th class="pb-2 pr-6 font-semibold text-ab-gray">Type</th>
					{#if hasDetails}
						<th class="pb-2 font-semibold text-ab-gray">Description</th>
					{/if}
				</tr>
			</thead>
			<tbody>
				{#each fields as field}
					<tr class="border-b border-gray-100 last:border-b-0">
						<td class="py-2.5 pr-6 align-top">
							<span class="font-mono text-sm">{field.name}</span>
							{#if field.deprecation}
								<DeprecationBadge deprecation={field.deprecation} />
							{/if}
							{#if field.required}
								<span class="block text-[11px] text-ab-success-green font-medium mt-0.5">required</span>
							{/if}
						</td>
						<td class="py-2.5 pr-6 font-mono text-sm whitespace-nowrap align-top">
							<TypeLink typeStr={field.type} {service} />
						</td>
						{#if hasDetails}
							<td class="py-2.5 text-ab-dark-gray align-top">
								{#if field.default !== undefined && field.default !== null}
									<span class="text-xs text-ab-gray">default: {field.default}</span>
									{#if field.description || field.minimum !== undefined || field.maximum !== undefined || field.example}
										<span class="mx-0.5"></span>
									{/if}
								{/if}
								{#if field.minimum !== undefined || field.maximum !== undefined}
									<span class="text-xs text-ab-gray">
										{#if field.minimum !== undefined}min: {field.minimum}{/if}{#if field.minimum !== undefined && field.maximum !== undefined}, {/if}{#if field.maximum !== undefined}max: {field.maximum}{/if}
									</span>
									{#if field.description || field.example}
										<span class="mx-0.5"></span>
									{/if}
								{/if}
								{#if field.description}
									{field.description}
								{/if}
								{#if field.example}
									<span class="text-xs text-ab-gray ml-1">e.g. {field.example}</span>
								{/if}
							</td>
						{/if}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}
