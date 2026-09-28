<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { Header, Footer, ToastContainer } from '$lib';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="flex min-h-screen flex-col bg-surface/30">
	<Header />
	<main class="flex-1 pt-20">
		{@render children()}
	</main>
	<Footer />
	<ToastContainer />
</div>
