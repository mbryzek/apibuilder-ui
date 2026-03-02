<script lang="ts">
	import type { GeneratorWithService } from '$generated/types';

	interface Props {
		data: {
			generator: GeneratorWithService;
		};
	}

	let { data }: Props = $props();

	const gws = $derived(data.generator);
	const gen = $derived(gws.generator);
</script>

<svelte:head>
	<title>{gen.name} - Generators - API Builder</title>
</svelte:head>

<div>
	<div class="mb-6">
		<a href="/generators" class="text-ab-blue hover:text-ab-dark-blue text-sm">&larr; Back to Generators</a>
	</div>

	<h1 class="text-2xl font-bold text-ab-dark-blue mb-6">{gen.name}</h1>

	<div class="card">
		<dl class="space-y-4">
			<div>
				<dt class="text-sm font-semibold text-ab-gray">Key</dt>
				<dd class="text-ab-dark-blue mt-1">{gen.key}</dd>
			</div>

			{#if gen.language}
				<div>
					<dt class="text-sm font-semibold text-ab-gray">Language</dt>
					<dd class="text-ab-dark-blue mt-1">{gen.language}</dd>
				</div>
			{/if}

			{#if gen.description}
				<div>
					<dt class="text-sm font-semibold text-ab-gray">Description</dt>
					<dd class="text-ab-dark-blue mt-1">{gen.description}</dd>
				</div>
			{/if}

			{#if gen.attributes.length > 0}
				<div>
					<dt class="text-sm font-semibold text-ab-gray">Attributes</dt>
					<dd class="mt-1">
						<ul class="list-disc list-inside text-ab-dark-blue">
							{#each gen.attributes as attr}
								<li>{attr}</li>
							{/each}
						</ul>
					</dd>
				</div>
			{/if}

			<div>
				<dt class="text-sm font-semibold text-ab-gray">Service URI</dt>
				<dd class="text-ab-dark-blue mt-1">{gws.service.uri}</dd>
			</div>
		</dl>
	</div>
</div>
