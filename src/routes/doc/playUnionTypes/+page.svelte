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
		Over the wire, union types in the Play clients are represented based on the types of their members.
	</p>

	<div class="card mb-6">
		<h2 class="text-lg font-semibold text-ab-blue mb-3 flex items-center gap-2">
			<span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-ab-blue text-white text-xs font-bold">D</span>
			Model unions (with a discriminator)
		</h2>

		<p class="text-ab-dark-blue mb-4">
			When all members are models or other unions, the union type is serialized as a JSON object
			with the discriminator field injected.
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
			<span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-ab-blue text-white text-xs font-bold">S</span>
			String-serializable unions (literals, enums, and primitives)
		</h2>

		<p class="text-ab-dark-blue mb-4">
			When all members are enums, string-serializable primitives
			(<code class="bg-gray-100 px-1 rounded">string</code>,
			<code class="bg-gray-100 px-1 rounded">uuid</code>,
			<code class="bg-gray-100 px-1 rounded">date-iso8601</code>,
			<code class="bg-gray-100 px-1 rounded">date-time-iso8601</code>),
			or literal string values, the union is serialized as a plain JSON string.
			These unions can also be used in path and query parameters.
		</p>

		<p class="text-ab-dark-blue mb-2">Example spec:</p>

		<pre class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm overflow-x-auto mb-4">{@html `<code>"unions": {
  "version_number": {
    "discriminator": "value",
    "types": [
      { "literal": "latest", "aliases": ["LATEST"] },
      { "type": "date-time-iso8601" }
    ]
  }
}</code>`}</pre>

		<p class="text-ab-dark-blue mb-2">Example serializations:</p>

		<pre class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm overflow-x-auto mb-4">{@html `<code>"latest"</code>`}</pre>

		<pre class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm overflow-x-auto mb-4">{@html `<code>"2026-03-30T12:00:00.000Z"</code>`}</pre>

		<p class="text-ab-dark-blue mb-4">
			In Scala, this generates a sealed trait with case objects for literals and wrapper case classes for primitives:
		</p>

		<pre class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm overflow-x-auto">{@html `<code>sealed trait VersionNumber
case object Latest extends VersionNumber
case class VersionNumberDateTimeIso8601(value: DateTime) extends VersionNumber

object VersionNumber {
  def apply(value: String): VersionNumber = ...  // parses "latest", "LATEST", or ISO datetime
}</code>`}</pre>
	</div>

	<div class="card mb-6">
		<h2 class="text-lg font-semibold text-ab-blue mb-3 flex items-center gap-2">
			<span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-ab-blue text-white text-xs font-bold">&#x2699;</span>
			Example Applications
		</h2>

		<p class="text-ab-dark-blue mb-3">
			Working examples demonstrating union types:
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
