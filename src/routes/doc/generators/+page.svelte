<svelte:head>
	<title>Code Generators - API Builder</title>
</svelte:head>

<div>
	<h1 class="text-2xl font-bold text-ab-dark-blue mb-4">Code Generators</h1>

	<p class="text-ab-dark-blue mb-4 text-lg leading-relaxed">
		Every generator produces a single, self-contained file your agent can drop into the project.
		No dependency resolution. No configuration. Just working code that the compiler can verify
		against your implementation.
	</p>

	<div class="card mb-8">
		<h2 class="text-lg font-semibold text-ab-dark-blue mb-3">Best for AI Agents</h2>
		<p class="text-ab-dark-blue mb-3 text-sm">
			These generators produce the strongest compiler verification — the agent implements against
			generated interfaces and the compiler catches any mismatch:
		</p>
		<ul class="space-y-2 text-ab-dark-blue ml-2 text-sm">
			<li><strong>Scala Play Client + Controller + Mock</strong> — Full type-safe client, abstract controller traits, and mock clients for testing</li>
			<li><strong>TypeScript Declarations + SDK</strong> — Type definitions and full client with compile-time checking</li>
			<li><strong>Elm v2</strong> — Fully typed models and operations for Elm frontends</li>
		</ul>
	</div>

	<div class="card mb-8">
		<h2 class="text-lg font-semibold text-ab-dark-blue mb-3">Design Principles</h2>
		<ul class="space-y-3 text-ab-dark-blue ml-2">
			<li>
				<strong>Single file</strong> — One fully contained, fully functional file per generator. Drop it in and go.
			</li>
			<li>
				<strong>Minimal dependencies</strong> — Uses native framework dependencies. No extra libraries to manage.
			</li>
			<li>
				<strong>Readable output</strong> — Generated code you'd be proud to commit. Indistinguishable from hand-written.
			</li>
		</ul>
	</div>

	<!-- Generators by Language -->
	<h2 class="text-xl font-bold text-ab-dark-blue mb-6">Available Generators</h2>

	<!-- Scala -->
	<div class="card mb-6">
		<h3 class="text-lg font-semibold text-ab-blue mb-3 flex items-center gap-2">
			<span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-ab-blue text-white text-xs font-bold">S</span>
			Scala
		</h3>
		<ul class="space-y-2 text-ab-dark-blue ml-2">
			<li>
				<a href="/generators/show/play_2_9_scala_3_client" class="text-ab-blue hover:text-ab-dark-blue underline font-medium">Play 2.9 / Scala 3 Client</a>
				— Latest Play Framework client with Scala 3 support
			</li>
			<li>
				<a href="/generators/show/http4s_0_23" class="text-ab-blue hover:text-ab-dark-blue underline font-medium">Http4s 0.23 Client</a>
				— Functional HTTP client for the Typelevel ecosystem
			</li>
			<li>
				<a href="/generators/show/anorm_2_9_scala_3_parsers" class="text-ab-blue hover:text-ab-dark-blue underline font-medium">Anorm 2.9 / Scala 3 Parsers</a>
				— Database parsers for Play Anorm
			</li>
			<li>
				<a href="/generators/show/scala_models" class="text-ab-blue hover:text-ab-dark-blue underline font-medium">Scala Models</a>
				— Standalone model and enum generation
			</li>
			<li>
				<a href="/generators/show/scala_mock" class="text-ab-blue hover:text-ab-dark-blue underline font-medium">Scala Mock Client</a>
				— Mock clients for testing
			</li>
		</ul>
		<details class="mt-3">
			<summary class="text-ab-gray cursor-pointer text-sm hover:text-ab-dark-blue">Older Scala versions</summary>
			<ul class="space-y-1 text-ab-dark-blue ml-2 mt-2 text-sm">
				<li><a href="/generators/show/play_2_8_client" class="text-ab-blue hover:text-ab-dark-blue underline">Play 2.8 Client</a></li>
				<li><a href="/generators/show/play_2_6_client" class="text-ab-blue hover:text-ab-dark-blue underline">Play 2.6 Client</a></li>
				<li><a href="/generators/show/http4s_0_22" class="text-ab-blue hover:text-ab-dark-blue underline">Http4s 0.22</a></li>
				<li><a href="/generators/show/anorm_2_8_parsers" class="text-ab-blue hover:text-ab-dark-blue underline">Anorm 2.8 Parsers</a></li>
				<li><a href="/generators/show/anorm_2_6_parsers" class="text-ab-blue hover:text-ab-dark-blue underline">Anorm 2.6 Parsers</a></li>
				<li><a href="/generators/show/async_http_2_5_client" class="text-ab-blue hover:text-ab-dark-blue underline">Async Http Client 2.5</a></li>
			</ul>
		</details>
	</div>

	<!-- Kotlin / Android -->
	<div class="card mb-6">
		<h3 class="text-lg font-semibold text-ab-blue mb-3 flex items-center gap-2">
			<span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-ab-blue text-white text-xs font-bold">K</span>
			Kotlin &amp; Android
		</h3>
		<ul class="space-y-2 text-ab-dark-blue ml-2">
			<li>
				<a href="/generators/show/android_kotlin_rx2_client" class="text-ab-blue hover:text-ab-dark-blue underline font-medium">Android Kotlin RxJava2 Client</a>
				— Kotlin models with Retrofit 2 + RxJava2
			</li>
			<li>
				<a href="/generators/show/android_client" class="text-ab-blue hover:text-ab-dark-blue underline font-medium">Android Java Client</a>
				— Java models with Retrofit 2
			</li>
			<li>
				<a href="/generators/show/android_rx2_client" class="text-ab-blue hover:text-ab-dark-blue underline font-medium">Android RxJava2 Client</a>
				— Java models with Retrofit 2 + RxJava2
			</li>
		</ul>
	</div>

	<!-- Java / Spring -->
	<div class="card mb-6">
		<h3 class="text-lg font-semibold text-ab-blue mb-3 flex items-center gap-2">
			<span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-ab-blue text-white text-xs font-bold">J</span>
			Java &amp; Spring
		</h3>
		<ul class="space-y-2 text-ab-dark-blue ml-2">
			<li>
				<a href="/generators/show/java_client_spring_6" class="text-ab-blue hover:text-ab-dark-blue underline font-medium">Java WebClient (Spring 6)</a>
				— Spring 6 WebClient with Jakarta validation <span class="text-xs bg-blue-100 text-ab-blue px-2 py-0.5 rounded-full">BETA</span>
			</li>
			<li>
				<a href="/generators/show/bml_lombok_spring_6" class="text-ab-blue hover:text-ab-dark-blue underline font-medium">Lombok Models (Spring 6)</a>
				— Jakarta JPA models with Lombok <span class="text-xs bg-blue-100 text-ab-blue px-2 py-0.5 rounded-full">BETA</span>
			</li>
			<li>
				<a href="/generators/show/jpa_repository_spring_6" class="text-ab-blue hover:text-ab-dark-blue underline font-medium">JPA Repositories (Spring 6)</a>
				— Spring Data JPA repositories with Jakarta
			</li>
			<li>
				<a href="/generators/show/java_models" class="text-ab-blue hover:text-ab-dark-blue underline font-medium">Java Models</a>
				— Standalone Java model generation
			</li>
			<li>
				<a href="/generators/show/java_aws_lambda_pojo_client" class="text-ab-blue hover:text-ab-dark-blue underline font-medium">AWS Lambda POJOs</a>
				— Java POJO models for AWS Lambda
			</li>
		</ul>
	</div>

	<!-- TypeScript / JavaScript -->
	<div class="card mb-6">
		<h3 class="text-lg font-semibold text-ab-blue mb-3 flex items-center gap-2">
			<span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-ab-blue text-white text-xs font-bold">T</span>
			TypeScript &amp; JavaScript
		</h3>
		<ul class="space-y-2 text-ab-dark-blue ml-2">
			<li>
				<a href="/generators/show/ts_declarations" class="text-ab-blue hover:text-ab-dark-blue underline font-medium">TypeScript Declarations</a>
				— Type definitions for TypeScript projects
			</li>
			<li>
				<a href="/generators/show/ts_sdk" class="text-ab-blue hover:text-ab-dark-blue underline font-medium">TypeScript SDK</a>
				— Full TypeScript client SDK
			</li>
			<li>
				<a href="/generators/show/js_isomorphic" class="text-ab-blue hover:text-ab-dark-blue underline font-medium">JavaScript (Isomorphic)</a>
				— ES6 client for Node and browser
			</li>
			<li>
				<a href="/generators/show/jsdoc" class="text-ab-blue hover:text-ab-dark-blue underline font-medium">JSDoc 3 Types</a>
				— JSDoc type definitions
			</li>
		</ul>
	</div>

	<!-- GraphQL -->
	<div class="card mb-6">
		<h3 class="text-lg font-semibold text-ab-blue mb-3 flex items-center gap-2">
			<span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-ab-blue text-white text-xs font-bold">G</span>
			GraphQL
		</h3>
		<ul class="space-y-2 text-ab-dark-blue ml-2">
			<li>
				<a href="/generators/show/graphql_apollo" class="text-ab-blue hover:text-ab-dark-blue underline font-medium">GraphQL Apollo Server</a>
				— Schema + Apollo Server adapters
				(<a href="https://github.com/apicollective/apibuilder-examples/tree/main/graphql/users" class="text-ab-blue hover:text-ab-dark-blue underline text-sm">example</a>)
			</li>
			<li>
				<a href="/generators/show/graphql" class="text-ab-blue hover:text-ab-dark-blue underline font-medium">GraphQL Schema</a>
				— Standalone schema generation
			</li>
			<li>
				<a href="/generators/show/graphql_schema_generator" class="text-ab-blue hover:text-ab-dark-blue underline font-medium">GraphQL for Java</a>
				— Schema for use with graphql-java
			</li>
		</ul>
	</div>

	<!-- Other Languages -->
	<div class="card mb-6">
		<h3 class="text-lg font-semibold text-ab-blue mb-3 flex items-center gap-2">
			<span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-ab-blue text-white text-xs font-bold">+</span>
			More Languages
		</h3>
		<ul class="space-y-2 text-ab-dark-blue ml-2">
			<li>
				<a href="/generators/show/go_1_5_client" class="text-ab-blue hover:text-ab-dark-blue underline font-medium">Go Client</a>
				— Native net/http client for Go
			</li>
			<li>
				<a href="/generators/show/dart" class="text-ab-blue hover:text-ab-dark-blue underline font-medium">Dart / Flutter Client</a>
				— Client for Dart and Flutter apps
			</li>
			<li>
				<a href="/generators/show/elm_v2" class="text-ab-blue hover:text-ab-dark-blue underline font-medium">Elm Client (V2)</a>
				— Type-safe Elm client generation
			</li>
			<li>
				<a href="/generators/show/csharp" class="text-ab-blue hover:text-ab-dark-blue underline font-medium">C# Client</a>
				— .NET client generation
			</li>
			<li>
				<a href="/generators/show/ruby_client" class="text-ab-blue hover:text-ab-dark-blue underline font-medium">Ruby Client</a>
				— Ruby HTTP client
			</li>
		</ul>
	</div>

	<!-- Infrastructure / Schema -->
	<div class="card mb-6">
		<h3 class="text-lg font-semibold text-ab-blue mb-3 flex items-center gap-2">
			<span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-ab-blue text-white text-xs font-bold">⚙</span>
			Infrastructure &amp; Schema
		</h3>
		<ul class="space-y-2 text-ab-dark-blue ml-2">
			<li>
				<a href="/generators/show/openapi_3" class="text-ab-blue hover:text-ab-dark-blue underline font-medium">OpenAPI 3.0</a>
				— Export to OpenAPI 3.0 spec
			</li>
			<li>
				<a href="/generators/show/json_schema" class="text-ab-blue hover:text-ab-dark-blue underline font-medium">JSON Schema</a>
				— JSON Schema from service definition
			</li>
			<li>
				<a href="/generators/show/psql_ddl" class="text-ab-blue hover:text-ab-dark-blue underline font-medium">PostgreSQL DDL</a>
				— Database schema generation
			</li>
			<li>
				<a href="/generators/show/csv_client" class="text-ab-blue hover:text-ab-dark-blue underline font-medium">CSV Export</a>
				— API info in CSV format (endpoints, models)
			</li>
			<li>
				<a href="/generators/show/appsync-cloudformation" class="text-ab-blue hover:text-ab-dark-blue underline font-medium">AWS AppSync CloudFormation</a>
				— Deploy AppSync backend from your API
			</li>
			<li>
				<a href="/generators/show/lambda-node" class="text-ab-blue hover:text-ab-dark-blue underline font-medium">AWS Lambda (Node.js)</a>
				— Lambda service scaffolding
			</li>
		</ul>
	</div>

	<!-- Scala-specific docs -->
	<div class="card mb-6">
		<h2 class="text-lg font-semibold text-ab-dark-blue mb-3">Scala / Play Framework Docs</h2>
		<ul class="space-y-1 text-ab-dark-blue ml-2">
			<li><a href="/doc/playRoutesFile" class="text-ab-blue hover:text-ab-dark-blue underline">Play routes file generation</a></li>
			<li><a href="/doc/playUnionTypes" class="text-ab-blue hover:text-ab-dark-blue underline">Play union type handling</a></li>
		</ul>
	</div>

	<!-- Links -->
	<div class="card mb-8">
		<h2 class="text-lg font-semibold text-ab-dark-blue mb-3">Resources</h2>
		<ul class="space-y-2 text-ab-dark-blue ml-2">
			<li><a href="/generators" class="text-ab-blue hover:text-ab-dark-blue underline">Browse all generators</a> — Full list with status and details</li>
			<li><a href="/doc/attributes" class="text-ab-blue hover:text-ab-dark-blue underline">Generator attributes</a> — Configure generator behavior per-service</li>
			<li><a href="https://github.com/apicollective/apibuilder-generator" class="text-ab-blue hover:text-ab-dark-blue underline">Generator source code</a> — Build your own or contribute</li>
			<li><a href="https://github.com/apicollective/apibuilder-examples" class="text-ab-blue hover:text-ab-dark-blue underline">Examples repository</a> — Working examples for multiple generators</li>
		</ul>
	</div>

	<!-- CTA -->
	<div class="mt-12 mb-8 text-center">
		<p class="text-ab-dark-blue mb-4">Want to build your own generator?</p>
		<p class="text-ab-gray mb-4 text-sm">Generators are REST services that accept a service description and return a string. It's that simple.</p>
		<a href="https://github.com/apicollective/apibuilder-generator" class="btn-primary inline-block">View Generator Source</a>
	</div>
</div>
