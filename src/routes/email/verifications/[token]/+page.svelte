<script lang="ts">
  /**
   * Three states: `verified`, `invalid` (a token the platform does not hold) and `unavailable`
   * (our side failing while the link is still good, so the page offers it again).
   */
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  const HEADINGS = {
    verified: 'Email verified',
    invalid: 'This link is no longer valid',
    unavailable: 'We could not verify your email'
  };

  let heading = $derived(HEADINGS[data.outcome]);
</script>

<svelte:head>
  <title>{heading} - API Builder</title>
</svelte:head>

<div class="page-container">
  <div class="mx-auto mt-24 max-w-md text-center" data-testid="email-verification-{data.outcome}">
    <h1 class="text-ab-dark-blue mb-4 text-2xl font-bold">{heading}</h1>
    {#if data.outcome === 'verified'}
      <p class="text-ab-gray mb-6">Thank you for confirming your email address.</p>
      <a href="/" class="btn-primary inline-block"> Continue to API Builder </a>
    {:else if data.outcome === 'invalid'}
      <p class="text-ab-gray mb-6">That verification link is no longer valid. Please request a new one.</p>
      <a href="/" class="btn-primary inline-block"> Continue to API Builder </a>
    {:else}
      <p class="text-ab-gray mb-6">Something went wrong on our end. Your link is still good. Try again in a few minutes.</p>
      <a href={data.retryUrl} class="btn-primary inline-block" data-sveltekit-reload>Try Again</a>
    {/if}
  </div>
</div>
