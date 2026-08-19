/**
 * The shape of a flash message, shared by the server that sets one and the layout that renders it.
 *
 * It lives outside `$lib/server` because `+layout.svelte` needs the type, and everything under
 * `$lib/server` is server-only — importing it from a component is an error SvelteKit raises at
 * build time. The mechanism that produces and consumes a flash stays in `$lib/server/flash`.
 */
export type FlashType = 'success' | 'error' | 'info';

export interface Flash {
  message: string;
  type: FlashType;
}

export const FLASH_TYPES: readonly FlashType[] = ['success', 'error', 'info'];
