<svelte:head>
	<title>api.json format - API Builder</title>
</svelte:head>

<div>
	<h1 class="text-2xl font-bold text-ab-dark-blue mb-4">api.json format</h1>

	<p class="text-ab-dark-blue mb-4 text-lg leading-relaxed">
		Define your complete API in a single JSON file. The api.json format is API Builder's native specification — simple enough for a novice, expressive enough for production APIs.
	</p>

	<!-- Section Navigation -->
	<div class="card mb-8">
		<h2 class="text-lg font-semibold text-ab-dark-blue mb-3">Quick Reference</h2>
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
			<div>
				<h3 class="font-semibold text-ab-blue mb-1 flex items-center gap-1">
					<span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-ab-blue text-white text-xs font-bold">&#9670;</span>
					Core Structure
				</h3>
				<ul class="space-y-0.5 ml-6">
					<li><a href="#name" class="text-ab-blue hover:text-ab-dark-blue underline">name</a></li>
					<li><a href="#info" class="text-ab-blue hover:text-ab-dark-blue underline">info</a></li>
					<li><a href="#contact" class="text-ab-blue hover:text-ab-dark-blue underline">contact</a></li>
					<li><a href="#license" class="text-ab-blue hover:text-ab-dark-blue underline">license</a></li>
					<li><a href="#namespace" class="text-ab-blue hover:text-ab-dark-blue underline">namespace</a></li>
					<li><a href="#base_url" class="text-ab-blue hover:text-ab-dark-blue underline">base_url</a></li>
					<li><a href="#description" class="text-ab-blue hover:text-ab-dark-blue underline">description</a></li>
				</ul>
			</div>
			<div>
				<h3 class="font-semibold text-ab-blue mb-1 flex items-center gap-1">
					<span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-ab-blue text-white text-xs font-bold">T</span>
					Types
				</h3>
				<ul class="space-y-0.5 ml-6">
					<li><a href="#enum" class="text-ab-blue hover:text-ab-dark-blue underline">Enum</a></li>
					<li><a href="#enumValue" class="text-ab-blue hover:text-ab-dark-blue underline">EnumValue</a></li>
					<li><a href="#model" class="text-ab-blue hover:text-ab-dark-blue underline">Model</a></li>
					<li><a href="#field" class="text-ab-blue hover:text-ab-dark-blue underline">Field</a></li>
					<li><a href="#interface" class="text-ab-blue hover:text-ab-dark-blue underline">Interface</a></li>
					<li><a href="#union" class="text-ab-blue hover:text-ab-dark-blue underline">Union</a></li>
					<li><a href="#unionType" class="text-ab-blue hover:text-ab-dark-blue underline">UnionType</a></li>
				</ul>
			</div>
			<div>
				<h3 class="font-semibold text-ab-blue mb-1 flex items-center gap-1">
					<span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-ab-blue text-white text-xs font-bold">&#9889;</span>
					API
				</h3>
				<ul class="space-y-0.5 ml-6">
					<li><a href="#resource" class="text-ab-blue hover:text-ab-dark-blue underline">Resource</a></li>
					<li><a href="#operation" class="text-ab-blue hover:text-ab-dark-blue underline">Operation</a></li>
					<li><a href="#body" class="text-ab-blue hover:text-ab-dark-blue underline">Body</a></li>
					<li><a href="#parameter" class="text-ab-blue hover:text-ab-dark-blue underline">Parameter</a></li>
					<li><a href="#response" class="text-ab-blue hover:text-ab-dark-blue underline">Response</a></li>
				</ul>
			</div>
			<div>
				<h3 class="font-semibold text-ab-blue mb-1 flex items-center gap-1">
					<span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-ab-blue text-white text-xs font-bold">&#9881;</span>
					Metadata
				</h3>
				<ul class="space-y-0.5 ml-6">
					<li><a href="#import" class="text-ab-blue hover:text-ab-dark-blue underline">Import</a></li>
					<li><a href="#header" class="text-ab-blue hover:text-ab-dark-blue underline">Header</a></li>
					<li><a href="#attribute" class="text-ab-blue hover:text-ab-dark-blue underline">Attribute</a></li>
					<li><a href="#annotation" class="text-ab-blue hover:text-ab-dark-blue underline">Annotation</a></li>
				</ul>
			</div>
		</div>
	</div>

	<!-- ================================================================== -->
	<!-- CORE STRUCTURE -->
	<!-- ================================================================== -->
	<h2 class="text-xl font-bold text-ab-dark-blue mb-6 mt-12 flex items-center gap-2">
		<span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-ab-blue text-white text-xs font-bold">&#9670;</span>
		Core Structure
	</h2>

	<div class="card mb-6" id="name">
		<h3 class="text-lg font-semibold text-ab-blue mb-3">Top-level Schema</h3>

		<p class="text-ab-dark-blue mb-4">
			A schema is represented in JSON as a JSON object of type <a href="https://app.apibuilder.io/apicollective/apibuilder-api-json/latest" class="text-ab-blue hover:text-ab-dark-blue underline">api json</a>:
		</p>

		<div class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm overflow-x-auto mb-4">
			{@html `<pre><code>{
  "name": <em>string</em>,
  "info": <em>JSON Object of <a href="#info" class="text-ab-blue hover:text-ab-dark-blue underline">Info</a> (optional)</em>,
  "namespace": <em>string (optional)</em>,
  "base_url": <em>string (optional)</em>,
  "description": <em>string (optional)</em>,
  "imports": <em>JSON Array of <a href="#import" class="text-ab-blue hover:text-ab-dark-blue underline">Import</a> (optional)</em>,
  "headers": <em>JSON Array of <a href="#header" class="text-ab-blue hover:text-ab-dark-blue underline">Header</a> (optional)</em>,
  "enums": <em>JSON Object of <a href="#enum" class="text-ab-blue hover:text-ab-dark-blue underline">Enum</a> (optional)</em>,
  "interfaces": <em>JSON Object of <a href="#interface" class="text-ab-blue hover:text-ab-dark-blue underline">Interface</a> (optional)</em>,
  "models": <em>JSON Object of <a href="#model" class="text-ab-blue hover:text-ab-dark-blue underline">Model</a> (optional)</em>,
  "unions": <em>JSON Object of <a href="#union" class="text-ab-blue hover:text-ab-dark-blue underline">Union</a> (optional)</em>,
  "resources": <em>JSON Object of <a href="#resource" class="text-ab-blue hover:text-ab-dark-blue underline">Resource</a> (optional)</em>,
  "attributes": <em>JSON Array of <a href="#attribute" class="text-ab-blue hover:text-ab-dark-blue underline">Attribute</a> (optional)</em>,
  "annotations": <em>JSON Object of <a href="#annotation" class="text-ab-blue hover:text-ab-dark-blue underline">Annotation</a> (optional)</em>
}</code></pre>`}
		</div>

		<p class="text-ab-dark-blue mb-2">where:</p>
		<ul class="list-disc pl-6 text-ab-dark-blue mb-4 space-y-2">
			<li><em>name</em>: the human readable name of this service. Used for display, and as the basis for generating a unique key for URL.</li>
			<li><em>info</em>: optionally specify additional metadata about this service (e.g. contact info, license). See <a href="#info" class="text-ab-blue hover:text-ab-dark-blue underline">Info</a></li>
			<li id="namespace"><em>namespace</em>: specifies the namespace for this service. Namespace is primarily used when other services import definitions from your service and in the code generators when defining things like package names. If not specified, we will automatically generate a namespace based on [organization namespace].[formatted service name].[major version number]. Note that by default API Builder includes the major version number in the package name which allows service authors and clients to interact with multiple versions of the service where changes have been made in a non backwards compatible way.</li>
			<li id="base_url"><em>baseUrl</em>: the base URL where this service is hosted. Must start with http.</li>
			<li id="description"><em>description</em>: optional description for what this service provides. Supports <a href="https://help.github.com/articles/github-flavored-markdown/" class="text-ab-blue hover:text-ab-dark-blue underline">GFM</a>.</li>
			<li><em>imports</em>: JSON array defining any other services whose schema definitions we would like to import into our service. See <a href="#import" class="text-ab-blue hover:text-ab-dark-blue underline">Import</a></li>
			<li><em>headers</em>: JSON array defining any HTTP Headers that the service understands or expects. See <a href="#header" class="text-ab-blue hover:text-ab-dark-blue underline">Header</a></li>
			<li><em>enums</em>: JSON object defining all of the enums in this API. The key of each object is the enum name. See <a href="#enum" class="text-ab-blue hover:text-ab-dark-blue underline">Enum</a></li>
			<li><em>models</em>: JSON object defining all of the models in this API. The key of each object is the model name. See <a href="#model" class="text-ab-blue hover:text-ab-dark-blue underline">Model</a></li>
			<li><em>resources</em>: JSON object defining all of the resources in this API. The key of each object is the name of a type that this resource represents. The type must be the name of a model or an enum. See <a href="#resource" class="text-ab-blue hover:text-ab-dark-blue underline">Resource</a></li>
			<li><em>attributes</em>: JSON array defining additional meta data about this service. Attributes are used to add custom extensions to API Builder and are typically used by generators to enable advanced code generation. See <a href="#attribute" class="text-ab-blue hover:text-ab-dark-blue underline">Attribute</a></li>
			<li><em>annotations</em>: JSON array defining annotations or tags that can be applied to fields regardless of their type. Annotations are intended to convey usage hints to consumers of the API. See <a href="#annotation" class="text-ab-blue hover:text-ab-dark-blue underline">Annotations</a></li>
		</ul>
	</div>

	<!-- Info -->
	<div class="card mb-6" id="info">
		<h3 class="text-lg font-semibold text-ab-blue mb-3">Info declaration</h3>
		<p class="text-ab-dark-blue mb-4">
			The info node is represented as a JSON object of the form:
		</p>

		<div class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm overflow-x-auto mb-4">
			{@html `<pre><code>{
  "contact": <em>JSON Object of <a href="#contact" class="text-ab-blue hover:text-ab-dark-blue underline">Contact</a> (optional)</em>,
  "license": <em>JSON Object of <a href="#license" class="text-ab-blue hover:text-ab-dark-blue underline">License</a> (optional)</em>
}</code></pre>`}
		</div>

		<p class="text-ab-dark-blue mb-2">where:</p>
		<ul class="list-disc pl-6 text-ab-dark-blue mb-4 space-y-2">
			<li><em>contact</em>: specifies contact information for this service. See <a href="#contact" class="text-ab-blue hover:text-ab-dark-blue underline">Contact</a></li>
			<li><em>license</em>: specifies the license under which this service is released. See <a href="#license" class="text-ab-blue hover:text-ab-dark-blue underline">License</a></li>
		</ul>
	</div>

	<!-- Contact -->
	<div class="card mb-6" id="contact">
		<h3 class="text-lg font-semibold text-ab-blue mb-3">Contact declaration</h3>
		<p class="text-ab-dark-blue mb-4">
			The contact node is represented as a JSON object of the form:
		</p>

		<div class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm overflow-x-auto mb-4">
			{@html `<pre><code>{
  "name": <em>string (optional)</em>,
  "url": <em>string (optional)</em>,
  "email": <em>string (optional)</em>
}</code></pre>`}
		</div>

		<p class="text-ab-dark-blue mb-2">where:</p>
		<ul class="list-disc pl-6 text-ab-dark-blue mb-4 space-y-2">
			<li><em>name</em>: Identifying name of the contact person/organization</li>
			<li><em>url</em>: URL pointing to the contact information</li>
			<li><em>email</em>: Email address of the contact person/organization</li>
		</ul>
	</div>

	<!-- License -->
	<div class="card mb-6" id="license">
		<h3 class="text-lg font-semibold text-ab-blue mb-3">License declaration</h3>
		<p class="text-ab-dark-blue mb-4">
			The license node is represented as a JSON object of the form:
		</p>

		<div class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm overflow-x-auto mb-4">
			{@html `<pre><code>{
  "name": <em>string</em>,
  "url": <em>string (optional)</em>
}</code></pre>`}
		</div>

		<p class="text-ab-dark-blue mb-2">where:</p>
		<ul class="list-disc pl-6 text-ab-dark-blue mb-4 space-y-2">
			<li><em>name</em>: Name of the license - e.g. MIT</li>
			<li><em>url</em>: URL of the license itself</li>
		</ul>
	</div>

	<!-- ================================================================== -->
	<!-- TYPES -->
	<!-- ================================================================== -->
	<h2 class="text-xl font-bold text-ab-dark-blue mb-6 mt-12 flex items-center gap-2">
		<span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-ab-blue text-white text-xs font-bold">T</span>
		Types
	</h2>

	<!-- Enum -->
	<div class="card mb-6" id="enum">
		<h3 class="text-lg font-semibold text-ab-blue mb-3">Enum declaration</h3>
		<p class="text-ab-dark-blue mb-4">
			An enum is represented as a JSON object of the form:
		</p>

		<div class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm overflow-x-auto mb-4">
			{@html `<pre><code>{
  "name": {
    "plural": <em>string (optional)</em>,
    "description": <em>string (optional)</em>,
    "values": <em>JSON Array of <a href="#enumValue" class="text-ab-blue hover:text-ab-dark-blue underline">EnumValue</a></em>,
    "attributes": <em>JSON Array of <a href="#attribute" class="text-ab-blue hover:text-ab-dark-blue underline">Attribute</a> (optional)</em>
  }
}</code></pre>`}
		</div>

		<p class="text-ab-dark-blue mb-2">where:</p>
		<ul class="list-disc pl-6 text-ab-dark-blue mb-4 space-y-2">
			<li><em>name</em>: the name of the enum. Names must be alphanumeric and must start with a letter. Valid characters are a-z, A-Z, 0-9 and _ characters. The name must be unique in the set of names assigned to enums, interfaces, models, or unions types.</li>
			<li><em>plural</em>: specifies the optional, plural form of the name. By default, we will pluralize the name using a basic set of english heuristics. The plural is used as a default in cases where it is more natural to specify web services. For example, the default path for a resource will be the plural.</li>
			<li><em>description</em>: optional longer description for this enum.</li>
			<li><em>values</em>: JSON Array of EnumValue objects. Each element defines a valid value and an optional description. See <a href="#enumValue" class="text-ab-blue hover:text-ab-dark-blue underline">EnumValue</a>.</li>
			<li><em>attributes</em>: JSON array defining additional meta data about this enum for use by generators. See <a href="#attribute" class="text-ab-blue hover:text-ab-dark-blue underline">Attribute</a></li>
		</ul>
	</div>

	<!-- EnumValue -->
	<div class="card mb-6" id="enumValue">
		<h3 class="text-lg font-semibold text-ab-blue mb-3">EnumValue declaration</h3>
		<p class="text-ab-dark-blue mb-4">
			An EnumValue is represented as a JSON object of the form:
		</p>

		<div class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm overflow-x-auto mb-4">
			{@html `<pre><code>{
  "name": <em>string</em>,
  "value": <em>string (optional)</em>,
  "description": <em>string (optional)</em>,
  "attributes": <em>JSON Array of <a href="#attribute" class="text-ab-blue hover:text-ab-dark-blue underline">Attribute</a> (optional)</em>
}</code></pre>`}
		</div>

		<p class="text-ab-dark-blue mb-2">where:</p>
		<ul class="list-disc pl-6 text-ab-dark-blue mb-4 space-y-2">
			<li><em>name</em>: the name of the value. Names must start with a letter.</li>
			<li><em>value</em>: the actual string representation of this value when serializing. If not specified, defaults to 'name'.</li>
			<li><em>description</em>: optional description for what this enum value provides. Supports <a href="https://help.github.com/articles/github-flavored-markdown/" class="text-ab-blue hover:text-ab-dark-blue underline">GFM</a>.</li>
			<li><em>attributes</em>: JSON array defining additional meta data about this enum value for use by generators. See <a href="#attribute" class="text-ab-blue hover:text-ab-dark-blue underline">Attribute</a></li>
		</ul>
	</div>

	<!-- Model -->
	<div class="card mb-6" id="model">
		<h3 class="text-lg font-semibold text-ab-blue mb-3">Model declaration</h3>
		<p class="text-ab-dark-blue mb-4">
			A model is represented as a JSON object of the form:
		</p>

		<div class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm overflow-x-auto mb-4">
			{@html `<pre><code>{
  "name": {
    "description": <em>string (optional)</em>,
    "plural": <em>string (optional)</em>,
    "interfaces": <em>JSON Array of type string where each value indicates the name of a declared interface (optional)</em>,
    "fields": <em>JSON Array of <a href="#field" class="text-ab-blue hover:text-ab-dark-blue underline">Field</a></em>,
    "attributes": <em>JSON Array of <a href="#attribute" class="text-ab-blue hover:text-ab-dark-blue underline">Attribute</a> (optional)</em>
  }
}</code></pre>`}
		</div>

		<p class="text-ab-dark-blue mb-2">where:</p>
		<ul class="list-disc pl-6 text-ab-dark-blue mb-4 space-y-2">
			<li><em>name</em>: specifies the name of the model. Names must be alphanumeric and start with a letter. Valid characters are a-z, A-Z, 0-9 and _ characters. The name must be unique in the set of names assigned to enums, interfaces, models, or unions types.</li>
			<li><em>plural</em>: specifies the optional, plural form of the name. By default, we will pluralize the name using a basic set of english heuristics. The plural is used as a default in cases where it is more natural to specify web services. For example, the default path for a resource will be the plural.</li>
			<li><em>description</em>: optional description for what this model provides. Supports <a href="https://help.github.com/articles/github-flavored-markdown/" class="text-ab-blue hover:text-ab-dark-blue underline">GFM</a>.</li>
			<li><em>fields</em>: indicates that one or more fields is required. See <a href="#field" class="text-ab-blue hover:text-ab-dark-blue underline">Field</a>.</li>
			<li><em>attributes</em>: JSON array defining additional meta data about this model for use by generators. See <a href="#attribute" class="text-ab-blue hover:text-ab-dark-blue underline">Attribute</a></li>
		</ul>
	</div>

	<!-- Field -->
	<div class="card mb-6" id="field">
		<h3 class="text-lg font-semibold text-ab-blue mb-3">Field declaration</h3>
		<p class="text-ab-dark-blue mb-4">
			A field is represented as a JSON object of the form:
		</p>

		<div class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm overflow-x-auto mb-4">
			{@html `<pre><code>{
  "name": <em>string</em>,
  "type": <em>string</em>,
  "description": <em>string (optional)</em>,
  "required": <em>boolean (optional, true by default)</em>,
  "default": <em>value (optional)</em>,
  "example": <em>string (optional)</em>,
  "minimum": <em>long (optional)</em>,
  "maximum": <em>long (optional)</em>,
  "attributes": <em>JSON Array of <a href="#attribute" class="text-ab-blue hover:text-ab-dark-blue underline">Attribute</a> (optional)</em>,
  "annotations": <em>JSON Array of type string where each value indicates the name of a declared annotation (optional)</em>
}</code></pre>`}
		</div>

		<p class="text-ab-dark-blue mb-2">where:</p>
		<ul class="list-disc pl-6 text-ab-dark-blue mb-4 space-y-2">
			<li><em>name</em>: specifies the name of the field. Names must be alphanumeric and start with a letter. Valid characters are a-z, A-Z, 0-9 and _ characters.</li>
			<li><em>type</em>: specifies the type of this field. Acceptable values include the name of either an enum, a model, or a (<a href="/doc/types" class="text-ab-blue hover:text-ab-dark-blue underline">primitive type</a>). To specify a List, the type name can be wrapped with "[]". For example, to specify that the type is a collection of strings, use "[string]". To specify a Map, the type name can be prefixed with "map[type]". For example, to specify that the type is a Map of string to long, use "map[long]". Note that for map, the keys must be strings (per the JSON specification).</li>
			<li><em>description</em>: optional description for what this field provides. Supports <a href="https://help.github.com/articles/github-flavored-markdown/" class="text-ab-blue hover:text-ab-dark-blue underline">GFM</a>.</li>
			<li><em>required</em>: boolean: true|false. By default, all fields are considered required. To make a field optional, set "required" to false.</li>
			<li><em>default</em>: optional default value. The value must be valid for the type specified for this field. For example, if you specify a field named 'limit' with type 'integer', an acceptable default would be 10</li>
			<li><em>example</em>: optional - an example value for this field used only in the produced documentation</li>
			<li><em>minimum</em>: optional - For a string, refers to the minimum length. For an array, the minimum number of elements in the array. For example, a value of 1 for an array would indicate the array must have at least 1 element.</li>
			<li><em>maximum</em>: optional - For a string, refers to the maximum length. For an array, the maximum number of elements in the array. For example, a value of 1 for an array would indicate the array must have at most 1 element.</li>
			<li><em>attributes</em>: JSON array defining additional meta data about this field for use by generators. See <a href="#attribute" class="text-ab-blue hover:text-ab-dark-blue underline">Attribute</a></li>
		</ul>

		<p class="text-ab-dark-blue mb-4">
			When a field is marked as required, it must be present in any form of a model for that form to be valid. In a client-server scenario, this means that any defaults that are present in the model must be applied by the client. If you want a default to be applied by the receiver, you should mark the field as <code class="bg-gray-100 px-1 rounded">"required": false</code>.
		</p>
	</div>

	<!-- Interface -->
	<div class="card mb-6" id="interface">
		<h3 class="text-lg font-semibold text-ab-blue mb-3">Interface declaration</h3>
		<p class="text-ab-dark-blue mb-4">
			An interface is represented as a JSON object of the form:
		</p>

		<div class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm overflow-x-auto mb-4">
			{@html `<pre><code>{
  "name": {
    "description": <em>string (optional)</em>,
    "plural": <em>string (optional)</em>,
    "fields": <em>JSON Array of <a href="#field" class="text-ab-blue hover:text-ab-dark-blue underline">Field</a> (optional)</em>,
    "attributes": <em>JSON Array of <a href="#attribute" class="text-ab-blue hover:text-ab-dark-blue underline">Attribute</a> (optional)</em>
  }
}</code></pre>`}
		</div>

		<p class="text-ab-dark-blue mb-2">where:</p>
		<ul class="list-disc pl-6 text-ab-dark-blue mb-4 space-y-2">
			<li><em>name</em>: specifies the name of the interface. Names must be alphanumeric and start with a letter. Valid characters are a-z, A-Z, 0-9 and _ characters. The name must be unique in the set of names assigned to enums, interfaces, or models. Note you may define an interface and a union of the same name.</li>
			<li><em>plural</em>: specifies the optional, plural form of the name. By default, we will pluralize the name using a basic set of english heuristics. The plural is used as a default in cases where it is more natural to specify web services. For example, the default path for a resource will be the plural.</li>
			<li><em>description</em>: optional description for what this model provides. Supports <a href="https://help.github.com/articles/github-flavored-markdown/" class="text-ab-blue hover:text-ab-dark-blue underline">GFM</a>.</li>
			<li><em>fields</em>: JSON Array of 0 or more <a href="#field" class="text-ab-blue hover:text-ab-dark-blue underline">Fields</a>.</li>
			<li><em>attributes</em>: JSON array defining additional meta data about this model for use by generators. See <a href="#attribute" class="text-ab-blue hover:text-ab-dark-blue underline">Attribute</a></li>
		</ul>

		<p class="text-ab-dark-blue mb-4">
			More information about interfaces can be found <a href="/doc/interfaces" class="text-ab-blue hover:text-ab-dark-blue underline">here</a>.
		</p>
	</div>

	<!-- Union -->
	<div class="card mb-6" id="union">
		<h3 class="text-lg font-semibold text-ab-blue mb-3">Union declaration</h3>
		<p class="text-ab-dark-blue mb-4">
			A union is represented as a JSON object of the form:
		</p>

		<div class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm overflow-x-auto mb-4">
			{@html `<pre><code>{
  "name": {
    "plural": <em>string (optional)</em>,
    "fields": <em>JSON Array of <a href="#field" class="text-ab-blue hover:text-ab-dark-blue underline">Field</a> (optional)</em>,
    "discriminator": <em>string</em>,
    "description": <em>string (optional)</em>,
    "interfaces": <em>JSON Array of type string where each value indicates the name of a declared interface (optional)</em>,
    "types": <em>JSON Array of <a href="#unionType" class="text-ab-blue hover:text-ab-dark-blue underline">UnionType</a></em>,
    "attributes": <em>JSON Array of <a href="#attribute" class="text-ab-blue hover:text-ab-dark-blue underline">Attribute</a> (optional)</em>
  }
}</code></pre>`}
		</div>

		<p class="text-ab-dark-blue mb-2">where:</p>
		<ul class="list-disc pl-6 text-ab-dark-blue mb-4 space-y-2">
			<li><em>name</em>: specifies the name of the union. Names must be alphanumeric and start with a letter. Valid characters are a-z, A-Z, 0-9 and _ characters. The name must be unique in the set of names assigned to enums, unions, or models. Note you may define an interface and a union of the same name, but in this case it is required to list that interface in the interfaces field.</li>
			<li><em>fields</em>: Optional JSON Array of 0 or more <a href="#field" class="text-ab-blue hover:text-ab-dark-blue underline">Fields</a>. If specified, API Builder will create a model named after the type with these specified fields. This is syntactic sugar for creating the model yourself and then referencing here as the type.</li>
			<li><em>plural</em>: specifies the optional, plural form of the name. By default, we will pluralize the name using a basic set of english heuristics. The plural is used as a default in cases where it is more natural to specify web services. For example, the default path for a resource will be the plural.</li>
			<li><em>discriminator</em>: specifies the name for a type discriminator field used in serialization / deserialization to identify the type of object. For example, a code generator can flatten the JSON representation to: {`{ "discriminator": "xxx", "field1": "yyy" }`}. The name of the discriminator field must be unique across all of the fields across all of the types of this union. See <a href="/doc/playUnionTypes" class="text-ab-blue hover:text-ab-dark-blue underline">Play Union Types</a> for more information and examples.</li>
			<li><em>description</em>: optional description for what this union provides. Supports <a href="https://help.github.com/articles/github-flavored-markdown/" class="text-ab-blue hover:text-ab-dark-blue underline">GFM</a>.</li>
			<li><em>types</em>: Specifies the individual types that are part of this union type. See <a href="#unionType" class="text-ab-blue hover:text-ab-dark-blue underline">UnionType</a>.</li>
			<li><em>attributes</em>: JSON array defining additional meta data about this union for use by generators. See <a href="#attribute" class="text-ab-blue hover:text-ab-dark-blue underline">Attribute</a></li>
		</ul>
	</div>

	<!-- UnionType -->
	<div class="card mb-6" id="unionType">
		<h3 class="text-lg font-semibold text-ab-blue mb-3">UnionType declaration</h3>
		<p class="text-ab-dark-blue mb-4">
			A UnionType is represented as a JSON object of the form:
		</p>

		<div class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm overflow-x-auto mb-4">
			{@html `<pre><code>{
  "type": <em>string</em>,
  "description": <em>string (optional)</em>,
  "default": <em>boolean (optional)</em>,
  "discriminator_value": <em>string (optional)</em>,
  "attributes": <em>JSON Array of <a href="#attribute" class="text-ab-blue hover:text-ab-dark-blue underline">Attribute</a> (optional)</em>
}</code></pre>`}
		</div>

		<p class="text-ab-dark-blue mb-2">where:</p>
		<ul class="list-disc pl-6 text-ab-dark-blue mb-4 space-y-2">
			<li><em>type</em>: specifies the type to include in this union type. Acceptable values include the name of either an enum, a model, or a (<a href="/doc/types" class="text-ab-blue hover:text-ab-dark-blue underline">primitive type</a>).</li>
			<li><em>description</em>: optional description for what this type provides. Supports <a href="https://help.github.com/articles/github-flavored-markdown/" class="text-ab-blue hover:text-ab-dark-blue underline">GFM</a>.</li>
			<li><em>default</em>: If true, indicates that this type should be used as the default when deserializing union types. This field is only used by union types that require a discriminator and sets the default value for that discriminator during deserialization.</li>
			<li><em>discriminator_value</em>: The discriminator value defines the string to use in the discriminator field to identify this type. If not specified, the discriminator value will default to the name of the type itself.</li>
			<li><em>attributes</em>: JSON array defining additional meta data about this union type for use by generators. See <a href="#attribute" class="text-ab-blue hover:text-ab-dark-blue underline">Attribute</a></li>
		</ul>
	</div>

	<!-- ================================================================== -->
	<!-- API -->
	<!-- ================================================================== -->
	<h2 class="text-xl font-bold text-ab-dark-blue mb-6 mt-12 flex items-center gap-2">
		<span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-ab-blue text-white text-xs font-bold">&#9889;</span>
		API
	</h2>

	<!-- Resource -->
	<div class="card mb-6" id="resource">
		<h3 class="text-lg font-semibold text-ab-blue mb-3">Resource declaration</h3>
		<p class="text-ab-dark-blue mb-4">
			A resource is represented as a JSON object of the form:
		</p>

		<div class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm overflow-x-auto mb-4">
			{@html `<pre><code>{
  "typeName": {
    "path": <em>string (optional)</em>,
    "description": <em>string (optional)</em>,
    "operations": <em>JSON Array of <a href="#operation" class="text-ab-blue hover:text-ab-dark-blue underline">Operation</a></em>,
    "attributes": <em>JSON Array of <a href="#attribute" class="text-ab-blue hover:text-ab-dark-blue underline">Attribute</a> (optional)</em>
  }
}</code></pre>`}
		</div>

		<p class="text-ab-dark-blue mb-2">where:</p>
		<ul class="list-disc pl-6 text-ab-dark-blue mb-4 space-y-2">
			<li><em>typeName</em>: the name of the model or enum that this resource represents</li>
			<li><em>path</em>: optional path where this resource is located. If not provided, defaults to the plural of the typeName, with some assumptions of formatting for web (e.g. lower case, dash separated). Path parameters can be specified by prefixing a path element with ':'. For example, a path of '/:guid' would imply that all operations for this path will require a parameter named 'guid' of type 'string'</li>
			<li><em>description</em>: optional description for what this resource provides. Supports <a href="https://help.github.com/articles/github-flavored-markdown/" class="text-ab-blue hover:text-ab-dark-blue underline">GFM</a>.</li>
			<li><em>operations</em>: one or more operations is required. See <a href="#operation" class="text-ab-blue hover:text-ab-dark-blue underline">Operation</a>.</li>
			<li><em>attributes</em>: JSON array defining additional meta data about this resource for use by generators. See <a href="#attribute" class="text-ab-blue hover:text-ab-dark-blue underline">Attribute</a></li>
		</ul>
	</div>

	<!-- Operation -->
	<div class="card mb-6" id="operation">
		<h3 class="text-lg font-semibold text-ab-blue mb-3">Operation declaration</h3>
		<p class="text-ab-dark-blue mb-4">
			An operation is represented as a JSON object of the form:
		</p>

		<div class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm overflow-x-auto mb-4">
			{@html `<pre><code>{
  "method": <em>string</em>,
  "path": <em>string (optional)</em>,
  "description": <em>string (optional)</em>,
  "body": <em>JSON Object of <a href="#body" class="text-ab-blue hover:text-ab-dark-blue underline">Body</a> (optional)</em>,
  "parameters": <em>JSON Array of <a href="#parameter" class="text-ab-blue hover:text-ab-dark-blue underline">Parameter</a> (optional)</em>,
  "responses": <em>JSON Object of <a href="#response" class="text-ab-blue hover:text-ab-dark-blue underline">Response</a> (optional)</em>,
  "attributes": <em>JSON Array of <a href="#attribute" class="text-ab-blue hover:text-ab-dark-blue underline">Attribute</a> (optional)</em>
}</code></pre>`}
		</div>

		<p class="text-ab-dark-blue mb-2">where:</p>
		<ul class="list-disc pl-6 text-ab-dark-blue mb-4 space-y-2">
			<li><em>method</em>: the HTTP method for this operation</li>
			<li><em>path</em>: optional path for this particular operation. If not provided, defaults to no additional path. Path parameters can be specified by prefixing a path element with ':'. For example, a path of '/:guid' would imply that this operation is available at /resource_path/:guid. Path parameter types are inferred by looking for a field with that name on the model associated with this resource. If not found, the datatype of any path parameter will be string.</li>
			<li><em>description</em>: optional description for what this operation provides. Supports <a href="https://help.github.com/articles/github-flavored-markdown/" class="text-ab-blue hover:text-ab-dark-blue underline">GFM</a>.</li>
			<li><em>body</em>: optional specification for the type of the body of this request. For all operations that support bodies (e.g. POST, PUT, PATCH), allows you to specify the type of the body. See <a href="#body" class="text-ab-blue hover:text-ab-dark-blue underline">Body</a>.</li>
			<li><em>parameters</em>: optional JSON Array of the parameters to this method. By default, for GET and DELETE methods, parameters are assumed to be in the path or in the query. For other methods, parameters are assumed to be in the path or form body, unless you have explicitly specified a body in which case parameters can be provided in the path or the query. See <a href="#parameter" class="text-ab-blue hover:text-ab-dark-blue underline">Parameter</a>.</li>
			<li><em>responses</em>: optional JSON Object of HTTP Response Code to Response. If not provided, an HTTP NoContent response is assumed. Only responses for HTTP status codes that are interesting should be documented. See <a href="#response" class="text-ab-blue hover:text-ab-dark-blue underline">Response</a>.</li>
			<li><em>attributes</em>: JSON array defining additional meta data about this operation for use by generators. See <a href="#attribute" class="text-ab-blue hover:text-ab-dark-blue underline">Attribute</a></li>
		</ul>
	</div>

	<!-- Body -->
	<div class="card mb-6" id="body">
		<h3 class="text-lg font-semibold text-ab-blue mb-3">Body declaration</h3>
		<p class="text-ab-dark-blue mb-4">
			A body is represented as a JSON object of the form:
		</p>

		<div class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm overflow-x-auto mb-4">
			{@html `<pre><code>{
  "type": <em>string</em>,
  "description": <em>string (optional)</em>,
  "attributes": <em>JSON Array of <a href="#attribute" class="text-ab-blue hover:text-ab-dark-blue underline">Attribute</a> (optional)</em>
}</code></pre>`}
		</div>

		<p class="text-ab-dark-blue mb-2">where:</p>
		<ul class="list-disc pl-6 text-ab-dark-blue mb-4 space-y-2">
			<li><em>type</em>: specifies the type of this body. Acceptable values include the name of either an enum, a model, or a (<a href="/doc/types" class="text-ab-blue hover:text-ab-dark-blue underline">primitive type</a>). To specify a List, the type name can be wrapped with "[]". For example, to specify that the type is a collection of strings, use "[string]". To specify a Map, the type name can be prefixed with "map[type]". For example, to specify that the type is a Map of string to long, use "map[long]". Note that for map, the keys must be strings (per the JSON specification).</li>
			<li><em>description</em>: optional description for what this body provides. Supports <a href="https://help.github.com/articles/github-flavored-markdown/" class="text-ab-blue hover:text-ab-dark-blue underline">GFM</a>.</li>
			<li><em>attributes</em>: JSON array defining additional meta data about this body for use by generators. See <a href="#attribute" class="text-ab-blue hover:text-ab-dark-blue underline">Attribute</a></li>
		</ul>
	</div>

	<!-- Parameter -->
	<div class="card mb-6" id="parameter">
		<h3 class="text-lg font-semibold text-ab-blue mb-3">Parameter declaration</h3>
		<p class="text-ab-dark-blue mb-4">
			A parameter is represented as a JSON object of the form:
		</p>

		<div class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm overflow-x-auto mb-4">
			{@html `<pre><code>{
  "name": <em>string</em>,
  "type": <em>string</em>,
  "location": <em>string (optional)</em>,
  "description": <em>string (optional)</em>,
  "required": <em>boolean (optional, true by default)</em>,
  "default": <em>value (optional)</em>,
  "example": <em>string (optional)</em>,
  "minimum": <em>long (optional)</em>,
  "maximum": <em>long (optional)</em>,
  "attributes": <em>JSON Array of <a href="#attribute" class="text-ab-blue hover:text-ab-dark-blue underline">Attribute</a> (optional)</em>
}</code></pre>`}
		</div>

		<p class="text-ab-dark-blue mb-2">where:</p>
		<ul class="list-disc pl-6 text-ab-dark-blue mb-4 space-y-2">
			<li><em>name</em>: the name of the parameter. Names must be alphanumeric and must start with a letter. Valid characters are a-z, A-Z, 0-9 and _ characters.</li>
			<li><em>type</em>: specifies the type of this parameter. Acceptable values include the name of either an enum, a model, or a (<a href="/doc/types" class="text-ab-blue hover:text-ab-dark-blue underline">primitive type</a>). To specify a List, the type name can be wrapped with "[]". For example, to specify that the type is a collection of strings, use "[string]". To specify a Map, the type name can be prefixed with "map[type]". For example, to specify that the type is a Map of string to long, use "map[long]". Note that for map, the keys must be strings (per the JSON specification).</li>
			<li><em>location</em>: one of: path, query, form, header. Defines the location of this parameter. Default location varies based on the context of the parameter (e.g. if the operation method is a POST, the default will be Form; if a GET, the default will be Query).</li>
			<li><em>description</em>: optional description for what this parameter provides. Supports <a href="https://help.github.com/articles/github-flavored-markdown/" class="text-ab-blue hover:text-ab-dark-blue underline">GFM</a>.</li>
			<li><em>required</em>: boolean: true|false. By default all parameters are considered required. To make a parameter optional, set "required" to false.</li>
			<li><em>default</em>: optional default value. The value must be valid for the type specified for this parameter. For example, if you specify a parameter named 'limit' with type 'integer', an acceptable default would be 10</li>
			<li><em>example</em>: optional - an example value for this parameter used only in the produced documentation</li>
			<li><em>minimum</em>: optional - For a string, refers to the minimum length. For an array, the minimum number of elements in the array. For example, a value of 1 for an array would indicate the array must have at least 1 element.</li>
			<li><em>maximum</em>: optional - For a string, refers to the maximum length. For an array, the maximum number of elements in the array. For example, a value of 1 for an array would indicate the array must have at most 1 element.</li>
			<li><em>attributes</em>: JSON array defining additional meta data about this parameter for use by generators. See <a href="#attribute" class="text-ab-blue hover:text-ab-dark-blue underline">Attribute</a></li>
		</ul>
	</div>

	<!-- Response -->
	<div class="card mb-6" id="response">
		<h3 class="text-lg font-semibold text-ab-blue mb-3">Response declaration</h3>
		<p class="text-ab-dark-blue mb-4">
			A response is represented as a JSON object of the form:
		</p>

		<div class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm overflow-x-auto mb-4">
			{@html `<pre><code>{
  "http_status_code": {
    "type": <em>type</em>,
    "headers": <em>JSON Array of <a href="#header" class="text-ab-blue hover:text-ab-dark-blue underline">Header</a> (optional)</em>,
    "description": <em>string (optional)</em>,
    "attributes": <em>JSON Array of <a href="#attribute" class="text-ab-blue hover:text-ab-dark-blue underline">Attribute</a> (optional)</em>
  }
}</code></pre>`}
		</div>

		<p class="text-ab-dark-blue mb-2">where:</p>
		<ul class="list-disc pl-6 text-ab-dark-blue mb-4 space-y-2">
			<li><em>http_status_code</em>: A valid HTTP status code for this response (e.g. 200). Only status codes that have interesting return types should be documented. You can also specify an HTTP status code of 'default' to map to all other non documented types. This is useful to capture a generic error type that would be returned for non documented response codes.</li>
			<li><em>type</em>: specifies the type of this response. Acceptable values include the name of either an enum, a model, or a (<a href="/doc/types" class="text-ab-blue hover:text-ab-dark-blue underline">primitive type</a>). To specify a List, the type name can be wrapped with "[]". For example, to specify that the type is a collection of strings, use "[string]". To specify a Map, the type name can be prefixed with "map[type]". For example, to specify that the type is a Map of string to long, use "map[long]". Note that for map, the keys must be strings (per the JSON specification).</li>
			<li><em>description</em>: optional description for what this response provides. Supports <a href="https://help.github.com/articles/github-flavored-markdown/" class="text-ab-blue hover:text-ab-dark-blue underline">GFM</a>.</li>
			<li><em>attributes</em>: JSON array defining additional meta data about this service. Attributes are used to add custom extensions to API Builder and are typically used by generators to enable advanced code generation. See <a href="#attribute" class="text-ab-blue hover:text-ab-dark-blue underline">Attribute</a></li>
		</ul>

		<p class="text-ab-dark-blue mb-2">There are a few conventions enforced:</p>
		<ul class="list-disc pl-6 text-ab-dark-blue mb-4 space-y-2">
			<li>HTTP Response codes of 5xx cannot be explicitly specified and are handled automatically to ensure consistent behavior in generated client libraries.</li>
			<li>HTTP Response codes of 204 and 304 indicate that no content is returned, so they must use a type of <em>unit</em>.</li>
		</ul>
	</div>

	<!-- ================================================================== -->
	<!-- METADATA -->
	<!-- ================================================================== -->
	<h2 class="text-xl font-bold text-ab-dark-blue mb-6 mt-12 flex items-center gap-2">
		<span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-ab-blue text-white text-xs font-bold">&#9881;</span>
		Metadata
	</h2>

	<!-- Import -->
	<div class="card mb-6" id="import">
		<h3 class="text-lg font-semibold text-ab-blue mb-3">Import declaration</h3>
		<p class="text-ab-dark-blue mb-4">
			An import is represented as a JSON object of the form:
		</p>

		<div class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm overflow-x-auto mb-4">
			{@html `<pre><code>{
  "uri": <em>string</em>
}</code></pre>`}
		</div>

		<p class="text-ab-dark-blue mb-2">where:</p>
		<ul class="list-disc pl-6 text-ab-dark-blue mb-4 space-y-2">
			<li><em>uri</em>: The complete URI to the service specification that we are importing. Within API Builder, you can find the URL to the service specification by clicking on the "service.json" link for a service. Example: <a href="https://app.apibuilder.io/apicollective/apibuilder-api/0.16.53/service.json" class="text-ab-blue hover:text-ab-dark-blue underline">https://app.apibuilder.io/apicollective/apibuilder-api/0.16.53/service.json</a>.</li>
		</ul>
	</div>

	<!-- Header -->
	<div class="card mb-6" id="header">
		<h3 class="text-lg font-semibold text-ab-blue mb-3">Header declaration</h3>
		<p class="text-ab-dark-blue mb-4">
			A header is represented as a JSON object of the form:
		</p>

		<div class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm overflow-x-auto mb-4">
			{@html `<pre><code>{
  "name": <em>string</em>,
  "type": <em>string</em>,
  "required": <em>boolean (optional, true by default)</em>,
  "default": <em>value (optional)</em>,
  "description": <em>string (optional)</em>,
  "attributes": <em>JSON Array of <a href="#attribute" class="text-ab-blue hover:text-ab-dark-blue underline">Attribute</a> (optional)</em>
}</code></pre>`}
		</div>

		<p class="text-ab-dark-blue mb-2">where:</p>
		<ul class="list-disc pl-6 text-ab-dark-blue mb-4 space-y-2">
			<li><em>name</em>: the name of the header.</li>
			<li><em>type</em>: the type of this header. Acceptable values are either the name of an enum or string. To specify a collection (meaning multiple values for this header can be provided), the type name can be wrapped with "[]". For example, to specify that the type is a collection of strings, use "[string]".</li>
			<li><em>required</em>: boolean: true|false. By default, all headers are considered required. To make a parameter optional, set "required" to false.</li>
			<li><em>default</em>: the default value for this header. If specified, generated clients will automatically include this header in all requests. Default values must be specified as strings.</li>
			<li><em>description</em>: optional description for what this header provides. Supports <a href="https://help.github.com/articles/github-flavored-markdown/" class="text-ab-blue hover:text-ab-dark-blue underline">GFM</a>.</li>
			<li><em>attributes</em>: JSON array defining additional meta data about this header for use by generators. See <a href="#attribute" class="text-ab-blue hover:text-ab-dark-blue underline">Attribute</a></li>
		</ul>
	</div>

	<!-- Attribute -->
	<div class="card mb-6" id="attribute">
		<h3 class="text-lg font-semibold text-ab-blue mb-3">Attribute declaration</h3>
		<p class="text-ab-dark-blue mb-4">
			An attribute is represented as a JSON object in the following form:
		</p>

		<div class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm overflow-x-auto mb-4">
			{@html `<pre><code>{
  "name": <em>string</em>,
  "value": <em>JSON Object</em>
}</code></pre>`}
		</div>

		<p class="text-ab-dark-blue mb-2">where:</p>
		<ul class="list-disc pl-6 text-ab-dark-blue mb-4 space-y-2">
			<li><em>name</em>: the name and identifier of the attribute.</li>
			<li><em>value</em>: a JSON object that is usually utilized by a downstream Generator.</li>
		</ul>

		<p class="text-ab-dark-blue mb-2">Example attribute:</p>
		<div class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm overflow-x-auto mb-4">
			{@html `<pre><code>{
  "name": "my_regex_validation",
  "value": {
    "regex": "[a-z]"
  }
}</code></pre>`}
		</div>
	</div>

	<!-- Annotation -->
	<div class="card mb-6" id="annotation">
		<h3 class="text-lg font-semibold text-ab-blue mb-3">Annotation declaration</h3>
		<p class="text-ab-dark-blue mb-4">
			An annotation is just a short key that can be used to tag any field in any model of this API. The
			intent is to convey additional information about how a field might be used that isn't apparent
			in either the field's type or API semantics. For example, if you wanted to clearly identify
			fields of an API that may contain private customer data, you would create a <em>privacy</em>
			annotation and add <code class="bg-gray-100 px-1 rounded">"annotations": ["privacy"]</code> to all such fields.
		</p>
		<p class="text-ab-dark-blue mb-4">
			Generated code may preserve annotations either in the type system, documentation or via metaprogramming
			facilities depending on language support. Generated documentation should include the tag when displaying
			a field, along with a link to the annotation's declaration.
		</p>

		<div class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm overflow-x-auto mb-4">
			{@html `<pre><code>"annotations": {
  "personal_data": {
    "description": "Identifies a field that contains Personal Data, as defined by GDPR."
  }
}</code></pre>`}
		</div>

		<p class="text-ab-dark-blue mb-2">where:</p>
		<ul class="list-disc pl-6 text-ab-dark-blue mb-4 space-y-2">
			<li><em>name</em>: the name of the annotation.</li>
			<li><em>description</em>: optional, but recommended to explain how you intend the tag to clarify the usage of a field, possibly including links to additional documentation.</li>
		</ul>
	</div>

	<!-- CTA -->
	<div class="mt-12 mb-8 text-center">
		<p class="text-ab-dark-blue mb-4">Ready to build your first API?</p>
		<a href="/doc/start" class="btn-primary inline-block">Get Started</a>
	</div>
</div>
