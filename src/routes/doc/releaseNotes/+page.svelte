<svelte:head>
	<title>Release Notes - API Builder</title>
</svelte:head>

<div>
	<h1 class="text-2xl font-bold text-ab-dark-blue mb-4">Release Notes</h1>

	<p class="text-ab-dark-blue mb-8 text-lg leading-relaxed">
		A chronological record of API Builder platform changes — new features, generator updates,
		bug fixes, and infrastructure improvements. The two most recent entries are shown in full;
		older entries are grouped by year.
	</p>

	<div class="space-y-6">

		<div class="card mb-6 border-l-4 border-ab-blue">
			<h3 class="text-lg font-semibold text-ab-dark-blue mb-3">Mar 1, 2026</h3>
			<ul class="list-disc list-inside space-y-2 text-ab-dark-blue">
				<li>
					<strong class="text-ab-blue">Fields on Union Types</strong> — Union type entries now support an optional <code class="bg-gray-100 px-1.5 py-0.5 rounded text-sm">fields</code> property,
					enabling inline field definitions directly on union members. API Builder also auto-creates models for union types
					not found elsewhere — a powerful bit of syntactic sugar. This change is 100% backward compatible.
					<details class="mt-2 ml-4">
						<summary class="text-ab-blue cursor-pointer text-sm hover:text-ab-dark-blue">Example</summary>
						<pre class="bg-gray-50 rounded p-3 mt-2 text-sm overflow-x-auto">{@html `<code>{
  "unions": {
    "task_type": {
      "discriminator": "discriminator",
      "types": [
        { "type": "game" },
        { "type": "merge_person", "fields": [
          { "name": "user_id", "type": "string" },
          { "name": "person_id", "type": "string" }
        ]}
      ]
    }
  }
}</code>`}</pre>
					</details>
				</li>
			</ul>
		</div>

		<div class="card mb-6">
			<h3 class="text-lg font-semibold text-ab-dark-blue mb-3">Oct 11, 2025</h3>
			<ul class="list-disc list-inside space-y-2 text-ab-dark-blue">
				<li><strong>Upgraded to Play 3</strong> — Full migration of the API Builder backend to Play Framework 3, including Scala 3 support throughout.</li>
				<li>Fix to version filter for more reliable version lookups</li>
				<li>Infrastructure migration to Argo CD</li>
			</ul>
		</div>

		<!-- 2024 -->
		<details class="card mb-6">
			<summary class="text-lg font-semibold text-ab-dark-blue cursor-pointer hover:text-ab-blue">2024 — Play 2.9 + Scala 3</summary>
			<div class="mt-4 space-y-4">
				<div>
					<h4 class="font-semibold text-ab-dark-blue mb-2">Jul 10, 2024</h4>
					<ul class="list-disc list-inside space-y-2 text-ab-dark-blue">
						<li>Upgraded API Builder code base to support play framework 2.9 + Scala3</li>
					</ul>
				</div>
			</div>
		</details>

		<!-- 2023 -->
		<details class="card mb-6">
			<summary class="text-lg font-semibold text-ab-dark-blue cursor-pointer hover:text-ab-blue">2023 — Java 17 upgrade</summary>
			<div class="mt-4 space-y-4">
				<div>
					<h4 class="font-semibold text-ab-dark-blue mb-2">Oct 12, 2023</h4>
					<ul class="list-disc list-inside space-y-2 text-ab-dark-blue">
						<li>Upgrade API Builder codebase to Java 17</li>
					</ul>
				</div>
			</div>
		</details>

		<!-- 2022 -->
		<details class="card mb-6">
			<summary class="text-lg font-semibold text-ab-dark-blue cursor-pointer hover:text-ab-blue">2022 — Templates</summary>
			<div class="mt-4 space-y-4">
				<div>
					<h4 class="font-semibold text-ab-dark-blue mb-2">Nov 14, 2022</h4>
					<ul class="list-disc list-inside space-y-2 text-ab-dark-blue">
						<li>Introduce support for <a href="/doc/apiJson#templates" class="text-ab-blue hover:text-ab-dark-blue">templates</a> which allow sharing specification across models and resources.</li>
					</ul>
				</div>
			</div>
		</details>

		<!-- 2021 -->
		<details class="card mb-6">
			<summary class="text-lg font-semibold text-ab-dark-blue cursor-pointer hover:text-ab-blue">2021 — Union type improvements + notifications</summary>
			<div class="mt-4 space-y-4">
				<div>
					<h4 class="font-semibold text-ab-dark-blue mb-2">Oct 11, 2021</h4>
					<ul class="list-disc list-inside space-y-2 text-ab-dark-blue">
						<li>Play scala code generators: Union types now include the discriminator field as part of the trait.</li>
					</ul>
				</div>

				<div>
					<h4 class="font-semibold text-ab-dark-blue mb-2">Sep 19, 2021</h4>
					<ul class="list-disc list-inside space-y-2 text-ab-dark-blue">
						<li>New publication named 'versions.material_change' allows you to receive notification of only material
							changes to an API. At release, this filters out updates to version numbers, contact information, etc. such
							that the email notification highlights changes to the actual APIs themselves.</li>
					</ul>
				</div>

				<div>
					<h4 class="font-semibold text-ab-dark-blue mb-2">Sep 18, 2021</h4>
					<ul class="list-disc list-inside space-y-2 text-ab-dark-blue">
						<li>Fix: Scala - Fix bug with unions and interfaces with field named 'description'.
							See <a href="https://github.com/apicollective/apibuilder-generator/pull/649" class="text-ab-blue hover:text-ab-dark-blue">PR 649</a></li>
					</ul>
				</div>
			</div>
		</details>

		<!-- 2020 -->
		<details class="card mb-6">
			<summary class="text-lg font-semibold text-ab-dark-blue cursor-pointer hover:text-ab-blue">2020 — Interface support</summary>
			<div class="mt-4 space-y-4">
				<div>
					<h4 class="font-semibold text-ab-dark-blue mb-2">May 14, 2020</h4>
					<ul class="list-disc list-inside space-y-2 text-ab-dark-blue">
						<li>Add support for interfaces</li>
					</ul>
				</div>
			</div>
		</details>

		<!-- 2017 -->
		<details class="card mb-6">
			<summary class="text-lg font-semibold text-ab-dark-blue cursor-pointer hover:text-ab-blue">2017 — Rebranding, Swagger, and many features</summary>
			<div class="mt-4 space-y-4">
				<div>
					<h4 class="font-semibold text-ab-dark-blue mb-2">0.12.1 — June 25, 2017</h4>
					<ul class="list-disc list-inside space-y-2 text-ab-dark-blue">
						<li>apibuilder officially renamed to API Builder</li>
						<li>apibuilder clients in the Com::Bryzek namespace have moved to Io. For example, instead of importing com.bryzek.apibuilder... now import io.apibuilder...</li>
					</ul>

					<ul class="list-disc list-inside space-y-2 text-ab-dark-blue mt-3">
						<li>Release full Swagger compatibility = upload swagger or generate a swagger file. See <a href="https://github.com/apicollective/apibuilder-swagger-generator" class="text-ab-blue hover:text-ab-dark-blue">apibuilder-swagger-generator</a></li>
						<li>Android: implemented imports, fixed enum values, fixed union types. See <a href="https://github.com/apicollective/apibuilder-generator/pull/217" class="text-ab-blue hover:text-ab-dark-blue">PR 217</a></li>
						<li>Add implicit converter to make scala 2.11 Either monadic. See <a href="https://github.com/apicollective/apibuilder-generator/pull/214" class="text-ab-blue hover:text-ab-dark-blue">PR 214</a></li>
						<li>Add support for default union type discriminator, making it fully compatible to change a type from a model to a union, declaring the original model as default. See <a href="https://github.com/apicollective/apibuilder-generator/pull/212" class="text-ab-blue hover:text-ab-dark-blue">PR 212</a></li>
						<li>Add http4s/circe client generator. See <a href="https://github.com/apicollective/apibuilder-generator/pull/200" class="text-ab-blue hover:text-ab-dark-blue">PR 200</a></li>
						<li>Fix recursive type issue. See <a href="https://github.com/apicollective/apibuilder-generator/pull/209" class="text-ab-blue hover:text-ab-dark-blue">PR 209</a></li>
						<li>Set better defaults for collections. See <a href="https://github.com/apicollective/apibuilder-generator/pull/206" class="text-ab-blue hover:text-ab-dark-blue">PR 206</a></li>
						<li>Union type support for android_clients. See <a href="https://github.com/apicollective/apibuilder-generator/pull/201" class="text-ab-blue hover:text-ab-dark-blue">PR 201</a></li>
						<li>Remove check for 22 fields. See <a href="https://github.com/apicollective/apibuilder-generator/pull/199" class="text-ab-blue hover:text-ab-dark-blue">PR 199</a></li>
						<li>Make generator classes extensible. See <a href="https://github.com/apicollective/apibuilder-generator/pull/198" class="text-ab-blue hover:text-ab-dark-blue">PR 198</a></li>
						<li>Enable recursively defined union types. See <a href="https://github.com/apicollective/apibuilder-generator/pull/196" class="text-ab-blue hover:text-ab-dark-blue">PR 196</a></li>
						<li>Create new session auth header as default authentication method. See <a href="https://github.com/apicollective/apibuilder/pull/635" class="text-ab-blue hover:text-ab-dark-blue">PR 635</a></li>
						<li>Introduce optional 'default' type for unions with a discriminator. See <a href="https://github.com/apicollective/apibuilder/pull/630" class="text-ab-blue hover:text-ab-dark-blue">PR 630</a></li>
						<li>Support example generation of imported union types. See <a href="https://github.com/apicollective/apibuilder/pull/629" class="text-ab-blue hover:text-ab-dark-blue">PR 629</a></li>
						<li>Upgrade io.swagger.swagger-parser. See <a href="https://github.com/apicollective/apibuilder/pull/624" class="text-ab-blue hover:text-ab-dark-blue">PR 624</a></li>
						<li>Import Swagger YAML files. See <a href="https://github.com/apicollective/apibuilder/pull/618" class="text-ab-blue hover:text-ab-dark-blue">PR 618</a></li>
						<li>Implement Login via GitHub. See <a href="https://github.com/apicollective/apibuilder/pull/614" class="text-ab-blue hover:text-ab-dark-blue">PR 614</a></li>
					</ul>
				</div>
			</div>
		</details>

		<!-- 2016 -->
		<details class="card mb-6">
			<summary class="text-lg font-semibold text-ab-dark-blue cursor-pointer hover:text-ab-blue">2016 — JS clients, Go clients, union discriminators</summary>
			<div class="mt-4 space-y-4">
				<div>
					<h4 class="font-semibold text-ab-dark-blue mb-2">0.11.16 — Feb 28, 2016</h4>
					<ul class="list-disc list-inside space-y-2 text-ab-dark-blue">
						<li>Refactor type system to truly treat collections as
							types. See <a href="https://github.com/apicollective/apibuilder/pull/415" class="text-ab-blue hover:text-ab-dark-blue">PR 415</a></li>
						<li>Fix bug with error when visiting /attributes/ when not
							logged in. See <a href="https://github.com/apicollective/apibuilder/pull/416" class="text-ab-blue hover:text-ab-dark-blue">PR 416</a></li>
					</ul>
				</div>

				<div>
					<h4 class="font-semibold text-ab-dark-blue mb-2">0.11.14 — Feb 26, 2016</h4>
					<ul class="list-disc list-inside space-y-2 text-ab-dark-blue">
						<li>Official JavaScript clients now available (alpha). This
							release announces the availability of the JavaScript client code generator.
							Both ES5 and ES6 versions are available. This should be
							considered alpha but is already being used in production.</li>
						<li>Clients can now be downloaded as .tar.gz archives in addition to .zip</li>
					</ul>
				</div>

				<div>
					<h4 class="font-semibold text-ab-dark-blue mb-2">0.11.12 — Feb 24, 2016</h4>
					<ul class="list-disc list-inside space-y-2 text-ab-dark-blue">
						<li>Ruby client: Fix bug with serialization of enum to query
							parameter. See <a href="https://github.com/apicollective/apibuilder-generator/pull/73" class="text-ab-blue hover:text-ab-dark-blue">PR 73</a></li>
						<li>Fix bug in play routes generation for routes w/ enum and
							default. See <a href="https://github.com/apicollective/apibuilder-generator/pull/74" class="text-ab-blue hover:text-ab-dark-blue">PR 74</a></li>
						<li>Fix validation error of 'boxed error' by actually validating
							the application key. See <a href="https://github.com/apicollective/apibuilder/pull/411" class="text-ab-blue hover:text-ab-dark-blue">PR 411</a></li>
						<li>Let any org member delete an application /
							version. See <a href="https://github.com/apicollective/apibuilder/pull/412" class="text-ab-blue hover:text-ab-dark-blue">PR 412</a></li>
					</ul>
				</div>

				<div>
					<h4 class="font-semibold text-ab-dark-blue mb-2">0.11.10 — Feb 18, 2016</h4>
					<ul class="list-disc list-inside space-y-2 text-ab-dark-blue">
						<li>Go clients now available (alpha). This release announces the
							availability of a go client code generator. This should be
							considered alpha but is already being used in production.</li>
						<li>Attributes now supported: We have added attributes to apibuilder
							- these are globally defined, with values currently set at the
							organization level. Code generators can declare what attributes
							they use - and any attribute values are now made available to the
							code generators as part of the invocation
							form. <a href="/doc/attributes" class="text-ab-blue hover:text-ab-dark-blue">Learn more</a>.</li>
						<li>Base Url Defaults: If your application has provided a
							baseUrl, that base url is now available as a constant in the
							generated clients. In the play, ning and ruby clients, we also
							auto default the base Url when creating an instance of a new
							Client.</li>
						<li>Added validation that if a path parameter is declared in a
							resource operation, that the path specified contains that
							parameter.</li>
					</ul>
				</div>

				<div>
					<h4 class="font-semibold text-ab-dark-blue mb-2">0.11.6 — Jan 21, 2016</h4>
					<ul class="list-disc list-inside space-y-2 text-ab-dark-blue">
						<li>Generate for play and ning clients now create a package named
							'interfaces' which defines the Client interface as a trait. This
							makes it possible to mock the entire client interface.</li>
						<li>With this release, we have introduced a new code generator
							named 'play_2_4_mock_client' which generates a mock client that
							can be used as the basis for unit and integration testing. This
							mock client makes it easy to override just the methods you need to
							test a particular scenario.</li>
						<li>Fix bug that for some organizations introduced an error when searching. See <a href="https://github.com/apicollective/apibuilder/issues/397" class="text-ab-blue hover:text-ab-dark-blue">Issue 397</a></li>
					</ul>
				</div>

				<div>
					<h4 class="font-semibold text-ab-dark-blue mb-2">0.11.5 — Jan 20, 2016</h4>
					<ul class="list-disc list-inside space-y-2 text-ab-dark-blue">
						<li>Fix bug introduced that was serializing null values. See <a href="https://github.com/apicollective/apibuilder/issues/396" class="text-ab-blue hover:text-ab-dark-blue">Issue 396</a></li>
					</ul>
				</div>

				<div>
					<h4 class="font-semibold text-ab-dark-blue mb-2">0.11.2 — Jan 15, 2016</h4>
					<ul class="list-disc list-inside space-y-2 text-ab-dark-blue">
						<li>Fixed bug to generate correct path for resources for imported models</li>
						<li>For numeric defaults, if a min and/or max is specified, we
							validate that the default is not outside min or max.</li>
						<li>Email notifications on version changes are now only sent if
							there is an actual diff. Also fixed bug that prevented notification
							when version number was incremented.</li>
					</ul>
				</div>

				<div>
					<h4 class="font-semibold text-ab-dark-blue mb-2">0.10.0 — Jan 7, 2016</h4>

					<p class="text-ab-dark-blue mb-3">
						There have been numerous point releases over the past few months
						fixing small bugs. 0.10.0 introduces a major new feature - union
						type discriminators - which we highlight here.
					</p>

					<ul class="list-disc list-inside space-y-2 text-ab-dark-blue">
						<li>
							<p class="inline">
								Introduction of optional discriminator field for Union
								type. This is a major feature addition to the union type that
								flattens out the JSON serialization and will be especially helpful
								for working with union types from javascript or JSON directly.
							</p>
							<p class="mt-2 ml-6">
								When specifying a union type, you can now specify an optional
								name for a type discriminator field which can then be used in
								serialization / deserialization to identify the type of
								object. When specified, the union type will serialize into a
								flat JSON object with the discriminator field injected.
							</p>
							<p class="mt-2 ml-6">
								Note this change is 100% backwards compatible as the
								discriminator field is optional. If you add a discriminator
								field to an existing union types - you will break the
								wire format.
							</p>
							<p class="mt-2 ml-6">
								See <a href="/doc/apiJson#union" class="text-ab-blue hover:text-ab-dark-blue">api.json union type docs</a> and
								<a href="/doc/playUnionTypes" class="text-ab-blue hover:text-ab-dark-blue">Play Union Types</a> for more information and examples.
							</p>
						</li>
						<li>Add support to infer a parameter type when an operation is
							defined for a resource of type union</li>
						<li>Fix bug that prevented inference of parameter types for
							imported models</li>
						<li>Make history link more prominent</li>
						<li>Ignore dot in named variables in path params
							(e.g. "/get/:id.csv")</li>
						<li>Validate that models do not have multiple fields w/ the same name</li>
					</ul>
				</div>
			</div>
		</details>

		<!-- 2015 -->
		<details class="card mb-6">
			<summary class="text-lg font-semibold text-ab-dark-blue cursor-pointer hover:text-ab-blue">2015 — Union types, imports, Avro, Swagger</summary>
			<div class="mt-4 space-y-4">
				<div>
					<h4 class="font-semibold text-ab-dark-blue mb-2">0.9.32 — Jul 21, 2015</h4>
					<ul class="list-disc list-inside space-y-2 text-ab-dark-blue">
						<li>Introduction of a play 2.4.x code generator. Only minor changes from 2.3.x.</li>
						<li>apibuilder itself is now running play 2.4.2</li>
						<li>Introduction of a java model code
							generator. See <a href="https://github.com/apicollective/apibuilder-generator/pull/29" class="text-ab-blue hover:text-ab-dark-blue">PR 29</a>.
							Many thanks to <a href="https://github.com/jkenny" class="text-ab-blue hover:text-ab-dark-blue">jkenny</a> for this change.</li>
					</ul>
				</div>

				<div>
					<h4 class="font-semibold text-ab-dark-blue mb-2">0.9.30 — Jul 15, 2015</h4>
					<ul class="list-disc list-inside space-y-2 text-ab-dark-blue">
						<li>Change in the API when invoking a code generator. Response
							now includes a list of files (as opposed to source code). Each
							file contains a recommended file name and the contents of this
							file. This change was made in anticipation of a java code
							generator which requires multiple
							files. See <a href="https://github.com/apicollective/apibuilder/pull/349" class="text-ab-blue hover:text-ab-dark-blue">PR 349</a>
							and <a href="https://github.com/apicollective/apibuilder/pull/351" class="text-ab-blue hover:text-ab-dark-blue">PR 351</a>.
							Many thanks to <a href="https://github.com/jkenny" class="text-ab-blue hover:text-ab-dark-blue">jkenny</a> for this change.</li>
						<li>Fixed bug in swagger input related to arrays. See <a href="https://github.com/apicollective/apibuilder/pull/361" class="text-ab-blue hover:text-ab-dark-blue">PR 361</a>.
							Many thanks to <a href="https://github.com/dspeele" class="text-ab-blue hover:text-ab-dark-blue">dspeele</a> for this fix.</li>
					</ul>
				</div>

				<div>
					<h4 class="font-semibold text-ab-dark-blue mb-2">0.9.29 — Jun 29, 2015</h4>
					<ul class="list-disc list-inside space-y-2 text-ab-dark-blue">
						<li>Better support for swagger input, including resolution of
							references and mapping of API Urls to
							resources. See <a href="https://github.com/apicollective/apibuilder/pull/353" class="text-ab-blue hover:text-ab-dark-blue">PR 353</a>
							and <a href="https://github.com/apicollective/apibuilder/pull/356" class="text-ab-blue hover:text-ab-dark-blue">PR 356</a>.
							Many thanks to <a href="https://github.com/dspeele" class="text-ab-blue hover:text-ab-dark-blue">dspeele</a> for these contributions.</li>
					</ul>
				</div>

				<div>
					<h4 class="font-semibold text-ab-dark-blue mb-2">0.9.25 — Jun 9, 2015</h4>
					<ul class="list-disc list-inside space-y-2 text-ab-dark-blue">
						<li>New feature to move an application, with its entire history, to a new organization.</li>
					</ul>
				</div>

				<div>
					<h4 class="font-semibold text-ab-dark-blue mb-2">0.9.12 — May 26, 2015</h4>
					<ul class="list-disc list-inside space-y-2 text-ab-dark-blue">
						<li>Online history of all changes now available. To access, when
							viewing a service, select the 'History' link from the versions
							dropdown in the upper right corner. Or
							visit <a href="/history" class="text-ab-blue hover:text-ab-dark-blue">/history</a>
							to view changes for all applications that you can view.</li>
						<li>Search is now available - you will see the search bar in the
							upper right corner. The current implementation offers basic
							keyword search across all of the applications that you have access
							to.</li>
					</ul>
				</div>

				<div>
					<h4 class="font-semibold text-ab-dark-blue mb-2">0.9.11 — May 11, 2015</h4>
					<ul class="list-disc list-inside space-y-2 text-ab-dark-blue">
						<li>
							<p class="inline">Notifications on application update now send out a detailed
								diff of what has changed in a service. An example email:</p>

							<pre class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm overflow-x-auto mt-2 mb-2"><code>Version 0.0.1 has been uploaded for the application Gilt/Referral

