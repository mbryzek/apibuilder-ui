<script lang="ts">
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import type { Service, Version } from '$generated/types';
	import SpecTabs from '$lib/components/spec/SpecTabs.svelte';

	interface Props {
		data: {
			service: Service;
			version: Version;
			versions: { version: string }[];
			isMember: boolean;
			isWatching: boolean;
			watchGuid?: string;
			session?: { id: string; user: { guid: string; email: string; nickname: string } };
		};
		form: {
			errors?: { message: string }[];
		} | null;
	}

	let { data, form }: Props = $props();

	const service = $derived(data.service);
	const version = $derived(data.version);
	const versions = $derived(data.versions);
	const orgKey = $derived(version.organization.key);
	const appKey = $derived(version.application.key);
	const versionBase = $derived(`/${orgKey}/${appKey}/${version.version}`);
	const exampleBaseUrl = $derived(`${versionBase}/example`);

	let searchQuery = $state('');
</script>

{#if form?.errors}
	<div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
		{#each form.errors as error}
			<p class="text-red-700 text-sm">{error.message}</p>
		{/each}
	</div>
{/if}

<!-- Toolbar: version + search on left, watch + upload on right -->
<div class="flex flex-wrap items-center gap-3 mb-6">
	<!-- Version selector -->
	<div class="flex items-center gap-2 text-sm">
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

	<!-- Search -->
	<div class="relative">
		<svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ab-gray pointer-events-none" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
		</svg>
		<input
			type="text"
			aria-label="Filter types by name"
			placeholder="Filter types by name..."
			bind:value={searchQuery}
			class="w-56 sm:w-64 input-field pl-9 pr-3 py-1.5 border rounded-lg text-sm"
		/>
	</div>

	<!-- Spacer -->
	<div class="flex-1"></div>

	<!-- Watch + Upload -->
	<div class="flex items-center gap-2">
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
					class="p-1.5 transition-colors {data.isWatching
						? 'text-ab-blue'
						: 'text-ab-gray hover:text-ab-blue'}"
				>
					<svg
						aria-hidden="true"
						class="w-5 h-5"
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
				class="px-3.5 py-1.5 text-sm font-medium rounded-md border border-ab-blue text-ab-blue hover:bg-ab-blue hover:text-white transition-colors"
			>
				+ Upload
			</a>
		{/if}
	</div>
</div>

<SpecTabs {service} {exampleBaseUrl} {searchQuery} />
