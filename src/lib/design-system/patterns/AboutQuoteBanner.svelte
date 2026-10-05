<script lang="ts">
	import { onMount } from 'svelte';
	import Container from '../components/Container.svelte';
	import { Quote } from '@lucide/svelte';
	import type { AboutQuoteBannerProps } from '../types.js';

	let {
		quote = '« Quel est donc l’économe fidèle et prudent que le maître établira sur ses gens, pour leur donner la nourriture au temps convenable ? »',
		subtitle = 'Le fondement biblique qui guide notre appel à être de bons gestionnaires de l’Évangile au Cameroun.',
		reference = 'Luc 12:42',
		class: customClass = ''
	}: AboutQuoteBannerProps = $props();

	let sectionEl: HTMLElement | null = $state(null);
	let isVisible = $state(false);

	onMount(() => {
		const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (prefersReducedMotion) {
			isVisible = true;
			return;
		}

		if (!sectionEl) {
			isVisible = true;
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						isVisible = true;
						observer.disconnect();
						break;
					}
				}
			},
			{ threshold: 0.2 }
		);

		observer.observe(sectionEl);

		return () => {
			observer.disconnect();
		};
	});
</script>

<section
	bind:this={sectionEl}
	class="relative overflow-hidden bg-brand-primary py-16 text-white sm:py-20 lg:py-24 {customClass}"
	aria-labelledby="about-quote-heading"
>
	<!-- Subtils effets d'ambiance lumineux et de profondeur -->
	<div
		class="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-white/10 blur-3xl"
		aria-hidden="true"
	></div>
	<div
		class="pointer-events-none absolute -right-24 -bottom-24 h-96 w-96 rounded-full bg-black/20 blur-3xl"
		aria-hidden="true"
	></div>

	<!-- Léger dégradé sombre en bas pour un fini haut de gamme -->
	<div
		class="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/0 via-transparent to-black/15"
		aria-hidden="true"
	></div>

	<Container class="relative z-10">
		<div
			class="mx-auto max-w-4xl text-center transition-all duration-700 ease-out {isVisible
				? 'translate-y-0 opacity-100'
				: 'translate-y-8 opacity-0'}"
		>
			<!-- Icône de guillemets stylisée centrée -->
			<div class="mb-5 flex justify-center sm:mb-6">
				<Quote
					size={40}
					class="rotate-180 text-white/70"
					fill="currentColor"
					strokeWidth={1}
					aria-hidden="true"
				/>
			</div>

			<!-- Citation biblique principale en grand Playfair Display -->
			<blockquote
				id="about-quote-heading"
				class="font-display text-2xl leading-[1.28] font-extrabold tracking-tight text-white sm:text-3xl md:text-4xl lg:text-[42px]"
			>
				{quote}
			</blockquote>

			<!-- Sous-titre explicatif -->
			{#if subtitle}
				<p class="mt-5 font-body text-xs leading-relaxed text-white/90 sm:text-sm md:text-base">
					{subtitle}
				</p>
			{/if}

			<!-- Référence biblique solennelle -->
			{#if reference}
				<p
					class="mt-3 font-body text-xs font-bold tracking-wider text-white/80 uppercase sm:text-sm"
				>
					{reference}
				</p>
			{/if}
		</div>
	</Container>
</section>
