<script lang="ts">
	import type { Service } from '$generated/com-bryzek-apibuilder-spec-v0';
	import { resolveType } from '$lib/utils/type-resolver';

	interface Props {
		typeStr: string;
		service: Service;
	}

	let { typeStr, service }: Props = $props();

	const resolved = $derived(resolveType(typeStr, service));
</script>

<span class="type-link">{#if resolved.isArray}[{/if}{#if resolved.isMap}map[{/if}{#if resolved.href}<a
		href={resolved.href}
		class="text-ab-blue hover:text-ab-dark-blue underline"
	>{resolved.innerType}</a>{:else if resolved.anchor}<a
		href="#{resolved.anchor}"
		class="text-ab-blue hover:text-ab-dark-blue underline"
	>{resolved.innerType}</a>{:else}{resolved.innerType}{/if}{#if resolved.isArray}]{/if}{#if resolved.isMap}]{/if}</span>
