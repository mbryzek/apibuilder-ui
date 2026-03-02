<script lang="ts">
	import type { SpecEnum } from '$generated/types';
	import DeprecationBadge from './DeprecationBadge.svelte';
	import ExampleJsonLinks from './ExampleJsonLinks.svelte';

	interface Props {
		enums: SpecEnum[];
		exampleBaseUrl?: string;
	}

	let { enums, exampleBaseUrl }: Props = $props();
</script>

{#if enums.length > 0}
	<div class="space-y-8">
		{#each enums as enumDef}
			<div id={enumDef.name} class="scroll-mt-16">
				<div class="flex items-center gap-2 mb-2">
					<h3 class="text-lg font-bold text-ab-dark-blue">{enumDef.name}</h3>
					{#if enumDef.deprecation}
						<DeprecationBadge deprecation={enumDef.deprecation} />
					{/if}
				</div>
				{#if enumDef.description}
					<p class="text-sm text-ab-dark-gray mb-3">{enumDef.description}</p>
				{/if}
				<div class="overflow-x-auto">
					<table class="w-full text-sm text-left">
						<thead>
							<tr class="border-b border-gray-200">
								<th class="pb-2 pr-4 font-semibold text-ab-gray">Value</th>
								<th class="pb-2 font-semibold text-ab-gray">Description</th>
							</tr>
						</thead>
						<tbody>
							{#each enumDef.values as value}
								<tr class="border-b border-gray-100">
									<td class="py-2 pr-4 font-mono text-sm">
										{value.name}
										{#if value.value && value.value !== value.name}
											<span class="text-ab-gray text-xs ml-1">({value.value})</span>
										{/if}
										{#if value.deprecation}
											<DeprecationBadge deprecation={value.deprecation} />
										{/if}
									</td>
									<td class="py-2 text-ab-dark-gray">{value.description ?? ''}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
				{#if exampleBaseUrl}
					<div class="mt-2">
						<ExampleJsonLinks baseUrl={exampleBaseUrl} typeName={enumDef.name} />
					</div>
				{/if}
			</div>
		{/each}
	</div>
{:else}
	<p class="text-ab-gray text-sm">No enums defined.</p>
{/if}
