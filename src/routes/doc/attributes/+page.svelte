<svelte:head>
	<title>Attributes - API Builder</title>
</svelte:head>

<div>
	<h1 class="text-2xl font-bold text-ab-dark-blue mb-4">Attributes</h1>

	<p class="text-ab-dark-blue mb-8 text-lg leading-relaxed">
		Attributes let you customize code generation behavior per-organization or per-service.
		Generators declare which attributes they depend on, and API Builder passes the
		matching values automatically.
	</p>

	<!-- How They Work -->
	<div class="mb-10">
		<h2 class="text-lg font-bold text-ab-blue mb-4 flex items-center gap-2">
			<span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-ab-blue text-white text-xs">⚙</span>
			How Attributes Work
		</h2>
		<div class="card">
			<ul class="space-y-4 text-ab-dark-blue">
				<li>
					<strong>Globally unique</strong> — Each attribute has a URL-friendly name and optional description.
				</li>
				<li>
					<strong>Organization-level defaults</strong> — Set attribute values at the org level and they
					cascade to all applications in that organization.
				</li>
				<li>
					<strong>Generator integration</strong> — A code generator declares the attribute names it depends on.
					API Builder sends matching values when invoking the generator.
				</li>
			</ul>
		</div>
	</div>

	<!-- Setting Attributes -->
	<div class="mb-10">
		<h2 class="text-lg font-bold text-ab-blue mb-4 flex items-center gap-2">
			<span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-ab-blue text-white text-xs">✦</span>
			Setting Attribute Values
		</h2>
		<div class="card">
			<p class="text-ab-dark-blue mb-3">
				To configure attributes for your organization:
			</p>
			<ol class="space-y-2 text-ab-dark-blue list-decimal list-inside">
				<li>Navigate to your organization</li>
				<li>Click <strong>"Org Details"</strong> in the left nav</li>
				<li>Select <strong>"Org Attributes"</strong></li>
				<li>Set values for the attributes used by your generators</li>
			</ol>
		</div>
	</div>

	<!-- CTA -->
	<div class="mt-12 mb-8 text-center">
		<p class="text-ab-dark-blue mb-4">See which generators support attributes.</p>
		<a href="/doc/generators" class="btn-primary inline-block">View Generators</a>
	</div>
</div>
