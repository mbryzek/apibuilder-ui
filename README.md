# apibuilder-ui

The SvelteKit front end for [API Builder](https://app.apibuilder.io/). It talks to the platform API
over the TypeScript clients generated into `src/generated/` from the apibuilder specs — never
hand-edit those. `SITEMAP.md` is an inventory of the PRE-REWRITE Play Framework UI, kept as a
reference for what the rewrite has to cover — it is not a description of this app.

## Running it locally

```bash
npm ci
npm run dev            # http://localhost:5173
```

Node `^22.13.0 || >=24`, declared in package.json `engines` and enforced for real: `.npmrc` sets
`engine-strict=true`, so `npm ci` refuses to install outside that range — that is the gate, in CI
and on a laptop alike. `.nvmrc` is a hint for a version manager on a developer's machine; nothing
in the CI tooling reads it. Neither is hand-maintained guesswork — `src/node-version.test.ts` fails
if the declared range admits a version the dependency tree rejects, or if `.nvmrc` falls outside it
(ISS-2433).

`.env` points the app at a platform API on `http://localhost:9300`; `.env.production` points the
built artifact at `https://idempotent.io`. Copy `.env.example` if you need to override either.

## Checks

```bash
npm run check          # the gate: svelte-check, tsc, eslint, prettier, unit tests
npm run lint:fix       # eslint --fix over src/ and playwright/
npm run format         # prettier --write
npm run build          # production build (adapter-cloudflare)
```

CI runs on every pull request (ISS-2172). `ci/build.sh` is the whole of it — the fleet verifies a
repo exactly when that file exists at a pull request's head sha, and the `ci` commit status it
posts is what the merge lane reads, so a red one parks the PR. It runs `npm ci`, then `npm run
check`, then `npm run build`. The build is deliberately a separate step: SvelteKit's
"`$lib/server` imported into browser code" guard is a vite build plugin, so `svelte-check` cannot
give that verdict.

`npm run check` is therefore both what CI runs and what a developer runs by hand before pushing.
It covers:

| Step                                      | Scope                                                         |
| ----------------------------------------- | ------------------------------------------------------------- |
| `svelte-check --tsconfig ./tsconfig.json` | `src/`, including `.svelte`                                   |
| `tsc --project tsconfig.playwright.json`  | `playwright/` and `playwright.config.ts`                      |
| `npm run lint`                            | `src/` and `playwright/`, `--max-warnings 0`                  |
| `npm run format:check`                    | everything not in `.prettierignore`                           |
| `npm run test:unit`                       | `src/**/*.test.ts` and `playwright/**/*.test.ts` under vitest |

Two things are deliberate there. Lint runs with `--max-warnings 0`, because a warning nobody's
build fails on is a rule that does not exist — `@typescript-eslint/no-explicit-any` is a `warn` and
was passing silently. And `tsconfig.playwright.json` carries the same strict flags as
`tsconfig.json` rather than a weaker subset; while it did not, a dead import in `org.spec.ts`
survived both gates.

## Tests

**Unit tests (`npm run test:unit`)** are plain vitest over `src/**/*.test.ts` and
`playwright/**/*.test.ts`, no browser and no server. Route logic is testable here directly: a
`+page.server.ts` exports plain functions, so a load or an action can be invoked with a hand-built
event and the API client mocked. That is how
`src/routes/session-lifecycle.test.ts` and `src/routes/confused-deputy.test.ts` pin authorization
and session behavior. **This is the level to reach for first** — it runs in seconds with no server,
and it is where a regression gets caught.

**End-to-end tests (`npm run test:e2e`)** are Playwright specs in `playwright/tests/`. They need
two servers running, and `playwright/global-setup.ts` refuses to start without both:

```bash
npm run dev                                     # this app on :5173
cd ~/code/platform && ./run.sh && sbt 'project api; run'   # platform API on :9300
npm run test:e2e                                # or test:e2e:ui / :headed / :debug
```

### Where the Playwright suite runs

It signs users up for real: `createUserViaApi` POSTs to `/tenant/apibuilder/session/signups` on
whatever platform API it is pointed at, and the specs then create orgs, tokens, and domains. So it
needs a platform instance it is safe to write to, and pointing it at the production API is not an
option — it would create real users and real orgs on every run.

`ci/e2e.sh` provides one per build: `dev e2e run` pulls the newest released `platform` image, boots
it in `Mode.Test` against a throwaway session database, hands this suite the URLs, and removes both
afterwards. That runs post-merge on `main` and posts an `e2e` commit status.

**`e2e` does not gate a merge, and `ci` does.** The merge lane reads `ci` — `ci/build.sh`, which
still deliberately omits `npm run test:e2e` — so a red browser suite files an issue rather than
parking every pull request in this repo. `devops/docs/ci.md` carries the three-step rollout that is
the first step of.

The practical consequence has not changed: **an auth or authorization change needs a unit test, not
only an e2e spec.** ISS-493 was filed after three consecutive commits changed the logout and
dev-login paths with no executed coverage at all — the specs compiled on every push, which proved
they were valid TypeScript and nothing more. The browser suite now runs, but it runs after the
merge and against the released backend, so `src/**/*.test.ts` is still where auth behavior is
pinned at the gate.

The helpers under `playwright/utils/` are plain modules, and
`playwright/utils/test-helpers.test.ts` runs under vitest to pin the requests the two platform-API
helpers put on the wire — inside `ci`, on every push.

### The e2e suite talks to the platform through the generated client

`playwright/` is its own API Builder codegen root (`playwright/.api/config.pkl`), and
`playwright/generated/` is what `createUserViaApi` and `sessionIsValid` call. Keep it that way:
a hand-rolled `fetch()` re-declares the contract by hand, so it cannot notice the spec moving —
signup answers a `SessionState` union, and the hand-written type it replaced claimed a `session`
field that the `user_inactive` variant does not have (ISS-2434).
