import { db, isDbConfigured } from '$lib/server/db/index.js';
import { eventStatDays, events } from '$lib/server/db/schema.js';
import { and, eq } from 'drizzle-orm';
import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types.js';
import { formatMediaUrl, getR2PublicUrl, isR2Configured } from '$lib/server/r2.js';
import {
	deleteStatImage,
	eventDayDates,
	formatStatDate,
	parseStatDayForm
} from '$lib/server/eventStats.js';

const DB_UNAVAILABLE = 'La base de données Neon n’est pas configurée.';

function parseEventId(param: string): number {
	const id = Number(param);
	if (!Number.isInteger(id) || id <= 0) throw error(404, 'Événement introuvable');
	return id;
}

async function loadEvent(id: number) {
	if (!db) throw error(503, DB_UNAVAILABLE);
	const [event] = await db
		.select({
			id: events.id,
			title: events.title,
			slug: events.slug,
			startDate: events.startDate,
			endDate: events.endDate,
			eventDate: events.eventDate,
			isPublished: events.isPublished
		})
		.from(events)
		.where(eq(events.id, id))
		.limit(1);
	if (!event) throw error(404, 'Événement introuvable');
	return event;
}

export const load: PageServerLoad = async ({ params }) => {
	if (!isDbConfigured || !db) throw error(503, DB_UNAVAILABLE);
	const event = await loadEvent(parseEventId(params.id));
	const rows = await db.select().from(eventStatDays).where(eq(eventStatDays.eventId, event.id));
	const byDate = new Map(rows.map((row) => [row.dayDate, row]));

	return {
		event: { id: event.id, title: event.title, slug: event.slug, isPublished: event.isPublished },
		isR2Configured,
		days: eventDayDates(event).map((date, index) => {
			const row = byDate.get(date);
			return {
				date,
				dayNumber: index + 1,
				dateLabel: formatStatDate(date),
				record: row
					? {
							sessions: row.sessions,
							imageUrl: formatMediaUrl(row.imageUrl) || null,
							isPublished: row.isPublished,
							updatedAt: row.updatedAt
						}
					: null
			};
		})
	};
};

export const actions: Actions = {
	/** Enregistre une journée (création ou mise à jour) ; l'image est déjà sur R2 */
	saveDay: async ({ request, params }) => {
		if (!db) return fail(503, { error: DB_UNAVAILABLE });
		const event = await loadEvent(parseEventId(params.id));
		const parsed = parseStatDayForm(await request.formData(), eventDayDates(event));
		if ('error' in parsed) return fail(400, { error: parsed.error });
		const { dayDate, sessions, imageKey, removeImage, isPublished } = parsed.value;

		let replacedImageKey: string | null = null;
		try {
			const [existing] = await db
				.select({ imageKey: eventStatDays.imageKey })
				.from(eventStatDays)
				.where(and(eq(eventStatDays.eventId, event.id), eq(eventStatDays.dayDate, dayDate)))
				.limit(1);

			const imageChanged = (imageKey && imageKey !== existing?.imageKey) || removeImage;
			const image =
				imageKey && !removeImage
					? { imageUrl: getR2PublicUrl(imageKey), imageKey }
					: { imageUrl: null, imageKey: null };

			await db
				.insert(eventStatDays)
				.values({ eventId: event.id, dayDate, sessions, isPublished, ...image })
				.onConflictDoUpdate({
					target: [eventStatDays.eventId, eventStatDays.dayDate],
					set: { sessions, isPublished, ...(imageChanged ? image : {}), updatedAt: new Date() }
				});
			if (imageChanged) replacedImageKey = existing?.imageKey ?? null;
		} catch (err) {
			console.error(`Erreur statistiques événement #${event.id} (${dayDate}):`, err);
			return fail(500, { error: 'Erreur lors de l’enregistrement des statistiques.' });
		}

		// L'ancienne image n'est supprimée de R2 qu'une fois la base à jour
		await deleteStatImage(replacedImageKey);
		return {
			success: true,
			message: isPublished
				? 'Statistiques publiées sur la page de l’événement.'
				: 'Statistiques enregistrées en brouillon.'
		};
	},

	deleteDay: async ({ request, params }) => {
		if (!db) return fail(503, { error: DB_UNAVAILABLE });
		const eventId = parseEventId(params.id);
		const dayDate = String((await request.formData()).get('dayDate') ?? '');

		let deleted: { imageKey: string | null } | undefined;
		try {
			[deleted] = await db
				.delete(eventStatDays)
				.where(and(eq(eventStatDays.eventId, eventId), eq(eventStatDays.dayDate, dayDate)))
				.returning({ imageKey: eventStatDays.imageKey });
		} catch (err) {
			console.error(`Erreur suppression statistiques #${eventId} (${dayDate}):`, err);
			return fail(500, { error: 'Erreur lors de la suppression.' });
		}
		if (!deleted) return fail(404, { error: 'Aucune statistique pour ce jour.' });

		await deleteStatImage(deleted.imageKey);
		return { success: true, message: 'Statistiques du jour supprimées.' };
	}
};
