<script lang="ts">
	import type { Snippet } from 'svelte';
	import { enhance } from '$app/forms';
	import AppSidebar from '$lib/components/AppSidebar.svelte';
	import type { Organization, Version, Service } from '$generated/types';

	interface Props {
		data: {
			org: Organization;
			isMember: boolean;
			isAdmin: boolean;
			version: Version;
			service: Service;
			versions: { version: string }[];
			isWatching: boolean;
			watchGuid?: string;
			session?: { id: string; user: { guid: string; email: string; nickname: string } };
		};
		children: Snippet;
	}

	let { data, children }: Props = $props();

	const version = $derived(data.version);
	const service = $derived(data.service);
	const orgKey = $derived(version.organization.key);
	const appKey = $derived(version.application.key);
	const versionBase = $derived(`/${orgKey}/${appKey}/${version.version}`);
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
		isLoggedIn={data.session !== undefined}
	/>
	<div class="flex-1 min-w-0">
		<!-- App header with actions -->
		<div class="mb-6 flex items-start justify-between gap-4">
			<div>
				{#if service.description}
					<p class="text-ab-gray">{service.description}</p>
				{/if}
			</div>
			<div class="flex items-center gap-2 shrink-0">
				{#if data.session}
					<form
						method="POST"
						action="{versionBase}?/{data.isWatching ? 'unwatch' : 'watch'}"
						use:enhance
					>
						{#if data.isWatching && data.watchGuid}
							<input type="hidden" name="watch_guid" value={data.watchGuid} />
						{/if}
						<button
							type="submit"
							title={data.isWatching ? 'Unwatch this application' : 'Watch this application'}
							class="p-1 transition-colors {data.isWatching
								? 'text-ab-blue'
								: 'text-ab-gray hover:text-ab-blue'}"
						>
							<svg
								aria-hidden="true"
								class="w-4 h-4"
								viewBox="0 0 24 24"
								stroke="currentColor"
								stroke-width="1.5"
								fill={data.isWatching ? 'currentColor' : 'none'}
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178z"
								/>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
								/>
							</svg>
						</button>
					</form>
				{/if}
				{#if data.isMember}
					<a
						href="/{orgKey}/upload"
						class="px-3 py-1 text-xs font-medium rounded-md border border-ab-blue text-ab-blue hover:bg-ab-blue hover:text-white transition-colors"
					>
						+ Upload
					</a>
				{/if}
			</div>
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
