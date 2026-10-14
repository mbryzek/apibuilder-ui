<script lang="ts">
  import type { PublicSession } from '#lib/session.ts';
  import { page } from '$app/state';
  import AccountMenu from '#lib/components/AccountMenu.svelte';
  /**
   * App Header Component
   * Main navigation header with API Builder branding
   */

  interface Props {
    session?: PublicSession | undefined;
  }

  let { session }: Props = $props();

  let mobileMenuOpen = $state(false);

  // Every page under an organization renders OrgSidebar or AppSidebar, and the account menu is the
  // last row of that sidebar there. An error page renders inside the root layout alone, so it has
  // no sidebar and the menu stays in the header.
  const hasSidebar = $derived((page.route.id?.startsWith('/[orgKey]') ?? false) && !page.error);

  function closeMobileMenu() {
    mobileMenuOpen = false;
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && mobileMenuOpen) {
      mobileMenuOpen = false;
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- Overlay for mobile menu -->
{#if mobileMenuOpen}
  <button class="fixed inset-0 z-30 bg-black/30 md:hidden" onclick={closeMobileMenu} aria-label="Close menu"></button>
{/if}

<header class="bg-ab-blue relative z-40 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)]">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div class="flex h-16 items-center justify-between">
      <!-- Brand -->
      <div class="flex items-center">
        <a href="/" class="text-lg font-bold tracking-wide text-white sm:text-xl">
          API <span class="font-light">|</span> BUILDER
        </a>
      </div>

      <!-- Desktop Navigation -->
      <div class="hidden items-center space-x-6 md:flex">
        <!-- Center nav -->

        <a href="/doc" class="text-sm font-medium text-white/80 transition-colors hover:text-white">Docs</a>

        <a
          href="https://github.com/apicollective/apibuilder"
          target="_blank"
          rel="noopener noreferrer"
          class="text-sm font-medium text-white/80 transition-colors hover:text-white">GitHub</a
        >

        <a href="/doc/start" class="text-sm font-medium text-white/80 transition-colors hover:text-white">For AI Agents</a>

        <a href="/generators" class="text-sm font-medium text-white/80 transition-colors hover:text-white">Generators</a>

        {#if session}
          <!-- Search form -->
          <form action="/search" method="GET" class="flex items-center">
            <input
              type="text"
              name="q"
              placeholder="Search..."
              class="w-40 rounded-md border-0 bg-white/10 px-3 py-1.5 text-sm text-white placeholder-white/50 transition-colors focus:bg-white/20 focus:ring-1 focus:ring-white/50 lg:w-56"
            />
          </form>

          {#if !hasSidebar}
            <AccountMenu {session} placement="down" tone="dark" />
          {/if}
        {:else}
          <a
            href="/login"
            class="text-ab-blue rounded-full bg-white px-5 py-2 text-sm font-semibold transition-all duration-200 ease-out hover:scale-110"
          >
            Login
          </a>
        {/if}
      </div>

      <!-- Mobile Menu Button -->
      <button
        type="button"
        class="p-2 text-white transition-colors duration-200 hover:text-white/80 md:hidden"
        aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={mobileMenuOpen}
        aria-controls="mobile-menu"
        onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
      >
        <div class="relative h-6 w-6">
          <span
            class="absolute top-1 left-0 h-0.5 w-6 bg-current transition-all duration-300 ease-in-out {mobileMenuOpen
              ? 'translate-y-1.5 rotate-45'
              : ''}"
          ></span>
          <span
            class="absolute top-3 left-0 h-0.5 w-6 bg-current transition-all duration-300 ease-in-out {mobileMenuOpen ? 'opacity-0' : ''}"
          ></span>
          <span
            class="absolute top-5 left-0 h-0.5 w-6 bg-current transition-all duration-300 ease-in-out {mobileMenuOpen
              ? '-translate-y-1.5 -rotate-45'
              : ''}"
          ></span>
        </div>
      </button>
    </div>
  </div>

  <!-- Mobile Menu Dropdown -->
  <div
    id="mobile-menu"
    class="overflow-hidden transition-all duration-300 ease-in-out md:hidden {mobileMenuOpen
      ? 'max-h-screen opacity-100'
      : 'max-h-0 opacity-0'}"
  >
    <div class="bg-ab-blue space-y-1 border-t border-white/20 px-4 pt-2 pb-4">
      <a
        href="/doc"
        class="block rounded-md px-3 py-2 text-white transition-colors hover:bg-white/10 hover:text-white"
        onclick={closeMobileMenu}
      >
        Docs
      </a>
      <a
        href="https://github.com/apicollective/apibuilder"
        target="_blank"
        rel="noopener noreferrer"
        class="block rounded-md px-3 py-2 text-white transition-colors hover:bg-white/10 hover:text-white"
        onclick={closeMobileMenu}
      >
        GitHub
      </a>
      <a
        href="/doc/start"
        class="block rounded-md px-3 py-2 text-white transition-colors hover:bg-white/10 hover:text-white"
        onclick={closeMobileMenu}
      >
        For AI Agents
      </a>
      <a
        href="/generators"
        class="block rounded-md px-3 py-2 text-white transition-colors hover:bg-white/10 hover:text-white"
        onclick={closeMobileMenu}
      >
        Generators
      </a>

      {#if session}
        <!-- Mobile search -->
        <form action="/search" method="GET" class="px-3 py-2">
          <input
            type="text"
            name="q"
            placeholder="Search..."
            class="w-full rounded-md border-0 bg-white/10 px-3 py-1.5 text-sm text-white placeholder-white/50 focus:bg-white/20 focus:ring-1 focus:ring-white/50"
          />
        </form>

        <div class="border-t border-white/20 pt-2">
          <AccountMenu {session} placement="up" tone="dark" onChoose={closeMobileMenu} />
        </div>
      {:else}
        <a
          href="/login"
          class="text-ab-blue mt-2 block rounded-full bg-white px-3 py-2 text-center font-semibold transition-all duration-200 ease-out hover:scale-105"
          onclick={closeMobileMenu}
        >
          Login
        </a>
      {/if}
    </div>
  </div>
</header>
