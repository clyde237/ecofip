<script lang="ts">
	import { onMount } from 'svelte';
	import Container from '../components/Container.svelte';
	import { Clock, MapPin, ArrowRight } from '@lucide/svelte';
	import type { EventItem, EventsSectionProps } from '../types.js';

	const defaultEvents: EventItem[] = [
		{
			id: 'croisade-evangelisation',
			title: 'Croisade d’évangélisation',
			dateDay: '15',
			dateMonthYear: 'OCT 2026',
			time: '18h00 – 22h00',
			location: 'Yaoundé, Cameroun',
			ctaLabel: 'Participer',
			href: '/nos-evenements',
			image: '/event-croisade.jpg',
			imageAlt: 'Scène de la croisade d’évangélisation avec chants et adoration'
		},
		{
			id: 'seminaire-formation',
			title: 'Séminaire de formation',
			dateDay: '22',
			dateMonthYear: 'OCT 2026',
			time: '09h00 – 16h00',
			location: 'Centre de formation',
			ctaLabel: 'S’inscrire',
			href: '/nos-evenements',
			image: '/event-seminaire.jpg',
			imageAlt: 'Étude biblique et séminaire de formation de disciples'
		},
		{
			id: 'camp-jeunes',
			title: 'Camp des jeunes',
			dateDay: '05',
			dateMonthYear: 'NOV 2026',
			time: '3 jours',
			location: 'Mont Fébé, Yaoundé',
			ctaLabel: 'En savoir plus',
			href: '/nos-evenements',
			image: '/event-camp.jpg',
			imageAlt: 'Rassemblement de jeunes chrétiens au Mont Fébé'
		}
	];

	let {
		eyebrow = 'NOS PROJETS & ÉVÉNEMENTS',
		title = 'Des actions concrètes pour transformer les vies',
		viewAllLabel = 'Voir tous les projets',
		viewAllHref = '/projets-missions',
		events = defaultEvents,
		class: customClass = ''
	}: EventsSectionProps = $props();

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
	class="bg-[#fafafc] py-16 sm:py-20 lg:py-28 {customClass}"
	aria-labelledby="events-section-heading"
>
	<Container>
		<!-- En-tête de section avec Titre et Bouton "Voir tous les projets" -->
		<div
			class="flex flex-col gap-6 transition-all duration-700 sm:flex-row sm:items-end sm:justify-between {isVisible
				? 'translate-y-0 opacity-100'
				: 'translate-y-6 opacity-0'}"
		>
			<div class="max-w-2xl">
				{#if eyebrow}
					<span
						class="font-body text-xs font-bold tracking-[0.2em] text-brand-primary uppercase sm:text-sm"
					>
						{eyebrow}
					</span>
				{/if}
				<h2
					id="events-section-heading"
					class="mt-2.5 font-display text-3xl font-bold tracking-tight text-text-primary sm:text-4xl lg:text-[44px] lg:leading-[1.18]"
				>
					{title}
				</h2>
			</div>

			<!-- Bouton Voir tous les projets (contour rouge avec flèche) -->
			{#if viewAllLabel}
				<div class="shrink-0">
					<a
						href={viewAllHref}
						class="group inline-flex cursor-pointer items-center gap-2 rounded-xl border border-brand-primary/30 bg-white px-5 py-3 text-sm font-bold text-brand-primary shadow-xs transition-all duration-200 select-none hover:border-brand-primary hover:bg-brand-subtle hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-secondary active:bg-brand-subtle"
					>
						<span>{viewAllLabel}</span>
						<ArrowRight
							size={16}
							class="transition-transform duration-200 group-hover:translate-x-1"
							aria-hidden="true"
						/>
					</a>
				</div>
			{/if}
		</div>

		<!-- Grille des 3 cartes d'événements -->
		<div class="mt-10 grid grid-cols-1 gap-6 sm:mt-12 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
			{#each events as event, index (event.id)}
				<article
					class="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_10px_30px_-10px_rgba(0,0,0,0.06)] transition-all duration-500 hover:-translate-y-1 hover:shadow-xl {isVisible
						? 'translate-y-0 opacity-100'
						: 'translate-y-8 opacity-0'}"
					style="transition-delay: {index * 120}ms;"
				>
					<!-- Zone Média avec Badge de date rouge -->
					<div class="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
						<img
							src={event.image}
							alt={event.imageAlt || event.title}
							class="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
							loading="lazy"
						/>

						<!-- Badge Date rouge au coin supérieur gauche -->
						<div
							class="absolute top-3.5 left-3.5 min-w-[52px] rounded-xl bg-brand-primary px-2.5 py-1.5 text-center text-white shadow-md select-none"
							aria-label="Date : {event.dateDay} {event.dateMonthYear}"
						>
							<span class="block font-display text-xl leading-none font-black sm:text-2xl">
								{event.dateDay}
							</span>
							<span
								class="mt-1 block font-body text-[10px] font-bold tracking-wider text-white/90 uppercase"
							>
								{event.dateMonthYear}
							</span>
						</div>
					</div>

					<!-- Contenu de la carte -->
					<div class="flex flex-1 flex-col p-5 sm:p-6">
						<h3
							class="font-display text-lg font-bold text-text-primary transition-colors duration-200 group-hover:text-brand-primary sm:text-xl"
						>
							<a href={event.href} class="hover:underline focus:outline-none">
								{event.title}
							</a>
						</h3>

						<!-- Lignes de métadonnées (Horaires et Lieu) -->
						<div class="mt-3 space-y-1.5 font-body text-xs text-text-secondary sm:text-[13px]">
							<div class="flex items-center gap-1.5">
								<Clock size={14} class="shrink-0 text-text-secondary" aria-hidden="true" />
								<span>{event.time}</span>
							</div>
							<div class="flex items-center gap-1.5">
								<MapPin size={14} class="shrink-0 text-text-secondary" aria-hidden="true" />
								<span>{event.location}</span>
							</div>
						</div>

						<!-- Bouton d'action Outline -->
						<div class="mt-6 pt-2">
							<a
								href={event.href}
								class="inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-brand-primary/30 px-4 py-2.5 text-center font-body text-sm font-bold text-brand-primary transition-all duration-200 select-none hover:border-brand-primary hover:bg-brand-primary hover:text-white active:bg-[#a6000a]"
							>
								<span>{event.ctaLabel}</span>
								<span aria-hidden="true">→</span>
							</a>
						</div>
					</div>
				</article>
			{/each}
		</div>
	</Container>
</section>
