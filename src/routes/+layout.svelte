<script lang="ts">
	import '../app.css';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Toast from '$lib/components/Toast.svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import type { Snippet } from 'svelte';

	interface Props {
		data: { session?: { id: string; user: { id: string; person: { email?: { address: string } } } } };
		children: Snippet;
	}

	let { data, children }: Props = $props();

	const session = $derived(data?.session);

	let flashMessage = $state<string | null>(null);
	let flashVariant = $state<'success' | 'error' | 'info'>('success');

	$effect(() => {
		const msg = $page.url.searchParams.get('flash');
		const variant = $page.url.searchParams.get('flash_type') as 'success' | 'error' | 'info' | null;
		if (msg) {
			flashMessage = msg;
			flashVariant = variant || 'success';
			const newUrl = new URL($page.url);
			newUrl.searchParams.delete('flash');
			newUrl.searchParams.delete('flash_type');
			goto(newUrl.pathname + newUrl.search, {
				replaceState: true,
				noScroll: true,
			});
		}
	});

	function handleDismissFlash() {
		flashMessage = null;
	}
</script>

<svelte:head>
	<title>API Builder</title>
</svelte:head>

<div class="min-h-screen flex flex-col">
	<Header {session} />

	{#if flashMessage}
		<Toast
			message={flashMessage}
			variant={flashVariant}
			onDismiss={handleDismissFlash}
		/>
	{/if}

	<main class="flex-1">
		{@render children()}
	</main>

	<Footer />
</div>
