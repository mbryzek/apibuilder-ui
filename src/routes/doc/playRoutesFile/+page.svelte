<svelte:head>
  <title>Play Routes File - API Builder</title>
</svelte:head>

<div>
  <h1 class="text-ab-dark-blue mb-4 text-2xl font-bold">Play Routes File</h1>

  <p class="text-ab-dark-blue mb-4 text-lg leading-relaxed">
    Guarantee your <a href="http://playframework.com/" class="text-ab-blue hover:text-ab-dark-blue underline">Play Framework</a> service implements
    every endpoint. API Builder generates a routes file that validates completeness at compile time.
  </p>

  <div class="card mb-6">
    <h2 class="text-ab-blue mb-3 flex items-center gap-2 text-lg font-semibold">
      <span class="bg-ab-blue inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white">⏱</span>
      Bindables for Date Times
    </h2>
    <p class="text-ab-dark-blue">
      Generated clients include a <code class="rounded bg-gray-100 px-1">Bindables</code> object with implicits to automatically bind
      <code class="rounded bg-gray-100 px-1">date-iso8601</code>
      and
      <code class="rounded bg-gray-100 px-1">date-time-iso8601</code> data types in routes.
    </p>
  </div>

  <div class="card mb-6">
    <h2 class="text-ab-blue mb-3 flex items-center gap-2 text-lg font-semibold">
      <span class="bg-ab-blue inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white">✦</span>
      Enums as First Class in Routes
    </h2>

    <p class="text-ab-dark-blue mb-4">
      Enums are first-class objects in routes. When a path or parameter includes an enumeration, Play automatically validates the value and
      returns an error page listing valid types if the value is invalid. To enable this, add the appropriate imports:
    </p>

    <ol class="text-ab-dark-blue list-inside list-decimal space-y-4">
      <li>
        <strong>Import play keys</strong> —
        <pre class="mt-2 overflow-x-auto rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm"><code
            >import play.PlayImport.PlayKeys._</code
          ></pre>
      </li>

      <li>
        <strong>Enable plugin</strong> —
        <pre class="mt-2 overflow-x-auto rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm"><code>enablePlugins(PlayScala)</code
          ></pre>
      </li>

      <li>
        <strong>Add bindables to build.sbt</strong> —
        <pre
          class="mt-2 overflow-x-auto rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm">{@html `<code>routesImport += "&lt;packageName&gt;.&lt;serviceName&gt;.v&lt;versionNumber&gt;.Bindables._"</code>`}</pre>

        <p class="mt-2">For example:</p>
        <pre
          class="mt-2 overflow-x-auto rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm">{@html `<code>routesImport += "io.apibuilder.api.v0.Bindables._"</code>`}</pre>
      </li>
    </ol>

    <p class="text-ab-dark-blue mt-4">
      For a working example, see <a
        href="https://github.com/apicollective/apibuilder/blob/main/build.sbt"
        class="text-ab-blue hover:text-ab-dark-blue underline">API Builder's build.sbt file</a
      >.
    </p>
  </div>

  <!-- CTA -->
  <div class="mt-12 mb-8 text-center">
    <p class="text-ab-dark-blue mb-4">Explore all available code generators</p>
    <a href="/doc/generators" class="btn-primary inline-block">View Generators</a>
  </div>
</div>
