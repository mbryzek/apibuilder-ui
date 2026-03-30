---
name: apibuilder
description: Full lifecycle API development — spec authoring, validation, code generation, compiler verification, and testing using API Builder
---

# API Builder: AI Agent Skill

You are an AI agent building REST APIs. API Builder is your toolkit for defining APIs in a structured spec, generating type-safe code, and using the compiler to verify correctness.

## When to Use This Skill

Activate when:
- Building a new REST API from requirements
- Adding endpoints to an existing API
- Generating client libraries, server stubs, or test mocks
- The project has a `.api/config` file or `spec/*.json` files

## Prerequisites

1. The `api` CLI must be on your `$PATH`. Install from https://github.com/apicollective/apibuilder-cli or your project's devops tooling.
2. Config exists at `~/.apibuilder/config` with a valid token
3. If no config exists, run `api init` to create an anonymous org and token

## Core Workflow

### 1. Write the Spec

Create an `api.json` file in the `spec/` directory. Use this structure:

```json
{
  "name": "my-service",
  "namespace": "com.example.myservice.v0",
  "imports": [],
  "enums": {},
  "models": {
    "user": {
      "fields": [
        { "name": "id", "type": "string" },
        { "name": "email", "type": "string" },
        { "name": "name", "type": "string", "required": false }
      ]
    },
    "user_form": {
      "fields": [
        { "name": "email", "type": "string" },
        { "name": "name", "type": "string", "required": false }
      ]
    }
  },
  "resources": {
    "user": {
      "operations": [
        {
          "method": "GET",
          "path": "/users",
          "parameters": [
            { "name": "limit", "type": "integer", "default": 25, "required": true },
            { "name": "offset", "type": "integer", "default": 0, "required": true }
          ],
          "responses": {
            "200": { "type": "[user]" }
          }
        },
        {
          "method": "GET",
          "path": "/users/:id",
          "responses": {
            "200": { "type": "user" },
            "404": { "type": "unit" }
          }
        },
        {
          "method": "POST",
          "body": { "type": "user_form" },
          "responses": {
            "201": { "type": "user" },
            "422": { "type": "[com.bryzek.platform.error.v0.models.validation_error]" }
          }
        }
      ]
    }
  }
}
```

### Key Rules for Specs

- **Namespace**: Always define a namespace (e.g., `com.example.service.v0`)
- **Resources**: Resource names must match a locally defined model or enum
- **Arrays**: Use `[type]` syntax (e.g., `[user]` for an array of users)
- **Forms**: Create `_form` models for POST/PUT request bodies
- **References**: Models ending in `_reference` must contain ONLY `{ "name": "id", "type": "string" }`
- **Parameters with defaults**: Must have `"required": true`
- **Imports**: Use `{ "uri": "https://app.apibuilder.io/org/app/latest/service.json" }`
- **No `$ref` or `oneOf`**: api.json is flat JSON, not OpenAPI

### Available Types

Primitives: `string`, `integer`, `long`, `double`, `decimal`, `boolean`, `uuid`, `date-iso8601`, `date-time-iso8601`, `unit`, `object`, `json`

### 2. Validate

```bash
api validate spec/my-service.json
```

Fix any errors and re-validate until clean.

### 3. Upload and Generate Code

```bash
api
```

This auto-detects operations: uploads specs if they exist locally, then generates code. The tool reads `.api/config` for generator mappings.

For specific apps only:
```bash
api --app my-service
```

### 4. Compile and Verify

**This is the critical step.** Compile the generated code plus your implementation:

```bash
# Scala
sbt compile

# TypeScript
tsc --noEmit
```

If it compiles, your implementation matches the spec. If not, the compiler errors tell you exactly what's wrong — missing methods, wrong types, incorrect signatures. Fix your implementation code (not the generated code) and recompile.

### 5. Write Tests Using Generated Mocks

Generated mock clients share the same interface as real clients. Use them for testing:

```scala
// The mock client is generated — use it directly
val mockClient = new MockClient()

// Override specific behavior for your test
val service = new MyService(mockClient)
val result = service.processUser(userForm)
assert(result.email == userForm.email)
```

### 6. Iterate

If tests fail, fix your implementation and re-run. The spec is the source of truth. Generated code is trusted. You implement against the spec, not around it.

## Available Code Generators

### Recommended for AI Agents (strongest compiler verification)

| Generator | Key | Output |
|-----------|-----|--------|
| Play 2.9 / Scala 3 Client | `bryzek_play_client` | Type-safe HTTP client with models and JSON serialization |
| Play 2.9 / Scala 3 Model | `bryzek_play_model` | Standalone models with JSON serialization |
| Play 2.9 / Scala 3 Controller | `bryzek_play_controller` | Abstract controller traits — implement each method |
| Play 2.9 / Scala 3 Mock Client | `bryzek_play_mock_client` | Mock client sharing real client interface |
| Play 2.9 / Scala 3 Routes | `bryzek_play_routes` | Play routes file |
| TypeScript Declarations | `ts_declarations` | TypeScript type definitions |
| TypeScript SDK | `ts_sdk` | Full TypeScript client |

### Additional Generators

| Generator | Key |
|-----------|-----|
| Http4s 0.23 Client | `http4s_0_23` |
| Scala Models | `scala_models` |
| Anorm Parsers | `anorm_2_9_scala_3_parsers` |
| Go Client | `go_1_5_client` |
| Java Spring WebClient | `java_spring_webclient_client` |
| Elm v2 | `elm_v2` |
| PostgreSQL DDL | `psql_ddl` |
| OpenAPI 3 | `openapi_3` |
| JSON Schema | `json_schema` |

## .api/config Format

Create `.api/config` in the project root to map generators to output directories:

```yaml
my-org:
  - generators:
      bryzek_play_controller: generated/app/apibuilder
      bryzek_play_client: generated/app/apibuilder
      bryzek_play_mock_client: generated/test/apibuilder
      bryzek_play_routes: api/conf
    applications:
      my-service:
```

## Using Spec Data for UX Planning

The spec explicitly defines every data shape. Use it as input for UX planning:
- Read `models` to understand what data exists and its types
- Read `resources` and `operations` to understand available actions
- Read `enums` to understand constrained value sets
- Union types show every valid state a value can be in

This makes the spec the single source of truth for both API implementation AND frontend design.

## Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `Resource type[X] not found` | Resource name doesn't match a local model/enum | Ensure the resource key matches a defined model |
| `Unrecognized element[type]` | Extra `"type"` field in resource definition | Remove the `"type"` field from resources |
| Type mismatch on compile | Implementation doesn't match generated interface | Read the compiler error — it tells you the expected type |
