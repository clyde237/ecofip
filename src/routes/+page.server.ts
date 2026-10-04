import { db, isDbConfigured } from '$lib/server/db/index.js';
import { events, videos } from '$lib/server/db/schema.js';
import { eq, asc, desc, and } from 'drizzle-orm';
import type { PageServerLoad } from './$types.js';
import type { DetailedEventItem, EventItem, VideoChapter } from '$lib/design-system/types.js';
import { formatMediaUrl } from '$lib/server/r2.js';
import { getEventTargetDate } from '$lib/utils/eventDate.js';

export const load: PageServerLoad = async () => {
	let publishedVideos: VideoChapter[] = [];
	let featuredEvent: DetailedEventItem | null = null;
	let homeEvents: EventItem[] = [];

	if (isDbConfigured && db) {
		try {
			// 1. Vidéos homepage
			const videoItems = await db
				.select()
				.from(videos)
				.where(eq(videos.isPublished, true))
				.orderBy(asc(videos.displayOrder), desc(videos.createdAt));

			if (videoItems.length > 0) {
				publishedVideos = videoItems.map((v) => ({
					id: String(v.id),
					title: v.title,
					duration: v.duration,
					location: v.location,
					thumbnail: formatMediaUrl(v.thumbnailUrl) || '/video-highlights-cover.jpg',
					videoUrl: formatMediaUrl(v.videoUrl),
					description: v.description ?? ''
				}));
			}

			// 2. Événement mis en avant sous la Hero (isFeatured: true et isPublished: true)
			const featuredRows = await db
				.select()
				.from(events)
				.where(and(eq(events.isPublished, true), eq(events.isFeatured, true)))
				.limit(1);

			if (featuredRows.length > 0) {
				const ev = featuredRows[0];
				const monthYearParts = (ev.dateMonthYear || 'OCT 2026').split(' ');
				const dateMonth = monthYearParts[0] || 'OCT';
				const dateYear = monthYearParts[1] || '2026';
				const target = getEventTargetDate(ev);

				const defaultImg =
					ev.category === 'Camp Jeunes'
						? '/event-camp.jpg'
						: ev.category === 'Séminaire'
							? '/event-seminaire.jpg'
							: '/event-croisade.jpg';

				featuredEvent = {
					id: String(ev.id),
					slug: ev.slug,
					title: ev.title,
					category: ev.category.toLowerCase().replace(/[^a-z]/g, '') || 'croisade',
					categoryLabel: ev.category,
					dateDay: ev.dateDay || '15',
					dateMonth,
					dateYear,
					time: ev.time || '18h00',
					location: ev.location,
					city: ev.location.includes(',') ? ev.location.split(',')[1].trim() : 'Cameroun',
					image: formatMediaUrl(ev.imageUrl) || defaultImg,
					imageAlt: ev.title,
					status: target < new Date() ? 'past' : 'upcoming',
					description: ev.description || '',
					speakers: ['Pasteur Valéry Tchamekwen', 'Équipe Pastorale ECOFIP'],
					isFree: true,
					isFeatured: true,
					startDate: ev.startDate,
					eventDate: ev.eventDate,
					targetDate: target
				};
			}

			// 3. Événements récents pour la section événements de la homepage
			const eventRows = await db
				.select()
				.from(events)
				.where(eq(events.isPublished, true))
				.orderBy(desc(events.createdAt))
				.limit(6);

			if (eventRows.length > 0) {
				homeEvents = eventRows.map((ev) => {
					const defaultImg =
						ev.category === 'Camp Jeunes'
							? '/event-camp.jpg'
							: ev.category === 'Séminaire'
								? '/event-seminaire.jpg'
								: '/event-croisade.jpg';

					return {
						id: ev.slug || String(ev.id),
						title: ev.title,
						dateDay: ev.dateDay || '15',
						dateMonthYear: ev.dateMonthYear || 'OCT 2026',
						time: ev.time || '18h00',
						location: ev.location,
						ctaLabel: 'Participer',
						href: `/nos-evenements/${ev.slug || ev.id}`,
						image: formatMediaUrl(ev.imageUrl) || defaultImg,
						imageAlt: ev.title
					};
				});
			}
		} catch (err) {
			console.error('Erreur chargement données homepage:', err);
		}
	}

	return {
		videos: publishedVideos,
		featuredEvent,
		events: homeEvents
	};
};
