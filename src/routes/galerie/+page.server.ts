import { db, isDbConfigured } from '$lib/server/db/index.js';
import { galleryItems } from '$lib/server/db/schema.js';
import { asc, desc, eq } from 'drizzle-orm';
import { formatMediaUrl } from '$lib/server/r2.js';
import type { PageServerLoad } from './$types.js';
import type { MediaItem } from '$lib/design-system/types.js';

function slugify(value: string): string {
	return value
		.toLowerCase()
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)+/g, '');
}

function formatTakenAt(takenAt: string): string {
	return new Date(`${takenAt}T12:00:00Z`).toLocaleDateString('fr-FR', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
		timeZone: 'UTC'
	});
}

export const load: PageServerLoad = async () => {
	if (isDbConfigured && db) {
		try {
			const rows = await db
				.select()
				.from(galleryItems)
				.where(eq(galleryItems.isPublished, true))
				.orderBy(asc(galleryItems.displayOrder), desc(galleryItems.takenAt), desc(galleryItems.id));

			const items: MediaItem[] = rows.map((row) => ({
				id: String(row.id),
				title: row.title,
				category: row.category,
				categorySlug: slugify(row.category),
				type: row.type === 'video' ? 'video' : 'photo',
				url: formatMediaUrl(row.imageUrl),
				videoUrl: row.videoUrl ? formatMediaUrl(row.videoUrl) : undefined,
				duration: row.duration ?? undefined,
				year: row.takenAt ? row.takenAt.slice(0, 4) : undefined,
				location: row.location ?? '',
				date: row.takenAt ? formatTakenAt(row.takenAt) : '',
				description: row.description ?? undefined
			}));

			return {
				gallery: {
					photos: items.filter((item) => item.type === 'photo'),
					videos: items.filter((item) => item.type === 'video')
				}
			};
		} catch (err) {
			console.error('Erreur chargement galerie publique:', err);
		}
	}

	// null = base indisponible : la galerie affiche son contenu par défaut
	return { gallery: null as { photos: MediaItem[]; videos: MediaItem[] } | null };
};
