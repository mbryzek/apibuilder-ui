<script lang="ts">
	interface Props {
		baseUrl: string;
		typeName: string;
	}

	let { baseUrl, typeName }: Props = $props();

	let copiedLabel = $state('');

	function copyExample(optionalFields: boolean) {
		const label = optionalFields ? 'full' : 'minimal';
		copiedLabel = '';

		const url = `${baseUrl}/${typeName}${optionalFields ? '?optional_fields=true' : ''}`;
		const blobPromise = fetch(url)
			.then((res) => {
				if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
				return res.text();
			})
			.then((text) => new Blob([text], { type: 'text/plain' }));

		const item = new ClipboardItem({ 'text/plain': blobPromise });
		navigator.clipboard.write([item]).then(() => {
			copiedLabel = label;
			setTimeout(() => { if (copiedLabel === label) copiedLabel = ''; }, 3000);
		}).catch((e) => {
			console.error('copyExample failed:', e);
		});
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
