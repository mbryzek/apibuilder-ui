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
		{ href: '/doc/attributes', label: 'Attributes' },
		{ href: '/doc/templates', label: 'Templates' },
		{ href: '/doc/playRoutesFile', label: 'Play Routes File' },
		{ href: '/doc/playUnionTypes', label: 'Play Union Types' },
		{ href: '/doc/releaseNotes', label: 'Release Notes' },
	];

	let mobileNavOpen = $state(false);
</script>

<div class="page-container">
	<div class="flex flex-col md:flex-row gap-10">
		<nav class="md:w-56 shrink-0" aria-label="Documentation">
			<button
				class="md:hidden w-full text-left text-ab-blue font-semibold py-2 mb-2"
				onclick={() => mobileNavOpen = !mobileNavOpen}
				aria-expanded={mobileNavOpen}
				aria-controls="doc-nav-list"
			>
				{mobileNavOpen ? 'Hide' : 'Show'} Navigation
			</button>
			<ul id="doc-nav-list" class="{mobileNavOpen ? 'block' : 'hidden'} md:block space-y-1">
				{#each navItems as item}
					<li>
						<a
							href={item.href}
							class="block px-3 py-2 rounded text-sm transition-colors {$page.url.pathname === item.href ? 'bg-ab-blue text-white font-semibold' : 'text-ab-dark-blue hover:bg-ab-light-gray'}"
						>
							{item.label}
						</a>
					</li>
				{/each}
			</ul>
		</nav>

		<div class="flex-1 min-w-0">
			{@render children()}
		</div>
	</div>
</div>
