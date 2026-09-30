<script lang="ts">
	import { onMount } from 'svelte';
	import Container from '../components/Container.svelte';
	import {
		Calendar,
		MapPin,
		Clock,
		Users,
		ArrowRight,
		ShieldCheck,
		HeartHandshake
	} from '@lucide/svelte';
	import type { DetailedEventItem, EventsSpotlightProps } from '../types.js';

	const defaultFeaturedEvent: DetailedEventItem = {
		id: 'croisade-nationale-yaounde-2026',
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
		imageAlt: 'Scène de la croisade d’évangélisation ECOFIP avec foule et louange',
		status: 'upcoming',
		description:
			'4 soirées exceptionnelles d’adoration, de prédication de la parole de Dieu, de miracles et de salut des âmes. Cliniques médicales gratuites offertes chaque matin de 09h00 à 15h00.',
		speakers: ['Pasteur Valéry Tchamekwen', 'Évangélistes & Médecins missionnaires'],
		isFree: true,
		isFeatured: true
	};

	let {
		event = defaultFeaturedEvent,
		eyebrow = 'PROCHAIN GRAND RENDEZ-VOUS',
		onRegister,
		class: customClass = ''
	}: EventsSpotlightProps = $props();

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
	id="a-la-une"
	bind:this={sectionEl}
	class="bg-white py-16 sm:py-20 lg:py-24 {customClass}"
	aria-labelledby="events-spotlight-heading"
