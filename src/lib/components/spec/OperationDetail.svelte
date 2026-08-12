<script lang="ts">
  import type { Operation, Service } from '$generated/com-bryzek-apibuilder-spec';
  import TypeLink from './TypeLink.svelte';
  import ParametersTable from './ParametersTable.svelte';
  import ResponsesTable from './ResponsesTable.svelte';
  import { operationAuthBadge, operationContentTypeBadge, type AuthBadge } from '$lib/utils/operation-badges';

  interface Props {
    operation: Operation;
    service: Service;
  }

  let { operation, service }: Props = $props();

  const authBadge = $derived(operationAuthBadge(operation, service));
  const contentType = $derived(operationContentTypeBadge(operation));

  const badgeClass = 'inline-block rounded px-2 py-0.5 font-mono text-xs font-medium';
  const authBadgeColors: Record<AuthBadge['kind'], string> = {
    protected: 'bg-amber-100 text-amber-900',
    public: 'bg-gray-100 text-ab-gray',
    undeclared: 'bg-red-100 text-red-900'
  };

  const methodColors: Record<string, string> = {
    GET: 'bg-green-100 text-green-800',
    POST: 'bg-blue-100 text-blue-800',
    PUT: 'bg-yellow-100 text-yellow-800',
    PATCH: 'bg-orange-100 text-orange-800',
    DELETE: 'bg-red-100 text-red-800',
    HEAD: 'bg-gray-100 text-gray-800',
    OPTIONS: 'bg-gray-100 text-gray-800'
  };

  function getBorderClass(method: string): string {
    if (method === 'GET') return 'border-green-400';
    if (method === 'POST') return 'border-blue-400';
    if (method === 'PUT' || method === 'PATCH') return 'border-yellow-400';
    if (method === 'DELETE') return 'border-red-400';
    return 'border-gray-400';
  }
</script>

<div class="border-l-4 {getBorderClass(operation.method)} py-3 pl-4">
  <div class="mb-2 flex flex-wrap items-center gap-2">
    <span
      class="inline-block rounded px-2 py-0.5 font-mono text-xs font-bold {methodColors[operation.method] ?? 'bg-gray-100 text-gray-800'}"
    >
      {operation.method}
    </span>
    <code class="text-ab-dark-blue font-mono text-sm">{operation.path}</code>
    {#if authBadge}
      {#if authBadge.href}
        <a href={authBadge.href} title={authBadge.title} class="{badgeClass} {authBadgeColors[authBadge.kind]} hover:underline">
          {authBadge.label}
        </a>
      {:else}
        <span title={authBadge.title} class="{badgeClass} {authBadgeColors[authBadge.kind]}">{authBadge.label}</span>
      {/if}
    {/if}
    {#if contentType}
      <span title="Content-Type of the request body" class="{badgeClass} bg-indigo-100 text-indigo-900">{contentType}</span>
    {/if}
  </div>

  {#if operation.description}
    <p class="text-ab-dark-gray mb-3 text-sm">{operation.description}</p>
  {/if}

  {#if operation.body}
    <div class="mb-3">
      <h5 class="text-ab-gray mb-1 text-xs font-semibold uppercase">Body</h5>
      <div class="font-mono text-sm">
        <TypeLink typeStr={operation.body} {service} />
      </div>
    </div>
  {/if}

  {#if operation.parameters.length > 0}
    <div class="mb-3">
      <h5 class="text-ab-gray mb-1 text-xs font-semibold uppercase">Parameters</h5>
      <ParametersTable parameters={operation.parameters} {service} />
    </div>
  {/if}

  {#if operation.responses.length > 0}
    <div>
      <h5 class="text-ab-gray mb-1 text-xs font-semibold uppercase">Responses</h5>
      <ResponsesTable responses={operation.responses} {service} />
    </div>
  {/if}
</div>
