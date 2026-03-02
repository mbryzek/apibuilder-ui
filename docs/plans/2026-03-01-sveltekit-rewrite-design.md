# API Builder UI — SvelteKit Rewrite Design

## Context

API Builder's UI is currently a Scala Play Framework app (Bootstrap 3, jQuery, Twirl templates). We're rewriting it as a modern SvelteKit application for better developer experience, maintainability, and performance. The complete sitemap of the existing app is documented in `SITEMAP.md`.

## Stack

- **SvelteKit** with Svelte 5 runes (`$props()`, `$state()`, `$derived()`, `$effect()`)
- **TypeScript** strict mode
- **Tailwind CSS** + `@tailwindcss/forms`
- **`marked`** for Markdown rendering
- **Cloudflare adapter** for deployment
- **SSR-first** with form actions, selective client interactivity

## Architecture

### API Communication
All API calls happen server-side in `+page.server.ts` load functions and form actions. The browser never talks directly to `api.apibuilder.io`.

- Auth: `Authorization: Session <session_id>` header on every API call
- Session stored in httpOnly cookie (`session_id`), 1-year expiry, secure in production
- `hooks.server.ts` validates session on every request → `event.locals.session`

### Project Structure
```
src/
  app.html, app.css, app.d.ts
  hooks.server.ts              # Session validation, security headers
  lib/
    server/
      api.ts                   # All API client functions (server-only)
      auth.ts                  # requireAuth(), requireAuthForAction()
    components/                # Reusable Svelte 5 components
      spec/                    # API spec viewer components
    utils/                     # Client-safe utilities (type-resolver, url, markdown)
    config.ts                  # Environment config
    types.ts                   # TypeScript types for the API
  routes/                      # File-based routing
```

## Routing

### Public Pages
```
/                                         Home/dashboard
/login                                    GitHub OAuth + email/password
/login/dev                                Dev login shortcut
/login/forgot-password                    Forgot password
/login/reset-password/[token]             Reset password
/login/github/callback                    OAuth callback
/logout                                   Clear session
/logged-out                               Confirmation page
/doc                                      Doc index
/doc/[slug]                               Doc sub-pages
/search                                   Global search
/history                                  Change history
/generators                               List generators
/generators/[key]                         Generator detail
/generators/create                        Add generator service
/generators/services/[guid]               Generator service detail
/attributes                               List global attributes
/attributes/[name]                        Attribute detail
/attributes/create                        Create attribute
/tokens                                   API tokens list
/tokens/[guid]                            Token detail
/tokens/create                            Create token
/account/profile                          Edit profile
/email-verifications/[token]              Confirm email
/_internal/healthcheck                    Health check
```

### Organization Pages (layout: `[orgKey]/+layout.server.ts`)
```
/[orgKey]                                 Org home — app list
/[orgKey]/details                         Org details/edit/delete
/[orgKey]/members                         Member management
/[orgKey]/membership-requests             Pending requests
/[orgKey]/memberships/request             Request to join
/[orgKey]/domains                         Domain management
/[orgKey]/subscriptions                   Email subscriptions
/[orgKey]/attributes                      Org attribute values
/[orgKey]/upload                          Upload API spec
```

### Application/Version Pages
```
/[orgKey]/[appKey]                        Redirect → latest
/[orgKey]/[appKey]/[version]              Version detail (API doc viewer)
/[orgKey]/[appKey]/[version]/settings     App settings
/[orgKey]/[appKey]/[version]/original     Download original spec
/[orgKey]/[appKey]/[version]/service.json Download service.json
/[orgKey]/[appKey]/[version]/example/[typeName]  Example JSON
/[orgKey]/[appKey]/[version]/[generatorKey]      Generated code viewer
```

### Shared Layouts
- **Root layout:** Header + Footer + flash toast
- **`[orgKey]/+layout`:** Loads org, checks membership, provides sidebar context
- **`/doc/+layout`:** Doc sidebar navigation

## Components

### Layout
- `Header.svelte` — Responsive navbar: logo, Docs, search box, user dropdown
- `Footer.svelte` — Links footer
- `OrgSidebar.svelte` — Org context sidebar (details, members, domains, subscriptions, attributes) + service sidebar (settings, downloads, spec anchors, generator clients)
- `DocSidebar.svelte` — Doc page navigation
- `Toast.svelte` — Flash notifications

### Shared UI
- `Pagination.svelte` — Offset-based Previous/Next
- `SearchInput.svelte` — Reusable search box
- `LoadingSpinner.svelte` — Loading indicator
- `ConfirmDelete.svelte` — Destructive action confirmation
- `MarkdownContent.svelte` — Renders Markdown via `marked`
- `VisibilityIcon.svelte` — Globe/people/person icons

### Spec Viewer (core of the app)
- `SpecTabs.svelte` — Tabbed view with counts: Resources, Models, Enums, Unions, Interfaces, Headers, Imports, Annotations
- `ResourceList.svelte` — Resources with expandable operations
- `OperationDetail.svelte` — Operation accordion (method, path, body, params, responses)
- `ModelList.svelte` — Models with fields tables
- `EnumList.svelte` — Enums with values tables
- `UnionList.svelte` — Unions with types and discriminator info
- `InterfaceList.svelte` — Interfaces with fields
- `FieldsTable.svelte` — Reusable fields table
- `ParametersTable.svelte` — Operation parameters
- `ResponsesTable.svelte` — HTTP responses (color-coded)
- `TypeLink.svelte` — Resolves type names to clickable links
- `DeprecationBadge.svelte` — Yellow deprecated badge

## Implementation Phases

### Phase 1 — Foundation & Auth
Scaffold project, types, API client, auth flow, root layout with Header/Footer.
Pages: home, login (GitHub + email), logout, dev login, account profile.
**Result:** Can log in and see orgs.

### Phase 2 — Organizations
Org layout with sidebar, org home (app list), org details/edit/delete, create org, membership request.
**Result:** Full org management.

### Phase 3 — Version Detail (Core)
The API documentation viewer — most complex page. Version show with SpecTabs, all spec components, version dropdown, download links.
**Result:** Can browse API documentation.

### Phase 4 — Application Management
Upload new version, app settings (visibility, move, delete), delete version, watch/unwatch.
**Result:** Full application lifecycle.

### Phase 5 — Code Generation
Generated code viewer, file list, zip/tarball downloads.
**Result:** Can generate and download code.

### Phase 6 — Org Settings
Members, domains, subscriptions, org attributes, membership requests.
**Result:** Full org administration.

### Phase 7 — Global Features
Generators, global attributes, tokens, search, history, email verification.
**Result:** All global pages.

### Phase 8 — Documentation
All 15 doc pages with doc sidebar layout.
**Result:** Complete documentation section.

### Phase 9 — Polish
Search in navbar, healthcheck, Markdown rendering, responsive design, error handling.

## Key Patterns

- **Svelte 5 runes only** — no legacy `$:` syntax
- **Form actions** for all mutations with `use:enhance`
- **Flash messages** via URL params, displayed as Toast, cleaned from URL
- **Mobile-first** Tailwind with `md:` / `lg:` breakpoints
- **Security headers** in hooks.server.ts (X-Frame-Options, CSP, HSTS, etc.)
- **Type-safe API client** with discriminated union responses
