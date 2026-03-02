# Phase 2: Organizations — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build all organization pages: org layout with sidebar, org home (app list), org details/edit/delete, membership management, and membership request flow.

**Architecture:** SSR-first SvelteKit. Org layout loads org data + membership status, passes to all child pages via layout data. All API calls server-side.

**Tech Stack:** SvelteKit + Svelte 5 runes, TypeScript strict, Tailwind CSS, marked (Markdown)

**Prerequisite:** Phase 1 complete on branch `phase1-foundation`. Continue on same branch.

---

### Task 1: Create org layout with sidebar

**Files:**
- Create: `src/routes/[orgKey]/+layout.server.ts`
- Create: `src/routes/[orgKey]/+layout.svelte`
- Create: `src/lib/components/OrgSidebar.svelte`

**`src/routes/[orgKey]/+layout.server.ts`:**
- Load organization by key via `getOrganizationByKey(params.orgKey, headers)`
- If not found (404), throw `error(404, 'Organization not found')`
- If user logged in, fetch memberships to determine `isMember` and `isAdmin`
- Return: `{ org, isMember, isAdmin }`

**`src/lib/components/OrgSidebar.svelte`:**
Vertical sidebar (left side on desktop, hidden on mobile or collapsible):
- Org name → `/${orgKey}` (heading)
- Links (always visible to members):
  - Subscriptions → `/${orgKey}/subscriptions`
  - Org Details → `/${orgKey}/details`
- Links (visible when settings visible / admin):
  - Org Attributes → `/${orgKey}/attributes`
  - Org Domains → `/${orgKey}/domains`
  - Org Members → `/${orgKey}/members`
- Props: `orgKey`, `isMember`, `isAdmin`, `activePage` (for highlighting)

**`src/routes/[orgKey]/+layout.svelte`:**
- Two-column layout: OrgSidebar on left (col-span-3), main content on right (col-span-9)
- Responsive: sidebar hidden on mobile, shown at md+ breakpoint
- Pass org data and children

**Commit:** "Add org layout with sidebar"

---

### Task 2: Org home page (application list)

**Files:**
- Create: `src/routes/[orgKey]/+page.server.ts`
- Create: `src/routes/[orgKey]/+page.svelte`

**`+page.server.ts`:**
- Load applications via `getApplications(orgKey, headers, { has_version: true, limit: 100 })`
- If user is admin, check for pending membership requests via `getMembershipRequests(headers, { org_key: orgKey, limit: 1 })`
- Return: `{ applications, hasPendingRequests }`

**`+page.svelte`:**
- Header: org name, "Upload API" button → `/${orgKey}/upload` (members only)
- Pending requests notice (admins only) with link to `/${orgKey}/membership-requests`
- Non-members: "Join this org" button → `/${orgKey}/memberships/request`
- Application list: sortable table or card grid
  - Each app: name (linked to `/${orgKey}/${appKey}/latest`), description, visibility icon, updated date
- Pagination component

**Commit:** "Add org home page with application list"

---

### Task 3: Org details page (view/edit/delete)

**Files:**
- Create: `src/routes/[orgKey]/details/+page.server.ts`
- Create: `src/routes/[orgKey]/details/+page.svelte`

**`+page.server.ts`:**
- `load`: requireAuth. Return org data from layout.
- `actions.update`: get name/namespace/key/visibility from form, call `updateOrganization(orgKey, form, headers)`. Redirect to new key if changed.
- `actions.delete`: call `deleteOrganization(orgKey, headers)`. Redirect to `/?flash=Organization+deleted&flash_type=success`.

**`+page.svelte`:**
- Display: Name, Key, Namespace, Visibility
- Edit form (admin only): same fields as org create
- Danger zone (admin only): Delete button with confirmation
- Pending requests link if applicable

**Commit:** "Add org details page with edit and delete"

---

### Task 4: Members page (list, add, remove, promote/demote)

**Files:**
- Create: `src/routes/[orgKey]/members/+page.server.ts`
- Create: `src/routes/[orgKey]/members/+page.svelte`

**`+page.server.ts`:**
- `load`: requireAuth. Fetch memberships via `getMemberships({ org_key: orgKey }, headers)`. Fetch pending requests count for admins.
- `actions.addMember`: find user by email or nickname via `getUsers(headers, { email })`, create membership request via `createMembershipRequest`, auto-accept via `acceptMembershipRequest`.
- `actions.removeMember`: call `deleteMembership(guid, headers)`.
- `actions.makeAdmin`: create admin membership request + accept.
- `actions.revokeAdmin`: delete admin membership, ensure member role stays.

