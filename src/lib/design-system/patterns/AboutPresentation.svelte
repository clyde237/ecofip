<script lang="ts">
	import { onMount } from 'svelte';
	import Container from '../components/Container.svelte';
	import { ArrowRight } from '@lucide/svelte';
	import type { AboutPresentationProps } from '../types.js';

	let {
		eyebrow = 'Qui sommes-nous ?',
		title = 'Les Économes',
		highlightedTitle = 'Fidèles et Prudents',
		paragraph1 = '« Quel est donc l’économe fidèle et prudent que le maître établira sur ses gens, pour leur donner la nourriture au temps convenable ? » — Luc 12:42',
		paragraph2 = '« Jésus parcourait toutes les villes et les villages, enseignant dans les synagogues, prêchant la bonne nouvelle du royaume, et guérissant toute maladie et toute infirmité. » — Matthieu 9:35',
		quoteText = 'ECOFIP (Les Économes Fidèles et Prudents) est un ministère chrétien missionnaire fondé sur ces principes bibliques. Nous sommes appelés à être de bons gestionnaires de l’Évangile, parcourant les villes et villages pour annoncer la Bonne Nouvelle, enseigner et apporter la guérison par la puissance de Dieu.',
		image = '/pasteur-valery-tchamekwen.png',
		imageAlt = 'Pasteur Valery Tchamekwen — Fondateur & Coordinateur National ECOFIP',
		badgeTitle = 'Pasteur Valery Tchamekwen',
		badgeSubtitle = 'Fondateur & Coordinateur National',
		ctaLabel = 'Découvrir notre histoire',
		ctaHref = '#histoire',
		class: customClass = ''
	}: AboutPresentationProps = $props();

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
	aria-labelledby="about-presentation-heading"
>
	<Container>
		<div class="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-14 xl:gap-20">
			<!-- Colonne Gauche (6 colonnes) : Photo du Porteur de Vision avec Badge flottant -->
			<div class="lg:col-span-6 xl:col-span-6">
				<div class="relative mx-auto max-w-lg lg:max-w-none">
					<!-- Halo décoratif d'arrière-plan doux -->
					<div
						class="pointer-events-none absolute -top-6 -left-6 h-64 w-64 rounded-full bg-brand-subtle/80 blur-3xl"
						aria-hidden="true"
					></div>

					<!-- Conteneur d'image principal arrondi -->
					<div
						class="group relative overflow-hidden rounded-3xl border border-gray-100 bg-surface shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-700 ease-out {isVisible
							? 'translate-y-0 opacity-100'
							: 'translate-y-8 opacity-0'}"
					>
						<div class="aspect-[4/4.8] w-full sm:aspect-[4/4.6] lg:aspect-[4/4.8]">
							<img
								src={image}
								alt={imageAlt}
								class="h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03]"
								loading="lazy"
							/>
						</div>

						<!-- Léger voile de contraste en bas pour faire ressortir le badge -->
						<div
							class="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/40 to-transparent"
							aria-hidden="true"
						></div>
					</div>

					<!-- Carte flottante en bas à droite (Badge porteur de vision / Notre appel) -->
					<div
						class="absolute -right-3 -bottom-5 z-20 max-w-[280px] rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_15px_35px_rgba(0,0,0,0.12)] backdrop-blur-md transition-all duration-700 sm:-right-6 sm:-bottom-6 sm:max-w-[320px] sm:p-5 {isVisible
							? 'translate-y-0 opacity-100'
							: 'translate-y-8 opacity-0'}"
						style="transition-delay: 200ms;"
					>
						<div class="flex flex-col">
							<span
								class="font-display text-lg font-bold tracking-tight text-brand-primary sm:text-xl"
							>
								{badgeTitle}
							</span>
							<span class="mt-0.5 font-body text-xs font-medium text-text-secondary sm:text-sm">
								{badgeSubtitle}
							</span>
						</div>
					</div>
				</div>
			</div>

			<!-- Colonne Droite (6 colonnes) : Présentation éditoriale & Citation -->
			<div class="lg:col-span-6 xl:col-span-6">
				<div
					class="transition-all duration-700 ease-out {isVisible
						? 'translate-y-0 opacity-100'
						: 'translate-y-8 opacity-0'}"
					style="transition-delay: 150ms;"
				>
					<!-- Eyebrow avec trait rouge distinctif -->
					{#if eyebrow}
						<div class="mb-4 flex items-center gap-2.5">
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
						id="about-presentation-heading"
						class="font-display text-3xl leading-[1.18] font-extrabold tracking-tight text-text-primary sm:text-4xl lg:text-[44px]"
					>
						{title}
						{#if highlightedTitle}
							<span class="block text-brand-primary">
								{highlightedTitle}
							</span>
						{/if}
					</h2>

					<!-- Corps du texte : Paragraphes de présentation du mouvement -->
					<div
						class="mt-6 space-y-4 font-body text-sm leading-relaxed text-text-secondary sm:text-base sm:leading-relaxed"
					>
						{#if paragraph1}
							<p>
								{paragraph1}
							</p>
						{/if}

						{#if paragraph2}
							<p>
								{paragraph2}
							</p>
						{/if}
					</div>

					<!-- Bloc Citation d'ancrage avec bordure rouge latérale -->
					{#if quoteText}
						<div class="mt-6 border-l-4 border-brand-primary py-1 pl-4 sm:pl-5">
							<blockquote
								class="font-display text-base font-medium text-text-primary sm:text-lg sm:leading-relaxed"
							>
								{quoteText}
							</blockquote>
						</div>
					{/if}

					<!-- Bouton Call To Action -->
					{#if ctaLabel}
						<div class="mt-8 pt-2 sm:mt-10">
							<a
								href={ctaHref}
								class="group inline-flex cursor-pointer items-center gap-2 rounded-xl bg-brand-primary px-7 py-3.5 font-body text-sm font-bold text-white shadow-md transition-all duration-200 select-none hover:translate-x-0.5 hover:bg-brand-primary-hover hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-secondary active:bg-[#a6000a] sm:text-base"
							>
								<span>{ctaLabel}</span>
								<ArrowRight
									size={16}
									class="transition-transform duration-200 group-hover:translate-x-1"
									aria-hidden="true"
								/>
							</a>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</Container>
</section>
