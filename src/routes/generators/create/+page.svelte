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
	<title>Register Generator Service - API Builder</title>
</svelte:head>

<div class="page-container">
	<div class="mb-6">
		<a href="/generators" class="text-ab-blue hover:text-ab-dark-blue text-sm">&larr; Back to Generators</a>
	</div>

	<h1 class="text-2xl font-bold text-ab-dark-blue mb-6">Register Generator Service</h1>

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
				<label for="uri" class="block text-sm font-semibold text-ab-dark-blue mb-1">URI</label>
				<input
					type="url"
					id="uri"
					name="uri"
					required
					placeholder="https://example.com/generator"
					class="input-field w-full"
				/>
				<p class="text-sm text-ab-gray mt-1">The URI of the generator service to register.</p>
			</div>
			<button type="submit" class="btn-primary" disabled={isSubmitting}>
				{isSubmitting ? 'Registering...' : 'Register'}
			</button>
		</form>
	</div>
</div>
