/**
 * Règles communes de la galerie (albums et médias) : validation des formulaires admin,
 * adresses d'albums, couvertures, et nettoyage des fichiers Cloudflare R2.
 */
import { db } from '$lib/server/db/index.js';
import { galleryAlbums, galleryItems } from '$lib/server/db/schema.js';
import { asc, desc, like } from 'drizzle-orm';
import { deleteFromR2, formatMediaUrl } from '$lib/server/r2.js';

export const DEFAULT_VIDEO_POSTER = '/video-highlights-cover.jpg';
export const MAX_PHOTOS_PER_BATCH = 50;

// Limites alignées sur les colonnes des tables gallery_albums et gallery_items
const MAX_TITLE_LENGTH = 200;
const MAX_CATEGORY_LENGTH = 100;
const MAX_LOCATION_LENGTH = 150;
const MAX_DESCRIPTION_LENGTH = 1000;
const MAX_SLUG_BASE_LENGTH = 200;

// Clés générées par /api/upload et /api/upload-url pour le dossier « gallery » :
// gallery/<uuid>-<nom assaini>. Toute autre clé est refusée, pour qu'un formulaire modifié
// ne puisse pas faire supprimer un autre fichier du bucket.
const GALLERY_KEY_PATTERN =
	/^gallery\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-[A-Za-z0-9._-]+$/;
const MIN_ALBUM_YEAR = 1990;
const DURATION_PATTERN = /^\d{1,3}:\d{2}(:\d{2})?$/;

type Parsed<T> = { value: T } | { error: string };

export function isGalleryKey(value: string): boolean {
	return GALLERY_KEY_PATTERN.test(value);
}

export function parseTitle(value: unknown): Parsed<string> {
	const title = String(value ?? '').trim();
	if (!title) return { error: 'Le titre est obligatoire.' };
	if (title.length > MAX_TITLE_LENGTH) {
		return { error: `Le titre ne doit pas dépasser ${MAX_TITLE_LENGTH} caractères.` };
	}
	return { value: title };
}

export function parseDescription(value: unknown): Parsed<string | null> {
	const description = String(value ?? '').trim();
	if (description.length > MAX_DESCRIPTION_LENGTH) {
		return { error: `La description ne doit pas dépasser ${MAX_DESCRIPTION_LENGTH} caractères.` };
	}
	return { value: description || null };
}

export function parseDuration(value: unknown): Parsed<string | null> {
	const duration = String(value ?? '').trim();
	if (duration && !DURATION_PATTERN.test(duration)) {
		return { error: 'La durée doit être au format mm:ss (ex: 05:32).' };
	}
	return { value: duration || null };
}

export function parseDisplayOrder(value: unknown): number {
	const order = Number(value ?? 0);
	return Number.isFinite(order) ? Math.max(0, Math.trunc(order)) : 0;
}

/** URL https saisie à la main (vidéo hébergée ailleurs) */
export function parseExternalUrl(value: unknown): string | null {
	const url = String(value ?? '').trim();
	return /^https:\/\/[^\s]+$/i.test(url) ? url : null;
}

export type AlbumFields = {
	title: string;
	category: string;
	location: string | null;
	year: number | null;
	description: string | null;
	isPublished: boolean;
};

