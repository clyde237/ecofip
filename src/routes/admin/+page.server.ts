import { db, isDbConfigured } from '$lib/server/db/index.js';
import { testimonials, events, articles, videos } from '$lib/server/db/schema.js';
import { eq, sql } from 'drizzle-orm';
import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = async () => {
	let pendingTestimonialsCount = 3;
	let totalEventsCount = 3;
	let totalArticlesCount = 3;
	let totalVideosCount = 3;

	if (isDbConfigured && db) {
		try {
			const [pendingRes] = await db
				.select({ count: sql<number>`count(*)` })
				.from(testimonials)
				.where(eq(testimonials.isApproved, false));
			pendingTestimonialsCount = Number(pendingRes?.count ?? 0);

			const [eventsRes] = await db.select({ count: sql<number>`count(*)` }).from(events);
			totalEventsCount = Number(eventsRes?.count ?? 0);

			const [articlesRes] = await db.select({ count: sql<number>`count(*)` }).from(articles);
			totalArticlesCount = Number(articlesRes?.count ?? 0);

			const [videosRes] = await db.select({ count: sql<number>`count(*)` }).from(videos);
			totalVideosCount = Number(videosRes?.count ?? 0);
		} catch {
			// Si les tables n'ont pas encore été migrées avec drizzle-kit migrate
		}
	}

	return {
		isDbConfigured,
		stats: {
			pendingTestimonials: pendingTestimonialsCount,
			totalEvents: totalEventsCount,
			totalArticles: totalArticlesCount,
			totalVideos: totalVideosCount
		}
	};
};
