<script lang="ts">
  import type { Service } from '$generated/com-bryzek-apibuilder-spec';
  import { resolveType } from '$lib/utils/type-resolver';

  interface Props {
    typeStr: string;
    service: Service;
  }

  let { typeStr, service }: Props = $props();

  const resolved = $derived(resolveType(typeStr, service));

  // Rendered from the wrapper sequence rather than from two flags, so a nested container
  // (`map[[user]]`) comes back out in the order it went in, with the inner type still linked.
  const open = $derived(resolved.wrappers.map((w) => (w === 'map' ? 'map[' : '[')).join(''));
  const close = $derived(']'.repeat(resolved.wrappers.length));
</script>

<span class="type-link"
  >{open}{#if resolved.href}<a href={resolved.href} class="text-ab-blue hover:text-ab-dark-blue underline">{resolved.innerType}</a
    >{:else if resolved.anchor}<a href="#{resolved.anchor}" class="text-ab-blue hover:text-ab-dark-blue underline">{resolved.innerType}</a
    >{:else}{resolved.innerType}{/if}{close}</span
>
