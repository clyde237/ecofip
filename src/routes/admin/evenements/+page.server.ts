import { db, isDbConfigured } from '$lib/server/db/index.js';
import { events, type EventRecord } from '$lib/server/db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types.js';
import { formatEventSchedule } from '$lib/utils/eventDate.js';

const fallbackEvents: EventRecord[] = [
	{
		id: 1,
		title: 'Grande Croisade d’Évangélisation',
		slug: 'croisade-evangelisation',
		category: 'Croisade',
		dateDay: '15',
		dateMonthYear: 'OCT 2026',
		eventDate: new Date('2026-10-15T18:00:00'),
		time: '18h00 – 22h00',
		location: 'Yaoundé, Cameroun',
		description: 'Soirée de louange, délivrance et proclamation de la Parole.',
		speakers: 'Pasteur Valéry Tchamekwen, Équipe Pastorale ECOFIP',
		program:
			'18:00 - Accueil & Prière d’ouverture\n19:00 - Louange & Adoration vivante\n20:00 - Proclamation de l’Évangile & Guérisons\n21:30 - Bénédiction finale',
		imageUrl: '/event-croisade.jpg',
		isPublished: true,
		isFeatured: true,
		isSingleDay: true,
		isAllDay: false,
		startDate: new Date('2026-10-15T18:00:00'),
		endDate: new Date('2026-10-15T22:00:00'),
		startTime: '18:00',
		endTime: '22:00',
		createdAt: new Date('2026-09-20'),
		updatedAt: new Date('2026-09-20')
	},
	{
		id: 2,
		title: 'Séminaire de Formation de Disciples',
		slug: 'seminaire-formation',
		category: 'Séminaire',
		dateDay: '22',
		dateMonthYear: 'OCT 2026',
		eventDate: new Date('2026-10-22T09:00:00'),
		time: '09h00 – 16h00',
		location: 'Centre de formation ECOFIP',
		description: 'Approfondissement des fondements de la foi chrétienne.',
		speakers: 'Pasteur Valéry Tchamekwen, Enseignants Bibliques Invités',
		program:
			'09:00 - Dévotion matinale\n10:00 - Module 1 : Fondements bibliques\n12:30 - Pause déjeuner\n14:00 - Module 2 : Maturité et discipulat\n16:00 - Synthèse & Prière',
		imageUrl: '/event-seminaire.jpg',
		isPublished: true,
		isFeatured: false,
		isSingleDay: true,
		isAllDay: false,
		startDate: new Date('2026-10-22T09:00:00'),
		endDate: new Date('2026-10-22T16:00:00'),
		startTime: '09:00',
		endTime: '16:00',
		createdAt: new Date('2026-09-21'),
		updatedAt: new Date('2026-09-21')
	},
	{
		id: 3,
		title: 'Camp Régional des Jeunes',
		slug: 'camp-jeunes',
		category: 'Camp Jeunes',
		dateDay: '05 – 08',
		dateMonthYear: 'NOV 2026',
		eventDate: new Date('2026-11-05T08:00:00'),
		time: '4 jours (Pension complète)',
		location: 'Mont Fébé, Yaoundé',
		description: 'Rassemblement de réveil spirituel pour la jeunesse camerounaise.',
		speakers: 'Coordination Jeunesse ECOFIP, Mentors chrétiens',
		program:
			'Jour 1 : Arrivée & Culte d’accueil\nJour 2 : Ateliers d’impact & Études bibliques\nJour 3 : Soirée louange & Feu de camp\nJour 4 : Consécration & Clôture',
		imageUrl: '/event-camp.jpg',
		isPublished: false,
		isFeatured: false,
		isSingleDay: false,
		isAllDay: false,
		startDate: new Date('2026-11-05T08:00:00'),
		endDate: new Date('2026-11-08T18:00:00'),
		startTime: '08:00',
		endTime: '18:00',
		createdAt: new Date('2026-09-22'),
		updatedAt: new Date('2026-09-22')
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

function getFallbackImage(category: string): string {
	if (category === 'Camp Jeunes') return '/event-camp.jpg';
	if (category === 'Séminaire') return '/event-seminaire.jpg';
	return '/event-croisade.jpg';
}

type ParsedEventForm =
	| { error: string }
	| {
			values: {
				title: string;
				category: string;
				location: string;
				description: string;
				speakers: string | null;
				program: string | null;
				imageUrl: string;
				isPublished: boolean;
				isFeatured: boolean;
				isSingleDay: boolean;
				isAllDay: boolean;
				startTime: string | null;
				endTime: string | null;
				dateDay: string;
				dateMonthYear: string;
				eventDate: Date;
				startDate: Date;
				endDate: Date | null;
				time: string;
			};
	  };

/**
 * Lecture et validation communes aux actions de création et de modification.
 */
function parseEventForm(formData: FormData): ParsedEventForm {
	const title = String(formData.get('title') ?? '').trim();
	const category = String(formData.get('category') ?? 'Croisade').trim();
	const location = String(formData.get('location') ?? '').trim();
	const description = String(formData.get('description') ?? '').trim();
	const speakers = String(formData.get('speakers') ?? '').trim();
	const program = String(formData.get('program') ?? '').trim();
	const imageDataUrl = String(formData.get('imageDataUrl') ?? '').trim();
	const isPublished = formData.get('isPublished') === 'on';
	const isFeatured = formData.get('isFeatured') === 'on' || formData.get('isFeatured') === 'true';

	const isSingleDay =
		formData.get('isSingleDay') === 'on' || formData.get('isSingleDay') === 'true';
	const isAllDay = formData.get('isAllDay') === 'on' || formData.get('isAllDay') === 'true';
	const startDate = String(formData.get('startDate') ?? '').trim();
	const endDate = String(formData.get('endDate') ?? '').trim();
	const startTime = String(formData.get('startTime') ?? '').trim();
	const endTime = String(formData.get('endTime') ?? '').trim();

	if (!title || !location) {
		return { error: 'Le titre et le lieu sont obligatoires.' };
	}
	if (!startDate) {
		return { error: 'La date de début de l’événement est obligatoire.' };
	}
	if (!isSingleDay && !endDate) {
		return { error: 'La date de fin est obligatoire pour un événement sur plusieurs jours.' };
	}
	if (!isSingleDay && endDate && endDate < startDate) {
		return { error: 'La date de fin ne peut pas être antérieure à la date de début.' };
	}
	if (isSingleDay && startTime && endTime && endTime < startTime) {
		return { error: 'L’heure de fin ne peut pas être antérieure à l’heure de début.' };
	}

	const schedule = formatEventSchedule({
		isSingleDay,
		startDateStr: startDate,
		endDateStr: isSingleDay ? undefined : endDate,
		startTimeStr: startTime,
		endTimeStr: endTime,
		isAllDay
	});

	return {
		values: {
			title,
			category,
			location,
			description,
			speakers: speakers || null,
			program: program || null,
			imageUrl: imageDataUrl || getFallbackImage(category),
			isPublished,
			isFeatured,
			isSingleDay,
			isAllDay,
			startTime: startTime || null,
			endTime: endTime || null,
			dateDay: schedule.dateDay,
			dateMonthYear: schedule.dateMonthYear,
			eventDate: schedule.eventDate,
			startDate: schedule.startDate,
			endDate: schedule.endDate ?? null,
			time: schedule.time
		}
	};
}

function slugify(title: string): string {
	return title
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)+/g, '');
}

