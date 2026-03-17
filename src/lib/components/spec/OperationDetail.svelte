<script lang="ts">
	import type { Operation, Service } from '$generated/types';
	import TypeLink from './TypeLink.svelte';
	import ParametersTable from './ParametersTable.svelte';
	import ResponsesTable from './ResponsesTable.svelte';

	interface Props {
		operation: Operation;
		service: Service;
	}

	let { operation, service }: Props = $props();

	const methodColors: Record<string, string> = {
		GET: 'bg-green-100 text-green-800',
		POST: 'bg-blue-100 text-blue-800',
		PUT: 'bg-yellow-100 text-yellow-800',
		PATCH: 'bg-orange-100 text-orange-800',
		DELETE: 'bg-red-100 text-red-800',
		HEAD: 'bg-gray-100 text-gray-800',
		OPTIONS: 'bg-gray-100 text-gray-800',
	};

	function getBorderClass(method: string): string {
		if (method === 'GET') return 'border-green-400';
		if (method === 'POST') return 'border-blue-400';
		if (method === 'PUT' || method === 'PATCH') return 'border-yellow-400';
		if (method === 'DELETE') return 'border-red-400';
		return 'border-gray-400';
	}
</script>

<div class="border-l-4 {getBorderClass(operation.method)} pl-4 py-3">
	<div class="flex flex-wrap items-center gap-2 mb-2">
		<span class="inline-block px-2 py-0.5 rounded text-xs font-mono font-bold {methodColors[operation.method] ?? 'bg-gray-100 text-gray-800'}">
			{operation.method}
		</span>
		<code class="text-sm font-mono text-ab-dark-blue">{operation.path}</code>
	</div>

	{#if operation.description}
		<p class="text-sm text-ab-dark-gray mb-3">{operation.description}</p>
	{/if}

	{#if operation.body}
		<div class="mb-3">
			<h5 class="text-xs font-semibold text-ab-gray uppercase mb-1">Body</h5>
			<div class="text-sm font-mono">
				<TypeLink typeStr={operation.body.type} {service} />
			</div>
			{#if operation.body.description}
				<p class="text-xs text-ab-dark-gray mt-0.5">{operation.body.description}</p>
			{/if}
		</div>
	{/if}

	{#if operation.parameters.length > 0}
		<div class="mb-3">
			<h5 class="text-xs font-semibold text-ab-gray uppercase mb-1">Parameters</h5>
			<ParametersTable parameters={operation.parameters} {service} />
		</div>
	{/if}

	{#if operation.responses.length > 0}
		<div>
			<h5 class="text-xs font-semibold text-ab-gray uppercase mb-1">Responses</h5>
			<ResponsesTable responses={operation.responses} {service} />
		</div>
	{/if}
</div>
