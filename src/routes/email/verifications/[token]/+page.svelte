<script lang="ts">
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
</script>

<svelte:head>
  <title>{data.verified ? 'Email Verified' : 'Email Not Verified'} - API Builder</title>
</svelte:head>

<div class="page-container">
  <div class="mx-auto mt-24 max-w-md text-center">
    {#if data.verified}
      <h1 class="text-ab-dark-blue mb-4 text-2xl font-bold">Email verified</h1>
      <p class="text-ab-gray mb-6">Thank you for confirming your email address.</p>
    {:else}
      <h1 class="text-ab-dark-blue mb-4 text-2xl font-bold">Email not verified</h1>
      <p class="text-ab-gray mb-6">{data.message}</p>
    {/if}
    <a href="/" class="btn-primary inline-block"> Continue to API Builder </a>
  </div>
</div>
