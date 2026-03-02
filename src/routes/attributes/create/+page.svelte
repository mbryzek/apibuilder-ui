<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ApiErrorItem } from '$lib/api/error-handler';

	interface Props {
		form: { errors?: ApiErrorItem[] } | null;
	}

	let { form: formResult }: Props = $props();
	let isSubmitting = $state(false);
</script>

<svelte:head>
	<title>Create Attribute - API Builder</title>
</svelte:head>

<div>
	<div class="mb-6">
		<a href="/attributes" class="text-ab-blue hover:text-ab-dark-blue text-sm">&larr; Back to Attributes</a>
	</div>

	<h1 class="text-2xl font-bold text-ab-dark-blue mb-6">Create Attribute</h1>

	{#if formResult?.errors}
		<div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
			{#each formResult.errors as err}
				<p class="text-red-800 text-sm">{err.message}</p>
			{/each}
		</div>
	{/if}

	<div class="card">
		<form method="POST" use:enhance={() => { isSubmitting = true; return async ({ update }) => { isSubmitting = false; await update(); }; }}>
			<div class="mb-4">
				<label for="name" class="block text-sm font-semibold text-ab-dark-blue mb-1">Name</label>
				<input
					type="text"
					id="name"
					name="name"
					required
					placeholder="Attribute name"
					class="input-field w-full"
				/>
			</div>
			<div class="mb-4">
				<label for="description" class="block text-sm font-semibold text-ab-dark-blue mb-1">Description</label>
				<textarea
					id="description"
					name="description"
					placeholder="Optional description"
					rows="3"
					class="input-field w-full"
				></textarea>
			</div>
			<button type="submit" class="btn-primary" disabled={isSubmitting}>
				{isSubmitting ? 'Creating...' : 'Create Attribute'}
			</button>
		</form>
	</div>
</div>
