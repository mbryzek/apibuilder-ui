<script lang="ts">
	import type { Organization } from '$generated/com-bryzek-bryzek-apibuilder-v0';

	interface Props {
		data: {
			session?: { id: string; user: { id: string; person: { email?: { address: string } } } };
			publicOrgs?: Organization[];
			myOrgs: Organization[];
		};
	}

	let { data }: Props = $props();

	const session = $derived(data.session);
	const publicOrgs = $derived(data.publicOrgs ?? []);
	const myOrgs = $derived(data.myOrgs);
</script>

<svelte:head>
	<title>API Builder - API-First Development</title>
</svelte:head>

<div class="page-container">
	{#if session && myOrgs.length > 1}
		<!-- Multiple orgs — let user pick -->
		<div class="mb-12">
			<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
				<h1 class="text-2xl font-bold text-ab-dark-blue">My Organizations</h1>
				<a href="/org/create" class="btn-primary mt-4 sm:mt-0 inline-block text-center">
					Create Organization
				</a>
			</div>

			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
				{#each myOrgs as org (org.key)}
					<a href="/{org.key}" class="card hover:shadow-[0_0_17px_-4px_rgba(0,0,0,0.2)] transition-shadow">
						<h3 class="font-semibold text-ab-dark-blue">{org.name}</h3>
						<p class="text-sm text-ab-gray mt-1">{org.namespace}</p>
						<span class="inline-block mt-2 text-xs font-medium px-2 py-0.5 rounded-full {org.visibility === 'public' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}">
							{org.visibility}
						</span>
					</a>
				{/each}
			</div>
		</div>
	{:else if !session}
		<!-- Hero for logged out users -->
		<div class="text-center py-20 sm:py-32">
			<h1 class="text-5xl sm:text-6xl lg:text-7xl font-light text-ab-dark-blue mb-8">
				API Builder
			</h1>
			<p class="text-lg sm:text-xl text-ab-gray max-w-2xl mx-auto mb-12 leading-relaxed">
				Design APIs with a simple, elegant interface. Generate client libraries, server stubs, and documentation from your API specifications.
			</p>
			<div class="flex flex-col sm:flex-row gap-6 justify-center">
				<a href="/signup" class="btn-primary">
					Get Started
				</a>
				<a href="/login" class="btn-secondary">
					Sign In
				</a>
			</div>
		</div>

		{#if publicOrgs.length > 0}
			<div>
				<h2 class="text-xl font-bold text-ab-dark-blue mb-6">Public Organizations</h2>
				<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{#each publicOrgs as org (org.key)}
						<a href="/{org.key}" class="card hover:shadow-[0_0_17px_-4px_rgba(0,0,0,0.2)] transition-shadow">
							<h3 class="font-semibold text-ab-dark-blue">{org.name}</h3>
							<p class="text-sm text-ab-gray mt-1">{org.namespace}</p>
							<span class="inline-block mt-2 text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-800">
								{org.visibility}
							</span>
						</a>
					{/each}
				</div>
			</div>
		{:else}
			<div class="text-center py-8 text-ab-gray">
				<p>No public organizations yet. <a href="/signup" class="text-ab-dark-blue underline">Sign up</a> to create one.</p>
			</div>
		{/if}
	{/if}
</div>
