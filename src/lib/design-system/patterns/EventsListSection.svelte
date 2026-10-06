<script lang="ts">
	import { onMount } from 'svelte';
	import Container from '../components/Container.svelte';
	import {
		Calendar,
		Clock,
		MapPin,
		Search,
		Users,
		ArrowRight,
		Filter,
		CheckCircle2,
		ShieldCheck,
		X
	} from '@lucide/svelte';
	import type { DetailedEventItem, EventsListProps } from '../types.js';
	import FlipCountdown from '../components/FlipCountdown.svelte';
	import { getEventTargetDate } from '$lib/utils/eventDate.js';

	const defaultEvents: DetailedEventItem[] = [
		{
			id: 'croisade-nationale-yaounde-2026',
			title: 'Grande Croisade Nationale d’Évangélisation, Foi & Guérison',
			category: 'croisade',
			categoryLabel: 'Croisade',
			dateDay: '15-18',
			dateMonth: 'OCT',
			dateYear: '2026',
			time: '18h00 – 22h00',
			location: 'Esplanade du Stade Ahmadou Ahidjo',
			city: 'Yaoundé',
			image: '/event-croisade.jpg',
			imageAlt: 'Croisade d’évangélisation ECOFIP Yaoundé',
			status: 'upcoming',
			description:
				'Quatre soirées de rassemblement massif pour proclamer la bonne nouvelle de Jésus-Christ avec miracles, guérisons et distribution de bibles.',
			speakers: ['Pasteur Valéry Tchamekwen', 'Équipe Pastorale ECOFIP'],
			isFree: true,
			isFeatured: true
		},
		{
			id: 'seminaire-discipulat-douala-2026',
			title: 'Séminaire National des Disciples : Fondements & Maturité',
			category: 'formation',
			categoryLabel: 'Séminaire',
			dateDay: '24-25',
			dateMonth: 'OCT',
			dateYear: '2026',
			time: '09h00 – 16h30',
			location: 'Centre Polyvalent de Bonabéri',
			city: 'Douala',
			image: '/event-seminaire.jpg',
			imageAlt: 'Séminaire biblique des disciples ECOFIP',
			status: 'upcoming',
			description:
				'Une formation intensive de deux jours axée sur la doctrine biblique saine, le caractère du serviteur et la pratique de l’évangélisation personnelle.',
			speakers: ['Pasteur Valéry Tchamekwen', 'Enseignants Bibliques Invités'],
			isFree: true
		},
		{
			id: 'camp-jeunesse-febe-2026',
			title: 'Camp Biblique de la Jeunesse : « Une Génération Consacrée »',
			category: 'jeunesse',
			categoryLabel: 'Camp Jeunesse',
			dateDay: '05-08',
			dateMonth: 'NOV',
			dateYear: '2026',
			time: '4 jours (Pension complète)',
			location: 'Centre de Retraite Mont Fébé',
			city: 'Yaoundé',
			image: '/event-camp.jpg',
			imageAlt: 'Rassemblement de jeunes chrétiens au Mont Fébé',
			status: 'upcoming',
			description:
				'Un temps de mise à part pour les collégiens, lycéens et étudiants : louange vivante, ateliers pratiques, études bibliques et communion fraternelle.',
			speakers: ['Coordination Jeunesse ECOFIP', 'Mentors chrétiens'],
			isFree: true
		},
		{
			id: 'clinique-mobile-bafoussam-2026',
			title: 'Campagne Médicale & Don de Vivres à l’Ouest',
			category: 'medical',
			categoryLabel: 'Mission Médicale',
			dateDay: '19-21',
			dateMonth: 'NOV',
			dateYear: '2026',
			time: '08h30 – 17h00',
			location: 'Esplanade Municipale',
			city: 'Bafoussam',
			image: '/about-mission.jpg',
			imageAlt: 'Campagne de soins médicaux gratuits',
			status: 'upcoming',
			description:
				'Consultations de médecine générale, soins infirmiers, ophtalmologie et remise gratuite de médicaments essentiels couplés à l’annonce de l’Évangile.',
			speakers: ['Collectif des Médecins Chrétiens ECOFIP'],
			isFree: true
		},
		{
			id: 'croisade-kribi-2026',
			title: 'Impact Océan : Croisade & Évangélisation de Rue',
			category: 'croisade',
			categoryLabel: 'Croisade',
			dateDay: '11-13',
			dateMonth: 'DÉC',
			dateYear: '2026',
			time: '17h30 – 21h30',
			location: 'Place des Fêtes de Kribi',
			city: 'Kribi',
			image: '/about-worship-hd.jpg',
			imageAlt: 'Évangélisation en plein air à Kribi',
			status: 'upcoming',
			description:
				'Trois soirées de moisson spirituelle au bord de l’océan. Évangélisation porte-à-porte en journée et grand rassemblement de louange et de prière le soir.',
			speakers: ['Pasteur Valéry Tchamekwen', 'Évangélistes de Terrain'],
			isFree: true
		},
		{
			id: 'retraite-ouvriers-2026-passe',
			title: 'Retraite Spirituelle des Équipiers & Serviteurs',
			category: 'formation',
			categoryLabel: 'Formation',
			dateDay: '12-14',
			dateMonth: 'AOÛT',
			dateYear: '2026',
			time: 'Clôturé',
			location: 'Centre d’Accueil Spirituel',
			city: 'Mbalmayo',
			image: '/article-bible.jpg',
			imageAlt: 'Retraite des ouvriers ECOFIP',
			status: 'past',
			description:
				'Bilan à mi-parcours de la vision missionnaire, renouvellement spirituel et consécration pour la seconde moitié de l’année ministérielle.',
			speakers: ['Conseil Pastoral ECOFIP'],
			isFree: true
		}
	];

	let {
		eyebrow = 'AGENDA OFFICIEL',
		title = 'Tous les rassemblements & programmes',
		subtitle = 'Filtrez par thématique, par date ou par ville pour planifier votre participation aux événements de la mission.',
		events = defaultEvents,
		onRegister,
		class: customClass = ''
	}: EventsListProps = $props();

	let activeTimeFilter = $state<'all' | 'upcoming' | 'past'>('all');
	let activeCategory = $state<string>('all');
	let searchQuery = $state('');

	const categories = [
		{ id: 'all', label: 'Toutes les catégories' },
		{ id: 'croisade', label: 'Croisades & Moisson' },
		{ id: 'formation', label: 'Séminaires & Formations' },
		{ id: 'jeunesse', label: 'Camps & Jeunesse' },
		{ id: 'medical', label: 'Missions Médicales' }
	];

	// Filtrage réactif performant
	let filteredEvents = $derived(
		events.filter((item) => {
			const matchesTime =
				activeTimeFilter === 'all' ||
				(activeTimeFilter === 'upcoming' && item.status === 'upcoming') ||
				(activeTimeFilter === 'past' && item.status === 'past');

			const matchesCategory = activeCategory === 'all' || item.category === activeCategory;

			const query = searchQuery.trim().toLowerCase();
			const matchesSearch =
				!query ||
				item.title.toLowerCase().includes(query) ||
				item.city.toLowerCase().includes(query) ||
				item.location.toLowerCase().includes(query) ||
				item.description.toLowerCase().includes(query);

			return matchesTime && matchesCategory && matchesSearch;
		})
	);

	function resetFilters() {
		activeTimeFilter = 'all';
		activeCategory = 'all';
		searchQuery = '';
	}

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
			{ threshold: 0.1 }
		);

		observer.observe(sectionEl);

		return () => {
			observer.disconnect();
		};
	});
