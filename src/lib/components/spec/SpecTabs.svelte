<script lang="ts">
  import { onMount, tick } from 'svelte';
  import type { Service } from '$generated/com-bryzek-apibuilder-spec';
  import ResourceList from './ResourceList.svelte';
  import ModelList from './ModelList.svelte';
  import EnumList from './EnumList.svelte';
  import UnionList from './UnionList.svelte';
  import InterfaceList from './InterfaceList.svelte';
  import AuthSchemeList from './AuthSchemeList.svelte';
  import { authSchemes, isAuthSchemeAnchor } from '$lib/utils/auth-schemes';

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

  const schemes = $derived(authSchemes(service));

  const tabs = $derived<Tab[]>(
    [
      { id: 'resources', label: 'Resources', count: service.resources.length },
      { id: 'models', label: 'Models', count: service.models.length },
      { id: 'enums', label: 'Enums', count: service.enums.length },
      { id: 'unions', label: 'Unions', count: service.unions.length },
      { id: 'interfaces', label: 'Interfaces', count: service.interfaces?.length ?? 0 },
      { id: 'auth', label: 'Auth Schemes', count: schemes.length },
      { id: 'imports', label: 'Imports', count: service.imports.length }
    ].filter((t) => t.count > 0)
  );

  let activeTab = $state('');

  const filteredModels = $derived(
    searchQuery ? service.models.filter((m) => m.name.toLowerCase().includes(searchQuery.toLowerCase())) : service.models
  );

  const filteredEnums = $derived(
    searchQuery ? service.enums.filter((e) => e.name.toLowerCase().includes(searchQuery.toLowerCase())) : service.enums
  );

  const filteredUnions = $derived(
    searchQuery ? service.unions.filter((u) => u.name.toLowerCase().includes(searchQuery.toLowerCase())) : service.unions
  );

  const filteredInterfaces = $derived(
    searchQuery
      ? (service.interfaces ?? []).filter((i) => i.name.toLowerCase().includes(searchQuery.toLowerCase()))
      : (service.interfaces ?? [])
  );

  const filteredSchemes = $derived(searchQuery ? schemes.filter((s) => s.type.toLowerCase().includes(searchQuery.toLowerCase())) : schemes);

  const filteredResources = $derived(
    searchQuery ? service.resources.filter((r) => r.type.toLowerCase().includes(searchQuery.toLowerCase())) : service.resources
  );

  const filteredTabs = $derived<Tab[]>(
    searchQuery
      ? [
          { id: 'resources', label: 'Resources', count: filteredResources.length },
          { id: 'models', label: 'Models', count: filteredModels.length },
          { id: 'enums', label: 'Enums', count: filteredEnums.length },
          { id: 'unions', label: 'Unions', count: filteredUnions.length },
          { id: 'interfaces', label: 'Interfaces', count: filteredInterfaces.length },
          { id: 'auth', label: 'Auth Schemes', count: filteredSchemes.length }
        ].filter((t) => t.count > 0)
      : tabs
  );

  const defaultTab = $derived(filteredTabs.length > 0 ? filteredTabs[0]!.id : 'resources');
  const currentTab = $derived(activeTab && filteredTabs.some((t) => t.id === activeTab) ? activeTab : defaultTab);

  /**
   * A filter the reader typed that nothing in the service matches.
   *
   * Held apart from a service that declares nothing, because otherwise the two states render the
   * same sentence: with no tab left to select, `defaultTab` falls back to `resources` and an empty
   * `ResourceList` says "No resources defined." for a service full of them, beside an empty tab
   * bar. The whole page then reads as an empty spec rather than as a filter with no matches.
   */
  const noMatches = $derived(searchQuery !== '' && filteredTabs.length === 0);

  function findTabForName(name: string): string | null {
    // Checked first: a scheme anchor is prefixed precisely so it cannot be confused with a type
    // name, and its scheme type is free-form enough to equal one.
    if (isAuthSchemeAnchor(name)) return 'auth';
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

  /**
   * The tab pattern, wired rather than merely announced.
   *
   * `role="tab"` promises a screen reader that a panel exists to move to and that the arrow keys
   * move between tabs. Both halves are here: `aria-controls` names the one panel, the panel names
   * the tab it is showing, and only the selected tab is in the tab order — arrow keys move within
   * the set, which is what stops a long tab bar from costing seven Tab presses to step past.
   */
  const PANEL_ID = 'spec-tabpanel';

  function tabId(id: string): string {
    return `spec-tab-${id}`;
  }

  async function focusTab(index: number): Promise<void> {
    const tab = filteredTabs[index];
    if (!tab) return;
    activeTab = tab.id;
    await tick();
    document.getElementById(tabId(tab.id))?.focus();
  }

  async function onTabKeydown(event: KeyboardEvent, index: number): Promise<void> {
    const last = filteredTabs.length - 1;
    const target =
      event.key === 'ArrowRight'
        ? (index + 1) % filteredTabs.length
        : event.key === 'ArrowLeft'
          ? (index + last) % filteredTabs.length
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? last
              : null;
    if (target === null) return;
    event.preventDefault();
    await focusTab(target);
  }

  onMount(() => {
    // Fire-and-forget: onMount must return the listener cleanup synchronously, and nothing
    // waits on the initial scroll.
    void scrollToHash();
    window.addEventListener('hashchange', scrollToHash);
    return () => window.removeEventListener('hashchange', scrollToHash);
  });
</script>

{#if noMatches}
  <p class="text-ab-gray text-sm">No types match "{searchQuery}".</p>
{:else}
  <!-- Tab navigation -->
  <div class="mb-6 overflow-x-auto">
    <div class="flex min-w-max gap-2" role="tablist" aria-label="Spec sections">
      {#each filteredTabs as tab, i (tab.id)}
        <button
          role="tab"
          id={tabId(tab.id)}
          aria-selected={currentTab === tab.id}
          aria-controls={PANEL_ID}
          tabindex={currentTab === tab.id ? 0 : -1}
          class="rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors {currentTab === tab.id
            ? 'bg-ab-blue text-white'
            : 'text-ab-gray hover:text-ab-dark-gray bg-gray-100 hover:bg-gray-200'}"
          onclick={() => (activeTab = tab.id)}
          onkeydown={(event) => onTabKeydown(event, i)}
        >
          {tab.label}
          <span class="ml-0.5 text-xs opacity-75">{tab.count}</span>
        </button>
      {/each}
    </div>
  </div>

  <!-- Tab content -->
  <div id={PANEL_ID} role="tabpanel" aria-labelledby={tabId(currentTab)}>
    {#if currentTab === 'resources'}
      <ResourceList resources={filteredResources} {service} />
    {:else if currentTab === 'models'}
      <ModelList models={filteredModels} {service} {exampleBaseUrl} />
    {:else if currentTab === 'enums'}
      <EnumList enums={filteredEnums} {exampleBaseUrl} />
    {:else if currentTab === 'unions'}
      <UnionList unions={filteredUnions} {service} {exampleBaseUrl} />
    {:else if currentTab === 'interfaces'}
      <InterfaceList interfaces={filteredInterfaces} {service} />
    {:else if currentTab === 'auth'}
      <AuthSchemeList schemes={filteredSchemes} {service} />
    {:else if currentTab === 'imports'}
      {#if service.imports.length > 0}
        <div class="space-y-4">
          {#each service.imports as imp}
            {@const impBase = `/${imp.organization.key}/${imp.application.key}/${imp.version}`}
            <div class="rounded-lg border border-gray-200 p-4">
              <a href={impBase} class="text-ab-blue hover:text-ab-dark-blue font-medium">
                {imp.namespace}
              </a>
              <p class="text-ab-gray mt-1 text-xs">Version: {imp.version}</p>
              {#if imp.models.length > 0}
                <p class="text-ab-gray text-xs">
                  Models:
                  {#each imp.models as model, i}<a href="{impBase}#{model.name}" class="text-ab-blue hover:text-ab-dark-blue"
                      >{model.name}</a
                    >{#if i < imp.models.length - 1},
                    {/if}{/each}
                </p>
              {/if}
              {#if imp.enums.length > 0}
                <p class="text-ab-gray text-xs">
                  Enums:
                  {#each imp.enums as enumItem, i}<a href="{impBase}#{enumItem.name}" class="text-ab-blue hover:text-ab-dark-blue"
                      >{enumItem.name}</a
                    >{#if i < imp.enums.length - 1},
                    {/if}{/each}
                </p>
              {/if}
              {#if imp.unions.length > 0}
                <p class="text-ab-gray text-xs">
                  Unions:
                  {#each imp.unions as unionItem, i}<a href="{impBase}#{unionItem.name}" class="text-ab-blue hover:text-ab-dark-blue"
                      >{unionItem.name}</a
                    >{#if i < imp.unions.length - 1},
                    {/if}{/each}
                </p>
              {/if}
              {#if imp.interfaces && imp.interfaces.length > 0}
                <p class="text-ab-gray text-xs">
                  Interfaces:
                  {#each imp.interfaces as ifaceItem, i}<a href="{impBase}#{ifaceItem.name}" class="text-ab-blue hover:text-ab-dark-blue"
                      >{ifaceItem.name}</a
                    >{#if i < imp.interfaces.length - 1},
                    {/if}{/each}
                </p>
              {/if}
            </div>
          {/each}
        </div>
      {/if}
    {/if}
  </div>
{/if}
