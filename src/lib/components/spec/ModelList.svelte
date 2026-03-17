<script lang="ts">
	import type { Model, Service } from '$generated/types';
	import ExampleJsonLinks from './ExampleJsonLinks.svelte';
	import FieldsTable from './FieldsTable.svelte';

	interface Props {
		models: Model[];
		service: Service;
		exampleBaseUrl?: string;
	}

	let { models, service, exampleBaseUrl }: Props = $props();
</script>

{#if models.length > 0}
	<div class="space-y-6">
		{#each models as model}
			<div id={model.name} class="scroll-mt-16 border border-gray-200 rounded-lg overflow-hidden">
				<div class="bg-ab-light-gray px-4 py-3 flex items-center justify-between gap-2">
					<div class="flex items-center gap-2 min-w-0">
						<h3 class="text-base font-bold text-ab-dark-blue font-mono truncate">{model.name}</h3>
					</div>
					{#if exampleBaseUrl}
						<ExampleJsonLinks baseUrl={exampleBaseUrl} typeName={model.name} />
					{/if}
				</div>
				<div class="px-4 py-3">
					{#if model.description}
						<p class="text-sm text-ab-dark-gray mb-3">{model.description}</p>
					{/if}
					{#if model.interfaces && model.interfaces.length > 0}
						<p class="text-xs text-ab-gray mb-2">
							Implements: {model.interfaces.join(', ')}
						</p>
					{/if}
					<FieldsTable fields={model.fields} {service} />
				</div>
			</div>
		{/each}
	</div>
{:else}
	<p class="text-ab-gray text-sm">No models defined.</p>
{/if}
