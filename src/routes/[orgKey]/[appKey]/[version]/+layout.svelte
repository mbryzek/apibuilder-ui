<script lang="ts">
  import type { PublicSession } from '#lib/session.ts';
  import type { Snippet } from 'svelte';
  import { page } from '$app/state';
  import AppSidebar from '#lib/components/AppSidebar.svelte';
  import LoadErrorBanner from '#lib/components/LoadErrorBanner.svelte';
  import type { Organization } from '#generated/com-bryzek-apibuilder.ts';
  import type { Generator } from '#generated/com-bryzek-apibuilder-generator.ts';
  import type { Service } from '#generated/com-bryzek-apibuilder-spec.ts';
  import type { LoadError } from '#lib/api/load-error.ts';
  import type { SidebarGenerators } from './+layout.server.ts';

  interface Props {
    data: {
      org: Organization;
      isMember: boolean;
      isAdmin: boolean;
      version: { version: string };
      service: Service;
      generators: Promise<SidebarGenerators>;
      session?: PublicSession;
    };
    children: Snippet;
  }

  let { data, children }: Props = $props();

  const version = $derived(data.version);
  const service = $derived(data.service);
  const orgKey = $derived(page.params.orgKey ?? '');
  const appKey = $derived(page.params.appKey ?? '');

  /**
   * The catalog streams (`later:generators`). Until it answers the sidebar has no Clients section;
   * a rerun of this load keeps the previous list until the new one arrives, since the catalog does
   * not depend on the version being read.
   */
  let generators = $state<Generator[]>([]);
  let generatorsLoadError = $state<LoadError | null>(null);
  $effect(() => {
    let current = true;
    void data.generators.then((result) => {
      if (!current) return;
      generators = result.generators;
      generatorsLoadError = result.loadError;
    });
    return () => {
      current = false;
    };
  });
</script>

<svelte:head>
  <title>{service.name} {version.version} - {data.org.name} - API Builder</title>
</svelte:head>

{#if generatorsLoadError}
  <LoadErrorBanner error={generatorsLoadError} />
{/if}

<div class="flex gap-10">
  <AppSidebar
    {orgKey}
    {appKey}
    version={version.version}
    appName={service.name}
    isMember={data.isMember}
    isAdmin={data.isAdmin}
    {generators}
  />

  <div class="min-w-0 flex-1">
    {#if service.description}
      <p class="text-ab-gray mb-4">{service.description}</p>
    {/if}

    <!-- Info bar -->
    {#if service.base_url || service.info.contact || service.info.license}
      <div class="bg-ab-light-gray mb-6 space-y-1 rounded-lg p-4 text-sm">
        {#if service.base_url}
          <p><span class="text-ab-dark-gray font-medium">Base URL:</span> <code class="text-ab-blue">{service.base_url}</code></p>
        {/if}
        {#if service.info.contact}
          <p>
            <span class="text-ab-dark-gray font-medium">Contact:</span>
            {#if service.info.contact.name}{service.info.contact.name}{/if}
            {#if service.info.contact.email}
              <a href="mailto:{service.info.contact.email}" class="text-ab-blue hover:text-ab-dark-blue">{service.info.contact.email}</a>
            {/if}
            {#if service.info.contact.url}
              <a href={service.info.contact.url} class="text-ab-blue hover:text-ab-dark-blue" target="_blank" rel="noopener"
                >{service.info.contact.url}</a
              >
            {/if}
          </p>
        {/if}
        {#if service.info.license}
          <p>
            <span class="text-ab-dark-gray font-medium">License:</span>
            {#if service.info.license.url}
              <a href={service.info.license.url} class="text-ab-blue hover:text-ab-dark-blue" target="_blank" rel="noopener"
                >{service.info.license.name}</a
              >
            {:else}
              {service.info.license.name}
            {/if}
          </p>
        {/if}
      </div>
    {/if}

    {@render children()}
  </div>
</div>
