import { db, isDbConfigured } from '$lib/server/db/index.js';
import { events, videos } from '$lib/server/db/schema.js';
import { eq, asc, desc, and } from 'drizzle-orm';
import type { PageServerLoad } from './$types.js';
import type {
	ArticleItem,
	PublicSermon,
	DetailedEventItem,
	EventItem,
	TestimonialItem,
	VideoChapter
} from '$lib/design-system/types.js';
import { formatMediaUrl } from '$lib/server/r2.js';
import { getEventTargetDate } from '$lib/utils/eventDate.js';
import { loadPublishedTestimonials } from '$lib/server/testimonials.js';
import { loadPublishedArticles, toPublicArticle } from '$lib/server/articles.js';
import { loadPublishedSermons, toPublicSermon } from '$lib/server/sermons.js';

const HOME_TESTIMONIALS_COUNT = 3;
const HOME_ARTICLES_COUNT = 3;
const HOME_SERMONS_COUNT = 8;

/** Dernières prédications publiées (bandeau masqué si aucune ou base indisponible) */
async function loadHomeSermons(): Promise<PublicSermon[]> {
	if (!isDbConfigured || !db) return [];
	try {
		return (await loadPublishedSermons(HOME_SERMONS_COUNT)).map(toPublicSermon);
	} catch (err) {
		console.error('Erreur chargement prédications homepage:', err);
		return [];
	}
}

/** Les 3 derniers articles publiés. null : base indisponible, la section garde son contenu par défaut. */
async function loadHomeArticles(): Promise<ArticleItem[] | null> {
	if (!isDbConfigured || !db) return null;
	try {
		return (await loadPublishedArticles(HOME_ARTICLES_COUNT)).map((row) => {
			const article = toPublicArticle(row);
			return {
				id: article.id,
				title: article.title,
				category: article.category,
				date: article.date,
				image: article.image,
				imageAlt: article.imageAlt,
				href: article.href,
				readTime: article.readTime
			};
		});
	} catch (err) {
		console.error('Erreur chargement articles homepage:', err);
		return null;
	}
}

/**
 * Les 3 derniers témoignages écrits publiés (créés par l'admin ou validés).
 * null : base indisponible, la section garde ses témoignages par défaut.
 */
async function loadHomeTestimonials(): Promise<TestimonialItem[] | null> {
	if (!isDbConfigured || !db) return null;
	try {
		const published = await loadPublishedTestimonials({
			type: 'text',
			limit: HOME_TESTIMONIALS_COUNT
		});
		return published.map((item) => ({
			id: item.id,
			name: item.name,
			membership: [item.role, item.city].filter(Boolean).join(' · ') || 'Témoignage',
			quote: `« ${item.quote} »`,
			avatar: item.avatar,
			verified: true,
			rating: 5
		}));
	} catch (err) {
		console.error('Erreur chargement témoignages homepage:', err);
		return null;
	}
}

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
				// La vidéo à la une passe en tête : c'est elle que le lecteur charge et lance
				.orderBy(desc(videos.isFeatured), asc(videos.displayOrder), desc(videos.createdAt));

			if (videoItems.length > 0) {
				publishedVideos = videoItems.map((v) => ({
					id: String(v.id),
					title: v.title,
					duration: v.duration,
					location: v.location,
					thumbnail: formatMediaUrl(v.thumbnailUrl) || '/video-highlights-cover.jpg',
					videoUrl: formatMediaUrl(v.videoUrl),
					description: v.description ?? '',
					isFeatured: v.isFeatured
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
					speakers: ev.speakers
						? ev.speakers
								.split(',')
								.map((s) => s.trim())
								.filter(Boolean)
						: ['Pasteur Valéry Tchamekwen', 'Équipe Pastorale ECOFIP'],
					program: ev.program || null,
					isFree: true,
					isFeatured: true,
					registrationEnabled: ev.registrationEnabled,
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
		events: homeEvents,
		testimonials: await loadHomeTestimonials(),
		news: await loadHomeArticles(),
		sermons: await loadHomeSermons()
	};
};
