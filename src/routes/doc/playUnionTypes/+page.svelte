<svelte:head>
	<title>Play Union Types - API Builder</title>
</svelte:head>

<div>
	<h1 class="text-2xl font-bold text-ab-dark-blue mb-4">Play Union Types</h1>

	<p class="text-ab-dark-blue mb-4 text-lg leading-relaxed">
		Model type-safe alternatives with union types. Express that a variable is exactly one of a known
		set of types — the generated Play clients handle serialization and deserialization automatically.
	</p>

	<p class="text-ab-dark-blue mb-4">
		For example, in an ecommerce system you might accept orders from both registered users (with
		a username and password) and guest users (first-time visitors). Define a
		<code class="bg-gray-100 px-1 rounded">registered_user</code> type and a
		<code class="bg-gray-100 px-1 rounded">guest_user</code> type, then combine them into a single
		<code class="bg-gray-100 px-1 rounded">user</code> union type and reference it from your order model.
	</p>

	<p class="text-ab-dark-blue mb-6">
		Over the wire, union types in the Play 2.x clients are represented in one of two ways based on the
		presence of a discriminator field.
	</p>

	<div class="card mb-6">
		<h2 class="text-lg font-semibold text-ab-blue mb-3 flex items-center gap-2">
			<span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-ab-blue text-white text-xs font-bold">D</span>
			With a discriminator
		</h2>

		<p class="text-ab-dark-blue mb-4">
			The union type is serialized as a JSON object with the discriminator field injected.
			For example, with the discriminator set to <code class="bg-gray-100 px-1 rounded">"type"</code>:
		</p>

		<p class="text-ab-dark-blue mb-2">Example serializations:</p>

		<pre class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm overflow-x-auto mb-4">{@html `<code>{
  "type": "registered_user",
  "guid": "f30dc64e-1793-4d59-aa47-71f000e06851",
  "email": "registered@test.apibuilder.io"
}</code>`}</pre>

		<pre class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm overflow-x-auto">{@html `<code>{
  "type": "guest_user",
  "guid": "f30dc64e-1793-4d59-aa47-71f000e06851",
  "email": "guest@test.apibuilder.io"
}</code>`}</pre>
	</div>

	<div class="card mb-6">
		<h2 class="text-lg font-semibold text-ab-blue mb-3 flex items-center gap-2">
			<span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-ab-blue text-white text-xs font-bold">W</span>
			Without a discriminator
		</h2>

		<p class="text-ab-dark-blue mb-4">
			The union type is serialized as a JSON object with one element — the key is the type name
			and the value is the serialized object.
		</p>

		<p class="text-ab-dark-blue mb-2">Example serializations:</p>

		<pre class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm overflow-x-auto mb-4">{@html `<code>{
  "registered_user": {
    "guid": "f30dc64e-1793-4d59-aa47-71f000e06851",
    "email": "registered@test.apibuilder.io"
  }
}</code>`}</pre>

		<pre class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm overflow-x-auto">{@html `<code>{
  "guest_user": {
    "guid": "f30dc64e-1793-4d59-aa47-71f000e06851",
    "email": "guest@test.apibuilder.io"
  }
}</code>`}</pre>
	</div>

	<div class="card mb-6">
		<h2 class="text-lg font-semibold text-ab-blue mb-3 flex items-center gap-2">
			<span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-ab-blue text-white text-xs font-bold">&#x2699;</span>
			Example Applications
		</h2>

		<p class="text-ab-dark-blue mb-3">
			Working examples demonstrating union types with and without discriminators:
		</p>

		<ul class="list-disc list-inside space-y-2 text-ab-dark-blue">
			<li><a href="https://github.com/apicollective/apibuilder-generator/tree/main/example-union-types-discriminator" class="text-ab-blue hover:text-ab-dark-blue underline">Example with discriminator</a></li>
			<li><a href="https://github.com/apicollective/apibuilder-generator/tree/main/example-union-types" class="text-ab-blue hover:text-ab-dark-blue underline">Example without discriminator</a></li>
		</ul>
	</div>

	<!-- CTA -->
	<div class="mt-12 mb-8 text-center">
		<p class="text-ab-dark-blue mb-4">Ready to define your own union types?</p>
		<a href="/doc/apiJson" class="btn-primary inline-block">View api.json Specification</a>
	</div>
</div>
