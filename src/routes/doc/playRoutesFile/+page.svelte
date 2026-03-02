<svelte:head>
	<title>Play Routes File - API Builder</title>
</svelte:head>

<div>
	<h1 class="text-2xl font-bold text-ab-dark-blue mb-4">Play Routes File</h1>

	<p class="text-ab-dark-blue mb-4 text-lg leading-relaxed">
		Guarantee your <a href="http://playframework.com/" class="text-ab-blue hover:text-ab-dark-blue underline">Play Framework</a> service implements every endpoint.
		API Builder generates a routes file that validates completeness at compile time.
	</p>

	<div class="card mb-6">
		<h2 class="text-lg font-semibold text-ab-blue mb-3 flex items-center gap-2">
			<span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-ab-blue text-white text-xs font-bold">⏱</span>
			Bindables for Date Times
		</h2>
		<p class="text-ab-dark-blue">
			Generated clients include a <code class="bg-gray-100 px-1 rounded">Bindables</code> object with implicits
			to automatically bind <code class="bg-gray-100 px-1 rounded">date-iso8601</code> and
			<code class="bg-gray-100 px-1 rounded">date-time-iso8601</code> data types in routes.
		</p>
	</div>

	<div class="card mb-6">
		<h2 class="text-lg font-semibold text-ab-blue mb-3 flex items-center gap-2">
			<span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-ab-blue text-white text-xs font-bold">✦</span>
			Enums as First Class in Routes
		</h2>

		<p class="text-ab-dark-blue mb-4">
			Enums are first-class objects in routes. When a path or parameter includes an enumeration,
			Play automatically validates the value and returns an error page listing valid types if the
			value is invalid. To enable this, add the appropriate imports:
		</p>

		<ol class="list-decimal list-inside space-y-4 text-ab-dark-blue">
			<li>
				<strong>Import play keys</strong> —
				<pre class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm overflow-x-auto mt-2"><code>import play.PlayImport.PlayKeys._</code></pre>
			</li>

			<li>
				<strong>Enable plugin</strong> —
				<pre class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm overflow-x-auto mt-2"><code>enablePlugins(PlayScala)</code></pre>
			</li>

			<li>
				<strong>Add bindables to build.sbt</strong> —
				<pre class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm overflow-x-auto mt-2">{@html `<code>routesImport += "&lt;packageName&gt;.&lt;serviceName&gt;.v&lt;versionNumber&gt;.Bindables._"</code>`}</pre>

				<p class="mt-2">For example:</p>
				<pre class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm overflow-x-auto mt-2">{@html `<code>routesImport += "io.apibuilder.api.v0.Bindables._"</code>`}</pre>
			</li>
		</ol>

		<p class="text-ab-dark-blue mt-4">
			For a working example, see <a href="https://github.com/apicollective/apibuilder/blob/main/build.sbt" class="text-ab-blue hover:text-ab-dark-blue underline">API Builder's build.sbt file</a>.
		</p>
	</div>

	<!-- CTA -->
	<div class="mt-12 mb-8 text-center">
		<p class="text-ab-dark-blue mb-4">Explore all available code generators</p>
		<a href="/doc/generators" class="btn-primary inline-block">View Generators</a>
	</div>
</div>
