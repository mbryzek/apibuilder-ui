<script lang="ts">
  /**
   * Banner Component
   *
   * The one definition of the coloured notice box. `variant` picks the hue and the
   * caller supplies the content, so a load failure, a form rejection and a destructive
   * confirmation are the same box rather than three copies of it that drift apart.
   *
   * Text colour is set on the box, so content only needs its size and weight.
   */

  import type { Snippet } from 'svelte';

  type Variant = 'error';

  interface Props {
    variant?: Variant | undefined;
    /** Box-level classes the caller owns — margin, usually. */
    class?: string | undefined;
    /** Live-region role. `alert` interrupts; pass `null` for a box nobody needs told about. */
    role?: 'alert' | 'status' | null | undefined;
    children: Snippet;
  }

  let { variant = 'error', class: className = 'mb-6', role = 'alert', children }: Props = $props();

  const VARIANT_CLASSES: Record<Variant, string> = {
    error: 'border-red-200 bg-red-50 text-red-800'
  };
</script>

<div role={role ?? undefined} class="rounded-lg border p-4 {VARIANT_CLASSES[variant]} {className}">
  {@render children()}
</div>
