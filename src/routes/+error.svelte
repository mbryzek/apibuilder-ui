<script lang="ts">
  import { page } from '$app/state';
</script>

<svelte:head>
  <title>Error {page.status} - API Builder</title>
</svelte:head>

<div class="flex min-h-[50vh] flex-col items-center justify-center px-6 text-center">
  <h1 class="text-ab-dark-blue mb-6 text-7xl font-light">{page.status}</h1>
  <p class="text-ab-dark-gray mb-8 text-xl">
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
