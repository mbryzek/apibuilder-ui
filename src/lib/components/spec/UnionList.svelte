<script lang="ts">
	import type { SpecUnion, Service } from '$generated/types';
	import TypeLink from './TypeLink.svelte';
	import DeprecationBadge from './DeprecationBadge.svelte';
	import ExampleJsonLinks from './ExampleJsonLinks.svelte';

	interface Props {
		unions: SpecUnion[];
		service: Service;
		exampleBaseUrl?: string;
	}

	let { unions, service, exampleBaseUrl }: Props = $props();

	function hasAnyDescriptions(union: SpecUnion): boolean {
		return union.types.some((t) => t.description);
	}
</script>

{#if unions.length > 0}
	<div class="space-y-6">
		{#each unions as union}
			{@const showDescriptions = hasAnyDescriptions(union)}
			<div id={union.name} class="scroll-mt-16 border border-gray-200 rounded-lg overflow-hidden">
				<div class="bg-ab-light-gray px-4 py-3 flex items-center justify-between gap-2">
					<div class="flex items-center gap-2 min-w-0">
						<h3 class="text-base font-bold text-ab-dark-blue font-mono truncate">{union.name}</h3>
						{#if union.deprecation}
							<DeprecationBadge deprecation={union.deprecation} />
						{/if}
					</div>
					{#if exampleBaseUrl}
						<ExampleJsonLinks baseUrl={exampleBaseUrl} typeName={union.name} />
					{/if}
				</div>
				<div class="px-4 py-3">
					{#if union.description}
						<p class="text-sm text-ab-dark-gray mb-3">{union.description}</p>
					{/if}
					{#if union.discriminator}
						<p class="text-xs text-ab-gray mb-2">Discriminator: <code class="font-mono">{union.discriminator}</code></p>
					{/if}
					{#if union.interfaces && union.interfaces.length > 0}
						<p class="text-xs text-ab-gray mb-2">
							Implements: {union.interfaces.join(', ')}
						</p>
					{/if}
					<div class="overflow-x-auto">
						<table class="w-full text-sm text-left">
							<thead>
								<tr class="border-b border-gray-200">
									<th class="pb-2 pr-6 font-semibold text-ab-gray">Type</th>
									{#if showDescriptions}
										<th class="pb-2 font-semibold text-ab-gray">Description</th>
									{/if}
								</tr>
							</thead>
							<tbody>
								{#each union.types as unionType}
									<tr class="border-b border-gray-100 last:border-b-0">
										<td class="py-2.5 pr-6 font-mono text-sm align-top">
											<TypeLink typeStr={unionType.type} {service} />
											{#if unionType.discriminator_value}
												<span class="text-ab-gray text-xs ml-1">({unionType.discriminator_value})</span>
											{/if}
											{#if unionType.deprecation}
												<DeprecationBadge deprecation={unionType.deprecation} />
											{/if}
											{#if unionType.default}
												<span class="block text-[11px] text-ab-success-green font-medium mt-0.5">default</span>
											{/if}
										</td>
										{#if showDescriptions}
											<td class="py-2.5 text-ab-dark-gray align-top">{unionType.description ?? ''}</td>
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
	<p class="text-ab-gray text-sm">No unions defined.</p>
{/if}
