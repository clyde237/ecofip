<script lang="ts">
	import PageBanner from '$lib/design-system/patterns/PageBanner.svelte';
	import Container from '$lib/design-system/components/Container.svelte';
	import ArticleCard from '$lib/design-system/components/ArticleCard.svelte';
	import NewsCategoriesCard from '$lib/design-system/components/NewsCategoriesCard.svelte';
	import SupportMissionCard from '$lib/design-system/components/SupportMissionCard.svelte';
	import { Search, X, ChevronLeft, ChevronRight, Newspaper } from '@lucide/svelte';
	import type { PageData } from './$types.js';

	let { data }: { data: PageData } = $props();

	/** Adresse de la page en conservant le filtre et la recherche en cours */
	function pageHref(page: number): string {
		const params = [
			data.categorySlug ? `categorie=${encodeURIComponent(data.categorySlug)}` : '',
			data.query ? `q=${encodeURIComponent(data.query)}` : '',
			page > 1 ? `page=${page}` : ''
		].filter(Boolean);
		return `/actualites${params.length ? `?${params.join('&')}` : ''}#articles`;
	}
</script>

<svelte:head>
	<title>Actualités — Cameroun pour Jésus | ECOFIP</title>
	<meta
		name="description"
		content="Rapports de mission, témoignages, enseignements et nouvelles de l’action d’ECOFIP au Cameroun."
	/>
	<meta property="og:title" content="Actualités — ECOFIP" />
	<meta property="og:type" content="website" />
</svelte:head>

<PageBanner
	title="Actualités"
	subtitle="Rapports de mission, témoignages, enseignements et nouvelles de l’œuvre au Cameroun."
	backgroundImage="/article-evangelisation.jpg"
/>

<section id="articles" class="scroll-mt-24 bg-[#f8fafc] py-12 sm:py-16" aria-label="Articles">
	<Container>
		{#if !data.available}
			<p
				class="mx-auto max-w-xl rounded-3xl border border-gray-200 bg-white p-10 text-center font-body text-sm text-text-secondary"
			>
				Les actualités sont momentanément indisponibles. Merci de réessayer dans quelques instants.
			</p>
		{:else}
			<div class="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
				<!-- Grille des articles -->
				<div class="min-w-0">
					<!-- Catégories en défilement horizontal sur mobile (la colonne latérale passe en bas) -->
					{#if data.categories.length > 0}
						<nav
							aria-label="Catégories"
							class="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 lg:hidden"
						>
							<a
								href="/actualites#articles"
								class="shrink-0 rounded-xl px-3.5 py-2 font-body text-xs font-bold {!data.categorySlug
									? 'bg-brand-primary text-white'
									: 'border border-gray-200 bg-white text-text-secondary'}">Tout</a
							>
							{#each data.categories as category (category.slug)}
								<a
									href="/actualites?categorie={category.slug}#articles"
									class="shrink-0 rounded-xl px-3.5 py-2 font-body text-xs font-bold {category.slug ===
									data.categorySlug
										? 'bg-brand-primary text-white'
										: 'border border-gray-200 bg-white text-text-secondary'}">{category.label}</a
								>
							{/each}
						</nav>
					{/if}

					<div class="mb-6 flex flex-wrap items-baseline justify-between gap-2">
						<h2 class="font-display text-2xl font-bold text-text-primary">
							{data.activeCategoryLabel ?? 'Tous les articles'}
						</h2>
						<p class="font-body text-sm text-text-secondary">
							{data.totalCount} article{data.totalCount > 1 ? 's' : ''}
							{#if data.query}pour « {data.query} »{/if}
							{#if data.categorySlug || data.query}
								· <a
									href="/actualites#articles"
									class="font-semibold text-brand-primary hover:underline">Tout afficher</a
								>
							{/if}
						</p>
					</div>

					{#if data.articles.length === 0}
						<div class="rounded-3xl border border-gray-200 bg-white p-10 text-center">
							<Newspaper size={36} class="mx-auto mb-3 text-gray-300" />
							<p class="font-body text-sm text-text-secondary">
								{data.publishedCount === 0
									? 'Aucun article publié pour le moment. Revenez bientôt !'
									: 'Aucun article ne correspond à votre recherche.'}
							</p>
						</div>
					{:else}
						<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
							{#each data.articles as article (article.id)}
								{@const isFeatured = article.id === data.featuredId}
								<ArticleCard
									{article}
									wide={isFeatured}
									featuredBadge={isFeatured}
									class={isFeatured ? 'sm:col-span-2' : ''}
								/>
							{/each}
						</div>

						{#if data.pageCount > 1}
							<nav
								aria-label="Pagination"
								class="mt-10 flex items-center justify-center gap-2 font-body text-sm font-semibold"
							>
								{#if data.currentPage > 1}
									<a
										href={pageHref(data.currentPage - 1)}
										class="flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-2 hover:border-brand-primary hover:text-brand-primary"
									>
										<ChevronLeft size={16} /> Précédent
									</a>
								{/if}
								{#each Array.from({ length: data.pageCount }, (_, index) => index + 1) as pageNumber (pageNumber)}
									<a
										href={pageHref(pageNumber)}
										aria-current={pageNumber === data.currentPage ? 'page' : undefined}
										class="flex h-10 min-w-10 items-center justify-center rounded-xl px-3 {pageNumber ===
										data.currentPage
											? 'bg-brand-primary text-white'
											: 'border border-gray-200 bg-white hover:border-brand-primary hover:text-brand-primary'}"
									>
										{pageNumber}
									</a>
								{/each}
								{#if data.currentPage < data.pageCount}
									<a
										href={pageHref(data.currentPage + 1)}
										class="flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-2 hover:border-brand-primary hover:text-brand-primary"
									>
										Suivant <ChevronRight size={16} />
									</a>
								{/if}
							</nav>
						{/if}
					{/if}
				</div>

				<!-- Colonne latérale -->
				<aside class="space-y-6 lg:sticky lg:top-28 lg:self-start" aria-label="Filtres et liens">
					<form
						method="GET"
						action="/actualites#articles"
						role="search"
						class="rounded-3xl border border-gray-200/80 bg-white p-5 shadow-xs"
					>
						<label for="news-search" class="font-display text-base font-bold text-text-primary">
							Rechercher
						</label>
						{#if data.categorySlug}
							<input type="hidden" name="categorie" value={data.categorySlug} />
						{/if}
						<div class="relative mt-3">
							<Search
								size={16}
								class="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-gray-400"
							/>
							<input
								id="news-search"
								type="search"
								name="q"
								value={data.query}
								placeholder="Titre, auteur, sujet…"
								class="w-full rounded-xl border border-gray-200 bg-[#f8fafc] py-2.5 pr-10 pl-10 font-body text-sm text-text-primary focus:border-brand-primary focus:bg-white focus:outline-hidden"
							/>
							{#if data.query}
								<a
									href={data.categorySlug
										? `/actualites?categorie=${data.categorySlug}#articles`
										: '/actualites#articles'}
									class="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600"
									aria-label="Effacer la recherche"
								>
									<X size={16} />
								</a>
							{/if}
						</div>
					</form>

					{#if data.categories.length > 0}
						<div class="hidden lg:block">
							<NewsCategoriesCard
								categories={data.categories}
								activeSlug={data.categorySlug}
								showAll
								totalCount={data.publishedCount}
							/>
						</div>
					{/if}

					<SupportMissionCard />
				</aside>
			</div>
		{/if}
	</Container>
</section>
