import { error } from '@sveltejs/kit';
import { isDbConfigured, db } from '$lib/server/db/index.js';
import { events } from '$lib/server/db/schema.js';
import { and, eq } from 'drizzle-orm';
import { getEventTargetDate } from '$lib/utils/eventDate.js';
import {
	countCategories,
	loadOtherPublishedArticles,
	loadPublishedArticleBySlug,
	toPublicArticle
} from '$lib/server/articles.js';
import { loadPublishedSermons, toPublicSermon } from '$lib/server/sermons.js';
import { toCameroonIso } from '$lib/config/site.js';
import type { PageServerLoad } from './$types.js';

const RECENT_COUNT = 5;
const RELATED_COUNT = 3;

/** Événement publié dont parle l'article (encadré « Événement lié ») */
async function loadLinkedEvent(eventId: number) {
	if (!db) return null;
	const [event] = await db
		.select()
		.from(events)
		.where(and(eq(events.id, eventId), eq(events.isPublished, true)))
		.limit(1);
	if (!event) return null;
	return {
		title: event.title,
		href: `/nos-evenements/${event.slug}`,
		dateLabel: [event.dateDay, event.dateMonthYear].filter(Boolean).join(' '),
		time: event.time ?? '',
		location: event.location,
		startDate: toCameroonIso(getEventTargetDate(event))
	};
}

export const load: PageServerLoad = async ({ params, url }) => {
	if (!isDbConfigured || !db) throw error(503, 'Actualités momentanément indisponibles');

	const row = await loadPublishedArticleBySlug(params.slug);
	if (!row) throw error(404, 'Article introuvable');

	const [others, sermonRows, linkedEvent] = await Promise.all([
		loadOtherPublishedArticles(row.id),
		loadPublishedSermons(3).catch(() => []),
		row.eventId ? loadLinkedEvent(row.eventId).catch(() => null) : null
	]);
	const article = toPublicArticle(row);
	const sameCategory = others.filter(
		(other) => toPublicArticle(other).categorySlug === article.categorySlug
	);

	return {
		article,
		content: row.content,
		publishedAt: toCameroonIso(row.publishedAt ?? row.createdAt),
		modifiedAt: toCameroonIso(row.updatedAt),
		canonicalUrl: `${url.origin}/actualites/${row.slug}`,
		// Colonne latérale : articles récents et catégories (article courant compris dans les comptes)
		recent: others.slice(0, RECENT_COUNT).map(toPublicArticle),
		categories: countCategories([row, ...others]),
		sermons: sermonRows.map(toPublicSermon),
		linkedEvent,
		// En bas d'article : même catégorie d'abord, complété par les plus récents
		related: [...sameCategory, ...others.filter((other) => !sameCategory.includes(other))]
			.slice(0, RELATED_COUNT)
			.map(toPublicArticle)
	};
};
