<script lang="ts">
	import type { Code } from '$generated/types';

	interface Props {
		data: {
			code: Code;
			generatorKey: string;
			version: { version: string; organization: { key: string }; application: { key: string } };
		};
	}

	let { data }: Props = $props();

	const code = $derived(data.code);
	const generator = $derived(code.generator.generator);
	const files = $derived(code.files);

	let selectedFileIndex = $state(0);
	const selectedFile = $derived(files.length > 0 ? files[selectedFileIndex] : null);
</script>

<svelte:head>
	<title>{generator.name} - Generated Code - API Builder</title>
</svelte:head>

<div>
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
		<div>
			<h2 class="text-xl font-bold text-ab-dark-blue">{generator.name}</h2>
			{#if generator.description}
				<p class="text-sm text-ab-gray mt-1">{generator.description}</p>
			{/if}
			{#if generator.language}
				<p class="text-xs text-ab-gray mt-0.5">Language: {generator.language}</p>
			{/if}
		</div>
		{#if files.length > 0}
			<div class="flex gap-2 mt-3 sm:mt-0">
				<a
					href="/{data.version.organization.key}/{data.version.application.key}/{data.version.version}/{data.generatorKey}/download"
					class="btn-secondary text-sm inline-block text-center"
				>
					Download Files
				</a>
			</div>
		{/if}
	</div>

	{#if code.source}
		<div class="bg-ab-light-gray rounded-lg p-4 mb-6 text-sm">
			<span class="font-medium text-ab-dark-gray">Source:</span>
			<code class="text-ab-blue">{code.source}</code>
		</div>
	{/if}

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
							{#if file.flags && file.flags.length > 0}
								<span class="text-xs opacity-75">[{file.flags.join(', ')}]</span>
							{/if}
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
