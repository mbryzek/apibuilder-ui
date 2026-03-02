# API Builder UI - Complete Sitemap & Functionality Reference

**Purpose:** Complete inventory of the existing Play Framework UI (`app/` subproject) for SvelteKit rewrite.
**Source:** `/Users/mbryzek/code/apicollective/apibuilder/app/`
**Tech Stack:** Scala Play Framework, Bootstrap 3, jQuery 3.2.1, Twirl templates (.scala.html)

---

## Navigation Structure

### Top Navbar (all pages)
- **Logo** → `/` (home)
- **Docs** → `/doc/`
- **GitHub** → external link to GitHub repo
- **Search box** → submits to `/search` (pre-fills `org` filter when on an org page)
- **When logged out:** "Login/Register" → `/login/?return_url=<current>`
- **When logged in (dropdown under nickname):**
  - Generators → `/generators/`
  - Attributes → `/attributes/`
  - Account → `/account/`
  - Tokens → `/tokens/`
  - Logout → `/logout`

### Left Sidebar (org context pages)
- Org name → `/:orgKey`
- Subscriptions → `/:orgKey/subscriptions/`
- Org Details → `/:orgKey/details` (members only)
- Org Attributes → `/:orgKey/attributes/` (members only, settings visible)
- Org Domains → `/:orgKey/domains` (members only, settings visible)
- Org Members → `/:orgKey/members` (members only, settings visible)

### Left Sidebar (application/version context pages, in addition to above)
- Service name → `/:orgKey/:applicationKey/latest`
- Settings → `/:orgKey/:applicationKey/:version/settings` (members only)
- Original (format label) → `/:orgKey/:applicationKey/:version/original`
- service.json → `/:orgKey/:applicationKey/:version/service.json`
- **Anchor links:** Resources, Enums, Interfaces, Models, Unions, Annotations
- **Clients section:** one link per generator → `/:orgKey/:applicationKey/:version/:generatorKey`
- **Version dropdown** (top-right of main content): all version numbers + History link

### Doc Sidebar (doc pages only)
- Introduction, Why API Builder?, Getting Started, api.json format, Types, Examples, Code Generators, API Tokens, History, Release Notes

---

## Pages & Functionality

### 1. Home / Dashboard
**Route:** `GET /`
**Auth:** Public (different view for logged-in users)

| Element | Functionality |
|---------|---------------|
| "New to API Builder?" panel | Shown to logged-out users. "Start Here" → docs |
| "Add organization" link | Top-right, logged-in users only → `/org/create` |
| Your Organizations table | List of user's orgs, each linked to `/:orgKey` |
| Pending Membership Requests table | Shows pending requests for current user |
| Public Organizations table | Paginated list of all public orgs |

---

### 2. Authentication

#### 2a. Login Page
**Route:** `GET /login/`
**Auth:** Public

| Element | Functionality |
|---------|---------------|
| "Sign in with GitHub" button | OAuth flow → `/login/github/` |
| "Legacy Sign in" link | → `/login/legacy` |

#### 2b. Dev Login
**Route:** `GET /login/dev`
**Auth:** Public (dev mode only)
- Auto-logs in as dev user, sets session cookie, redirects to `/`

#### 2c. Legacy Login
**Route:** `GET /login/legacy` (view), `POST /login/legacy` (submit)
**Auth:** Public

| Element | Functionality |
|---------|---------------|
| Deprecation notice | "New users should register via GitHub" |
| Email field | Text input |
| Password field | Password input |
| Login button | Submits credentials |
| "Forgot Password" link | → `/login/forgotPassword` |
| Hidden `return_url` field | Preserves return destination |

#### 2d. Forgot Password
**Route:** `GET /login/forgotPassword` (view), `POST /login/forgotPassword` (submit)
**Auth:** Public

