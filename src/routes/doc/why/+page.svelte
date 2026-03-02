<svelte:head>
	<title>Why API Builder? - API Builder</title>
</svelte:head>

<div>
	<h1 class="text-2xl font-bold text-ab-dark-blue mb-6">Why Choose API Builder?</h1>

	<p class="text-ab-dark-blue mb-4">
		There are a few very different foundational reasons for which
		teams choose API Builder as their tool of choice for API
		Management. We know there are a number of different tools
		available in the market; teams often use API Builder either as
		their only API tool or as a complementary tool to their existing
		solutions.
	</p>

	<p class="text-ab-dark-blue mb-6">
		Here we've collected a list of the common reasons why teams adopt
		API Builder.
	</p>

	<ul class="space-y-4 text-ab-dark-blue">
		<li>
			<span class="font-semibold">Very, very high quality generated clients</span>:
			Teams that use API Builder end up relying 100% on the generated clients -
			i.e. the developers STOP writing and managing their own client SDKs
			freeing up time to focus on product improvements. In practice this
			is only possible because developers love to use the clients from
			API Builder. The reason this is possible is because API Builder
			focuses end to end on only supporting features that ensure the
			client SDKs themselves are high quality.
		</li>

		<li>
			<span class="font-semibold">Resource centric</span>:
			API Builder is resource first -
			instead of defining an operation explicitly, you define resources
			and then expose operations on that resource. This is hugely
			important for today's technology landscape given the rise of other
			resource oriented tooling (e.g. GraphQL) where having high quality
			metadata on available resources is a huge help.
		</li>

		<li>
			<span class="font-semibold">Simple service specification</span>:
			API Builder at its core separates the notion of the input format (e.g. api.json, swagger,
			avro) from the service description (service.json). This is a huge
			advantage as regardless of input format, the service specification
			can be fully expanded and complete. This separation enables API
			Builder to easily accept new input formats AND makes it very easy
			to fully parse a service (just download the service spec and use
			directly). The service spec is verbose and complete - perfect for
			machines. (If you are familiar with CQRS you will recognize that
			pattern here.)
		</li>

		<li>
			<span class="font-semibold">Simple input format</span>:
			The default <em>api.json</em> format is simple for humans to write. It is JSON, but more than
			that it is approachable by a novice and designed to be both simple
			and easy. There is no need to understand <em>$ref</em>
			or <em>oneOf</em> or other constructs which new developers
			often struggle with. Instead, developers can look at existing examples
			and very easily copy/modify for their new application.
		</li>

		<li>
			<span class="font-semibold">Great validation</span>:
			When you upload a new version of an
			API, extensive validation checks are run to ensure the internal
			consistency of your API. These checks are among the most
			comprehensive you can find anywhere - ensuring that all types,
			names, etc. are internally valid. The development of this
			validation is one of the key steps to ensuring that ultimately the
			generated clients themselves are very robust and simple - and it
			starts by catching inconsistencies when the API specification is
			defined.
		</li>

		<li>
			<span class="font-semibold">Integrated tooling</span>:
			API Builder itself offers a comprehensive REST API (the entire
			<a href="https://app.apibuilder.io" class="text-ab-blue hover:text-ab-dark-blue">https://app.apibuilder.io</a> website
			runs on the API Builder API) which means it is simple to automate
			any tasks as needed into your developer workflows. Teams have even
			written linters that enforce naming standards and conventions in
			the API itself, running as part of their suites of continuous
			integration tests. Note also the
			<a href="https://github.com/apicollective/apibuilder-cli" class="text-ab-blue hover:text-ab-dark-blue">simple to use CLI</a> -
			many teams never actually even use the user interface of API
			Builder on a daily basis given the completeness of the API and CLI
			tooling.
		</li>

		<li>
			<span class="font-semibold">Easy to add code generators</span>:
			Code generators in API Builder
			are themselves REST services which accept a service description
			(in JSON) and essentially return a string. Teams often write their
			own code generators - even small disposable ones - to
			systematically solve problems in an automated fashion.
		</li>

		<li>
			<span class="font-semibold">Testability of clients</span>:
			With generated mock clients built
			from the same interface definition, teams can rely on mocks when
			building automated tests - and further use the provided mock
			clients to override only the specific features needed for a given
			test.
		</li>

		<li>
			<span class="font-semibold">Multiple input formats</span>:
			Teams are free to author their
			specifications in multiple IDLs (swagger, avro, etc.), and it is
			straightforward to introduce new input formats into API
			Builder.
		</li>

		<li>
			<span class="font-semibold">First class support for union types</span>:
			Union types - a type that itself is constrained to be one of a known set of types
			- are first class and simple to use in API Builder. This is a
			powerful feature that enables developers to maintain simpler APIs
			by empowering them, for example, to create new types
			vs. continually adding optional fields to existing types.
		</li>

		<li>
			<span class="font-semibold">Discovery</span>:
			Free hosting of all services at
			<a href="https://app.apibuilder.io" class="text-ab-blue hover:text-ab-dark-blue">https://app.apibuilder.io</a>, including both private and public projects
			makes service discovery easy within a company.
		</li>

		<li>
			<span class="font-semibold">Versioning</span>:
			API Builder records every single change to
			every API - presenting a list of safe and potentially breaking
			changes. Teams often use these lists to include in their own
			release notes. For example, here is the history of changes to
			the <a href="/apicollective/apibuilder-api" class="text-ab-blue hover:text-ab-dark-blue">API Builder API itself</a>.
		</li>
	</ul>
</div>
