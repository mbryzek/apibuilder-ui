<svelte:head>
	<title>Examples - API Builder</title>
</svelte:head>

<div>
	<h1 class="text-2xl font-bold text-ab-dark-blue mb-4">Examples</h1>

	<p class="text-ab-dark-blue mb-8 text-lg leading-relaxed">
		The fastest way to learn API Builder is by studying real specifications.
		These services power API Builder itself — browse their docs and source to see
		the format in action.
	</p>

	<!-- API Builder's Own Services -->
	<div class="mb-10">
		<h2 class="text-lg font-bold text-ab-blue mb-4 flex items-center gap-2">
			<span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-ab-blue text-white text-xs">✦</span>
			API Builder Services
		</h2>

		<div class="card mb-4">
			<h3 class="font-semibold text-ab-dark-blue mb-2">apibuilder-api</h3>
			<p class="text-ab-dark-blue text-sm mb-2">
				The core API that powers app.apibuilder.io — organizations, applications, versions, and code generation.
			</p>
			<div class="flex gap-4 text-sm">
				<a href="https://app.apibuilder.io/apicollective/apibuilder-api/latest" class="text-ab-blue hover:text-ab-dark-blue underline">Documentation</a>
				<a href="https://github.com/apicollective/apibuilder/blob/main/spec/apibuilder-api.json" class="text-ab-blue hover:text-ab-dark-blue underline">Source (api.json)</a>
			</div>
		</div>

		<div class="card mb-4">
			<h3 class="font-semibold text-ab-dark-blue mb-2">apibuilder-spec</h3>
			<p class="text-ab-dark-blue text-sm mb-2">
				The specification format itself — defines the structure of api.json files.
			</p>
			<div class="flex gap-4 text-sm">
				<a href="https://app.apibuilder.io/apicollective/apibuilder-spec/latest" class="text-ab-blue hover:text-ab-dark-blue underline">Documentation</a>
				<a href="https://github.com/apicollective/apibuilder/blob/main/spec/apibuilder-spec.json" class="text-ab-blue hover:text-ab-dark-blue underline">Source (api.json)</a>
			</div>
		</div>

		<div class="card mb-4">
			<h3 class="font-semibold text-ab-dark-blue mb-2">apibuilder-generator</h3>
			<p class="text-ab-dark-blue text-sm mb-2">
				The code generation service — accepts a service description, returns generated code.
			</p>
			<div class="flex gap-4 text-sm">
				<a href="https://app.apibuilder.io/apicollective/apibuilder-generator/latest" class="text-ab-blue hover:text-ab-dark-blue underline">Documentation</a>
				<a href="https://github.com/apicollective/apibuilder/blob/main/spec/apibuilder-generator.json" class="text-ab-blue hover:text-ab-dark-blue underline">Source (api.json)</a>
			</div>
		</div>
	</div>

	<!-- Generated Code Examples -->
	<div class="mb-10">
		<h2 class="text-lg font-bold text-ab-blue mb-4 flex items-center gap-2">
			<span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-ab-blue text-white text-xs">⚡</span>
			Generated Code Examples
		</h2>
		<div class="card">
			<p class="text-ab-dark-blue mb-3">
				Working examples showing generated output across multiple languages and frameworks:
			</p>
			<ul class="space-y-2 text-ab-dark-blue">
				<li>
					<a href="https://github.com/apicollective/apibuilder-examples" class="text-ab-blue hover:text-ab-dark-blue underline">apibuilder-examples on GitHub</a>
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
