<script lang="ts">
	import { enhance } from '$app/forms';
	import type { Organization } from '$generated/com-bryzek-apibuilder-v0';
	import { Visibility, OriginalType } from '$generated/com-bryzek-apibuilder-v0';

	interface Props {
		data: {
			org: Organization;
			isMember: boolean;
		};
		form: {
			errors?: { message: string }[];
			appKey?: string;
			visibility?: string;
			specType?: string;
		} | null;
	}

	let { data, form }: Props = $props();

	const org = $derived(data.org);
	let isSubmitting = $state(false);
	let fileName = $state('');
</script>

<svelte:head>
	<title>Upload API - {org.name} - API Builder</title>
</svelte:head>

<div class="max-w-2xl">
	<h1 class="text-2xl font-bold text-ab-dark-blue mb-6">Upload API Specification</h1>

	{#if form?.errors}
		<div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
			{#each form.errors as error}
				<p class="text-red-700 text-sm">{error.message}</p>
			{/each}
		</div>
	{/if}

	<form
		method="POST"
		enctype="multipart/form-data"
		use:enhance={() => {
			isSubmitting = true;
			return async ({ update }) => {
				isSubmitting = false;
				await update();
			};
		}}
		class="space-y-5"
	>
		<div>
			<label for="file" class="block text-sm font-medium text-gray-700 mb-1">API Specification File</label>
			<div class="relative">
				<input
					type="file"
					id="file"
					name="file"
					accept=".json"
					required
					class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-ab-blue file:text-white hover:file:bg-ab-light-blue file:cursor-pointer"
					onchange={(e) => {
						const input = e.currentTarget as HTMLInputElement;
						fileName = input.files?.[0]?.name ?? '';
					}}
				/>
			</div>
			{#if fileName}
				<p class="text-sm text-ab-gray mt-1">Selected: {fileName}</p>
			{/if}
		</div>

		<div>
			<label for="spec_type" class="block text-sm font-medium text-gray-700 mb-1">Format</label>
			<select
				id="spec_type"
				name="spec_type"
				class="input-field w-full"
				value={form?.specType ?? ''}
			>
				{#each Object.values(OriginalType) as t}
					<option value={t}>{t}</option>
				{/each}
			</select>
		</div>

		<div>
			<label for="app_key" class="block text-sm font-medium text-gray-700 mb-1">
				Application Key
				<span class="text-ab-gray font-normal">(optional — derived from spec name if omitted)</span>
			</label>
			<input
				type="text"
				id="app_key"
				name="app_key"
				class="input-field w-full"
				placeholder="e.g. my-api"
				value={form?.appKey ?? ''}
			/>
		</div>

		<div>
			<label for="visibility" class="block text-sm font-medium text-gray-700 mb-1">Visibility</label>
			<select
				id="visibility"
				name="visibility"
				class="input-field w-full"
				value={form?.visibility ?? 'organization'}
			>
				{#each Object.values(Visibility) as v}
					<option value={v}>{v}</option>
				{/each}
			</select>
		</div>

		<div class="flex gap-3 pt-2">
			<button type="submit" class="btn-primary" disabled={isSubmitting}>
				{isSubmitting ? 'Uploading...' : 'Upload'}
			</button>
			<a href="/{org.key}" class="btn-secondary inline-block text-center">Cancel</a>
		</div>
	</form>
</div>
