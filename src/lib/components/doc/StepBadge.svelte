<!--
  @component
  The round badge in front of a documentation heading: a step number or a glyph. Its weight comes
  from the heading it sits in. `muted` is a step outside the numbered sequence.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    muted?: boolean;
    children: Snippet;
  }

  let { muted = false, children }: Props = $props();
</script>

<span
  class={['inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs text-white', muted ? 'bg-gray-400' : 'bg-ab-blue']}
  >{@render children()}</span
>