| Element | Functionality |
|---------|---------------|
| Email field | Text input |
| "Send Email to Reset Password" button | Triggers reset email |
| Confirmation page | Shows "if account exists, email was sent" |

#### 2e. Reset Password
**Route:** `GET /login/resetPassword/:token` (view), `POST /login/resetPassword/:token` (submit)
**Auth:** Public (token-gated)

| Element | Functionality |
|---------|---------------|
| Password field | Min 5 chars |
| Verify Password field | Must match |
| "Reset Password" button | Submits new password |
| "Go to login form" link | Back to login |

#### 2f. GitHub OAuth
**Routes:** `GET /login/github/` (redirect to GitHub), `GET /login/github/callback` (callback)
- Redirects to GitHub OAuth URL
- Callback exchanges code for access token, authenticates user, sets session

#### 2g. Logout
**Route:** `GET /logout`
- Clears session cookie, redirects to `/logged_out`

**Route:** `GET /logged_out`
- Shows "You are now logged out" + "Log back in" link

---

### 3. Account / Profile

#### 3a. View Profile
**Route:** `GET /account/profile/`
**Auth:** Login required

| Element | Functionality |
|---------|---------------|
| Email display | Current email |
| Nickname display | Current nickname |
| Name display | Current name |
| "Edit" link | Top-right → `/account/profile/edit` |

#### 3b. Edit Profile
**Route:** `GET /account/profile/edit` (view), `POST /account/profile/postEdit` (submit)
**Auth:** Login required

| Element | Functionality |
|---------|---------------|
| Email field | Text input |
| Nickname field | Text input |
| Name field | Text input |
| Save button | Submits changes |
| Cancel link | Back to profile view |

---

### 4. Organizations

#### 4a. Create Organization
**Route:** `GET /org/create` (view), `POST /org/createPost` (submit)
**Auth:** Login required

| Element | Functionality |
|---------|---------------|
| Organization Name field | Text input |
| Key field | Optional, auto-generated from name |
| Visibility select | All visibility options |
| Namespace field | Text input |
| Submit button | Creates org |
| Cancel button | Back |

#### 4b. Organization Home (Application List)
**Route:** `GET /:orgKey`
**Auth:** Public

| Element | Functionality |
|---------|---------------|
| "Add application" link | Top-right, org members only → `/:orgKey/version/create` |
| "Join this org" link | Non-members only → `/:orgKey/memberships/request` |
| "Review pending membership requests" notice | Shown to admins with pending requests |
| Applications table | Sortable: Name, Description, Visibility icon, Created At, Updated At |
| Sort controls | Sort by Name/Visibility/CreatedAt/UpdatedAt, ascending/descending |
| Visibility icons | Globe (public), people (org), person (user) |
| Paginator | Previous/Next |

#### 4c. Organization Details
**Route:** `GET /:orgKey/details`
**Auth:** Login + org member

| Element | Functionality |
|---------|---------------|
| Name display | Org name |
| Key display | Org key |
| Namespace display | Org namespace |
| Visibility display | Current visibility |
| "Edit" link | Top-right → `/org/edit?org_key=...` |
| "Delete" link | Confirmation dialog, shown only if `canDeleteOrganization` |
| "Review pending membership requests" link | Shown to admins if pending requests exist |

#### 4d. Edit Organization
**Route:** `GET /org/edit?org_key=X` (view), `POST /org/editPost?org_key=X` (submit)
**Auth:** Login required
- Same form fields as Create (name, key, visibility, namespace)

#### 4e. Delete Organization
**Route:** `POST /org/deletePost?org_key=X`
**Auth:** Login required
- Redirects to home with flash "Org deleted"

#### 4f. Request Membership
**Route:** `GET /:orgKey/memberships/request` (view), `POST /:orgKey/memberships/request` (submit)
**Auth:** Login required

| Element | Functionality |
|---------|---------------|
| Already a member message | If user is already a member |
| Pending request notice | If request already submitted, shows admin emails |
| "Request Membership" button | Submits join request |

