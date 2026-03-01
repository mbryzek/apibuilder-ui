<script lang="ts">
	/**
	 * Toast Component
	 * Displays a temporary notification message that auto-dismisses
	 */

	import { onMount } from 'svelte';

	interface Props {
		message: string;
		variant?: 'success' | 'error' | 'info';
		duration?: number;
		onDismiss?: () => void;
	}

	let { message, variant = 'success', duration = 5000, onDismiss }: Props = $props();

	let visible = $state(true);

	onMount(() => {
		const timer = setTimeout(() => {
			visible = false;
			onDismiss?.();
		}, duration);

		return () => clearTimeout(timer);
	});

	function handleDismiss() {
		visible = false;
		onDismiss?.();
	}

	const variantClasses = $derived(
		variant === 'success'
			? 'bg-green-50 border-green-200 text-green-800'
			: variant === 'error'
				? 'bg-red-50 border-red-200 text-red-800'
				: 'bg-blue-50 border-blue-200 text-blue-800',
	);

	const iconColor = $derived(
		variant === 'success'
			? 'text-green-400'
			: variant === 'error'
				? 'text-red-400'
				: 'text-blue-400',
	);
</script>

{#if visible}
	<div
		class="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4 animate-slide-down"
		role="status"
		aria-live={variant === 'error' ? 'assertive' : 'polite'}
		aria-atomic="true"
	>
		<div class="border rounded-lg shadow-lg p-4 flex items-start gap-3 {variantClasses}">
			{#if variant === 'success'}
				<svg class="h-5 w-5 {iconColor} flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
			{:else if variant === 'error'}
				<svg class="h-5 w-5 {iconColor} flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
			{:else}
				<svg class="h-5 w-5 {iconColor} flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
			{/if}

			<p class="flex-1 text-sm font-medium">{message}</p>

			<button
				type="button"
				onclick={handleDismiss}
				class="flex-shrink-0 hover:opacity-70"
				aria-label="Dismiss"
			>
				<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		</div>
	</div>
{/if}

<style>
	@keyframes slide-down {
		from {
			opacity: 0;
			transform: translate(-50%, -100%);
		}
		to {
			opacity: 1;
			transform: translate(-50%, 0);
		}
	}

	.animate-slide-down {
		animation: slide-down 0.3s ease-out;
	}
</style>
