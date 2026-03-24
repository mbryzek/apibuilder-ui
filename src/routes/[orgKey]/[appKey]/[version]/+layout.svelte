<script lang="ts">
	import type { Snippet } from 'svelte';
	import { page } from '$app/stores';
	import AppSidebar from '$lib/components/AppSidebar.svelte';
	import type { Organization } from '$generated/com-bryzek-apibuilder';
	import type { Service } from '$generated/com-bryzek-apibuilder-spec';

	interface Props {
		data: {
			org: Organization;
			isMember: boolean;
			isAdmin: boolean;
			version: { version: string };
			service: Service;
			versions: { version: string }[];
			isWatching: boolean;
			watchGuid?: string;
			session?: { id: string; user: { id: string; person: { email?: { address: string } } } };
		};
		children: Snippet;
	}

	let { data, children }: Props = $props();

	const version = $derived(data.version);
	const service = $derived(data.service);
	const orgKey = $derived($page.params.orgKey ?? '');
	const appKey = $derived($page.params.appKey ?? '');
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
	/>
	<div class="flex-1 min-w-0">
		{#if service.description}
			<p class="text-ab-gray mb-4">{service.description}</p>
		{/if}

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
