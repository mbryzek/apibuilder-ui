<svelte:head>
	<title>Types - API Builder</title>
</svelte:head>

<div>
	<h1 class="text-2xl font-bold text-ab-dark-blue mb-4">Types</h1>

	<p class="text-ab-dark-blue mb-8 text-lg leading-relaxed">
		API Builder supports a rich set of primitive types common on the web. For type-safe languages,
		each maps to the appropriate native class — so your generated code works with real dates,
		decimals, and UUIDs instead of raw strings.
	</p>

	<!-- Text & Identity -->
	<div class="card mb-6">
		<h2 class="text-lg font-semibold text-ab-blue mb-4 flex items-center gap-2">
			<span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-ab-blue text-white text-xs">A</span>
			Text &amp; Identity
		</h2>
		<div class="space-y-4 ml-2">
			<div id="string">
				<h3 class="font-semibold text-ab-dark-blue">string</h3>
				<p class="text-ab-dark-blue text-sm mb-1">Unicode character sequence.</p>
				<code class="text-sm text-ab-gray">"This is a fox."</code>
			</div>
			<div id="uuid">
				<h3 class="font-semibold text-ab-dark-blue">uuid</h3>
				<p class="text-ab-dark-blue text-sm mb-1">Universally unique identifier (string representation).</p>
				<code class="text-sm text-ab-gray">"5ecf6502-e532-4738-aad5-7ac9701251dd"</code>
			</div>
		</div>
	</div>

	<!-- Numbers -->
	<div class="card mb-6">
		<h2 class="text-lg font-semibold text-ab-blue mb-4 flex items-center gap-2">
			<span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-ab-blue text-white text-xs">#</span>
			Numbers
		</h2>
		<div class="space-y-4 ml-2">
			<div id="integer">
				<h3 class="font-semibold text-ab-dark-blue">integer</h3>
				<p class="text-ab-dark-blue text-sm mb-1">32-bit signed integer.</p>
				<code class="text-sm text-ab-gray">10, 0, -10</code>
			</div>
			<div id="long">
				<h3 class="font-semibold text-ab-dark-blue">long</h3>
				<p class="text-ab-dark-blue text-sm mb-1">64-bit signed integer. Use when values exceed 32-bit range.</p>
				<code class="text-sm text-ab-gray">10, 0, -10</code>
			</div>
			<div id="decimal">
				<h3 class="font-semibold text-ab-dark-blue">decimal</h3>
				<p class="text-ab-dark-blue text-sm mb-1">Arbitrary-precision decimal. Ideal for currency values. Maps to <em>BigDecimal</em> in most languages.</p>
				<code class="text-sm text-ab-gray">10.12, 0.00, -10.12</code>
			</div>
			<div id="double">
				<h3 class="font-semibold text-ab-dark-blue">double</h3>
				<p class="text-ab-dark-blue text-sm mb-1">Double-precision IEEE 754 floating-point number.</p>
				<code class="text-sm text-ab-gray">10.12, 0.00, -10.12</code>
			</div>
		</div>
	</div>

	<!-- Date & Time -->
	<div class="card mb-6">
		<h2 class="text-lg font-semibold text-ab-blue mb-4 flex items-center gap-2">
			<span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-ab-blue text-white text-xs">⏱</span>
			Date &amp; Time
		</h2>
		<div class="space-y-4 ml-2">
			<div id="date-iso8601">
				<h3 class="font-semibold text-ab-dark-blue">date-iso8601</h3>
				<p class="text-ab-dark-blue text-sm mb-1">Date in ISO 8601 format. Maps to <em>LocalDate</em> in Scala/Java.</p>
				<code class="text-sm text-ab-gray">"2014-04-29"</code>
			</div>
			<div id="date-time-iso8601">
				<h3 class="font-semibold text-ab-dark-blue">date-time-iso8601</h3>
				<p class="text-ab-dark-blue text-sm mb-1">Date-time in ISO 8601 format. Maps to <em>DateTime</em> / <em>Instant</em> in Scala/Java.</p>
				<code class="text-sm text-ab-gray">"2014-04-29T11:56:52Z"</code>
			</div>
			<div id="time-iso8601">
				<h3 class="font-semibold text-ab-dark-blue">time-iso8601</h3>
				<p class="text-ab-dark-blue text-sm mb-1">Wall-clock time of day, no timezone. Maps to <em>LocalTime</em> in Scala/Java and <em>TIME</em> in PostgreSQL.</p>
				<code class="text-sm text-ab-gray">"18:15:00"</code>
			</div>
		</div>
	</div>

	<!-- Boolean -->
	<div class="card mb-6">
		<h2 class="text-lg font-semibold text-ab-blue mb-4 flex items-center gap-2">
			<span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-ab-blue text-white text-xs">✓</span>
			Boolean
		</h2>
		<div class="ml-2">
			<div id="boolean">
				<h3 class="font-semibold text-ab-dark-blue">boolean</h3>
				<p class="text-ab-dark-blue text-sm mb-1">Standard boolean value.</p>
				<code class="text-sm text-ab-gray">true, false</code>
			</div>
		</div>
	</div>

	<!-- JSON & Dynamic -->
	<div class="card mb-6">
		<h2 class="text-lg font-semibold text-ab-blue mb-4 flex items-center gap-2">
			<span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-ab-blue text-white text-xs">&#123;&#125;</span>
			JSON &amp; Dynamic
		</h2>
		<div class="space-y-4 ml-2">
			<div id="json-value">
				<h3 class="font-semibold text-ab-dark-blue">json-value</h3>
				<p class="text-ab-dark-blue text-sm mb-1">
					Any valid JSON value. Maps to <em>JsValue</em> in Play/Scala, parsed <em>Object</em> in Ruby.
				</p>
				<code class="text-sm text-ab-gray">{@html `{}, [], "text", 10, null, true`}</code>
			</div>
			<div id="object">
				<h3 class="font-semibold text-ab-dark-blue">object</h3>
				<p class="text-ab-dark-blue text-sm mb-1">
					JSON object specifically. Maps to <em>JsObject</em> in Play/Scala, <em>Hash</em> in Ruby.
				</p>
				<code class="text-sm text-ab-gray">{@html `{}`}</code>
			</div>
		</div>
	</div>

	<!-- Binary -->
	<div class="card mb-6">
		<h2 class="text-lg font-semibold text-ab-blue mb-4 flex items-center gap-2">
			<span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-ab-blue text-white text-xs">⬡</span>
			Binary
		</h2>
		<div class="ml-2">
			<div id="bytes">
				<h3 class="font-semibold text-ab-dark-blue">bytes</h3>
				<p class="text-ab-dark-blue text-sm mb-1">
					Represents binary data as a byte array. In JSON, encoded as a base64 string.
					Maps to <em>Array[Byte]</em> in Scala, <em>bytea</em> in PostgreSQL.
					Not allowed in URL path parameters.
				</p>
				<code class="text-sm text-ab-gray">"aGVsbG8="</code>
			</div>
		</div>
	</div>

	<!-- Special -->
	<div class="card mb-6">
		<h2 class="text-lg font-semibold text-ab-blue mb-4 flex items-center gap-2">
			<span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-ab-blue text-white text-xs">◈</span>
			Special
		</h2>
		<div class="ml-2">
			<div id="unit">
				<h3 class="font-semibold text-ab-dark-blue">unit</h3>
				<p class="text-ab-dark-blue text-sm">
					Represents the absence of a value — used for responses like HTTP 204 No Content.
					Maps to <em>void</em> in Java, <em>Unit</em> in Scala, <em>nil</em> in Ruby.
				</p>
			</div>
		</div>
	</div>

	<!-- CTA -->
	<div class="mt-12 mb-8 text-center">
		<p class="text-ab-dark-blue mb-4">Ready to define your API?</p>
		<a href="/doc/apiJson" class="btn-primary inline-block">View api.json Format</a>
	</div>
</div>
