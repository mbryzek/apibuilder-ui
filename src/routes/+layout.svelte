<script lang="ts">
  import type { PublicSession } from '#lib/session.ts';
  import '../app.css';
  import Header from '#lib/components/Header.svelte';
  import Footer from '#lib/components/Footer.svelte';
  import Toast from '#lib/components/Toast.svelte';
  import type { Flash } from '#lib/flash.ts';
  import type { MyOrgs } from '#lib/my-orgs.ts';
  import type { Snippet } from 'svelte';
  import { afterNavigate } from '$app/navigation';
  import { registerScreenReport } from '#lib/telemetry/browser.ts';

  interface Props {
    data: { session?: PublicSession; myOrgs?: Promise<MyOrgs>; flash?: Flash; screenView?: string };
    children: Snippet;
  }

  let { data, children }: Props = $props();

  // The screen report's browser half (DES-65431): every call the browser makes, time to show, INP
  // and the finished-loading mark, sent once when the view ends. The hard load's view id is the one
  // the server hook minted, handed over by the root layout's load.
  // svelte-ignore state_referenced_locally
  registerScreenReport({ view: data?.screenView });

  const session = $derived(data?.session);

  // The flash comes from the root server load, which reads the one-shot cookie the redirect set and
  // clears it. Reading it from `$page.url` instead let any link render its own text as our toast.
  //
  // Derived rather than copied into state by an effect, so the toast is in the server-rendered HTML
  // rather than appearing a beat later on hydration. Dismissal records WHICH flash was dismissed,
  // so the next one still shows.
  let dismissed = $state<Flash | null>(null);
  const flash = $derived(data?.flash && data.flash !== dismissed ? data.flash : null);

  function handleDismissFlash() {
    dismissed = data?.flash ?? null;
  }

  // THE BROWSER SUITE'S HYDRATION SIGNAL. A click that beats hydration is not intercepted by the
  // client router, so it does a full document load — which is also exactly what a blocked
  // hydration bootstrap looks like, so a test that clicks without waiting for this cannot tell the
  // two apart, and a loaded machine turns the race into a red. `afterNavigate` runs once the
  // component has mounted, initial hydration included, which is the moment handlers are attached
  // and the router is live. The attribute stays set across client-side navigations: the app
  // hydrates once per document, and a soft navigation happens because it already had.
  afterNavigate(({ shallow, type }) => {
    if (shallow && type === 'goto') return;

    document.body.dataset['hydrated'] = 'true';
  });
</script>

<svelte:head>
  <title>API Builder</title>
</svelte:head>

<div class="flex min-h-screen flex-col">
  <Header {session} myOrgs={data?.myOrgs} />

  {#if flash}
    <Toast message={flash.message} variant={flash.type} onDismiss={handleDismissFlash} />
  {/if}

  <main class="flex-1">
    {@render children()}
  </main>

  <Footer />
</div>
