<script lang="ts">
	import type { Interface, Service } from '$generated/com-bryzek-apibuilder-spec-v0';
	import DeprecationBadge from './DeprecationBadge.svelte';
	import FieldsTable from './FieldsTable.svelte';

	interface Props {
		interfaces: Interface[];
		service: Service;
	}

	let { interfaces, service }: Props = $props();
</script>

{#if interfaces.length > 0}
	<div class="space-y-6">
		{#each interfaces as iface}
			<div id={iface.name} class="scroll-mt-16 border border-gray-200 rounded-lg overflow-hidden">
				<div class="bg-ab-light-gray px-4 py-3 flex items-center gap-2">
					<h3 class="text-base font-bold text-ab-dark-blue font-mono truncate">{iface.name}</h3>
					{#if iface.deprecation}
						<DeprecationBadge deprecation={iface.deprecation} />
					{/if}
				</div>
				<div class="px-4 py-3">
					{#if iface.description}
						<p class="text-sm text-ab-dark-gray mb-3">{iface.description}</p>
					{/if}
					<FieldsTable fields={iface.fields} {service} />
				</div>
			</div>
		{/each}
	</div>
{:else}
	<p class="text-ab-gray text-sm">No interfaces defined.</p>
{/if}
