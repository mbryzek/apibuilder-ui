<svelte:head>
	<title>History - API Builder</title>
</svelte:head>

<div>
	<h1 class="text-2xl font-bold text-ab-dark-blue mb-4">History</h1>

	<p class="text-ab-dark-blue mb-8 text-lg leading-relaxed">
		API Builder grew out of real problems at scale — 100+ active committers, 300+ microservices,
		and significant revenue running through them. The team needed a better way to manage the
		complexity of a growing distributed architecture.
	</p>

	<!-- Origin -->
	<div class="card mb-6">
		<h2 class="text-lg font-semibold text-ab-blue mb-3 flex items-center gap-2">
			<span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-ab-blue text-white text-xs">1</span>
			The Problem
		</h2>
		<p class="text-ab-dark-blue mb-3">
			At Gilt, developers were constantly building new APIs and spending significant time writing
			client libraries and learning the intricacies of services owned by other teams. The
			integration cost was growing faster than the team.
		</p>
		<p class="text-ab-dark-blue">
			The insight: by investing more time upfront in API design and using standardized generated
			client libraries, teams could focus on building services instead of integration work.
		</p>
	</div>

	<!-- Evaluation -->
	<div class="card mb-6">
		<h2 class="text-lg font-semibold text-ab-blue mb-3 flex items-center gap-2">
			<span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-ab-blue text-white text-xs">2</span>
			What We Evaluated
		</h2>
		<p class="text-ab-dark-blue mb-3">
			The team explored protobufs, thrift, avro, swagger, apiary, RAML, and others —
			hand-writing interfaces for systems actively being built. None fully met the requirements.
		</p>
	</div>

	<!-- Requirements -->
	<div class="card mb-6">
		<h2 class="text-lg font-semibold text-ab-blue mb-3 flex items-center gap-2">
			<span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-ab-blue text-white text-xs">3</span>
			Key Requirements
		</h2>
		<ul class="space-y-4 text-ab-dark-blue ml-2">
			<li>
				<strong>Clients developers love</strong> —
				Generated clients so good that developers stop writing their own. Zero runtime dependencies.
			</li>
			<li>
				<strong>JSON / HTTP first</strong> —
				The universal standard. By focusing on HTTP/JSON, the tooling is available to all web developers —
				native apps, web frontends, and backend services alike.
			</li>
			<li>
				<strong>Resource-centric</strong> —
				api.json starts with resources, not operations. This encourages identifying resources early
				and has proven valuable with resource-first approaches like GraphQL.
			</li>
			<li>
				<strong>Simple, terse schema</strong> —
				A web developer should learn the format by reading a few examples. Hand-written JSON
				that is clear and compact.
			</li>
			<li>
				<strong>Instant documentation</strong> —
				Upload a JSON file and documentation appears. Using API Builder purely for documentation
				is a core use case.
			</li>
			<li>
				<strong>No code annotations</strong> —
				Annotations clutter code. In a microservices environment, applications should stay
				simple and pure.
			</li>
			<li>
				<strong>Compatible with existing tools</strong> —
				Standards are borrowed from existing projects wherever possible, making API Builder fully
				compatible with frameworks like Swagger and Avro.
			</li>
		</ul>
	</div>

	<!-- CTA -->
	<div class="mt-12 mb-8 text-center">
		<p class="text-ab-dark-blue mb-4">See the result of these principles in action.</p>
		<a href="/doc/why" class="btn-primary inline-block">Why API Builder?</a>
	</div>
</div>
