<svelte:head>
  <title>Examples - API Builder</title>
</svelte:head>

<div>
  <h1 class="text-ab-dark-blue mb-4 text-2xl font-bold">Examples</h1>

  <p class="text-ab-dark-blue mb-8 text-lg leading-relaxed">
    The fastest way to learn API Builder is by studying real specifications. These services power API Builder itself — browse their docs and
    source to see the format in action.
  </p>

  <!-- API Builder's Own Services -->
  <div class="mb-10">
    <h2 class="text-ab-blue mb-4 flex items-center gap-2 text-lg font-bold">
      <span class="bg-ab-blue inline-flex h-7 w-7 items-center justify-center rounded-full text-xs text-white">✦</span>
      API Builder Services
    </h2>

    <div class="card mb-4">
      <h3 class="text-ab-dark-blue mb-2 font-semibold">apibuilder-api</h3>
      <p class="text-ab-dark-blue mb-2 text-sm">
        The core API that powers app.apibuilder.io — organizations, applications, versions, and code generation.
      </p>
      <div class="flex gap-4 text-sm">
        <a href="https://app.apibuilder.io/apicollective/apibuilder-api/latest" class="text-ab-blue hover:text-ab-dark-blue underline"
          >Documentation</a
        >
        <a
          href="https://github.com/apicollective/apibuilder/blob/main/spec/apibuilder-api.json"
          class="text-ab-blue hover:text-ab-dark-blue underline">Source (api.json)</a
        >
      </div>
    </div>

    <div class="card mb-4">
      <h3 class="text-ab-dark-blue mb-2 font-semibold">apibuilder-spec</h3>
      <p class="text-ab-dark-blue mb-2 text-sm">The specification format itself — defines the structure of api.json files.</p>
      <div class="flex gap-4 text-sm">
        <a href="https://app.apibuilder.io/apicollective/apibuilder-spec/latest" class="text-ab-blue hover:text-ab-dark-blue underline"
          >Documentation</a
        >
        <a
          href="https://github.com/apicollective/apibuilder/blob/main/spec/apibuilder-spec.json"
          class="text-ab-blue hover:text-ab-dark-blue underline">Source (api.json)</a
        >
      </div>
    </div>

    <div class="card mb-4">
      <h3 class="text-ab-dark-blue mb-2 font-semibold">apibuilder-generator</h3>
      <p class="text-ab-dark-blue mb-2 text-sm">The code generation service — accepts a service description, returns generated code.</p>
      <div class="flex gap-4 text-sm">
        <a href="https://app.apibuilder.io/apicollective/apibuilder-generator/latest" class="text-ab-blue hover:text-ab-dark-blue underline"
          >Documentation</a
        >
        <a
          href="https://github.com/apicollective/apibuilder/blob/main/spec/apibuilder-generator.json"
          class="text-ab-blue hover:text-ab-dark-blue underline">Source (api.json)</a
        >
      </div>
    </div>
  </div>

  <!-- Generated Code Examples -->
  <div class="mb-10">
    <h2 class="text-ab-blue mb-4 flex items-center gap-2 text-lg font-bold">
      <span class="bg-ab-blue inline-flex h-7 w-7 items-center justify-center rounded-full text-xs text-white">⚡</span>
      Generated Code Examples
    </h2>
    <div class="card">
      <p class="text-ab-dark-blue mb-3">Working examples showing generated output across multiple languages and frameworks:</p>
      <ul class="text-ab-dark-blue space-y-2">
        <li>
          <a href="https://github.com/apicollective/apibuilder-examples" class="text-ab-blue hover:text-ab-dark-blue underline"
            >apibuilder-examples on GitHub</a
          >
          — GraphQL, TypeScript, Scala, and more
        </li>
      </ul>
    </div>
  </div>

  <!-- CTA -->
  <div class="mt-12 mb-8 text-center">
    <p class="text-ab-dark-blue mb-4">Ready to build your own?</p>
    <a href="/doc/start" class="btn-primary inline-block">Get Started</a>
  </div>
</div>
