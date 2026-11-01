<!--
  @component
  The heading of a section on a documentation page: a StepBadge, then the title.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import StepBadge from './StepBadge.svelte';

  interface Props {
    badge: string;
    level?: 2 | 3;
    muted?: boolean;
    children: Snippet;
  }

  let { badge, level = 2, muted = false, children }: Props = $props();
</script>

<svelte:element this={`h${level}`} class="text-ab-blue mb-4 flex items-center gap-2 text-lg font-semibold">
  <StepBadge {muted}>{badge}</StepBadge>
  {@render children()}
</svelte:element>
