import { db, isDbConfigured } from '$lib/server/db/index.js';
import { galleryItems } from '$lib/server/db/schema.js';
import { asc, desc, eq, sql } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types.js';
import { isR2Configured, formatMediaUrl, getR2PublicUrl, deleteFromR2 } from '$lib/server/r2.js';

const DEFAULT_VIDEO_POSTER = '/video-highlights-cover.jpg';

// Limites alignées sur les colonnes de la table gallery_items
const MAX_TITLE_LENGTH = 200;
const MAX_CATEGORY_LENGTH = 100;
const MAX_LOCATION_LENGTH = 150;
const MAX_DESCRIPTION_LENGTH = 1000;
const MAX_DURATION_LENGTH = 20;
const MAX_PHOTOS_PER_BATCH = 50;

// Clés générées par /api/upload et /api/upload-url pour le dossier « gallery » :
// gallery/<uuid>-<nom assaini>. Toute autre clé est refusée, pour qu'un formulaire modifié
// ne puisse pas faire supprimer un autre fichier du bucket.
const GALLERY_KEY_PATTERN =
	/^gallery\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-[A-Za-z0-9._-]+$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DURATION_PATTERN = /^\d{1,3}:\d{2}(:\d{2})?$/;

function isGalleryKey(value: string): boolean {
	return GALLERY_KEY_PATTERN.test(value);
}

type SharedFields = {
	category: string;
	location: string | null;
	takenAt: string | null;
	isPublished: boolean;
};

/**
 * Champs communs à tous les médias : catégorie, lieu, date, publication.
 */
function parseSharedFields(formData: FormData): { values: SharedFields } | { error: string } {
	const category = String(formData.get('category') ?? '').trim();
	const location = String(formData.get('location') ?? '').trim();
	const takenAt = String(formData.get('takenAt') ?? '').trim();
	const isPublished = formData.get('isPublished') === 'on';

	if (!category) return { error: 'La catégorie est obligatoire (ex: Croisades).' };
	if (category.length > MAX_CATEGORY_LENGTH) {
		return { error: `La catégorie ne doit pas dépasser ${MAX_CATEGORY_LENGTH} caractères.` };
	}
	if (location.length > MAX_LOCATION_LENGTH) {
		return { error: `Le lieu ne doit pas dépasser ${MAX_LOCATION_LENGTH} caractères.` };
	}
	if (takenAt && (!DATE_PATTERN.test(takenAt) || Number.isNaN(Date.parse(takenAt)))) {
		return { error: 'La date est invalide.' };
	}

	return {
		values: { category, location: location || null, takenAt: takenAt || null, isPublished }
	};
}

function parseTitle(value: unknown): { title: string } | { error: string } {
	const title = String(value ?? '').trim();
	if (!title) return { error: 'Chaque média doit avoir un titre.' };
	if (title.length > MAX_TITLE_LENGTH) {
		return { error: `Le titre ne doit pas dépasser ${MAX_TITLE_LENGTH} caractères.` };
	}
	return { title };
}

function parseDescription(value: unknown): { description: string | null } | { error: string } {
	const description = String(value ?? '').trim();
	if (description.length > MAX_DESCRIPTION_LENGTH) {
		return { error: `La description ne doit pas dépasser ${MAX_DESCRIPTION_LENGTH} caractères.` };
	}
	return { description: description || null };
}

function parseDuration(value: unknown): { duration: string | null } | { error: string } {
	const duration = String(value ?? '').trim();
	if (duration && (duration.length > MAX_DURATION_LENGTH || !DURATION_PATTERN.test(duration))) {
		return { error: 'La durée doit être au format mm:ss (ex: 05:32).' };
	}
	return { duration: duration || null };
}

/** URL https saisie à la main (vidéo hébergée ailleurs) */
function parseExternalUrl(value: unknown): string | null {
	const url = String(value ?? '').trim();
	return /^https:\/\/[^\s]+$/i.test(url) ? url : null;
}

/** Le prochain élément ajouté se place après les éléments existants */
async function getNextDisplayOrder(): Promise<number> {
	if (!db) return 0;
	const [row] = await db
		.select({ max: sql<number>`coalesce(max(${galleryItems.displayOrder}), 0)` })
		.from(galleryItems);
	return Number(row?.max ?? 0) + 1;
}

export const load: PageServerLoad = async () => {
	if (isDbConfigured && db) {
		try {
			const items = await db
				.select()
				.from(galleryItems)
				.orderBy(asc(galleryItems.displayOrder), desc(galleryItems.id));

			return {
				items: items.map((item) => ({
					...item,
					imageUrl: formatMediaUrl(item.imageUrl),
					videoUrl: formatMediaUrl(item.videoUrl)
				})),
				usingNeonDb: true,
				isR2Configured
			};
		} catch (err) {
			console.error('Erreur lecture table gallery_items:', err);
		}
	}

	return { items: [], usingNeonDb: false, isR2Configured };
};

