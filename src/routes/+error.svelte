<script lang="ts">
	import { page } from '$app/state';
</script>

<svelte:head>
	<title>Error {page.status} - API Builder</title>
</svelte:head>

<div class="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
	<h1 class="text-6xl font-bold text-ab-dark-blue mb-4">{page.status}</h1>
	<p class="text-xl text-ab-dark-gray mb-6">
		{#if page.status === 404}
			The page you're looking for doesn't exist.
		{:else if page.status === 403}
			You don't have permission to access this page.
		{:else if page.status === 500}
			Something went wrong on our end. Please try again.
		{:else}
			{page.error?.message ?? 'An unexpected error occurred.'}
		{/if}
	</p>
	<a href="/" class="btn-primary">Back to Home</a>
</div>
