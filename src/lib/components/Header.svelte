<script lang="ts">
  import type { PublicSession } from '$lib/session';
  /**
   * App Header Component
   * Main navigation header with API Builder branding
   */

  interface Props {
    session?: PublicSession | undefined;
  }

  let { session }: Props = $props();

  let mobileMenuOpen = $state(false);
  let userDropdownOpen = $state(false);

  function closeMobileMenu() {
    mobileMenuOpen = false;
  }

  function closeUserDropdown() {
    userDropdownOpen = false;
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      if (mobileMenuOpen) {
        mobileMenuOpen = false;
      }
      if (userDropdownOpen) {
        userDropdownOpen = false;
      }
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- Overlay for mobile menu -->
{#if mobileMenuOpen}
  <button class="fixed inset-0 z-30 bg-black/30 md:hidden" onclick={closeMobileMenu} aria-label="Close menu"></button>
{/if}

<!-- Overlay for user dropdown -->
{#if userDropdownOpen}
  <button class="fixed inset-0 z-30 hidden md:block" onclick={closeUserDropdown} aria-label="Close dropdown"></button>
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
        <a href="/doc" class="text-sm font-medium text-white/80 transition-colors hover:text-white"> Docs </a>
        <a
          href="https://github.com/apicollective/apibuilder"
          target="_blank"
          rel="noopener noreferrer"
          class="text-sm font-medium text-white/80 transition-colors hover:text-white"
        >
          GitHub
        </a>
        <a href="/doc/start" class="text-sm font-medium text-white/80 transition-colors hover:text-white"> For AI Agents </a>

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

          <!-- User dropdown -->
          <div class="relative">
            <button
              type="button"
              class="flex items-center gap-1 text-sm font-medium text-white/80 transition-colors hover:text-white"
              onclick={() => (userDropdownOpen = !userDropdownOpen)}
              aria-expanded={userDropdownOpen}
              aria-haspopup="true"
            >
              {session.user.person.email?.address ?? ''}
              <svg
                class="h-4 w-4 transition-transform {userDropdownOpen ? 'rotate-180' : ''}"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {#if userDropdownOpen}
              <div class="absolute right-0 z-50 mt-2 w-48 rounded-lg border border-gray-100 bg-white py-1 shadow-lg">
                <a
                  href="/generators"
                  class="hover:bg-ab-light-gray block px-4 py-2 text-sm text-gray-700 transition-colors"
                  onclick={closeUserDropdown}
                >
                  Generators
                </a>
                <a
                  href="/account/profile"
                  class="hover:bg-ab-light-gray block px-4 py-2 text-sm text-gray-700 transition-colors"
                  onclick={closeUserDropdown}
                >
                  Account
                </a>
                <a
                  href="/tokens"
                  class="hover:bg-ab-light-gray block px-4 py-2 text-sm text-gray-700 transition-colors"
                  onclick={closeUserDropdown}
                >
                  Tokens
                </a>
                <hr class="my-1 border-gray-100" />
                <form method="POST" action="/logout">
                  <button
                    type="submit"
                    class="hover:bg-ab-light-gray block w-full px-4 py-2 text-left text-sm text-gray-700 transition-colors"
                  >
                    Logout
                  </button>
                </form>
              </div>
            {/if}
          </div>
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

        <hr class="border-white/20" />
        <a
          href="/generators"
          class="block rounded-md px-3 py-2 text-white transition-colors hover:bg-white/10 hover:text-white"
          onclick={closeMobileMenu}
        >
          Generators
        </a>
        <a
          href="/account/profile"
          class="block rounded-md px-3 py-2 text-white transition-colors hover:bg-white/10 hover:text-white"
          onclick={closeMobileMenu}
        >
          Account
        </a>
        <a
          href="/tokens"
          class="block rounded-md px-3 py-2 text-white transition-colors hover:bg-white/10 hover:text-white"
          onclick={closeMobileMenu}
        >
          Tokens
        </a>
        <hr class="border-white/20" />
        <form method="POST" action="/logout">
          <button
            type="submit"
            class="block w-full rounded-md px-3 py-2 text-left text-white transition-colors hover:bg-white/10 hover:text-white"
            onclick={closeMobileMenu}
          >
            Logout
          </button>
        </form>
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
