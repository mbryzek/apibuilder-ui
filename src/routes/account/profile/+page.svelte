<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ApiErrorItem } from '$lib/api/error-handler';
	import type { User } from '$generated/com-bryzek-bryzek-apibuilder-v0';

	interface Props {
		data: { user: User };
		form: { errors?: ApiErrorItem[] } | null;
	}

	let { data, form }: Props = $props();

	let isSubmitting = $state(false);

	const errors = $derived(form?.errors ?? []);
	const user = $derived(data.user);
</script>

<svelte:head>
	<title>Edit Profile - API Builder</title>
</svelte:head>

<div class="page-container">
	<div class="max-w-lg mx-auto">
		<h1 class="text-2xl font-bold text-ab-dark-blue mb-8">Edit Profile</h1>

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
					<label for="email" class="block text-sm font-medium text-ab-dark-blue mb-1">Email</label>
					<input
						type="email"
						id="email"
						name="email"
						required
						value={user.email}
						class="w-full input-field px-3 py-2 border rounded-lg"
					/>
				</div>

				<div>
					<label for="nickname" class="block text-sm font-medium text-ab-dark-blue mb-1">Nickname</label>
					<input
						type="text"
						id="nickname"
						name="nickname"
						required
						value={user.nickname}
						class="w-full input-field px-3 py-2 border rounded-lg"
					/>
				</div>

				<div>
					<label for="name" class="block text-sm font-medium text-ab-dark-blue mb-1">Name</label>
					<input
						type="text"
						id="name"
						name="name"
						value={user.name ?? ''}
						class="w-full input-field px-3 py-2 border rounded-lg"
					/>
				</div>

				<div class="flex gap-4 pt-4">
					<button
						type="submit"
						disabled={isSubmitting}
						class="btn-primary"
					>
						{isSubmitting ? 'Saving...' : 'Save'}
					</button>
					<a href="/" class="btn-secondary inline-flex items-center">
						Cancel
					</a>
				</div>
			</div>
		</form>
	</div>
</div>
