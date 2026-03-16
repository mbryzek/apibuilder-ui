<script lang="ts">
	import { page } from '$app/stores';
	import type { Code } from '$generated/com-bryzek-bryzek-apibuilder-v0';

	interface Props {
		data: {
			code: Code;
			generatorKey: string;
		};
	}

	let { data }: Props = $props();

	const code = $derived(data.code);
	const files = $derived(code.files);

	let selectedFileIndex = $state(0);
	const selectedFile = $derived(files.length > 0 ? files[selectedFileIndex] : null);

	const orgKey = $derived($page.params.orgKey);
	const appKey = $derived($page.params.appKey);
	const versionName = $derived($page.params.version);
</script>

<svelte:head>
	<title>{data.generatorKey} - Generated Code - API Builder</title>
</svelte:head>

<div>
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
		<div>
			<h2 class="text-xl font-bold text-ab-dark-blue">{data.generatorKey}</h2>
		</div>
		{#if files.length > 0}
			<div class="flex gap-2 mt-3 sm:mt-0">
				<a
					href="/{orgKey}/{appKey}/{versionName}/{data.generatorKey}/download"
					class="btn-secondary text-sm inline-block text-center"
				>
					Download Files
				</a>
			</div>
		{/if}
	</div>

	{#if files.length === 0}
		<p class="text-ab-gray">No files generated.</p>
	{:else}
		<div class="flex flex-col lg:flex-row gap-4">
			<!-- File list sidebar -->
			<div class="lg:w-64 flex-shrink-0">
				<h3 class="text-sm font-semibold text-ab-gray uppercase mb-2">Files ({files.length})</h3>
				<div class="border rounded-lg overflow-hidden">
					{#each files as file, i}
						<button
							class="w-full text-left px-3 py-2 text-sm font-mono border-b last:border-b-0 transition-colors {i === selectedFileIndex
								? 'bg-ab-blue text-white'
								: 'hover:bg-ab-light-gray text-ab-dark-gray'}"
							onclick={() => (selectedFileIndex = i)}
						>
							<span class="block truncate">{file.dir ? `${file.dir}/` : ''}{file.name}</span>
						</button>
					{/each}
				</div>
			</div>

			<!-- Code preview -->
			<div class="flex-1 min-w-0">
				{#if selectedFile}
					<div class="flex items-center justify-between mb-2">
						<h3 class="text-sm font-mono text-ab-dark-gray truncate">
							{selectedFile.dir ? `${selectedFile.dir}/` : ''}{selectedFile.name}
						</h3>
					</div>
					<div class="border rounded-lg overflow-x-auto bg-gray-50">
						<pre class="p-4 text-sm font-mono text-ab-dark-blue whitespace-pre">{selectedFile.contents}</pre>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>
