<script lang="ts">
	import { enhance } from '$app/forms';

	interface Props {
		form: { success?: boolean; errors?: { message: string }[] } | null;
	}

	let { form }: Props = $props();

	let isSubmitting = $state(false);

	const success = $derived(form?.success ?? false);
	const errors = $derived(form?.errors ?? []);
</script>

<svelte:head>
	<title>Forgot Password - API Builder</title>
</svelte:head>

<div class="page-container">
	<div class="max-w-md mx-auto mt-12">
		<h1 class="text-2xl font-bold text-ab-dark-blue text-center mb-8">Reset Your Password</h1>

		{#if success}
			<div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
				<p class="text-green-800 text-sm">
					If an account exists with that email address, you will receive a password reset link shortly.
				</p>
			</div>
		{/if}

		{#if errors.length > 0}
			<div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
				{#each errors as error}
					<p class="text-red-800 text-sm">{error.message}</p>
				{/each}
			</div>
		{/if}

		{#if !success}
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
						<label for="email" class="block text-sm font-medium text-ab-dark-blue mb-1">Email</label>
						<input
							type="email"
							id="email"
							name="email"
							required
							autocomplete="email"
							class="w-full input-field px-3 py-2 border rounded-lg"
						/>
					</div>

					<button
						type="submit"
						disabled={isSubmitting}
						class="w-full btn-primary"
					>
						{isSubmitting ? 'Sending...' : 'Send Reset Link'}
					</button>
				</div>
			</form>
		{/if}

		<p class="mt-4 text-center text-sm text-ab-gray">
			<a href="/login" class="text-ab-blue hover:text-ab-dark-blue transition-colors">
				Back to login
			</a>
		</p>
	</div>
</div>