</script>

<section
	id="agenda"
	bind:this={sectionEl}
	class="bg-[#f8fafc] py-16 sm:py-20 lg:py-28 {customClass}"
	aria-labelledby="events-list-heading"
>
	<Container>
		<!-- En-tête centré -->
		<div
			class="mx-auto max-w-3xl text-center transition-all duration-700 ease-out {isVisible
				? 'translate-y-0 opacity-100'
				: 'translate-y-8 opacity-0'}"
		>
			{#if eyebrow}
				<div class="mb-3 flex items-center justify-center gap-2.5">
					<span class="h-0.5 w-6 rounded-full bg-brand-primary" aria-hidden="true"></span>
					<span
						class="font-body text-xs font-bold tracking-wider text-brand-primary uppercase sm:text-sm"
					>
						{eyebrow}
					</span>
				</div>
			{/if}

			<h2
				id="events-list-heading"
				class="font-display text-3xl leading-[1.2] font-extrabold tracking-tight text-text-primary sm:text-4xl lg:text-[42px]"
			>
				{title}
			</h2>

			{#if subtitle}
				<p class="mt-4 font-body text-sm leading-relaxed text-text-secondary sm:text-base">
					{subtitle}
				</p>
			{/if}
		</div>

		<!-- Barre de contrôles et filtres interactifs -->
		<div
			class="mt-12 space-y-5 rounded-3xl border border-gray-200/80 bg-white p-5 shadow-xs transition-all duration-700 ease-out sm:mt-16 sm:p-6 {isVisible
				? 'translate-y-0 opacity-100'
				: 'translate-y-8 opacity-0'}"
			style="transition-delay: 100ms;"
		>
			<div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
				<!-- Onglets Temporels (Tous / À venir / Passés) -->
				<div class="inline-flex rounded-xl bg-gray-100 p-1">
					<button
						type="button"
						onclick={() => (activeTimeFilter = 'all')}
						class="cursor-pointer rounded-lg px-4 py-2 font-body text-xs font-bold transition-all sm:text-sm {activeTimeFilter ===
						'all'
							? 'bg-white text-text-primary shadow-xs'
							: 'text-text-secondary hover:text-text-primary'}"
					>
						Tous ({events.length})
					</button>
					<button
						type="button"
						onclick={() => (activeTimeFilter = 'upcoming')}
						class="cursor-pointer rounded-lg px-4 py-2 font-body text-xs font-bold transition-all sm:text-sm {activeTimeFilter ===
						'upcoming'
							? 'bg-white text-brand-primary shadow-xs'
							: 'text-text-secondary hover:text-text-primary'}"
					>
						À venir ({events.filter((e) => e.status === 'upcoming').length})
					</button>
					<button
						type="button"
						onclick={() => (activeTimeFilter = 'past')}
						class="cursor-pointer rounded-lg px-4 py-2 font-body text-xs font-bold transition-all sm:text-sm {activeTimeFilter ===
						'past'
							? 'bg-white text-text-primary shadow-xs'
							: 'text-text-secondary hover:text-text-primary'}"
					>
						Éditions passées ({events.filter((e) => e.status === 'past').length})
					</button>
				</div>

				<!-- Barre de recherche rapide -->
				<div class="relative w-full lg:max-w-xs">
					<Search
						size={18}
						class="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-gray-400"
					/>
					<input
						type="text"
						bind:value={searchQuery}
						placeholder="Rechercher ville, orateur, titre..."
						class="w-full rounded-xl border border-gray-200 bg-[#f8fafc] py-2.5 pr-9 pl-10 font-body text-xs text-text-primary transition-colors focus:border-brand-primary focus:bg-white focus:outline-hidden sm:text-sm"
					/>
					{#if searchQuery}
						<button
							type="button"
							onclick={() => (searchQuery = '')}
							class="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600"
							aria-label="Effacer la recherche"
						>
							<X size={16} />
						</button>
					{/if}
				</div>
			</div>

			<!-- Filtres par catégorie -->
			<div class="flex flex-wrap items-center gap-2 border-t border-gray-100 pt-4">
				<span
					class="mr-1 inline-flex items-center gap-1.5 font-body text-xs font-bold tracking-wider text-text-secondary uppercase"
				>
					<Filter size={13} />
					<span>Catégories :</span>
				</span>
				{#each categories as cat (cat.id)}
					<button
						type="button"
						onclick={() => (activeCategory = cat.id)}
						class="cursor-pointer rounded-xl px-3.5 py-1.5 font-body text-xs font-semibold transition-all {activeCategory ===
						cat.id
							? 'bg-brand-primary text-white shadow-xs'
							: 'bg-[#f1f5f9] text-text-secondary hover:bg-gray-200 hover:text-text-primary'}"
					>
						{cat.label}
					</button>
				{/each}
			</div>
		</div>

		<!-- Grille des événements -->
		{#if filteredEvents.length > 0}
			<div class="mt-8 grid grid-cols-1 gap-6 sm:mt-10 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
				{#each filteredEvents as item, index (item.id)}
					<div
						class="group flex flex-col justify-between overflow-hidden rounded-3xl border border-gray-200/80 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-1 hover:border-gray-300 hover:shadow-[0_20px_45px_rgba(0,0,0,0.08)] {isVisible
							? 'translate-y-0 opacity-100'
							: 'translate-y-8 opacity-0'}"
						style="transition-delay: {index * 80}ms;"
					>
						<div>
							<!-- Zone Image avec badges -->
							<div class="relative h-52 w-full overflow-hidden bg-gray-100">
								<img
									src={item.image}
									alt={item.imageAlt}
									class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
									loading="lazy"
								/>
								<div
									class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
								></div>

								<!-- Badge Date proéminent en haut à gauche -->
								<div
									class="absolute top-4 left-4 flex flex-col items-center justify-center rounded-2xl bg-white/95 px-3.5 py-2 text-center shadow-md backdrop-blur-xs"
								>
									<span class="font-display text-lg leading-none font-black text-brand-primary">
										{item.dateDay}
									</span>
									<span
										class="font-body text-[11px] font-bold tracking-wider text-text-primary uppercase"
									>
										{item.dateMonth}
									</span>
								</div>

								<!-- Badge Statut / Catégorie en haut à droite -->
								<div class="absolute top-4 right-4 flex items-center gap-1.5">
									{#if item.status === 'past'}
										<span
											class="rounded-full bg-black/60 px-3 py-1 font-body text-xs font-semibold text-white/90 backdrop-blur-xs"
										>
											Édition passée
										</span>
									{:else}
										<span
											class="rounded-full bg-brand-primary px-3 py-1 font-body text-xs font-bold text-white shadow-xs"
										>
											{item.categoryLabel}
										</span>
									{/if}
								</div>

								<!-- Ville en bas à gauche sur la photo -->
								<div
									class="absolute bottom-3 left-4 flex items-center gap-1.5 font-body text-xs font-semibold text-white drop-shadow-sm"
								>
									<MapPin size={14} class="text-brand-accent" />
									<span>{item.city}</span>
								</div>
							</div>

							<!-- Contenu textuel -->
							<div class="p-6">
								<h3
									class="font-display text-xl leading-snug font-bold tracking-tight text-text-primary transition-colors group-hover:text-brand-primary"
								>
									<a href="/nos-evenements/{item.slug || item.id}" class="hover:underline">
										{item.title}
									</a>
								</h3>

								<!-- Horaires & Lieu précis -->
								<div class="mt-4 space-y-2 border-t border-gray-100 pt-3">
									<div class="flex items-center gap-2 font-body text-xs text-text-secondary">
										<Clock size={15} class="shrink-0 text-brand-primary" />
										<span>{item.time}</span>
									</div>
									<div class="flex items-center gap-2 font-body text-xs text-text-secondary">
										<MapPin size={15} class="shrink-0 text-brand-primary" />
										<span class="line-clamp-1">{item.location}</span>
									</div>
								</div>

								<!-- Description -->
								<p class="mt-3 line-clamp-3 font-body text-xs leading-relaxed text-text-secondary">
									{item.description}
								</p>

								<!-- Orateurs -->
								{#if item.speakers && item.speakers.length > 0}
									<div
										class="mt-4 flex items-center gap-1.5 font-body text-[11px] text-text-secondary"
									>
										<Users size={13} class="shrink-0 text-brand-primary" />
										<span class="line-clamp-1">Orateurs : {item.speakers.join(', ')}</span>
									</div>
								{/if}

								<!-- WIDGET COMPTE À REBOURS FLIP SUR LA CARTE (À VENIR) -->
								{#if item.status === 'upcoming'}
									<div
										class="mt-3.5 rounded-2xl border border-slate-200/90 bg-[#f8fafc] p-3 shadow-2xs"
									>
										<div
											class="mb-2 flex items-center justify-between border-b border-slate-200/60 pb-1.5"
										>
											<span
												class="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-brand-primary uppercase"
											>
												<Clock size={12} class="animate-pulse" />
												<span>Compte à rebours</span>
											</span>
											<span
												class="inline-flex items-center gap-1 rounded-full border border-emerald-200/70 bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700"
											>
												<span class="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500"></span>
												<span>En direct</span>
											</span>
										</div>
										<FlipCountdown
											targetDate={item.targetDate || getEventTargetDate(item)}
											size="card"
											theme="light"
											showSummaryBanner={true}
										/>
									</div>
								{/if}
							</div>
						</div>

						<!-- Pied de carte avec bouton d'action -->
						<div class="border-t border-gray-100 p-5 pt-4">
							{#if item.status === 'upcoming'}
								<div class="grid grid-cols-2 gap-2">
									<a
										href="/nos-evenements/{item.slug || item.id}"
										class="flex cursor-pointer items-center justify-center rounded-xl border border-gray-200 bg-gray-50 py-2.5 font-body text-xs font-bold text-text-primary transition-all hover:bg-gray-100"
									>
										<span>Détails</span>
									</a>
									{#if item.registrationEnabled !== false}
										<button
											type="button"
											onclick={() => onRegister?.(item)}
											class="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-brand-primary py-2.5 font-body text-xs font-bold text-white shadow-xs transition-all hover:bg-brand-primary-hover hover:shadow-md"
										>
											<span>S'inscrire</span>
											<ArrowRight size={13} />
										</button>
									{:else}
										<span
											class="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 py-2.5 font-body text-xs font-bold text-emerald-800"
										>
											<ShieldCheck size={13} class="text-emerald-600" />
											<span>Entrée libre</span>
										</span>
									{/if}
								</div>
							{:else}
								<div
									class="flex items-center justify-between font-body text-xs text-text-secondary"
								>
									<span class="italic">Programme achevé</span>
									<a
										href="/nos-evenements/{item.slug || item.id}"
										class="font-semibold text-brand-primary hover:underline"
									>
										Voir les détails
									</a>
								</div>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<!-- État vide si aucune correspondance -->
			<div
				class="mx-auto mt-12 max-w-md rounded-3xl border border-gray-200/80 bg-white p-8 text-center shadow-xs"
			>
				<div
					class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400"
				>
					<Calendar size={28} />
				</div>
				<h3 class="font-display text-lg font-bold text-text-primary">Aucun événement trouvé</h3>
				<p class="mt-1.5 font-body text-xs leading-relaxed text-text-secondary sm:text-sm">
					Aucun rassemblement ne correspond à vos filtres actuels. Réinitialisez vos critères pour
					voir l’ensemble des dates.
				</p>
				<button
					type="button"
					onclick={resetFilters}
					class="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 font-body text-xs font-bold text-text-primary shadow-2xs hover:bg-gray-50"
				>
					Réinitialiser les filtres
				</button>
			</div>
		{/if}
	</Container>
</section>
