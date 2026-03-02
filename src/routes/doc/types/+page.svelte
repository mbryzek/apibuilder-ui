<svelte:head>
	<title>Types - API Builder</title>
</svelte:head>

<div>
	<h1 class="text-2xl font-bold text-ab-dark-blue mb-6">Types</h1>

	<p class="text-ab-dark-blue mb-6">
		API Builder supports types that are common on the web - and useful for
		many web applications. For example, many applications work with
		dates and date times - by explicitly supporting these types, we
		can simplify working with these types in all web applications, and
		for type safe languages, we can map to the appropriate classes in
		each language.
	</p>

	<div class="space-y-6">
		<!-- boolean -->
		<div id="boolean">
			<h3 class="text-lg font-semibold text-ab-dark-blue mb-2">boolean</h3>
			<ul class="list-disc pl-6 text-ab-dark-blue space-y-1">
				<li>Represents a boolean value</li>
				<li>Examples:
					<ul class="list-disc pl-6">
						<li>true</li>
						<li>false</li>
					</ul>
				</li>
			</ul>
		</div>

		<!-- date-iso8601 -->
		<div id="date-iso8601">
			<h3 class="text-lg font-semibold text-ab-dark-blue mb-2">date-iso8601</h3>
			<ul class="list-disc pl-6 text-ab-dark-blue space-y-1">
				<li>Date format in ISO 8601</li>
				<li>Examples:
					<ul class="list-disc pl-6">
						<li>2014-04-29</li>
					</ul>
				</li>
			</ul>
		</div>

		<!-- date-time-iso8601 -->
		<div id="date-time-iso8601">
			<h3 class="text-lg font-semibold text-ab-dark-blue mb-2">date-time-iso8601</h3>
			<ul class="list-disc pl-6 text-ab-dark-blue space-y-1">
				<li>Date time format in ISO 8601</li>
				<li>Examples:
					<ul class="list-disc pl-6">
						<li>2014-04-29T11:56:52Z</li>
					</ul>
				</li>
			</ul>
		</div>

		<!-- decimal -->
		<div id="decimal">
			<h3 class="text-lg font-semibold text-ab-dark-blue mb-2">decimal</h3>
			<ul class="list-disc pl-6 text-ab-dark-blue space-y-1">
				<li>Commonly used to represent things like currency values. Maps to a BigDecimal in most languages.</li>
				<li>Examples:
					<ul class="list-disc pl-6">
						<li>10.12</li>
						<li>0.00</li>
						<li>-10.12</li>
					</ul>
				</li>
			</ul>
		</div>

		<!-- double -->
		<div id="double">
			<h3 class="text-lg font-semibold text-ab-dark-blue mb-2">double</h3>
			<ul class="list-disc pl-6 text-ab-dark-blue space-y-1">
				<li>double precision IEEE 754 floating-point number</li>
				<li>Examples:
					<ul class="list-disc pl-6">
						<li>10.12</li>
						<li>0.00</li>
						<li>-10.12</li>
					</ul>
				</li>
			</ul>
		</div>

		<!-- integer -->
		<div id="integer">
			<h3 class="text-lg font-semibold text-ab-dark-blue mb-2">integer</h3>
			<ul class="list-disc pl-6 text-ab-dark-blue space-y-1">
				<li>32-bit signed integer</li>
				<li>Examples:
					<ul class="list-disc pl-6">
						<li>10</li>
						<li>0</li>
						<li>-10</li>
					</ul>
				</li>
			</ul>
		</div>

		<!-- json-value -->
		<div id="json-value">
			<h3 class="text-lg font-semibold text-ab-dark-blue mb-2">json-value</h3>
			<ul class="list-disc pl-6 text-ab-dark-blue space-y-1">
				<li>Represents an arbitrary json value. In scala clients using play-json, maps to a play.api.libs.json.JsValue. In ruby clients, JSON is parsed into an Object</li>
				<li>Examples:
					<ul class="list-disc pl-6">
						{@html `<li>{}</li>
						<li>[]</li>`}
						<li>"This is a fox."</li>
						<li>10</li>
						<li>null</li>
						<li>true</li>
					</ul>
				</li>
			</ul>
		</div>

		<!-- long -->
		<div id="long">
			<h3 class="text-lg font-semibold text-ab-dark-blue mb-2">long</h3>
			<ul class="list-disc pl-6 text-ab-dark-blue space-y-1">
				<li>64-bit signed integer</li>
				<li>Examples:
					<ul class="list-disc pl-6">
						<li>10</li>
						<li>0</li>
						<li>-10</li>
					</ul>
				</li>
			</ul>
		</div>

		<!-- object -->
		<div id="object">
			<h3 class="text-lg font-semibold text-ab-dark-blue mb-2">object</h3>
			<ul class="list-disc pl-6 text-ab-dark-blue space-y-1">
				<li>Represents an arbitrary json object. In scala clients using play-json, maps to a play.api.libs.json.JsObject. In ruby clients, JSON is parsed into a Hash</li>
				<li>Examples:
					<ul class="list-disc pl-6">
						{@html `<li>{}</li>`}
					</ul>
				</li>
			</ul>
		</div>

		<!-- string -->
		<div id="string">
			<h3 class="text-lg font-semibold text-ab-dark-blue mb-2">string</h3>
			<ul class="list-disc pl-6 text-ab-dark-blue space-y-1">
				<li>unicode character sequence</li>
				<li>Examples:
					<ul class="list-disc pl-6">
						<li>This is a fox.</li>
					</ul>
				</li>
			</ul>
		</div>

		<!-- unit -->
		<div id="unit">
			<h3 class="text-lg font-semibold text-ab-dark-blue mb-2">unit</h3>
			<ul class="list-disc pl-6 text-ab-dark-blue space-y-1">
				<li>Internal type used to represent things like an HTTP NoContent response. Maps to void in Java, Unit in Scala, nil in ruby, etc.</li>
			</ul>
		</div>

		<!-- uuid -->
		<div id="uuid">
			<h3 class="text-lg font-semibold text-ab-dark-blue mb-2">uuid</h3>
			<ul class="list-disc pl-6 text-ab-dark-blue space-y-1">
				<li>String representation of a universally unique identifier</li>
				<li>Examples:
					<ul class="list-disc pl-6">
						<li>5ecf6502-e532-4738-aad5-7ac9701251dd</li>
					</ul>
				</li>
			</ul>
		</div>
	</div>
</div>
