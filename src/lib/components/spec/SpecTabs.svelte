<script lang="ts">
	import { onMount, tick } from 'svelte';
	import type { Service } from '$generated/com-bryzek-apibuilder-spec';
	import ResourceList from './ResourceList.svelte';
	import ModelList from './ModelList.svelte';
	import EnumList from './EnumList.svelte';
	import UnionList from './UnionList.svelte';
	import InterfaceList from './InterfaceList.svelte';

	interface Props {
		service: Service;
		exampleBaseUrl?: string;
		searchQuery?: string;
	}

	let { service, exampleBaseUrl, searchQuery = '' }: Props = $props();

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
		{ id: 'imports', label: 'Imports', count: service.imports.length },
	].filter((t) => t.count > 0));

	let activeTab = $state('');

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

	function findTabForName(name: string): string | null {
		if (service.models.some((m) => m.name === name)) return 'models';
		if (service.enums.some((e) => e.name === name)) return 'enums';
		if (service.unions.some((u) => u.name === name)) return 'unions';
		if ((service.interfaces ?? []).some((i) => i.name === name)) return 'interfaces';
		if (service.resources.some((r) => r.type === name)) return 'resources';
		return null;
	}

	async function scrollToHash() {
		const hash = window.location.hash.slice(1);
		if (!hash) return;

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
		scrollToHash();
		window.addEventListener('hashchange', scrollToHash);
		return () => window.removeEventListener('hashchange', scrollToHash);
	});
</script>

<!-- Tab navigation -->
<div class="mb-6 overflow-x-auto">
	<div class="flex gap-2 min-w-max" role="tablist" aria-label="Spec sections">
		{#each filteredTabs as tab (tab.id)}
			<button
				role="tab"
				aria-selected={currentTab === tab.id}
				class="px-4 py-1.5 text-sm font-medium rounded-full transition-colors whitespace-nowrap {currentTab === tab.id
					? 'bg-ab-blue text-white'
					: 'bg-gray-100 text-ab-gray hover:bg-gray-200 hover:text-ab-dark-gray'}"
				onclick={() => (activeTab = tab.id)}
			>
				{tab.label}
				<span class="ml-0.5 text-xs opacity-75">{tab.count}</span>
			</button>
		{/each}
	</div>
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
	{:else if currentTab === 'imports'}
		{#if service.imports.length > 0}
			<div class="space-y-4">
				{#each service.imports as imp}
					{@const impBase = `/${imp.organization.key}/${imp.application.key}/${imp.version}`}
					<div class="border border-gray-200 rounded-lg p-4">
						<a
							href={impBase}
							class="text-ab-blue hover:text-ab-dark-blue font-medium"
						>
							{imp.namespace}
						</a>
						<p class="text-xs text-ab-gray mt-1">Version: {imp.version}</p>
						{#if imp.models.length > 0}
							<p class="text-xs text-ab-gray">Models:
								{#each imp.models as model, i}<a href="{impBase}#{model.name}" class="text-ab-blue hover:text-ab-dark-blue">{model.name}</a>{#if i < imp.models.length - 1}, {/if}{/each}
							</p>
						{/if}
						{#if imp.enums.length > 0}
							<p class="text-xs text-ab-gray">Enums:
								{#each imp.enums as enumItem, i}<a href="{impBase}#{enumItem.name}" class="text-ab-blue hover:text-ab-dark-blue">{enumItem.name}</a>{#if i < imp.enums.length - 1}, {/if}{/each}
							</p>
						{/if}
						{#if imp.unions.length > 0}
							<p class="text-xs text-ab-gray">Unions:
								{#each imp.unions as unionItem, i}<a href="{impBase}#{unionItem.name}" class="text-ab-blue hover:text-ab-dark-blue">{unionItem.name}</a>{#if i < imp.unions.length - 1}, {/if}{/each}
							</p>
						{/if}
						{#if imp.interfaces && imp.interfaces.length > 0}
							<p class="text-xs text-ab-gray">Interfaces:
								{#each imp.interfaces as ifaceItem, i}<a href="{impBase}#{ifaceItem.name}" class="text-ab-blue hover:text-ab-dark-blue">{ifaceItem.name}</a>{#if i < imp.interfaces.length - 1}, {/if}{/each}
							</p>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	{/if}
</div>
