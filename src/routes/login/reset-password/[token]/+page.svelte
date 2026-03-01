<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ApiErrorItem } from '$lib/api/error-handler';

	interface Props {
		data: { token: string };
		form: { errors?: ApiErrorItem[] } | null;
	}

	let { form }: Props = $props();

	let isSubmitting = $state(false);

	const errors = $derived(form?.errors ?? []);
</script>

<svelte:head>
	<title>Reset Password - API Builder</title>
</svelte:head>

<div class="page-container">
	<div class="max-w-md mx-auto mt-12">
		<h1 class="text-2xl font-bold text-ab-dark-blue text-center mb-8">Set New Password</h1>

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
					<label for="password" class="block text-sm font-medium text-ab-dark-blue mb-1">New Password</label>
					<input
						type="password"
						id="password"
						name="password"
						required
						autocomplete="new-password"
						class="w-full input-field px-3 py-2 border rounded-lg"
					/>
				</div>

				<div>
					<label for="confirm_password" class="block text-sm font-medium text-ab-dark-blue mb-1">Confirm Password</label>
					<input
						type="password"
						id="confirm_password"
						name="confirm_password"
						required
						autocomplete="new-password"
						class="w-full input-field px-3 py-2 border rounded-lg"
					/>
				</div>

				<button
					type="submit"
					disabled={isSubmitting}
					class="w-full btn-primary"
				>
					{isSubmitting ? 'Resetting...' : 'Reset Password'}
				</button>
			</div>
		</form>

		<p class="mt-4 text-center text-sm text-ab-gray">
			<a href="/login" class="text-ab-blue hover:text-ab-dark-blue transition-colors">
				Back to login
			</a>
		</p>
	</div>
</div>
