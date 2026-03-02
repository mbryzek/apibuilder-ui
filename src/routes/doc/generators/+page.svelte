<svelte:head>
	<title>Code Generators - API Builder</title>
</svelte:head>

<div>
	<h1 class="text-2xl font-bold text-ab-dark-blue mb-6">Code Generators</h1>

	<div class="card mb-6">
		<p class="text-ab-dark-blue mb-3">
			Generating the code for high-quality client libraries to access
			services described in API Builder is one of our primary goals. API Builder
			supports client generation in multiple languages, and depending on community interest
			additional languages can be contributed over time.
		</p>

		<p class="text-ab-dark-blue mb-3">
			We spend a lot of time designing exactly how we want developers to
			interact with the client libraries, and are proud of how simple
			the current client libraries are to use and read. A few
			specific principles guiding our work:
		</p>

		<ol class="list-decimal list-inside text-ab-dark-blue mb-4 space-y-3 ml-2">
			<li>
				<strong>Minimal Dependencies</strong>: Where possible, we prefer
				client libraries that use native dependencies of web frameworks
				(e.g. clients for Play Framework that require zero additional
				dependencies). Where impossible, we take extra care to
				minimize needed dependencies and to use the
				most standard dependencies possible.
			</li>
			<li>
				<strong>Readability</strong>: Each client library is first written by
				hand. We then automate the generation of that hand-written
				client. The goal is to make the generated client
				indistinguishable from a hand-written one. We will never reach
				100%, but we believe we are very close.
			</li>
			<li>
				<strong>Single File</strong>: When you download a client from API Builder,
				you will download one fully contained, fully functional
				file. This makes it simple to either drop the file directly into
				your project, or to build a library with the standard tooling necessary to
				share the client.
			</li>
		</ol>

		<ul class="list-disc list-inside text-ab-dark-blue space-y-1 ml-2">
			<li><a href="/generators" class="text-ab-blue hover:text-ab-dark-blue">Available code generators</a></li>
			<li><a href="/doc/attributes" class="text-ab-blue hover:text-ab-dark-blue">Attributes for code generators</a></li>
			<li><a href="https://github.com/apicollective/apibuilder-generator" class="text-ab-blue hover:text-ab-dark-blue">Source code for provided code generators (separate git repository)</a></li>
		</ul>
	</div>

	<div class="card mb-6">
		<h2 class="text-lg font-semibold text-ab-dark-blue mb-3">Notes for Play 2.x Client</h2>
		<ul class="list-disc list-inside text-ab-dark-blue space-y-1 ml-2">
			<li><a href="/doc/playRoutesFile" class="text-ab-blue hover:text-ab-dark-blue">Play routes</a></li>
			<li><a href="/doc/playUnionTypes" class="text-ab-blue hover:text-ab-dark-blue">Play union types</a></li>
			<li><a href="https://github.com/apicollective/apibuilder/tree/main/client-tests/play_2_4" class="text-ab-blue hover:text-ab-dark-blue">Play 2.4 sample project</a></li>
			<li><a href="https://github.com/apicollective/apibuilder/tree/main/client-tests/play_2_3" class="text-ab-blue hover:text-ab-dark-blue">Play 2.3 sample project</a></li>
			<li><a href="https://github.com/apicollective/apibuilder/tree/main/client-tests/play_2_2" class="text-ab-blue hover:text-ab-dark-blue">Play 2.2 sample project</a></li>
		</ul>
	</div>

	<div class="card mb-6">
		<h2 class="text-lg font-semibold text-ab-dark-blue mb-3">Notes for Ning Client</h2>
		<ul class="list-disc list-inside text-ab-dark-blue space-y-1 ml-2">
			<li><a href="https://github.com/apicollective/apibuilder/tree/main/client-tests/ning_1_9_scala_2_11" class="text-ab-blue hover:text-ab-dark-blue">Ning 1.9 / Scala 2.11 sample project</a></li>
			<li><a href="https://github.com/apicollective/apibuilder/tree/main/client-tests/ning_1_8_scala_2_11" class="text-ab-blue hover:text-ab-dark-blue">Ning 1.8 / Scala 2.11 sample project</a></li>
			<li><a href="https://github.com/apicollective/apibuilder/tree/main/client-tests/ning_1_8_scala_2_10" class="text-ab-blue hover:text-ab-dark-blue">Ning 1.8 / Scala 2.10 sample project</a></li>
		</ul>
	</div>
</div>
