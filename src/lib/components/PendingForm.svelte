<script lang="ts" generics="Act extends string = 'submit'">
  import { enhance } from '$app/forms';
  import type { Snippet } from 'svelte';
  import type { HTMLFormAttributes } from 'svelte/elements';
  import { Submission, type SubmissionOptions } from 'ui/submission.ts';

  /**
   * A POST form whose request shows at once: the snippet receives whether this form's request is on
   * its way, from the click until the server's answer has been applied, so the clicked button names
   * its verb and is disabled. The flag is ui's `Submission` (`ui/submission.ts`).
   *
   * Each form keeps its own `Submission` unless it is handed one. Forms that answer the same thing
   * (Accept and Decline on one request) share one, keyed by the item and named by `act`: the snippet's
   * flag is then true for every form of that item, and the page reads `submission.act(key)` to tell
   * which button was clicked.
   */
  // `children` is narrowed from HTMLFormAttributes' parameterless snippet to one taking the
  // pending flag, so it is replaced rather than extended.
  interface Props extends Omit<HTMLFormAttributes, 'children'> {
    /** Runs once the action has settled, before the page data is updated. */
    onSettled?: (() => void) | undefined;
    /** Shared by the forms that answer one thing together; each form has its own otherwise. */
    submission?: Submission<Act> | undefined;
    /** The item this form answers, when a shared `submission` serves a list. */
    key?: string | undefined;
    /** Which of the item's forms this is, when it has more than one. */
    act?: Act | undefined;
    /** The form body. Receives whether this form's request (or its item's) is on its way. */
    children: Snippet<[boolean]>;
  }

  let { onSettled, submission: shared, key, act, children, ...rest }: Props = $props();

  // Scoped to this component instance unless shared, which is what makes the flag per-FORM rather
  // than per-page: a page declaring one `isSubmitting` for several forms disables all of them on any
  // submit, and a form rendered inside an {#each} disables the same control on every other row.
  const own = new Submission<Act>();
  const submission = $derived(shared ?? own);

  // The flag is cleared only after `update()` has run (Submission's `finally`), never before:
  // `update()` runs `applyAction` and `refreshAll`, further round-trips during which the old markup
  // is still mounted. A flag cleared first re-enables the submit button over that window, and on
  // /tokens/create a second click there mints a second real API token.
  function options(): SubmissionOptions<Act> {
    const opts: SubmissionOptions<Act> = {
      submit:
        () =>
        async ({ update }) => {
          onSettled?.();
          await update();
        }
    };
    if (key !== undefined) opts.key = key;
    if (act !== undefined) opts.act = act;
    return opts;
  }
</script>

<form method="POST" {...rest} use:enhance={submission.enhance(options())}>
  {@render children(submission.pending(key))}
</form>
