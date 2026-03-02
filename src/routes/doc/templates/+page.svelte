<svelte:head>
	<title>Templates - API Builder</title>
</svelte:head>

<div>
	<h1 class="text-2xl font-bold text-ab-dark-blue mb-6">Templates</h1>

	<div class="card mb-6">
		<p class="text-ab-dark-blue mb-3">
			Templates are an experimental feature in API Builder's API.json format.
		</p>

		<ul class="list-disc list-inside text-ab-dark-blue space-y-1 ml-2 mb-4">
			<li><a href="https://github.com/apicollective/apibuilder/blob/main/examples/example-template.json" class="text-ab-blue hover:text-ab-dark-blue">Example api.json file demonstrating templates</a></li>
			<li><a href="https://app.apibuilder.io/apicollective/example-template/latest#interface-statement" class="text-ab-blue hover:text-ab-dark-blue">API Builder UI of this example</a></li>
		</ul>
	</div>

	<div class="card mb-6">
		<h2 class="text-lg font-semibold text-ab-dark-blue mb-3">Overview</h2>
		<p class="text-ab-dark-blue mb-3">
			Templates add support to api.json to create reusable definitions of
			the various features in API Builder. As of the initial release, templates
			are supported for both models and resources. Templates are syntactic sugar
			in the api.json file format that copy portions of common specs into multiple
			places. Templates require no changes in code generators (specifically because
			there are no template related changes in the service specification itself).
		</p>

		<p class="text-ab-dark-blue mb-3">
			The best way to understand templates is with an example. At Flow Commerce,
			we have APIs that surface account information to both our clients and to
			our partners. The accounts share a lot of common behavior - including fields
			and operations - but are exposed at different URLs (enabling caching
			and authorization based on how Flow's internal schemes).
		</p>
	</div>

	<div class="card mb-6">
		<h2 class="text-lg font-semibold text-ab-dark-blue mb-3">Example: Shared Models and Resources</h2>
		<p class="text-ab-dark-blue mb-3">
			To implement the client and partner accounts, we wanted to define two models
			(note this example is a simpler version of what we use at Flow but should highlight
			the strength of the templates feature):
		</p>

		<pre class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm mb-4 overflow-x-auto"><code>client_account:
  fields:
    - id: string
    - currency: string

partner_account:
  fields:
    - id: string
    - currency: string</code></pre>

		<p class="text-ab-dark-blue mb-3">
			Then we expose each as a resource with a common set of operations:
		</p>

		<pre class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm mb-4 overflow-x-auto"><code>client_account:
  GET /client/accounts
  GET /client/accounts/:id

partner_account:
  GET /partner/accounts
  GET /partner/accounts/:id</code></pre>

		<p class="text-ab-dark-blue">
			In practice this leads to duplication in the api definition - and there is
			no good way to guarantee that the implementations stay consistent.
		</p>
	</div>

	<div class="card mb-6">
		<h2 class="text-lg font-semibold text-ab-dark-blue mb-3">Defining Templates</h2>
		<p class="text-ab-dark-blue mb-3">
			With the templates feature, we instead define the common specs in a new
			top level node named "templates":
		</p>

		<pre class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm overflow-x-auto"><code>{@html `"templates": {
  "models": {
    "account": {
      "fields": [
        { "name": "id", "type": "string", "example": "xxxx-1234" },
        { "name": "currency", "type": "string" }
      ]
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
  }
}`}</code></pre>
	</div>

	<div class="card mb-6">
		<h2 class="text-lg font-semibold text-ab-dark-blue mb-3">Using Model Templates</h2>
		<p class="text-ab-dark-blue mb-3">
			With this template, we can now define our two models. Note that these models will contain
			ALL of the data specified in the template - including all of the fields. Additionally, API Builder
			automatically adds an interface named "account" with each model extending that interface.
			Model template declarations pull from the <em>templates/models/&lt;name&gt;</em> nodes in the
			api json specification.
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

	<div class="card mb-6">
		<h2 class="text-lg font-semibold text-ab-dark-blue mb-3">Using Resource Templates</h2>
		<p class="text-ab-dark-blue mb-3">
			We can now expose these models as resources, referencing the template for all the common operations.
			Resource template declarations pull from the <em>templates/resources/&lt;name&gt;</em> nodes in the
			api json specification.
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

	<div class="card mb-6">
		<h2 class="text-lg font-semibold text-ab-dark-blue mb-3">Template Merge Behavior</h2>
		<p class="text-ab-dark-blue mb-3">
			Importantly, the template operations are merge operations. Anything you specify in the model
			or resource definition takes precedence. For example, you can easily add a field to just
			the client_account model by simply adding the field to that model specification.
		</p>

		<p class="text-ab-dark-blue">
			Note also that any types that are specified only in the templates section will be specialized
			to the model or resource that is using that template. In the example here, the template resource
			operations refer to the type <em>account</em> - the actual service specifications will refer
			to the type <em>client_account</em> and <em>partner_account</em> respectively.
		</p>
	</div>
</div>
