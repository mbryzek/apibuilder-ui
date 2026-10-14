<script lang="ts">
  import type { PublicSession } from '#lib/session.ts';
  import { afterNavigate } from '$app/navigation';
  import { displayName, initials } from '#lib/utils/account.ts';

  /**
   * The account menu: the one place the signed-in person reaches their profile and logs out
   * (rules/frontend.account.menu.mdc). It is the last row of the sidebar where the page has one,
   * the right end of the header otherwise, and the bottom of the slide-out menu on a phone.
   */
  interface Props {
    session: PublicSession;
    /** `up` at the bottom of a sidebar or the slide-out menu; `down` in the header. */
    placement: 'up' | 'down';
    /** `dark` on the blue header and slide-out menu; `light` in a sidebar. */
    tone: 'light' | 'dark';
    /** Called when an item is chosen, so a slide-out menu can close with it. */
    onChoose?: () => void;
  }

  let { session, placement, tone, onChoose }: Props = $props();

  let open = $state(false);
  let wrap = $state<HTMLElement | null>(null);

  const name = $derived(displayName(session.user));

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
      class="absolute z-50 w-56 rounded-lg border border-gray-100 bg-white py-1 shadow-lg {placement === 'up'
        ? 'bottom-full left-0 mb-2'
        : 'top-full right-0 mt-2'}"
      role="menu"
      aria-label="Account"
    >
      <a
        href="/account/profile"
        role="menuitem"
        class="hover:bg-ab-light-gray flex items-center gap-2 px-4 py-2 text-sm text-gray-700 transition-colors"
        onclick={choose}
      >
        <svg class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          ></path>
        </svg>
        Your Profile
      </a>
      <!-- A POST form, never a link: GET /logout deliberately logs nobody out. Choosing it does not
           close the menu, because unmounting the form inside its own click cancels the submit;
           the navigation the submit causes closes it. -->
      <form method="POST" action="/logout">
        <button
          type="submit"
          role="menuitem"
          class="hover:bg-ab-light-gray flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 transition-colors"
          onclick={() => onChoose?.()}
        >
          <svg class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            ></path>
          </svg>
          Log out
        </button>
      </form>
    </div>
  {/if}

  <button
    type="button"
    class="flex w-full min-w-0 items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium transition-colors {tone === 'dark'
      ? 'text-white hover:bg-white/10'
      : 'text-ab-dark-blue hover:bg-ab-light-gray'}"
    onclick={() => (open = !open)}
    aria-haspopup="menu"
    aria-expanded={open}
    aria-label="Account menu"
  >
    <span
      class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold {tone === 'dark'
        ? 'text-ab-blue bg-white'
        : 'bg-ab-blue text-white'}"
    >
      {initials(name)}
    </span>
    <span class="min-w-0 flex-1 truncate text-left">{name}</span>
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
