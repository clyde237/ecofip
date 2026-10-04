<script lang="ts">
	import { onMount } from 'svelte';
	import {
		Calendar,
		MapPin,
		Clock,
		Users,
		ArrowRight,
		ShieldCheck,
		HeartHandshake,
		Sparkles,
		Eye
	} from '@lucide/svelte';
	import type { DetailedEventItem, EventsSpotlightProps } from '../types.js';
	import FlipCountdown from '../components/FlipCountdown.svelte';
	import { getEventTargetDate } from '$lib/utils/eventDate.js';

	const defaultFeaturedEvent: DetailedEventItem = {
		id: 'croisade-nationale-yaounde-2026',
		slug: 'croisade-nationale-yaounde-2026',
		title: 'Grande Croisade Nationale d’Évangélisation, Foi & Guérison',
		category: 'croisade',
		categoryLabel: 'Événement Phare 2026',
		dateDay: '15-18',
		dateMonth: 'OCTOBRE',
		dateYear: '2026',
		time: '18h00 – 22h00 chaque soir',
		location: 'Esplanade du Stade Ahmadou Ahidjo',
		city: 'Yaoundé, Cameroun',
		image: '/event-croisade.jpg',
		imageAlt: 'Grande Croisade d’Évangélisation et de Réveil',
		status: 'upcoming',
		description:
			'4 soirées exceptionnelles d’adoration, de proclamation de l’Évangile avec puissance, délivrances et guérisons. Cliniques médicales gratuites offertes chaque matin.',
		speakers: ['Pasteur Valéry Tchamekwen', 'Évangélistes & Médecins missionnaires'],
		isFree: true,
		isFeatured: true
	};

	let {
		event = defaultFeaturedEvent,
		eyebrow = 'ÉVÉNEMENT À LA UNE',
		onRegister,
		class: customClass = ''
	}: EventsSpotlightProps = $props();

	let sectionEl: HTMLElement | null = $state(null);
	let isVisible = $state(false);

	let targetDate = $derived(
		event?.targetDate || (event ? getEventTargetDate(event) : new Date('2026-10-15T18:00:00'))
	);

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
			{ threshold: 0.1 }
		);

		observer.observe(sectionEl);

		return () => {
			observer.disconnect();
		};
	});
</script>

<!-- SECTION PLEINE LARGEUR D'ÉCRAN (W-FULL SOUS LA HERO) -->
<section
	id="a-la-une"
	bind:this={sectionEl}
	class="relative w-full overflow-hidden bg-[#070e17] py-12 text-white sm:py-16 lg:py-20 {customClass}"
	aria-labelledby="events-spotlight-heading"
