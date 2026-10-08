import { db, isDbConfigured } from '$lib/server/db/index.js';
import { events } from '$lib/server/db/schema.js';
import { and, eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types.js';

// Adresse de la fiche de la croisade de clôture, créée dans l'admin des événements
const FINAL_CRUSADE_EVENT_SLUG = 'bafoussam-pour-jesus';

export const load: PageServerLoad = async () => {
	let finalCrusadeHref = '/nos-evenements';
	if (isDbConfigured && db) {
		try {
			const [event] = await db
				.select({ slug: events.slug })
				.from(events)
				.where(and(eq(events.slug, FINAL_CRUSADE_EVENT_SLUG), eq(events.isPublished, true)))
				.limit(1);
			if (event) finalCrusadeHref = `/nos-evenements/${event.slug}`;
		} catch (err) {
			console.error('Erreur recherche événement de clôture:', err);
		}
	}
	return { finalCrusadeHref };
};
