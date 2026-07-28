<svelte:head>
  <title>Attributes - API Builder</title>
</svelte:head>

<div>
  <h1 class="text-ab-dark-blue mb-4 text-2xl font-bold">Attributes</h1>

  <p class="text-ab-dark-blue mb-8 text-lg leading-relaxed">
    Attributes let you customize code generation behavior per-organization or per-service. Generators declare which attributes they depend
    on, and API Builder passes the matching values automatically.
  </p>

  <!-- How They Work -->
  <div class="mb-10">
    <h2 class="text-ab-blue mb-4 flex items-center gap-2 text-lg font-bold">
      <span class="bg-ab-blue inline-flex h-7 w-7 items-center justify-center rounded-full text-xs text-white">⚙</span>
      How Attributes Work
    </h2>
    <div class="card">
      <ul class="text-ab-dark-blue space-y-4">
        <li>
          <strong>Globally unique</strong> — Each attribute has a URL-friendly name and optional description.
        </li>
        <li>
          <strong>Organization-level defaults</strong> — Set attribute values at the org level and they cascade to all applications in that organization.
        </li>
        <li>
          <strong>Generator integration</strong> — A code generator declares the attribute names it depends on. API Builder sends matching values
          when invoking the generator.
        </li>
      </ul>
    </div>
  </div>

  <!-- Setting Attributes -->
  <div class="mb-10">
    <h2 class="text-ab-blue mb-4 flex items-center gap-2 text-lg font-bold">
      <span class="bg-ab-blue inline-flex h-7 w-7 items-center justify-center rounded-full text-xs text-white">✦</span>
      Setting Attribute Values
    </h2>
    <div class="card">
      <p class="text-ab-dark-blue mb-3">To configure attributes for your organization:</p>
      <ol class="text-ab-dark-blue list-inside list-decimal space-y-2">
        <li>Navigate to your organization</li>
        <li>Click <strong>"Org Details"</strong> in the left nav</li>
        <li>Select <strong>"Org Attributes"</strong></li>
        <li>Set values for the attributes used by your generators</li>
      </ol>
    </div>
  </div>

  <!-- CTA -->
  <div class="mt-12 mb-8 text-center">
    <p class="text-ab-dark-blue mb-4">See which generators support attributes.</p>
    <a href="/doc/generators" class="btn-primary inline-block">View Generators</a>
  </div>
</div>
