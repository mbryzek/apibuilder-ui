<script lang="ts">
  import type { AuthScheme, Service } from '$generated/com-bryzek-apibuilder-spec';
  import { authSchemeAnchorId, operationsProtectedBy } from '$lib/utils/auth-schemes';

  interface Props {
    schemes: AuthScheme[];
    service: Service;
  }

  let { schemes, service }: Props = $props();
</script>

{#if schemes.length > 0}
  <div class="space-y-6">
    {#each schemes as scheme (scheme.type)}
      {@const protects = operationsProtectedBy(service, scheme.type)}
      <div id={authSchemeAnchorId(scheme.type)} class="scroll-mt-16 overflow-hidden rounded-lg border border-gray-200">
        <div class="bg-ab-light-gray flex items-center gap-2 px-4 py-3">
          <h3 class="text-ab-dark-blue truncate font-mono text-base font-bold">{scheme.type}</h3>
        </div>
        <div class="px-4 py-3">
          {#if scheme.description}
            <p class="text-ab-dark-gray mb-3 text-sm">{scheme.description}</p>
          {/if}
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
        </div>
      </div>
    {/each}
  </div>
{:else}
  <p class="text-ab-gray text-sm">No auth schemes defined.</p>
{/if}