#### 4g. Pending Membership Requests
**Route:** `GET /:orgKey/membership_requests`
**Auth:** Login + org admin

| Element | Functionality |
|---------|---------------|
| Requests table | Accept button, Decline button, role, user name, user email |
| Accept button | POST to `/:orgKey/membership_request_reviews/accept` |
| Decline button | POST to `/:orgKey/membership_request_reviews/decline` |
| Paginator | Previous/Next |

---

### 5. Organization Settings

#### 5a. Domains
**Route:** `GET /:orgKey/domains`
**Auth:** Login + org member

| Element | Functionality |
|---------|---------------|
| Domain auto-signup explanation | Help text about feature |
| "Add domain" link | Top-right → `/:orgKey/domains/create` |
| Domain list | Each with "Remove" link (admin-only, confirmation dialog) |

**Add Domain:** `GET /:orgKey/domains/create` (view), `POST /:orgKey/domains/postCreate` (submit)
- Single field: Domain name (text)

#### 5b. Members
**Route:** `GET /:orgKey/members`
**Auth:** Login + org member

| Element | Functionality |
|---------|---------------|
| "Add member" link | Top-right, admin only → `/:orgKey/members/add` |
| "Download" link | CSV export, admin only |
| Pending requests link | Admin only |
| Members table | Email, Nickname, Name, Role |
| Make Admin button | Admin only, POST form |
| Revoke Admin button | Admin only, POST form |
| Remove button | Admin only, confirmation dialog |
| Paginator | Previous/Next |

**Add Member:** `GET /:orgKey/members/add` (view), `POST /:orgKey/members/addPost` (submit)

| Element | Functionality |
|---------|---------------|
| Email field | Find user by email |
| Or Nickname field | Find user by nickname |
| Role select | All MembershipRole values |
| Submit button | Adds member (auto-accepts request) |

#### 5c. Organization Attributes
**Route:** `GET /:orgKey/attributes/`
**Auth:** Login + org member

| Element | Functionality |
|---------|---------------|
| Set attributes table | Edit link, attribute name (linked to global detail), current value |
| Available attributes table | Edit link for attributes not yet set |

**Edit Attribute Value:** `GET /:orgKey/attributes/:name/edit` (view), `POST /:orgKey/attributes/:name/editPost` (submit)
- Single field: Value (text, empty = delete)
- Attribute description shown below form

#### 5d. Subscriptions
**Route:** `GET /:orgKey/subscriptions/`
**Auth:** Login + org member

| Element | Functionality |
|---------|---------------|
| Subscriptions table | Subscribed/Not subscribed status, "Toggle" link, Publication label |
| Publications shown | Admins: MembershipRequestsCreate, MembershipsCreate. All: ApplicationsCreate, VersionsCreate, VersionsMaterialChange |

---

### 6. Applications & Versions

#### 6a. Upload New Version
**Route:** `GET /:orgKey/version/create` (view), `POST /:orgKey/version/createPost` (submit, multipart)
**Auth:** Login + org member

| Element | Functionality |
|---------|---------------|
| Example api.json links | Shown for first version only |
| Version field | Text, defaults to `0.0.1-dev` (new) or auto-incremented |
| Visibility select | All visibility options |
| File upload | Required, the API spec file |
| Type select | Auto-detect, Avro IDL, api.json, service.json, Swagger |
| Submit button | Uploads and creates/updates version |
| Cancel button | Back |
| "Delete this application" link | Shown if first version and user is admin |

#### 6b. Version Detail (Main API Docs View)
**Route:** `GET /:orgKey/:applicationKey/:version`
**Auth:** Public

This is the primary API documentation page. It displays the full service specification.

