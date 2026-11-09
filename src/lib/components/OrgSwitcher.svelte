<script lang="ts">
  import { page } from '$app/state';
  import { afterNavigate } from '$app/navigation';
  import type { MyOrgs } from '#lib/my-orgs.ts';

  /**
   * The organization switcher: on every signed-in page, the member's organizations with the one
   * being viewed marked, and Create organization. It sits in the header beside the account menu,
   * never inside it: the account menu holds the person's profile and log out alone
   * (rules/frontend.account.menu.mdc).
   *
   * The list streams from the root layout, so the button renders at once and the menu fills when
   * the memberships read answers.
   */
  interface Props {
    myOrgs: Promise<MyOrgs> | undefined;
    /** `down` in the header; `up` at the bottom of the slide-out menu. */
    placement: 'up' | 'down';
    /** Called when an item is chosen, so a slide-out menu can close with it. */
    onChoose?: () => void;
  }

  let { myOrgs, placement, onChoose }: Props = $props();

  let open = $state(false);
  let wrap = $state<HTMLElement | null>(null);
  let resolved = $state<MyOrgs | null>(null);

  $effect(() => {
    let current = true;
    resolved = null;
    void myOrgs?.then((value) => {
      if (current) resolved = value;
    });
    return () => {
      current = false;
    };
  });

  const currentKey = $derived(page.params['orgKey']);
  const currentOrg = $derived(resolved?.orgs.find((org) => org.key === currentKey));
  const label = $derived(currentOrg?.name ?? 'Organizations');

  afterNavigate(({ shallow, type }) => {
    if (shallow && type === 'goto') return;

    open = false;
  });

  // Light-dismiss on an outside click or Escape.
  $effect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent): void {
      if (wrap && !wrap.contains(event.target as Node)) open = false;
    }
    function onKeydown(event: KeyboardEvent): void {
      if (event.key === 'Escape') open = false;
    }
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeydown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeydown);
    };
  });

  function choose(): void {
    open = false;
    onChoose?.();
  }
</script>

<div class="relative min-w-0" bind:this={wrap}>
  {#if open}
    <div
      class="absolute z-50 w-64 rounded-lg border border-gray-100 bg-white py-1 shadow-lg {placement === 'up'
        ? 'bottom-full left-0 mb-2'
        : 'top-full right-0 mt-2'}"
      role="menu"
      aria-label="Organizations"
    >
      {#if resolved === null}
        <p class="text-ab-gray px-4 py-2 text-sm">Loading…</p>
      {:else}
        {#if resolved.loadError}
          <p class="px-4 py-2 text-sm text-red-700" role="alert">{resolved.loadError.message}</p>
        {/if}
        {#each resolved.orgs as org (org.key)}
          <a
            href="/{org.key}"
            role="menuitem"
            aria-current={org.key === currentKey ? 'page' : undefined}
            class="hover:bg-ab-light-gray flex items-center gap-2 px-4 py-2 text-sm transition-colors {org.key === currentKey
              ? 'text-ab-dark-blue font-semibold'
              : 'text-gray-700'}"
            onclick={choose}
          >
            <svg
              class="h-4 w-4 shrink-0 {org.key === currentKey ? '' : 'invisible'}"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span class="min-w-0 flex-1 truncate">{org.name}</span>
          </a>
        {/each}
      {/if}
      <div class="my-1 border-t border-gray-100"></div>
      <a
        href="/org/create"
        role="menuitem"
        class="hover:bg-ab-light-gray flex items-center gap-2 px-4 py-2 text-sm text-gray-700 transition-colors"
        onclick={choose}
      >
        <svg class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
        </svg>
        Create organization
      </a>
    </div>
  {/if}

  <button
    type="button"
    class="flex w-full min-w-0 items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
    onclick={() => (open = !open)}
    aria-haspopup="menu"
    aria-expanded={open}
    aria-label="Switch organization"
  >
    <svg class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
      ></path>
    </svg>
    <span class="max-w-40 min-w-0 flex-1 truncate text-left">{label}</span>
    <svg
      class="h-4 w-4 shrink-0 transition-transform {open === (placement === 'down') ? 'rotate-180' : ''}"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
    </svg>
  </button>
</div>