export function parseAlbumFields(formData: FormData): Parsed<AlbumFields> {
	const title = parseTitle(formData.get('title'));
	if ('error' in title) return title;
	const description = parseDescription(formData.get('description'));
	if ('error' in description) return description;

	const category = String(formData.get('category') ?? '').trim();
	const location = String(formData.get('location') ?? '').trim();
	const rawYear = String(formData.get('year') ?? '').trim();
	const year = rawYear ? Number(rawYear) : null;
	// Année de l'événement : de 1990 à l'année prochaine (album préparé à l'avance)
	const maxYear = new Date().getFullYear() + 1;

	if (!category) return { error: 'La catégorie est obligatoire (ex: Croisades).' };
	if (category.length > MAX_CATEGORY_LENGTH) {
		return { error: `La catégorie ne doit pas dépasser ${MAX_CATEGORY_LENGTH} caractères.` };
	}
	if (location.length > MAX_LOCATION_LENGTH) {
		return { error: `Le lieu ne doit pas dépasser ${MAX_LOCATION_LENGTH} caractères.` };
	}
	if (year !== null && (!Number.isInteger(year) || year < MIN_ALBUM_YEAR || year > maxYear)) {
		return { error: `L’année doit être comprise entre ${MIN_ALBUM_YEAR} et ${maxYear}.` };
	}

	return {
		value: {
			title: title.value,
			category,
			location: location || null,
			year,
			description: description.value,
			isPublished: formData.get('isPublished') === 'on'
		}
	};
}

export function slugify(value: string): string {
	return value
		.toLowerCase()
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)+/g, '')
		.slice(0, MAX_SLUG_BASE_LENGTH);
}

/** Adresse d'album unique : « croisade-bafoussam », puis « croisade-bafoussam-2 », etc. */
export async function createUniqueAlbumSlug(title: string): Promise<string> {
	const base = slugify(title) || 'album';
	if (!db) return base;
	const taken = new Set(
		(
			await db
				.select({ slug: galleryAlbums.slug })
				.from(galleryAlbums)
				.where(like(galleryAlbums.slug, `${base}%`))
		).map((row) => row.slug)
	);
	if (!taken.has(base)) return base;
	let suffix = 2;
	while (taken.has(`${base}-${suffix}`)) suffix++;
	return `${base}-${suffix}`;
}

/** Supprime des fichiers de R2 ; seules les clés de la galerie sont acceptées */
export async function deleteGalleryFiles(keys: (string | null)[]): Promise<void> {
	for (const key of keys) {
		if (key && isGalleryKey(key)) await deleteFromR2(key);
	}
}

export type AlbumSummary = {
	id: number;
	title: string;
	slug: string;
	category: string;
	location: string | null;
	year: number | null;
	description: string | null;
	isPublished: boolean;
	displayOrder: number;
	coverUrl: string | null;
	photoCount: number;
	videoCount: number;
};

/**
 * Liste des albums avec couverture et nombre de médias.
 * publicOnly : albums publiés, en ne comptant que les médias publiés (vue du site).
 */
export async function loadAlbumSummaries(publicOnly: boolean): Promise<AlbumSummary[]> {
	if (!db) return [];

	const albums = await db
		.select()
		.from(galleryAlbums)
		.orderBy(asc(galleryAlbums.displayOrder), desc(galleryAlbums.year), desc(galleryAlbums.id));
	const items = await db
		.select({
			id: galleryItems.id,
			albumId: galleryItems.albumId,
			type: galleryItems.type,
			imageUrl: galleryItems.imageUrl,
			isPublished: galleryItems.isPublished
		})
		.from(galleryItems)
		.orderBy(asc(galleryItems.displayOrder), asc(galleryItems.id));

	return albums
		.filter((album) => !publicOnly || album.isPublished)
		.map((album) => {
			const albumItems = items.filter(
				(item) => item.albumId === album.id && (!publicOnly || item.isPublished)
			);
			const cover =
				albumItems.find((item) => item.id === album.coverItemId) ??
				albumItems.find((item) => item.type === 'photo') ??
				albumItems[0];
			return {
				id: album.id,
				title: album.title,
				slug: album.slug,
				category: album.category,
				location: album.location,
				year: album.year,
				description: album.description,
				isPublished: album.isPublished,
				displayOrder: album.displayOrder,
				coverUrl: cover ? formatMediaUrl(cover.imageUrl) : null,
				photoCount: albumItems.filter((item) => item.type === 'photo').length,
				videoCount: albumItems.filter((item) => item.type === 'video').length
			};
		})
		.filter((album) => !publicOnly || album.photoCount + album.videoCount > 0);
}
