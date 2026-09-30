<script lang="ts">
	import { onMount } from 'svelte';
	import Container from '../components/Container.svelte';
	import { Calendar, Clock, User, ArrowRight, Sparkles } from '@lucide/svelte';
	import type { DetailedArticleItem } from '../types.js';

	const defaultFeaturedArticle: DetailedArticleItem = {
		id: 'rapport-croisade-bafia-2026',
		title: 'Rapport de Mission : Plus de 1 200 âmes touchées et 450 soins médicaux offerts à Bafia',
		category: 'Rapport de Terrain',
		categorySlug: 'mission',
		date: '18 Septembre 2026',
		readTime: '6 min de lecture',
		image: '/article-communaute.jpg',
		imageAlt: 'Communauté et bénévoles rassemblés lors de la mission à Bafia',
		authorName: 'Pasteur Valéry Tchamekwen',
		authorRole: 'Directeur de la vision ECOFIP',
		authorAvatar: '/avatar-jean-pierre.jpg',
		excerpt:
			'Pendant quatre jours intenses de déploiement missionnaire, l’équipe pluridisciplinaire d’ECOFIP a sillonné les villages du département du Mbam-et-Inoubou. Entre soins de santé gratuits, consultations ophtalmologiques, distribution de bibles et grandes soirées d’évangélisation, découvrez les temps forts de cette moisson bénie.',
		fullContent: [
			'La grâce de notre Seigneur Jésus-Christ s’est une nouvelle fois manifestée avec puissance lors de notre mission de terrain à Bafia et dans les localités environnantes.',
			'Dès le premier matin, la clinique mobile installée à l’esplanade municipale a accueilli des centaines d’hommes, de femmes et d’enfants venus parfois de plus de 25 kilomètres à pied. Grâce au dévouement sans faille de nos 14 médecins et infirmiers bénévoles, plus de 450 consultations médicales gratuites et des lots entiers de médicaments de première nécessité ont été distribués.',
			'Chaque soir, dès le coucher du soleil, la place des fêtes s’est transformée en un sanctuaire à ciel ouvert. Les cantiques de louange ont résonné, et la prédication simple mais tranchante de l’Évangile de la croix a touché les cœurs les plus endurcis. Plus de 380 personnes ont levé la main pour donner leur vie à Christ et ont immédiatement été prises en charge par nos conseillers d’écoute pour un suivi personnalisé avec les églises locales.',
			'Nous rendons toute la gloire à Dieu et remercions chaleureusement chacun des donateurs et prieurs qui rendent ces expéditions possibles.'
		],
		isFeatured: true
	};

	let {
		article = defaultFeaturedArticle,
		eyebrow = 'ARTICLE À LA UNE',
		onReadArticle,
		class: customClass = ''
	}: {
		article?: DetailedArticleItem;
		eyebrow?: string;
		onReadArticle?: (article: DetailedArticleItem) => void;
		class?: string;
	} = $props();

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
	aria-labelledby="featured-article-heading"
>
	<Container>
		<div
			class="group relative overflow-hidden rounded-3xl border border-gray-200/90 bg-[#f8fafc] shadow-lg transition-all duration-700 ease-out hover:shadow-xl {isVisible
				? 'translate-y-0 opacity-100'
				: 'translate-y-8 opacity-0'}"
		>
			<div class="grid grid-cols-1 lg:grid-cols-12">
				<!-- Image de gauche (6 cols sur grand écran) -->
				<div class="relative h-72 overflow-hidden sm:h-96 lg:col-span-6 lg:h-auto">
					<img
						src={article.image}
						alt={article.imageAlt}
						class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
					/>
					<div
						class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent lg:hidden"
					></div>

					<!-- Badge Catégorie à la une -->
					<div class="absolute top-5 left-5">
						<span
							class="inline-flex items-center gap-1.5 rounded-full bg-brand-primary px-4 py-1.5 font-body text-xs font-bold tracking-wider text-white uppercase shadow-md"
						>
							<Sparkles size={13} />
							<span>{article.category}</span>
						</span>
					</div>
				</div>

				<!-- Contenu textuel à droite (6 cols) -->
				<div class="flex flex-col justify-between p-7 sm:p-10 lg:col-span-6 lg:p-12 xl:p-14">
					<div>
						<!-- Métadonnées : Date & Temps de lecture -->
						<div
							class="flex flex-wrap items-center gap-4 text-xs font-semibold text-text-secondary sm:text-sm"
						>
							<span class="flex items-center gap-1.5 font-bold text-brand-primary">
								<Calendar size={15} />
								<span>{article.date}</span>
							</span>
							<span class="text-gray-300">•</span>
							<span class="flex items-center gap-1.5">
								<Clock size={15} />
								<span>{article.readTime}</span>
							</span>
						</div>

						<!-- Titre en Playfair Display -->
						<h2
							id="featured-article-heading"
							class="mt-4 font-display text-2xl leading-tight font-bold tracking-tight text-text-primary transition-colors group-hover:text-brand-primary sm:text-3xl lg:text-[32px]"
						>
							{article.title}
						</h2>

						<!-- Extrait de l'article -->
						<p class="mt-4 font-body text-sm leading-relaxed text-text-secondary sm:text-base">
							{article.excerpt}
						</p>

						<!-- Profil auteur -->
						<div class="mt-6 flex items-center gap-3 border-t border-gray-200/80 pt-5">
							<div
								class="h-11 w-11 shrink-0 overflow-hidden rounded-full border border-gray-200 bg-gray-100"
							>
								<img
									src={article.authorAvatar || '/avatar-jean-pierre.jpg'}
									alt={article.authorName}
									class="h-full w-full object-cover"
								/>
							</div>
							<div>
								<span class="block font-body text-xs font-bold text-text-primary sm:text-sm">
									{article.authorName}
								</span>
								{#if article.authorRole}
									<span class="block font-body text-[11px] text-text-secondary">
										{article.authorRole}
									</span>
								{/if}
							</div>
						</div>
					</div>

					<!-- Bouton d'action pour lire l'article -->
					<div class="mt-8 pt-2">
						<button
							type="button"
							onclick={() => onReadArticle?.(article)}
							class="group/btn inline-flex cursor-pointer items-center gap-2.5 rounded-xl bg-brand-primary px-6 py-3 font-body text-sm font-bold text-white shadow-md transition-all duration-200 hover:translate-y-[-1px] hover:bg-brand-primary-hover hover:shadow-lg focus-visible:outline-2 focus-visible:outline-brand-primary sm:text-base"
						>
							<span>Lire le rapport complet</span>
							<ArrowRight
								size={17}
								class="transition-transform duration-200 group-hover/btn:translate-x-1"
							/>
						</button>
					</div>
				</div>
			</div>
		</div>
	</Container>
</section>