Breaking changes

enum activation_type value removed: order_placed
model removed: placed_order
model removed: placed_order_form

Other changes

enum activation_type value added: order_shipped
model added: shipped_order
model added: shipped_order_form</code></pre>

							<p class="ml-6">You can enable the notification by selecting the
								"Subscriptions" link in the navigation bar
								after selecting your organization and then subscribing to
								"For applications that I watch, email me when a version is created.".</p>
						</li>
					</ul>
				</div>

				<div>
					<h4 class="font-semibold text-ab-dark-blue mb-2">0.9.5 — Apr 14, 2015</h4>
					<ul class="list-disc list-inside space-y-2 text-ab-dark-blue">
						<li>Added a required, top level node named 'apibuilder' to the
							api.json upload. The initial purpose of this node is to capture
							the version of the apibuilder specification used by that
							file. See <a href="/doc/apiJson#apibuilder" class="text-ab-blue hover:text-ab-dark-blue">api.json apibuilder</a> for details.</li>
						<li>Add support for explicitly specifying 404 responses - users
							will now have to explicitly specify 404 for any responses that
							return 404s. Previously, any GET method that returned a singleton
							automatically inferred a
							404. See <a href="https://github.com/apicollective/apibuilder/pull/320" class="text-ab-blue hover:text-ab-dark-blue">PR 320</a>.</li>
					</ul>
				</div>

				<div>
					<h4 class="font-semibold text-ab-dark-blue mb-2">0.9.4 — Apr 10, 2015</h4>
					<ul class="list-disc list-inside space-y-2 text-ab-dark-blue">
						<li>New 'default' keyword for response codes - this feature has
							been added to enhance support of apibuilder uploads using the swagger
							specification. We now support the keyword 'default' when defining
							the response code. This keyword can be used to specify a default
							type for all non specified response codes, which is particularly
							useful for handling
							errors. See <a href="/doc/apiJson#response" class="text-ab-blue hover:text-ab-dark-blue">api.json response</a> for details.</li>
						<li>Changed the names of the wrapper classes used when a union
							type includes a primitive type. Previously, we would create
							wrapper classes - e.g. IntWrapper - that would be used for all the
							union types. With this change, the scala generators create a
							unique class based on the union name and the primitive name. For
							example, a union type named "user" that supported
							"Int" will now result in a class named
							"UserInt".</li>
					</ul>
				</div>

				<div>
					<h4 class="font-semibold text-ab-dark-blue mb-2">0.9.0 — Apr 2, 2015</h4>
					<ul class="list-disc list-inside space-y-2 text-ab-dark-blue">
						<li>
							<p class="inline">Breaking change: scala client code generators have been
								updated to treat required/default fields differently. The
								implication of required is now equivalent to saying that a given
								field must always be present when a model is sent over the
								wire. Fields with defaults are required fields for which generated
								code provides a default value.</p>

							<ul class="list-disc list-inside space-y-1 ml-6 mt-2">
								<li>All non-required fields are represented as options in Scala.</li>
								<li>All non-required fields are represented as nullable in Ruby.</li>
								<li>Non-required fields in Scala are now serialized using
									writeNullable so that they are not mapped to null in the
									JSON representation.</li>
								<li>Notably, non-required collections now map to Option in Scala
									and nullable in Ruby. They no longer default to an empty
									instance of the collection.</li>
								<li>Default values are parsed and injected as language specific
									literals client side.</li>
								<li>It is illegal to specify a default for a non-required
									field. You will see a validation error when uploading a
									service to apibuilder.</li>
							</ul>

							<p class="ml-6 mt-2">For more information, see <a href="https://github.com/apicollective/apibuilder-generator/pull/6" class="text-ab-blue hover:text-ab-dark-blue">PR 6</a> and
								<a href="https://github.com/apicollective/apibuilder-generator/issues/5" class="text-ab-blue hover:text-ab-dark-blue">Issue 5</a>.</p>
						</li>

						<li>
							<p class="inline">Experimental support for Swagger Json (2.0 only). This
								feature allows you to define your service using
								the <a href="http://swagger.io" class="text-ab-blue hover:text-ab-dark-blue">swagger spec, version 2.0</a> and
								import it into apibuilder. This in turns means you can use the apibuilder
								code generators to access services described with swagger. There
								are a few major caveats:</p>

							<ul class="list-disc list-inside space-y-1 ml-6 mt-2">
								<li>Only a subset of features are supported as swagger has a
									broader feature set. We are prioritizing future work in apibuilder
									to incorporate these features directly.</li>
								<li>There is a mismatch between APIs in swagger and Resources
									in apibuilder. Right now we are using a simple pattern match on API
									Urls to determine resources. You will get an error if an API
									path cannot automatically be mapped to a resource.</li>
								<li>We have tested swagger integration using the petstore
									example only
									(see <a href="https://github.com/apicollective/apibuilder/tree/main/swagger/src/test/resources/petstore-with-external-docs.json" class="text-ab-blue hover:text-ab-dark-blue">petstore-with-external-docs.json</a>)
									and have not yet verified that the clients actually work... so
									more to come in this area (and if you are interested in helping
									- please let us know!)</li>
							</ul>

							<p class="ml-6 mt-2">When uploading a new version of an application, you will see a
								drop down to select the type of file you are uploading (or leave
								blank and we will auto detect swagger based on a json document
								with a top level key named 'swagger').</p>
						</li>
					</ul>
				</div>

				<div>
					<h4 class="font-semibold text-ab-dark-blue mb-2">0.8.27 — Mar 13, 2015</h4>
					<ul class="list-disc list-inside space-y-2 text-ab-dark-blue">
						<li>
							<p class="inline">Support for Avro IDL! This feature allows you to represent
								your models
								using <a href="https://avro.apache.org/docs/1.7.7/idl.html" class="text-ab-blue hover:text-ab-dark-blue">Avro IDL</a> specification. You can upload this file and it will be
								automatically converted to the apibuilder service specification. The
								primary use cases we are exploring here: (1) when you are only
								defining events (e.g. no resources / operations) and prefer IDL or
								already have IDL; (2) support for generate nice libraries / models
								for working with your models where the input data are already in
								IDL (hopefully the existing clients from apibuilder are useful).</p>
							<p class="ml-6 mt-2">To use this feature, upload an .avdl file instead of a .json file
								to your application. We will detect that the file is in Avro IDL
								format and parse appropriately.</p>
						</li>
						<li>Much stronger validation on the elements present in the
							api.json document - e.g. you will see validation errors if you
							mistype an
							attribute. See <a href="https://github.com/apicollective/apibuilder/issues/292" class="text-ab-blue hover:text-ab-dark-blue">Issue 292</a></li>
						<li>Introduced <em>deprecation</em> element on all relevant
							types. This allows you to mark elements of your API as deprecated
							with an optional
							description. See <a href="https://github.com/apicollective/apibuilder/issues/220" class="text-ab-blue hover:text-ab-dark-blue">Issue 220</a></li>
						<li>Better handling for original uploads, including identifying
							your uploads by type. This sets the stage to support more input
							formats (in addition to api.json). After avro IDL is stable, we
							are going to look at swagger json as an input format.</li>
						<li>UI now has a link to delete a specific version of a
							service. See <a href="https://github.com/apicollective/apibuilder/issues/300" class="text-ab-blue hover:text-ab-dark-blue">Issue 300</a></li>
						<li>Numerous small bug fixes and minor improvements</li>
					</ul>
				</div>

				<div>
					<h4 class="font-semibold text-ab-dark-blue mb-2">0.8.14 — Mar 6, 2015</h4>

					<p class="text-ab-dark-blue mb-3">This is a big release - a number of significant new features, a few
						breaking changes to increase the quality of the code generated
						clients, and a large internal refactoring. The biggest new features
						are support for union types and imports.</p>

					<p class="font-semibold text-ab-dark-blue mb-2">Breaking Changes</p>

					<ul class="list-disc list-inside space-y-2 text-ab-dark-blue mb-4">
						<li>
							<p class="inline">We have replaced apiToken with auth in the Client
								signature. Users who were previously passing in an API token will
								need to update their code to pass in an instance of
								Authorization.Basic instead. This lays the foundation to have
								standard support for more authentication methods.</p>

							<pre class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm overflow-x-auto mt-2 mb-2">{@html `<code>class Client(apiUrl: String, apiToken: scala.Option[String] = None)</code>`}</pre>

							<p class="ml-6">is now</p>

							<pre class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm overflow-x-auto mt-2 mb-2">{@html `<code>class Client(apiUrl: String, auth: scala.Option[io.apibuilder.api.v0.Authorization] = None)</code>`}</pre>

							<p class="ml-6">In order to use a token, create an instance of basic authorization with:</p>

							<pre class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm overflow-x-auto mt-2">{@html `<code>io.apibuilder.api.v0.Authorization.Basic("token")</code>`}</pre>
						</li>

						<li>
							<p class="inline">The scala code generators generate new package names:</p>
							<ul class="list-disc list-inside space-y-1 ml-6 mt-2">
								<li>We have replaced the code that converts a service name to a
									package name so that it is more consistent. The main change is
									that camelcased service names will now split into sub packages
									(so apibuilderSpec becomes apibuilder.spec). We think this change makes
									the package names more approachable and consistent.</li>
								<li>Code generators automatically include the major version
									number of each service in the package names being generated. The
									main goal here is to enable future upgradability of a client
									application or a service - major version numbers should be
									incremented each time a backwards incompatible change is
									made. By including the major version number in the package name
									we simplify a portion of the upgrade path. Note that you can
									override this behavior by explicitly providing a namespace in
									the api.json file you upload to apibuilder.</li>
							</ul>

							<p class="ml-6 mt-2">For example:</p>
							<pre class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm overflow-x-auto mt-2 mb-2"><code>package io.apibuilderspec</code></pre>
							<p class="ml-6">is now</p>
							<pre class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm overflow-x-auto mt-2"><code>package io.apibuilder.spec.v0</code></pre>
						</li>

						<li>Ruby code generated now uses the new namespace as part of the
							module name in ruby. If you prefer to use the original non nested
							namespace, you can include namespace as an attribute
							in the <a href="/doc/apiJson" class="text-ab-blue hover:text-ab-dark-blue">api.json</a> file you upload.</li>

						<li>The scala method name generators may generate new names in some
							cases. This is primarily a bug fix where in some cases the
							resource name was duplicated in the path name (e.g. in the play
							routes code generator). Example: "GET /:org/agenda-items"
							previously generated a method name
							"getAgendaItemsByOrg". This version will generate the
							name "getByOrg" as we do a better job identifying
							resource names from paths.</li>

						<li>We renamed the error package to errors to match other package
							names. We also moved the FailedRequest class into the errors
							package.</li>

						<li>The FailedRequest exception is now simpler (no longer wraps
							the response object). This allows the failed request object to be
							serialized, cleaning up stack traces that were otherwise visible
							in logs/console.</li>

						<li>
							<p class="inline">In the scala clients, for methods with both parameters and a
								body, we reordered the parameters so that they would be more
								natural to use. For example, required path parameters will now
								appear earlier in argument list. Parameters in the function list
								are now ordered by:</p>

							<ol class="list-decimal list-inside space-y-1 ml-6 mt-2">
								<li>all required query / form parameters first</li>
								<li>the body, if present</li>
								<li>remaining parameters</li>
							</ol>

							<pre class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm overflow-x-auto mt-2 mb-2">{@html `<code>def postByOrgKey(domain: io.apibuilder.api.v0.models.Domain,
  orgKey: String
)</code>`}</pre>

							<p class="ml-6">is now</p>

							<pre class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm overflow-x-auto mt-2">{@html `<code>def postByOrgKey(
  orgKey: String,
  domain: io.apibuilder.models.Domain
)</code>`}</pre>
						</li>

						<li>The resources element in the api.json file must now be a
							Map. Up until this version, we continued to support the original
							format of the resources element being an array; this release
							removes this deprecated feature.</li>
					</ul>

					<p class="font-semibold text-ab-dark-blue mb-2">Major Features</p>

					<ul class="list-disc list-inside space-y-2 text-ab-dark-blue mb-4">
						<li>
							<p class="inline"><a href="/doc/apiJson#union" class="text-ab-blue hover:text-ab-dark-blue">Union types</a> -
								apibuilder provides support for declaring your own union types
								(sometimes referred to as sum or algebraic types). The basic idea
								is that you can express that a particular variable is one of a
								known set of types. As an example, in an ecommerce system, you
								might want to accept orders from both registered users (people who
								actually have a username and password with your service) and also
								from guest users (e.g. people who have never visited your
								application before). One way to model this is to define two types,
								Registered User and Guest User, a single union type User that can
								be either a Registered User or a Guest User, and then to model
								your order as having a User.</p>
							<p class="ml-6 mt-2">
								See <a href="/doc/playUnionTypes" class="text-ab-blue hover:text-ab-dark-blue">Play Union types</a> for more detailed information, with specific examples
								of how to use union types using the play clients.
							</p>
						</li>

						<li>Nomenclature change - Services have been renamed to
							Applications. We found that it was becoming difficult to
							differentiate between an application, each of its versions, and
							the actual REST API (or service). More precisely: Organizations
							contain applications. Each application can contain one or more
							versions (users upload versions to apibuilder).</li>

						<li>We have introduced a new concept of a Service which is a
							complete description of a REST service as described by
							apibuilder. Users of apibuilder upload api.json files that contain a
							specification of a REST API. apibuilder converts the specification
							into a service description that we now call a
							"Service". A Service is a full description of the REST
							API. The schema for a service can be found
							at <a href="/apicollective/apibuilder-spec" class="text-ab-blue hover:text-ab-dark-blue">apicollective/apibuilder-spec</a>.</li>

						<li>Code generators have been moved out of the apibuilder code
							repository and into a separate repository (<a href="https://github.com/apicollective/apibuilder-generator" class="text-ab-blue hover:text-ab-dark-blue">https://github.com/apicollective/apibuilder-generator</a>). Combined
							with the introduction of the service schema, we now have a much
							simpler interface to create code generators. Code generators are
							functions that accept an instance of a service
							and return a string (actual code). For specific information on the
							API to create a code generator,
							see <a href="/apicollective/apibuilder-generator" class="text-ab-blue hover:text-ab-dark-blue">apicollective/apibuilder-generator</a>.</li>

						<li>
							<p class="inline">Services now have a namespace as part of the service
								specification. When uploading new version of an application, we
								automatically create a namespace for each major version by
								following the format:</p>

							<pre class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm overflow-x-auto mt-2 mb-2"><code>[organization namespace].[formatted service name].[major version number]</code></pre>

							<p class="ml-6">The service name is converted to a namespace by converting to
								lower case, under score separated (converting from camel case
								automatically), and then splitting on underscore. Thus for the
								organization namespace io.apibuilder, version 1 of an application named
								apibuilder-spec will result in a namespace of io.apibuilder.spec.v1.</p>

							<ol class="list-decimal list-inside space-y-1 ml-6 mt-2">
								<li>apibuilder now supports importing definitions from other
									services. The namespace is required in order to resolve a
									reference to a model or enum imported from another service. See
									notes <a href="#import" class="text-ab-blue hover:text-ab-dark-blue">below on importing</a>.</li>
								<li>the namespace continues to be used in code generation,
									mapping to package names, for example, in scala code
									generators.</li>
								<li>You can provide your own namespace by including a
									'namespace' attribute in your api.json
									file. See <a href="/doc/apiJson" class="text-ab-blue hover:text-ab-dark-blue">api.json format</a> for more information.</li>
							</ol>
						</li>

						<li id="import">
							<p class="inline">Imports: You can now import schema
								definitions from other services into your project. In order to
								import definitions:</p>

							<ol class="list-decimal list-inside space-y-1 ml-6 mt-2">
								<li><a href="/doc/apiJson" class="text-ab-blue hover:text-ab-dark-blue">Declare your imports</a> in your
									api.json file by providing the full URI to each service.json
									specification you would like to include. To find the URL for a
									service from the UI, navigate to a service and then click
									"service.json" in the nav bar on the left.</li>
								<li>To use a type from an imported service, reference that type
									using the fully qualified name for the type. For example, if the
									service you are importing has a namespace of
									"io.apibuilder.spec.v1" and you want to use the type
									"service", you would declare the type of your field as
									"io.apibuilder.spec.v1.service".</li>
							</ol>

							<p class="ml-6 mt-2">The apicollective/apibuilder-generator project uses imports as
								part of its declaration - the simplest way to get started is to
								look at
								the <a href="/apicollective/apibuilder-generator/latest/original" class="text-ab-blue hover:text-ab-dark-blue">api.json</a>
								file for that service.</p>
						</li>

						<li>This release introduces a client code generator based on the
							latest ning version (1.9.11). See
							<a href="https://github.com/apicollective/apibuilder/tree/main/client-tests/ning_1_9_scala_2_11" class="text-ab-blue hover:text-ab-dark-blue">example ning 1.9 play project</a>.</li>
					</ul>

					<p class="font-semibold text-ab-dark-blue mb-2">Other enhancements / changes</p>

					<ul class="list-disc list-inside space-y-2 text-ab-dark-blue">
						<li>You can now create and manage API tokens to programmatically
							access apibuilder
							applications. Visit <a href="/tokens" class="text-ab-blue hover:text-ab-dark-blue">/tokens</a>
							to manage tokens. There is an experimental CLI that relies on
							these tokens available
							at <a href="https://github.com/apicollective/apibuilder-cli" class="text-ab-blue hover:text-ab-dark-blue">https://github.com/apicollective/apibuilder-cli</a></li>
						<li>We added JSON error handling in the play client. This means
							that you will get a much nicer error message if we are unable to
							parse the document (we use play json validation here and return
							the error messages to you via the exception).</li>
						<li>We also provide a much nicer error message when the service
							returns an HTTP status code that is not defined in the
							specification (a common mistake). This should make it much easier
							to identify these errors. The message will be similar to "HTTP
							xxx: Unsupported response code. Expected: 200, 409"</li>
						<li>You can now edit your organization via the UI to change your
							organization key or namespace. Use with care as changing the
							namespace may change the package names in generated code.</li>
						<li>We renamed the organization "package name" setting
							as "namespace" and have made it required.</li>
						<li>Base url is now optional avoiding need to guess the URL
							during initial development (before service is deployed)</li>
					</ul>
				</div>
			</div>
		</details>

		<!-- 2014 -->
		<details class="card mb-6">
			<summary class="text-lg font-semibold text-ab-dark-blue cursor-pointer hover:text-ab-blue">2014 — First year: enums, maps, Ruby/Play clients</summary>
			<div class="mt-4 space-y-4">
				<div>
					<h4 class="font-semibold text-ab-dark-blue mb-2">0.7.39 — December 19, 2014</h4>
					<ul class="list-disc list-inside space-y-2 text-ab-dark-blue">
						<li>Email subscriptions: You can now subscribe to a number of
							different email alerts including notification when services are
							created or updated, and as an org admin, whenever somebody
							requests to join your organization. We also added email
							verification - combined with organization level domains, today
							when a new user joins apibuilder they will receive an email message to
							confirm their email. Upon confirming their email, if their email
							domain matches a domain that you've setup for your organization,
							that user will automatically become part of your organization.</li>
						<li>Watch your favorite services: You can now watch your favorite
							services. There is an email subscription to receive a notification
							whenever a service that you watch is updated.</li>
						<li>If you forget your password, there is now a password reset
							flow available in the UI.</li>
					</ul>
				</div>

				<div>
					<h4 class="font-semibold text-ab-dark-blue mb-2">0.7.7 — Nov 19, 2014</h4>
					<ul class="list-disc list-inside space-y-2 text-ab-dark-blue">
						<li>
							<p class="inline">Ruby client models now have a copy method that can be used to
								create copies of the instances with changes to specific
								fields. Example:</p>

							<pre class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm overflow-x-auto mt-2"><code>domain = apibuilder::Models::Domain.new(:name => "apibuilder.io")
puts domain.name
=> apibuilder.io

puts domain.copy(:name => "bryzek.com").name
=> bryzek.com</code></pre>

							<p class="ml-6 mt-2">See <a href="https://github.com/apicollective/apibuilder/issues/212" class="text-ab-blue hover:text-ab-dark-blue">Issue 212</a></p>
						</li>
					</ul>
				</div>

				<div>
					<h4 class="font-semibold text-ab-dark-blue mb-2">0.7.4 — Nov 18, 2014</h4>

					<p class="text-ab-dark-blue mb-3">This is a major release with over 150 individual commits! Main
						changes are support for community contributed generators and a
						revamp of the internal type system, providing much more consistency
						in how we parse types as well as support for Maps of any defined
						type.</p>

					<p class="font-semibold text-ab-dark-blue mb-2">Major features</p>
					<ul class="list-disc list-inside space-y-2 text-ab-dark-blue mb-4">
						<li><strong>Support for map[Any defined type] (beta):</strong> This release
							introduces expanded support for map types. You can now define a
							type as Map[xxx] where xxx can be a primitive, enum, or model
							defined in your service. Prior to this release, we only supported
							maps where the values were strings. Note that in all cases, the
							keys of the map must be strings to conform to the JSON
							specification. This feature takes advantage of the existing JSON
							parsers in client libraries to serialize to/from maps using the
							standard serialization - e.g. serialization works as expected, and
							because we validate the type of the values in the map, we can
							guarantee that a proper serializer exists.</li>

						<li>
							<p class="inline"><strong>Support for community code generators (alpha):</strong>
								Generators are now implemented as rest services, with a standard
								interface described in apibuilder. Adding a generator requires two
								steps:</p>

							<ol class="list-decimal list-inside space-y-1 ml-6 mt-2">
								<li>Create a service implementing
									the <a href="/apicollective/apibuilder-generator" class="text-ab-blue hover:text-ab-dark-blue">apicollective/apibuilder-generator API</a>.</li>
								<li>Visit <a href="/generators" class="text-ab-blue hover:text-ab-dark-blue">/generators</a>
									and enter the URL of your service.</li>
							</ol>

							<p class="ml-6 mt-2">Many thanks to <a href="https://github.com/gheine" class="text-ab-blue hover:text-ab-dark-blue">gheine</a> for this contribution!
								See <a href="https://github.com/apicollective/apibuilder/pull/914" class="text-ab-blue hover:text-ab-dark-blue">PR 194</a>
								and <a href="https://github.com/apicollective/apibuilder/pull/216" class="text-ab-blue hover:text-ab-dark-blue">PR 216</a>.</p>
						</li>
					</ul>

					<p class="font-semibold text-ab-dark-blue mb-2">Minor improvements / bug fixes</p>
					<ul class="list-disc list-inside space-y-2 text-ab-dark-blue">
						<li>Add support for a JSON 'object' as a primitive
							datatype. While usage is anticipated to be rare, there are a few
							common use-cases to be able to send arbitrary json objects. We've
							added support for the 'object' datatype as a primitive to support
							these cases. See <a href="https://github.com/apicollective/apibuilder/issues/215" class="text-ab-blue hover:text-ab-dark-blue">Issue 215</a></li>
						<li>Ruby client models support explicit JSON serialization - each
							model will now have a to_json method to make explicit how the
							client expects json to be
							generated. See <a href="https://github.com/apicollective/apibuilder/issues/213" class="text-ab-blue hover:text-ab-dark-blue">Issue 213</a></li>
						<li>Ruby client to_hash method now checks for nil, avoiding null
							pointer errors in some cases.
							See <a href="https://github.com/apicollective/apibuilder/issues/214" class="text-ab-blue hover:text-ab-dark-blue">Issue 214</a></li>
						<li>Remove scala.collection.Seq and replace with Seq.
							See <a href="https://github.com/apicollective/apibuilder/issues/204" class="text-ab-blue hover:text-ab-dark-blue">Issue 204</a></li>
						<li>Standardize parameter names in ruby
							client. See <a href="https://github.com/apicollective/apibuilder/issues/203" class="text-ab-blue hover:text-ab-dark-blue">Issue 203</a></li>
						<li>Enum value names now handle dots correctly,
							e.g. incidents.create will generate IncidentsCreate constant in
							the scala
							clients. See <a href="https://github.com/apicollective/apibuilder/issues/199" class="text-ab-blue hover:text-ab-dark-blue">Issue 199</a></li>
						<li>Fix bug in scala clients when an operation has multiple 2xx
							response codes. See <a href="https://github.com/apicollective/apibuilder/issues/187" class="text-ab-blue hover:text-ab-dark-blue">Issue 187</a></li>
						<li>Add validation for query parameters with models when there is
							a body present. See <a href="https://github.com/apicollective/apibuilder/issues/172" class="text-ab-blue hover:text-ab-dark-blue">Issue 172</a></li>
					</ul>
				</div>

				<div>
					<h4 class="font-semibold text-ab-dark-blue mb-2">0.6.3 — Oct 9, 2014</h4>
					<ul class="list-disc list-inside space-y-2 text-ab-dark-blue">
						<li>Added bindables to simplify strongly typed enums and dates in
							play routes file. See <a href="/doc/playRoutesFile" class="text-ab-blue hover:text-ab-dark-blue">Play Routes</a></li>
						<li>Revised documentation, including getting started
							guide. See <a href="/doc" class="text-ab-blue hover:text-ab-dark-blue">Introduction to apibuilder</a>.</li>
					</ul>
				</div>

				<div>
					<h4 class="font-semibold text-ab-dark-blue mb-2">0.5.42 — Oct 1, 2014</h4>
					<ul class="list-disc list-inside space-y-2 text-ab-dark-blue">
						<li><a href="/doc" class="text-ab-blue hover:text-ab-dark-blue">Improved documentation</a>, especially for new users!</li>
						<li>Code refactoring in apibuilder itself - project is mature enough
							now that we were able to replace the internal models used to
							bootstrap apibuilder with the apibuilder generated models! Thanks
							gheine. See <a href="https://github.com/apicollective/apibuilder/pull/176" class="text-ab-blue hover:text-ab-dark-blue">PR 176</a></li>
						<li>Better pluralization using org.atteo.evo-inflector
							library. Model pluralization can always be explicitly specified in
							the api.json file, but this change expands the number of cases
							covered automatically.</li>
						<li>Code generation targets are extensible internally. First step
							towards opening up a simple way for anybody to contribute
							generators based on the apibuilder
							model. See <a href="https://github.com/apicollective/apibuilder/pull/171" class="text-ab-blue hover:text-ab-dark-blue">PR 171</a></li>
						<li>Number of smaller bug fixes</li>
					</ul>
				</div>

				<div>
					<h4 class="font-semibold text-ab-dark-blue mb-2">0.5.33 — Sep 23, 2014</h4>
					<ul class="list-disc list-inside space-y-2 text-ab-dark-blue">
						<li>Date Type: New 'date-iso8601' type
							introduced. In ruby clients, maps to a Date instance. In JVM
							clients, maps to an <code class="bg-gray-100 px-1 rounded">org.joda.time.LocalDate</code>
							instance. See <a href="https://github.com/apicollective/apibuilder/issues/161" class="text-ab-blue hover:text-ab-dark-blue">Issue 161</a></li>
						<li>Dates now Supported in paths. When specifying an API, instances
							of type date are now allowed in the HTTP Path. Previously, we
							restricted this particular type from path parameters as
							serialization is unclear; Serialization remains the responsibility
							of the service itself and thus apibuilder will just document that the
							type is a
							date. See <a href="https://github.com/apicollective/apibuilder/issues/161" class="text-ab-blue hover:text-ab-dark-blue">Issue 161</a></li>
						<li>UI refactored so that resources are hyperlinked to their
							underlying model; All models, even if mapped to resources, are now
							listed in the Models section of the UI of
							apibuilder. See <a href="https://github.com/apicollective/apibuilder/issues/152" class="text-ab-blue hover:text-ab-dark-blue">Issue 152</a></li>
						<li>When downloading a client for the 'latest' version of a
							service, the user agent will reflect the actual version downloaded
							(instead of 'latest')</li>
					</ul>
				</div>

				<div>
					<h4 class="font-semibold text-ab-dark-blue mb-2">0.5.29 — Sep 19, 2014</h4>
					<ul class="list-disc list-inside space-y-2 text-ab-dark-blue">
						<li>Play client: Move Traits out of client so they can be accessed
							directly. See <a href="https://github.com/apicollective/apibuilder/issues/158" class="text-ab-blue hover:text-ab-dark-blue">Issue 158</a></li>
					</ul>
				</div>

				<div>
					<h4 class="font-semibold text-ab-dark-blue mb-2">0.5.27 — Sep 16, 2014</h4>
					<ul class="list-disc list-inside space-y-2 text-ab-dark-blue">
						<li>Support for clients using Ning HTTP Async library and Play
							Json: This release introduces support for a new client library
							based
							on <a href="https://github.com/AsyncHttpClient/async-http-client" class="text-ab-blue hover:text-ab-dark-blue">ning's http async library</a>. The only dependencies you will need are
							play-ws and com.ning.async-http-client version
							1.8.x. See <a href="https://github.com/apicollective/apibuilder/tree/main/client-tests/ning_1_8" class="text-ab-blue hover:text-ab-dark-blue">ning 1.8 sample project</a> for an example SBT project setup to use the
							ning clients.</li>
						<li>Refactor of play client libraries. Main change was to remove
							the GET, POST, PUT, etc. methods and replace with a single
							_executeRequest method that takes the method as its first
							parameter. We think this is a more readable implementation and
							more concise in the client. If you previously directly accessed
							these methods, you will need to update your code to call
							_executeRequest instead.</li>
						<li>Operation body now supports Arrays as a type.</li>
						<li>Organizations now have a visibility setting which controls
							whether or not the organization shows up in the public
							directory. Public services can still be accessed by direct URL
							regardless of the org setting.</li>
						<li>Removed experimental support for avro schemas (event based use
							case too different from REST services).</li>
					</ul>
				</div>

				<div>
					<h4 class="font-semibold text-ab-dark-blue mb-2">0.5.13 — Aug 30, 2014</h4>
					<ul class="list-disc list-inside space-y-2 text-ab-dark-blue">
						<li>Support for public services. Each service now has a settings
							section to allow you to control the visibility of a service. The
							options are: "Organization" (available only to members of your
							org) or "Public" (available to anybody). Public services are
							visible to all users - but still can only be modified by members
							of your organization. The default for all existing services is
							unchanged (restricted to organization). When creating new services
							you can specify the visibility you desire. To change the
							visibility of a service, click 'Settings' in the left menu bar
							when viewing the service.</li>
						<li>Services can now be deleted - when viewing a service, click
							Settings in left menu then 'Delete this service' if you would like
							to remove a service.</li>
						<li>New test harness to be able to download accessible clients
							from production to ensure they continue to compile across
							different target platforms.</li>
						<li>Numerous small bug fixes and improvements</li>
					</ul>
				</div>

				<div>
					<h4 class="font-semibold text-ab-dark-blue mb-2">0.5.4 — Aug 18, 2014</h4>
					<ul class="list-disc list-inside space-y-2 text-ab-dark-blue">
						<li>Headers are now supported in spec and generated clients via a
							top level 'headers' declaration. This enables the service author
							to describe what headers the service understands, including
							setting default values which will be automatically included in all
							requests made via the generated clients.
							See <a href="https://github.com/apicollective/apibuilder/pull/131" class="text-ab-blue hover:text-ab-dark-blue">PR 131</a></li>
						<li>Improved documentation of api.json format.
							See <a href="/doc/apiJson" class="text-ab-blue hover:text-ab-dark-blue">apiJson</a></li>
					</ul>
				</div>

				<div>
					<h4 class="font-semibold text-ab-dark-blue mb-2">0.5.0 — Aug 14, 2014</h4>
					<ul class="list-disc list-inside space-y-2 text-ab-dark-blue">
						<li>
							Simple command line validation of api.json files! To validate
							a file, you can now use a public REST endpoint:

							<pre class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm overflow-x-auto mt-2"><code>curl -XPOST -d @./api.json http://api.apibuilder.me/validations</code></pre>
						</li>
						<li>Organization metadata now part of settings - To access, visit
							https://app.apibuilder.io, click on your organization, click on
							settings, then click on Metadata. Currently we have one setting
							which is the package name to use for JVM based clients. This
							allows you to specify explicitly the package name for all
							generated clients.
							See <a href="https://github.com/apicollective/apibuilder/issues/86" class="text-ab-blue hover:text-ab-dark-blue">Issue 86</a></li>
						<li>Expand support for body to include primitive types and enums.
							See <a href="https://github.com/apicollective/apibuilder/issues/139" class="text-ab-blue hover:text-ab-dark-blue">Issue 139</a></li>
						<li>Play and ruby clients now use strong types for all parameters
							of type enum. Previously these were sent as Strings.
							See <a href="https://github.com/apicollective/apibuilder/issues/127" class="text-ab-blue hover:text-ab-dark-blue">Issue 127</a></li>
						<li>Add support to play and ruby clients for GET parameters that
							are lists - parameters are now sent as proper HTTP parameters. For
							example, a GET method with type "[id]" will now generate HTTP
							requests like /foo?id=1&amp;id=2&amp;... Note that as Play framework does
							not have native support for collections in its routes file, these
							parameters are explicitly excluded from the generated routes file
							- instead you will see a comment describing the additional
							parameter.
							See <a href="https://github.com/apicollective/apibuilder/issues/139" class="text-ab-blue hover:text-ab-dark-blue">Issue 139</a></li>
						<li>Better JSON validation around requiring JsObjects for things
							like models, enum, body, etc.
							See <a href="https://github.com/apicollective/apibuilder/issues/138" class="text-ab-blue hover:text-ab-dark-blue">Issue 138</a>
							and <a href="https://github.com/apicollective/apibuilder/issues/134" class="text-ab-blue hover:text-ab-dark-blue">Issue 134</a>
							for examples.</li>
						<li>Better error messages when explicitly specifying a 404
							response w/ a type.
							See <a href="https://github.com/apicollective/apibuilder/issues/135" class="text-ab-blue hover:text-ab-dark-blue">Issue 135</a>.</li>
					</ul>
				</div>

				<div>
					<h4 class="font-semibold text-ab-dark-blue mb-2">0.4.71 — Aug 13, 2014</h4>
					<ul class="list-disc list-inside space-y-2 text-ab-dark-blue">
						<li>Enums are now supported as first class elements in
							apibuilder. This is a breaking change as the prior implementation
							(using an enum attribute on fields) is no longer supported. You
							will get a validation error message to help with
							migration. See <a href="/doc/apiJson" class="text-ab-blue hover:text-ab-dark-blue">apiJson documentation</a>
							for notes on the new enum support.
							See <a href="https://github.com/apicollective/apibuilder/pull/131" class="text-ab-blue hover:text-ab-dark-blue">PR 131</a></li>
					</ul>
				</div>

				<div>
					<h4 class="font-semibold text-ab-dark-blue mb-2">0.4.68 — Aug 5, 2014</h4>
					<ul class="list-disc list-inside space-y-2 text-ab-dark-blue">
						<li>Play 2.2 client support (currently alpha). Main differences
							with Play 2.3 client related to a few package names that changed
							in play 2.3 and a runtime error if you attempt to use HTTP PATCH
							(play 2.2 does not support patch natively). If you need to access
							a service using patch, you can override the PATCH method in the
							generated client to implement your own PATCH method.
							See <a href="https://github.com/apicollective/apibuilder/pull/122" class="text-ab-blue hover:text-ab-dark-blue">PR 122</a></li>
						<li>Bug fixed in encoding of path parameters - thanks Gary!
							See <a href="https://github.com/apicollective/apibuilder/pull/120" class="text-ab-blue hover:text-ab-dark-blue">PR 120</a></li>
						<li>Play client: FailedResponse class renamed to FailedRequest as
							it is actually the request that failed.</li>
						<li>User agents in client: All generated clients now provide a
							default user agent to identify the version of apibuilder that
							generated the client as well as the specific org, service, and
							version of the service description used to generate the client.
							See <a href="https://github.com/apicollective/apibuilder/pull/116" class="text-ab-blue hover:text-ab-dark-blue">PR 116</a></li>
						<li>Few bug fixes to make enum values more readable and to enable
							using the ruby client library both with objects as well as hashes (from
							json).
							See <a href="https://github.com/apicollective/apibuilder/issues/114" class="text-ab-blue hover:text-ab-dark-blue">Issue 114</a>,
							<a href="https://github.com/apicollective/apibuilder/issues/117" class="text-ab-blue hover:text-ab-dark-blue">Issue 117</a>,
							and <a href="https://github.com/apicollective/apibuilder/issues/118" class="text-ab-blue hover:text-ab-dark-blue">Issue 118</a></li>
					</ul>
				</div>

				<div>
					<h4 class="font-semibold text-ab-dark-blue mb-2">0.4.55 — Jul 28, 2014</h4>
					<ul class="list-disc list-inside space-y-2 text-ab-dark-blue">
						<li>First class support for organization domains. Makes it
							possible to list org domains (e.g. bryzek.com, giltcity.com) for
							auto association with org when new users
							register.
							See <a href="https://github.com/apicollective/apibuilder/pull/102" class="text-ab-blue hover:text-ab-dark-blue">PR 102</a></li>
						<li>Ruby client: Improved support for date time objects (able to
							instantiate models with date times using Ruby's Time or DateTime
							classes, in addition to existing string support).
							See <a href="https://github.com/apicollective/apibuilder/pull/105" class="text-ab-blue hover:text-ab-dark-blue">PR 105</a></li>
						<li>Avro: Add support for DateTime.
							See <a href="https://github.com/apicollective/apibuilder/pull/106" class="text-ab-blue hover:text-ab-dark-blue">PR 106</a></li>
					</ul>
				</div>

				<div>
					<h4 class="font-semibold text-ab-dark-blue mb-2">0.4.53 — Jul 22, 2014</h4>
					<ul class="list-disc list-inside space-y-2 text-ab-dark-blue">
						<li>Introduce support to generate Avro Schemas (thanks
							kscaldef!). There is a new code generation
							target <code class="bg-gray-100 px-1 rounded">avro_schema</code> that generates AVRO JSON from the
							model definitions.</li>
						<li>Add support for domains in the API for organizations - this
							can be used to associate a new user with an organization
							automatically based on email domain. Currently only available in
							API - UI is coming in a future release.</li>
						<li>Add support for metadata in the API for organizations, with
							the first attribute of <code class="bg-gray-100 px-1 rounded">package_name</code> that becomes
							available to code generators that need a fully qualified package
							name. Currently only available in API - UI is coming in a future
							release.</li>
						<li>API route added to GET /organizations/:guid</li>
						<li>Add 'body' information to online documentation.</li>
						<li>Expanded unit tests based on scala coverage plugin.</li>
					</ul>
				</div>

				<div>
					<h4 class="font-semibold text-ab-dark-blue mb-2">0.4.50 — Jul 17, 2014</h4>
					<ul class="list-disc list-inside space-y-2 text-ab-dark-blue">
						<li>
							<p class="inline">Introduce 'body' on operations. For operations that support
								posting data, you can now specify a 'body' for the JSON document
								instead of explicit parameters. The body parameter takes a single
								attribute - type - specifying the name of a model. Example:</p>

							<pre class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm overflow-x-auto mt-2 mb-2">{@html `<code>"resources": {
  "message": {
    "operations": [
      {
        "method": "POST",
        "body": { "type": "message" }
      }
    ]
  }
}</code>`}</pre>

							<p class="ml-6">Bodies and query parameters are now fully supported in the play
								2.3 client and the ruby client.</p>
						</li>
						<li>Query parameter support for operations. When specifying a
							body, you can also specify additional query parameters for an
							operation. The parameters section of operations is now interpreted
							as being in the body by default, and if a 'body' element is
							provided, the parameters are expected to be sent as query
							parameters. If this works out in practice, we will likely
							formalize parameter location to enable specifying query parameters
							without specifying a location.</li>
						<li>Added date time helper for parsing date time query parameters
							in play framework routes file. Thanks to Gary Coady - see
							<a href="https://github.com/apicollective/apibuilder/pull/62" class="text-ab-blue hover:text-ab-dark-blue">PR 62</a></li>
						<li>Update ruby client to ensure enums are fully supported.</li>
					</ul>
				</div>

				<div>
					<h4 class="font-semibold text-ab-dark-blue mb-2">0.4.47 — Jul 16, 2014</h4>
					<ul class="list-disc list-inside space-y-2 text-ab-dark-blue">
						<li>Validation added to verify that any path parameters refer to
							fields that are required (not possible to specify an optional path
							parameter).</li>
						<li>Path parameters now must be a string, uuid, or number -
							previously we accepted any datatype.</li>
						<li>Responses of type 204 and 304 cannot return a type - must be
							unit - datatypes do not make sense for these response types.</li>
						<li>We no longer accept response codes 404 or 5xx in any json
							specification. We found inconsistencies across different services
							with these types, making it difficult / impossible to create clean
							clients that behaved consistently. A 404 will automatically be
							handled in the play client for all GET requests, returning either
							None or Nil depending on whether the method returns a single
							instance or an array.</li>
						<li>Play 2.3 Client: Few implicits made private / renamed to avoid
							name conflicts when a user imports json implicits for multiple
							services.</li>
						<li>Fixed bug where ruby client was incorrectly dropping path
							after domain.</li>
						<li>
							<p class="inline">Ruby client breaking change: Removed authorize method as
								signature only supported a single user. Preferred method is to
								instantiate the client directly:</p>
							<pre class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm overflow-x-auto mt-2">{@html `<code>Client.new(url, :authorization => Xyz::HttpClient::Authorization.basic(username, password=nil))</code>`}</pre>
						</li>
					</ul>
				</div>

				<div>
					<h4 class="font-semibold text-ab-dark-blue mb-2">0.4.43 — Jul 14, 2014</h4>
					<ul class="list-disc list-inside space-y-2 text-ab-dark-blue">
						<li>Replace 'values' element with 'enum' to be compliant with JSON Schema.</li>
					</ul>
				</div>

				<div>
					<h4 class="font-semibold text-ab-dark-blue mb-2">0.4.42 — Jul 14, 2014</h4>
					<ul class="list-disc list-inside space-y-2 text-ab-dark-blue">
						<li>Validate that if a response explicitly specifies a 404, that
							its type is Unit. This ensures that we can build friendly clients
							in scala which can turn a 2xx/404 response into an Option which is
							much nicer to use when building apps with the client.</li>
					</ul>
				</div>

				<div>
					<h4 class="font-semibold text-ab-dark-blue mb-2">0.4.41 — Jul 12, 2014</h4>
					<ul class="list-disc list-inside space-y-2 text-ab-dark-blue">
						<li>Validate that if a response explicitly specifies a 204, that
							its type is Unit. Previously we accepted api specifications that
							incorrectly specified a type.</li>
						<li>Add validation for path parameters - only strings, UUID, and
							number types are now supported in path parameters which keeps
							serialization simpler.</li>
						<li>
							<p class="inline">Major refactoring of the play client. Highlights include:</p>
							<ul class="list-disc list-inside space-y-1 ml-6 mt-2">
								<li>Methods that can return a 404 are now handled as returning
									an Option. This means you do not need to catch errors to handle
									404s, instead matching on the response leading to much nicer
									client code.</li>
								<li>Introduced traits for all resource clients and methods to
									obtain an instance of the resource client. This should make it
									simple to mock the clients in tests.</li>
								<li>Nicer internal implementation of a number of helpers
									(e.g. generating query parameters, path parameters, etc.). Helps
									improve readability of the client code.</li>
								<li>Fix bug to fully specify package of DateTime class.</li>
							</ul>
						</li>
					</ul>
				</div>

				<div>
					<h4 class="font-semibold text-ab-dark-blue mb-2">0.4.40 — Jul 9, 2014</h4>
					<ul class="list-disc list-inside space-y-2 text-ab-dark-blue">
						<li>
							<p class="inline">Introduce support for new datatype map. For the initial release,
								both the keys and the values of the map must be String which we
								believe enables most of the necessary use-cases while minimizing
								complexity. Strings will natively serialize / deserialize from JSON
								making the generated clients much simpler to use.</p>

							<pre class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm overflow-x-auto mt-2 mb-2">{@html `<code>{
  "models": {
    "event": {
      "fields": [
        { "name": "tags", "type": "map" }
      ]
    }
  }
}</code>`}</pre>

							<p class="ml-6">This allows the user to pass in key/value pairs using a map.</p>
						</li>

						<li>
							<p class="inline">Introduce support for enums. Enums are specified by appending
								an enum element in the definition of the field. For example:</p>

							<pre class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm overflow-x-auto mt-2 mb-2">{@html `<code>{
  "models": {
    "event": {
      "fields": [
        { "name": "source", "type": "string", "enum": ["incident", "plan"] }
      ]
    }
  }
}</code>`}</pre>

							<p class="ml-6">There are a few constraints on enums:</p>
							<ul class="list-disc list-inside space-y-1 ml-6 mt-1">
								<li>The field type must be string</li>
								<li>The enum values must be valid names - Names must be alphanumeric and must
									start with a letter. Valid characters are a-z, A-Z, 0-9 and _ characters. Main
									reason to restrict character space is to enable code generation tools to produce
									nice enum classes w/ valid symbols for each value.</li>
							</ul>
						</li>

						<li>Validation for path parameters - only strings, UUID, and
							number types are now supported in path parameters which keeps
							serialization simpler. Previously we were allowing specification
							of, for example, dates as path parameters which we do not intend
							to support.</li>
					</ul>
				</div>
			</div>
		</details>

	</div>
</div>
