import { error } from '@sveltejs/kit';
import { db, isDbConfigured } from '$lib/server/db/index.js';
import {
	loadOtherPublishedSermons,
	loadPublishedSermonBySlug,
	toPublicSermon
} from '$lib/server/sermons.js';
import type { PageServerLoad } from './$types.js';

const OTHERS_COUNT = 12;

export const load: PageServerLoad = async ({ params, url }) => {
	if (!isDbConfigured || !db) throw error(503, 'Prédications momentanément indisponibles');

	const row = await loadPublishedSermonBySlug(params.slug);
	if (!row) throw error(404, 'Prédication introuvable');

	const sermon = toPublicSermon(row);
	const others = (await loadOtherPublishedSermons(row.id)).map(toPublicSermon);
	// Même série d'abord, complétée par les plus récentes
	const sameSeries = sermon.seriesSlug
		? others.filter((other) => other.seriesSlug === sermon.seriesSlug)
		: [];

	return {
		sermon,
		canonicalUrl: `${url.origin}/predications/${row.slug}`,
		others: [...sameSeries, ...others.filter((other) => !sameSeries.includes(other))].slice(
			0,
			OTHERS_COUNT
		)
	};
};
