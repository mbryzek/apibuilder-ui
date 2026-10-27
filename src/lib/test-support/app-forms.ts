/**
 * Test double for `$app/forms`, aliased over the real module in vitest.config.ts.
 *
 * `enhance` is a SvelteKit action that only does anything inside a running app: it needs the
 * router, and its callback is driven by a real fetch of a form action. Capturing the submit
 * function each component hands it is enough to exercise what a form owns while its request is on
 * its way (PendingForm.svelte, through ui's `Submission`) without either of those.
 */

export type SubmitCallback = (args: { update: () => Promise<void> }) => Promise<void>;
/** Plays a click: runs the form's submit function and resolves to the callback it returns. */
export type SubmitFunction = () => Promise<SubmitCallback>;

type Submit = (input: { cancel: () => void }) => Promise<SubmitCallback | void> | SubmitCallback | void;

/** One entry per `use:enhance` applied, in mount order. */
export const submitFunctions: SubmitFunction[] = [];
const byForm = new Map<HTMLFormElement, SubmitFunction>();

/** The click for the form `element` belongs to (a button, or the form itself). */
export function submitFor(element: HTMLButtonElement | HTMLFormElement): SubmitFunction {
  const form = element instanceof HTMLFormElement ? element : element.form;
  const submit = form ? byForm.get(form) : undefined;
  if (!submit) throw new Error('no use:enhance applied to this form');
  return submit;
}

export function enhance(form: HTMLFormElement, submit: Submit): { destroy: () => void } {
  const play: SubmitFunction = async () => {
    const callback = await submit({ cancel: () => {} });
    if (!callback) throw new Error('the submit function returned no callback');
    return callback;
  };
  submitFunctions.push(play);
  byForm.set(form, play);
  return {
    destroy(): void {
      const i = submitFunctions.indexOf(play);
      if (i >= 0) submitFunctions.splice(i, 1);
      byForm.delete(form);
    }
  };
}
