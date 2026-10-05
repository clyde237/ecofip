<script lang="ts">
	import { onMount } from 'svelte';
	import Container from '../components/Container.svelte';
	import { Calendar, Clock, User, ArrowRight, Sparkles } from '@lucide/svelte';
	import type { DetailedArticleItem } from '../types.js';

	const defaultFeaturedArticle: DetailedArticleItem = {
		id: 'derniere-ligne-droite',
		title: 'Dernière Ligne Droite - Cameroun pour Jésus',
		category: 'Mission Nationale',
		categorySlug: 'mission',
		date: 'Édition 2024–2026',
		readTime: 'Mission en cours',
		image: '/article-evangelisation.jpg',
		imageAlt: 'Cameroun pour Jésus - Dernière ligne droite',
		authorName: 'Pasteur Valéry Tchamekwen',
		authorRole: 'Fondateur & Coordinateur National',
		authorAvatar: '/pasteur-valery-tchamekwen.png',
		excerpt:
			'Dans quelques mois, nous entamerons la dernière ligne droite de notre programme « Cameroun pour Jésus ». Il reste encore 10 villes à parcourir afin de révéler la puissance de Dieu et restaurer sa gloire dans les vies et les sociétés. De nombreuses personnes vivent dans la détresse et attendent le secours que Dieu leur enverra à travers cette mission.',
		fullContent: [
			'Dans quelques mois, nous entamerons la dernière ligne droite de notre programme « Cameroun pour Jésus ».',
			'Il reste encore 10 villes à parcourir afin de révéler la puissance de Dieu et restaurer sa gloire dans les vies et les sociétés. De nombreuses personnes vivent dans la détresse et attendent le secours que Dieu leur enverra à travers cette mission.',
			'Chaque croisade est une opportunité historique de proclamer le salut en Jésus-Christ, de délivrer les captifs et d’apporter une assistance concrète aux veuves, orphelins et malades.',
			'Mobilisons-nous dans la prière, le don et l’engagement sur le terrain pour cette grande moisson nationale.'
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

					<!-- Actions officielles de la dernière grande mission -->
					<div class="mt-8 flex flex-wrap items-center gap-3.5 pt-2">
						<a
							href="/projets-missions"
							class="group/btn inline-flex items-center gap-2 rounded-xl bg-brand-primary px-5 py-3 font-body text-xs font-bold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-primary-hover hover:shadow-lg focus-visible:outline-2 focus-visible:outline-brand-primary sm:text-sm"
						>
							<span>En savoir plus sur les dates et comment s'impliquer</span>
							<ArrowRight
								size={16}
								class="transition-transform duration-200 group-hover/btn:translate-x-1"
							/>
						</a>

						<a
							href="#temoignages-marquants"
							class="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-3 font-body text-xs font-semibold text-text-primary shadow-2xs transition-all hover:border-gray-400 hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-gray-400 sm:text-sm"
						>
							<span>Lire des témoignages</span>
						</a>
					</div>
				</div>
			</div>
		</div>
	</Container>
</section>
