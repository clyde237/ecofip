<script module lang="ts">
	import type { MediaItem } from '../types.js';

	export const defaultMediaItems: MediaItem[] = [
		{
			id: 'croisade-omnisport-yaounde',
			title: 'Soirée de proclamation & Louange céleste à l’Omnisport',
			category: 'Croisades & Louange',
			categorySlug: 'croisade',
			type: 'photo',
			url: '/event-croisade.jpg',
			location: 'Yaoundé, Centre',
			date: 'Septembre 2026',
			description:
				'Des milliers de voix unies dans l’adoration du Seigneur Jésus-Christ lors de la première nuit de croisade.'
		},
		{
			id: 'video-highlights-croisade',
			title: 'Aftermovie Officiel : Les temps forts de la Moisson 2026',
			category: 'Vidéos',
			categorySlug: 'video',
			type: 'video',
			url: '/video-highlights-cover.jpg',
			videoUrl:
				'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
			location: 'Yaoundé & Douala',
			date: 'Août 2026',
			description:
				'Reportage vidéo exclusif condensant les témoignages, les miracles et l’effusion spirituelle sur le terrain.'
		},
		{
			id: 'clinique-mobile-consultations',
			title: 'Clinique mobile : Soins gratuits et bienveillance médicale',
			category: 'Cliniques Médicales',
			categorySlug: 'medical',
			type: 'photo',
			url: '/about-mission.jpg',
			location: 'Bafia, Centre',
			date: 'Août 2026',
			description:
				'Nos soignants bénévoles prodiguant des soins et des prescriptions gratuites aux populations locales.'
		},
		{
			id: 'camp-jeunesse-febe',
			title: 'Retraite de consécration : La jeunesse passionnée pour Christ',
			category: 'Camps & Jeunesse',
			categorySlug: 'jeunesse',
			type: 'photo',
			url: '/event-camp.jpg',
			location: 'Mont Fébé, Yaoundé',
			date: 'Juillet 2026',
			description:
				'Temps fort d’édification biblique, d’ateliers pratiques et de communion fraternelle pour plus de 300 jeunes.'
		},
		{
			id: 'distribution-bibles-etude',
			title: 'Dons de Saintes Écritures aux convertis et disciples',
			category: 'Action Sociale & Dons',
			categorySlug: 'communaute',
			type: 'photo',
			url: '/article-bible.jpg',
			location: 'Ngaoundéré, Adamaoua',
			date: 'Juillet 2026',
			description:
				'Remise solennelle de bibles d’étude aux nouveaux convertis pour enraciner leur foi dans la saine doctrine.'
		},
		{
			id: 'seminaire-formation-ouvriers',
			title: 'Séminaire de formation biblique et formation pastorale',
			category: 'Croisades & Louange',
			categorySlug: 'croisade',
			type: 'photo',
			url: '/event-seminaire.jpg',
			location: 'Douala, Littoral',
			date: 'Juin 2026',
			description:
				'Deux jours intensifs d’enseignement avec les pasteurs et ouvriers engagés dans la moisson urbaine.'
		},
		{
			id: 'predication-pasteur-valery',
			title: 'Prédication de l’Évangile de la grâce par Pasteur Valéry',
			category: 'Croisades & Louange',
			categorySlug: 'croisade',
			type: 'photo',
			url: '/pasteur-valery-tchamekwen.png',
			location: 'Yaoundé, Centre',
			date: 'Mai 2026',
			description:
				'Un appel vibrant à la réconciliation avec Dieu et à une foi authentique débarrassée de tout compromis.'
		},
		{
			id: 'video-action-humanitaire',
			title: 'Documentaire : Secours d’amour dans les zones rurales',
			category: 'Vidéos',
			categorySlug: 'video',
			type: 'video',
			url: '/event-seminaire.jpg',
			videoUrl:
				'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
			location: 'Extrême-Nord',
			date: 'Mai 2026',
			description:
				'Suivez l’acheminement des kits scolaires et des vivres pour les familles orphelines des zones enclavées.'
		},
		{
			id: 'communaute-aide-fraternelle',
			title: 'Distribution de vivres et accompagnement des mères de famille',
			category: 'Action Sociale & Dons',
			categorySlug: 'communaute',
			type: 'photo',
			url: '/article-communaute.jpg',
			location: 'Bafoussam, Ouest',
			date: 'Avril 2026',
			description:
				'L’amour de Dieu manifesté en actes : remise de sacs de riz, huiles et savons aux mères isolées.'
		},
		{
			id: 'adoration-nocturne-intercession',
			title: 'Veillée nocturne d’intercession pour la nation',
			category: 'Croisades & Louange',
			categorySlug: 'croisade',
			type: 'photo',
			url: '/about-worship-hd.jpg',
			location: 'Yaoundé, Centre',
			date: 'Mars 2026',
			description:
				'Une nuit entière passée aux pieds du Seigneur pour réclamer la paix et le réveil spirituel sur le Cameroun.'
		},
		{
			id: 'evangelisation-rues-marchers',
			title: 'Évangélisation de rue et proclamations publiques',
			category: 'Croisades & Louange',
			categorySlug: 'croisade',
			type: 'photo',
			url: '/article-evangelisation.jpg',
			location: 'Kribi, Sud',
			date: 'Février 2026',
			description:
				'Aller au-devant des âmes dans les marchés, gares routières et carrefours pour annoncer le salut en Jésus.'
		},
		{
			id: 'discipulat-ateliers-terrain',
			title: 'Ateliers de discipulat et étude de groupe en plein air',
			category: 'Camps & Jeunesse',
			categorySlug: 'jeunesse',
			type: 'photo',
			url: '/about-valeurs.png',
			location: 'Ebolowa, Sud',
			date: 'Janvier 2026',
			description:
				'Discussions fraternelles et partages autour des piliers de l’économe fidèle et prudent.'
		}
	];
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import Container from '../components/Container.svelte';
	import {
		Play,
		Image as ImageIcon,
		MapPin,
		Calendar,
		Maximize2,
		Filter,
		Video as VideoIcon
	} from '@lucide/svelte';
	import type { GalleryGridProps } from '../types.js';

	let {
		eyebrow = 'MÉDIATHÈQUE COMPLÈTE',
		title = 'Photothèque & Vidéothèque de mission',
		subtitle = 'Sélectionnez une catégorie ou filtrez par type de média pour explorer les souvenirs des temps passés sur le champ de mission.',
		items = defaultMediaItems,
		onSelectMedia,
		class: customClass = ''
	}: GalleryGridProps = $props();

	let activeCategory = $state<string>('all');
	let activeTypeFilter = $state<'all' | 'photo' | 'video'>('all');

	const categories = [
		{ id: 'all', label: 'Tous les médias' },
		{ id: 'croisade', label: 'Croisades & Louange' },
		{ id: 'medical', label: 'Cliniques Médicales' },
		{ id: 'jeunesse', label: 'Camps & Jeunesse' },
		{ id: 'communaute', label: 'Action Sociale & Dons' },
		{ id: 'video', label: 'Vidéos & Reportages' }
	];

	// Filtrage réactif
	let filteredItems = $derived(
		items.filter((item) => {
			const matchesCategory = activeCategory === 'all' || item.categorySlug === activeCategory;

			const matchesType = activeTypeFilter === 'all' || item.type === activeTypeFilter;

			return matchesCategory && matchesType;
		})
	);

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
	id="medias"
	bind:this={sectionEl}
	class="bg-[#f8fafc] py-16 sm:py-20 lg:py-28 {customClass}"
	aria-labelledby="gallery-grid-heading"
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
				id="gallery-grid-heading"
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

		<!-- Barre de filtres interactifs -->
		<div
			class="mt-12 space-y-4 rounded-3xl border border-gray-200/80 bg-white p-5 shadow-xs transition-all duration-700 ease-out sm:mt-16 sm:p-6 {isVisible
				? 'translate-y-0 opacity-100'
				: 'translate-y-8 opacity-0'}"
			style="transition-delay: 100ms;"
		>
			<div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
				<!-- Filtres de catégories thématiques -->
				<div class="flex flex-wrap items-center gap-2">
					{#each categories as cat (cat.id)}
						<button
							type="button"
							onclick={() => (activeCategory = cat.id)}
							class="cursor-pointer rounded-xl px-3.5 py-2 font-body text-xs font-semibold transition-all sm:text-sm {activeCategory ===
							cat.id
								? 'bg-brand-primary text-white shadow-xs'
								: 'bg-[#f1f5f9] text-text-secondary hover:bg-gray-200 hover:text-text-primary'}"
						>
							{cat.label}
						</button>
					{/each}
				</div>

				<!-- Toggle type de média : Tous / Photos / Vidéos -->
				<div class="inline-flex self-start rounded-xl bg-gray-100 p-1 lg:self-center">
					<button
						type="button"
						onclick={() => (activeTypeFilter = 'all')}
						class="cursor-pointer rounded-lg px-3.5 py-1.5 font-body text-xs font-bold transition-all {activeTypeFilter ===
						'all'
							? 'bg-white text-text-primary shadow-xs'
							: 'text-text-secondary hover:text-text-primary'}"
					>
						Tous ({items.length})
					</button>
					<button
						type="button"
						onclick={() => (activeTypeFilter = 'photo')}
						class="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3.5 py-1.5 font-body text-xs font-bold transition-all {activeTypeFilter ===
						'photo'
							? 'bg-white text-brand-primary shadow-xs'
							: 'text-text-secondary hover:text-text-primary'}"
					>
						<ImageIcon size={14} />
						<span>Photos</span>
					</button>
					<button
						type="button"
						onclick={() => (activeTypeFilter = 'video')}
						class="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3.5 py-1.5 font-body text-xs font-bold transition-all {activeTypeFilter ===
						'video'
							? 'bg-white text-brand-primary shadow-xs'
							: 'text-text-secondary hover:text-text-primary'}"
					>
						<VideoIcon size={14} />
						<span>Vidéos</span>
					</button>
				</div>
			</div>
		</div>

		<!-- Grille des médias -->
		{#if filteredItems.length > 0}
			<div
				class="mt-8 grid grid-cols-1 gap-6 sm:mt-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4"
			>
				{#each filteredItems as item, index (item.id)}
					<div
						role="button"
						tabindex="0"
						onclick={() => onSelectMedia?.(item, index)}
						onkeydown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								e.preventDefault();
								onSelectMedia?.(item, index);
							}
						}}
						class="group relative flex cursor-pointer flex-col overflow-hidden rounded-3xl border border-gray-200/80 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-1.5 hover:border-gray-300 hover:shadow-[0_20px_45px_rgba(0,0,0,0.09)] focus-visible:outline-2 focus-visible:outline-brand-primary {isVisible
							? 'translate-y-0 opacity-100'
							: 'translate-y-8 opacity-0'}"
						style="transition-delay: {index * 50}ms;"
					>
						<!-- Image / Visuel -->
						<div class="relative aspect-4/3 w-full overflow-hidden bg-gray-100">
							<img
								src={item.url}
								alt={item.title}
								class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
								loading="lazy"
							/>
							<div
								class="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent"
							></div>

							<!-- Badge Catégorie en haut à gauche -->
							<div class="absolute top-3.5 left-3.5">
								<span
									class="rounded-full bg-black/60 px-3 py-1 font-body text-[11px] font-bold text-white shadow-xs backdrop-blur-xs"
								>
									{item.category}
								</span>
							</div>

							<!-- Indicateur Type de média (Photo ou Vidéo) en haut à droite -->
							<div class="absolute top-3.5 right-3.5">
								{#if item.type === 'video'}
									<span
										class="flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary text-white shadow-md transition-transform duration-200 group-hover:scale-110"
									>
										<Play size={14} class="translate-x-0.5 fill-white" />
									</span>
								{:else}
									<span
										class="flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-text-primary shadow-xs backdrop-blur-xs transition-transform duration-200 group-hover:scale-110"
									>
										<Maximize2 size={14} />
									</span>
								{/if}
							</div>

							<!-- Texte incrusté en bas de carte -->
							<div class="absolute right-3.5 bottom-3.5 left-3.5 text-white">
								<h3 class="line-clamp-2 font-display text-sm leading-snug font-bold drop-shadow-sm">
									{item.title}
								</h3>

								<div
									class="mt-2 flex items-center justify-between font-body text-[11px] text-white/80"
								>
									<span class="flex items-center gap-1 drop-shadow-xs">
										<MapPin size={12} class="text-brand-accent" />
										<span>{item.location}</span>
									</span>
									<span class="flex items-center gap-1 drop-shadow-xs">
										<Calendar size={12} />
										<span>{item.date}</span>
									</span>
								</div>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<!-- État vide -->
			<div
				class="mx-auto mt-12 max-w-md rounded-3xl border border-gray-200/80 bg-white p-8 text-center shadow-xs"
			>
				<div
					class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400"
				>
					<ImageIcon size={28} />
				</div>
				<h3 class="font-display text-lg font-bold text-text-primary">Aucun média trouvé</h3>
				<p class="mt-1.5 font-body text-xs leading-relaxed text-text-secondary sm:text-sm">
					Aucun élément ne correspond à cette sélection. Changez vos filtres pour afficher nos
					autres photos et vidéos.
				</p>
				<button
					type="button"
					onclick={() => {
						activeCategory = 'all';
						activeTypeFilter = 'all';
					}}
					class="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 font-body text-xs font-bold text-text-primary shadow-2xs hover:bg-gray-50"
				>
					Réinitialiser les filtres
				</button>
			</div>
		{/if}
	</Container>
</section>
