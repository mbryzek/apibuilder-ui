<script lang="ts">
	import type { Model, Service } from '$generated/types';
	import DeprecationBadge from './DeprecationBadge.svelte';
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
	<div class="space-y-8">
		{#each models as model}
			<div id={model.name} class="scroll-mt-16">
				<div class="flex items-center gap-2 mb-2">
					<h3 class="text-lg font-bold text-ab-dark-blue">{model.name}</h3>
					{#if model.deprecation}
						<DeprecationBadge deprecation={model.deprecation} />
					{/if}
				</div>
				{#if model.description}
					<p class="text-sm text-ab-dark-gray mb-3">{model.description}</p>
				{/if}
				{#if model.interfaces && model.interfaces.length > 0}
					<p class="text-xs text-ab-gray mb-2">
						Implements: {model.interfaces.join(', ')}
					</p>
				{/if}
				<FieldsTable fields={model.fields} {service} />
				{#if exampleBaseUrl}
					<div class="mt-2">
						<ExampleJsonLinks baseUrl={exampleBaseUrl} typeName={model.name} />
					</div>
				{/if}
			</div>
		{/each}
	</div>
{:else}
	<p class="text-ab-gray text-sm">No models defined.</p>
{/if}