| Element | Functionality |
|---------|---------------|
| "Upload new version" link | Top-right, members only |
| "Delete this version" link | Confirmation dialog |
| History link | → `/history?org=...&app=...` |
| Watch/Unwatch toggle | POST form for logged-in users |
| Service description | Markdown rendered |
| Contact info | If present in service spec |
| License info | If present in service spec |
| **Resources section** | |
| Resource blocks | One per resource, type name linked to model |
| Operations table | Method, Path, Description, Deprecation |
| Operation detail (expandable) | Full URL, Body, Parameters table, Responses table |
| Parameters table | Name, Type (linked), Location, Required?, Default, Description (min/max/example/deprecation) |
| Responses table | HTTP code, Type, Description, Deprecation, Response headers |
| **Headers section** | Name, Type, Required?, Default, Description |
| **Imports section** | One row per import URI, linked to service |
| **Enums section** | |
| Enum blocks | One per enum, with description, deprecation, interfaces |
| Values table | Name, Value, Description (Markdown) |
| **Interfaces section** | |
| Interface blocks | One per interface, with description, deprecation |
| Fields table | Field, Type (linked), Required?, Default, Description (min/max/example/deprecation), Annotations |
| **Models section** | |
| Model blocks | One per model, with description, deprecation, interfaces |
| Fields table | Same columns as interfaces |
| **Unions section** | |
| Union blocks | One per union, discriminator info, description, deprecation, interfaces |
| Union types table | Type, Discriminator Value, Example Json (Minimal/Full links), Description, Deprecation |
| Union fields table | Same as model fields (if union has fields) |
| **Annotations section** | |
| Annotation blocks | One per annotation, deprecation notice |

#### 6c. Application Settings
**Route:** `GET /:orgKey/:applicationKey/:version/settings`
**Auth:** Login + org member

| Element | Functionality |
|---------|---------------|
| "Edit" link | Top-right, members only → edit form |
| Visibility display | Current visibility |
| "Move to new organization" link | Admin only → move form |
| "Delete this application" link | Admin only, confirmation dialog |

**Edit Settings:** `GET /:orgKey/:applicationKey/:version/settings/edit` (view), `POST .../postEdit` (submit)
- Single field: Visibility (select)

**Move Application:** `GET /:orgKey/:applicationKey/settings/move` (view), `POST .../postMove` (submit)
- Single field: New Organization Key (text)

**Delete Application:** `POST /:orgKey/:applicationKey/settings/postDelete`
- Redirects to org page

#### 6d. Download Original Spec
**Route:** `GET /:orgKey/:applicationKey/:version/original`
**Auth:** Public
- Returns raw uploaded file content
- Content-Type: `application/json` (ApiJson, Swagger, ServiceJson) or `text/plain` (AvroIdl)

#### 6e. Download service.json
**Route:** `GET /:orgKey/:applicationKey/:version/service.json`
**Auth:** Public
- Returns normalized API spec as JSON

#### 6f. Example JSON
**Route:** `GET /:orgKey/:applicationKey/:version/example/:typeName`
**Auth:** Public
- Query params: `subTypeName` (optional), `optionalFields` (optional boolean)
- Returns example JSON for a given type

#### 6g. Delete Version
**Route:** `POST /:orgKey/:applicationKey/:version/postDelete`
- Redirects to latest version

---

### 7. Code Generation

#### 7a. View Generated Code
**Route:** `GET /:orgKey/:applicationKey/:version/:generatorKey`
**Auth:** Public

| Element | Functionality |
|---------|---------------|
| "Download (.zip)" link | Top-right → .zip download |
| "Download (.tar.gz)" link | Top-right → .tar.gz download |
| Files table | File name (linked to raw download), file size |

#### 7b. Download Files
- **ZIP:** `GET /:orgKey/:applicationKey/:version/:generatorKey/:fileName.zip`
- **Tarball:** `GET /:orgKey/:applicationKey/:version/:generatorKey/:fileName.tar.gz`
- **Single file:** `GET /:orgKey/:applicationKey/:version/:generatorKey/:fileName`

