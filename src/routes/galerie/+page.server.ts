import { isDbConfigured, db } from '$lib/server/db/index.js';
import { loadAlbumSummaries, slugify } from '$lib/server/gallery.js';
import { DEFAULT_VIDEO_POSTER } from '$lib/server/gallery.js';
import type { PageServerLoad } from './$types.js';
import type { GalleryAlbumCard } from '$lib/design-system/types.js';

export const load: PageServerLoad = async () => {
	if (isDbConfigured && db) {
		try {
			// Albums publiés contenant au moins un média publié
			const albums: GalleryAlbumCard[] = (await loadAlbumSummaries(true)).map((album) => ({
				slug: album.slug,
				title: album.title,
				category: album.category,
				categorySlug: slugify(album.category),
				location: album.location ?? '',
				dateLabel: album.year ? String(album.year) : '',
				year: album.year ? String(album.year) : undefined,
				description: album.description ?? undefined,
				coverUrl: album.coverUrl || DEFAULT_VIDEO_POSTER,
				photoCount: album.photoCount,
				videoCount: album.videoCount
			}));
			return { albums };
		} catch (err) {
			console.error('Erreur chargement albums galerie:', err);
		}
	}

	// null = base indisponible : la galerie affiche son contenu par défaut
	return { albums: null as GalleryAlbumCard[] | null };
};
