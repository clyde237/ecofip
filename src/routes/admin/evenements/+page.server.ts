import { db, isDbConfigured } from '$lib/server/db/index.js';
import { events } from '$lib/server/db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types.js';

const fallbackEvents = [
	{
		id: 1,
		title: 'Grande Croisade d’Évangélisation',
		slug: 'croisade-evangelisation',
		category: 'Croisade',
		dateDay: '15',
		dateMonthYear: 'OCT 2026',
		time: '18h00 – 22h00',
		location: 'Yaoundé, Cameroun',
		description: 'Soirée de louange, délivrance et proclamation de la Parole.',
		imageUrl: '/event-croisade.jpg',
		isPublished: true,
		createdAt: new Date('2026-09-20')
	},
	{
		id: 2,
		title: 'Séminaire de Formation de Disciples',
		slug: 'seminaire-formation',
		category: 'Séminaire',
		dateDay: '22',
		dateMonthYear: 'OCT 2026',
		time: '09h00 – 16h00',
		location: 'Centre de formation ECOFIP',
		description: 'Approfondissement des fondements de la foi chrétienne.',
		imageUrl: '/event-seminaire.jpg',
		isPublished: true,
		createdAt: new Date('2026-09-21')
	},
	{
		id: 3,
		title: 'Camp Régional des Jeunes',
		slug: 'camp-jeunes',
		category: 'Camp Jeunes',
		dateDay: '05',
		dateMonthYear: 'NOV 2026',
		time: '3 jours',
		location: 'Mont Fébé, Yaoundé',
		description: 'Rassemblement de réveil spirituel pour la jeunesse camerounaise.',
		imageUrl: '/event-camp.jpg',
		isPublished: false,
		createdAt: new Date('2026-09-22')
	}
];

export const load: PageServerLoad = async () => {
	if (isDbConfigured && db) {
		try {
			const items = await db.select().from(events).orderBy(desc(events.createdAt));
			if (items.length > 0) {
				return { events: items, usingNeonDb: true };
			}
		} catch {
			// En attente de migration
		}
	}

	return {
		events: fallbackEvents,
		usingNeonDb: false
	};
};

export const actions: Actions = {
	create: async ({ request }) => {
		const formData = await request.formData();
		const title = String(formData.get('title') ?? '').trim();
		const category = String(formData.get('category') ?? 'Croisade').trim();
		const dateDay = String(formData.get('dateDay') ?? '').trim();
		const dateMonthYear = String(formData.get('dateMonthYear') ?? '').trim();
		const time = String(formData.get('time') ?? '').trim();
		const location = String(formData.get('location') ?? '').trim();
		const description = String(formData.get('description') ?? '').trim();
		const imageDataUrl = String(formData.get('imageDataUrl') ?? '').trim();
		const isPublished = formData.get('isPublished') === 'on';

		if (!title || !location) {
			return fail(400, { error: 'Le titre et le lieu sont obligatoires.' });
		}

		const slug = title
			.toLowerCase()
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/(^-|-$)+/g, '');

		// Image uploadée depuis l'appareil ou image par défaut selon catégorie
		const fallbackImage =
			category === 'Camp Jeunes'
				? '/event-camp.jpg'
				: category === 'Séminaire'
					? '/event-seminaire.jpg'
					: '/event-croisade.jpg';
		const imageUrl = imageDataUrl || fallbackImage;

		if (isDbConfigured && db) {
			try {
				await db.insert(events).values({
					title,
					slug: slug || `event-${Date.now()}`,
					category,
					dateDay: dateDay || '01',
					dateMonthYear: dateMonthYear || 'OCT 2026',
					time: time || '18h00',
					location,
					description,
					imageUrl,
					isPublished
				});
			} catch {
				return fail(500, { error: 'Erreur lors de la création de l’événement sur Neon.' });
			}
		}

		return { success: true, message: 'Événement enregistré avec succès !' };
	},

	togglePublish: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		const currentStatus = formData.get('currentStatus') === 'true';

		if (!id) return fail(400, { error: 'Identifiant invalide' });

		if (isDbConfigured && db) {
			try {
				await db
					.update(events)
					.set({ isPublished: !currentStatus, updatedAt: new Date() })
					.where(eq(events.id, id));
			} catch {
				return fail(500, { error: 'Erreur lors de la mise à jour' });
			}
		}

		return { success: true, message: 'Statut de publication mis à jour.' };
	},

	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));

		if (!id) return fail(400, { error: 'Identifiant invalide' });

		if (isDbConfigured && db) {
			try {
				await db.delete(events).where(eq(events.id, id));
			} catch {
				return fail(500, { error: 'Erreur lors de la suppression' });
			}
		}

		return { success: true, message: 'Événement supprimé avec succès.' };
	}
};
