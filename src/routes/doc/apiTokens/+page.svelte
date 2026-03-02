<svelte:head>
	<title>API Tokens - API Builder</title>
</svelte:head>

<div>
	<h1 class="text-2xl font-bold text-ab-dark-blue mb-4">API Tokens</h1>

	<p class="text-ab-dark-blue mb-8 text-lg leading-relaxed">
		Everything in the API Builder UI is powered by a public REST API. Use API tokens to
		authenticate and access private data programmatically.
	</p>

	<!-- Public Access -->
	<div class="mb-10">
		<h2 class="text-lg font-bold text-ab-blue mb-4 flex items-center gap-2">
			<span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-ab-blue text-white text-xs">1</span>
			Public Data (No Token Required)
		</h2>
		<div class="card">
			<p class="text-ab-dark-blue mb-3">
				All public information is available without authentication:
			</p>
			<pre class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm overflow-x-auto"><code>{@html `curl https://api.apibuilder.io/organizations

  [
    {
      "guid": "480d042d-2bf9-47f3-a743-204a05eaa319",
      "key": "apicollective",
      "name": "API Collective",
      "namespace": "io",
      "visibility": "public",
      ...
    }
  ]`}</code></pre>
		</div>
	</div>

	<!-- Create Token -->
	<div class="mb-10">
		<h2 class="text-lg font-bold text-ab-blue mb-4 flex items-center gap-2">
			<span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-ab-blue text-white text-xs">2</span>
			Create a Token
		</h2>
		<div class="card">
			<p class="text-ab-dark-blue">
				Generate a token from your <a href="/tokens" class="text-ab-blue hover:text-ab-dark-blue underline">API tokens page</a>.
				Tokens grant access to your private organizations, applications, and generated code.
			</p>
		</div>
	</div>

	<!-- Verify Token -->
	<div class="mb-10">
		<h2 class="text-lg font-bold text-ab-blue mb-4 flex items-center gap-2">
			<span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-ab-blue text-white text-xs">3</span>
			Verify Your Token
		</h2>
		<div class="card">
			<p class="text-ab-dark-blue mb-3">
				Confirm your token works by fetching your organization:
			</p>
			<pre class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm overflow-x-auto mb-3"><code>{@html `curl -u API_TOKEN: https://api.apibuilder.io/&lt;your-org-key&gt;`}</code></pre>
			<p class="text-ab-dark-blue text-sm">
				You should see your private applications in the response.
			</p>
		</div>
	</div>

	<!-- Full API Docs -->
	<div class="card mb-8">
		<h2 class="text-lg font-semibold text-ab-dark-blue mb-3">Full API Reference</h2>
		<p class="text-ab-dark-blue">
			The complete API Builder API is documented at
			<a href="/apicollective/apibuilder-api" class="text-ab-blue hover:text-ab-dark-blue underline">apicollective/apibuilder-api</a> —
			every endpoint available in the UI is available via the API.
		</p>
	</div>

	<!-- CTA -->
	<div class="mt-12 mb-8 text-center">
		<p class="text-ab-dark-blue mb-4">Ready to automate your workflow?</p>
		<a href="/tokens" class="btn-primary inline-block">Manage Tokens</a>
	</div>
</div>
