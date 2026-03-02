<script lang="ts">
	import type { Deprecation } from '$generated/types';

	interface Props {
		deprecation?: Deprecation;
	}

	let { deprecation }: Props = $props();
</script>

{#if deprecation}
	<span class="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800" title={deprecation.description || 'Deprecated'}>
		deprecated
	</span>
{/if}