---

### 8. Generators

#### 8a. List All Generators
**Route:** `GET /generators/`
**Auth:** Public

| Element | Functionality |
|---------|---------------|
| "Add generator" link | Top-right, login required → `/generators/create` |
| Generators table | Service (linked), Key (linked to detail), Name, Language, Attributes (linked), Description |
| Paginator | Previous/Next |

#### 8b. Generator Detail
**Route:** `GET /generators/show/:key`
**Auth:** Public

| Element | Functionality |
|---------|---------------|
| Service URI | Linked to service detail page |
| Key | Generator key |
| Name | Display name |
| Language | Target language |
| Attributes | Linked to attribute detail pages |
| Description | Markdown rendered in blockquote |

#### 8c. Add Generator Service
**Route:** `GET /generators/create` (view), `POST /generators/createPost` (submit)
**Auth:** Login required

| Element | Functionality |
|---------|---------------|
| Service URI field | Text input with help text |
| Submit button | Registers generator service |
| Cancel button | Back |

#### 8d. Generator Service Detail
**Route:** `GET /generators/services/:guid/show`
**Auth:** Public

| Element | Functionality |
|---------|---------------|
| Service URI display | |
| "Delete" link | Confirmation dialog, if `canDeleteGeneratorService` |
| Generators table | List of generators provided by this service |
| Paginator | Previous/Next |

---

### 9. Global Attributes

#### 9a. List All Attributes
**Route:** `GET /attributes/`
**Auth:** Public

| Element | Functionality |
|---------|---------------|
| "Add attribute" link | Top-right, login required → `/attributes/create` |
| Attributes table | Name (linked to detail), Description (truncated) |
| Paginator | Previous/Next |

#### 9b. Attribute Detail
**Route:** `GET /attributes/:name`
**Auth:** Public

| Element | Functionality |
|---------|---------------|
| "Delete" link | Confirmation dialog, if `canEditAttribute` |
| Description | Markdown rendered |
| "Code Generators Using this Attribute" section | Generator list using this attribute |
| Paginator | For generators list |

#### 9c. Create Attribute
**Route:** `GET /attributes/create` (view), `POST /attributes/createPost` (submit)
**Auth:** Login required

| Element | Functionality |
|---------|---------------|
| Attribute Name field | Text, "URL friendly, globally unique" |
| Description field | Textarea (50 cols x 5 rows) |
| Submit button | Creates attribute |
| Cancel button | Back |

---

### 10. API Tokens

#### 10a. List Tokens
**Route:** `GET /tokens/`
**Auth:** Login required

| Element | Functionality |
|---------|---------------|
| "Create new token" link | Top-right → `/tokens/create` |
| Tokens table | Created date, masked token (linked to detail), Description (Markdown) |
| Token documentation link | Help text |
| Paginator | Previous/Next |

#### 10b. Token Detail
**Route:** `GET /tokens/show/:guid`
**Auth:** Login required

| Element | Functionality |
|---------|---------------|
| Masked token display | With "Show full token" link → cleartext page |
| Description | |
| Created date | |
| "Delete" link | Confirmation dialog |

#### 10c. Token Cleartext
**Route:** `GET /tokens/cleartext/:guid`
**Auth:** Login required
- Displays raw cleartext token value
- "Back" link to token detail

#### 10d. Create Token
**Route:** `GET /tokens/create` (view), `POST /tokens/postCreate` (submit)
**Auth:** Login required

| Element | Functionality |
|---------|---------------|
| Description field | Optional text input |
| Submit button | Creates token |
| Cancel button | Back |

---

### 11. Search
**Route:** `GET /search`
**Auth:** Public

| Element | Functionality |
|---------|---------------|
| Query from navbar search box | `q` parameter |
| Org filter | `org` parameter (hidden, pre-filled from context) |
| Results table | Label (linked), Description |
| Paginator | Previous/Next |

