<script lang="ts">
	import { page } from '$app/stores';
	import { enhance } from '$app/forms';

	interface Props {
		orgKey: string;
		appKey: string;
		version: string;
		appName: string;
		isMember: boolean;
		isAdmin: boolean;
		isWatching: boolean;
		watchGuid?: string | undefined;
		isLoggedIn: boolean;
	}

	let {
		orgKey,
		appKey,
		version,
		appName,
		isMember,
		isAdmin,
		isWatching,
		watchGuid,
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
<div class="md:hidden mb-4">
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
			<!-- App name + watch -->
			<div class="flex items-center gap-2 mb-2">
				<a
					href={versionBase}
					class="text-sm font-bold text-ab-dark-blue hover:text-ab-blue transition-colors"
					onclick={() => (mobileOpen = false)}
				>
					{appName}
				</a>
				{#if isLoggedIn}
					<form
						method="POST"
						action="{versionBase}?/{isWatching ? 'unwatch' : 'watch'}"
						use:enhance
					>
						{#if isWatching && watchGuid}
							<input type="hidden" name="watch_guid" value={watchGuid} />
						{/if}
						<button
							type="submit"
							title={isWatching ? 'Unwatch this application' : 'Watch this application'}
							class="p-0.5 transition-colors {isWatching
								? 'text-ab-blue'
								: 'text-ab-gray hover:text-ab-blue'}"
						>
							<svg aria-hidden="true" class="w-4 h-4" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" fill={isWatching ? 'currentColor' : 'none'}>
								<path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178z" />
								<path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
							</svg>
						</button>
					</form>
				{/if}
			</div>

			<!-- Upload link -->
			{#if isMember}
				<a
					href="/{orgKey}/upload"
					class="block py-1.5 text-sm font-medium text-ab-blue hover:text-ab-dark-blue transition-colors"
					onclick={() => (mobileOpen = false)}
				>
					+ Upload
				</a>
			{/if}

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
</div>

<!-- Desktop sidebar -->
<nav class="hidden md:block w-56 shrink-0">
	<div class="sticky top-4">
		<!-- App name + watch toggle -->
		<div class="flex items-center justify-between mb-4">
			<a
				href={versionBase}
				class="text-lg font-bold text-ab-dark-blue hover:text-ab-blue transition-colors truncate"
			>
				{appName}
			</a>
			{#if isLoggedIn}
				<form
					method="POST"
					action="{versionBase}?/{isWatching ? 'unwatch' : 'watch'}"
					use:enhance
				>
					{#if isWatching && watchGuid}
						<input type="hidden" name="watch_guid" value={watchGuid} />
					{/if}
					<button
						type="submit"
						title={isWatching ? 'Unwatch this application' : 'Watch this application'}
						class="p-1 transition-colors {isWatching
							? 'text-ab-blue'
							: 'text-ab-gray hover:text-ab-blue'}"
					>
						<svg aria-hidden="true" class="w-5 h-5" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" fill={isWatching ? 'currentColor' : 'none'}>
							<path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178z" />
							<path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
						</svg>
					</button>
				</form>
			{/if}
		</div>

		<!-- Upload button -->
		{#if isMember}
			<a
				href="/{orgKey}/upload"
				class="block w-full text-center px-3 py-2 text-sm font-medium rounded-md border border-ab-blue text-ab-blue hover:bg-ab-blue hover:text-white transition-colors mb-4"
			>
				+ Upload
			</a>
		{/if}

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
