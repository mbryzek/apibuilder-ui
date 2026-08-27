<script lang="ts">
  import type { Snippet } from 'svelte';

  /**
   * The notice box: one definition of the rounded, tinted, bordered panel this app puts
   * above a form or around a destructive confirmation. `variant` carries the tone, and a
   * tone sets the text colour on the box itself so the content inside inherits it.
   *
   * Spacing is the caller's — a banner does not know what it sits next to.
   */
  interface Props {
    variant: 'error';
    /** `alert` on anything a screen reader should announce the moment it appears. */
    role?: 'alert';
    class?: string;
    children: Snippet;
  }

  let { variant, role, class: className = '', children }: Props = $props();

  const TONES: Record<Props['variant'], string> = {
    error: 'border-red-200 bg-red-50 text-red-800'
  };
</script>

<div {role} class="rounded-lg border p-4 {TONES[variant]} {className}">
  {@render children()}
</div>
