<svelte:head>
  <title>Authentication - API Builder</title>
</svelte:head>

<div>
  <h1 class="text-2xl font-bold text-ab-dark-blue mb-4">Authentication</h1>

  <p class="text-ab-dark-blue mb-8 text-lg leading-relaxed">
    Declare authentication as a first-class part of your service spec. Each operation identifies the auth scheme it requires by type, and
    code generators turn that into the matching runtime check — no JSON attributes, no string parsing, no per-controller glue.
  </p>

  <!-- Declare schemes -->
  <div class="card mb-6">
    <h2 class="text-lg font-semibold text-ab-blue mb-3 flex items-center gap-2">
      <span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-ab-blue text-white text-xs">1</span>
      Declare Auth Schemes on the Service
    </h2>
    <p class="text-ab-dark-blue mb-3">
      Add an <strong>auth_schemes</strong> array at the top level of your api.json. Each entry declares a scheme <code>type</code> that operations
      can reference. Code generators look up the type and emit the corresponding runtime helper.
    </p>
    <pre class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm mb-4 overflow-x-auto"><code
        >{@html `"auth_schemes": [
  {
    "type": "hackathon_admin",
    "description": "Tenant admin for the hackathon tenant"
  },
  {
    "type": "session",
    "description": "Any logged-in user session"
  }
]`}</code
      ></pre>
    <p class="text-ab-dark-blue text-sm">
      The reserved value <code>none</code> cannot be used as a scheme type &mdash; it is the explicit-public marker on operations.
    </p>
  </div>

  <!-- Reference on operation -->
  <div class="card mb-6">
    <h2 class="text-lg font-semibold text-ab-blue mb-3 flex items-center gap-2">
      <span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-ab-blue text-white text-xs">2</span>
      Reference a Scheme on an Operation
    </h2>
    <p class="text-ab-dark-blue mb-3">
      Set <strong>auth</strong> on the operation to one of the declared scheme types. Code generators emit the matching runtime check; the service
      method receives the authenticated caller as its first argument.
    </p>
    <pre class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm overflow-x-auto"><code
        >{@html `"resources": {
  "event": {
    "operations": [
      {
        "method": "GET",
        "path": "/admin/events",
        "auth": "hackathon_admin"
      }
    ]
  }
}`}</code
      ></pre>
  </div>

  <!-- Resource-level default -->
  <div class="card mb-6">
    <h2 class="text-lg font-semibold text-ab-blue mb-3 flex items-center gap-2">
      <span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-ab-blue text-white text-xs">3</span>
      Resource-Level Defaults &amp; Per-Operation Overrides
    </h2>
    <p class="text-ab-dark-blue mb-3">
      In your input api.json you can set a default <strong>auth</strong> at the resource level so every operation inherits it. API Builder materializes
      the inheritance for you &mdash; the emitted service spec carries the effective scheme on each operation directly. Generators never need
      to walk back to the resource to find the auth value.
    </p>
    <pre class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm mb-4 overflow-x-auto"><code
        >{@html `"resources": {
  "event": {
    "auth": "hackathon_admin",
    "operations": [
      { "method": "GET",  "path": "/admin/events" },
      { "method": "POST", "path": "/admin/events" },
      {
        "method": "GET",
        "path": "/admin/events/public-feed",
        "auth": "none"
      }
    ]
  }
}`}</code
      ></pre>
    <p class="text-ab-dark-blue text-sm">
      Use <code>"auth": "none"</code> to opt a single operation out of an otherwise-protected resource. The generated controller emits no auth
      check for that op.
    </p>
  </div>

  <!-- Generator output -->
  <div class="card mb-6">
    <h2 class="text-lg font-semibold text-ab-blue mb-3 flex items-center gap-2">
      <span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-ab-blue text-white text-xs">4</span>
      What Generators Produce
    </h2>
    <p class="text-ab-dark-blue mb-3">
      The Play controller generator wraps each protected operation in the runtime helper that matches the scheme type and passes the
      authenticated principal to your service method:
    </p>
    <pre class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm overflow-x-auto"><code
        >{@html `def getEvents(): Action[AnyContent] = Action.async { request =>
  withHackathonAdmin(request) { auth =>
    service.getEvents(auth).map(toGetEventsResult)
  }
}`}</code
      ></pre>
    <p class="text-ab-dark-blue text-sm mt-3">
      Each generator decides how scheme types map to runtime helpers. If your generator does not recognize a scheme type, codegen fails
      &mdash; an unrecognized scheme is never silently dropped to public.
    </p>
  </div>

  <!-- Key Rules -->
  <div class="card mb-6">
    <h2 class="text-lg font-semibold text-ab-blue mb-3 flex items-center gap-2">
      <span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-ab-blue text-white text-xs">!</span>
      Key Rules
    </h2>
    <ul class="space-y-2 text-ab-dark-blue ml-2">
      <li>
        <strong>Declare before reference</strong> &mdash; every <code>operation.auth</code> value (other than <code>none</code>) must appear
        in <code>service.auth_schemes</code>. Generators reject unknown references.
      </li>
      <li>
        <strong>Reserved value</strong> &mdash; <code>none</code> cannot be used as an auth_scheme type; it is the per-operation public marker.
      </li>
      <li>
        <strong>Inheritance is materialized</strong> &mdash; resource-level defaults are flattened into each operation before the spec is
        emitted, so generators only ever read <code>operation.auth</code>.
      </li>
      <li>
        <strong>Absent today, required tomorrow</strong> &mdash; an operation with no <code>auth</code> field is currently treated as public.
        A future revision will require the field; declare schemes now to be ready.
      </li>
    </ul>
  </div>

  <!-- Resources -->
  <div class="card mb-6">
    <h2 class="text-lg font-semibold text-ab-dark-blue mb-3">Resources</h2>
    <ul class="space-y-2 text-ab-dark-blue ml-2">
      <li>
        <a href="/doc/apiJson" class="text-ab-blue hover:text-ab-dark-blue underline">api.json specification</a>
        &mdash; Full format reference
      </li>
      <li>
        <a href="/doc/generators" class="text-ab-blue hover:text-ab-dark-blue underline">Code Generators</a>
        &mdash; How auth schemes flow through generated code
      </li>
    </ul>
  </div>

  <!-- CTA -->
  <div class="mt-12 mb-8 text-center">
    <p class="text-ab-dark-blue mb-4">Ready to declare your auth schemes?</p>
    <a href="/doc/apiJson" class="btn-primary inline-block">View api.json Format</a>
  </div>
</div>