>
	<!-- ARRIÈRE-PLAN AVEC MOTIF VISUEL SUBTIL ET DÉGRADÉ -->
	<div
		class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(139,30,30,0.35),rgba(255,255,255,0))]"
		aria-hidden="true"
	></div>

	<!-- Halo lumineux d'ambiance -->
	<div
		class="pointer-events-none absolute top-1/4 -left-32 h-96 w-96 rounded-full bg-brand-primary/20 blur-3xl"
		aria-hidden="true"
	></div>
	<div
		class="pointer-events-none absolute -right-32 bottom-10 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl"
		aria-hidden="true"
	></div>

	<!-- CONTENEUR PLEINE LARGEUR AVEC PADDING LATÉRAL ADAPTATIF -->
	<div
		class="relative z-10 mx-auto w-full max-w-[1536px] px-4 transition-all duration-700 ease-out sm:px-6 md:px-8 lg:px-12 {isVisible
			? 'translate-y-0 opacity-100'
			: 'translate-y-8 opacity-0'}"
	>
		<!-- EN-TÊTE DE LA SECTION PLEINE LARGEUR -->
		<div
			class="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6 sm:mb-10"
		>
			<div class="flex items-center gap-3">
				<span
					class="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-500/15 px-3.5 py-1 text-xs font-black tracking-widest text-amber-300 uppercase shadow-xs backdrop-blur-xs"
				>
					<Sparkles size={14} class="fill-amber-400 text-amber-400" />
					<span>{eyebrow}</span>
				</span>
				<span class="hidden text-xs text-white/50 sm:inline">|</span>
				<span class="hidden text-xs font-semibold text-white/70 sm:inline">
					Prochain rassemblement majeur de l'Église
				</span>
			</div>

			{#if event.isFree}
				<div
					class="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-950/60 px-3.5 py-1 text-xs font-bold text-emerald-300 backdrop-blur-xs"
				>
					<ShieldCheck size={14} />
					<span>Accès 100% Libre & Gratuit</span>
				</div>
			{/if}
		</div>

		<!-- GRILLE PRINCIPALE EN 2 COLONNES : GRANDE IMAGE BIEN VISIBLE & INFOS AVEC COUNTDOWN -->
		<div class="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12 xl:gap-16">
			<!-- COLONNE 1 : IMAGE DE L'ÉVÉNEMENT BIEN VISIBLE EN GRAND FORMAT (5 COLS SUR DESKTOP) -->
			<div class="lg:col-span-5 xl:col-span-5">
				<div
					class="group relative overflow-hidden rounded-3xl border border-white/15 bg-white/5 p-2 shadow-2xl backdrop-blur-md transition-all duration-500 hover:border-brand-primary/40"
				>
					<!-- Conteneur d'image grand format -->
					<div
						class="relative h-72 w-full overflow-hidden rounded-2xl sm:h-96 md:h-[420px] lg:h-[460px]"
					>
						<img
							src={event.image}
							alt={event.imageAlt || event.title}
							class="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
							loading="eager"
						/>
						<div
							class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
						></div>

						<!-- Badge Date Flottant sur l'image -->
						<div
							class="absolute top-4 left-4 flex flex-col items-center justify-center rounded-2xl border border-white/20 bg-black/70 px-4 py-2.5 text-center shadow-lg backdrop-blur-md"
						>
							<span class="font-display text-2xl leading-none font-black text-brand-accent">
								{event.dateDay}
							</span>
							<span class="mt-0.5 text-[10px] font-extrabold tracking-wider text-white uppercase">
								{event.dateMonth}
								{event.dateYear || ''}
							</span>
						</div>

						<!-- Badge Catégorie en haut à droite -->
						<div class="absolute top-4 right-4">
							<span
								class="rounded-full bg-brand-primary px-3 py-1 text-xs font-bold text-white uppercase shadow-md"
							>
								{event.categoryLabel}
							</span>
						</div>

						<!-- Infos au bas de l'image -->
						<div
							class="absolute inset-x-4 bottom-4 flex items-center justify-between text-xs text-white/90"
						>
							<div class="flex items-center gap-1.5 font-semibold drop-shadow-sm">
								<MapPin size={15} class="text-brand-accent" />
								<span>{event.location}, {event.city}</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- COLONNE 2 : INFOS DÉTAILLÉES & COMPTE À REBOURS À RABAT BIEN VISIBLE (7 COLS) -->
			<div class="flex flex-col lg:col-span-7 xl:col-span-7">
				<!-- Catégorie et Titre -->
				<div>
					<h2
						id="events-spotlight-heading"
						class="font-display text-2xl leading-[1.15] font-black tracking-tight text-white sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl"
					>
						{event.title}
					</h2>

					<!-- Description concise et percutante -->
					<p class="mt-4 font-body text-sm leading-relaxed text-white/80 sm:text-base">
						{event.description}
					</p>
				</div>

				<!-- Métadonnées : Lieu, Heure, Orateurs -->
				<div class="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
					<div
						class="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-xs"
					>
						<div
							class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary/25 text-brand-accent"
						>
							<MapPin size={18} />
						</div>
						<div class="min-w-0">
							<span class="block text-[10px] font-bold tracking-wider text-white/60 uppercase">
								Lieu du rassemblement
							</span>
							<span class="block truncate font-body text-xs font-bold text-white sm:text-sm">
								{event.location}, {event.city}
							</span>
						</div>
					</div>

					<div
						class="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-xs"
					>
						<div
							class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary/25 text-brand-accent"
						>
							<Clock size={18} />
						</div>
						<div class="min-w-0">
							<span class="block text-[10px] font-bold tracking-wider text-white/60 uppercase">
								Horaires
							</span>
							<span class="block truncate font-body text-xs font-bold text-white sm:text-sm">
								{event.time}
							</span>
						</div>
					</div>
				</div>

				<!-- Orateurs si disponibles -->
				{#if event.speakers && event.speakers.length > 0}
					<div class="mt-3 flex items-center gap-2 text-xs text-white/75">
						<Users size={14} class="shrink-0 text-brand-accent" />
						<span>Orateurs :</span>
						<strong class="text-white">{event.speakers.join(', ')}</strong>
					</div>
				{/if}

				<!-- BLOC WIDGET COMPTE À REBOURS (CALENDRIER À RABAT DONT LA PAGE TOURNE EN SECONDES) -->
				<div
					class="mt-8 rounded-3xl border border-brand-accent/30 bg-gradient-to-br from-black/80 via-[#101b2b]/90 to-black/80 p-5 shadow-2xl backdrop-blur-md sm:p-7"
				>
					<div class="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
						<div class="flex items-center gap-2">
							<Clock size={16} class="animate-pulse text-brand-accent" />
							<span class="text-xs font-black tracking-widest text-white uppercase">
								Compte à Rebours en Direct
							</span>
						</div>
						<span class="text-[11px] font-bold text-brand-accent"> Temps réel (secondes) </span>
					</div>

					<!-- Widget Flip Countdown en taille hero -->
					<FlipCountdown {targetDate} size="hero" theme="dark" showSummaryBanner={true} />
				</div>

				<!-- BOUTONS D'ACTION -->
				<div class="mt-8 flex flex-wrap items-center gap-4">
					<button
						type="button"
						onclick={() => onRegister?.(event)}
						class="group inline-flex cursor-pointer items-center gap-2.5 rounded-xl bg-brand-primary px-6 py-3.5 font-body text-sm font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:bg-brand-primary-hover hover:shadow-xl focus-visible:outline-2 focus-visible:outline-white sm:text-base"
					>
						<HeartHandshake size={18} />
						<span>Participer / S'inscrire</span>
						<ArrowRight
							size={16}
							class="transition-transform duration-200 group-hover:translate-x-1"
						/>
					</button>

					{#if event.slug || event.id}
						<a
							href="/nos-evenements/{event.slug || event.id}"
							class="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3.5 font-body text-sm font-semibold text-white backdrop-blur-xs transition-colors hover:border-white/40 hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-white"
						>
							<Eye size={16} />
							<span>Détails & Programme complet</span>
						</a>
					{/if}
				</div>
			</div>
		</div>
	</div>
</section>
