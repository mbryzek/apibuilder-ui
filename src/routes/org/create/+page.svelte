<script lang="ts">
	import { enhance } from '$app/forms';
	import { Visibility } from '$generated/com-bryzek-apibuilder-v0';
	import type { ApiErrorItem } from '$lib/api/error-handler';

	interface Props {
		form: { errors?: ApiErrorItem[] } | null;
	}

	let { form }: Props = $props();

	let isSubmitting = $state(false);

	const errors = $derived(form?.errors ?? []);
</script>

<svelte:head>
	<title>Create Organization - API Builder</title>
</svelte:head>

<div class="page-container">
	<div class="max-w-lg mx-auto">
		<h1 class="text-2xl font-bold text-ab-dark-blue mb-8">Create Organization</h1>

		{#if errors.length > 0}
			<div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
				{#each errors as error}
					<p class="text-red-800 text-sm">{error.message}</p>
				{/each}
			</div>
		{/if}

		<form
			method="POST"
			use:enhance={() => {
				isSubmitting = true;
				return async ({ update }) => {
					isSubmitting = false;
					await update();
				};
			}}
		>
			<div class="space-y-4">
				<div>
					<label for="name" class="block text-sm font-medium text-ab-dark-blue mb-1">Name <span class="text-ab-error-red">*</span></label>
					<input
						type="text"
						id="name"
						name="name"
						required
						class="w-full input-field px-3 py-2 border rounded-lg"
					/>
				</div>

				<div>
					<label for="namespace" class="block text-sm font-medium text-ab-dark-blue mb-1">Namespace <span class="text-ab-error-red">*</span></label>
					<input
						type="text"
						id="namespace"
						name="namespace"
						required
						placeholder="e.g. com.example"
						class="w-full input-field px-3 py-2 border rounded-lg"
					/>
				</div>

				<div>
					<label for="key" class="block text-sm font-medium text-ab-dark-blue mb-1">Key</label>
					<input
						type="text"
						id="key"
						name="key"
						placeholder="Auto-generated from name if left blank"
						class="w-full input-field px-3 py-2 border rounded-lg"
					/>
					<p class="text-xs text-ab-gray mt-1">Used in URLs. Auto-generated if left blank.</p>
				</div>

				<div>
					<label for="visibility" class="block text-sm font-medium text-ab-dark-blue mb-1">Visibility</label>
					<select
						id="visibility"
						name="visibility"
						class="w-full input-field px-3 py-2 border rounded-lg"
					>
						{#each Object.values(Visibility) as v}
							<option value={v} selected={v === Visibility.Organization}>{v}</option>
						{/each}
					</select>
				</div>

				<div class="flex gap-4 pt-4">
					<button
						type="submit"
						disabled={isSubmitting}
						class="btn-primary"
					>
						{isSubmitting ? 'Creating...' : 'Create Organization'}
					</button>
					<a href="/" class="btn-secondary inline-flex items-center">
						Cancel
					</a>
				</div>
			</div>
		</form>
	</div>
</div>
