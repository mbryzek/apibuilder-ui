<script lang="ts">
  import { page } from '$app/stores';
  import { buildOrgLinks } from '$lib/utils/org-nav';

  interface Props {
    orgKey: string;
    appKey: string;
    version: string;
    appName: string;
    isMember: boolean;
    isAdmin: boolean;
  }

  let { orgKey, appKey, version, appName, isMember, isAdmin }: Props = $props();

  const currentPath = $derived($page.url.pathname);

  function isActive(path: string): boolean {
    return currentPath === path;
  }

  const versionBase = $derived(`/${orgKey}/${appKey}/${version}`);

  const navLinks = $derived.by(() => {
    const items: { href: string; label: string; preloadOff?: boolean }[] = [];
    items.push({ href: `${versionBase}/history`, label: 'History' });
    if (isMember) {
      items.push({ href: `${versionBase}/settings`, label: 'Settings' });
    }
    items.push({ href: `${versionBase}/original`, label: 'Original', preloadOff: true });
    items.push({ href: `${versionBase}/service.json`, label: 'service.json', preloadOff: true });
    return items;
  });

  const orgLinks = $derived(buildOrgLinks(orgKey, isMember, isAdmin));

  let mobileOpen = $state(false);
  let orgExpanded = $state(false);
</script>

<!-- Mobile nav -->
<nav class="mb-4 md:hidden" aria-label="Application navigation">
  <button
    type="button"
    class="text-ab-blue flex items-center gap-2 text-sm font-medium"
    aria-expanded={mobileOpen}
    onclick={() => (mobileOpen = !mobileOpen)}
  >
    <svg
      aria-hidden="true"
      class="h-4 w-4 transition-transform {mobileOpen ? 'rotate-90' : ''}"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
    </svg>
    Application Menu
  </button>
  {#if mobileOpen}
    <div class="border-ab-blue mt-2 border-l-2 pl-3">
      <!-- App name -->
      <a
        href={versionBase}
        class="text-ab-dark-blue hover:text-ab-blue mb-2 block text-sm font-bold transition-colors"
        onclick={() => (mobileOpen = false)}
      >
        {appName}
      </a>

      <!-- Nav links -->
      <ul class="space-y-1">
        {#each navLinks as link (link.href)}
          <li>
            <a
              href={link.href}
              class="block py-1.5 text-sm font-medium transition-colors {isActive(link.href)
                ? 'text-ab-blue font-semibold'
                : 'text-ab-gray hover:text-ab-dark-blue'}"
              data-sveltekit-preload-data={link.preloadOff ? 'off' : undefined}
              onclick={() => (mobileOpen = false)}
            >
              {link.label}
            </a>
          </li>
        {/each}
      </ul>

      <!-- Org links -->
      {#if orgLinks.length > 0}
        <div class="mt-3 border-t border-gray-200 pt-3">
          <span class="text-ab-gray mb-1 block text-xs font-medium uppercase">{orgKey}</span>
          <ul class="space-y-1">
            {#each orgLinks as link (link.href)}
              <li>
                <a
                  href={link.href}
                  class="block py-1.5 text-sm font-medium transition-colors {isActive(link.href)
                    ? 'text-ab-blue font-semibold'
                    : 'text-ab-gray hover:text-ab-dark-blue'}"
                  onclick={() => (mobileOpen = false)}
                >
                  {link.label}
                </a>
              </li>
            {/each}
          </ul>
        </div>
      {/if}
    </div>
  {/if}
</nav>

<!-- Desktop sidebar -->
<nav class="hidden w-56 shrink-0 md:block" aria-label="Application navigation">
  <div class="sticky top-4">
    <!-- App name -->
    <a href={versionBase} class="text-ab-dark-blue hover:text-ab-blue mb-4 block truncate text-lg font-bold transition-colors">
      {appName}
    </a>

    <!-- Nav links -->
    <ul class="space-y-1">
      {#each navLinks as link (link.href)}
        <li>
          <a
            href={link.href}
            class="block rounded-md px-3 py-2 text-sm font-medium transition-colors {isActive(link.href)
              ? 'bg-ab-blue text-white'
              : 'text-ab-gray hover:text-ab-dark-blue hover:bg-ab-light-gray'}"
            data-sveltekit-preload-data={link.preloadOff ? 'off' : undefined}
          >
            {link.label}
          </a>
        </li>
      {/each}
    </ul>

    <!-- Collapsible org section -->
    {#if orgLinks.length > 0}
      <div class="mt-6 border-t border-gray-200 pt-4">
        <button
          type="button"
          class="text-ab-dark-blue hover:text-ab-blue flex w-full items-center gap-2 text-sm font-medium transition-colors"
          aria-expanded={orgExpanded}
          onclick={() => (orgExpanded = !orgExpanded)}
        >
          <svg
            aria-hidden="true"
            class="h-4 w-4 transition-transform {orgExpanded ? 'rotate-90' : ''}"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
          {orgKey}
        </button>
        {#if orgExpanded}
          <ul class="mt-2 space-y-1">
            {#each orgLinks as link (link.href)}
              <li>
                <a
                  href={link.href}
                  class="block rounded-md px-3 py-2 text-sm font-medium transition-colors {isActive(link.href)
                    ? 'bg-ab-blue text-white'
                    : 'text-ab-gray hover:text-ab-dark-blue hover:bg-ab-light-gray'}"
                >
                  {link.label}
                </a>
              </li>
            {/each}
          </ul>
        {/if}
      </div>
    {/if}
  </div>
</nav>
