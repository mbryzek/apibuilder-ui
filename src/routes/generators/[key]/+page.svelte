<script lang="ts">
	import type { Generator } from '$generated/com-bryzek-apibuilder-generator-v0';

	interface Props {
		data: {
			generator: Generator;
		};
	}

	let { data }: Props = $props();

	const gen = $derived(data.generator);
</script>

<svelte:head>
	<title>{gen.name} - Generators - API Builder</title>
</svelte:head>

<div class="page-container">
	<div class="mb-6">
		<a href="/generators" class="text-ab-blue hover:text-ab-dark-blue text-sm">&larr; Back to Generators</a>
	</div>

	<h1 class="text-2xl font-bold text-ab-dark-blue mb-6">{gen.name}</h1>

	<div class="card">
		<dl class="grid grid-cols-1 sm:grid-cols-2 gap-4">
			<div>
				<dt class="text-sm font-semibold text-ab-gray">Key</dt>
				<dd class="text-ab-dark-blue">{gen.key}</dd>
			</div>
			{#if gen.language}
				<div>
					<dt class="text-sm font-semibold text-ab-gray">Language</dt>
					<dd class="text-ab-dark-blue">{gen.language}</dd>
				</div>
			{/if}
			{#if gen.attributes && gen.attributes.length > 0}
				<div>
					<dt class="text-sm font-semibold text-ab-gray">Attributes</dt>
					<dd>
						<ul class="list-disc list-inside text-ab-dark-blue">
							{#each gen.attributes as attr}
								<li>{attr}</li>
							{/each}
						</ul>
					</dd>
				</div>
			{/if}
		</dl>
	</div>
</div>
