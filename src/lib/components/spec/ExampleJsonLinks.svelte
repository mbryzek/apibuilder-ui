<script lang="ts">
	interface Props {
		baseUrl: string;
		typeName: string;
	}

	let { baseUrl, typeName }: Props = $props();

	let copiedLabel = $state('');

	async function copyExample(optionalFields: boolean) {
		const label = optionalFields ? 'full' : 'minimal';
		try {
			const url = `${baseUrl}/${typeName}${optionalFields ? '?optional_fields=true' : ''}`;
			const res = await fetch(url);
			if (!res.ok) {
				copiedLabel = 'error';
				setTimeout(() => { if (copiedLabel === 'error') copiedLabel = ''; }, 2000);
				return;
			}
			const text = await res.text();
			await navigator.clipboard.writeText(text);
			copiedLabel = label;
			setTimeout(() => { if (copiedLabel === label) copiedLabel = ''; }, 2000);
		} catch {
			copiedLabel = 'error';
			setTimeout(() => { if (copiedLabel === 'error') copiedLabel = ''; }, 2000);
		}
	}
</script>

<span class="text-xs text-ab-gray whitespace-nowrap">
	Example JSON:
	<button onclick={() => copyExample(false)} class="text-ab-blue hover:text-ab-dark-blue cursor-pointer">
		{#if copiedLabel === 'minimal'}
			Copied!
		{:else if copiedLabel === 'error'}
			<span class="text-ab-error-red">Error</span>
		{:else}
			Minimal
		{/if}
	</button>
	|
	<button onclick={() => copyExample(true)} class="text-ab-blue hover:text-ab-dark-blue cursor-pointer">
		{#if copiedLabel === 'full'}
			Copied!
		{:else if copiedLabel === 'error'}
			<span class="text-ab-error-red">Error</span>
		{:else}
			Full
		{/if}
	</button>
</span>
