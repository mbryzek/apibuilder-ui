<script lang="ts">
  /**
   * The one definition of an entity card in the spec view.
   *
   * Every named thing a service declares — a model, an enum, a union, an interface, an auth
   * scheme — is rendered as the same bordered box with a grey header, an anchor the sidebar and
   * every `TypeLink` navigate to, and an optional description above its body. Only the body
   * differs, so only the body is the caller's.
   *
   * `id` is separate from `name` because a scheme's anchor is prefixed (`$lib/utils/auth-schemes`
   * explains why) while every other anchor is the type name itself.
   */

  import type { Snippet } from 'svelte';

  interface Props {
    /** The DOM id the anchor scrolls to. */
    id: string;
    name: string;
    description?: string | undefined;
    /** Rendered at the far end of the header — the example-JSON links, where a type has them. */
    headerRight?: Snippet | undefined;
    children: Snippet;
  }

  let { id, name, description, headerRight, children }: Props = $props();
</script>

<div {id} class="scroll-mt-16 overflow-hidden rounded-lg border border-gray-200">
  <div class="bg-ab-light-gray flex items-center justify-between gap-2 px-4 py-3">
    <!-- `min-w-0` is what lets `truncate` shorten a long type name: a flex item will not shrink
         below its content width without it. -->
    <h3 class="text-ab-dark-blue min-w-0 truncate font-mono text-base font-bold">{name}</h3>
    {@render headerRight?.()}
  </div>
  <div class="px-4 py-3">
    {#if description}
      <p class="text-ab-dark-gray mb-3 text-sm">{description}</p>
    {/if}
    {@render children()}
  </div>
</div>
