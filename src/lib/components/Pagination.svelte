<script lang="ts">
	/**
	 * Pagination Component
	 * Provides Previous/Next navigation links
	 */

	interface Props {
		offset: number;
		limit: number;
		hasMore: boolean;
		baseUrl: string;
	}

	let { offset, limit, hasMore, baseUrl }: Props = $props();

	const showPrevious = $derived(offset > 0);
	const showNext = $derived(hasMore);
	const showPagination = $derived(showPrevious || showNext);

	function buildUrl(newOffset: number): string {
		const url = new URL(baseUrl, 'http://localhost');
		if (newOffset > 0) {
			url.searchParams.set('offset', String(newOffset));
		} else {
			url.searchParams.delete('offset');
		}
		return url.pathname + url.search;
	}

	const previousUrl = $derived(buildUrl(Math.max(0, offset - limit)));
	const nextUrl = $derived(buildUrl(offset + limit));
</script>

{#if showPagination}
	<nav class="flex justify-between items-center mt-6" aria-label="Pagination">
		{#if showPrevious}
			<a
				href={previousUrl}
				class="text-ab-blue hover:text-ab-dark-blue font-medium text-sm transition-colors"
			>
				&larr; Previous
			</a>
		{:else}
			<span></span>
		{/if}

		{#if showNext}
			<a
				href={nextUrl}
				class="text-ab-blue hover:text-ab-dark-blue font-medium text-sm transition-colors"
			>
				Next &rarr;
			</a>
		{:else}
			<span></span>
		{/if}
	</nav>
{/if}
