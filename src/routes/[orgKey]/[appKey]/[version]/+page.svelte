<script lang="ts">
	import { goto } from '$app/navigation';
	import type { Service, Version } from '$generated/types';
	import SpecTabs from '$lib/components/spec/SpecTabs.svelte';

	interface Props {
		data: {
			service: Service;
			version: Version;
			versions: { version: string }[];
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
	const exampleBaseUrl = $derived(`/${orgKey}/${appKey}/${version.version}/example`);
</script>

{#if form?.errors}
	<div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
		{#each form.errors as error}
			<p class="text-red-700 text-sm">{error.message}</p>
		{/each}
	</div>
{/if}

<!-- Version selector -->
<div class="flex items-center gap-2 mb-6 text-sm">
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

<SpecTabs {service} {exampleBaseUrl} />
