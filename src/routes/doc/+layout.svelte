<script lang="ts">
  import { page } from '$app/stores';
  import type { Snippet } from 'svelte';

  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();

  const navItems = [
    { href: '/doc', label: 'Introduction' },
    { href: '/doc/why', label: 'Why API Builder?' },
    { href: '/doc/start', label: 'Getting Started' },
    { href: '/doc/apiJson', label: 'api.json format' },
    { href: '/doc/types', label: 'Types' },
    { href: '/doc/examples', label: 'Examples' },
    { href: '/doc/generators', label: 'Code Generators' },
    { href: '/doc/apiTokens', label: 'API Tokens' },
    { href: '/doc/history', label: 'History' },
    { href: '/doc/interfaces', label: 'Interfaces' },
    { href: '/doc/auth', label: 'Authentication' },
    { href: '/doc/attributes', label: 'Attributes' },
    { href: '/doc/playRoutesFile', label: 'Play Routes File' },
    { href: '/doc/playUnionTypes', label: 'Play Union Types' },
    { href: '/doc/releaseNotes', label: 'Release Notes' }
  ];

  let mobileNavOpen = $state(false);
</script>

<div class="page-container">
  <div class="flex flex-col gap-10 md:flex-row">
    <nav class="shrink-0 md:w-56" aria-label="Documentation">
      <button
        class="text-ab-blue mb-2 w-full py-2 text-left font-semibold md:hidden"
        onclick={() => (mobileNavOpen = !mobileNavOpen)}
        aria-expanded={mobileNavOpen}
        aria-controls="doc-nav-list"
      >
        {mobileNavOpen ? 'Hide' : 'Show'} Navigation
      </button>
      <ul id="doc-nav-list" class="{mobileNavOpen ? 'block' : 'hidden'} space-y-1 md:block">
        {#each navItems as item}
          <li>
            <a
              href={item.href}
              class="block rounded px-3 py-2 text-sm transition-colors {$page.url.pathname === item.href
                ? 'bg-ab-blue font-semibold text-white'
                : 'text-ab-dark-blue hover:bg-ab-light-gray'}"
            >
              {item.label}
            </a>
          </li>
        {/each}
      </ul>
    </nav>

    <div class="min-w-0 flex-1">
      {@render children()}
    </div>
  </div>
</div>
