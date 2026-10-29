#!/usr/bin/env bash
#
# What CI runs for apibuilder-ui's BROWSER suite (ISS-4028, following the playbook-admin pilot in
# ISS-2193).
#
# THIS IS A SECOND, SEPARATE ENROLMENT FROM `ci/build.sh`, and the separation is the whole design.
# `ci/build.sh` produces the `ci` status the merge lane gates on; this file produces the `e2e`
# status, which the lane does not read. So a red here parks nothing and merges nothing — it files
# an issue. That is deliberate and it is the first step of a three-step rollout written down in
# devops/docs/ci.md: post-merge on `main` only, then a non-gating `e2e` context on pull requests,
# then — only if measured flake data earns it — inside `ci`. This fleet's green rate does not have
# room for an unmeasured flake source inside the gate.
#
# WHY THIS SUITE COULD NOT RUN BEFORE, in one line: every spec here needs a live `platform`, and
# the released image would not serve one, because the fixture endpoints and the
# `X-Bypass-Rate-Limit` header all gate on Play's runtime mode and a distribution is always
# `Mode.Prod`. ISS-2192 made the mode a startup parameter and `dev e2e run` stands the resulting
# container up; this suite also creates its own users, which is what README.md meant by "a platform API it is allowed to create users in" — a throwaway session database per build is exactly that.
set -euo pipefail

# `--frontend apibuilder` names the TENANT ID this repo serves (a key of platform's
# `TenantHosts.DefaultDevFrontendUrls`), so this build's allocated vite port is pointed at that
# one tenant and the other ten are left on their defaults.
E2E_REPO=apibuilder-ui
E2E_TENANT=(--frontend apibuilder)

# dry-copy: sveltekit/ci-e2e — every copy of this region must match; `dev repo copies` checks it (ISS-15745)
echo "e2e ${CI_REPO:-$E2E_REPO} @ ${CI_SHA:-working tree} (${CI_EVENT:-local})"

npm ci

# The BROWSER, which is not in node_modules. From the repo's OWN playwright, never a global one:
# the browser build is pinned per `playwright-core` version and a mismatch fails at launch with
# `Executable doesn't exist at .../chromium_headless_shell-<rev>` (ISS-780). Chromium only — the
# one project this config defines.
npx playwright install chromium

# THE WHOLE LIFECYCLE, and the teardown is inside it rather than in a `trap` here: ports, the
# session database and the container are machine-wide state, and all three leak if this script is
# killed between two lines of its own. See devops/lib/e2e.rb.
exec dev e2e run --app platform "${E2E_TENANT[@]}" -- npm run test:e2e
# dry-copy-end
