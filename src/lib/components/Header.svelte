<script lang="ts">
	/**
	 * App Header Component
	 * Main navigation header with API Builder branding
	 */

	interface Props {
		session?: { id: string; user: { id: string; person: { email?: { address: string } } } } | undefined;
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
	<button
		class="fixed inset-0 bg-black/30 z-30 md:hidden"
		onclick={closeMobileMenu}
		aria-label="Close menu"
	></button>
{/if}

<!-- Overlay for user dropdown -->
{#if userDropdownOpen}
	<button
		class="fixed inset-0 z-30 hidden md:block"
		onclick={closeUserDropdown}
		aria-label="Close dropdown"
	></button>
{/if}

<header class="bg-ab-blue shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] relative z-40">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex justify-between items-center h-16">
			<!-- Brand -->
			<div class="flex items-center">
				<a href="/" class="text-white text-lg sm:text-xl font-bold tracking-wide">
					API <span class="font-light">|</span> BUILDER
				</a>
			</div>

			<!-- Desktop Navigation -->
			<div class="hidden md:flex items-center space-x-6">
				<!-- Center nav -->
				<a href="/doc" class="text-white/80 hover:text-white transition-colors text-sm font-medium">
					Docs
				</a>
				<a
					href="https://github.com/apicollective/apibuilder"
					target="_blank"
					rel="noopener noreferrer"
					class="text-white/80 hover:text-white transition-colors text-sm font-medium"
				>
					GitHub
				</a>
				<a href="/doc/start" class="text-white/80 hover:text-white transition-colors text-sm font-medium">
					For AI Agents
				</a>

				{#if session}
					<!-- Search form -->
					<form action="/search" method="GET" class="flex items-center">
						<input
							type="text"
							name="q"
							placeholder="Search..."
							class="rounded-md border-0 bg-white/10 text-white placeholder-white/50 text-sm px-3 py-1.5 focus:bg-white/20 focus:ring-1 focus:ring-white/50 transition-colors w-40 lg:w-56"
						/>
					</form>

					<!-- User dropdown -->
					<div class="relative">
						<button
							type="button"
							class="text-white/80 hover:text-white transition-colors text-sm font-medium flex items-center gap-1"
							onclick={() => (userDropdownOpen = !userDropdownOpen)}
							aria-expanded={userDropdownOpen}
							aria-haspopup="true"
						>
							{session.user.person.email?.address ?? ''}
							<svg class="w-4 h-4 transition-transform {userDropdownOpen ? 'rotate-180' : ''}" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
							</svg>
						</button>

						{#if userDropdownOpen}
							<div class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
								<a
									href="/generators"
									class="block px-4 py-2 text-sm text-gray-700 hover:bg-ab-light-gray transition-colors"
									onclick={closeUserDropdown}
								>
									Generators
								</a>
								<a
									href="/account/profile"
									class="block px-4 py-2 text-sm text-gray-700 hover:bg-ab-light-gray transition-colors"
									onclick={closeUserDropdown}
								>
									Account
								</a>
								<a
									href="/tokens"
									class="block px-4 py-2 text-sm text-gray-700 hover:bg-ab-light-gray transition-colors"
									onclick={closeUserDropdown}
								>
									Tokens
								</a>
								<hr class="my-1 border-gray-100" />
								<form method="POST" action="/logout">
									<button
										type="submit"
										class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-ab-light-gray transition-colors"
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
						class="bg-white text-ab-blue font-semibold px-5 py-2 rounded-full hover:scale-110 transition-all duration-200 ease-out text-sm"
					>
						Login
					</a>
				{/if}
			</div>

			<!-- Mobile Menu Button -->
			<button
				type="button"
				class="md:hidden text-white hover:text-white/80 transition-colors duration-200 p-2"
				aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
				aria-expanded={mobileMenuOpen}
				aria-controls="mobile-menu"
				onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
			>
				<div class="relative w-6 h-6">
					<span
						class="absolute left-0 top-1 w-6 h-0.5 bg-current transition-all duration-300 ease-in-out {mobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}"
					></span>
					<span
						class="absolute left-0 top-3 w-6 h-0.5 bg-current transition-all duration-300 ease-in-out {mobileMenuOpen ? 'opacity-0' : ''}"
					></span>
					<span
						class="absolute left-0 top-5 w-6 h-0.5 bg-current transition-all duration-300 ease-in-out {mobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}"
					></span>
				</div>
			</button>
		</div>
	</div>

	<!-- Mobile Menu Dropdown -->
	<div
		id="mobile-menu"
		class="md:hidden overflow-hidden transition-all duration-300 ease-in-out {mobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}"
	>
		<div class="px-4 pt-2 pb-4 space-y-1 bg-ab-blue border-t border-white/20">
			<a
				href="/doc"
				class="block px-3 py-2 text-white hover:text-white hover:bg-white/10 rounded-md transition-colors"
				onclick={closeMobileMenu}
			>
				Docs
			</a>
			<a
				href="https://github.com/apicollective/apibuilder"
				target="_blank"
				rel="noopener noreferrer"
				class="block px-3 py-2 text-white hover:text-white hover:bg-white/10 rounded-md transition-colors"
				onclick={closeMobileMenu}
			>
				GitHub
			</a>
			<a
				href="/doc/start"
				class="block px-3 py-2 text-white hover:text-white hover:bg-white/10 rounded-md transition-colors"
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
						class="w-full rounded-md border-0 bg-white/10 text-white placeholder-white/50 text-sm px-3 py-1.5 focus:bg-white/20 focus:ring-1 focus:ring-white/50"
					/>
				</form>

				<hr class="border-white/20" />
				<a
					href="/generators"
					class="block px-3 py-2 text-white hover:text-white hover:bg-white/10 rounded-md transition-colors"
					onclick={closeMobileMenu}
				>
					Generators
				</a>
				<a
					href="/account/profile"
					class="block px-3 py-2 text-white hover:text-white hover:bg-white/10 rounded-md transition-colors"
					onclick={closeMobileMenu}
				>
					Account
				</a>
				<a
					href="/tokens"
					class="block px-3 py-2 text-white hover:text-white hover:bg-white/10 rounded-md transition-colors"
					onclick={closeMobileMenu}
				>
					Tokens
				</a>
				<hr class="border-white/20" />
				<form method="POST" action="/logout">
					<button
						type="submit"
						class="block w-full text-left px-3 py-2 text-white hover:text-white hover:bg-white/10 rounded-md transition-colors"
						onclick={closeMobileMenu}
					>
						Logout
					</button>
				</form>
			{:else}
				<a
					href="/login"
					class="block px-3 py-2 mt-2 text-center bg-white text-ab-blue font-semibold rounded-full hover:scale-105 transition-all duration-200 ease-out"
					onclick={closeMobileMenu}
				>
					Login
				</a>
			{/if}
		</div>
	</div>
</header>