**`+page.svelte`:**
- "Add member" form (admin): email or nickname input, role select
- Pending requests link (admin)
- Members table: email, nickname, name, role badge (admin/member)
- Per-member actions (admin only): Make Admin / Revoke Admin toggle, Remove button with confirmation
- Pagination

**Commit:** "Add members page with add, remove, promote, demote"

---

### Task 5: Membership requests page

**Files:**
- Create: `src/routes/[orgKey]/membership-requests/+page.server.ts`
- Create: `src/routes/[orgKey]/membership-requests/+page.svelte`
- Create: `src/routes/[orgKey]/memberships/request/+page.server.ts`
- Create: `src/routes/[orgKey]/memberships/request/+page.svelte`

**Membership requests (admin view):**
- `load`: requireAuth. Fetch pending requests for this org.
- `actions.accept`: call `acceptMembershipRequest(guid, headers)`.
- `actions.decline`: call `declineMembershipRequest(guid, headers)`.
- Page: list of pending requests with Accept/Decline buttons, user info.

**Request to join (user view):**
- `load`: requireAuth. Check if already member or already requested.
- `actions.default`: call `createMembershipRequest(orgGuid, userGuid, 'member', headers)`.
- Page: conditional display — already member, pending, or "Request Membership" button.

**Commit:** "Add membership request pages"

---

### Task 6: Org domains page

**Files:**
- Create: `src/routes/[orgKey]/domains/+page.server.ts`
- Create: `src/routes/[orgKey]/domains/+page.svelte`

**`+page.server.ts`:**
- `load`: requireAuth. Org domains come from the org object loaded in layout (`org.domains`).
- `actions.addDomain`: call `createDomain(orgKey, { name }, headers)`.
- `actions.removeDomain`: call `deleteDomain(orgKey, name, headers)`.

**`+page.svelte`:**
- Explanation text about domain auto-signup
- "Add domain" form (admin): domain name input
- Domain list with Remove buttons (admin only, confirmation)

**Commit:** "Add org domains page"

---

### Task 7: Org subscriptions page

**Files:**
- Create: `src/routes/[orgKey]/subscriptions/+page.server.ts`
- Create: `src/routes/[orgKey]/subscriptions/+page.svelte`

**`+page.server.ts`:**
- `load`: requireAuth. Fetch subscriptions via `getSubscriptions(headers, { organization_key: orgKey, user_guid: session.user.guid })`.
- `actions.toggle`: get publication from form. Check if subscribed. If yes, delete. If no, create.

**`+page.svelte`:**
- List all Publication enum values (filtered by role — admins see membership-related ones)
- Each publication: name, subscribed/not-subscribed badge, Toggle button (form POST)

**Commit:** "Add org subscriptions page"

---

### Task 8: Org attributes page

**Files:**
- Create: `src/routes/[orgKey]/attributes/+page.server.ts`
- Create: `src/routes/[orgKey]/attributes/+page.svelte`

**`+page.server.ts`:**
- `load`: requireAuth. Fetch org attributes via `getOrgAttributes(orgKey, headers)`. Fetch all global attributes via `getAttributes(headers)`.
- `actions.setAttribute`: call `putOrgAttribute(orgKey, name, { value }, headers)`.
- `actions.removeAttribute`: call `deleteOrgAttribute(orgKey, name, headers)`.

**`+page.svelte`:**
- Currently set attributes: table with name, value, Edit/Remove buttons
- Available attributes dropdown + value input for setting new ones
- Admin only for editing

**Commit:** "Add org attributes page"

---

### Task 9: Verify and commit

**Step 1:** Run `npx svelte-kit sync && npm run check` — fix any TypeScript errors.
**Step 2:** Run `npm run build` — verify production build succeeds.
**Step 3:** Push to GitHub.

**Commit:** any fixes needed.

---

## API Functions Already Available

All needed API functions are already in `src/lib/server/api.ts`:
- `getOrganizationByKey`, `updateOrganization`, `deleteOrganization`
- `getApplications`
- `getMemberships`, `deleteMembership`
- `getMembershipRequests`, `createMembershipRequest`, `acceptMembershipRequest`, `declineMembershipRequest`
- `getUsers`
- `createDomain`, `deleteDomain`
- `getSubscriptions`, `createSubscription`, `deleteSubscription`
- `getOrgAttributes`, `putOrgAttribute`, `deleteOrgAttribute`
- `getAttributes`

## Key Patterns (from Phase 1)
- Auth: `requireAuth(event)` in load, `requireAuthForAction(locals)` in actions
- API calls: `handleApiCall<Type>(() => apiFunction(...))`, check `'data' in response`
- Flash: redirect with `?flash=message&flash_type=success|error`
- Forms: `use:enhance` with `isSubmitting = $state(false)`
- Errors: `fail(400, { errors: response.errors })`
- Session headers: `getSessionHeaders(session.id)`
