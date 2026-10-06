<script lang="ts">
	import { onMount } from 'svelte';
	import {
		Calendar,
		MapPin,
		Clock,
		ArrowRight,
		ShieldCheck,
		HeartHandshake,
		Sparkles,
		Eye,
		Users
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
		time: '18h00 – 22h00',
		location: 'Esplanade du Stade Ahmadou Ahidjo',
		city: 'Yaoundé, Cameroun',
		image: '/event-croisade.jpg',
		imageAlt: 'Grande Croisade d’Évangélisation et de Réveil',
		status: 'upcoming',
		description:
			'4 soirées exceptionnelles d’adoration, de proclamation de l’Évangile avec puissance, délivrances et guérisons. Cliniques médicales gratuites offertes chaque matin.',
		speakers: ['Pasteur Valéry Tchamekwen'],
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

<!-- SECTION PLEINE LARGEUR ÉLÉGANTE, CLAIRE ET DE HAUTEUR COMPACTE -->
<section
	id="a-la-une"
	bind:this={sectionEl}
	class="relative w-full border-y border-slate-200/80 bg-gradient-to-b from-[#f8fafc] via-white to-[#f1f5f9] py-6 sm:py-8 lg:py-9 {customClass}"
	aria-labelledby="events-spotlight-heading"
>
	<div
		class="relative z-10 mx-auto w-full max-w-7xl px-4 transition-all duration-700 ease-out sm:px-6 lg:px-8 {isVisible
			? 'translate-y-0 opacity-100'
			: 'translate-y-6 opacity-0'}"
	>
		<!-- BANDEAU COMPACT EN 2 COLONNES (HAUTEUR MAÎTRISÉE) -->
		<div
			class="overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-4 shadow-sm sm:p-6 lg:p-7"
		>
			<div class="grid grid-cols-1 items-center gap-6 lg:grid-cols-12 lg:gap-8">
				<!-- COLONNE 1 : IMAGE VISIBLE EN FORMAT PAYSAGE ÉQUILIBRÉ (5 COLS) -->
				<div class="lg:col-span-5">
					<div
						class="group relative h-48 w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-xs sm:h-56 md:h-60 lg:h-64"
					>
						<img
							src={event.image}
							alt={event.imageAlt || event.title}
							class="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-103"
							loading="eager"
						/>
						<div
							class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
						></div>

						<!-- Badge Date Flottant -->
						<div
							class="absolute top-3 left-3 flex flex-col items-center justify-center rounded-xl border border-white/40 bg-white/95 px-3 py-1.5 text-center shadow-md backdrop-blur-xs"
						>
							<span class="font-display text-lg leading-none font-black text-brand-primary">
								{event.dateDay}
							</span>
							<span class="mt-0.5 text-[9px] font-bold tracking-wider text-slate-700 uppercase">
								{event.dateMonth}
								{event.dateYear || ''}
							</span>
						</div>

						<!-- Badge Catégorie -->
						<div class="absolute top-3 right-3">
							<span
								class="rounded-full bg-brand-primary px-2.5 py-0.5 text-[10px] font-bold text-white uppercase shadow-xs"
							>
								{event.categoryLabel}
							</span>
						</div>

						<!-- Lieu incrusté au bas de la photo -->
						<div class="absolute inset-x-3 bottom-2.5 flex items-center gap-1.5 text-xs text-white">
							<MapPin size={13} class="text-brand-accent drop-shadow-xs" />
							<span class="truncate font-semibold drop-shadow-xs">
								{event.location}, {event.city}
							</span>
						</div>
					</div>
				</div>

				<!-- COLONNE 2 : INFORMATIONS ET COMPTE À REBOURS COMPACT EN THÈME CLAIR (7 COLS) -->
				<div class="flex flex-col justify-center lg:col-span-7">
					<!-- En-tête : Badge À la Une + Accès libre -->
					<div class="flex flex-wrap items-center gap-2">
						<span
							class="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-900 shadow-2xs"
						>
							<Sparkles size={12} class="fill-amber-400 text-amber-500" />
							<span>{eyebrow}</span>
						</span>

						{#if event.isFree}
							<span
								class="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800"
							>
								<ShieldCheck size={12} class="text-emerald-600" />
								<span>Accès 100% Libre</span>
							</span>
						{/if}
					</div>

					<!-- Titre bien proportionné -->
					<h2
						id="events-spotlight-heading"
						class="mt-2 font-display text-xl leading-snug font-bold tracking-tight text-slate-900 sm:text-2xl lg:text-3xl"
					>
						{event.title}
					</h2>

					<!-- Description compacte -->
					{#if event.description}
						<p
							class="mt-1.5 line-clamp-2 font-body text-xs leading-relaxed text-slate-600 sm:text-sm"
						>
							{event.description}
						</p>
					{/if}

					<!-- Métadonnées Horaires, Lieu & Orateurs en mini-pills claires -->
					<div class="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-600">
						<span
							class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium"
						>
							<Clock size={12} class="text-brand-primary" />
							<span>{event.time}</span>
						</span>
						<span
							class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium"
						>
							<MapPin size={12} class="text-brand-primary" />
							<span>{event.location}</span>
						</span>
						{#if event.speakers && event.speakers.length > 0}
							<span
								class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium"
							>
								<Users size={12} class="text-brand-primary" />
								<span class="max-w-[200px] truncate sm:max-w-[300px]"
									>{event.speakers.join(', ')}</span
								>
							</span>
						{/if}
					</div>

					<!-- WIDGET COMPTE À REBOURS COMPACT EN THÈME CLAIR (LUMIÈRE & FINESSE) -->
					<div
						class="mt-4 rounded-2xl border border-slate-200/90 bg-gradient-to-b from-[#f8fafc] to-[#f1f5f9] p-3 shadow-2xs sm:p-3.5"
					>
						<div class="mb-2 flex items-center justify-between border-b border-slate-200/60 pb-1.5">
							<span
								class="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-brand-primary uppercase"
							>
								<Clock size={12} class="animate-pulse" />
								<span>Compte à rebours officiel</span>
							</span>
							<span
								class="inline-flex items-center gap-1 rounded-full border border-emerald-200/80 bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700"
							>
								<span class="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500"></span>
								<span>Temps réel</span>
							</span>
						</div>

						<FlipCountdown {targetDate} size="md" theme="light" showSummaryBanner={true} />
					</div>

					<!-- BOUTONS D'ACTION COMPACTS -->
					<div class="mt-4 flex flex-wrap items-center gap-2.5 sm:mt-5">
						{#if event.registrationEnabled !== false}
							<button
								type="button"
								onclick={() => onRegister?.(event)}
								class="group inline-flex cursor-pointer items-center gap-2 rounded-xl bg-brand-primary px-4 py-2 font-body text-xs font-bold text-white shadow-xs transition-all hover:bg-brand-primary-hover hover:shadow-sm sm:px-5 sm:py-2.5 sm:text-sm"
							>
								<HeartHandshake size={15} />
								<span>Participer / S'inscrire</span>
								<ArrowRight
									size={14}
									class="transition-transform duration-200 group-hover:translate-x-0.5"
								/>
							</button>
						{:else}
							<!-- Accès libre : pas d'inscription, simple information non cliquable -->
							<span
								class="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 font-body text-xs font-bold text-emerald-800 sm:px-5 sm:py-2.5 sm:text-sm"
							>
								<ShieldCheck size={15} class="text-emerald-600" />
								<span>Entrée libre · Sans inscription</span>
							</span>
						{/if}

						{#if event.slug || event.id}
							<a
								href="/nos-evenements/{event.slug || event.id}"
								class="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 font-body text-xs font-bold text-slate-700 shadow-2xs transition-colors hover:bg-slate-50 sm:px-4 sm:py-2.5 sm:text-sm"
							>
								<Eye size={14} />
								<span>Voir les détails</span>
							</a>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>
</section>
