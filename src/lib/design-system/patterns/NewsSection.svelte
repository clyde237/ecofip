<script lang="ts">
	import { onMount } from 'svelte';
	import Container from '../components/Container.svelte';
	import { ArrowRight, Calendar } from '@lucide/svelte';
	import type { ArticleItem, NewsSectionProps } from '../types.js';

	const defaultArticles: ArticleItem[] = [
		{
			id: 'actions-missionnaires',
			title: 'Retour sur nos dernières actions missionnaires',
			category: 'Mission',
			date: '12 Sept. 2026',
			image: '/article-bible.jpg',
			imageAlt: 'Étude biblique et mains tournant les pages des Écritures',
			href: '/actualites/actions-missionnaires',
			readTime: '4 min de lecture'
		},
		{
			id: 'vies-restaurees',
			title: 'Des vies restaurées par la puissance de Dieu',
			category: 'Témoignage',
			date: '08 Sept. 2026',
			image: '/article-communaute.jpg',
			imageAlt: 'Trois jeunes unis dans la prière face au lever de soleil',
			href: '/actualites/vies-restaurees',
			readTime: '3 min de lecture'
		},
		{
			id: 'porter-evangile',
			title: 'Porter l’Évangile jusque dans les localités',
			category: 'Évangélisation',
			date: '01 Sept. 2026',
			image: '/article-evangelisation.jpg',
			imageAlt: 'Foule rassemblée en louange avec illumination du nom de Jésus',
			href: '/actualites/porter-evangile',
			readTime: '5 min de lecture'
		}
	];

	let {
		eyebrow = 'ACTUALITÉS',
		title = 'Dernières nouvelles',
		viewAllLabel = 'Voir toutes les actualités',
		viewAllHref = '/actualites',
		articles = defaultArticles,
		class: customClass = ''
	}: NewsSectionProps = $props();

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
	bind:this={sectionEl}
	class="bg-[#fafafc] py-16 sm:py-20 lg:py-24 {customClass}"
	aria-labelledby="news-section-heading"
>
	<Container>
		<!-- En-tête de section : Surtitre, Titre & Bouton Voir toutes les actualités -->
		<div
			class="flex flex-col gap-5 transition-all duration-700 sm:flex-row sm:items-end sm:justify-between {isVisible
				? 'translate-y-0 opacity-100'
				: 'translate-y-6 opacity-0'}"
		>
			<div class="max-w-2xl">
				{#if eyebrow}
					<span
						class="font-body text-xs font-bold tracking-[0.2em] text-brand-primary uppercase sm:text-sm"
					>
						{eyebrow}
					</span>
				{/if}
				<h2
					id="news-section-heading"
					class="mt-2 font-display text-3xl font-bold tracking-tight text-text-primary sm:text-4xl lg:text-[42px] lg:leading-[1.18]"
				>
					{title}
				</h2>
			</div>

			<!-- Bouton Voir toutes les actualités (contour rouge fin, flèche animée) -->
			{#if viewAllLabel}
				<div class="shrink-0">
					<a
						href={viewAllHref}
						class="group inline-flex cursor-pointer items-center gap-2 rounded-xl border border-brand-primary/40 bg-white px-5 py-2.5 text-sm font-bold text-brand-primary shadow-xs transition-all duration-200 select-none hover:border-brand-primary hover:bg-brand-primary hover:text-white hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-secondary active:scale-[0.98]"
					>
						<span>{viewAllLabel}</span>
						<ArrowRight
							size={16}
							class="transition-transform duration-200 group-hover:translate-x-1"
							aria-hidden="true"
						/>
					</a>
				</div>
			{/if}
		</div>

		<!-- Grille des 3 articles d'actualités -->
		<div class="mt-10 grid grid-cols-1 gap-6 sm:mt-12 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
			{#each articles as article, index (article.id)}
				<article
					class="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-1.5 hover:border-gray-300 hover:shadow-[0_16px_36px_-6px_rgba(0,0,0,0.12)] {isVisible
						? 'translate-y-0 opacity-100'
						: 'translate-y-8 opacity-0'}"
					style="transition-delay: {index * 120}ms;"
				>
					<!-- Image de couverture avec zoom au survol -->
					<a
						href={article.href || '/actualites'}
						class="relative block aspect-[16/10] w-full overflow-hidden bg-gray-100"
						tabindex="-1"
						aria-hidden="true"
					>
						<img
							src={article.image}
							alt={article.imageAlt}
							class="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
							loading="lazy"
						/>
						<div
							class="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
						></div>
					</a>

					<!-- Contenu textuel de la carte -->
					<div class="flex flex-1 flex-col p-5 sm:p-6">
						<!-- Badge Catégorie -->
						<div class="flex items-center gap-2">
							<span
								class="inline-flex items-center rounded-md bg-red-50 px-2.5 py-0.5 font-body text-xs font-bold text-brand-primary"
							>
								{article.category}
							</span>
							{#if article.readTime}
								<span class="font-body text-xs text-text-disabled">· {article.readTime}</span>
							{/if}
						</div>

						<!-- Titre de l'article -->
						<h3
							class="mt-3 font-display text-lg leading-snug font-bold text-text-primary sm:text-xl"
						>
							<a
								href={article.href || '/actualites'}
								class="transition-colors duration-200 group-hover:text-brand-primary focus-visible:rounded-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-secondary"
							>
								{article.title}
							</a>
						</h3>

						<!-- Date de publication -->
						<div class="mt-auto pt-4">
							<div
								class="flex items-center gap-1.5 font-body text-xs font-medium text-text-secondary"
							>
								<Calendar size={13} class="text-text-disabled" aria-hidden="true" />
								<time datetime={article.date}>{article.date}</time>
							</div>
						</div>
					</div>
				</article>
			{/each}
		</div>
	</Container>
</section>
