# Phase 1: Foundation & Auth — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Reset the apibuilder-ui repo and build the foundation: project scaffold, types, API client, auth flow, root layout with Header/Footer, and core pages (home, login, logout, dev login, account profile).

**Architecture:** SSR-first SvelteKit with all API calls server-side. Session stored in httpOnly cookie. Auth via `Authorization: Session <session_id>` header to `api.apibuilder.io`. Flash messages via URL params.

**Tech Stack:** SvelteKit + Svelte 5 runes, TypeScript strict, Tailwind CSS 3 + @tailwindcss/forms, marked (Markdown), Cloudflare adapter

---

### Task 1: Reset repo and scaffold SvelteKit project

**Files:**
- Delete: everything except `.git/`, `docs/`, `SITEMAP.md`
- Create: fresh SvelteKit scaffold

**Step 1: Clean the repo (keep git history, docs, sitemap)**

```bash
cd ~/code/apibuilder-ui
# Remove everything except .git, docs, SITEMAP.md
ls | grep -v -E '^(docs|SITEMAP.md)$' | xargs rm -rf
```

**Step 2: Create fresh SvelteKit project in a temp dir, then copy files in**

```bash
cd /tmp
npm create svelte@latest apibuilder-ui-temp -- --template skeleton --types typescript
cp -r /tmp/apibuilder-ui-temp/* ~/code/apibuilder-ui/
cp /tmp/apibuilder-ui-temp/.npmrc ~/code/apibuilder-ui/ 2>/dev/null || true
rm -rf /tmp/apibuilder-ui-temp
```

**Step 3: Install dependencies**

```bash
cd ~/code/apibuilder-ui
npm install @sveltejs/adapter-cloudflare @tailwindcss/forms tailwindcss postcss autoprefixer marked
npm install -D @sveltejs/adapter-cloudflare
```

**Step 4: Commit**

```bash
git add -A
git commit -m "Reset repo with fresh SvelteKit scaffold"
```

---

### Task 2: Configure project (Tailwind, TypeScript, SvelteKit config)

**Files:**
- Create: `tailwind.config.js`, `postcss.config.js`
- Modify: `svelte.config.js`, `tsconfig.json`, `vite.config.ts`, `src/app.html`

**Step 1: Write `tailwind.config.js`**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        'ab-dark-blue': '#1a365d',
        'ab-blue': '#2b6cb0',
        'ab-light-blue': '#4299e1',
        'ab-gray': '#718096',
        'ab-light-gray': '#f7fafc',
        'ab-dark-gray': '#4a5568',
        'ab-error-red': '#e53e3e',
        'ab-success-green': '#38a169',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
```

**Step 2: Write `postcss.config.js`**

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

**Step 3: Write `svelte.config.js`**

```js
import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      routes: {
        include: ['/*'],
        exclude: ['<all>'],
      },
    }),
    alias: {
      $generated: 'src/generated',
    },
  },
};

