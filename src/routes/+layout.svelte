<script lang="ts">
	import './layout.css';
	import { page } from '$app/state';
	import { Header, Footer, ToastContainer } from '$lib';

	let { children } = $props();

	const isAdminRoute = $derived(page.url.pathname.startsWith('/admin'));
</script>

<svelte:head>
	<link rel="icon" type="image/jpeg" href="/logo_ecofip.jpg" />
	<link rel="apple-touch-icon" href="/logo_ecofip.jpg" />
</svelte:head>

{#if isAdminRoute}
	<div class="min-h-screen bg-[#f8fafc]">
		{@render children()}
	</div>
	<ToastContainer />
{:else}
	<div class="flex min-h-screen flex-col bg-surface/30">
		<Header />
		<main class="flex-1 pt-20">
			{@render children()}
		</main>
		<Footer />
		<ToastContainer />
	</div>
{/if}
