/**
 * Test double for `$app/forms`, aliased over the real module in vitest.config.ts.
 *
 * `enhance` is a SvelteKit action that only does anything inside a running app: it needs the
 * router, and its callback is driven by a real fetch of a form action. Capturing the submit
 * function each component hands it is enough to exercise the one thing PendingForm.svelte owns —
 * a pending flag scoped to a single form — without either of those.
 */

export type SubmitCallback = (args: { update: () => Promise<void> }) => Promise<void>;
export type SubmitFunction = () => SubmitCallback;

/** One entry per `use:enhance` applied, in mount order. */
export const submitFunctions: SubmitFunction[] = [];

export function enhance(_form: HTMLFormElement, submit: SubmitFunction): { destroy: () => void } {
  submitFunctions.push(submit);
  return {
    destroy(): void {
      const i = submitFunctions.indexOf(submit);
      if (i >= 0) submitFunctions.splice(i, 1);
    }
  };
}
