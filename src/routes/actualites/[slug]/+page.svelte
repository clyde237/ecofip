<script lang="ts">
	import PageBanner from '$lib/design-system/patterns/PageBanner.svelte';
	import { onMount } from 'svelte';
	import { ArrowLeft, Link as LinkIcon, CheckCircle2, MessageCircle, Share2 } from '@lucide/svelte';
	import Container from '$lib/design-system/components/Container.svelte';
	import ArticleContent from '$lib/design-system/components/ArticleContent.svelte';
	import ArticleCard from '$lib/design-system/components/ArticleCard.svelte';
	import NewsCategoriesCard from '$lib/design-system/components/NewsCategoriesCard.svelte';
	import SupportMissionCard from '$lib/design-system/components/SupportMissionCard.svelte';
	import { toast } from '$lib/design-system/toast.svelte.js';
	import type { PageData } from './$types.js';

	let { data }: { data: PageData } = $props();

	let article = $derived(data.article);
	let hasCopied = $state(false);
	let shareText = $derived(encodeURIComponent(`${article.title} — ${data.canonicalUrl}`));
	let encodedUrl = $derived(encodeURIComponent(data.canonicalUrl));

	async function copyLink() {
		try {
			await navigator.clipboard.writeText(data.canonicalUrl);
			hasCopied = true;
			toast.success('Lien de l’article copié.');
			setTimeout(() => (hasCopied = false), 2500);
		} catch {
			toast.error('Copie impossible : sélectionnez l’adresse dans la barre du navigateur.');
		}
	}

	async function nativeShare() {
		try {
			await navigator.share({ title: article.title, url: data.canonicalUrl });
		} catch {
			// Partage annulé par le visiteur : rien à faire
		}
	}

	// Partage natif (menu du téléphone) : détecté après l'affichage, le serveur ne le connaît pas
	let canNativeShare = $state(false);
	onMount(() => {
		canNativeShare = 'share' in navigator;
	});
</script>