>
	<Container>
		<!-- Carte Grand Format Événement Phare -->
		<div
			class="relative overflow-hidden rounded-3xl bg-[#0d1c1d] text-white shadow-2xl transition-all duration-700 ease-out {isVisible
				? 'translate-y-0 opacity-100'
				: 'translate-y-8 opacity-0'}"
		>
			<!-- Image d'arrière plan immersive avec dégradé sophistiqué -->
			<div
				class="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity select-none"
				style="background-image: url('{event.image}');"
				aria-hidden="true"
			></div>
			<div
				class="absolute inset-0 bg-gradient-to-t from-[#0d1c1d] via-[#0d1c1d]/90 to-transparent lg:bg-gradient-to-r lg:from-[#0d1c1d] lg:via-[#0d1c1d]/95 lg:to-transparent"
				aria-hidden="true"
			></div>

			<!-- Halo lumineux d'accentuation bordeaux/rouge -->
			<div
				class="pointer-events-none absolute -top-20 -right-20 h-80 w-80 rounded-full bg-brand-primary/25 blur-3xl"
				aria-hidden="true"
			></div>

			<div
				class="relative z-10 grid grid-cols-1 gap-8 p-7 sm:p-10 lg:grid-cols-12 lg:gap-12 lg:p-14"
			>
				<!-- Colonne de gauche (7 cols) : Détails et accroche -->
				<div class="flex flex-col justify-between lg:col-span-7">
					<div>
						<!-- Badge et Surtitre -->
						<div class="flex flex-wrap items-center gap-3">
							<span
								class="inline-flex items-center gap-1.5 rounded-full bg-brand-primary px-3.5 py-1 font-body text-xs font-bold tracking-wider text-white uppercase shadow-xs"
							>
								{event.categoryLabel}
							</span>
							{#if event.isFree}
								<span
									class="inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-950/60 px-3 py-1 font-body text-xs font-semibold text-emerald-300 backdrop-blur-xs"
								>
									<ShieldCheck size={13} />
									<span>Accès 100% Libre</span>
								</span>
							{/if}
						</div>

						<!-- Titre de l'événement en Playfair Display -->
						<h2
							id="events-spotlight-heading"
							class="mt-5 font-display text-2xl font-black tracking-tight text-white sm:text-3xl md:text-4xl lg:text-[40px] lg:leading-[1.18]"
						>
							{event.title}
						</h2>

						<!-- Description -->
						<p class="mt-4 font-body text-sm leading-relaxed text-white/85 sm:text-base">
							{event.description}
						</p>

						<!-- Métadonnées : Lieu, Heure, Orateurs -->
						<div class="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div
								class="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-xs"
							>
								<div
									class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary/20 text-brand-accent"
								>
									<MapPin size={20} />
								</div>
								<div>
									<span
										class="block font-body text-[11px] font-semibold tracking-wider text-white/60 uppercase"
									>
										Lieu de rassemblement
									</span>
									<span class="font-body text-xs font-bold text-white sm:text-sm">
										{event.location}, {event.city}
									</span>
								</div>
							</div>

							<div
								class="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-xs"
							>
								<div
									class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary/20 text-brand-accent"
								>
									<Clock size={20} />
								</div>
								<div>
									<span
										class="block font-body text-[11px] font-semibold tracking-wider text-white/60 uppercase"
									>
										Horaires des sessions
									</span>
									<span class="font-body text-xs font-bold text-white sm:text-sm">
										{event.time}
									</span>
								</div>
							</div>
						</div>

						<!-- Orateurs -->
						{#if event.speakers && event.speakers.length > 0}
							<div class="mt-4 flex items-center gap-2 font-body text-xs text-white/80 sm:text-sm">
								<Users size={16} class="shrink-0 text-brand-accent" />
								<span>Avec la participation de :</span>
								<strong class="text-white">{event.speakers.join(', ')}</strong>
							</div>
						{/if}
					</div>

					<!-- Boutons d'action -->
					<div class="mt-8 flex flex-wrap items-center gap-4 sm:mt-10">
						<button
							type="button"
							onclick={() => onRegister?.(event)}
							class="group inline-flex cursor-pointer items-center gap-2.5 rounded-xl bg-brand-primary px-6 py-3.5 font-body text-sm font-bold text-white shadow-md transition-all duration-200 hover:translate-y-[-1px] hover:bg-brand-primary-hover hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:text-base"
						>
							<HeartHandshake size={18} />
							<span>S’inscrire gratuitement</span>
							<ArrowRight
								size={16}
								class="transition-transform duration-200 group-hover:translate-x-1"
							/>
						</button>

						<a
							href="#agenda"
							class="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3.5 font-body text-sm font-semibold text-white backdrop-blur-xs transition-colors hover:border-white/40 hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-white"
						>
							<span>Voir tous les autres rendez-vous</span>
						</a>
					</div>
				</div>

				<!-- Colonne de droite (5 cols) : Carte Date proéminente et photo événement -->
				<div class="flex flex-col justify-center lg:col-span-5">
					<div
						class="overflow-hidden rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur-md sm:p-8"
					>
						<!-- Bloc Calendrier proéminent -->
						<div class="flex items-center justify-between border-b border-white/15 pb-6">
							<div>
								<span
									class="block font-body text-xs font-bold tracking-widest text-brand-accent uppercase"
								>
									DATES OFFICIELLES
								</span>
								<div class="mt-1 flex items-baseline gap-2">
									<span class="font-display text-4xl font-extrabold text-white sm:text-5xl">
										{event.dateDay}
									</span>
									<span class="font-display text-2xl font-bold text-white/90 sm:text-3xl">
										{event.dateMonth}
									</span>
								</div>
								<span class="font-body text-sm font-medium text-white/70">
									Année {event.dateYear}
								</span>
							</div>

							<div
								class="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-primary text-white shadow-lg"
							>
								<Calendar size={32} />
							</div>
						</div>

						<!-- Programme détaillé en 3 points -->
						<div class="mt-6 space-y-4">
							<div class="flex items-start gap-3">
								<span class="mt-1 flex h-2 w-2 shrink-0 rounded-full bg-brand-accent"></span>
								<div>
									<strong
										class="block font-body text-xs font-bold tracking-wider text-white uppercase"
									>
										Matinées Médicales (09h00 - 15h00)
									</strong>
									<p class="font-body text-xs text-white/70">
										Consultations générales, ophtalmologie, dépistages et dons de médicaments.
									</p>
								</div>
							</div>

							<div class="flex items-start gap-3">
								<span class="mt-1 flex h-2 w-2 shrink-0 rounded-full bg-brand-accent"></span>
								<div>
									<strong
										class="block font-body text-xs font-bold tracking-wider text-white uppercase"
									>
										Après-midis Jeunesse & Ateliers (15h30 - 17h30)
									</strong>
									<p class="font-body text-xs text-white/70">
										Activités d'édification, témoignages vivants et musique avec les chorales
										invitées.
									</p>
								</div>
							</div>

							<div class="flex items-start gap-3">
								<span class="mt-1 flex h-2 w-2 shrink-0 rounded-full bg-brand-accent"></span>
								<div>
									<strong
										class="block font-body text-xs font-bold tracking-wider text-white uppercase"
									>
										Grandes Soirées de Croisade (18h00 - 22h00)
									</strong>
									<p class="font-body text-xs text-white/70">
										Louange, proclamation de l’Évangile, prières pour les malades et salut des âmes.
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</Container>
</section>
