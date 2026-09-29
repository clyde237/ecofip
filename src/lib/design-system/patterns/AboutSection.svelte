<script lang="ts">
	import { onMount } from 'svelte';
	import Container from '../components/Container.svelte';
	import { CircleDot, Target, Diamond, ArrowRight } from '@lucide/svelte';
	import type { AboutPillar, AboutSectionProps } from '../types.js';

	const defaultPillars: AboutPillar[] = [
		{
			id: 'vision',
			title: 'Notre vision',
			description: 'Toucher les nations par l’Évangile.',
			icon: CircleDot
		},
		{
			id: 'mission',
			title: 'Notre mission',
			description: 'Former des leaders et des disciples.',
			icon: Target
		},
		{
			id: 'valeurs',
			title: 'Nos valeurs',
			description: 'Foi, amour, unité et excellence.',
			icon: Diamond
		}
	];

	let {
		eyebrow = "À PROPOS D'ECOFIP",
		title = 'Une mission fondée sur la',
		highlightedTitle = 'Parole de Dieu',
		description = 'ECOFIP est un ministère chrétien évangélique fondé sur des principes bibliques. Nous sommes appelés à être des gestionnaires fidèles et prudents pour annoncer la Bonne Nouvelle, enseigner et apporter la guérison par la puissance de Dieu.',
		image = '/about-mission.jpg',
		imageAlt = 'Moments de célébration, louange et adoration pour Jésus',
		ctaLabel = 'Découvrir notre histoire',
		ctaHref = '/a-propos',
		pillars = defaultPillars,
		class: customClass = ''
	}: AboutSectionProps = $props();

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
	class="bg-white py-16 sm:py-20 lg:py-28 {customClass}"
	aria-labelledby="about-section-heading"
>
	<Container>
		<div class="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12 xl:gap-16">
			<!-- Colonne Gauche : Image immersive avec coins arrondis et ombre douce -->
			<div class="lg:col-span-6 xl:col-span-6">
				<div
					class="group relative overflow-hidden rounded-2xl shadow-[0_20px_50px_-15px_rgba(0,0,0,0.16)] transition-all duration-700 sm:rounded-3xl {isVisible
						? 'translate-y-0 opacity-100'
						: 'translate-y-8 opacity-0'}"
				>
					<div class="aspect-[4/3] w-full sm:aspect-[16/10] lg:aspect-[4/3]">
						<img
							src={image}
							alt={imageAlt}
							class="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
							loading="lazy"
						/>
					</div>
					<!-- Léger filtre d'ambiance en bas de l'image -->
					<div
						class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent"
						aria-hidden="true"
					></div>
				</div>
			</div>

			<!-- Colonne Droite : Textes, Piliers et Call-to-Action -->
			<div
				class="transition-all duration-700 lg:col-span-6 xl:col-span-6 {isVisible
					? 'translate-y-0 opacity-100'
					: 'translate-y-8 opacity-0'}"
				style="transition-delay: 150ms;"
			>
				<!-- Surtitre / Eyebrow -->
				{#if eyebrow}
					<span
						class="font-body text-xs font-bold tracking-[0.2em] text-brand-primary uppercase sm:text-sm"
					>
						{eyebrow}
					</span>
				{/if}

				<!-- Titre H2 avec mise en exergue rouge -->
				<h2
					id="about-section-heading"
					class="mt-3.5 font-display text-3xl font-bold tracking-tight text-text-primary sm:text-4xl lg:text-[44px] lg:leading-[1.18]"
				>
					{title}<br class="hidden sm:inline" />
					<span class="text-brand-primary">{highlightedTitle}</span>
				</h2>

				<!-- Paragraphe descriptif -->
				{#if description}
					<p
						class="mt-5 max-w-xl font-body text-sm leading-relaxed text-text-secondary sm:text-base sm:leading-relaxed"
					>
						{description}
					</p>
				{/if}

				<!-- Rangée des 3 piliers (Vision, Mission, Valeurs) -->
				<div class="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-3 lg:gap-4">
					{#each pillars as pillar (pillar.id)}
						<div class="flex items-start gap-3 sm:gap-2.5 lg:gap-3">
							<!-- Pastille d'icône douce circulaire -->
							<div
								class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-subtle sm:h-10 sm:w-10"
							>
								{#if pillar.icon}
									<pillar.icon size={18} class="text-brand-primary" aria-hidden="true" />
								{/if}
							</div>

							<!-- Titre et sous-texte du pilier -->
							<div class="min-w-0">
								<h3 class="font-body text-xs font-bold text-text-primary sm:text-sm">
									{pillar.title}
								</h3>
								<p class="mt-0.5 font-body text-[11px] leading-snug text-text-secondary sm:text-xs">
									{pillar.description}
								</p>
							</div>
						</div>
					{/each}
				</div>

				<!-- Bouton d'action principal -->
				{#if ctaLabel}
					<div class="mt-8 sm:mt-9">
						<a
							href={ctaHref}
							class="group inline-flex cursor-pointer items-center gap-2 rounded-xl bg-brand-primary px-6 py-3.5 text-sm font-bold text-white shadow-md transition-all duration-200 select-none hover:bg-brand-primary-hover hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-secondary active:bg-[#a6000a] sm:text-base"
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
		</div>
	</Container>
</section>
