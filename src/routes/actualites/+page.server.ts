import { db, isDbConfigured } from '$lib/server/db/index.js';
import { countCategories, loadPublishedArticles, toPublicArticle } from '$lib/server/articles.js';
import type { PageServerLoad } from './$types.js';
import type { DetailedArticleItem } from '$lib/design-system/types.js';

const PAGE_SIZE = 9;

/**
 * Grille des articles publiés. Filtre, recherche et page sont dans l'adresse
 * (?categorie=…&q=…&page=…) : liens partageables, fonctionne sans JavaScript.
 */
export const load: PageServerLoad = async ({ url }) => {
	const categorySlug = url.searchParams.get('categorie') || null;
	const query = (url.searchParams.get('q') ?? '').trim();
	const requestedPage = Math.max(1, Math.trunc(Number(url.searchParams.get('page')) || 1));

	if (!isDbConfigured || !db) {
		return { available: false as const, categorySlug, query };
	}

	let rows;
	try {
		rows = await loadPublishedArticles();
	} catch (err) {
		console.error('Erreur chargement actualités:', err);
		return { available: false as const, categorySlug, query };
	}

	const all = rows.map(toPublicArticle);
	const categories = countCategories(rows);
	const needle = query.toLowerCase();

	let filtered = all.filter(
		(article) =>
			(!categorySlug || article.categorySlug === categorySlug) &&
			(!needle ||
				[article.title, article.excerpt, article.category, article.authorName].some((value) =>
					value.toLowerCase().includes(needle)
				))
	);

	// Sans filtre ni recherche, l'article mis à la une passe en tête de la grille
	const featured =
		!categorySlug && !needle ? (filtered.find((article) => article.isFeatured) ?? null) : null;
	if (featured) filtered = [featured, ...filtered.filter((article) => article !== featured)];

	const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
	const currentPage = Math.min(requestedPage, pageCount);
	const articles: DetailedArticleItem[] = filtered.slice(
		(currentPage - 1) * PAGE_SIZE,
		currentPage * PAGE_SIZE
	);

	return {
		available: true as const,
		articles,
		featuredId: featured && currentPage === 1 ? featured.id : null,
		totalCount: filtered.length,
		publishedCount: all.length,
		categories,
		categorySlug,
		activeCategoryLabel:
			categories.find((category) => category.slug === categorySlug)?.label ?? null,
		query,
		currentPage,
		pageCount
	};
};
