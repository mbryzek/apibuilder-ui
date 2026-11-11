/**
 * Test double for `$app/navigation`, aliased over the real module in vitest.config.ts.
 *
 * Navigation needs SvelteKit's client router, which a mounted component does not have. A spec that
 * mounts a page still renders the components that import from here (LoadErrorBanner's Try again,
 * AccountMenu's close on navigation), so each export is an inert stand-in. `invalidate` records the
 * dependency it was handed in `invalidated`, so a spec can tell which loads a form re-runs.
 */

/** Every resource `invalidate` was handed, in order; a spec clears it. */
export const invalidated: unknown[] = [];

export async function invalidate(resource: unknown, _keepState?: boolean): Promise<void> {
  invalidated.push(resource);
}

export async function goto(_url: string | URL, _opts?: unknown): Promise<void> {}

export async function refreshAll(_opts?: unknown): Promise<void> {}

export function afterNavigate(_callback: (navigation: unknown) => void): void {}
