<svelte:head>
	<title>Play Union Types - API Builder</title>
</svelte:head>

<div>
	<h1 class="text-2xl font-bold text-ab-dark-blue mb-6">Play Union Types</h1>

	<p class="text-ab-dark-blue mb-4">
		API Builder provides support for declaring your own union types
		(sometimes referred to as sum or algebraic types). The basic idea
		is that you can express that a particular variable is one of a
		known set of types.
	</p>

	<p class="text-ab-dark-blue mb-4">
		As an example, in an ecommerce system, you might want to accept
		orders from both registered users (people who actually have a
		username and password with your service) and also from guest users
		(e.g. people who have never visited your application before). One
		way to model this is to define two types, Registered User and
		Guest User, a single union type User that can be either a
		Registered User or a Guest User, and then to model your order as
		having a User.
	</p>

	<p class="text-ab-dark-blue mb-6">
		Union types, especially when combined with expressive programming
		languages like Scala, can prove to be very useful and pragmatic
		tools for modeling problems like this.
	</p>

	<p class="text-ab-dark-blue mb-4">
		Over the wire, union types in the play 2_x clients are
		represented in one of two ways based on the presence of the discriminator field.
	</p>

	<div class="card mb-6">
		<h2 class="text-lg font-semibold text-ab-dark-blue mb-3">With a discriminator</h2>

		<p class="text-ab-dark-blue mb-4">
			Union type is serialized as a JSON Object with the discriminator
			field injected. For example, assume the discriminator field is set
			to "type":
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
		<h2 class="text-lg font-semibold text-ab-dark-blue mb-3">Without a discriminator</h2>

		<p class="text-ab-dark-blue mb-4">
			Union type is serialized as a JSON Object with one element. The
			key is the name of the type and the value is the JSON
			serialization of the actual object.
		</p>

		<p class="text-ab-dark-blue mb-2">Example serializations:</p>

		<pre class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm overflow-x-auto mb-4">{@html `<code>{
  "registered_user": {
    "guid": "f30dc64e-1793-4d59-aa47-71f000e06851",
    "email": "registered@test.apibuilder.io"
  }
}</code>`}</pre>

		<pre class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm overflow-x-auto">{@html `<code>{
  "guest_user": {
    "guid": "f30dc64e-1793-4d59-aa47-71f000e06851",
    "email": "guest@test.apibuilder.io"
  }
}</code>`}</pre>
	</div>

	<div class="card mb-6">
		<h2 class="text-lg font-semibold text-ab-dark-blue mb-3">Example Applications</h2>

		<p class="text-ab-dark-blue mb-3">
			We also maintain example applications that demonstrate the use of
			the union types with and without discriminators. For more
			information:
		</p>

		<ul class="list-disc list-inside space-y-2 text-ab-dark-blue">
			<li><a href="https://github.com/apicollective/apibuilder-generator/tree/main/example-union-types-discriminator" class="text-ab-blue hover:text-ab-dark-blue">Example with discriminator</a></li>
			<li><a href="https://github.com/apicollective/apibuilder-generator/tree/main/example-union-types" class="text-ab-blue hover:text-ab-dark-blue">Example without discriminator</a></li>
		</ul>
	</div>
</div>
