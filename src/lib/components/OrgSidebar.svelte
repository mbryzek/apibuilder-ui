<script lang="ts">
  import { page } from '$app/stores';

  interface Props {
    orgKey: string;
    isMember: boolean;
    isAdmin: boolean;
  }

  let { orgKey, isMember, isAdmin }: Props = $props();

  const currentPath = $derived($page.url.pathname);

  function isActive(path: string): boolean {
    return currentPath === path;
  }

  const links = $derived.by(() => {
    const items: { href: string; label: string }[] = [];
    if (isMember) {
      items.push({ href: `/${orgKey}/subscriptions`, label: 'Subscriptions' });
      items.push({ href: `/${orgKey}/details`, label: 'Org Details' });
    }
    if (isAdmin) {
      items.push({ href: `/${orgKey}/domains`, label: 'Domains' });
      items.push({ href: `/${orgKey}/members`, label: 'Members' });
    }
    return items;
  });

  let mobileOpen = $state(false);
</script>

<!-- Mobile nav -->
{#if links.length > 0}
  <div class="mb-4 md:hidden">
    <button type="button" class="text-ab-blue flex items-center gap-2 text-sm font-medium" onclick={() => (mobileOpen = !mobileOpen)}>
      <svg class="h-4 w-4 transition-transform {mobileOpen ? 'rotate-90' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
      Organization Menu
    </button>
    {#if mobileOpen}
      <ul class="border-ab-blue mt-2 space-y-1 border-l-2 pl-3">
        {#each links as link (link.href)}
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
    {/if}
  </div>
{/if}

<!-- Desktop sidebar -->
<nav class="hidden w-56 shrink-0 md:block">
  <div class="sticky top-4">
    <a href="/{orgKey}" class="text-ab-dark-blue hover:text-ab-blue mb-4 block text-lg font-bold transition-colors">
      {orgKey}
    </a>

    {#if links.length > 0}
      <ul class="space-y-1">
        {#each links as link (link.href)}
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
</nav>
