<svelte:head>
	<title>Documentation - API Builder</title>
</svelte:head>

<div>
	<h1 class="text-2xl font-bold text-ab-dark-blue mb-6">API Builder</h1>

	<div class="card mb-6">
		<h2 class="text-lg font-semibold text-ab-dark-blue mb-3">api.json</h2>
		<p class="text-ab-dark-blue mb-3">
			Fully describe your REST service in an intuitive JSON format.
			Start by creating a service, or by downloading
			an <a href="https://app.apibuilder.io/apicollective/apibuilder-api/latest" class="text-ab-blue hover:text-ab-dark-blue">example</a>.
		</p>
		<p class="text-ab-dark-blue mb-3">
			API Builder has a very intuitive format that is simple to learn from
			<a href="/doc/apiJson" class="text-ab-blue hover:text-ab-dark-blue">online docs</a> or from user-contributed
			public services.
		</p>
		<p class="text-ab-dark-blue">
			API Builder also has support for other input formats, including avro idl and swagger 2.0.
		</p>
	</div>

	<div class="card mb-6">
		<h2 class="text-lg font-semibold text-ab-dark-blue mb-3">Convention over configuration</h2>
		<p class="text-ab-dark-blue mb-3">
			Start by describing your models. Then map your models to
			resources that expose the specific operations you would like to
			make available.
		</p>
		<p class="text-ab-dark-blue">
			api.json is designed to guide developers to think carefully
			about their APIs, while making it easy to create services that align
			to the REST standard. By favoring convention over configuration
			in a few key places, it enables developers to create great
			REST APIs.
		</p>
	</div>

	<div class="card mb-6">
		<h2 class="text-lg font-semibold text-ab-dark-blue mb-3">Simple native client libraries with no dependencies</h2>
		<p class="text-ab-dark-blue mb-3">
			Download native client libraries with no (or almost no)
			dependencies. We take special care to make sure that the client
			libraries are a pleasure to use.
		</p>

		<p class="font-semibold text-ab-dark-blue mb-2">Example from Ruby:</p>
		<pre class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm mb-4 overflow-x-auto"><code>client = MyService::Client.new("http://localhost:8000")

organizations = client.organizations.get(:limit => 10, :offset => 0)
organizations.each do |org|
  puts "Org %s is named %s" % [org.id, org.name]
end

neworg = client.organizations.post(:name => "My org")
puts "Created new org named %s" % neworg.name</code></pre>

		<p class="font-semibold text-ab-dark-blue mb-2">Example from Scala:</p>
		<pre class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm overflow-x-auto"><code>{@html `val client = new io.apibuilder.api.v0.Client("http://localhost:8000")

val organizations = client.organizations.get(limit = 10, offset = 0)
organizations.foreach { org =>
  println(s"Org \${org.name} is named \${org.id}")
}

val neworg = client.organizations.post(name = "My org")
println(s"Created new org named \${neworg.name}")`}</code></pre>
	</div>

	<div>
		<a href="/doc/start" class="btn-primary inline-block">Getting Started</a>
	</div>
</div>
