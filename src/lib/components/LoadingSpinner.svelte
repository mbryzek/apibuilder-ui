<script lang="ts">
	/**
	 * Loading Spinner Component
	 * Animated SVG spinner with optional text
	 */

	interface Props {
		size?: 'sm' | 'md' | 'lg';
		text?: string;
	}

	let { size = 'md', text }: Props = $props();

	const sizeClasses = $derived(
		size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-10 w-10' : 'h-6 w-6',
	);
</script>

<div class="flex items-center justify-center gap-2">
	<svg
		class="animate-spin {sizeClasses} text-ab-blue"
		xmlns="http://www.w3.org/2000/svg"
		fill="none"
		viewBox="0 0 24 24"
		aria-hidden="true"
	>
		<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
		<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
	</svg>
	<span class="sr-only">Loading</span>
	{#if text}
		<span class="text-ab-gray text-sm">{text}</span>
	{/if}
</div>
