import { error } from '@sveltejs/kit';
import { isDbConfigured, db } from '$lib/server/db/index.js';
import {
	countCategories,
	loadOtherPublishedArticles,
	loadPublishedArticleBySlug,
	toPublicArticle
} from '$lib/server/articles.js';
import { loadPublishedSermons, toPublicSermon } from '$lib/server/sermons.js';
import type { PageServerLoad } from './$types.js';

const RECENT_COUNT = 5;
const RELATED_COUNT = 3;

export const load: PageServerLoad = async ({ params, url }) => {
	if (!isDbConfigured || !db) throw error(503, 'Actualités momentanément indisponibles');

	const row = await loadPublishedArticleBySlug(params.slug);
	if (!row) throw error(404, 'Article introuvable');

	const [others, sermonRows] = await Promise.all([
		loadOtherPublishedArticles(row.id),
		loadPublishedSermons(3).catch(() => [])
	]);
	const article = toPublicArticle(row);
	const sameCategory = others.filter(
		(other) => toPublicArticle(other).categorySlug === article.categorySlug
	);

	return {
		article,
		content: row.content,
		canonicalUrl: `${url.origin}/actualites/${row.slug}`,
		// Colonne latérale : articles récents et catégories (article courant compris dans les comptes)
		recent: others.slice(0, RECENT_COUNT).map(toPublicArticle),
		categories: countCategories([row, ...others]),
		sermons: sermonRows.map(toPublicSermon),
		// En bas d'article : même catégorie d'abord, complété par les plus récents
		related: [...sameCategory, ...others.filter((other) => !sameCategory.includes(other))]
			.slice(0, RELATED_COUNT)
			.map(toPublicArticle)
	};
};
