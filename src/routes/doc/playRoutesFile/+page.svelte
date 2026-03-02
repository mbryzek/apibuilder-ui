<svelte:head>
	<title>Play Routes File - API Builder</title>
</svelte:head>

<div>
	<h1 class="text-2xl font-bold text-ab-dark-blue mb-6">Play Routes File</h1>

	<p class="text-ab-dark-blue mb-4">
		API Builder generates a play routes file to help ensure that a service
		written using the <a href="http://playframework.com/" class="text-ab-blue hover:text-ab-dark-blue">Play
		Framework</a> actually implements all of the methods defined by
		the API.
	</p>

	<p class="text-ab-dark-blue mb-6">
		Within Play, there are a few features we take advantage of for type
		safety of routes:
	</p>

	<div class="card mb-6">
		<h2 class="text-lg font-semibold text-ab-dark-blue mb-3">Bindables for date times</h2>
		<p class="text-ab-dark-blue">
			Within the generated clients, you will find an object Bindables
			that contains implicits to automatically
			bind <code class="bg-gray-100 px-1 rounded">date-iso8601</code> and
			<code class="bg-gray-100 px-1 rounded">date-time-iso8601</code> data types.
		</p>
	</div>

	<div class="card mb-6">
		<h2 class="text-lg font-semibold text-ab-dark-blue mb-3">Enums as First Class in Routes</h2>

		<p class="text-ab-dark-blue mb-4">
			Enums are represented as first class objects in routes. In order
			to use this feature, you must use the appropriate imports. This
			means that if you declare a route in play where the path or a
			parameter includes an enumeration, we will automatically be able
			to validate that the value provided is actually appropriate for
			the enumeration. If the value provided is NOT a valid type, play
			will return an error page listing the appropriate types.
		</p>

		<ol class="list-decimal list-inside space-y-4 text-ab-dark-blue">
			<li>
				Import play keys:
				<pre class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm overflow-x-auto mt-2"><code>import play.PlayImport.PlayKeys._</code></pre>
			</li>

			<li>
				Enable plugin:
				<pre class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm overflow-x-auto mt-2"><code>enablePlugins(PlayScala)</code></pre>
			</li>

			<li>
				Update your build.sbt file to include the bindables:
				<pre class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm overflow-x-auto mt-2">{@html `<code>routesImport += "&lt;packageName&gt;.&lt;serviceName&gt;.v&lt;versionNumber&gt;.Bindables._"</code>`}</pre>

				<p class="mt-2">For example:</p>
				<pre class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm overflow-x-auto mt-2">{@html `<code>routesImport += "io.apibuilder.api.v0.Bindables._"</code>`}</pre>
			</li>
		</ol>

		<p class="text-ab-dark-blue mt-4">
			For a real life example, view <a href="https://github.com/apicollective/apibuilder/blob/main/build.sbt" class="text-ab-blue hover:text-ab-dark-blue">API Builder's build.sbt file</a>.
		</p>
	</div>
</div>
