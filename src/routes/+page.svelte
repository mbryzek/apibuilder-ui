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
      <div class="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 class="text-ab-dark-blue text-2xl font-bold">My Organizations</h1>
        <a href="/org/create" class="btn-primary mt-4 inline-block text-center sm:mt-0"> Create Organization </a>
      </div>

      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {#each myOrgs as org (org.key)}
          <a href="/{org.key}" class="card transition-shadow hover:shadow-[0_0_17px_-4px_rgba(0,0,0,0.2)]">
            <h3 class="text-ab-dark-blue font-semibold">{org.name}</h3>
            <p class="text-ab-gray mt-1 text-sm">{org.namespace}</p>
            <span
              class="mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium {org.visibility === 'public'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-600'}"
            >
              {org.visibility}
            </span>
          </a>
        {/each}
      </div>
    </div>
  {:else if !session}
    <!-- Hero for logged out users -->
    <div class="py-20 text-center sm:py-32">
      <h1 class="text-ab-dark-blue mb-8 text-5xl font-light sm:text-6xl lg:text-7xl">API Builder</h1>
      <p class="text-ab-gray mx-auto mb-6 max-w-2xl text-lg leading-relaxed sm:text-xl">The AI Agent's API Toolkit</p>
      <p class="text-ab-gray mx-auto mb-12 max-w-2xl text-base leading-relaxed">
        Define REST APIs in a structured spec. Generate type-safe clients, server stubs, and tests. Use the compiler to verify correctness.
        Ship on the first try.
      </p>
      <div class="mb-16 flex flex-col justify-center gap-6 sm:flex-row">
        <a href="/doc/start" class="btn-primary"> Add to Your Agent </a>
        <a href="/doc/start#quick-start" class="btn-secondary"> Try It Now </a>
      </div>

      <!-- Workflow visual -->
      <div class="mx-auto mb-16 max-w-xl">
        <div class="flex items-center justify-center gap-3 text-sm sm:gap-6 sm:text-base">
          <span class="text-ab-dark-blue font-semibold">Spec</span>
          <span class="text-ab-gray">&rarr;</span>
          <span class="text-ab-dark-blue font-semibold">Generate</span>
          <span class="text-ab-gray">&rarr;</span>
          <span class="text-ab-dark-blue font-semibold">Compile</span>
          <span class="text-ab-gray">&rarr;</span>
          <span class="text-ab-dark-blue font-semibold">Ship</span>
        </div>
      </div>

      <!-- Why agents love API Builder -->
      <div class="mx-auto max-w-2xl text-left">
        <h2 class="text-ab-dark-blue mb-6 text-center text-xl font-bold">Why agents choose API Builder</h2>
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div class="card">
            <h3 class="text-ab-dark-blue mb-2 font-semibold">Compiler as oracle</h3>
            <p class="text-ab-gray text-sm">Generated code won't compile until your implementation matches the spec.</p>
          </div>
          <div class="card">
            <h3 class="text-ab-dark-blue mb-2 font-semibold">Explicit data shapes</h3>
            <p class="text-ab-gray text-sm">Every field, type, and relationship defined upfront. No guessing.</p>
          </div>
          <div class="card">
            <h3 class="text-ab-dark-blue mb-2 font-semibold">First-try success</h3>
            <p class="text-ab-gray text-sm">Agents using API Builder implement APIs correctly without iteration loops.</p>
          </div>
        </div>
      </div>
    </div>

    {#if publicOrgs.length > 0}
      <div>
        <h2 class="text-ab-dark-blue mb-6 text-xl font-bold">Public Organizations</h2>
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {#each publicOrgs as org (org.key)}
            <a href="/{org.key}" class="card transition-shadow hover:shadow-[0_0_17px_-4px_rgba(0,0,0,0.2)]">
              <h3 class="text-ab-dark-blue font-semibold">{org.name}</h3>
              <p class="text-ab-gray mt-1 text-sm">{org.namespace}</p>
              <span class="mt-2 inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                {org.visibility}
              </span>
            </a>
          {/each}
        </div>
      </div>
    {:else}
      <div class="text-ab-gray py-8 text-center">
        <p>
          No public organizations yet. <a href="/doc/start" class="text-ab-dark-blue underline">Get your agent started</a> in 30 seconds.
        </p>
      </div>
    {/if}
  {/if}
</div>