export default config;
```

**Step 4: Write `tsconfig.json`**

```json
{
  "extends": "./.svelte-kit/tsconfig.json",
  "compilerOptions": {
    "allowImportingTsExtensions": true,
    "allowJs": true,
    "checkJs": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "sourceMap": true,
    "moduleResolution": "bundler",
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "strict": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "allowUnreachableCode": false,
    "allowUnusedLabels": false,
    "noImplicitOverride": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

**Step 5: Write `vite.config.ts`**

```ts
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
});
```

**Step 6: Write `src/app.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
    %sveltekit.head%
  </head>
  <body data-sveltekit-preload-data="hover" style="margin:0;padding:0">
    <div style="display: contents">%sveltekit.body%</div>
  </body>
</html>
```

**Step 7: Commit**

```bash
git add -A
git commit -m "Configure Tailwind, TypeScript strict mode, Cloudflare adapter"
```

---

### Task 3: Write global CSS and TypeScript types

**Files:**
- Create: `src/app.css`, `src/app.d.ts`, `src/generated/types.ts`, `src/lib/config.ts`

**Step 1: Write `src/app.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html, body {
    @apply bg-white text-ab-dark-blue m-0 p-0;
  }
}

@layer components {
  .btn-primary {
    @apply bg-ab-blue text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-ab-dark-blue transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed;
  }

  .btn-secondary {
    @apply bg-white text-ab-blue font-semibold px-6 py-3 rounded-lg border border-ab-blue hover:bg-ab-light-gray transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed;
  }

  .btn-danger {
    @apply bg-ab-error-red text-white font-semibold px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed;
  }

  .btn-text {
    @apply text-ab-blue font-medium hover:text-ab-dark-blue transition-colors duration-200;
  }

  .card {
    @apply bg-white rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.08)] p-6;
  }

  .input-field {
    @apply rounded-lg border-ab-gray focus:border-ab-blue focus:ring-ab-blue;
  }

  .error-message {
    @apply text-ab-error-red text-sm mt-1;
  }

  .page-container {
    @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6;
  }
}
```

**Step 2: Write `src/app.d.ts`**

Port from old codebase — defines Session type and App.Locals/App.PageData.

```ts
export type Session = {
  id: string;
  user: import('$generated/types').User;
};

declare global {
  namespace App {
    interface Locals {
      session?: Session | undefined;
    }
    interface PageData {
      session?: Session | undefined;
    }
  }
}

export {};
```

**Step 3: Write `src/generated/types.ts`**

Port the full 610-line types file from the old codebase — all enums and interfaces for the apibuilder API. This file is already complete and correct.

**Step 4: Write `src/lib/config.ts`**

```ts
export const SESSION_COOKIE = 'session_id';

export const config = {
  apiBaseUrl: import.meta.env['VITE_API_BASE_URL'] || 'https://api.apibuilder.io',
  appBaseUrl: import.meta.env['VITE_APP_BASE_URL'] || 'http://localhost:5173',
  githubClientId: import.meta.env['VITE_GITHUB_CLIENT_ID'] || '',
  environment: import.meta.env['VITE_ENVIRONMENT'] || 'development',
  isProduction: import.meta.env['VITE_ENVIRONMENT'] === 'production' || import.meta.env.PROD,
} as const;
```

**Step 5: Commit**

```bash
git add -A
git commit -m "Add global CSS, TypeScript types, and config"
```

---

### Task 4: Write API client and error handler

**Files:**
- Create: `src/lib/server/api.ts`, `src/lib/server/auth.ts`, `src/lib/api/error-handler.ts`

**Step 1: Write `src/lib/api/error-handler.ts`**

Port from old codebase — the `ApiResponse<T>` discriminated union, `handleApiCall`, type guards. Already complete and correct.

**Step 2: Write `src/lib/server/api.ts`**

Port from old codebase `src/lib/api/clients.ts` but move to `src/lib/server/` since all API calls are server-only. Keep the same structure: `buildUrl`, `get`/`post`/`put`/`del` helpers, and all typed endpoint functions. The key difference is the auth header format:

```ts
export function getSessionHeaders(sessionId?: string): Record<string, string> {
  if (!sessionId) return {};
  return { Authorization: `Session ${sessionId}` };
}
```

All existing endpoint functions from the old `clients.ts` are correct and should be ported.

**Step 3: Write `src/lib/server/auth.ts`**

```ts
import { redirect } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import type { Session } from '../../../app.d.ts';

export function requireAuth(event: RequestEvent): Session {
  const { locals, url } = event;
  if (!locals.session) {
    const redirectTo = url.pathname + url.search;
    throw redirect(303, `/login?redirect=${encodeURIComponent(redirectTo)}`);
  }
  return locals.session;
}

export function requireAuthForAction(locals: App.Locals): Session {
  if (!locals.session) {
    throw redirect(302, '/login');
  }
  return locals.session;
}
```

**Step 4: Commit**

```bash
git add -A
git commit -m "Add API client, error handler, and auth utilities"
```

---

### Task 5: Write hooks.server.ts (session management + security headers)

**Files:**
- Create: `src/hooks.server.ts`

**Step 1: Write `src/hooks.server.ts`**

```ts
import type { Handle } from '@sveltejs/kit';
import { getSessionById, getSessionHeaders } from '$lib/server/api';
import { handleApiCall } from '$lib/api/error-handler';
import { SESSION_COOKIE, config } from '$lib/config';

export const handle: Handle = async ({ event, resolve }) => {
  const sessionId = event.cookies.get(SESSION_COOKIE) || undefined;

  if (sessionId) {
    const headers = getSessionHeaders(sessionId);
    const response = await handleApiCall<{ user: import('$generated/types').User; session: import('$generated/types').ApiSession }>(
      () => getSessionById(sessionId, headers),
      {
        onUnauthorized: () => {
          event.cookies.delete(SESSION_COOKIE, { path: '/' });
          event.locals.session = undefined;
        },
      },
    );

    if ('data' in response) {
      event.locals.session = {
        id: sessionId,
        user: response.data.user,
      };
    } else {
      event.locals.session = undefined;
    }
  } else {
    event.locals.session = undefined;
  }

  const res = await resolve(event);

  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  if (config.isProduction) {
    res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  res.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https:",
      "connect-src 'self' " + config.apiBaseUrl,
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  );

  return res;
};
```

**Step 2: Commit**

```bash
git add -A
git commit -m "Add server hooks: session management and security headers"
```

---

### Task 6: Write shared components (Header, Footer, Toast, Pagination, LoadingSpinner)

**Files:**
- Create: `src/lib/components/Header.svelte`
- Create: `src/lib/components/Footer.svelte`
- Create: `src/lib/components/Toast.svelte`
- Create: `src/lib/components/Pagination.svelte`
- Create: `src/lib/components/LoadingSpinner.svelte`
- Create: `src/lib/components/MarkdownContent.svelte`

**Step 1: Write `Header.svelte`**

Responsive navbar matching rallyd pattern but with apibuilder navigation:
- Left: API Builder logo + "API Builder" text → `/`
- Center: Docs link → `/doc`, GitHub link (external)
- Right (logged out): "Login" link → `/login`
- Right (logged in): search box, dropdown menu with: Generators, Attributes, Account, Tokens, Logout
- Mobile: hamburger menu with animated open/close

Props: `session?: Session`, `orgKey?: string` (for search context)

Use `ab-dark-blue` background, same mobile menu pattern as rallyd (CSS transitions, no JS animation library).

**Step 2: Write `Footer.svelte`**

Simple footer:
- Links: Documentation, GitHub, apibuilder.io
- Copyright

**Step 3: Write `Toast.svelte`**

Port rallyd pattern exactly: props `message`, `variant`, `duration`, `onDismiss`. Fixed position, auto-dismiss, CSS slide-down animation, accessible.

**Step 4: Write `Pagination.svelte`**

Offset-based: props `offset`, `limit`, `hasMore`, `baseUrl`. Build Previous/Next URLs. Hide when no navigation needed.

**Step 5: Write `LoadingSpinner.svelte`**

Port rallyd pattern: props `size`, `color`, `text`. SVG spinner with sr-only label.

**Step 6: Write `MarkdownContent.svelte`**

```svelte
<script lang="ts">
  import { marked } from 'marked';

  interface Props {
    content: string;
    inline?: boolean;
  }

  let { content, inline = false }: Props = $props();

  const html = $derived(inline ? marked.parseInline(content) : marked.parse(content));
</script>

{@html html}
```

**Step 7: Commit**

```bash
git add -A
git commit -m "Add shared components: Header, Footer, Toast, Pagination, LoadingSpinner, MarkdownContent"
```

---

### Task 7: Write root layout and home page

**Files:**
- Create: `src/routes/+layout.server.ts`
- Create: `src/routes/+layout.svelte`
- Create: `src/routes/+page.server.ts`
- Create: `src/routes/+page.svelte`

**Step 1: Write `src/routes/+layout.server.ts`**

```ts
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
  return {
    session: locals.session,
  };
};
```

**Step 2: Write `src/routes/+layout.svelte`**

Same pattern as rallyd: import `app.css`, render Header + Toast + main + Footer. Flash message handling via URL params `?flash=...&flash_type=...`. Clean URL params after showing toast.

**Step 3: Write `src/routes/+page.server.ts`**

```ts
import type { PageServerLoad } from './$types';
import { getOrganizations, getMemberships } from '$lib/server/api';
import { handleApiCall } from '$lib/api/error-handler';

export const load: PageServerLoad = async ({ locals }) => {
  // Fetch public organizations for everyone
  const publicOrgsResponse = await handleApiCall<import('$generated/types').Organization[]>(
    () => getOrganizations({}, {}),
  );

  // If logged in, also fetch user's orgs via memberships
  let myOrgs: import('$generated/types').Organization[] = [];
  if (locals.session) {
    const headers = { Authorization: `Session ${locals.session.id}` };
    const membershipsResponse = await handleApiCall<import('$generated/types').Membership[]>(
      () => getMemberships({ user_guid: locals.session!.user.guid }, headers),
    );
    if ('data' in membershipsResponse) {
      myOrgs = membershipsResponse.data.map((m) => m.organization);
    }
  }

  return {
    publicOrgs: 'data' in publicOrgsResponse ? publicOrgsResponse.data : [],
    myOrgs,
  };
};
```

**Step 4: Write `src/routes/+page.svelte`**

Home page:
- Logged out: hero section with "API Builder" headline, description, "Documentation" and "Login" buttons. Public organizations grid.
- Logged in: "My Organizations" section with "Create Organization" button and org grid. Public organizations section.
- Each org card: name linked to `/:orgKey`, namespace shown below.

**Step 5: Commit**

```bash
git add -A
git commit -m "Add root layout and home page"
```

---

### Task 8: Write login pages (GitHub OAuth, email/password, dev login)

**Files:**
- Create: `src/routes/login/+page.server.ts`
- Create: `src/routes/login/+page.svelte`
- Create: `src/routes/login/github/callback/+page.server.ts`
- Create: `src/routes/login/dev/+page.server.ts`
- Create: `src/routes/login/forgot-password/+page.server.ts`
- Create: `src/routes/login/forgot-password/+page.svelte`
- Create: `src/routes/login/reset-password/[token]/+page.server.ts`
- Create: `src/routes/login/reset-password/[token]/+page.svelte`

**Step 1: Write `src/routes/login/+page.server.ts`**

- `load`: if already logged in, redirect to `/`. Return `githubClientId`, `redirectTo`.
- `actions.default`: authenticate via `authenticateEmail(email, password)`. On success, set `session_id` cookie (httpOnly, secure in prod, 1-year maxAge, sameSite lax, path /). Redirect to `redirectTo` or `/`.

**Step 2: Write `src/routes/login/+page.svelte`**

- GitHub OAuth button: links to `https://github.com/login/oauth/authorize?client_id=...&redirect_uri=.../login/github/callback`
- Divider
- Email/password form with `use:enhance`, error display
- "Forgot password?" link
- `isSubmitting` state for loading

**Step 3: Write `src/routes/login/github/callback/+page.server.ts`**

- `load`: exchange GitHub `code` for token via `authenticateGithub(code)`. Set session cookie. Redirect to `/`.

**Step 4: Write `src/routes/login/dev/+page.server.ts`**

- `load`: call `getSessionById('dev')`. If success, set session cookie, redirect to `/?flash=Logged+in+as+dev&flash_type=success`. If 404, redirect to `/?flash=Dev+login+not+enabled&flash_type=error`.

**Step 5: Write forgot-password and reset-password pages**

Standard form pages following the rallyd form action pattern.

**Step 6: Commit**

```bash
git add -A
git commit -m "Add login pages: GitHub OAuth, email/password, dev login, password reset"
```

---

### Task 9: Write logout and logged-out pages

**Files:**
- Create: `src/routes/logout/+page.server.ts`
- Create: `src/routes/logged-out/+page.svelte`

**Step 1: Write `src/routes/logout/+page.server.ts`**

```ts
import type { Actions } from './$types';
import { redirect } from '@sveltejs/kit';
import { SESSION_COOKIE } from '$lib/config';

export const actions = {
  default: async ({ cookies }) => {
    cookies.delete(SESSION_COOKIE, { path: '/' });
    throw redirect(303, '/logged-out');
  },
} satisfies Actions;
```

Also add a `load` that redirects GET requests to `/logged-out` after clearing the cookie (since Header uses a form POST but we should handle direct GET too).

**Step 2: Write `src/routes/logged-out/+page.svelte`**

Simple page: "You are now logged out" message + "Log back in" link → `/login`.

**Step 3: Commit**

```bash
git add -A
git commit -m "Add logout and logged-out pages"
```

---

### Task 10: Write account profile page

**Files:**
- Create: `src/routes/account/profile/+page.server.ts`
- Create: `src/routes/account/profile/+page.svelte`

**Step 1: Write `src/routes/account/profile/+page.server.ts`**

- `load`: `requireAuth(event)`. Return user data.
- `actions.default`: update user via `updateUser(guid, { email, nickname, name })`. On success, redirect with flash. On error, return `fail(400, { errors })`.

**Step 2: Write `src/routes/account/profile/+page.svelte`**

Edit form with fields: Email, Nickname, Name. Save + Cancel buttons. Error display.

**Step 3: Commit**

```bash
git add -A
git commit -m "Add account profile page"
```

---

### Task 11: Write org create page

**Files:**
- Create: `src/routes/org/create/+page.server.ts`
- Create: `src/routes/org/create/+page.svelte`

**Step 1: Write `src/routes/org/create/+page.server.ts`**

- `load`: `requireAuth(event)`.
- `actions.default`: create org via `createOrganization({ name, namespace, key, visibility })`. On success, redirect to `/${org.key}?flash=Organization+created&flash_type=success`.

**Step 2: Write `src/routes/org/create/+page.svelte`**

Form: Name, Namespace, Key (optional), Visibility select. Submit + Cancel.

**Step 3: Commit**

```bash
git add -A
git commit -m "Add organization create page"
```

---

### Task 12: Verify everything works end-to-end

**Step 1: Run dev server**

```bash
cd ~/code/apibuilder-ui
npm run dev
```

**Step 2: Test pages**

1. Visit `http://localhost:5173/` — should show public orgs
2. Visit `http://localhost:5173/login` — should show login form
3. Visit `http://localhost:5173/login/dev` — should auto-login (requires API running locally)
4. After login, home should show "My Organizations"
5. Visit `http://localhost:5173/account/profile` — should show profile edit
6. Visit `http://localhost:5173/org/create` — should show org create form
7. Logout via dropdown — should redirect to logged-out page

**Step 3: Run type check**

```bash
npm run check
```

Expected: No type errors.

**Step 4: Commit any fixes, then push**

```bash
git push -u origin sveltekit-rewrite
```

---

## Key Reference Files

- **Types:** `src/generated/types.ts` — port entire file from old codebase
- **API Client:** `src/lib/server/api.ts` — port from old `src/lib/api/clients.ts`, move to server-only
- **Error Handler:** `src/lib/api/error-handler.ts` — port exactly from old codebase
- **Rallyd patterns:** `~/code/rallyd/src/` — Header, Footer, Toast, auth, form actions, flash messages
- **SITEMAP.md:** `~/code/apibuilder-ui/SITEMAP.md` — complete feature reference

## Testing Strategy

For Phase 1, verification is manual:
- Type checking via `npm run check`
- Visual inspection of each page
- Test login/logout flow
- Test form submissions (profile edit, org create)

Playwright tests will be added in a later phase once the core pages are stable.
