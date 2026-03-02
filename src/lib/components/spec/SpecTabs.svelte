<script lang="ts">
	import { onMount, tick } from 'svelte';
	import type { Service } from '$generated/types';
	import ResourceList from './ResourceList.svelte';
	import ModelList from './ModelList.svelte';
	import EnumList from './EnumList.svelte';
	import UnionList from './UnionList.svelte';
	import InterfaceList from './InterfaceList.svelte';

	interface Props {
		service: Service;
		exampleBaseUrl?: string;
	}

	let { service, exampleBaseUrl }: Props = $props();

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

	const validTabIds = ['resources', 'models', 'enums', 'unions', 'interfaces', 'headers', 'imports', 'annotations'];

	function getTabFromHash(): string | null {
		if (typeof window === 'undefined') return null;
		const hash = window.location.hash.slice(1);
		if (validTabIds.includes(hash)) return hash;
		return null;
	}

	let searchQuery = $state('');
	let activeTab = $state(getTabFromHash() ?? '');

	const filteredModels = $derived(
		searchQuery
			? service.models.filter((m) => m.name.toLowerCase().includes(searchQuery.toLowerCase()))
			: service.models,
	);

	const filteredEnums = $derived(
		searchQuery
			? service.enums.filter((e) => e.name.toLowerCase().includes(searchQuery.toLowerCase()))
			: service.enums,
	);

	const filteredUnions = $derived(
		searchQuery
			? service.unions.filter((u) => u.name.toLowerCase().includes(searchQuery.toLowerCase()))
			: service.unions,
	);

	const filteredInterfaces = $derived(
		searchQuery
			? (service.interfaces ?? []).filter((i) => i.name.toLowerCase().includes(searchQuery.toLowerCase()))
			: (service.interfaces ?? []),
	);

	const filteredResources = $derived(
		searchQuery
			? service.resources.filter((r) => r.type.toLowerCase().includes(searchQuery.toLowerCase()))
			: service.resources,
	);

	const filteredTabs = $derived<Tab[]>(
		searchQuery
			? [
					{ id: 'resources', label: 'Resources', count: filteredResources.length },
					{ id: 'models', label: 'Models', count: filteredModels.length },
					{ id: 'enums', label: 'Enums', count: filteredEnums.length },
					{ id: 'unions', label: 'Unions', count: filteredUnions.length },
					{ id: 'interfaces', label: 'Interfaces', count: filteredInterfaces.length },
				].filter((t) => t.count > 0)
			: tabs,
	);

	const defaultTab = $derived(filteredTabs.length > 0 ? filteredTabs[0]!.id : 'resources');
	const currentTab = $derived(activeTab && filteredTabs.some((t) => t.id === activeTab) ? activeTab : defaultTab);

	function setTabHash(tabId: string) {
		history.replaceState(null, '', `#${tabId}`);
	}

	function selectTab(tabId: string) {
		activeTab = tabId;
		setTabHash(tabId);
	}

	function findTabForName(name: string): string | null {
		if (service.models.some((m) => m.name === name)) return 'models';
		if (service.enums.some((e) => e.name === name)) return 'enums';
		if (service.unions.some((u) => u.name === name)) return 'unions';
		if ((service.interfaces ?? []).some((i) => i.name === name)) return 'interfaces';
		if (service.resources.some((r) => r.type === name)) return 'resources';
		return null;
	}

	async function handleHash() {
		const hash = window.location.hash.slice(1);
		if (!hash) return;

		// Check if hash is a tab ID
		if (validTabIds.includes(hash)) {
			activeTab = hash;
			return;
		}

		// Otherwise treat as a type name to scroll to
		const tab = findTabForName(hash);
		if (tab) {
			activeTab = tab;
			await tick();
			const el = document.getElementById(hash);
			if (el) {
				el.scrollIntoView({ behavior: 'smooth', block: 'start' });
			}
		}
	}

	onMount(() => {
		handleHash();
		window.addEventListener('hashchange', handleHash);
		return () => window.removeEventListener('hashchange', handleHash);
	});
</script>

<!-- Search bar -->
<div class="mb-4">
	<input
		type="text"
		placeholder="Filter types by name..."
		bind:value={searchQuery}
		class="w-full sm:w-80 input-field px-3 py-2 border rounded-lg text-sm"
	/>
</div>

<!-- Tab navigation -->
<div class="border-b border-gray-200 mb-6 overflow-x-auto">
	<nav class="flex space-x-1 min-w-max" aria-label="Spec sections">
		{#each filteredTabs as tab (tab.id)}
			<button
				class="px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap {currentTab === tab.id
					? 'border-ab-blue text-ab-blue'
					: 'border-transparent text-ab-gray hover:text-ab-dark-gray hover:border-gray-300'}"
				onclick={() => selectTab(tab.id)}
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
		<ResourceList resources={filteredResources} {service} />
	{:else if currentTab === 'models'}
		<ModelList models={filteredModels} {service} exampleBaseUrl={exampleBaseUrl ?? ''} />
	{:else if currentTab === 'enums'}
		<EnumList enums={filteredEnums} exampleBaseUrl={exampleBaseUrl ?? ''} />
	{:else if currentTab === 'unions'}
		<UnionList unions={filteredUnions} {service} exampleBaseUrl={exampleBaseUrl ?? ''} />
	{:else if currentTab === 'interfaces'}
		<InterfaceList interfaces={filteredInterfaces} {service} />
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
