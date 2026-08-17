<script lang="ts">
  import { enhance } from '$app/forms';
  import type { Snippet } from 'svelte';
  import type { HTMLFormAttributes } from 'svelte/elements';

  // `children` is narrowed from HTMLFormAttributes' parameterless snippet to one taking the
  // pending flag, so it is replaced rather than extended.
  interface Props extends Omit<HTMLFormAttributes, 'children'> {
    /** Runs once the action has settled, before the page data is updated. */
    onSettled?: (() => void) | undefined;
    /** The form body. Receives whether this form's own submission is in flight. */
    children: Snippet<[boolean]>;
  }

  let { onSettled, children, ...rest }: Props = $props();

  // Scoped to this component instance, which is what makes the flag per-FORM rather than per-page:
  // a page declaring one `isSubmitting` for several forms disables all of them on any submit, and
  // a form rendered inside an {#each} disables the same control on every other row.
  let pending = $state(false);
</script>

<form
  method="POST"
  {...rest}
  use:enhance={() => {
    pending = true;
    return async ({ update }) => {
      pending = false;
      onSettled?.();
      await update();
    };
  }}
>
  {@render children(pending)}
</form>
