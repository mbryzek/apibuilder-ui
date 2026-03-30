<svelte:head>
	<title>Documentation - API Builder</title>
</svelte:head>

<div>
	<h1 class="text-2xl font-bold text-ab-dark-blue mb-4">API Builder</h1>

	<p class="text-ab-dark-blue mb-8 text-lg leading-relaxed">
		Give your AI agent a structured, type-safe way to build REST APIs. Define the spec,
		generate the code, let the compiler verify correctness.
	</p>

	<!-- Step 1: Install -->
	<div class="mb-10">
		<h2 class="text-lg font-bold text-ab-blue mb-4 flex items-center gap-2">
			<span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-ab-blue text-white text-xs">1</span>
			Install
		</h2>
		<div class="card">
			<p class="text-ab-dark-blue mb-3">
				One command. Zero accounts. Instant access.
			</p>
			<pre class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm overflow-x-auto"><code>api init</code></pre>
		</div>
	</div>

	<!-- Step 2: Define -->
	<div class="mb-10">
		<h2 class="text-lg font-bold text-ab-blue mb-4 flex items-center gap-2">
			<span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-ab-blue text-white text-xs">2</span>
			Define
		</h2>
		<div class="card">
			<p class="text-ab-dark-blue mb-3">
				Write your API in <a href="/doc/apiJson" class="text-ab-blue hover:text-ab-dark-blue underline">api.json</a> —
				a flat JSON format with no <code class="text-sm bg-gray-100 px-1.5 py-0.5 rounded">$ref</code>,
				no <code class="text-sm bg-gray-100 px-1.5 py-0.5 rounded">oneOf</code>,
				no indentation ambiguity. Every field, type, and relationship is explicit.
			</p>
			<p class="text-ab-dark-blue text-sm">
				See the <a href="https://app.apibuilder.io/apicollective/apibuilder-api/latest" class="text-ab-blue hover:text-ab-dark-blue underline">API Builder API spec</a> for a real-world example.
			</p>
		</div>
	</div>

	<!-- Step 3: Generate -->
	<div class="mb-10">
		<h2 class="text-lg font-bold text-ab-blue mb-4 flex items-center gap-2">
			<span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-ab-blue text-white text-xs">3</span>
			Generate
		</h2>
		<div class="card">
			<p class="text-ab-dark-blue mb-3">
				Produce type-safe clients, server stubs, test mocks, and database schemas. Each generator
				outputs a single, self-contained file — drop it into the project and go.
			</p>
			<pre class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm overflow-x-auto"><code>api</code></pre>
			<p class="text-ab-dark-blue text-sm mt-3">
				See <a href="/doc/generators" class="text-ab-blue hover:text-ab-dark-blue underline">all generators</a> — Scala, TypeScript, Java, Go, Elm, and more.
			</p>
		</div>
	</div>

	<!-- Step 4: Verify -->
	<div class="mb-10">
		<h2 class="text-lg font-bold text-ab-blue mb-4 flex items-center gap-2">
			<span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-ab-blue text-white text-xs">4</span>
			Verify
		</h2>
		<div class="card">
			<p class="text-ab-dark-blue">
				Compile. If it builds, it's correct. The generated interfaces enforce the spec — your
				implementation either matches or the compiler tells you exactly what's wrong.
			</p>
		</div>
	</div>

	<!-- CTA -->
	<div class="mt-12 mb-8 text-center">
		<p class="text-ab-dark-blue mb-4">Get your agent started in 30 seconds.</p>
		<a href="/doc/start" class="btn-primary inline-block">Getting Started</a>
	</div>
</div>