export const actions: Actions = {
	/**
	 * Ajout de plusieurs photos déjà envoyées sur R2. Le navigateur transmet, pour chaque photo,
	 * son titre et sa clé R2 ; catégorie, lieu, date et description sont communs au lot.
	 */
	createPhotos: async ({ request }) => {
		const formData = await request.formData();
		const shared = parseSharedFields(formData);
		if ('error' in shared) return fail(400, { error: shared.error });
		const description = parseDescription(formData.get('description'));
		if ('error' in description) return fail(400, { error: description.error });

		let rawPhotos: unknown;
		try {
			rawPhotos = JSON.parse(String(formData.get('photos') ?? '[]'));
		} catch {
			return fail(400, { error: 'Liste de photos illisible.' });
		}
		if (!Array.isArray(rawPhotos) || rawPhotos.length === 0) {
			return fail(400, { error: 'Ajoutez au moins une photo.' });
		}
		if (rawPhotos.length > MAX_PHOTOS_PER_BATCH) {
			return fail(400, { error: `${MAX_PHOTOS_PER_BATCH} photos maximum par envoi.` });
		}

		const photos: { title: string; imageKey: string }[] = [];
		for (const raw of rawPhotos) {
			const entry = (raw ?? {}) as { title?: unknown; key?: unknown };
			const title = parseTitle(entry.title);
			if ('error' in title) return fail(400, { error: title.error });
			const key = String(entry.key ?? '');
			if (!isGalleryKey(key)) {
				return fail(400, { error: 'Une des photos n’a pas été envoyée correctement sur R2.' });
			}
			photos.push({ title: title.title, imageKey: key });
		}

		if (!isDbConfigured || !db) {
			return fail(503, { error: 'La base de données Neon n’est pas configurée.' });
		}

		try {
			const firstOrder = await getNextDisplayOrder();
			await db.insert(galleryItems).values(
				photos.map((photo, index) => ({
					type: 'photo',
					title: photo.title,
					description: description.description,
					...shared.values,
					imageUrl: getR2PublicUrl(photo.imageKey),
					imageKey: photo.imageKey,
					displayOrder: firstOrder + index
				}))
			);
		} catch (err) {
			console.error('Erreur ajout photos galerie:', err);
			return fail(500, { error: 'Erreur lors de l’enregistrement des photos.' });
		}

		const count = photos.length;
		return {
			success: true,
			message: `${count} photo${count > 1 ? 's ajoutées' : ' ajoutée'} à la galerie.`
		};
	},

	createVideo: async ({ request }) => {
		const formData = await request.formData();
		const shared = parseSharedFields(formData);
		if ('error' in shared) return fail(400, { error: shared.error });
		const title = parseTitle(formData.get('title'));
		if ('error' in title) return fail(400, { error: title.error });
		const description = parseDescription(formData.get('description'));
		if ('error' in description) return fail(400, { error: description.error });
		const duration = parseDuration(formData.get('duration'));
		if ('error' in duration) return fail(400, { error: duration.error });

		const postedVideoKey = String(formData.get('videoKey') ?? '').trim();
		const videoKey = isGalleryKey(postedVideoKey) ? postedVideoKey : null;
		const videoUrl = videoKey
			? getR2PublicUrl(videoKey)
			: parseExternalUrl(formData.get('videoUrl'));
		if (!videoUrl) {
			return fail(400, { error: 'Envoyez un fichier vidéo ou indiquez un lien https.' });
		}

		const postedPosterKey = String(formData.get('posterKey') ?? '').trim();
		const posterKey = isGalleryKey(postedPosterKey) ? postedPosterKey : null;

		if (!isDbConfigured || !db) {
			return fail(503, { error: 'La base de données Neon n’est pas configurée.' });
		}

		try {
			await db.insert(galleryItems).values({
				type: 'video',
				title: title.title,
				description: description.description,
				...shared.values,
				imageUrl: posterKey ? getR2PublicUrl(posterKey) : DEFAULT_VIDEO_POSTER,
				imageKey: posterKey,
				videoUrl,
				videoKey,
				duration: duration.duration,
				displayOrder: await getNextDisplayOrder()
			});
		} catch (err) {
			console.error('Erreur ajout vidéo galerie:', err);
			return fail(500, { error: 'Erreur lors de l’enregistrement de la vidéo.' });
		}

		return { success: true, message: `La vidéo « ${title.title} » a été ajoutée à la galerie.` };
	},

	update: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		if (!Number.isInteger(id) || id <= 0) return fail(400, { error: 'Identifiant invalide.' });

		const shared = parseSharedFields(formData);
		if ('error' in shared) return fail(400, { error: shared.error });
		const title = parseTitle(formData.get('title'));
		if ('error' in title) return fail(400, { error: title.error });
		const description = parseDescription(formData.get('description'));
		if ('error' in description) return fail(400, { error: description.error });
		const duration = parseDuration(formData.get('duration'));
		if ('error' in duration) return fail(400, { error: duration.error });
		const rawOrder = Number(formData.get('displayOrder') ?? 0);
		const displayOrder = Number.isFinite(rawOrder) ? Math.max(0, Math.trunc(rawOrder)) : 0;

		// Nouvelle photo (ou nouvelle affiche de vidéo) éventuelle, déjà envoyée sur R2
		const postedImageKey = String(formData.get('imageKey') ?? '').trim();
		const newImageKey = isGalleryKey(postedImageKey) ? postedImageKey : null;

		if (!isDbConfigured || !db) {
			return fail(503, { error: 'La base de données Neon n’est pas configurée.' });
		}

		let replacedImageKey: string | null = null;
		try {
			const [existing] = await db
				.select({ type: galleryItems.type, imageKey: galleryItems.imageKey })
				.from(galleryItems)
				.where(eq(galleryItems.id, id))
				.limit(1);
			if (!existing) return fail(404, { error: 'Média introuvable.' });

			const imageChanged = newImageKey !== null && newImageKey !== existing.imageKey;

			await db
				.update(galleryItems)
				.set({
					title: title.title,
					description: description.description,
					...shared.values,
					duration: existing.type === 'video' ? duration.duration : null,
					displayOrder,
					...(imageChanged && newImageKey
						? { imageUrl: getR2PublicUrl(newImageKey), imageKey: newImageKey }
						: {}),
					updatedAt: new Date()
				})
				.where(eq(galleryItems.id, id));

			if (imageChanged && existing.imageKey) replacedImageKey = existing.imageKey;
		} catch (err) {
			console.error(`Erreur modification média galerie #${id}:`, err);
			return fail(500, { error: 'Erreur lors de la mise à jour du média.' });
		}

		// L'ancienne image n'est supprimée de R2 qu'une fois la base à jour
		if (replacedImageKey) await deleteFromR2(replacedImageKey);

		return { success: true, message: `« ${title.title} » a été mis à jour.` };
	},

	togglePublish: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		if (!Number.isInteger(id) || id <= 0) return fail(400, { error: 'Identifiant invalide.' });
		if (!isDbConfigured || !db) {
			return fail(503, { error: 'La base de données Neon n’est pas configurée.' });
		}

		try {
			const [updated] = await db
				.update(galleryItems)
				.set({ isPublished: sql`not ${galleryItems.isPublished}`, updatedAt: new Date() })
				.where(eq(galleryItems.id, id))
				.returning({ title: galleryItems.title, isPublished: galleryItems.isPublished });
			if (!updated) return fail(404, { error: 'Média introuvable.' });

			return {
				success: true,
				message: updated.isPublished
					? `« ${updated.title} » est visible dans la galerie.`
					: `« ${updated.title} » est masqué de la galerie.`
			};
		} catch (err) {
			console.error(`Erreur visibilité média galerie #${id}:`, err);
			return fail(500, { error: 'Erreur lors de la mise à jour de la visibilité.' });
		}
	},

	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		if (!Number.isInteger(id) || id <= 0) return fail(400, { error: 'Identifiant invalide.' });
		if (!isDbConfigured || !db) {
			return fail(503, { error: 'La base de données Neon n’est pas configurée.' });
		}

		let deleted: { title: string; imageKey: string | null; videoKey: string | null } | undefined;
		try {
			[deleted] = await db.delete(galleryItems).where(eq(galleryItems.id, id)).returning({
				title: galleryItems.title,
				imageKey: galleryItems.imageKey,
				videoKey: galleryItems.videoKey
			});
		} catch (err) {
			console.error(`Erreur suppression média galerie #${id}:`, err);
			return fail(500, { error: 'Erreur lors de la suppression du média.' });
		}
		if (!deleted) return fail(404, { error: 'Média introuvable.' });

		// Les fichiers ne sont retirés de R2 qu'une fois la ligne supprimée
		if (deleted.imageKey) await deleteFromR2(deleted.imageKey);
		if (deleted.videoKey) await deleteFromR2(deleted.videoKey);

		return { success: true, message: `« ${deleted.title} » a été supprimé de la galerie.` };
	}
};
