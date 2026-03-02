<script lang="ts">
	import type { Snippet } from 'svelte';
	import { goto } from '$app/navigation';
	import AppSidebar from '$lib/components/AppSidebar.svelte';
	import type { Organization, Version, ApplicationMetadataVersion, Service } from '$generated/types';

	interface Props {
		data: {
			org: Organization;
			isMember: boolean;
			isAdmin: boolean;
			version: Version;
			service: Service;
			versions: ApplicationMetadataVersion[];
			isWatching: boolean;
			watchGuid?: string;
			session?: { id: string; user: { guid: string; email: string; nickname: string } };
		};
		children: Snippet;
	}

	let { data, children }: Props = $props();

	const version = $derived(data.version);
	const service = $derived(data.service);
	const versions = $derived(data.versions);
	const orgKey = $derived(version.organization.key);
	const appKey = $derived(version.application.key);

</script>

<svelte:head>
	<title>{service.name} {version.version} - {data.org.name} - API Builder</title>
</svelte:head>

<div class="flex gap-10">
	<AppSidebar
		{orgKey}
		{appKey}
		version={version.version}
		appName={service.name}
		isMember={data.isMember}
		isAdmin={data.isAdmin}
		isWatching={data.isWatching}
		watchGuid={data.watchGuid}
		isLoggedIn={data.session !== undefined}
	/>
	<div class="flex-1 min-w-0">
		<!-- App header -->
		<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
			<div>
				<h1 class="text-2xl font-bold text-ab-dark-blue">{service.name}</h1>
				{#if service.description}
					<p class="text-ab-gray mt-1">{service.description}</p>
				{/if}
			</div>
		</div>

		<!-- Version selector -->
		<div class="flex items-center gap-2 mb-8 text-sm">
			<label for="version-select" class="text-ab-gray font-medium">Version:</label>
			<select
				id="version-select"
				class="input-field text-sm py-1"
				value={version.version}
				onchange={(e) => {
					const target = e.currentTarget as HTMLSelectElement;
					goto(`/${orgKey}/${appKey}/${target.value}`);
				}}
			>
				{#each versions as v}
					<option value={v.version}>{v.version}</option>
				{/each}
			</select>
		</div>

		<!-- Info bar -->
		{#if service.base_url || service.info.contact || service.info.license}
			<div class="bg-ab-light-gray rounded-lg p-4 mb-6 text-sm space-y-1">
				{#if service.base_url}
					<p><span class="font-medium text-ab-dark-gray">Base URL:</span> <code class="text-ab-blue">{service.base_url}</code></p>
				{/if}
				{#if service.info.contact}
					<p>
						<span class="font-medium text-ab-dark-gray">Contact:</span>
						{#if service.info.contact.name}{service.info.contact.name}{/if}
						{#if service.info.contact.email}
							<a href="mailto:{service.info.contact.email}" class="text-ab-blue hover:text-ab-dark-blue">{service.info.contact.email}</a>
						{/if}
						{#if service.info.contact.url}
							<a href={service.info.contact.url} class="text-ab-blue hover:text-ab-dark-blue" target="_blank" rel="noopener">{service.info.contact.url}</a>
						{/if}
					</p>
				{/if}
				{#if service.info.license}
					<p>
						<span class="font-medium text-ab-dark-gray">License:</span>
						{#if service.info.license.url}
							<a href={service.info.license.url} class="text-ab-blue hover:text-ab-dark-blue" target="_blank" rel="noopener">{service.info.license.name}</a>
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
