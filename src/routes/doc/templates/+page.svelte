<svelte:head>
	<title>Templates - API Builder</title>
</svelte:head>

<div>
	<h1 class="text-2xl font-bold text-ab-dark-blue mb-4">Templates</h1>

	<p class="text-ab-dark-blue mb-8 text-lg leading-relaxed">
		Templates eliminate duplication in api.json by letting you define models and resources once,
		then reuse them across multiple concrete types. Templates are syntactic sugar — they require
		no changes to code generators, since templates are fully expanded before the service
		specification is produced.
	</p>

	<!-- The Problem -->
	<div class="card mb-6">
		<h2 class="text-lg font-semibold text-ab-blue mb-3 flex items-center gap-2">
			<span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-ab-blue text-white text-xs">1</span>
			The Problem
		</h2>
		<p class="text-ab-dark-blue mb-3">
			When multiple models share the same fields and resources share the same operations,
			your api.json accumulates duplication with no way to guarantee consistency.
		</p>
		<p class="text-ab-dark-blue mb-3">For example, two account types with identical fields:</p>
		<pre class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm mb-4 overflow-x-auto"><code>client_account:
  fields:
    - id: string
    - currency: string

partner_account:
  fields:
    - id: string
    - currency: string</code></pre>
		<p class="text-ab-dark-blue">Each exposed as a resource with the same operations:</p>
		<pre class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm mt-3 overflow-x-auto"><code>client_account:
  GET /client/accounts
  GET /client/accounts/:id

partner_account:
  GET /partner/accounts
  GET /partner/accounts/:id</code></pre>
	</div>

	<!-- Define a Template -->
	<div class="card mb-6">
		<h2 class="text-lg font-semibold text-ab-blue mb-3 flex items-center gap-2">
			<span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-ab-blue text-white text-xs">2</span>
			Define a Template
		</h2>
		<p class="text-ab-dark-blue mb-3">
			Extract the common spec into a top-level <strong>templates</strong> node. Define both model fields
			and resource operations in one place.
		</p>
		<pre class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm overflow-x-auto"><code>{@html `"templates": {
  "models": {
    "account": {
      "fields": [
        { "name": "id", "type": "string", "example": "xxxx-1234" },
        { "name": "currency", "type": "string" }
      ]
    }
  },
  "resources": {
    "account": {
      "operations": [
        {
          "method": "GET",
          "parameters": [
            { "name": "id", "type": "[string]", "required": false, "maximum": 100 }
          ],
          "responses": {
            "200": { "type": "[account]" },
            "401": { "type": "unit" },
            "404": { "type": "unit" }
          }
        },
        {
          "method": "GET",
          "path": "/:id",
          "responses": {
            "200": { "type": "account" },
            "401": { "type": "unit" },
            "404": { "type": "unit" }
          }
        }
      ]
    }
  }
}`}</code></pre>
	</div>

	<!-- Use Model Templates -->
	<div class="card mb-6">
		<h2 class="text-lg font-semibold text-ab-blue mb-3 flex items-center gap-2">
			<span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-ab-blue text-white text-xs">3</span>
			Apply to Models
		</h2>
		<p class="text-ab-dark-blue mb-3">
			Reference the template by name. Each model inherits all template fields, and API Builder
			automatically creates an interface so the models share a common type.
		</p>
		<pre class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm overflow-x-auto"><code>{@html `"models": {
  "partner_account": {
    "templates": [{ "name": "account" }]
  },
  "client_account": {
    "templates": [{ "name": "account" }]
  }
}`}</code></pre>
	</div>

	<!-- Use Resource Templates -->
	<div class="card mb-6">
		<h2 class="text-lg font-semibold text-ab-blue mb-3 flex items-center gap-2">
			<span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-ab-blue text-white text-xs">4</span>
			Apply to Resources
		</h2>
		<p class="text-ab-dark-blue mb-3">
			Same pattern for resources — reference the template and specify the unique path.
		</p>
		<pre class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm overflow-x-auto"><code>{@html `"resources": {
  "partner_account": {
    "templates": [{ "name": "account" }],
    "path": "/partner/accounts"
  },
  "client_account": {
    "templates": [{ "name": "account" }],
    "path": "/client/accounts"
  }
}`}</code></pre>
	</div>

	<!-- Merge Behavior -->
	<div class="card mb-6">
		<h2 class="text-lg font-semibold text-ab-blue mb-3 flex items-center gap-2">
			<span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-ab-blue text-white text-xs">!</span>
			Merge Behavior
		</h2>
		<ul class="space-y-3 text-ab-dark-blue ml-2">
			<li>
				<strong>Override by default</strong> — Anything you specify in the model or resource takes
				precedence over the template. Add a field to just one model by declaring it there.
			</li>
			<li>
				<strong>Type specialization</strong> — Template types are automatically specialized.
				A template referencing <em>account</em> becomes <em>client_account</em> or
				<em>partner_account</em> in the final service specification.
			</li>
			<li>
				<strong>Auto-interfaces</strong> — API Builder creates an interface from the template name,
				with each consuming model extending it.
			</li>
		</ul>
	</div>

	<!-- Resources -->
	<div class="card mb-6">
		<h2 class="text-lg font-semibold text-ab-dark-blue mb-3">Resources</h2>
		<ul class="space-y-2 text-ab-dark-blue ml-2">
			<li>
				<a href="https://github.com/apicollective/apibuilder/blob/main/examples/example-template.json" class="text-ab-blue hover:text-ab-dark-blue underline">Complete template example</a>
				— Full api.json with model and resource templates
			</li>
			<li>
				<a href="https://app.apibuilder.io/apicollective/example-template/latest#interface-statement" class="text-ab-blue hover:text-ab-dark-blue underline">Live example in API Builder</a>
				— See the expanded result in the UI
			</li>
		</ul>
	</div>

	<!-- CTA -->
	<div class="mt-12 mb-8 text-center">
		<p class="text-ab-dark-blue mb-4">Ready to reduce duplication in your API spec?</p>
		<a href="/doc/apiJson" class="btn-primary inline-block">View api.json Format</a>
	</div>
</div>
