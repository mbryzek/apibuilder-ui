<script lang="ts">
  import { page } from '$app/stores';
  import type { Code } from '$generated/com-bryzek-apibuilder';

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
  <div class="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h2 class="text-ab-dark-blue text-xl font-bold">{data.generatorKey}</h2>
    </div>
    {#if files.length > 0}
      <div class="mt-3 flex gap-2 sm:mt-0">
        <a href="/{orgKey}/{appKey}/{versionName}/{data.generatorKey}/download" class="btn-secondary inline-block text-center text-sm">
          Download Files
        </a>
      </div>
    {/if}
  </div>

  {#if files.length === 0}
    <p class="text-ab-gray">No files generated.</p>
  {:else}
    <div class="flex flex-col gap-4 lg:flex-row">
      <!-- File list sidebar -->
      <div class="flex-shrink-0 lg:w-64">
        <h3 class="text-ab-gray mb-2 text-sm font-semibold uppercase">Files ({files.length})</h3>
        <div class="overflow-hidden rounded-lg border">
          {#each files as file, i}
            <button
              class="w-full border-b px-3 py-2 text-left font-mono text-sm transition-colors last:border-b-0 {i === selectedFileIndex
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
      <div class="min-w-0 flex-1">
        {#if selectedFile}
          <div class="mb-2 flex items-center justify-between">
            <h3 class="text-ab-dark-gray truncate font-mono text-sm">
              {selectedFile.dir ? `${selectedFile.dir}/` : ''}{selectedFile.name}
            </h3>
          </div>
          <div class="overflow-x-auto rounded-lg border bg-gray-50">
            <pre class="text-ab-dark-blue p-4 font-mono text-sm whitespace-pre">{selectedFile.contents}</pre>
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>
