<svelte:head>
	<title>Getting Started - API Builder</title>
</svelte:head>

<div>
	<h1 class="text-2xl font-bold text-ab-dark-blue mb-4">Getting Started</h1>

	<p class="text-ab-dark-blue mb-8 text-lg leading-relaxed">
		Go from API specification to generated client library in minutes. Follow these steps to
		define, document, and generate code for your first service.
	</p>

	<!-- Step 1 -->
	<div class="mb-8">
		<h2 class="text-lg font-bold text-ab-blue mb-4 flex items-center gap-2">
			<span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-ab-blue text-white text-xs">1</span>
			Create Your Organization
		</h2>
		<div class="card">
			<p class="text-ab-dark-blue">
				After logging in, <a href="/org/create" class="text-ab-blue hover:text-ab-dark-blue underline">create an organization</a>.
				This is the container for all of your services and generated code.
			</p>
		</div>
	</div>

	<!-- Step 2 -->
	<div class="mb-8">
		<h2 class="text-lg font-bold text-ab-blue mb-4 flex items-center gap-2">
			<span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-ab-blue text-white text-xs">2</span>
			Create Your First Service
		</h2>
		<div class="card">
			<p class="text-ab-dark-blue mb-3">
				A service represents a full REST API described in a single file. By convention, name it
				<code class="text-sm bg-gray-100 px-1.5 py-0.5 rounded">api.json</code> and store it in your
				project root.
			</p>
			<p class="text-ab-dark-blue mb-3">
				<strong>Quickest path:</strong> download the
				<a href="https://app.apibuilder.io/apicollective/apibuilder-api/latest" class="text-ab-blue hover:text-ab-dark-blue underline">API Builder API spec</a>
				as a starting point, then edit it for your application.
			</p>
			<p class="text-ab-dark-blue">
				Click <strong>"Add Application"</strong> from your organization page to upload your spec.
				See the <a href="/doc/apiJson" class="text-ab-blue hover:text-ab-dark-blue underline">api.json reference</a> for
				full format details.
			</p>
		</div>
	</div>

	<!-- Step 3 -->
	<div class="mb-8">
		<h2 class="text-lg font-bold text-ab-blue mb-4 flex items-center gap-2">
			<span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-ab-blue text-white text-xs">3</span>
			View Your Documentation
		</h2>
		<div class="card">
			<p class="text-ab-dark-blue">
				API Builder generates interactive documentation automatically. Use the
				<code class="text-sm bg-gray-100 px-1.5 py-0.5 rounded">latest</code> version URL to always
				link to the most current version of your service.
			</p>
		</div>
	</div>

	<!-- Step 4 -->
	<div class="mb-8">
		<h2 class="text-lg font-bold text-ab-blue mb-4 flex items-center gap-2">
			<span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-ab-blue text-white text-xs">4</span>
			Download a Client Library
		</h2>
		<div class="card">
			<p class="text-ab-dark-blue">
				Navigate to your service and look for the <strong>"Clients"</strong> section. Each client is a
				standalone, single-file download — ready to drop into your project or publish as an artifact.
				See the full list of <a href="/doc/generators" class="text-ab-blue hover:text-ab-dark-blue underline">available generators</a>.
			</p>
		</div>
	</div>

	<!-- Step 5 -->
	<div class="mb-8">
		<h2 class="text-lg font-bold text-ab-blue mb-4 flex items-center gap-2">
			<span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-ab-blue text-white text-xs">5</span>
			Configure Your Organization
		</h2>
		<div class="card">
			<p class="text-ab-dark-blue">
				Go to <strong>"Org Details"</strong> in the left nav to set package names for generated clients
				and optionally make your organization public for service discovery.
			</p>
		</div>
	</div>

	<!-- Step 6 -->
	<div class="mb-8">
		<h2 class="text-lg font-bold text-ab-blue mb-4 flex items-center gap-2">
			<span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-ab-blue text-white text-xs">6</span>
			Use the CLI
		</h2>
		<div class="card">
			<p class="text-ab-dark-blue">
				The <a href="https://github.com/apicollective/apibuilder-cli" class="text-ab-blue hover:text-ab-dark-blue underline">apibuilder-cli</a> lets
				you upload new versions and download generated code directly into your source tree — no
				browser required.
			</p>
		</div>
	</div>

	<!-- Get Involved -->
	<div class="mb-8">
		<h2 class="text-lg font-bold text-ab-blue mb-4 flex items-center gap-2">
			<span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-ab-blue text-white text-xs">✦</span>
			Get Involved
		</h2>
		<div class="card">
			<ul class="space-y-2 text-ab-dark-blue">
				<li><a href="https://github.com/apicollective/apibuilder" class="text-ab-blue hover:text-ab-dark-blue underline">Follow API Builder on GitHub</a></li>
				<li>Join the conversation on Slack at <strong>#apicollective</strong></li>
				<li><a href="https://github.com/apicollective/apibuilder/issues" class="text-ab-blue hover:text-ab-dark-blue underline">Report bugs or request features</a></li>
				<li>Contribute api.json specs for common services and share them as public APIs</li>
			</ul>
		</div>
	</div>

	<!-- CTA -->
	<div class="mt-12 mb-8 text-center">
		<p class="text-ab-dark-blue mb-4">Need an API token for programmatic access?</p>
		<a href="/doc/apiTokens" class="btn-primary inline-block">API Tokens</a>
	</div>
</div>
