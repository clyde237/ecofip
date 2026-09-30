<script lang="ts">
	import { onMount } from 'svelte';
	import Container from '../components/Container.svelte';
	import { MapPin, Users, Heart, BookOpen, Building2, CheckCircle2, Clock } from '@lucide/svelte';
	import type { ProjectsListProps, ProjectItem } from '../types.js';

	const defaultProjects: ProjectItem[] = [
		{
			id: 'croisade-douala',
			title: 'Grande Croisade de Réveil & Guérison à Douala',
			category: 'Évangélisation',
			categorySlug: 'evangelisation',
			location: 'Douala, Littoral',
			image: '/event-croisade.jpg',
			imageAlt: 'Foule rassemblée lors de la croisade d’évangélisation ECOFIP',
			status: 'Accompli',
			metrics: '18 000+ âmes rassemblées · 850 décisions pour Christ',
			description:
				'Grand rassemblement en plein air réunissant des milliers de familles pour la proclamation de la Parole, des prières de délivrance et le salut des cœurs.'
		},
		{
			id: 'clinique-grand-nord',
			title: 'Clinique Mobile & Soutien Alimentaire dans le Grand Nord',
			category: 'Santé & Social',
			categorySlug: 'humanitaire',
			location: 'Maroua & Environs, Extrême-Nord',
			image: '/article-communaute.jpg',
			imageAlt: 'Distribution de soins et vivres par les équipes ECOFIP',
			status: 'En cours',
			metrics: '4 200 consultations gratuites · 1 500 paniers vivres',
			description:
				'Déploiement de médecins et infirmiers bénévoles pour apporter des consultations médicales gratuites, médicaments essentiels et vivres aux familles démunies.'
		},
		{
			id: 'ecole-disciples-yaounde',
			title: 'École Régionale de Formation des Disciples & Leaders',
			category: 'Discipulat & Formation',
			categorySlug: 'formation',
			location: 'Yaoundé, Centre',
			image: '/event-seminaire.jpg',
			imageAlt: 'Séminaire biblique et formation de responsables',
			status: 'En cours',
			metrics: '600 disciples formés · 45 églises représentées',
			description:
				'Cycles intensifs d’enracinement biblique, de vie de prière et de formation au leadership serviteur pour fortifier les ouvriers dans la mission.'
		},
		{
			id: 'mission-rurale-ouest',
			title: 'Mission d’Évangélisation et d’Entraide en Milieu Rural',
			category: 'Évangélisation',
			categorySlug: 'evangelisation',
			location: 'Bafoussam et villages voisins, Ouest',
			image: '/article-evangelisation.jpg',
			imageAlt: 'Équipes missionnaires marchant dans les villages de l’Ouest',
			status: 'Accompli',
			metrics: '12 localités visitées · 3 400 Bibles distribuées',
			description:
				'Équipes itinérantes partageant la Bonne Nouvelle de maison en maison, projection du film Jésus et soutien fraternel aux personnes âgées et isolées.'
		},
		{
			id: 'camp-jeunes-impact',
			title: 'Camp National de Réveil pour la Jeunesse (Impact Jeunes)',
			category: 'Discipulat & Formation',
			categorySlug: 'formation',
			location: 'Mont Fébé, Yaoundé',
			image: '/event-camp.jpg',
			imageAlt: 'Jeunesse chrétienne unie dans la prière et la louange',
			status: 'À venir',
			metrics: '1 200 jeunes attendus · 3 jours de retraite',
			description:
				'Rassemblement annuel de la jeunesse pour susciter une génération consacrée, intègre et passionnée pour servir le Seigneur dans la société.'
		},
		{
			id: 'centre-communautaire-sud',
			title: 'Construction du Centre Polyvalent d’Espoir & Formation',
			category: 'Développement',
			categorySlug: 'communaute',
			location: 'Kribi, Sud',
			image: '/article-bible.jpg',
			imageAlt: 'Chantier du centre communautaire et spirituel ECOFIP',
			status: 'En cours',
			metrics: 'Avancement 65% · Capacité 800 places',
			description:
				'Édification d’un espace polyvalent dédié à l’alphabétisation des enfants défavorisés, l’apprentissage de métiers pratiques et la tenue des cultes.'
		}
	];

	let {
		eyebrow = 'NOS RÉALISATIONS SUR LE TERRAIN',
		title = 'Découvrez l’impact de nos projets',
		subtitle = 'Chaque mission incarne la fidélité dans l’action : proclamer la Bonne Nouvelle et transformer concrètement les réalités humaines.',
		projects = defaultProjects,
		class: customClass = ''
	}: ProjectsListProps = $props();

	let selectedCategory = $state<
		'all' | 'evangelisation' | 'humanitaire' | 'formation' | 'communaute'
	>('all');

	const filterCategories = [
		{ label: 'Tous les projets', slug: 'all' as const },
		{ label: 'Croisades & Évangélisation', slug: 'evangelisation' as const },
		{ label: 'Santé & Social', slug: 'humanitaire' as const },
		{ label: 'Discipulat & Formation', slug: 'formation' as const },
		{ label: 'Développement', slug: 'communaute' as const }
	];

	let filteredProjects = $derived(
		selectedCategory === 'all'
			? projects
			: projects.filter((p) => p.categorySlug === selectedCategory)
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
	id="projets"
	bind:this={sectionEl}
	class="bg-white py-16 sm:py-20 lg:py-28 {customClass}"
	aria-labelledby="projects-list-heading"
>
	<Container>
		<!-- En-tête de section -->
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
				id="projects-list-heading"
				class="font-display text-3xl leading-[1.2] font-extrabold tracking-tight text-text-primary sm:text-4xl lg:text-[44px]"
			>
				{title}
			</h2>

			{#if subtitle}
				<p class="mt-4 font-body text-sm leading-relaxed text-text-secondary sm:text-base">
					{subtitle}
				</p>
			{/if}
		</div>

		<!-- Boutons de filtres interactifs par domaine d'action -->
		<div
			class="mt-10 flex flex-wrap items-center justify-center gap-2 sm:mt-12 sm:gap-2.5"
			role="tablist"
			aria-label="Filtrer les projets par catégorie"
		>
			{#each filterCategories as cat (cat.slug)}
				{@const active = selectedCategory === cat.slug}
				<button
					type="button"
					role="tab"
					aria-selected={active}
					onclick={() => (selectedCategory = cat.slug)}
					class="cursor-pointer rounded-xl px-4 py-2.5 font-body text-xs font-bold transition-all duration-200 select-none sm:text-sm {active
						? 'bg-brand-primary text-white shadow-md'
						: 'border border-gray-200 bg-surface/60 text-text-secondary hover:border-gray-300 hover:bg-surface hover:text-text-primary'}"
				>
					{cat.label}
				</button>
			{/each}
		</div>

		<!-- Grille des projets filtrés -->
		<div class="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
			{#each filteredProjects as project, index (project.id)}
				<article
					class="group relative flex flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.05)] transition-all duration-500 ease-out hover:-translate-y-1.5 hover:border-gray-200 hover:shadow-[0_20px_45px_rgba(0,0,0,0.1)] {isVisible
						? 'translate-y-0 opacity-100'
						: 'translate-y-8 opacity-0'}"
					style="transition-delay: {index * 80}ms;"
				>
					<!-- Image du projet avec statut et catégorie superposés -->
					<div class="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
						<img
							src={project.image}
							alt={project.imageAlt || project.title}
							class="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
							loading="lazy"
						/>

						<!-- Badge Catégorie en haut à gauche -->
						<div class="absolute top-3.5 left-3.5">
							<span
								class="rounded-lg bg-black/60 px-3 py-1 font-body text-xs font-bold text-white shadow-xs backdrop-blur-md"
							>
								{project.category}
							</span>
						</div>

						<!-- Badge Statut en haut à droite -->
						<div class="absolute top-3.5 right-3.5">
							<span
								class="flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-body text-xs font-bold shadow-xs backdrop-blur-md {project.status ===
								'Accompli'
									? 'bg-emerald-600/90 text-white'
									: project.status === 'En cours'
										? 'bg-amber-500/90 text-white'
										: 'bg-blue-600/90 text-white'}"
							>
								{#if project.status === 'Accompli'}
									<CheckCircle2 size={13} />
								{:else}
									<Clock size={13} />
								{/if}
								<span>{project.status}</span>
							</span>
						</div>
					</div>

					<!-- Contenu de la carte projet -->
					<div class="flex flex-1 flex-col p-6 sm:p-7">
						<!-- Localisation -->
						<div class="flex items-center gap-1.5 text-text-secondary">
							<MapPin size={14} class="text-brand-primary" aria-hidden="true" />
							<span class="font-body text-xs font-medium">
								{project.location}
							</span>
						</div>

						<!-- Titre du projet -->
						<h3
							class="mt-2.5 font-display text-lg leading-snug font-bold tracking-tight text-text-primary transition-colors group-hover:text-brand-primary sm:text-xl"
						>
							{project.title}
						</h3>

						<!-- Description -->
						<p class="mt-3 font-body text-xs leading-relaxed text-text-secondary sm:text-sm">
							{project.description}
						</p>

						<!-- Métrique clé d'impact au bas de la carte -->
						<div class="mt-5 mt-auto border-t border-gray-100 pt-4">
							<div class="flex items-center gap-2 text-text-primary">
								<Users size={15} class="shrink-0 text-brand-primary" aria-hidden="true" />
								<span class="font-body text-xs font-bold text-text-primary">
									{project.metrics}
								</span>
							</div>
						</div>
					</div>
				</article>
			{/each}
		</div>
	</Container>
</section>
