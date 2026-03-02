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
			if (!res.ok) throw new Error('Failed to fetch');
			const text = await res.text();
			await navigator.clipboard.writeText(text);
			copiedLabel = label;
			setTimeout(() => { if (copiedLabel === label) copiedLabel = ''; }, 2000);
		} catch {
			copiedLabel = '';
		}
	}
</script>

<span class="text-xs text-ab-gray">
	Example JSON:
	<button onclick={() => copyExample(false)} class="text-ab-blue hover:text-ab-dark-blue cursor-pointer">
		{copiedLabel === 'minimal' ? 'Copied!' : 'Minimal'}
	</button>
	|
	<button onclick={() => copyExample(true)} class="text-ab-blue hover:text-ab-dark-blue cursor-pointer">
		{copiedLabel === 'full' ? 'Copied!' : 'Full'}
	</button>
</span>
