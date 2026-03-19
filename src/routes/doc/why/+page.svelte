<svelte:head>
	<title>Why API Builder? - API Builder</title>
</svelte:head>

<div>
	<h1 class="text-2xl font-bold text-ab-dark-blue mb-4">Why Choose API Builder?</h1>

	<p class="text-ab-dark-blue mb-8 text-lg leading-relaxed">
		Teams choose API Builder because their developers stop writing client SDKs — and their APIs get better.
		Whether it's your only API tool or a complement to your existing stack, API Builder earns its place
		through generated code quality, comprehensive validation, and a workflow that gets out of your way.
	</p>

	<!-- Quality -->
	<div class="mb-10">
		<h2 class="text-lg font-bold text-ab-blue mb-4 flex items-center gap-2">
			<span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-ab-blue text-white text-sm">✦</span>
			Quality
		</h2>
		<ul class="space-y-5 text-ab-dark-blue ml-10">
			<li>
				<span class="font-semibold">High quality generated clients</span> —
				Teams that adopt API Builder stop writing client SDKs entirely. The generated clients
				are high enough quality that developers actually prefer them — freeing up time for product work.
			</li>

			<li>
				<span class="font-semibold">Comprehensive validation</span> —
				Every upload runs extensive checks to ensure internal consistency — all types, names, and
				references are validated. This catches problems at definition time, before they reach
				generated code.
			</li>

			<li>
				<span class="font-semibold">Testability of clients</span> —
				Generated mock clients share the same interface definition, so teams can rely on mocks
				for automated tests and override only what's needed for each scenario.
			</li>
		</ul>
	</div>

	<!-- Flexibility -->
	<div class="mb-10">
		<h2 class="text-lg font-bold text-ab-blue mb-4 flex items-center gap-2">
			<span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-ab-blue text-white text-sm">⚡</span>
			Flexibility
		</h2>
		<ul class="space-y-5 text-ab-dark-blue ml-10">
			<li>
				<span class="font-semibold">Resource centric</span> —
				Define resources first, then expose operations on them. This aligns with modern resource-oriented
				tooling like GraphQL, where high quality metadata on available resources is essential.
			</li>

			<li>
				<span class="font-semibold">First class union types</span> —
				Union types — a type constrained to one of a known set — are first class in API Builder.
				Create new types instead of continually adding optional fields to existing ones.
			</li>

			<li>
				<span class="font-semibold">Multiple input formats</span> —
				Author specs in api.json. Adding new input formats is straightforward.
			</li>

			<li>
				<span class="font-semibold">Easy to add code generators</span> —
				Generators are REST services that accept a service description and return a string.
				Teams write their own — even small, disposable ones — to solve problems in an automated fashion.
			</li>
		</ul>
	</div>

	<!-- Workflow -->
	<div class="mb-10">
		<h2 class="text-lg font-bold text-ab-blue mb-4 flex items-center gap-2">
			<span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-ab-blue text-white text-sm">⚙</span>
			Workflow
		</h2>
		<ul class="space-y-5 text-ab-dark-blue ml-10">
			<li>
				<span class="font-semibold">Integrated tooling</span> —
				The entire <a href="https://app.apibuilder.io" class="text-ab-blue hover:text-ab-dark-blue underline">hosted platform</a> runs
				on the API Builder API, so it's simple to automate workflows. Teams write linters that enforce naming
				standards as part of CI. The <a href="https://github.com/apicollective/apibuilder-cli" class="text-ab-blue hover:text-ab-dark-blue underline">CLI</a> is
				complete enough that many teams skip the UI entirely.
			</li>

			<li>
				<span class="font-semibold">Discovery</span> —
				Free hosting at <a href="https://app.apibuilder.io" class="text-ab-blue hover:text-ab-dark-blue underline">app.apibuilder.io</a> for
				both private and public projects makes service discovery easy across your organization.
			</li>

			<li>
				<span class="font-semibold">Versioning</span> —
				Every change to every API is recorded with a list of safe and potentially breaking changes.
				Teams use these for release notes — for example, the <a href="/apicollective/apibuilder-api" class="text-ab-blue hover:text-ab-dark-blue underline">API Builder API's own history</a>.
			</li>
		</ul>
	</div>

	<!-- Simplicity -->
	<div class="mb-10">
		<h2 class="text-lg font-bold text-ab-blue mb-4 flex items-center gap-2">
			<span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-ab-blue text-white text-sm">◈</span>
			Simplicity
		</h2>
		<ul class="space-y-5 text-ab-dark-blue ml-10">
			<li>
				<span class="font-semibold">Simple input format</span> —
				The default <em>api.json</em> format is JSON that's approachable by a novice. No <em>$ref</em>,
				no <em>oneOf</em> — just look at an existing example and modify it for your application.
			</li>

			<li>
				<span class="font-semibold">Clean service specification</span> —
				API Builder separates input format from service description. Regardless of how you author your spec,
				the output is a fully expanded, complete service description — easy to parse and use directly.
			</li>
		</ul>
	</div>

	<!-- CTA -->
	<div class="mt-12 mb-8 text-center">
		<p class="text-ab-dark-blue mb-4">Ready to try it?</p>
		<a href="/doc/start" class="btn-primary inline-block">Get Started</a>
	</div>
</div>
