<svelte:head>
	<title>Why API Builder? - API Builder</title>
</svelte:head>

<div>
	<h1 class="text-2xl font-bold text-ab-dark-blue mb-4">Why API Builder?</h1>

	<p class="text-ab-dark-blue mb-8 text-lg leading-relaxed">
		AI agents using API Builder implement APIs correctly on the first try. The spec defines the contract,
		code generation produces trusted interfaces, and the compiler verifies everything matches.
	</p>

	<!-- Compiler-Verified Correctness -->
	<div class="mb-10">
		<h2 class="text-lg font-bold text-ab-blue mb-4 flex items-center gap-2">
			<span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-ab-blue text-white text-sm">&#10022;</span>
			Compiler-Verified Correctness
		</h2>
		<ul class="space-y-5 text-ab-dark-blue ml-10">
			<li>
				<span class="font-semibold">Generated code is trusted</span> —
				The agent doesn't write SDK code. It uses generated clients and server stubs. The generated
				code is high enough quality that teams stop writing client SDKs entirely.
			</li>
			<li>
				<span class="font-semibold">The compiler becomes the test oracle</span> —
				If your implementation compiles against the generated interfaces, it matches the spec.
				Compiler errors tell the agent exactly what's wrong — missing methods, wrong types,
				incorrect signatures.
			</li>
			<li>
				<span class="font-semibold">Mock clients for testing</span> —
				Generated mock clients share the same interface definition. Agents write meaningful tests
				without external dependencies and override only what's needed for each scenario.
			</li>
		</ul>
	</div>

	<!-- Explicit Data Shapes -->
	<div class="mb-10">
		<h2 class="text-lg font-bold text-ab-blue mb-4 flex items-center gap-2">
			<span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-ab-blue text-white text-sm">&#9889;</span>
			Explicit Data Shapes
		</h2>
		<ul class="space-y-5 text-ab-dark-blue ml-10">
			<li>
				<span class="font-semibold">Every field and type defined upfront</span> —
				Every resource, field, type, and relationship is declared in the spec. No guessing,
				no runtime discovery, no implicit conventions.
			</li>
			<li>
				<span class="font-semibold">Spec as design input</span> —
				Agents use the explicit data shapes to plan UX, database schemas, and data flows.
				The spec becomes input to both API implementation and frontend design.
			</li>
			<li>
				<span class="font-semibold">First class union types</span> —
				A type constrained to one of a known set. Agents know every valid state a value can
				be in — no open-ended polymorphism to handle.
			</li>
		</ul>
	</div>

	<!-- Zero-Friction Workflow -->
	<div class="mb-10">
		<h2 class="text-lg font-bold text-ab-blue mb-4 flex items-center gap-2">
			<span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-ab-blue text-white text-sm">&#9881;</span>
			Zero-Friction Workflow
		</h2>
		<ul class="space-y-5 text-ab-dark-blue ml-10">
			<li>
				<span class="font-semibold">Instant setup</span> —
				<code class="text-sm bg-gray-100 px-1.5 py-0.5 rounded">api init</code> creates
				an anonymous org and token. No signup, no email, no OAuth.
			</li>
			<li>
				<span class="font-semibold">CLI-native</span> —
				Everything is a CLI command agents can script:
				<code class="text-sm bg-gray-100 px-1.5 py-0.5 rounded">api validate</code>,
				<code class="text-sm bg-gray-100 px-1.5 py-0.5 rounded">api</code> (upload + generate).
			</li>
			<li>
				<span class="font-semibold">Versioning built in</span> —
				Every change to every API is recorded with safe and potentially breaking changes listed.
			</li>
		</ul>
	</div>

	<!-- Simple, Parseable Format -->
	<div class="mb-10">
		<h2 class="text-lg font-bold text-ab-blue mb-4 flex items-center gap-2">
			<span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-ab-blue text-white text-sm">&#9670;</span>
			Simple, Parseable Format
		</h2>
		<ul class="space-y-5 text-ab-dark-blue ml-10">
			<li>
				<span class="font-semibold">Flat JSON, no ambiguity</span> —
				The <a href="/doc/apiJson" class="text-ab-blue hover:text-ab-dark-blue underline">api.json</a> format
				is JSON — no YAML indentation issues, no <code class="text-sm bg-gray-100 px-1.5 py-0.5 rounded">$ref</code> to resolve,
				no inheritance to trace.
			</li>
			<li>
				<span class="font-semibold">Fully expanded output</span> —
				The service specification is fully expanded and complete. An agent can read it and
				understand the entire API surface in one pass — no external references to follow.
			</li>
		</ul>
	</div>

	<!-- CTA -->
	<div class="mt-12 mb-8 text-center">
		<p class="text-ab-dark-blue mb-4">Ready to try it?</p>
		<a href="/doc/start" class="btn-primary inline-block">Get Started</a>
	</div>
</div>
