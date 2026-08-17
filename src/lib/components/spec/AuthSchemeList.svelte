<script lang="ts">
  import type { AuthScheme, Service } from '$generated/com-bryzek-apibuilder-spec';
  import { authSchemeAnchorId, operationsProtectedBy } from '$lib/utils/auth-schemes';
  import SpecCard from './SpecCard.svelte';
  import SpecList from './SpecList.svelte';

  interface Props {
    schemes: AuthScheme[];
    service: Service;
  }

  let { schemes, service }: Props = $props();
</script>

<SpecList items={schemes} key={(scheme) => scheme.type} noun="auth schemes">
  {#snippet item(scheme)}
    {@const protects = operationsProtectedBy(service, scheme.type)}
    <SpecCard id={authSchemeAnchorId(scheme.type)} name={scheme.type} description={scheme.description}>
      {#if protects.length > 0}
        <!-- Collapsed by default: a scheme protecting most of a large service would otherwise
             bury every other scheme under its own list. -->
        <details>
          <summary class="text-ab-gray hover:text-ab-dark-gray cursor-pointer text-xs">
            Protects {protects.length}
            {protects.length === 1 ? 'operation' : 'operations'}
          </summary>
          <ul class="mt-2 space-y-1">
            {#each protects as op (`${op.method} ${op.path}`)}
              <li class="text-sm">
                <a href="#{op.resourceType}" class="text-ab-blue hover:text-ab-dark-blue font-mono">
                  <span class="font-bold">{op.method}</span>
                  {op.path}
                </a>
              </li>
            {/each}
          </ul>
        </details>
      {:else}
        <!-- A declared scheme nothing references is either dead weight or an operation that
             was meant to reference it and does not. Both are worth seeing. -->
        <p class="text-ab-gray text-xs">No operation in this service references this scheme.</p>
      {/if}
    </SpecCard>
  {/snippet}
</SpecList>
