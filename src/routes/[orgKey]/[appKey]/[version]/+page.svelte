<script lang="ts">
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import type { Service } from '$generated/com-bryzek-apibuilder-spec-v0';
	import SpecTabs from '$lib/components/spec/SpecTabs.svelte';

	interface Props {
		data: {
			service: Service;
			version: { version: string };
			versions: { version: string }[];
			isMember: boolean;
			isWatching: boolean;
			watchGuid?: string;
			session?: { id: string; user: { id: string; person: { email?: { address: string } } } };
		};
		form: {
			errors?: { message: string }[];
		} | null;
	}

	let { data, form }: Props = $props();

	const service = $derived(data.service);
	const version = $derived(data.version);
	const versions = $derived(data.versions);
	const orgKey = $derived($page.params.orgKey);
	const appKey = $derived($page.params.appKey);
	const versionBase = $derived(`/${orgKey}/${appKey}/${version.version}`);
	const exampleBaseUrl = $derived(`${versionBase}/example`);

	let searchQuery = $state('');
	let showDeleteConfirm = $state(false);
	let isDeleting = $state(false);
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
					{#if data.isWatching}
						<svg aria-hidden="true" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
							<path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
						</svg>
					{:else}
						<svg aria-hidden="true" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
						</svg>
					{/if}
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
			{#if !showDeleteConfirm}
				<button
					type="button"
					class="px-3.5 py-1.5 text-sm font-medium rounded-md border border-red-300 text-red-600 hover:bg-red-600 hover:text-white transition-colors"
					onclick={() => (showDeleteConfirm = true)}
				>
					Delete Version
				</button>
			{/if}
		{/if}
	</div>
</div>

{#if showDeleteConfirm}
	<div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
		<p class="text-sm text-red-700 font-medium mb-3">
			Are you sure you want to delete version <strong>{version.version}</strong>? This action cannot be undone.
		</p>
		<div class="flex gap-3">
			<form
				method="POST"
				action="{versionBase}?/deleteVersion"
				use:enhance={() => {
					isDeleting = true;
					return async ({ update }) => {
						isDeleting = false;
						await update();
					};
				}}
			>
				<button type="submit" class="btn-danger" disabled={isDeleting}>
					{isDeleting ? 'Deleting...' : 'Yes, Delete Version'}
				</button>
			</form>
			<button class="btn-secondary" onclick={() => (showDeleteConfirm = false)}>
				Cancel
			</button>
		</div>
	</div>
{/if}

<SpecTabs {service} {exampleBaseUrl} {searchQuery} />
