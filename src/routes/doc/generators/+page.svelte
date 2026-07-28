<svelte:head>
  <title>Code Generators - API Builder</title>
</svelte:head>

<div>
  <h1 class="text-ab-dark-blue mb-4 text-2xl font-bold">Code Generators</h1>

  <p class="text-ab-dark-blue mb-4 text-lg leading-relaxed">
    Every generator produces a single, self-contained file your agent can drop into the project. No dependency resolution. No configuration.
    Just working code that the compiler can verify against your implementation.
  </p>

  <div class="card mb-8">
    <h2 class="text-ab-dark-blue mb-3 text-lg font-semibold">Design Principles</h2>
    <ul class="text-ab-dark-blue ml-2 space-y-3">
      <li>
        <strong>Single file</strong> — One fully contained, fully functional file per generator. Drop it in and go.
      </li>
      <li>
        <strong>Minimal dependencies</strong> — Uses native framework dependencies. No extra libraries to manage.
      </li>
      <li>
        <strong>Readable output</strong> — Generated code you'd be proud to commit. Indistinguishable from hand-written.
      </li>
    </ul>
  </div>

  <!-- Generators by Language -->
  <h2 class="text-ab-dark-blue mb-6 text-xl font-bold">Available Generators</h2>

  <!-- TypeScript -->
  <div class="card mb-6">
    <h3 class="text-ab-blue mb-3 flex items-center gap-2 text-lg font-semibold">
      <span class="bg-ab-blue inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white">T</span>
      TypeScript
    </h3>
    <div class="overflow-x-auto">
      <table class="text-ab-dark-blue w-full text-sm">
        <thead>
          <tr class="border-b border-gray-200 text-left">
            <th class="pb-2 font-medium">Generator</th>
            <th class="pb-2 font-medium">Key</th>
            <th class="pb-2 font-medium">Description</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr>
            <td class="py-2 font-medium">TypeScript</td>
            <td class="py-2"><code class="rounded bg-gray-100 px-1.5 py-0.5 text-xs">typescript</code></td>
            <td class="py-2">Full client SDK with type definitions, API client, and error types</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Scala -->
  <div class="card mb-6">
    <h3 class="text-ab-blue mb-3 flex items-center gap-2 text-lg font-semibold">
      <span class="bg-ab-blue inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white">S</span>
      Scala (Play Framework)
    </h3>
    <div class="overflow-x-auto">
      <table class="text-ab-dark-blue w-full text-sm">
        <thead>
          <tr class="border-b border-gray-200 text-left">
            <th class="pb-2 font-medium">Generator</th>
            <th class="pb-2 font-medium">Key</th>
            <th class="pb-2 font-medium">Description</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr>
            <td class="py-2 font-medium">Play Model</td>
            <td class="py-2"><code class="rounded bg-gray-100 px-1.5 py-0.5 text-xs">bryzek_play_model</code></td>
            <td class="py-2">Case classes, enums, and JSON serialization</td>
          </tr>
          <tr>
            <td class="py-2 font-medium">Play Client</td>
            <td class="py-2"><code class="rounded bg-gray-100 px-1.5 py-0.5 text-xs">bryzek_play_client</code></td>
            <td class="py-2">Type-safe HTTP client with models</td>
          </tr>
          <tr>
            <td class="py-2 font-medium">Play Controller</td>
            <td class="py-2"><code class="rounded bg-gray-100 px-1.5 py-0.5 text-xs">bryzek_play_controller</code></td>
            <td class="py-2">Abstract controller traits for server implementation</td>
          </tr>
          <tr>
            <td class="py-2 font-medium">Play Routes</td>
            <td class="py-2"><code class="rounded bg-gray-100 px-1.5 py-0.5 text-xs">bryzek_play_routes</code></td>
            <td class="py-2">Play routes file entries for each operation</td>
          </tr>
          <tr>
            <td class="py-2 font-medium">Play Mock Model</td>
            <td class="py-2"><code class="rounded bg-gray-100 px-1.5 py-0.5 text-xs">bryzek_play_mock_model</code></td>
            <td class="py-2">Factory methods for generating test data</td>
          </tr>
          <tr>
            <td class="py-2 font-medium">Play Mock Client</td>
            <td class="py-2"><code class="rounded bg-gray-100 px-1.5 py-0.5 text-xs">bryzek_play_mock_client</code></td>
            <td class="py-2">Mock client for testing without HTTP</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Elm -->
  <div class="card mb-6">
    <h3 class="text-ab-blue mb-3 flex items-center gap-2 text-lg font-semibold">
      <span class="bg-ab-blue inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white">E</span>
      Elm
    </h3>
    <div class="overflow-x-auto">
      <table class="text-ab-dark-blue w-full text-sm">
        <thead>
          <tr class="border-b border-gray-200 text-left">
            <th class="pb-2 font-medium">Generator</th>
            <th class="pb-2 font-medium">Key</th>
            <th class="pb-2 font-medium">Description</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr>
            <td class="py-2 font-medium">Elm</td>
            <td class="py-2"><code class="rounded bg-gray-100 px-1.5 py-0.5 text-xs">elm_v2</code></td>
            <td class="py-2">Fully typed models, decoders, encoders, and HTTP operations</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- PostgreSQL -->
  <div class="card mb-6">
    <h3 class="text-ab-blue mb-3 flex items-center gap-2 text-lg font-semibold">
      <span class="bg-ab-blue inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white">&#9881;</span>
      PostgreSQL
    </h3>
    <div class="overflow-x-auto">
      <table class="text-ab-dark-blue w-full text-sm">
        <thead>
          <tr class="border-b border-gray-200 text-left">
            <th class="pb-2 font-medium">Generator</th>
            <th class="pb-2 font-medium">Key</th>
            <th class="pb-2 font-medium">Description</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr>
            <td class="py-2 font-medium">Scala DAO</td>
            <td class="py-2"><code class="rounded bg-gray-100 px-1.5 py-0.5 text-xs">psql_scala</code></td>
            <td class="py-2">Scala DAO classes with type-safe queries and CRUD operations</td>
          </tr>
          <tr>
            <td class="py-2 font-medium">DDL</td>
            <td class="py-2"><code class="rounded bg-gray-100 px-1.5 py-0.5 text-xs">psql_ddl</code></td>
            <td class="py-2">PostgreSQL table definitions, indexes, and constraints</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Config Example -->
  <div class="card mb-8">
    <h2 class="text-ab-dark-blue mb-3 text-lg font-semibold">Using Generators in .api/config</h2>
    <p class="text-ab-dark-blue mb-3 text-sm">
      Reference generators by their key in your <code class="rounded bg-gray-100 px-1.5 py-0.5">.api/config</code> file, mapping each to the output
      directory where generated files should be written:
    </p>
    <pre class="overflow-x-auto rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm"><code
        >{@html `myorg:
  - generators:
      typescript: ./src/generated
    applications:
      my-api:

  - generators:
      bryzek_play_model: generated/app/apibuilder
      bryzek_play_client: generated/app/apibuilder
      bryzek_play_mock_client: generated/test/apibuilder
      bryzek_play_controller: generated/app/apibuilder
      bryzek_play_routes: conf
    applications:
      my-api:`}</code
      ></pre>
  </div>

  <!-- Scala-specific docs -->
  <div class="card mb-6">
    <h2 class="text-ab-dark-blue mb-3 text-lg font-semibold">Scala / Play Framework Docs</h2>
    <ul class="text-ab-dark-blue ml-2 space-y-1">
      <li><a href="/doc/playRoutesFile" class="text-ab-blue hover:text-ab-dark-blue underline">Play routes file generation</a></li>
      <li><a href="/doc/playUnionTypes" class="text-ab-blue hover:text-ab-dark-blue underline">Play union type handling</a></li>
    </ul>
  </div>

  <!-- CTA -->
  <div class="mt-12 mb-8 text-center">
    <p class="text-ab-dark-blue mb-4">Ready to generate code?</p>
    <a href="/doc/start" class="btn-primary inline-block">Getting Started</a>
  </div>
</div>
