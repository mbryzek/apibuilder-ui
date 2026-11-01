<!--
  @component
  One code sample on a documentation page. `code` is rendered as text, so a sample can show angle
  brackets as they are. A sample whose markup is part of it (a field type in `em`, a link to the
  declaration it names) passes that markup as children instead. `class` carries the margin the
  surrounding layout needs.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';

  type Sample = { code: string; children?: never } | { code?: never; children: Snippet };
  type Props = Sample & { class?: string };

  let { code, children, class: className }: Props = $props();
</script>

<pre class={['overflow-x-auto rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm', className]}><code
    >{#if children}{@render children()}{:else}{code}{/if}</code
  ></pre>
