<script lang="ts">
	import { onMount } from 'svelte';
	import Container from '../components/Container.svelte';
	import { ArrowRight } from '@lucide/svelte';
	import type { AboutCtaSectionProps } from '../types.js';

	let {
		eyebrow = 'PARTICIPER À LA MISSION',
		title = 'Vous souhaitez avancer avec nous ?',
		subtitle = 'Rejoignez une communauté engagée pour servir, apprendre, prier et contribuer à une mission qui place l’Évangile au centre.',
		ctaLabel = 'Nous rejoindre',
		ctaHref = '/nous-rejoindre',
		class: customClass = ''
	}: AboutCtaSectionProps = $props();

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
	id="rejoindre"
	bind:this={sectionEl}
	class="relative overflow-hidden bg-[#f4f7fb] py-20 sm:py-24 lg:py-32 {customClass}"
	aria-labelledby="about-cta-heading"
>
	<!-- Subtils halos d'ambiance lumineux d'arrière-plan -->
	<div
		class="pointer-events-none absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-brand-primary/5 blur-3xl"
		aria-hidden="true"
	></div>

	<Container>
		<div
			class="mx-auto max-w-3xl text-center transition-all duration-700 ease-out {isVisible
				? 'translate-y-0 opacity-100'
				: 'translate-y-8 opacity-0'}"
		>
			<!-- Surtitre avec trait rouge centré -->
			{#if eyebrow}
				<div class="mb-4 flex items-center justify-center gap-2.5">
					<span class="h-0.5 w-6 rounded-full bg-brand-primary" aria-hidden="true"></span>
					<span
						class="font-body text-xs font-bold tracking-wider text-brand-primary uppercase sm:text-sm"
					>
						{eyebrow}
					</span>
				</div>
			{/if}

			<!-- Grand Titre H2 en Playfair Display -->
			<h2
				id="about-cta-heading"
				class="font-display text-3xl leading-[1.18] font-extrabold tracking-tight text-text-primary sm:text-4xl md:text-5xl lg:text-[48px]"
			>
				{title}
			</h2>

			<!-- Sous-titre descriptif -->
			{#if subtitle}
				<p
					class="mt-5 font-body text-sm leading-relaxed text-text-secondary sm:text-base md:text-lg"
				>
					{subtitle}
				</p>
			{/if}

			<!-- Bouton Call To Action centré -->
			{#if ctaLabel}
				<div class="mt-8 flex justify-center sm:mt-10">
					<a
						href={ctaHref}
						class="group inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-brand-primary px-8 py-4 font-body text-base font-bold text-white shadow-[0_12px_28px_rgba(237,7,20,0.32)] transition-all duration-200 select-none hover:translate-x-0.5 hover:bg-brand-primary-hover hover:shadow-[0_18px_38px_rgba(237,7,20,0.42)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-secondary active:bg-[#a6000a]"
					>
						<span>{ctaLabel}</span>
						<ArrowRight
							size={18}
							class="transition-transform duration-200 group-hover:translate-x-1"
							aria-hidden="true"
						/>
					</a>
				</div>
			{/if}
		</div>
	</Container>
</section>
