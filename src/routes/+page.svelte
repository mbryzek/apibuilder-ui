<script lang="ts">
	import type { Organization } from '$generated/com-bryzek-apibuilder';

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
	<title>API Builder - The AI Agent's API Toolkit</title>
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
			<p class="text-lg sm:text-xl text-ab-gray max-w-2xl mx-auto mb-6 leading-relaxed">
				The AI Agent's API Toolkit
			</p>
			<p class="text-base text-ab-gray max-w-2xl mx-auto mb-12 leading-relaxed">
				Define REST APIs in a structured spec. Generate type-safe clients, server stubs, and tests.
				Use the compiler to verify correctness. Ship on the first try.
			</p>
			<div class="flex flex-col sm:flex-row gap-6 justify-center mb-16">
				<a href="/doc/start" class="btn-primary">
					Add to Your Agent
				</a>
				<a href="/doc/start#quick-start" class="btn-secondary">
					Try It Now
				</a>
			</div>

			<!-- Workflow visual -->
			<div class="max-w-xl mx-auto mb-16">
				<div class="flex items-center justify-center gap-3 sm:gap-6 text-sm sm:text-base">
					<span class="font-semibold text-ab-dark-blue">Spec</span>
					<span class="text-ab-gray">&rarr;</span>
					<span class="font-semibold text-ab-dark-blue">Generate</span>
					<span class="text-ab-gray">&rarr;</span>
					<span class="font-semibold text-ab-dark-blue">Compile</span>
					<span class="text-ab-gray">&rarr;</span>
					<span class="font-semibold text-ab-dark-blue">Ship</span>
				</div>
			</div>

			<!-- Why agents love API Builder -->
			<div class="max-w-2xl mx-auto text-left">
				<h2 class="text-xl font-bold text-ab-dark-blue mb-6 text-center">Why agents choose API Builder</h2>
				<div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
					<div class="card">
						<h3 class="font-semibold text-ab-dark-blue mb-2">Compiler as oracle</h3>
						<p class="text-sm text-ab-gray">Generated code won't compile until your implementation matches the spec.</p>
					</div>
					<div class="card">
						<h3 class="font-semibold text-ab-dark-blue mb-2">Explicit data shapes</h3>
						<p class="text-sm text-ab-gray">Every field, type, and relationship defined upfront. No guessing.</p>
					</div>
					<div class="card">
						<h3 class="font-semibold text-ab-dark-blue mb-2">First-try success</h3>
						<p class="text-sm text-ab-gray">Agents using API Builder implement APIs correctly without iteration loops.</p>
					</div>
				</div>
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
				<p>No public organizations yet. <a href="/doc/start" class="text-ab-dark-blue underline">Get your agent started</a> in 30 seconds.</p>
			</div>
		{/if}
	{/if}
</div>
