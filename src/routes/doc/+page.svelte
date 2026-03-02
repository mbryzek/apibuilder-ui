<svelte:head>
	<title>Documentation - API Builder</title>
</svelte:head>

<div>
	<h1 class="text-2xl font-bold text-ab-dark-blue mb-4">API Builder</h1>

	<p class="text-ab-dark-blue mb-8 text-lg leading-relaxed">
		Define your REST API in a simple JSON format, and API Builder generates production-quality
		client libraries, server stubs, and documentation — so your team ships faster.
	</p>

	<!-- Intuitive API Design -->
	<div class="mb-10">
		<h2 class="text-lg font-bold text-ab-blue mb-4 flex items-center gap-2">
			<span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-ab-blue text-white text-xs">1</span>
			Intuitive API Design
		</h2>
		<div class="card">
			<p class="text-ab-dark-blue mb-3">
				Describe your service in <a href="/doc/apiJson" class="text-ab-blue hover:text-ab-dark-blue underline">api.json</a> —
				a clean JSON format that guides you toward well-structured REST APIs through convention over configuration.
			</p>
			<p class="text-ab-dark-blue mb-3">
				Also supports <strong>Swagger 2.0</strong> and <strong>Avro IDL</strong> as input formats.
			</p>
			<p class="text-ab-dark-blue text-sm">
				See the <a href="https://app.apibuilder.io/apicollective/apibuilder-api/latest" class="text-ab-blue hover:text-ab-dark-blue underline">API Builder API spec</a> for a real-world example.
			</p>
		</div>
	</div>

	<!-- Generated Client Libraries -->
	<div class="mb-10">
		<h2 class="text-lg font-bold text-ab-blue mb-4 flex items-center gap-2">
			<span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-ab-blue text-white text-xs">2</span>
			Generated Client Libraries
		</h2>
		<div class="card">
			<p class="text-ab-dark-blue mb-4">
				Download native client libraries with minimal dependencies. Each is a single, readable file
				that drops straight into your project.
			</p>

			<p class="font-semibold text-ab-dark-blue mb-2 text-sm">Ruby</p>
			<pre class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm mb-4 overflow-x-auto"><code>client = MyService::Client.new("http://localhost:8000")

organizations = client.organizations.get(:limit => 10, :offset => 0)
organizations.each do |org|
  puts "Org %s is named %s" % [org.id, org.name]
end

neworg = client.organizations.post(:name => "My org")
puts "Created new org named %s" % neworg.name</code></pre>

			<p class="font-semibold text-ab-dark-blue mb-2 text-sm">Scala</p>
			<pre class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm overflow-x-auto"><code>{@html `val client = new io.apibuilder.api.v0.Client("http://localhost:8000")

val organizations = client.organizations.get(limit = 10, offset = 0)
organizations.foreach { org =>
  println(s"Org \${org.name} is named \${org.id}")
}

val neworg = client.organizations.post(name = "My org")
println(s"Created new org named \${neworg.name}")`}</code></pre>
		</div>
	</div>

	<!-- Explore -->
	<div class="mb-10">
		<h2 class="text-lg font-bold text-ab-blue mb-4 flex items-center gap-2">
			<span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-ab-blue text-white text-xs">3</span>
			Explore More
		</h2>
		<div class="card">
			<ul class="space-y-2 text-ab-dark-blue">
				<li><a href="/doc/generators" class="text-ab-blue hover:text-ab-dark-blue underline">Code generators</a> — Scala, Java, TypeScript, Go, Ruby, and more</li>
				<li><a href="/doc/why" class="text-ab-blue hover:text-ab-dark-blue underline">Why API Builder?</a> — What makes it different</li>
				<li><a href="/doc/examples" class="text-ab-blue hover:text-ab-dark-blue underline">Examples</a> — Real-world API specifications</li>
			</ul>
		</div>
	</div>

	<!-- CTA -->
	<div class="mt-12 mb-8 text-center">
		<p class="text-ab-dark-blue mb-4">Ready to define your first API?</p>
		<a href="/doc/start" class="btn-primary inline-block">Get Started</a>
	</div>
</div>
