import { db, isDbConfigured } from '$lib/server/db/index.js';
import { galleryAlbums, galleryItems } from '$lib/server/db/schema.js';
import { and, asc, eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { formatMediaUrl } from '$lib/server/r2.js';
import { slugify } from '$lib/server/gallery.js';
import type { PageServerLoad } from './$types.js';
import type { MediaItem } from '$lib/design-system/types.js';

export const load: PageServerLoad = async ({ params }) => {
	if (!isDbConfigured || !db) throw error(503, 'Galerie momentanément indisponible');

	const [album] = await db
		.select()
		.from(galleryAlbums)
		.where(and(eq(galleryAlbums.slug, params.slug), eq(galleryAlbums.isPublished, true)))
		.limit(1);
	if (!album) throw error(404, 'Album introuvable');

	const rows = await db
		.select()
		.from(galleryItems)
		.where(and(eq(galleryItems.albumId, album.id), eq(galleryItems.isPublished, true)))
		.orderBy(asc(galleryItems.displayOrder), asc(galleryItems.id));
	if (rows.length === 0) throw error(404, 'Album introuvable');

	const dateLabel = album.year ? String(album.year) : '';
	const items: MediaItem[] = rows.map((row) => ({
		id: String(row.id),
		title: row.title,
		// Catégorie, lieu et date sont ceux de l'album
		category: album.category,
		categorySlug: slugify(album.category),
		type: row.type === 'video' ? 'video' : 'photo',
		url: formatMediaUrl(row.imageUrl),
		videoUrl: row.videoUrl ? formatMediaUrl(row.videoUrl) : undefined,
		duration: row.duration ?? undefined,
		year: album.year ? String(album.year) : undefined,
		location: album.location ?? '',
		date: dateLabel,
		description: row.description ?? undefined
	}));

	const cover =
		items.find((item) => item.id === String(album.coverItemId)) ??
		items.find((item) => item.type === 'photo') ??
		items[0];

	return {
		album: {
			title: album.title,
			category: album.category,
			location: album.location ?? '',
			dateLabel,
			description: album.description ?? '',
			coverUrl: cover.url
		},
		photos: items.filter((item) => item.type === 'photo'),
		videos: items.filter((item) => item.type === 'video')
	};
};
