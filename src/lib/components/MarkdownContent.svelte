<script lang="ts">
	import { marked } from 'marked';

	interface Props {
		content: string;
		inline?: boolean;
	}

	let { content, inline = false }: Props = $props();

	const html = $derived(
		inline ? marked.parseInline(content) : marked.parse(content),
	);
</script>

{#if typeof html === 'string'}
	{@html html}
{/if}
