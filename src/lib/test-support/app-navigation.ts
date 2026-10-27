/**
 * Test double for `$app/navigation`, aliased over the real module in vitest.config.ts.
 *
 * Navigation needs SvelteKit's client router, which a mounted component does not have. A spec that
 * mounts a page still renders the components that import from here (LoadErrorBanner's Try again,
 * AccountMenu's close on navigation), so each export is an inert stand-in that records nothing.
 */

export async function goto(_url: string | URL, _opts?: unknown): Promise<void> {}

export async function refreshAll(_opts?: unknown): Promise<void> {}

export function afterNavigate(_callback: (navigation: unknown) => void): void {}
