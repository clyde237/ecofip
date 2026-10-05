<script lang="ts">
	import { onMount } from 'svelte';
	import Container from '../components/Container.svelte';
	import { Heart, ArrowRight } from '@lucide/svelte';
	import type { DonationCtaProps } from '../types.js';

	let {
		eyebrow = 'SOUTENEZ LA MISSION',
		title = 'Faites un don, semez dans l’œuvre de Dieu',
		description = 'Votre générosité nous permet d’organiser des croisades, soutenir les communautés, former des disciples et poursuivre la mission.',
		ctaLabel = 'Faire un don maintenant',
		ctaHref = '#faire-un-don',
		secondaryCtaLabel,
		secondaryCtaHref,
		onSecondaryCtaClick,
		backgroundImage = '/donate-banner-bg.jpg',
		class: customClass = '',
		onCtaClick
	}: DonationCtaProps = $props();

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
			{ threshold: 0.15 }
		);

		observer.observe(sectionEl);

		return () => {
			observer.disconnect();
		};
	});
</script>

<section
	bind:this={sectionEl}
	class="relative overflow-hidden bg-brand-primary py-16 sm:py-20 lg:py-24 {customClass}"
	aria-labelledby="donation-cta-heading"
>
	<!-- Image de fond avec overlay dégradé gauche -> droite (forte opacité à gauche, faible intensité à droite) -->
	<div class="absolute inset-0 z-0 overflow-hidden select-none">
		<img
			src={backgroundImage}
			alt="Communauté et mission sur le terrain"
			class="h-full w-full object-cover object-center transition-transform duration-1000 ease-out {isVisible
				? 'scale-100'
				: 'scale-105'}"
			loading="lazy"
		/>

		<!-- Dégradé horizontal : #D90416 quasi opaque à gauche (98%) vers une intensité beaucoup plus douce à droite (28%) -->
		<div
			class="absolute inset-0 bg-gradient-to-r from-[#D90416] from-35% via-[#D90416]/85 via-65% to-[#D90416]/25"
			aria-hidden="true"
		></div>

		<!-- Forme graphique circulaire subtile sur la droite calquée sur la maquette -->
		<div
			class="pointer-events-none absolute top-1/2 -right-24 h-[700px] w-[700px] -translate-y-1/2 rounded-full border border-white/15 bg-white/[0.04] backdrop-blur-[1px]"
			aria-hidden="true"
		></div>
		<div
			class="pointer-events-none absolute top-1/2 -right-48 h-[950px] w-[950px] -translate-y-1/2 rounded-full border border-white/10"
			aria-hidden="true"
		></div>
	</div>

	<!-- Contenu interactif au premier plan -->
	<Container class="relative z-10">
		<div
			class="flex flex-col gap-8 transition-all duration-700 lg:flex-row lg:items-center lg:justify-between {isVisible
				? 'translate-y-0 opacity-100'
				: 'translate-y-6 opacity-0'}"
		>
			<!-- Zone Texte (Gauche) -->
			<div class="max-w-2xl text-white">
				{#if eyebrow}
					<span
						class="font-body text-xs font-bold tracking-[0.2em] text-white/90 uppercase sm:text-sm"
					>
						{eyebrow}
					</span>
				{/if}

				<h2
					id="donation-cta-heading"
					class="mt-2.5 font-display text-3xl font-bold tracking-tight text-white drop-shadow-xs sm:text-4xl lg:text-[44px] lg:leading-[1.15]"
				>
					{title}
				</h2>

				{#if description}
					<p class="mt-4 font-body text-sm leading-relaxed text-white/90 sm:text-base">
						{description}
					</p>
				{/if}
			</div>

			<!-- Boutons d'action (Droite) -->
			<div class="flex shrink-0 flex-wrap items-center gap-3.5 lg:pl-6">
				{#if secondaryCtaLabel}
					{#if onSecondaryCtaClick}
						<button
							type="button"
							onclick={onSecondaryCtaClick}
							class="group inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/40 bg-white/10 px-6 py-4 text-sm font-bold text-white backdrop-blur-sm transition-all duration-200 select-none hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:text-base"
						>
							<span>{secondaryCtaLabel}</span>
						</button>
					{:else}
						<a
							href={secondaryCtaHref}
							class="group inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/40 bg-white/10 px-6 py-4 text-sm font-bold text-white backdrop-blur-sm transition-all duration-200 select-none hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:text-base"
						>
							<span>{secondaryCtaLabel}</span>
						</a>
					{/if}
				{/if}

				{#if onCtaClick}
					<button
						type="button"
						onclick={onCtaClick}
						class="group inline-flex cursor-pointer items-center gap-2.5 rounded-xl bg-white px-7 py-4 text-sm font-bold text-brand-primary shadow-xl transition-all duration-200 select-none hover:scale-[1.03] hover:bg-neutral-50 hover:shadow-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:scale-[0.98] sm:text-base"
					>
						<Heart
							size={18}
							class="fill-brand-primary text-brand-primary transition-transform duration-200 group-hover:scale-110"
						/>
						<span>{ctaLabel}</span>
						<ArrowRight
							size={16}
							class="transition-transform duration-200 group-hover:translate-x-1"
							aria-hidden="true"
						/>
					</button>
				{:else}
					<a
						href={ctaHref}
						class="group inline-flex cursor-pointer items-center gap-2.5 rounded-xl bg-white px-7 py-4 text-sm font-bold text-brand-primary shadow-xl transition-all duration-200 select-none hover:scale-[1.03] hover:bg-neutral-50 hover:shadow-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:scale-[0.98] sm:text-base"
					>
						<Heart
							size={18}
							class="fill-brand-primary text-brand-primary transition-transform duration-200 group-hover:scale-110"
						/>
						<span>{ctaLabel}</span>
						<ArrowRight
							size={16}
							class="transition-transform duration-200 group-hover:translate-x-1"
							aria-hidden="true"
						/>
					</a>
				{/if}
			</div>
		</div>
	</Container>
</section>
