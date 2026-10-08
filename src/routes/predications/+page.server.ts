import { db, isDbConfigured } from '$lib/server/db/index.js';
import { loadPublishedSermons, toPublicSermon } from '$lib/server/sermons.js';
import type { PageServerLoad } from './$types.js';
import type { PublicSermon } from '$lib/design-system/types.js';

export const load: PageServerLoad = async () => {
	if (isDbConfigured && db) {
		try {
			return { available: true, sermons: (await loadPublishedSermons()).map(toPublicSermon) };
		} catch (err) {
			console.error('Erreur chargement prédications:', err);
		}
	}
	return { available: false, sermons: [] as PublicSermon[] };
};
