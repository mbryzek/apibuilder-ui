<svelte:head>
	<title>Getting Started - API Builder</title>
</svelte:head>

<div>
	<h1 class="text-2xl font-bold text-ab-dark-blue mb-4">Getting Started</h1>

	<p class="text-ab-dark-blue mb-8 text-lg leading-relaxed">
		From zero to generated, compiled code in under a minute.
	</p>

	<!-- Step 1: Initialize -->
	<div class="mb-8" id="quick-start">
		<h2 class="text-lg font-bold text-ab-blue mb-4 flex items-center gap-2">
			<span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-ab-blue text-white text-xs">1</span>
			Initialize
		</h2>
		<div class="card">
			<p class="text-ab-dark-blue mb-3">
				Create an anonymous org and API token. No signup required.
			</p>
			<pre class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm overflow-x-auto"><code>api init</code></pre>
			<p class="text-ab-gray text-sm mt-3">
				This writes your credentials to <code class="bg-gray-100 px-1.5 py-0.5 rounded">~/.apibuilder/config</code>.
			</p>
		</div>
	</div>

	<!-- Step 2: Write a Spec -->
	<div class="mb-8">
		<h2 class="text-lg font-bold text-ab-blue mb-4 flex items-center gap-2">
			<span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-ab-blue text-white text-xs">2</span>
			Write a Spec
		</h2>
		<div class="card">
			<p class="text-ab-dark-blue mb-3">
				Create <code class="text-sm bg-gray-100 px-1.5 py-0.5 rounded">spec/my-api.json</code> with your API definition.
				See the <a href="/doc/apiJson" class="text-ab-blue hover:text-ab-dark-blue underline">api.json reference</a> for the full format.
			</p>
			<pre class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm overflow-x-auto"><code>{@html `{
  "name": "my-api",
  "namespace": "com.example.api.v0",
  "models": {
    "user": {
      "fields": [
        { "name": "id", "type": "string" },
        { "name": "email", "type": "string" }
      ]
    }
  },
  "resources": {
    "user": {
      "operations": [
        {
          "method": "GET",
          "path": "/users/:id",
          "responses": { "200": { "type": "user" } }
        }
      ]
    }
  }
}`}</code></pre>
		</div>
	</div>

	<!-- Step 3: Validate -->
	<div class="mb-8">
		<h2 class="text-lg font-bold text-ab-blue mb-4 flex items-center gap-2">
			<span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-ab-blue text-white text-xs">3</span>
			Validate
		</h2>
		<div class="card">
			<pre class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm overflow-x-auto"><code>api validate spec/my-api.json</code></pre>
			<p class="text-ab-dark-blue text-sm mt-3">
				Catches type mismatches, missing references, and format errors before code generation.
			</p>
		</div>
	</div>

	<!-- Step 4: Generate Code -->
	<div class="mb-8">
		<h2 class="text-lg font-bold text-ab-blue mb-4 flex items-center gap-2">
			<span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-ab-blue text-white text-xs">4</span>
			Generate Code
		</h2>
		<div class="card">
			<p class="text-ab-dark-blue mb-3">
				Configure your generators in <code class="text-sm bg-gray-100 px-1.5 py-0.5 rounded">.api/config</code>,
				then run:
			</p>
			<pre class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm overflow-x-auto"><code>api</code></pre>
			<p class="text-ab-dark-blue text-sm mt-3">
				Auto-detects: uploads specs, then generates clients, server stubs, test mocks, and database schemas
				to the directories mapped in your config. See <a href="/doc/generators" class="text-ab-blue hover:text-ab-dark-blue underline">available generators</a>.
			</p>
		</div>
	</div>

	<!-- Step 5: Compile -->
	<div class="mb-8">
		<h2 class="text-lg font-bold text-ab-blue mb-4 flex items-center gap-2">
			<span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-ab-blue text-white text-xs">5</span>
			Compile and Verify
		</h2>
		<div class="card">
			<p class="text-ab-dark-blue mb-3">
				Compile the generated code alongside your implementation. If it compiles, your implementation
				matches the spec. If not, the compiler errors tell you exactly what to fix.
			</p>
			<pre class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm overflow-x-auto"><code>sbt compile    # Scala
tsc --noEmit   # TypeScript</code></pre>
		</div>
	</div>

	<!-- Step 6: Test -->
	<div class="mb-8">
		<h2 class="text-lg font-bold text-ab-blue mb-4 flex items-center gap-2">
			<span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-ab-blue text-white text-xs">6</span>
			Write Tests
		</h2>
		<div class="card">
			<p class="text-ab-dark-blue">
				Use generated mock clients to test your implementation. They share the same interface
				as real clients — override only what you need per scenario.
			</p>
		</div>
	</div>

	<!-- Agent Skill -->
	<div class="mb-8">
		<h2 class="text-lg font-bold text-ab-blue mb-4 flex items-center gap-2">
			<span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-ab-blue text-white text-xs">&#10022;</span>
			Add the Skill to Your Agent
		</h2>
		<div class="card">
			<p class="text-ab-dark-blue mb-3">
				Give your AI agent the full API Builder workflow as a skill. The skill teaches the agent
				spec authoring, validation, code generation, compiler verification, and testing.
			</p>
			<p class="text-ab-dark-blue">
				<a href="https://github.com/mbryzek/apibuilder-ui/blob/main/skills/apibuilder.md" class="text-ab-blue hover:text-ab-dark-blue underline">
					View the skill on GitHub
				</a>
			</p>
		</div>
	</div>

	<!-- CTA -->
	<div class="mt-12 mb-8 text-center">
		<p class="text-ab-dark-blue mb-4">Need an API token for programmatic access?</p>
		<a href="/doc/apiTokens" class="btn-primary inline-block">API Tokens</a>
	</div>
</div>
