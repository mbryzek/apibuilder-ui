<script lang="ts">
	import { page } from '$app/stores';

	interface Props {
		orgKey: string;
		appKey: string;
		version: string;
		appName: string;
		isMember: boolean;
		isAdmin: boolean;
		isLoggedIn: boolean;
	}

	let {
		orgKey,
		appKey,
		version,
		appName,
		isMember,
		isAdmin,
		isLoggedIn,
	}: Props = $props();

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

	const orgLinks = $derived.by(() => {
		const items: { href: string; label: string }[] = [];
		if (isMember) {
			items.push({ href: `/${orgKey}/subscriptions`, label: 'Subscriptions' });
			items.push({ href: `/${orgKey}/details`, label: 'Org Details' });
		}
		if (isAdmin) {
			items.push({ href: `/${orgKey}/attributes`, label: 'Attributes' });
			items.push({ href: `/${orgKey}/domains`, label: 'Domains' });
			items.push({ href: `/${orgKey}/members`, label: 'Members' });
		}
		return items;
	});

	let mobileOpen = $state(false);
	let orgExpanded = $state(false);
</script>

<!-- Mobile nav -->
<nav class="md:hidden mb-4" aria-label="Application navigation">
	<button
		type="button"
		class="flex items-center gap-2 text-sm font-medium text-ab-blue"
		aria-expanded={mobileOpen}
		onclick={() => (mobileOpen = !mobileOpen)}
	>
		<svg
			aria-hidden="true"
			class="w-4 h-4 transition-transform {mobileOpen ? 'rotate-90' : ''}"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
		>
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
		</svg>
		Application Menu
	</button>
	{#if mobileOpen}
		<div class="mt-2 border-l-2 border-ab-blue pl-3">
			<!-- App name -->
			<a
				href={versionBase}
				class="block text-sm font-bold text-ab-dark-blue hover:text-ab-blue transition-colors mb-2"
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
				<div class="border-t border-gray-200 mt-3 pt-3">
					<span class="block text-xs font-medium text-ab-gray uppercase mb-1">{orgKey}</span>
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
<nav class="hidden md:block w-56 shrink-0" aria-label="Application navigation">
	<div class="sticky top-4">
		<!-- App name -->
		<a
			href={versionBase}
			class="block text-lg font-bold text-ab-dark-blue hover:text-ab-blue transition-colors truncate mb-4"
		>
			{appName}
		</a>

		<!-- Nav links -->
		<ul class="space-y-1">
			{#each navLinks as link (link.href)}
				<li>
					<a
						href={link.href}
						class="block px-3 py-2 rounded-md text-sm font-medium transition-colors {isActive(link.href)
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
			<div class="border-t border-gray-200 mt-6 pt-4">
				<button
					type="button"
					class="flex items-center gap-2 text-sm font-medium text-ab-dark-blue hover:text-ab-blue transition-colors w-full"
					aria-expanded={orgExpanded}
					onclick={() => (orgExpanded = !orgExpanded)}
				>
					<svg
						aria-hidden="true"
						class="w-4 h-4 transition-transform {orgExpanded ? 'rotate-90' : ''}"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 5l7 7-7 7"
						/>
					</svg>
					{orgKey}
				</button>
				{#if orgExpanded}
					<ul class="mt-2 space-y-1">
						{#each orgLinks as link (link.href)}
							<li>
								<a
									href={link.href}
									class="block px-3 py-2 rounded-md text-sm font-medium transition-colors {isActive(link.href)
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
