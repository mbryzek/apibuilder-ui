<script lang="ts">
	interface Props {
		baseUrl: string;
		typeName: string;
	}

	let { baseUrl, typeName }: Props = $props();

	let copiedLabel = $state('');

	function copyToClipboard(text: string): boolean {
		try {
			const textarea = document.createElement('textarea');
			textarea.value = text;
			textarea.style.position = 'fixed';
			textarea.style.opacity = '0';
			document.body.appendChild(textarea);
			textarea.select();
			document.execCommand('copy');
			document.body.removeChild(textarea);
			return true;
		} catch {
			return false;
		}
	}

	async function copyExample(optionalFields: boolean) {
		const label = optionalFields ? 'full' : 'minimal';
		copiedLabel = '';
		try {
			const url = `${baseUrl}/${typeName}${optionalFields ? '?optional_fields=true' : ''}`;
			const res = await fetch(url);
			if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
			const text = await res.text();
			let copied = false;
			try {
				await navigator.clipboard.writeText(text);
				copied = true;
			} catch {
				copied = copyToClipboard(text);
			}
			if (copied) {
				copiedLabel = label;
				setTimeout(() => { if (copiedLabel === label) copiedLabel = ''; }, 3000);
			}
		} catch (e) {
			console.error('copyExample failed:', e);
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
