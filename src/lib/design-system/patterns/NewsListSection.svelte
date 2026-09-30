<script lang="ts">
	import { onMount } from 'svelte';
	import Container from '../components/Container.svelte';
	import { Calendar, Clock, Search, ArrowRight, Filter, BookOpen, X } from '@lucide/svelte';
	import type { DetailedArticleItem, NewsListProps } from '../types.js';

	const defaultArticles: DetailedArticleItem[] = [
		{
			id: 'actions-missionnaires-nord',
			title: 'Lumière dans l’Adamaoua : Quand l’Évangile brise les solitudes',
			category: 'Rapport de Mission',
			categorySlug: 'mission',
			date: '12 Septembre 2026',
			readTime: '5 min de lecture',
			image: '/article-bible.jpg',
			imageAlt: 'Étude biblique et mains tournant les pages des Saintes Écritures',
			authorName: 'Équipe Terrain ECOFIP',
			authorRole: 'Département Évangélisation',
			authorAvatar: '/avatar-jean-pierre.jpg',
			excerpt:
				'Récit immersif de notre périple de 10 jours dans les villages reculés du plateau de l’Adamaoua. Des centaines de familles ont reçu leur première Bible dans leur langue maternelle.',
			fullContent: [
				'L’expédition dans la région de l’Adamaoua a constitué un moment charnière pour le déploiement de la vision ECOFIP cette année.',
				'Parcourant des pistes de latérite souvent difficiles d’accès, nos équipes de missionnaires et de bénévoles ont installé des campements temporaires dans six villages successifs. Dès les premières heures du matin, les visites de porte-à-porte ont permis d’écouter les besoins réels des habitants et d’apporter une parole d’espérance et de prière.',
				'Au total, plus de 600 bibles d’étude ont été remises gratuitement aux familles et aux responsables d’églises locales démunis de matériel pastoral.',
				'« Voir les yeux d’un ancien de village s’illuminer lorsqu’il ouvre les Écritures pour la première fois restera gravé dans notre mémoire collective », témoigne l’un de nos responsables logistiques.'
			]
		},
		{
			id: 'temoignage-guerison-marie',
			title: '« Les médecins avaient perdu espoir, mais Dieu en a décidé autrement »',
			category: 'Témoignage',
			categorySlug: 'temoignage',
			date: '08 Septembre 2026',
			readTime: '4 min de lecture',
			image: '/about-worship-hd.jpg',
			imageAlt: 'Prière d’adoration et de reconnaissance',
			authorName: 'Sœur Marie-Claire N.',
			authorRole: 'Témoignage vérifié • Douala',
			authorAvatar: '/avatar-marie.jpg',
			excerpt:
				'Frappée par une maladie invalidante depuis plus de trois ans, Marie-Claire a vu sa santé miraculeusement restaurée lors de la soirée d’intercession de la dernière croisade.',
			fullContent: [
				'Je m’appelle Marie-Claire, mère de trois enfants résidant à Bonabéri. Pendant plus de trois années de souffrances ininterrompues, j’ai consulté de nombreux spécialistes pour des douleurs articulaires chroniques qui m’empêchaient de marcher sans béquilles.',
				'Le 16 août dernier, un voisin m’a parlé de la campagne organisée par ECOFIP. Malgré ma grande fatigue, j’ai décidé d’y assister avec la conviction que Jésus est le même hier, aujourd’hui et éternellement.',
				'Pendant le temps de louange et de proclamation, le pasteur a déclaré une parole de guérison spécifique pour les personnes souffrant des articulations. Au même instant, une chaleur intense a parcouru mes jambes. J’ai lâché mes béquilles et commencé à avancer sans la moindre douleur !',
				'Aujourd’hui, mes examens médicaux de contrôle confirment le rétablissement complet de ma mobilité. Toute la gloire revient à notre Seigneur Jésus-Christ.'
			]
		},
		{
			id: 'fondements-vie-disciple',
			title: 'Les 4 piliers indispensables pour grandir dans sa vie de disciple',
			category: 'Enseignement Biblique',
			categorySlug: 'enseignement',
			date: '02 Septembre 2026',
			readTime: '7 min de lecture',
			image: '/article-evangelisation.jpg',
			imageAlt: 'Enseignement biblique et partage de la foi',
			authorName: 'Pasteur Valéry Tchamekwen',
			authorRole: 'Enseignement pastoral',
			authorAvatar: '/avatar-jean-pierre.jpg',
			excerpt:
				'La conversion n’est que la première étape : comment bâtir une communion vivante avec Dieu à travers la prière, la méditation de la Parole, l’obéissance et la communion fraternelle.',
			fullContent: [
				'Beaucoup de croyants sincères s’arrêtent au seuil de la conversion sans jamais entrer dans la plénitude de la maturité que Christ a prévue pour ses disciples.',
				'1. La méditation quotidienne des Saintes Écritures : la Parole n’est pas un simple livre de morale, elle est le pain spirituel qui nourrit notre homme intérieur (Matthieu 4:4). Sans une alimentation biblique quotidienne, notre discernement spirituel s’affaiblit.',
				'2. La vie secrète de prière : Jésus se retirait fréquemment dans les lieux déserts pour prier. La prière véritable ne consiste pas à énumérer des requêtes, mais à demeurer dans l’intimité du Père et à aligner notre volonté sur la sienne.',
				'3. L’obéissance radicale : aimer le Seigneur, c’est garder ses commandements. La foi biblique ne se mesure pas à nos émotions, mais à notre disposition pratique à obéir même quand cela coûte à notre chair.',
				'4. La communion fraternelle et le service : on ne grandit pas seul. C’est au sein de l’assemblée des saints et dans l’exercice humble du service aux autres que notre caractère est façonné à la ressemblance de Christ.'
			]
		},
		{
			id: 'action-medicale-ecoles',
			title: 'Dépistage ophtalmologique et santé oculaire en milieu scolaire',
			category: 'Santé & Humanitaire',
			categorySlug: 'humanitaire',
			date: '27 Août 2026',
			readTime: '4 min de lecture',
			image: '/about-mission.jpg',
			imageAlt: 'Soins médicaux et consultations pour les enfants',
			authorName: 'Dr. Samuel Kamga',
			authorRole: 'Coordination Médicale ECOFIP',
			authorAvatar: '/avatar-sarah.jpg',
			excerpt:
				'Bilan de l’intervention de notre pôle médical dans quatre établissements primaires : plus de 320 élèves dépistés et 85 paires de lunettes correctrices offertes gracieusement.',
			fullContent: [
				'La vue est essentielle à la réussite scolaire et à l’épanouissement d’un enfant. Pourtant, dans de nombreuses localités périurbaines et rurales, l’accès à un spécialiste de la vue demeure un luxe inaccessible pour la majorité des familles.',
				'C’est pourquoi notre équipe médicale mobile a ciblé quatre écoles primaires pour une campagne de dépistage ophtalmologique préventif.',
				'Grâce à la générosité de nos bienfaiteurs et à l’expertise de trois ophtalmologues bénévoles, 320 élèves ont bénéficié d’un bilan visuel complet. 85 enfants ont reçu des lunettes de correction sur mesure et des collyres pour traiter des infections chroniques.',
				'Par ce geste d’amour concret, nous manifestons la sollicitude de Christ pour les plus vulnérables.'
			]
		},
		{
			id: 'croisade-intercession-jeunesse',
			title: 'Retour en images : 48 heures de louange et d’intercession non-stop',
			category: 'Rapport de Mission',
			categorySlug: 'mission',
			date: '20 Août 2026',
			readTime: '3 min de lecture',
			image: '/event-camp.jpg',
			imageAlt: 'Rassemblement de jeunes chrétiens pour la prière',
			authorName: 'Comité Jeunesse ECOFIP',
			authorRole: 'Pôle Moisson',
			authorAvatar: '/avatar-sarah.jpg',
			excerpt:
				'Une chaîne ininterrompue de prières pour le réveil des cœurs et la paix au Cameroun. Les temps forts de cette retraite spirituelle mémorable.',
			fullContent: [
				'Pendant 48 heures consécutives, plus de 300 jeunes croyants se sont relayés jour et nuit pour élever un autel de louange et d’intercession en faveur de notre nation.',
				'Les cœurs ont été brisés dans la repentance, des fardeaux lourds ont été déposés au pied de la croix, et de nombreuses vocations missionnaires se sont levées.',
				'Nous croyons fermement que lorsque le peuple de Dieu s’humilie et prie, les cieux s’ouvrent et la bénédiction de Dieu descend sur nos communautés.'
			]
		},
		{
			id: 'gestion-fidele-biens',
			title: 'L’économe fidèle : Pourquoi la gestion financière est un acte spirituel',
			category: 'Enseignement Biblique',
			categorySlug: 'enseignement',
			date: '14 Août 2026',
			readTime: '6 min de lecture',
			image: '/article-communaute.jpg',
			imageAlt: 'Partage fraternel et générosité',
			authorName: 'Pasteur Valéry Tchamekwen',
			authorRole: 'Enseignement pastoral',
			authorAvatar: '/avatar-jean-pierre.jpg',
			excerpt:
				'Inspiré de Luc 12:42 : comprendre comment l’intégrité, la rigueur et la générosité reflètent directement la fidélité de notre marche avec Dieu.',
			fullContent: [
				'Dans l’Évangile selon Luc (12:42), le Seigneur Jésus pose cette question fondamentale : « Quel est donc l’économe fidèle et prudent que le maître établira sur ses gens, pour leur donner la nourriture au temps convenable ? »',
				'Cette interrogation est au cœur même de l’identité d’ECOFIP. Être un économe selon Dieu implique de reconnaître que nous ne sommes propriétaires de rien sur cette terre : notre vie, nos talents, nos ressources matérielles et financières sont des dépôts sacrés confiés par le Maître.',
				'La saine gestion ne s’oppose pas à la foi ; au contraire, elle en est la démonstration pratique la plus éloquente. Lorsque nous gérons avec ordre, transparence et désintéressement les dons que Dieu nous accorde, nous honorons son Nom devant les hommes.'
			]
		}
	];

	let {
		eyebrow = 'TOUTES LES PUBLICATIONS',
		title = 'Explorez nos articles & chroniques',
		subtitle = 'Filtrez par thématique ou effectuez une recherche pour trouver les récits et enseignements qui vous édifieront.',
		articles = defaultArticles,
		onReadArticle,
		class: customClass = ''
	}: NewsListProps = $props();

	let activeCategory = $state<string>('all');
	let searchQuery = $state('');

	const categories = [
		{ id: 'all', label: 'Toutes les chroniques' },
		{ id: 'temoignage', label: 'Témoignages de foi' },
		{ id: 'mission', label: 'Rapports de terrain' },
		{ id: 'enseignement', label: 'Enseignements bibliques' },
		{ id: 'humanitaire', label: 'Santé & Humanitaire' }
	];

	// Filtrage réactif
	let filteredArticles = $derived(
		articles.filter((item) => {
			const matchesCategory = activeCategory === 'all' || item.categorySlug === activeCategory;

			const query = searchQuery.trim().toLowerCase();
			const matchesSearch =
				!query ||
				item.title.toLowerCase().includes(query) ||
				item.authorName.toLowerCase().includes(query) ||
				item.category.toLowerCase().includes(query) ||
				item.excerpt.toLowerCase().includes(query);

			return matchesCategory && matchesSearch;
		})
	);

	function resetFilters() {
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
	id="articles"
	bind:this={sectionEl}
	class="bg-[#f8fafc] py-16 sm:py-20 lg:py-28 {customClass}"
	aria-labelledby="news-list-heading"
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
				id="news-list-heading"
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

		<!-- Barre de filtres et recherche -->
		<div
			class="mt-12 space-y-4 rounded-3xl border border-gray-200/80 bg-white p-5 shadow-xs transition-all duration-700 ease-out sm:mt-16 sm:p-6 {isVisible
				? 'translate-y-0 opacity-100'
				: 'translate-y-8 opacity-0'}"
			style="transition-delay: 100ms;"
		>
			<div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
				<!-- Catégories de filtres -->
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

				<!-- Barre de recherche textuelle -->
				<div class="relative w-full lg:max-w-xs">
					<Search
						size={18}
						class="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-gray-400"
					/>
					<input
						type="text"
						bind:value={searchQuery}
						placeholder="Rechercher par mot-clé..."
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
		</div>

		<!-- Grille des articles -->
		{#if filteredArticles.length > 0}
			<div class="mt-8 grid grid-cols-1 gap-6 sm:mt-10 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
				{#each filteredArticles as item, index (item.id)}
					<article
						class="group flex flex-col justify-between overflow-hidden rounded-3xl border border-gray-200/80 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-1.5 hover:border-gray-300 hover:shadow-[0_20px_45px_rgba(0,0,0,0.08)] {isVisible
							? 'translate-y-0 opacity-100'
							: 'translate-y-8 opacity-0'}"
						style="transition-delay: {index * 70}ms;"
					>
						<div>
							<!-- Image avec badge catégorie -->
							<div class="relative h-52 w-full overflow-hidden bg-gray-100">
								<img
									src={item.image}
									alt={item.imageAlt}
									class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
									loading="lazy"
								/>
								<div
									class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"
								></div>

								<div class="absolute top-4 left-4">
									<span
										class="rounded-full bg-white/95 px-3 py-1 font-body text-xs font-bold text-brand-primary shadow-xs backdrop-blur-xs"
									>
										{item.category}
									</span>
								</div>
							</div>

							<!-- Contenu -->
							<div class="p-6">
								<!-- Date & Temps de lecture -->
								<div class="flex items-center gap-3 text-xs font-semibold text-text-secondary">
									<span class="flex items-center gap-1.5">
										<Calendar size={13} class="text-brand-primary" />
										<span>{item.date}</span>
									</span>
									<span class="text-gray-300">•</span>
									<span class="flex items-center gap-1.5">
										<Clock size={13} class="text-gray-400" />
										<span>{item.readTime}</span>
									</span>
								</div>

								<!-- Titre -->
								<h3
									class="mt-3 font-display text-xl leading-snug font-bold tracking-tight text-text-primary transition-colors group-hover:text-brand-primary"
								>
									{item.title}
								</h3>

								<!-- Extrait -->
								<p
									class="mt-3 line-clamp-3 font-body text-xs leading-relaxed text-text-secondary sm:text-sm"
								>
									{item.excerpt}
								</p>

								<!-- Auteur -->
								<div class="mt-5 flex items-center gap-2.5 border-t border-gray-100 pt-4">
									<div
										class="h-8 w-8 shrink-0 overflow-hidden rounded-full border border-gray-200 bg-gray-100"
									>
										<img
											src={item.authorAvatar || '/avatar-jean-pierre.jpg'}
											alt={item.authorName}
											class="h-full w-full object-cover"
										/>
									</div>
									<div class="min-w-0">
										<span class="block truncate font-body text-xs font-bold text-text-primary">
											{item.authorName}
										</span>
										{#if item.authorRole}
											<span class="block truncate font-body text-[11px] text-text-secondary">
												{item.authorRole}
											</span>
										{/if}
									</div>
								</div>
							</div>
						</div>

						<!-- Pied de carte avec lien de lecture -->
						<div class="border-t border-gray-100 p-5 pt-4">
							<button
								type="button"
								onclick={() => onReadArticle?.(item)}
								class="group/link flex w-full cursor-pointer items-center justify-between font-body text-xs font-bold text-brand-primary transition-colors hover:text-brand-primary-hover"
							>
								<span>Lire l’article complet</span>
								<ArrowRight
									size={14}
									class="transition-transform duration-200 group-hover/link:translate-x-1"
								/>
							</button>
						</div>
					</article>
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
					<BookOpen size={28} />
				</div>
				<h3 class="font-display text-lg font-bold text-text-primary">Aucune publication trouvée</h3>
				<p class="mt-1.5 font-body text-xs leading-relaxed text-text-secondary sm:text-sm">
					Aucun article ne correspond à votre recherche actuelle. Réinitialisez vos filtres pour
					afficher toutes les chroniques.
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
