<svelte:head>
	<title>Getting Started - API Builder</title>
</svelte:head>

<div>
	<h1 class="text-2xl font-bold text-ab-dark-blue mb-6">Getting Started</h1>

	<div class="card mb-6">
		<h2 class="text-lg font-semibold text-ab-dark-blue mb-3">Step 1: Create your organization</h2>
		<p class="text-ab-dark-blue">
			After logging in, <a href="/org/create" class="text-ab-blue hover:text-ab-dark-blue">create
			an organization</a>. The organization will serve as a container
			for all of your services.
		</p>
	</div>

	<div class="card mb-6">
		<h2 class="text-lg font-semibold text-ab-dark-blue mb-3">Step 2: Create your first service</h2>
		<p class="text-ab-dark-blue mb-3">
			An API Builder service represents a full REST service. Each service
			is fully described in a single file. By convention, we name these
			files 'api.json' and store them in the root of the project that
			defines the server implementing the service (e.g. the root
			directory of your source repository).
		</p>
		<p class="text-ab-dark-blue mb-3">
			The easiest way to get started is to download an example
			api.json file and then edit it.
			This <a href="https://app.apibuilder.io/apicollective/apibuilder-api/latest" class="text-ab-blue hover:text-ab-dark-blue">api.json</a>
			file is the description of the REST API for API Builder itself.
		</p>
		<p class="text-ab-dark-blue mb-3">
			When you are ready, click "Add Application"
			(located in the upper-right corner of your organization's screen) to
			upload your api.json file.
		</p>
		<p class="text-ab-dark-blue">
			View the <a href="/doc/apiJson" class="text-ab-blue hover:text-ab-dark-blue">specification
			of api.json</a> for detailed information on how to describe
			your service.
		</p>
	</div>

	<div class="card mb-6">
		<h2 class="text-lg font-semibold text-ab-dark-blue mb-3">Step 3: View your beautiful documentation!</h2>
		<p class="text-ab-dark-blue">
			At this point, you should have some beautiful, API Builder generated
			documentation for your REST service. If you distribute the URL
			with the version number 'latest', you will always have a link to
			the most current version of your service.
		</p>
	</div>

	<div class="card mb-6">
		<h2 class="text-lg font-semibold text-ab-dark-blue mb-3">Step 4: Download a client library</h2>
		<p class="text-ab-dark-blue mb-3">
			When viewing your service, the left-hand nav bar will include a
			section titled "Clients." Take a look at the Ning Async Http Client
			1.9 and the Ruby client, for example, to see how they look.
		</p>
		<p class="text-ab-dark-blue">
			Each client is presented as a stand-alone single file, which
			should make it easy to drop directly into your project or to
			publish an artifact to a server for sharing.
		</p>
	</div>

	<div class="card mb-6">
		<h2 class="text-lg font-semibold text-ab-dark-blue mb-3">Step 5: Explore</h2>
		<p class="text-ab-dark-blue mb-3">
			From your organization, explore the settings to define your
			package name for generated clients and to mark your organization
			public if you want.
		</p>
		<p class="text-ab-dark-blue">
			To access the settings when viewing your organization, click
			on "Org Details" in the left nav.
		</p>
	</div>

	<div class="card mb-6">
		<h2 class="text-lg font-semibold text-ab-dark-blue mb-3">Step 6: Use the command line interface</h2>
		<p class="text-ab-dark-blue">
			The <a href="https://github.com/apicollective/apibuilder-cli" class="text-ab-blue hover:text-ab-dark-blue">apibuilder-cli</a> presents a
			simple command line utility named 'apibuilder' to facilitate the upload
			of new versions of your service and to download the generated code
			into your source tree.
		</p>
	</div>

	<div class="card mb-6">
		<h2 class="text-lg font-semibold text-ab-dark-blue mb-3">Step 7: Get involved!</h2>
		<p class="text-ab-dark-blue mb-3">
			<a href="https://github.com/apicollective/apibuilder" class="text-ab-blue hover:text-ab-dark-blue">Follow the API Builder project on GitHub</a>
		</p>
		<p class="text-ab-dark-blue mb-3">
			Find us on slack at #apicollective
		</p>
		<p class="text-ab-dark-blue mb-3">
			<a href="https://github.com/apicollective/apibuilder/issues" class="text-ab-blue hover:text-ab-dark-blue">Ask questions / report bugs</a>
		</p>
		<p class="text-ab-dark-blue">
			Contribute! View <a href="https://github.com/apicollective/apibuilder/blob/main/TODO" class="text-ab-blue hover:text-ab-dark-blue">our Todo
			list</a> and
			open <a href="https://github.com/apicollective/apibuilder/issues" class="text-ab-blue hover:text-ab-dark-blue">issues/feature
			requests</a>. Or create api.json specifications for common
			services and upload them as public services for all.
		</p>
	</div>
</div>
