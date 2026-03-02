<script lang="ts">
	import type { Response, Service } from '$generated/types';
	import TypeLink from './TypeLink.svelte';

	interface Props {
		responses: Response[];
		service: Service;
	}

	let { responses, service }: Props = $props();

	function getStatusCode(response: Response): string {
		if (response.code.integer) {
			return String(response.code.integer.value);
		}
		if (response.code.response_code_option) {
			return response.code.response_code_option.value;
		}
		return '???';
	}

	function getStatusColorClass(code: string): string {
		if (code.startsWith('2')) return 'bg-green-100 text-green-800';
		if (code.startsWith('3')) return 'bg-blue-100 text-blue-800';
		if (code.startsWith('4')) return 'bg-yellow-100 text-yellow-800';
		if (code.startsWith('5')) return 'bg-red-100 text-red-800';
		return 'bg-gray-100 text-gray-800';
	}
</script>

{#if responses.length > 0}
	<div class="overflow-x-auto">
		<table class="w-full text-sm text-left">
			<thead>
				<tr class="border-b border-gray-200">
					<th class="pb-2 pr-4 font-semibold text-ab-gray">Code</th>
					<th class="pb-2 pr-4 font-semibold text-ab-gray">Type</th>
					<th class="pb-2 font-semibold text-ab-gray">Description</th>
				</tr>
			</thead>
			<tbody>
				{#each responses as resp}
					{@const code = getStatusCode(resp)}
					<tr class="border-b border-gray-100">
						<td class="py-2 pr-4">
							<span class="inline-block px-2 py-0.5 rounded text-xs font-mono font-semibold {getStatusColorClass(code)}">{code}</span>
						</td>
						<td class="py-2 pr-4 font-mono text-sm">
							<TypeLink typeStr={resp.type} {service} />
						</td>
						<td class="py-2 text-ab-dark-gray">{resp.description ?? ''}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}
