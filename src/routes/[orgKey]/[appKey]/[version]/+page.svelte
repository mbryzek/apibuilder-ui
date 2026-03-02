<script lang="ts">
	import type { Service, Version } from '$generated/types';
	import SpecTabs from '$lib/components/spec/SpecTabs.svelte';
	import { config } from '$lib/config';

	interface Props {
		data: {
			service: Service;
			version: Version;
		};
		form: {
			errors?: { message: string }[];
		} | null;
	}

	let { data, form }: Props = $props();

	const service = $derived(data.service);
	const version = $derived(data.version);
	const exampleBaseUrl = $derived(`${config.apiBaseUrl}/${version.organization.key}/${version.application.key}/${version.version}/example`);
</script>

{#if form?.errors}
	<div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
		{#each form.errors as error}
			<p class="text-red-700 text-sm">{error.message}</p>
		{/each}
	</div>
{/if}

<SpecTabs {service} {exampleBaseUrl} />
