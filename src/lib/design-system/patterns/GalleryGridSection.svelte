<script module lang="ts">
	import type { MediaItem } from '../types.js';

	export const defaultPhotos: MediaItem[] = [
		{
			id: 'croisade-kribi-2023',
			title: 'Grande Croisade de Réveil à Kribi',
			category: 'Croisades',
			categorySlug: 'croisades',
			type: 'photo',
			year: '2023',
			url: '/event-croisade.jpg',
			location: 'Kribi, Sud',
			date: '2023',
			description:
				'Des milliers de personnes rassemblées sous la gloire de Dieu lors de la croisade à Kribi.'
		},
		{
			id: 'action-sociale-edea-2023',
			title: 'Aide humanitaire et dons de vivres à Edéa',
			category: 'Actions sociales',
			categorySlug: 'social',
			type: 'photo',
			year: '2023',
			url: '/article-communaute.jpg',
			location: 'Edéa, Littoral',
			date: '2023',
			description:
				'Distribution de vivres, kits de première nécessité et assistance aux familles démunies.'
		},
		{
			id: 'croisade-touboro-2024',
			title: 'Proclamation de l’Évangile à Touboro',
			category: 'Croisades',
			categorySlug: 'croisades',
			type: 'photo',
			year: '2024',
			url: '/pasteur-valery-tchamekwen.png',
			location: 'Touboro, Nord',
			date: '2024',
			description:
				'Impact profond dans la région du Nord avec guérisons et conversions miraculeuses.'
		},
		{
			id: 'soins-medicaux-2024',
			title: 'Clinique mobile et consultations gratuites',
			category: 'Actions sociales',
			categorySlug: 'social',
			type: 'photo',
			year: '2024',
			url: '/about-mission.jpg',
			location: 'Bafia, Centre',
			date: '2024',
			description:
				'Soignants et médecins chrétiens mobilisés pour offrir des consultations et médicaments gratuits.'
		},
		{
			id: 'intercession-veillée-2023',
			title: 'Nuit d’intercession pour le Cameroun',
			category: 'Croisades',
			categorySlug: 'croisades',
			type: 'photo',
			year: '2023',
			url: '/about-worship-hd.jpg',
			location: 'Bafoussam, Ouest',
			date: '2023',
			description:
				'Veillée ardente de prière pour la paix et la délivrance des familles camerounaises.'
		},
		{
			id: 'distribution-bibles-2024',
			title: 'Distribution de bibles et littérature chrétienne',
			category: 'Actions sociales',
			categorySlug: 'social',
			type: 'photo',
			year: '2024',
			url: '/article-bible.jpg',
			location: 'Ngaoundéré, Adamaoua',
			date: '2024',
			description:
				'Don de bibles et traités d’édification pour affermir la foi des nouveaux convertis.'
		}
	];

	export const officialVideos: MediaItem[] = [
		{
			id: 'video-douala-2023',
			title: 'Résumé Croisade Douala 2023',
			category: 'Croisades',
			categorySlug: 'croisades',
			type: 'video',
			duration: '5:32',
			year: '2023',
			url: '/event-croisade.jpg',
			videoUrl:
				'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
			location: 'Douala, Littoral',
			date: '2023',
			description: 'Moments forts et moisson d’âmes lors de la grande croisade de Douala.'
		},
		{
			id: 'video-temoignages-puissants',
			title: 'Témoignages puissants',
			category: 'Témoignages',
			categorySlug: 'croisades',
			type: 'video',
			duration: '8:15',
			year: '2024',
			url: '/video-highlights-cover.jpg',
			videoUrl:
				'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
			location: 'Missions nationales',
			date: '2024',
			description: 'Récits émouvants de guérisons, délivrances et conversions radicales.'
		},
		{
			id: 'video-cameroun-annee-1',
			title: 'Cameroun pour Jésus - Année 1',
			category: 'Mission Nationale',
			categorySlug: 'croisades',
			type: 'video',
			duration: '12:40',
			year: '2024',
			url: '/about-mission.jpg',
			videoUrl:
				'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
			location: '10 Régions du Cameroun',
			date: '2024',
			description: 'Rétrospective complète de la première année du projet Cameroun pour Jésus.'
		}
	];

	export const defaultMediaItems: MediaItem[] = [...defaultPhotos, ...officialVideos];
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
		Video as VideoIcon,
		Clock
	} from '@lucide/svelte';
	import type { GalleryGridProps } from '../types.js';

	let {
		photos = defaultPhotos,
		videos = officialVideos,
		onSelectMedia,
		showFilters = true,
		class: customClass = ''
	}: {
		photos?: MediaItem[];
		videos?: MediaItem[];
		/** index et list : position du média dans la liste affichée (photos puis vidéos filtrées) */
		onSelectMedia?: (media: MediaItem, index: number, list: MediaItem[]) => void;
		/** false dans un album : catégorie et date y sont communes à tous les médias */
		showFilters?: boolean;
		class?: string;
	} = $props();

	// Filtres construits à partir du contenu : « Tout », puis chaque catégorie, puis chaque année
	type FilterTab = { id: string; label: string; matches: (item: MediaItem) => boolean };

	let filterTabs = $derived.by((): FilterTab[] => {
		const allItems = [...photos, ...videos];
		// Première occurrence de chaque catégorie, dans l'ordre d'affichage
		const categories = allItems.filter(
			(item, index) =>
				allItems.findIndex((other) => other.categorySlug === item.categorySlug) === index
		);
		const years = Array.from(
			new Set(allItems.map((item) => item.year).filter((year): year is string => Boolean(year)))
		).sort((a, b) => b.localeCompare(a));

		return [
			{ id: 'all', label: 'Tout', matches: () => true },
			...categories.map(({ categorySlug, category }) => ({
				id: `category:${categorySlug}`,
				label: category,
				matches: (item: MediaItem) => item.categorySlug === categorySlug
			})),
			...years.map((year) => ({
				id: `year:${year}`,
				label: year,
				matches: (item: MediaItem) => item.year === year
			}))
		];
	});

	let activeFilter = $state('all');
	let activeTab = $derived(filterTabs.find((tab) => tab.id === activeFilter) ?? filterTabs[0]);

	let filteredPhotos = $derived(photos.filter((item) => activeTab.matches(item)));
	let filteredVideos = $derived(videos.filter((item) => activeTab.matches(item)));
	let visibleMedia = $derived([...filteredPhotos, ...filteredVideos]);

	function selectMedia(media: MediaItem) {
		onSelectMedia?.(
			media,
			visibleMedia.findIndex((item) => item.id === media.id),
			visibleMedia
		);
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
	id="medias"
	bind:this={sectionEl}
	class="bg-[#f8fafc] py-16 sm:py-20 lg:py-28 {customClass}"
	aria-labelledby="gallery-photos-heading"
>
	<Container>
		<!-- SECTION 03 — FILTRES DE GALERIE -->
		<div
			class="flex flex-col items-center justify-center transition-all duration-700 ease-out {isVisible
				? 'translate-y-0 opacity-100'
				: 'translate-y-8 opacity-0'} {!showFilters || filterTabs.length <= 1 ? 'hidden' : ''}"
		>
			<div
				class="inline-flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-gray-200/80 bg-white p-2 shadow-xs"
			>
				{#each filterTabs as tab (tab.id)}
					<button
						type="button"
						aria-pressed={activeFilter === tab.id}
						onclick={() => (activeFilter = tab.id)}
						class="cursor-pointer rounded-xl px-4 py-2 font-body text-xs font-bold transition-all sm:text-sm {activeFilter ===
						tab.id
							? 'bg-brand-primary text-white shadow-xs'
							: 'text-text-secondary hover:bg-gray-100 hover:text-text-primary'}"
					>
						{tab.label}
					</button>
				{/each}
			</div>
		</div>

		<!-- SECTION 04 — PHOTOS (masquée quand il n'y a aucune photo, ex. album de vidéos) -->
		<div class="mt-14 {photos.length === 0 ? 'hidden' : ''}">
			<div class="mb-8 flex items-center justify-between border-b border-gray-200/80 pb-4">
				<div class="flex items-center gap-3">
					<div
						class="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-subtle text-brand-primary"
					>
						<ImageIcon size={20} />
					</div>
					<div>
						<h2
							id="gallery-photos-heading"
							class="font-display text-2xl font-extrabold tracking-tight text-text-primary sm:text-3xl"
						>
							Photos
						</h2>
						<p class="font-body text-xs text-text-secondary sm:text-sm">
							{filteredPhotos.length} image{filteredPhotos.length > 1 ? 's' : ''} disponible{filteredPhotos.length >
							1
								? 's'
								: ''}
						</p>
					</div>
				</div>
			</div>

			{#if filteredPhotos.length > 0}
				<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{#each filteredPhotos as item (item.id)}
						<div
							role="button"
							tabindex="0"
							onclick={() => selectMedia(item)}
							onkeydown={(e) => {
								if (e.key === 'Enter' || e.key === ' ') {
									e.preventDefault();
									selectMedia(item);
								}
							}}
							class="group relative flex cursor-pointer flex-col overflow-hidden rounded-3xl border border-gray-200/80 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-brand-primary/30 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-brand-primary"
						>
							<div class="relative aspect-4/3 w-full overflow-hidden bg-gray-100">
								<img
									src={item.url}
									alt={item.title}
									class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
									loading="lazy"
								/>
								<div
									class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
								></div>

								<!-- Badge Catégorie -->
								<div class="absolute top-3.5 left-3.5">
									<span
										class="rounded-full bg-black/60 px-3 py-1 font-body text-[11px] font-bold text-white shadow-xs backdrop-blur-xs"
									>
										{item.category}
									</span>
								</div>

								<!-- Zoom icon -->
								<div class="absolute top-3.5 right-3.5">
									<span
										class="flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-text-primary shadow-xs backdrop-blur-xs transition-transform duration-200 group-hover:scale-110"
									>
										<Maximize2 size={14} />
									</span>
								</div>

								<!-- Info text -->
								<div class="absolute right-3.5 bottom-3.5 left-3.5 text-white">
									<h3 class="line-clamp-2 font-display text-base font-bold drop-shadow-sm">
										{item.title}
									</h3>
									<div
										class="mt-2 flex items-center justify-between font-body text-xs text-white/80"
									>
										<span class="flex items-center gap-1 drop-shadow-xs">
											<MapPin size={13} class="text-brand-accent" />
											<span>{item.location}</span>
										</span>
										<span class="flex items-center gap-1 drop-shadow-xs">
											<Calendar size={13} />
											<span>{item.date}</span>
										</span>
									</div>
								</div>
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<div class="rounded-3xl border border-gray-200 bg-white p-10 text-center">
					<p class="font-body text-sm text-text-secondary">Aucune photo trouvée pour ce filtre.</p>
				</div>
			{/if}
		</div>

		<!-- SECTION 05 — VIDÉOS (masquée tant qu'aucune vidéo n'est publiée) -->
		<div class="mt-16 sm:mt-20 {videos.length === 0 ? 'hidden' : ''}">
			<div class="mb-8 flex items-center justify-between border-b border-gray-200/80 pb-4">
				<div class="flex items-center gap-3">
					<div
						class="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary text-white"
					>
						<VideoIcon size={20} />
					</div>
					<div>
						<h2
							class="font-display text-2xl font-extrabold tracking-tight text-text-primary sm:text-3xl"
						>
							Vidéos
						</h2>
						<p class="font-body text-xs text-text-secondary sm:text-sm">
							Reportages et témoignages vidéo de nos missions
						</p>
					</div>
				</div>
			</div>

			{#if filteredVideos.length === 0}
				<div class="rounded-3xl border border-gray-200 bg-white p-10 text-center">
					<p class="font-body text-sm text-text-secondary">Aucune vidéo trouvée pour ce filtre.</p>
				</div>
			{/if}
			<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{#each filteredVideos as video (video.id)}
					<div
						role="button"
						tabindex="0"
						onclick={() => selectMedia(video)}
						onkeydown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								e.preventDefault();
								selectMedia(video);
							}
						}}
						class="group relative flex cursor-pointer flex-col overflow-hidden rounded-3xl border border-gray-200/80 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-brand-primary/40 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-brand-primary"
					>
						<div class="relative aspect-16/10 w-full overflow-hidden bg-gray-900">
							<img
								src={video.url}
								alt={video.title}
								class="h-full w-full object-cover opacity-85 transition-transform duration-500 group-hover:scale-105"
								loading="lazy"
							/>
							<div
								class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"
							></div>

							<!-- Play button central -->
							<div class="absolute inset-0 flex items-center justify-center">
								<span
									class="flex h-14 w-14 items-center justify-center rounded-full bg-brand-primary text-white shadow-xl transition-all duration-300 group-hover:scale-115 group-hover:bg-brand-primary-hover"
								>
									<Play size={22} class="translate-x-0.5 fill-white" />
								</span>
							</div>

							<!-- Durée badge en bas à droite -->
							{#if video.duration}
								<div class="absolute right-3.5 bottom-3.5">
									<span
										class="inline-flex items-center gap-1 rounded-lg bg-black/80 px-2.5 py-1 font-body text-xs font-bold text-white shadow-xs backdrop-blur-xs"
									>
										<Clock size={12} />
										<span>{video.duration}</span>
									</span>
								</div>
							{/if}

							<!-- Catégorie en haut à gauche -->
							<div class="absolute top-3.5 left-3.5">
								<span
									class="rounded-full bg-black/60 px-3 py-1 font-body text-[11px] font-bold text-white shadow-xs backdrop-blur-xs"
								>
									{video.category}
								</span>
							</div>
						</div>

						<div class="p-5">
							<h3
								class="font-display text-lg font-bold text-text-primary transition-colors group-hover:text-brand-primary"
							>
								{video.title}
							</h3>
							{#if video.description}
								<p
									class="mt-1.5 line-clamp-2 font-body text-xs leading-relaxed text-text-secondary sm:text-sm"
								>
									{video.description}
								</p>
							{/if}
							<div class="text-text-muted mt-4 flex items-center justify-between font-body text-xs">
								<span class="flex items-center gap-1">
									<MapPin size={13} class="text-brand-accent" />
									<span>{video.location}</span>
								</span>
								<span class="flex items-center gap-1">
									<Calendar size={13} />
									<span>{video.date}</span>
								</span>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</Container>
</section>
