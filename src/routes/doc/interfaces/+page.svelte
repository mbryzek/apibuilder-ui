<svelte:head>
	<title>Interfaces - API Builder</title>
</svelte:head>

<div>
	<h1 class="text-2xl font-bold text-ab-dark-blue mb-6">Interfaces</h1>

	<div class="card mb-6">
		<p class="text-ab-dark-blue mb-3">
			Interfaces are used to share fields across models and union types.
			Models and union types can extend 0 or more interfaces, but interfaces themselves are abstract and cannot be instantiated.
		</p>
	</div>

	<div class="card mb-6">
		<h2 class="text-lg font-semibold text-ab-dark-blue mb-3">Defining an Interface</h2>
		<p class="text-ab-dark-blue mb-3">
			To define an interface, declare an interface:
		</p>
		<pre class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm mb-4 overflow-x-auto"><code>{@html `"person": {
    "fields": [
        { "name": "email", "type": "string", "required": false },
        { "name": "name", "type": "string", "required": false }
    ]
}`}</code></pre>

		<p class="text-ab-dark-blue mb-3">
			A scala code generator may produce the following to represent this interface:
		</p>
		<pre class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm overflow-x-auto"><code>{@html `sealed trait Person {
    def email: Option[String]
    def name: Option[String]
}`}</code></pre>
	</div>

	<div class="card mb-6">
		<h2 class="text-lg font-semibold text-ab-dark-blue mb-3">Extending an Interface</h2>
		<p class="text-ab-dark-blue mb-3">
			To indicate a particular model extends this interface:
		</p>
		<pre class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm mb-4 overflow-x-auto"><code>{@html `"models": {
    "guest": {
        "interfaces": ["person"],
        "fields": [
            { "name": "session_id", "type": "string" },
            { "name": "email", "type": "string", "required": false },
            { "name": "name", "type": "string", "required": false }
        ]
    }
}`}</code></pre>

		<p class="text-ab-dark-blue mb-3">
			API Builder will enforce that any model that extends an interface will declare fields that match the interface (by name, type, and required).
		</p>

		<p class="text-ab-dark-blue mb-3">
			A scala code generator may produce the following to represent this model:
		</p>
		<pre class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm overflow-x-auto"><code>case class Guest(
    sessionId: String,
    override val email: Option[String] = None,
    override val name: Option[String] = None
) extends Person</code></pre>
	</div>

	<div class="card mb-6">
		<h2 class="text-lg font-semibold text-ab-dark-blue mb-3">Union Types with Interfaces</h2>
		<p class="text-ab-dark-blue mb-3">
			Union types behave similarly to models with a few additional features:
		</p>
		<ul class="list-disc list-inside text-ab-dark-blue mb-4 space-y-1 ml-2">
			<li>You can declare an interface with the same name as a union type, as long as the union type documents that you are intentionally doing so by listing the interface.</li>
			<li>Any type listed in the union type will automatically inherit the interface defined on the union type.</li>
		</ul>
		<p class="text-ab-dark-blue mb-3">
			As an example, we can define the following union type:
		</p>
		<pre class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm mb-4 overflow-x-auto"><code>{@html `"unions": {
    "person": {
        "discriminator": "discriminator",
        "interfaces": ["person"],
        "types": [
            { "type": "guest" }
        ]
    }
}`}</code></pre>
		<p class="text-ab-dark-blue">
			This means that the guest model is of type person and will automatically inherit the person interface (no need to explicitly specify the interface on the guest model).
		</p>
	</div>

	<p class="text-ab-dark-blue">
		For a complete example of an api.json file demonstrating interfaces, see
		<a href="https://github.com/apicollective/apibuilder/blob/main/examples/example-interface.json" class="text-ab-blue hover:text-ab-dark-blue">example-interface.json</a>.
	</p>
</div>
