<script lang="ts">
	import type { Service } from '$generated/types';
	import ResourceList from './ResourceList.svelte';
	import ModelList from './ModelList.svelte';
	import EnumList from './EnumList.svelte';
	import UnionList from './UnionList.svelte';
	import InterfaceList from './InterfaceList.svelte';

	interface Props {
		service: Service;
	}

	let { service }: Props = $props();

	interface Tab {
		id: string;
		label: string;
		count: number;
	}

	const tabs = $derived<Tab[]>([
		{ id: 'resources', label: 'Resources', count: service.resources.length },
		{ id: 'models', label: 'Models', count: service.models.length },
		{ id: 'enums', label: 'Enums', count: service.enums.length },
		{ id: 'unions', label: 'Unions', count: service.unions.length },
		{ id: 'interfaces', label: 'Interfaces', count: service.interfaces?.length ?? 0 },
		{ id: 'headers', label: 'Headers', count: service.headers.length },
		{ id: 'imports', label: 'Imports', count: service.imports.length },
		{ id: 'annotations', label: 'Annotations', count: service.annotations?.length ?? 0 },
	].filter((t) => t.count > 0));

	const defaultTab = $derived(tabs.length > 0 ? tabs[0]!.id : 'resources');
	let activeTab = $state('');
	const currentTab = $derived(activeTab || defaultTab);
</script>

<!-- Tab navigation -->
<div class="border-b border-gray-200 mb-6 overflow-x-auto">
	<nav class="flex space-x-1 min-w-max" aria-label="Spec sections">
		{#each tabs as tab (tab.id)}
			<button
				class="px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap {currentTab === tab.id
					? 'border-ab-blue text-ab-blue'
					: 'border-transparent text-ab-gray hover:text-ab-dark-gray hover:border-gray-300'}"
				onclick={() => (activeTab = tab.id)}
			>
				{tab.label}
				<span class="ml-1 text-xs {currentTab === tab.id ? 'text-ab-blue' : 'text-ab-gray'}">({tab.count})</span>
			</button>
		{/each}
	</nav>
</div>

<!-- Tab content -->
<div>
	{#if currentTab === 'resources'}
		<ResourceList resources={service.resources} {service} />
	{:else if currentTab === 'models'}
		<ModelList models={service.models} {service} />
	{:else if currentTab === 'enums'}
		<EnumList enums={service.enums} />
	{:else if currentTab === 'unions'}
		<UnionList unions={service.unions} {service} />
	{:else if currentTab === 'interfaces'}
		<InterfaceList interfaces={service.interfaces ?? []} {service} />
	{:else if currentTab === 'headers'}
		{#if service.headers.length > 0}
			<div class="overflow-x-auto">
				<table class="w-full text-sm text-left">
					<thead>
						<tr class="border-b border-gray-200">
							<th class="pb-2 pr-4 font-semibold text-ab-gray">Name</th>
							<th class="pb-2 pr-4 font-semibold text-ab-gray">Type</th>
							<th class="pb-2 pr-4 font-semibold text-ab-gray">Required</th>
							<th class="pb-2 font-semibold text-ab-gray">Description</th>
						</tr>
					</thead>
					<tbody>
						{#each service.headers as header}
							<tr class="border-b border-gray-100">
								<td class="py-2 pr-4 font-mono text-sm">{header.name}</td>
								<td class="py-2 pr-4 font-mono text-sm">{header.type}</td>
								<td class="py-2 pr-4">{header.required ? 'yes' : 'no'}</td>
								<td class="py-2 text-ab-dark-gray">{header.description ?? ''}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	{:else if currentTab === 'imports'}
		{#if service.imports.length > 0}
			<div class="space-y-4">
				{#each service.imports as imp}
					<div class="bg-ab-light-gray rounded-lg p-4">
						<a
							href="/{imp.organization.key}/{imp.application.key}/{imp.version}"
							class="text-ab-blue hover:text-ab-dark-blue font-medium"
						>
							{imp.namespace}
						</a>
						<p class="text-xs text-ab-gray mt-1">Version: {imp.version}</p>
						{#if imp.models.length > 0}
							<p class="text-xs text-ab-gray">Models: {imp.models.join(', ')}</p>
						{/if}
						{#if imp.enums.length > 0}
							<p class="text-xs text-ab-gray">Enums: {imp.enums.join(', ')}</p>
						{/if}
						{#if imp.unions.length > 0}
							<p class="text-xs text-ab-gray">Unions: {imp.unions.join(', ')}</p>
						{/if}
						{#if imp.interfaces && imp.interfaces.length > 0}
							<p class="text-xs text-ab-gray">Interfaces: {imp.interfaces.join(', ')}</p>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	{:else if currentTab === 'annotations'}
		{#if service.annotations && service.annotations.length > 0}
			<div class="overflow-x-auto">
				<table class="w-full text-sm text-left">
					<thead>
						<tr class="border-b border-gray-200">
							<th class="pb-2 pr-4 font-semibold text-ab-gray">Name</th>
							<th class="pb-2 font-semibold text-ab-gray">Description</th>
						</tr>
					</thead>
					<tbody>
						{#each service.annotations as annotation}
							<tr class="border-b border-gray-100">
								<td class="py-2 pr-4 font-mono text-sm">{annotation.name}</td>
								<td class="py-2 text-ab-dark-gray">{annotation.description ?? ''}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	{/if}
</div>
