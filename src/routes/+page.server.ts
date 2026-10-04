import { db, isDbConfigured } from '$lib/server/db/index.js';
import { videos } from '$lib/server/db/schema.js';
import { eq, asc, desc } from 'drizzle-orm';
import type { PageServerLoad } from './$types.js';
import type { VideoChapter } from '$lib/design-system/types.js';

import { formatMediaUrl } from '$lib/server/r2.js';

export const load: PageServerLoad = async () => {
	let publishedVideos: VideoChapter[] = [];

	if (isDbConfigured && db) {
		try {
			const items = await db
				.select()
				.from(videos)
				.where(eq(videos.isPublished, true))
				.orderBy(asc(videos.displayOrder), desc(videos.createdAt));

			if (items.length > 0) {
				publishedVideos = items.map((v) => ({
					id: String(v.id),
					title: v.title,
					duration: v.duration,
					location: v.location,
					thumbnail: formatMediaUrl(v.thumbnailUrl) || '/video-highlights-cover.jpg',
					videoUrl: formatMediaUrl(v.videoUrl),
					description: v.description ?? ''
				}));
			}
		} catch (err) {
			console.error('Erreur lors du chargement des vidéos homepage:', err);
		}
	}

	return {
		videos: publishedVideos
	};
};
