<script lang="ts">
	/**
	 * Balises de référencement d'une page : titre, description, URL canonique, partages
	 * (Open Graph, X/Twitter) et données structurées schema.org pour Google.
	 */
	import { page } from '$app/state';
	import { SITE_NAME, absoluteUrl, jsonLdScriptTag, shareableImageUrl } from '$lib/config/site.js';

	interface Props {
		title: string;
		description: string;
		image?: string | null;
		imageAlt?: string;
		type?: 'website' | 'article' | 'video.other';
		/** Chemin canonique ; par défaut le chemin de la page, sans paramètres de filtre */
		canonicalPath?: string;
		noindex?: boolean;
		publishedTime?: string;
		/** Fil d'Ariane affiché dans les résultats Google (« Accueil » est ajouté en tête) */
		breadcrumbs?: { name: string; path: string }[];
		/** Données structurées schema.org (un objet ou une liste) */
		jsonLd?: Record<string, unknown> | Record<string, unknown>[];
	}

	let {
		title,
		description,
		image,
		imageAlt,
		type = 'website',
		canonicalPath,
		noindex = false,
		publishedTime,
		breadcrumbs,
		jsonLd
	}: Props = $props();

	let canonical = $derived(absoluteUrl(canonicalPath ?? page.url.pathname));
	let shareImage = $derived(shareableImageUrl(image));
	// Description ramenée à ~160 caractères, la longueur affichée par Google
	let metaDescription = $derived(
		description.length > 160 ? `${description.slice(0, 157).replace(/\s+\S*$/, '')}…` : description
	);
	let breadcrumbList = $derived(
		breadcrumbs?.length
			? {
					'@type': 'BreadcrumbList',
					itemListElement: [{ name: 'Accueil', path: '/' }, ...breadcrumbs].map((crumb, index) => ({
						'@type': 'ListItem',
						position: index + 1,
						name: crumb.name,
						item: absoluteUrl(crumb.path)
					}))
				}
			: null
	);
	let structuredData = $derived(
		[...(jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : []), breadcrumbList]
			.filter((entry) => entry !== null)
			.map((entry) => jsonLdScriptTag({ '@context': 'https://schema.org', ...entry }))
	);
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={metaDescription} />
	<link rel="canonical" href={canonical} />
	{#if noindex}
		<meta name="robots" content="noindex, follow" />
	{/if}

	<meta property="og:type" content={type} />
	<meta property="og:site_name" content={SITE_NAME} />
	<meta property="og:locale" content="fr_FR" />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={metaDescription} />
	<meta property="og:url" content={canonical} />
	<meta property="og:image" content={shareImage} />
	{#if imageAlt}
		<meta property="og:image:alt" content={imageAlt} />
	{/if}
	{#if publishedTime}
		<meta property="article:published_time" content={publishedTime} />
	{/if}

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={metaDescription} />
	<meta name="twitter:image" content={shareImage} />

	{#each structuredData as tag, index (index)}
		<!-- eslint-disable-next-line svelte/no-at-html-tags -- JSON sérialisé et échappé par jsonLdScriptTag -->
		{@html tag}
	{/each}
</svelte:head>
