<script lang="ts">
	import type { SpecInterface, Service } from '$generated/types';
	import DeprecationBadge from './DeprecationBadge.svelte';
	import FieldsTable from './FieldsTable.svelte';

	interface Props {
		interfaces: SpecInterface[];
		service: Service;
	}

	let { interfaces, service }: Props = $props();
</script>

{#if interfaces.length > 0}
	<div class="space-y-8">
		{#each interfaces as iface}
			<div id={iface.name} class="scroll-mt-16">
				<div class="flex items-center gap-2 mb-2">
					<h3 class="text-lg font-bold text-ab-dark-blue">{iface.name}</h3>
					{#if iface.deprecation}
						<DeprecationBadge deprecation={iface.deprecation} />
					{/if}
				</div>
				{#if iface.description}
					<p class="text-sm text-ab-dark-gray mb-3">{iface.description}</p>
				{/if}
				<FieldsTable fields={iface.fields} {service} />
			</div>
		{/each}
	</div>
{:else}
	<p class="text-ab-gray text-sm">No interfaces defined.</p>
{/if}
