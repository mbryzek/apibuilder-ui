<script lang="ts">
	import type { SpecEnum } from '$generated/types';
	import ExampleJsonLinks from './ExampleJsonLinks.svelte';

	interface Props {
		enums: SpecEnum[];
		exampleBaseUrl?: string;
	}

	let { enums, exampleBaseUrl }: Props = $props();

	function hasAnyDescriptions(enumDef: SpecEnum): boolean {
		return enumDef.values.some((v) => v.description);
	}
</script>

{#if enums.length > 0}
	<div class="space-y-6">
		{#each enums as enumDef}
			<div id={enumDef.name} class="scroll-mt-16 border border-gray-200 rounded-lg overflow-hidden">
				<div class="bg-ab-light-gray px-4 py-3 flex items-center justify-between gap-2">
					<div class="flex items-center gap-2 min-w-0">
						<h3 class="text-base font-bold text-ab-dark-blue font-mono truncate">{enumDef.name}</h3>
					</div>
					{#if exampleBaseUrl}
						<ExampleJsonLinks baseUrl={exampleBaseUrl} typeName={enumDef.name} />
					{/if}
				</div>
				<div class="px-4 py-3">
					{#if enumDef.description}
						<p class="text-sm text-ab-dark-gray mb-3">{enumDef.description}</p>
					{/if}
					<div class="overflow-x-auto">
						<table class="w-full text-sm text-left">
							<thead>
								<tr class="border-b border-gray-200">
									<th class="pb-2 pr-6 font-semibold text-ab-gray">Value</th>
									{#if hasAnyDescriptions(enumDef)}
										<th class="pb-2 font-semibold text-ab-gray">Description</th>
									{/if}
								</tr>
							</thead>
							<tbody>
								{#each enumDef.values as value}
									<tr class="border-b border-gray-100 last:border-b-0">
										<td class="py-2.5 pr-6 font-mono text-sm align-top">
											{value.name}
											{#if value.value && value.value !== value.name}
												<span class="text-ab-gray text-xs ml-1">({value.value})</span>
											{/if}
										</td>
										{#if hasAnyDescriptions(enumDef)}
											<td class="py-2.5 text-ab-dark-gray align-top">{value.description ?? ''}</td>
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
	<p class="text-ab-gray text-sm">No enums defined.</p>
{/if}
