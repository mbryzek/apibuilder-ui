<svelte:head>
	<title>Attributes - API Builder</title>
</svelte:head>

<div>
	<h1 class="text-2xl font-bold text-ab-dark-blue mb-6">Attributes</h1>

	<div class="card mb-6">
		<p class="text-ab-dark-blue mb-3">
			API Builder supports the notion of 'attributes' that can be used to
			enhance code generation:
		</p>

		<ul class="list-disc list-inside text-ab-dark-blue space-y-3 ml-2">
			<li>Attributes are globally unique and have URL friendly names.</li>
			<li>Attributes have an optional description.</li>
			<li>
				Attribute values can be set at the organization level,
				cascading to all of the applications that belong to that
				organization. Organization level values can be found by going to
				your organization, clicking 'Org Details' in the
				nav bar, then 'Org Attributes'.
			</li>
			<li>
				A code generator can return a list of the attribute names on
				which it depends. API Builder will then send any matching attribute
				values when invoking the code generator.
			</li>
		</ul>
	</div>
</div>