<svelte:head>
	<title>{article.title} — Actualités | ECOFIP</title>
	<meta name="description" content={article.excerpt} />
	<link rel="canonical" href={data.canonicalUrl} />
	<meta property="og:type" content="article" />
	<meta property="og:title" content={article.title} />
	<meta property="og:description" content={article.excerpt} />
	<meta property="og:url" content={data.canonicalUrl} />
	{#if article.image.startsWith('http')}
		<meta property="og:image" content={article.image} />
	{/if}
</svelte:head>

<!-- En-tête de l'article -->
<PageBanner
	title={article.title}
	subtitle={[article.category, article.authorName, article.date, article.readTime]
		.filter(Boolean)
		.join(' · ')}
	breadcrumbParents={[{ label: 'Actualités', href: '/actualites' }]}
	backgroundImage={article.image}
/>

<!-- Corps de l'article + colonne latérale -->
<section class="bg-[#f8fafc] py-12 sm:py-16">
	<Container>
		<div class="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-12">
			<article class="min-w-0">
				<img
					src={article.image}
					alt={article.imageAlt}
					class="aspect-[16/9] w-full rounded-3xl border border-gray-200 object-cover shadow-sm"
				/>
				<div class="mt-8 rounded-3xl border border-gray-200/80 bg-white p-6 shadow-xs sm:p-10">
					<p class="font-display text-lg leading-relaxed text-text-primary sm:text-xl">
						{article.excerpt}
					</p>
					<hr class="my-7 border-gray-100" />
					<ArticleContent content={data.content} />
				</div>

				<a
					href="/actualites"
					class="mt-8 inline-flex items-center gap-1.5 text-sm font-bold text-brand-primary hover:underline"
				>
					<ArrowLeft size={16} /> Toutes les actualités
				</a>
			</article>

			<!-- Colonne latérale (collée au défilement sur grand écran) -->
			<aside class="space-y-6 lg:sticky lg:top-28 lg:self-start" aria-label="Autour de l’article">
				<!-- Partage -->
				<div class="rounded-3xl border border-gray-200/80 bg-white p-5 shadow-xs">
					<h2 class="flex items-center gap-2 font-display text-base font-bold text-text-primary">
						<Share2 size={17} class="text-brand-primary" /> Partager l’article
					</h2>
					<div class="mt-4 grid grid-cols-2 gap-2 text-xs font-bold">
						<a
							href="https://wa.me/?text={shareText}"
							target="_blank"
							rel="noopener noreferrer"
							class="flex items-center justify-center gap-1.5 rounded-xl bg-[#25D366] px-3 py-2.5 text-white hover:opacity-90"
						>
							<MessageCircle size={15} /> WhatsApp
						</a>
						<a
							href="https://www.facebook.com/sharer/sharer.php?u={encodedUrl}"
							target="_blank"
							rel="noopener noreferrer"
							class="flex items-center justify-center gap-1.5 rounded-xl bg-[#1877F2] px-3 py-2.5 text-white hover:opacity-90"
						>
							Facebook
						</a>
						<button
							type="button"
							onclick={copyLink}
							class="col-span-2 flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2.5 text-text-primary hover:border-brand-primary hover:text-brand-primary"
						>
							{#if hasCopied}
								<CheckCircle2 size={15} class="text-emerald-600" /> Lien copié
							{:else}
								<LinkIcon size={15} /> Copier le lien
							{/if}
						</button>
						{#if canNativeShare}
							<button
								type="button"
								onclick={nativeShare}
								class="col-span-2 flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2.5 text-text-primary hover:border-brand-primary hover:text-brand-primary"
							>
								<Share2 size={15} /> Plus d’options
							</button>
						{/if}
					</div>
				</div>

				<!-- Articles récents -->
				{#if data.recent.length > 0}
					<div class="rounded-3xl border border-gray-200/80 bg-white p-5 shadow-xs">
						<h2 class="font-display text-base font-bold text-text-primary">Articles récents</h2>
						<ul class="mt-4 space-y-4">
							{#each data.recent as recent (recent.id)}
								<li>
									<a href={recent.href} class="group flex gap-3">
										<img
											src={recent.image}
											alt=""
											class="h-16 w-20 shrink-0 rounded-xl object-cover"
											loading="lazy"
										/>
										<span class="min-w-0">
											<span
												class="line-clamp-2 text-sm leading-snug font-bold text-text-primary group-hover:text-brand-primary"
											>
												{recent.title}
											</span>
											<span class="mt-1 block text-[11px] text-text-secondary">{recent.date}</span>
										</span>
									</a>
								</li>
							{/each}
						</ul>
					</div>
				{/if}

				<!-- Prédications récentes -->
				{#if data.sermons.length > 0}
					<div class="rounded-3xl border border-gray-200/80 bg-white p-5 shadow-xs">
						<div class="flex items-baseline justify-between">
							<h2 class="font-display text-base font-bold text-text-primary">
								Prédications récentes
							</h2>
							<a href="/predications" class="text-xs font-bold text-brand-primary hover:underline"
								>Tout voir</a
							>
						</div>
						<div class="mt-4 grid grid-cols-3 gap-2.5">
							{#each data.sermons as sermon (sermon.id)}
								<a
									href={sermon.href}
									class="group relative block aspect-[9/16] overflow-hidden rounded-xl bg-gray-900"
									title={sermon.title}
								>
									{#if sermon.posterUrl}
										<img
											src={sermon.posterUrl}
											alt={sermon.title}
											class="h-full w-full object-cover transition-transform group-hover:scale-105"
											loading="lazy"
										/>
									{/if}
								</a>
							{/each}
						</div>
					</div>
				{/if}

				<!-- Catégories -->
				<NewsCategoriesCard categories={data.categories} activeSlug={article.categorySlug} />

				<!-- Appel au soutien -->
				<SupportMissionCard />
			</aside>
		</div>

		<!-- À lire aussi -->
		{#if data.related.length > 0}
			<div class="mt-16 border-t border-gray-200 pt-12">
				<h2 class="font-display text-2xl font-bold text-text-primary">À lire aussi</h2>
				<div class="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{#each data.related as related (related.id)}
						<ArticleCard article={related} />
					{/each}
				</div>
			</div>
		{/if}
	</Container>
</section>
