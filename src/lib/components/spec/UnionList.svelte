<script lang="ts">
	import type { SpecUnion, Service } from '$generated/types';
	import TypeLink from './TypeLink.svelte';
	import DeprecationBadge from './DeprecationBadge.svelte';

	interface Props {
		unions: SpecUnion[];
		service: Service;
		exampleBaseUrl?: string;
	}

	let { unions, service, exampleBaseUrl }: Props = $props();
</script>

{#if unions.length > 0}
	<div class="space-y-8">
		{#each unions as union}
			<div id={union.name} class="scroll-mt-16">
				<div class="flex items-center gap-2 mb-2">
					<h3 class="text-lg font-bold text-ab-dark-blue">{union.name}</h3>
					{#if union.deprecation}
						<DeprecationBadge deprecation={union.deprecation} />
					{/if}
				</div>
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
								<th class="pb-2 pr-4 font-semibold text-ab-gray">Type</th>
								<th class="pb-2 pr-4 font-semibold text-ab-gray hidden sm:table-cell">Default</th>
								<th class="pb-2 font-semibold text-ab-gray">Description</th>
							</tr>
						</thead>
						<tbody>
							{#each union.types as unionType}
								<tr class="border-b border-gray-100">
									<td class="py-2 pr-4 font-mono text-sm">
										<TypeLink typeStr={unionType.type} {service} />
										{#if unionType.discriminator_value}
											<span class="text-ab-gray text-xs ml-1">({unionType.discriminator_value})</span>
										{/if}
										{#if unionType.deprecation}
											<DeprecationBadge deprecation={unionType.deprecation} />
										{/if}
									</td>
									<td class="py-2 pr-4 hidden sm:table-cell">
										{#if unionType.default}
											<span class="text-ab-success-green text-xs">default</span>
										{:else}
											<span class="text-gray-300">-</span>
										{/if}
									</td>
									<td class="py-2 text-ab-dark-gray">{unionType.description ?? ''}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
				{#if exampleBaseUrl}
					<p class="text-xs text-ab-gray mt-2">
						Example JSON:
						<a href="{exampleBaseUrl}/{union.name}" target="_blank" class="text-ab-blue hover:text-ab-dark-blue">Minimal</a>
						|
						<a href="{exampleBaseUrl}/{union.name}?optional_fields=true" target="_blank" class="text-ab-blue hover:text-ab-dark-blue">Full</a>
					</p>
				{/if}
			</div>
		{/each}
	</div>
{:else}
	<p class="text-ab-gray text-sm">No unions defined.</p>
{/if}
