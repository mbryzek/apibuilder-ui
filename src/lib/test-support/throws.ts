/**
 * SvelteKit's `error()` and `redirect()` are thrown rather than returned, so the status they
 * carry is only reachable by catching them — `expect(...).toThrow()` matches the message and
 * cannot see a status at all.
 */

/** The `HttpError` or `Redirect` SvelteKit throws out of a load, an action or a guard. */
export interface Thrown {
  status: number;
  location?: string;
  body?: { message: string };
}

/** Runs `fn` and hands back what it threw. Fails the test if it returned instead. */
export function caught(fn: () => unknown): Thrown {
  try {
    fn();
  } catch (thrown) {
    return thrown as Thrown;
  }
  throw new Error('expected the call to throw');
}

/** `caught` for a call that has to be awaited before it throws. */
export async function caughtAsync(fn: () => unknown): Promise<Thrown> {
  try {
    await fn();
  } catch (thrown) {
    return thrown as Thrown;
  }
  throw new Error('expected the call to throw');
}