---

### 12. History
**Route:** `GET /history`
**Auth:** Public

| Element | Functionality |
|---------|---------------|
| Breadcrumb | Shows org/app context with "All" link |
| Version range display | Optional from/to range |
| Filters | `org`, `app`, `from` (date), `to` (date), `typ` (change type) via query params |
| Changes table | Date, Changed By (nickname), Org/App/Version (linked), Diff description |
| Paginator | Previous/Next |

---

### 13. Documentation Pages

All doc pages are public and use a dedicated layout with doc sidebar navigation.

| Route | Title | Content |
|-------|-------|---------|
| `GET /doc/` | Introduction | Welcome panels: api.json format, convention over config, native clients with code examples. "Getting Started" button |
| `GET /doc/why` | Why API Builder? | Bulleted reasons: quality clients, resource-centric, simple spec, great validation, integrated tooling, etc. |
| `GET /doc/start` | Getting Started | 7-step guide: create org, create service, view docs, download client, explore settings, use CLI, get involved |
| `GET /doc/apiJson` | api.json format | Full specification reference: service, info, contact, license, apidoc, interface, model, field, resource, operation, body, parameter, enum, enumValue, union, unionType, import, header, response, template_declaration, attribute, deprecation, annotation, templates |
| `GET /doc/types` | Types | Dynamically generated list of all primitive types with descriptions and examples |
| `GET /doc/examples` | Examples | Table of example services: online docs + api.json links |
| `GET /doc/generators` | Code Generators | Generator principles, links to available generators, Play 2.x notes, Ning client notes |
| `GET /doc/apiTokens` | API Tokens | REST API usage with curl examples, authentication via tokens |
| `GET /doc/history` | History | Project origin story (from Gilt), why apibuilder was built |
| `GET /doc/releaseNotes` | Release Notes | Chronological changelog |
| `GET /doc/interfaces` | Interfaces | Semantics, declaration, model extension, union type behavior |
| `GET /doc/attributes` | Attributes | How attributes work for generators, org-level cascading |
| `GET /doc/templates` | Templates | Experimental templates feature with examples |
| `GET /doc/playRoutesFile` | Play Routes | Generated routes file usage, Bindables, enums in routes, build.sbt |
| `GET /doc/playUnionTypes` | Play Union Types | Serialization format with/without discriminator, JSON examples |

---

### 14. Email Verification
**Route:** `GET /email-verifications/:token`
**Auth:** Public
- Confirms email verification token
- Redirects to `/` with flash "Email confirmed" or warning

---

### 15. Health Check
**Route:** `GET /_internal_/healthcheck`
**Auth:** Public
- Verifies API is reachable
- Returns "healthy"

---

## Client-Side Behavior (JavaScript)

All handled in `public/javascripts/util.js`:

1. **Delete confirmations:** `.delete` links show `confirm()` dialog using `data-confirm` attribute, then submit a hidden POST form
2. **POST form links:** `a.postForm` links create hidden POST forms and submit (used for Watch/Unwatch, Make/Revoke Admin, toggle subscriptions)
3. **Generator enable toggle:** `.generator-enable-setter` checkboxes AJAX POST to `/generators/postUpdate`
4. **Generator visibility setter:** `.generator-visibility-setter` selects AJAX POST to `/generators/postUpdate`
5. **Generator select:** `.generator-select` links navigate to `/generators/<guid>`

---

## Summary Statistics

- **Total routes:** ~80 distinct URL patterns
- **Controllers:** 24 controller classes
- **View templates:** ~84 .scala.html files
- **Auth levels:** Public, Anonymous, Login required, Login+Org Member, Login+Org Admin
- **Styling:** Bootstrap 3 + 1 custom CSS file
- **JS:** jQuery 3.2.1 + 1 custom util.js file
- **No SPA behavior:** All navigation is full page loads, no AJAX-driven content except generator toggles
