<svelte:head>
  <title>Interfaces - API Builder</title>
</svelte:head>

<div>
  <h1 class="text-ab-dark-blue mb-4 text-2xl font-bold">Interfaces</h1>

  <p class="text-ab-dark-blue mb-8 text-lg leading-relaxed">
    Interfaces let you share fields across models and union types. Define common fields once, then enforce consistency everywhere they're
    used — API Builder validates that extending models match the interface by name, type, and required status.
  </p>

  <!-- Define -->
  <div class="card mb-6">
    <h2 class="text-ab-blue mb-3 flex items-center gap-2 text-lg font-semibold">
      <span class="bg-ab-blue inline-flex h-7 w-7 items-center justify-center rounded-full text-xs text-white">1</span>
      Define an Interface
    </h2>
    <p class="text-ab-dark-blue mb-3">
      Declare shared fields in the <strong>interfaces</strong> section. Interfaces are abstract — they cannot be instantiated directly.
    </p>
    <pre class="mb-4 overflow-x-auto rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm"><code
        >{@html `"interfaces": {
  "person": {
    "fields": [
      { "name": "email", "type": "string", "required": false },
      { "name": "name", "type": "string", "required": false }
    ]
  }
}`}</code
      ></pre>
    <p class="text-ab-dark-blue text-sm">A Scala generator produces:</p>
    <pre class="overflow-x-auto rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm"><code
        >{@html `sealed trait Person {
  def email: Option[String]
  def name: Option[String]
}`}</code
      ></pre>
  </div>

  <!-- Extend -->
  <div class="card mb-6">
    <h2 class="text-ab-blue mb-3 flex items-center gap-2 text-lg font-semibold">
      <span class="bg-ab-blue inline-flex h-7 w-7 items-center justify-center rounded-full text-xs text-white">2</span>
      Extend from a Model
    </h2>
    <p class="text-ab-dark-blue mb-3">
      List interface names in a model's <strong>interfaces</strong> array. The model must include all interface fields with matching name, type,
      and required status.
    </p>
    <pre class="mb-4 overflow-x-auto rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm"><code
        >{@html `"models": {
  "guest": {
    "interfaces": ["person"],
    "fields": [
      { "name": "session_id", "type": "string" },
      { "name": "email", "type": "string", "required": false },
      { "name": "name", "type": "string", "required": false }
    ]
  }
}`}</code
      ></pre>
    <p class="text-ab-dark-blue text-sm">Generated Scala:</p>
    <pre class="overflow-x-auto rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm"><code
        >case class Guest(
  sessionId: String,
  override val email: Option[String] = None,
  override val name: Option[String] = None
) extends Person</code
      ></pre>
  </div>

  <!-- Union Types -->
  <div class="card mb-6">
    <h2 class="text-ab-blue mb-3 flex items-center gap-2 text-lg font-semibold">
      <span class="bg-ab-blue inline-flex h-7 w-7 items-center justify-center rounded-full text-xs text-white">3</span>
      Use with Union Types
    </h2>
    <p class="text-ab-dark-blue mb-3">
      Union types can also implement interfaces. When a union declares an interface, every type in the union automatically inherits it — no
      need to repeat the interface on each member.
    </p>
    <pre class="mb-4 overflow-x-auto rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm"><code
        >{@html `"unions": {
  "person": {
    "discriminator": "discriminator",
    "interfaces": ["person"],
    "types": [
      { "type": "guest" }
    ]
  }
}`}</code
      ></pre>
    <p class="text-ab-dark-blue text-sm">
      The <strong>guest</strong> model automatically inherits the <strong>person</strong> interface through the union — no explicit declaration
      needed on the model.
    </p>
  </div>

  <!-- Key Rules -->
  <div class="card mb-6">
    <h2 class="text-ab-blue mb-3 flex items-center gap-2 text-lg font-semibold">
      <span class="bg-ab-blue inline-flex h-7 w-7 items-center justify-center rounded-full text-xs text-white">!</span>
      Key Rules
    </h2>
    <ul class="text-ab-dark-blue ml-2 space-y-2">
      <li><strong>Validation</strong> — Fields must match by name, type, and required status</li>
      <li><strong>Multiple interfaces</strong> — Models can extend zero or more interfaces</li>
      <li><strong>Union shortcut</strong> — A union and interface can share the same name if the union explicitly lists the interface</li>
    </ul>
  </div>

  <!-- Resources -->
  <div class="card mb-6">
    <h2 class="text-ab-dark-blue mb-3 text-lg font-semibold">Resources</h2>
    <ul class="text-ab-dark-blue ml-2 space-y-2">
      <li>
        <a
          href="https://github.com/apicollective/apibuilder/blob/main/examples/example-interface.json"
          class="text-ab-blue hover:text-ab-dark-blue underline">Complete interface example</a
        >
        — Full api.json demonstrating all interface features
      </li>
      <li>
        <a href="/doc/apiJson" class="text-ab-blue hover:text-ab-dark-blue underline">api.json specification</a>
        — Full format reference
      </li>
    </ul>
  </div>

  <!-- CTA -->
  <div class="mt-12 mb-8 text-center">
    <p class="text-ab-dark-blue mb-4">Ready to define shared types?</p>
    <a href="/doc/apiJson" class="btn-primary inline-block">View api.json Format</a>
  </div>
</div>
