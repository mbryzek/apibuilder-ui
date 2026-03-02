<script lang="ts">
	import type { Snippet } from 'svelte';
	import { goto } from '$app/navigation';
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

<div>
	<!-- App header -->
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
		<div>
			<h1 class="text-2xl font-bold text-ab-dark-blue">{service.name}</h1>
			{#if service.description}
				<p class="text-ab-gray mt-1">{service.description}</p>
			{/if}
		</div>
	</div>

	<!-- Action bar -->
	<div class="flex flex-wrap items-center gap-3 mb-8 text-sm">
		<!-- Version selector -->
		<div class="flex items-center gap-2">
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

		<span class="text-gray-300 hidden sm:inline">|</span>

		<!-- Links -->
		{#if data.isMember}
			<a href="/{orgKey}/upload" class="text-ab-blue hover:text-ab-dark-blue">Upload new version</a>
			<span class="text-gray-300">|</span>
		{/if}

		<a href="/{orgKey}/{appKey}/{version.version}/original" class="text-ab-blue hover:text-ab-dark-blue" data-sveltekit-preload-data="off">Original</a>
		<span class="text-gray-300">|</span>
		<a href="/{orgKey}/{appKey}/{version.version}/service.json" class="text-ab-blue hover:text-ab-dark-blue" data-sveltekit-preload-data="off">service.json</a>
		<span class="text-gray-300">|</span>
		<a href="/{orgKey}/{appKey}/{version.version}/history" class="text-ab-blue hover:text-ab-dark-blue">History</a>

		{#if data.isMember}
			<span class="text-gray-300">|</span>
			<a href="/{orgKey}/{appKey}/{version.version}/settings" class="text-ab-blue hover:text-ab-dark-blue">Settings</a>
		{/if}

		{#if data.session}
			<span class="text-gray-300">|</span>
			{#if data.isWatching}
				<form method="POST" action="/{orgKey}/{appKey}/{version.version}?/unwatch" class="inline">
					<input type="hidden" name="watch_guid" value={data.watchGuid ?? ''} />
					<button type="submit" class="text-ab-blue hover:text-ab-dark-blue">Unwatch</button>
				</form>
			{:else}
				<form method="POST" action="/{orgKey}/{appKey}/{version.version}?/watch" class="inline">
					<button type="submit" class="text-ab-blue hover:text-ab-dark-blue">Watch</button>
				</form>
			{/if}
		{/if}
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
