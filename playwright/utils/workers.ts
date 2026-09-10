// dry-copy: sveltekit/playwright-local-workers — every copy of this region must match; `dev repo copies` checks it (ISS-10190)
/**
 * How many Chromium workers the browser suite runs with when nobody set `CI`.
 *
 * THE SCARCE RESOURCE IS THE BACKEND, NOT THE BROWSER. `dev e2e run` stands up ONE platform
 * container for the whole suite, and on an Apple-silicon runner that container is an emulated
 * `linux/amd64` JVM. It saturates long before the CPUs running Chromium do.
 *
 * What saturation looks like matters, because it is why a constant survived so long: an action
 * that outlives `actionTimeout` does not reach the report as a timeout. It reaches it as a link
 * that did not navigate or a form field that never appeared — a page of assertion failures on
 * whatever the session happened to be editing. A session reading that cannot tell its own break
 * from the load, and spends a full e2e cycle on a worktree of `main` to find out.
 *
 * So the number is derived from the machine and capped, rather than being a constant that
 * happens to fit the largest box anyone ever ran it on. `--workers=N` still overrides it for a
 * deliberate experiment; nothing here is load-bearing for `ci/e2e.sh`, which sets `CI` and runs
 * at 1.
 *
 * THE DERIVATION IS SHARED AND THE CEILING IS NOT. Every repo that runs its browser suite through
 * `dev e2e run` carries this region byte for byte; what differs is {@link MAX_LOCAL_WORKERS},
 * below the region, because each suite loads the backend differently and each ceiling is
 * measured against its own suite.
 */

/**
 * One worker per four hardware threads, floored at 1 and capped at {@link MAX_LOCAL_WORKERS}.
 *
 * The divisor is what makes this a derivation rather than a second constant: each worker is a
 * Chromium plus its share of vite, and a box with four threads has no business running four of
 * them alongside an emulated JVM and a Postgres. `cpus` is `os.availableParallelism()`, which is
 * container-aware, so a build confined to two cores asks for one worker.
 */
export function localWorkers(cpus: number): number {
  return Math.max(1, Math.min(MAX_LOCAL_WORKERS, Math.floor(cpus / 4)));
}
// dry-copy-end

/**
 * The ceiling, and the only measured number in this file.
 *
 * Measured with `dev e2e run --app platform --frontend apibuilder` on a Mac mini runner (M4, 10
 * cores, 24 GB, shared with other sessions' builds) against the emulated `platform:0.21.94`
 * container it stands up — all 39 tests, one worker count after another against the same live
 * backend, `--workers=N` with `CI` unset:
 *
 * - 20 (the constant this replaces): 3 failures, in 42s — the logout that revokes the session,
 *   and both domain specs. Every one reads as an assertion.
 * - 8: green, in 15s.
 * - 4: green twice, in 22s and 23s.
 * - 2: green, in 35s. This is what the derivation gives that runner.
 *
 * The first pass also failed `csp.spec.ts`'s hydration test at 8 and at 4. That one was never the
 * backend — the page it opens makes no API call — but a click that could beat hydration; it now
 * waits for the root layout's `data-hydrated` marker, and passed at every count above.
 *
 * 4 rather than 8, which also passed: one green at 8 is thin evidence against a backend that
 * fails at 20, and 22s against 15s buys nothing worth a suite whose red does not mean the code is
 * broken.
 */
export const MAX_LOCAL_WORKERS = 4;