export const actions: Actions = {
	create: async ({ request }) => {
		const parsed = parseEventForm(await request.formData());
		if ('error' in parsed) {
			return fail(400, { error: parsed.error });
		}
		const { values } = parsed;

		if (isDbConfigured && db) {
			try {
				if (values.isFeatured) {
					// Si cet événement est mis en avant, retirer la mise en avant des autres
					await db.update(events).set({ isFeatured: false });
				}

				await db.insert(events).values({
					...values,
					slug: slugify(values.title) || `event-${Date.now()}`
				});
			} catch (err: unknown) {
				console.error('Erreur création événement:', err);
				return fail(500, { error: 'Erreur lors de la création de l’événement sur Neon.' });
			}
		} else {
			if (values.isFeatured) {
				fallbackEvents.forEach((ev) => (ev.isFeatured = false));
			}
			const newId = (fallbackEvents.length ? Math.max(...fallbackEvents.map((e) => e.id)) : 0) + 1;
			fallbackEvents.unshift({
				id: newId,
				slug: slugify(values.title) || `event-${Date.now()}`,
				...values,
				createdAt: new Date(),
				updatedAt: new Date()
			});
		}

		return { success: true, message: 'Événement enregistré avec succès !' };
	},

	update: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		if (!Number.isInteger(id) || id <= 0) {
			return fail(400, { error: 'Identifiant d’événement invalide.' });
		}

		const parsed = parseEventForm(formData);
		if ('error' in parsed) {
			return fail(400, { error: parsed.error });
		}
		const { values } = parsed;

		if (isDbConfigured && db) {
			try {
				const [existing] = await db
					.select({ id: events.id })
					.from(events)
					.where(eq(events.id, id))
					.limit(1);
				if (!existing) {
					return fail(404, { error: 'Événement introuvable.' });
				}

				if (values.isFeatured) {
					await db.update(events).set({ isFeatured: false });
				}

				// Le slug est conservé pour ne pas casser les liens déjà partagés
				await db
					.update(events)
					.set({ ...values, updatedAt: new Date() })
					.where(eq(events.id, id));
			} catch (err: unknown) {
				console.error(`Erreur modification événement #${id}:`, err);
				return fail(500, { error: 'Erreur lors de la modification de l’événement.' });
			}
		} else {
			const idx = fallbackEvents.findIndex((e) => e.id === id);
			if (idx === -1) {
				return fail(404, { error: 'Événement introuvable.' });
			}
			if (values.isFeatured) {
				fallbackEvents.forEach((other, i) => {
					if (i !== idx) other.isFeatured = false;
				});
			}
			fallbackEvents[idx] = {
				...fallbackEvents[idx],
				...values,
				updatedAt: new Date()
			};
		}

		return { success: true, message: 'Événement modifié avec succès !' };
	},

	toggleFeatured: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		if (!Number.isInteger(id) || id <= 0) {
			return fail(400, { error: 'Identifiant invalide.' });
		}

		const rawTarget = formData.get('target');

		if (isDbConfigured && db) {
			try {
				const [existing] = await db
					.select({ id: events.id, title: events.title, isFeatured: events.isFeatured })
					.from(events)
					.where(eq(events.id, id))
					.limit(1);

				if (!existing) {
					return fail(404, { error: 'Événement introuvable.' });
				}

				// Déterminer le nouvel état : priorité à la valeur cible explicite si fournie, sinon inversion
				const nextFeatured =
					rawTarget === 'true' ? true : rawTarget === 'false' ? false : !existing.isFeatured;

				if (nextFeatured) {
					// Un seul événement à la une à la fois pour un affichage optimal
					await db.update(events).set({ isFeatured: false });
				}

				await db
					.update(events)
					.set({ isFeatured: nextFeatured, updatedAt: new Date() })
					.where(eq(events.id, id));

				const message = nextFeatured
					? `« ${existing.title} » est maintenant mis en avant sous la Hero Section.`
					: `« ${existing.title} » a été retiré de la mise en avant.`;

				return { success: true, message, isFeatured: nextFeatured };
			} catch (err: unknown) {
				console.error('Erreur mise en avant:', err);
				return fail(500, { error: 'Erreur lors de la mise à jour de la mise en avant.' });
			}
		} else {
			const ev = fallbackEvents.find((e) => e.id === id);
			if (!ev) {
				return fail(404, { error: 'Événement introuvable.' });
			}

			const nextFeatured =
				rawTarget === 'true' ? true : rawTarget === 'false' ? false : !ev.isFeatured;

			ev.isFeatured = nextFeatured;
			if (nextFeatured) {
				fallbackEvents.forEach((other) => {
					if (other.id !== id) other.isFeatured = false;
				});
			}

			const message = nextFeatured
				? `« ${ev.title} » est maintenant mis en avant sous la Hero Section.`
				: `« ${ev.title} » a été retiré de la mise en avant.`;

			return { success: true, message, isFeatured: nextFeatured };
		}
	},

	togglePublish: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		if (!Number.isInteger(id) || id <= 0) {
			return fail(400, { error: 'Identifiant invalide.' });
		}

		const rawTarget = formData.get('target');

		if (isDbConfigured && db) {
			try {
				const [existing] = await db
					.select({ id: events.id, title: events.title, isPublished: events.isPublished })
					.from(events)
					.where(eq(events.id, id))
					.limit(1);

				if (!existing) {
					return fail(404, { error: 'Événement introuvable.' });
				}

				const nextPublished =
					rawTarget === 'true' ? true : rawTarget === 'false' ? false : !existing.isPublished;

				await db
					.update(events)
					.set({ isPublished: nextPublished, updatedAt: new Date() })
					.where(eq(events.id, id));

				const message = nextPublished
					? `« ${existing.title} » est maintenant publié sur le site.`
					: `« ${existing.title} » a été dépublié (brouillon).`;

				return { success: true, message, isPublished: nextPublished };
			} catch (err: unknown) {
				console.error('Erreur publication:', err);
				return fail(500, { error: 'Erreur lors de la mise à jour du statut.' });
			}
		} else {
			const ev = fallbackEvents.find((e) => e.id === id);
			if (!ev) {
				return fail(404, { error: 'Événement introuvable.' });
			}

			const nextPublished =
				rawTarget === 'true' ? true : rawTarget === 'false' ? false : !ev.isPublished;

			ev.isPublished = nextPublished;

			const message = nextPublished
				? `« ${ev.title} » est maintenant publié sur le site.`
				: `« ${ev.title} » a été dépublié (brouillon).`;

			return { success: true, message, isPublished: nextPublished };
		}
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
		} else {
			const idx = fallbackEvents.findIndex((e) => e.id === id);
			if (idx !== -1) {
				fallbackEvents.splice(idx, 1);
			}
		}

		return { success: true, message: 'Événement supprimé avec succès.' };
	}
};
