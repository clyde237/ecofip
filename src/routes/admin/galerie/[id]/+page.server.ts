import { db, isDbConfigured } from '$lib/server/db/index.js';
import { galleryAlbums, galleryItems } from '$lib/server/db/schema.js';
import { and, asc, eq, inArray, ne, sql } from 'drizzle-orm';
import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types.js';
import { formatMediaUrl, getR2PublicUrl, isR2Configured } from '$lib/server/r2.js';
import {
	DEFAULT_VIDEO_POSTER,
	MAX_PHOTOS_PER_BATCH,
	deleteGalleryFiles,
	isGalleryKey,
	parseAlbumFields,
	parseDescription,
	parseDisplayOrder,
	parseDuration,
	parseExternalUrl,
	parseTitle
} from '$lib/server/gallery.js';

const DB_UNAVAILABLE = 'La base de données Neon n’est pas configurée.';

function parseAlbumId(param: string): number {
	const id = Number(param);
	if (!Number.isInteger(id) || id <= 0) throw error(404, 'Album introuvable');
	return id;
}

function parseItemId(formData: FormData): number | null {
	const id = Number(formData.get('itemId'));
	return Number.isInteger(id) && id > 0 ? id : null;
}

/** Condition « ce média appartient bien à cet album » pour toute action sur un média */
function itemOfAlbum(itemId: number, albumId: number) {
	return and(eq(galleryItems.id, itemId), eq(galleryItems.albumId, albumId));
}

/** Les nouveaux médias se placent après ceux déjà présents dans l'album */
async function getNextItemOrder(albumId: number): Promise<number> {
	if (!db) return 0;
	const [row] = await db
		.select({ max: sql<number>`coalesce(max(${galleryItems.displayOrder}), 0)` })
		.from(galleryItems)
		.where(eq(galleryItems.albumId, albumId));
	return Number(row?.max ?? 0) + 1;
}

export const load: PageServerLoad = async ({ params }) => {
	const albumId = parseAlbumId(params.id);
	if (!isDbConfigured || !db) throw error(503, DB_UNAVAILABLE);

	const [album] = await db
		.select()
		.from(galleryAlbums)
		.where(eq(galleryAlbums.id, albumId))
		.limit(1);
	if (!album) throw error(404, 'Album introuvable');

	const items = await db
		.select()
		.from(galleryItems)
		.where(eq(galleryItems.albumId, albumId))
		.orderBy(asc(galleryItems.displayOrder), asc(galleryItems.id));

	const categories = await db
		.selectDistinct({ category: galleryAlbums.category })
		.from(galleryAlbums);

	// Albums vers lesquels des médias peuvent être déplacés
	const otherAlbums = await db
		.select({ id: galleryAlbums.id, title: galleryAlbums.title })
		.from(galleryAlbums)
		.where(ne(galleryAlbums.id, albumId))
		.orderBy(asc(galleryAlbums.title));

	return {
		album,
		items: items.map((item) => ({
			...item,
			imageUrl: formatMediaUrl(item.imageUrl),
			videoUrl: formatMediaUrl(item.videoUrl)
		})),
		categories: categories.map((row) => row.category),
		otherAlbums,
		isR2Configured
	};
};

export const actions: Actions = {
	updateAlbum: async ({ request, params }) => {
		const albumId = parseAlbumId(params.id);
		const parsed = parseAlbumFields(await request.formData());
		if ('error' in parsed) return fail(400, { error: parsed.error });
		if (!db) return fail(503, { error: DB_UNAVAILABLE });

		try {
			// L'adresse publique (slug) est conservée pour ne pas casser les liens partagés
			const [updated] = await db
				.update(galleryAlbums)
				.set({ ...parsed.value, updatedAt: new Date() })
				.where(eq(galleryAlbums.id, albumId))
				.returning({ id: galleryAlbums.id });
			if (!updated) return fail(404, { error: 'Album introuvable.' });
		} catch (err) {
			console.error(`Erreur modification album #${albumId}:`, err);
			return fail(500, { error: 'Erreur lors de la mise à jour de l’album.' });
		}
		return { success: true, message: 'Album mis à jour.' };
	},

	/**
	 * Ajout de plusieurs photos déjà envoyées sur R2 : le navigateur transmet le titre et la clé
	 * R2 de chacune. La catégorie, le lieu et la date viennent de l'album.
	 */
	createPhotos: async ({ request, params }) => {
		const albumId = parseAlbumId(params.id);
		const formData = await request.formData();
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
			photos.push({ title: title.value, imageKey: key });
		}

		if (!db) return fail(503, { error: DB_UNAVAILABLE });
		const isPublished = formData.get('isPublished') === 'on';

		try {
			const firstOrder = await getNextItemOrder(albumId);
			await db.insert(galleryItems).values(
				photos.map((photo, index) => ({
					albumId,
					type: 'photo',
					title: photo.title,
					description: description.value,
					imageUrl: getR2PublicUrl(photo.imageKey),
					imageKey: photo.imageKey,
					isPublished,
					displayOrder: firstOrder + index
				}))
			);
		} catch (err) {
			console.error(`Erreur ajout photos album #${albumId}:`, err);
			return fail(500, { error: 'Erreur lors de l’enregistrement des photos.' });
		}

		const count = photos.length;
		return {
			success: true,
			message: `${count} photo${count > 1 ? 's ajoutées' : ' ajoutée'} à l’album.`
		};
	},

	createVideo: async ({ request, params }) => {
		const albumId = parseAlbumId(params.id);
		const formData = await request.formData();
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

		if (!db) return fail(503, { error: DB_UNAVAILABLE });

		try {
			await db.insert(galleryItems).values({
				albumId,
				type: 'video',
				title: title.value,
				description: description.value,
				imageUrl: posterKey ? getR2PublicUrl(posterKey) : DEFAULT_VIDEO_POSTER,
				imageKey: posterKey,
				videoUrl,
				videoKey,
				duration: duration.value,
				isPublished: formData.get('isPublished') === 'on',
				displayOrder: await getNextItemOrder(albumId)
			});
		} catch (err) {
			console.error(`Erreur ajout vidéo album #${albumId}:`, err);
			return fail(500, { error: 'Erreur lors de l’enregistrement de la vidéo.' });
		}

		return { success: true, message: `La vidéo « ${title.value} » a été ajoutée à l’album.` };
	},

	updateItem: async ({ request, params }) => {
		const albumId = parseAlbumId(params.id);
		const formData = await request.formData();
		const itemId = parseItemId(formData);
		if (!itemId) return fail(400, { error: 'Identifiant invalide.' });

		const title = parseTitle(formData.get('title'));
		if ('error' in title) return fail(400, { error: title.error });
		const description = parseDescription(formData.get('description'));
		if ('error' in description) return fail(400, { error: description.error });
		const duration = parseDuration(formData.get('duration'));
		if ('error' in duration) return fail(400, { error: duration.error });

		// Nouvelle photo (ou nouvelle affiche de vidéo) éventuelle, déjà envoyée sur R2
		const postedImageKey = String(formData.get('imageKey') ?? '').trim();
		const newImageKey = isGalleryKey(postedImageKey) ? postedImageKey : null;

		if (!db) return fail(503, { error: DB_UNAVAILABLE });

		let replacedImageKey: string | null = null;
		try {
			const [existing] = await db
				.select({ type: galleryItems.type, imageKey: galleryItems.imageKey })
				.from(galleryItems)
				.where(itemOfAlbum(itemId, albumId))
				.limit(1);
			if (!existing) return fail(404, { error: 'Média introuvable dans cet album.' });

			const imageChanged = newImageKey !== null && newImageKey !== existing.imageKey;
			await db
				.update(galleryItems)
				.set({
					title: title.value,
					description: description.value,
					duration: existing.type === 'video' ? duration.value : null,
					displayOrder: parseDisplayOrder(formData.get('displayOrder')),
					isPublished: formData.get('isPublished') === 'on',
					...(imageChanged && newImageKey
						? { imageUrl: getR2PublicUrl(newImageKey), imageKey: newImageKey }
						: {}),
					updatedAt: new Date()
				})
				.where(itemOfAlbum(itemId, albumId));

			if (imageChanged) replacedImageKey = existing.imageKey;
		} catch (err) {
			console.error(`Erreur modification média #${itemId}:`, err);
			return fail(500, { error: 'Erreur lors de la mise à jour du média.' });
		}

		// L'ancienne image n'est supprimée de R2 qu'une fois la base à jour
		await deleteGalleryFiles([replacedImageKey]);

		return { success: true, message: `« ${title.value} » a été mis à jour.` };
	},

	toggleItemPublish: async ({ request, params }) => {
		const albumId = parseAlbumId(params.id);
		const itemId = parseItemId(await request.formData());
		if (!itemId) return fail(400, { error: 'Identifiant invalide.' });
		if (!db) return fail(503, { error: DB_UNAVAILABLE });

		try {
			const [updated] = await db
				.update(galleryItems)
				.set({ isPublished: sql`not ${galleryItems.isPublished}`, updatedAt: new Date() })
				.where(itemOfAlbum(itemId, albumId))
				.returning({ title: galleryItems.title, isPublished: galleryItems.isPublished });
			if (!updated) return fail(404, { error: 'Média introuvable dans cet album.' });
			return {
				success: true,
				message: updated.isPublished
					? `« ${updated.title} » est visible dans l’album.`
					: `« ${updated.title} » est masqué.`
			};
		} catch (err) {
			console.error(`Erreur visibilité média #${itemId}:`, err);
			return fail(500, { error: 'Erreur lors de la mise à jour de la visibilité.' });
		}
	},

	setCover: async ({ request, params }) => {
		const albumId = parseAlbumId(params.id);
		const itemId = parseItemId(await request.formData());
		if (!itemId) return fail(400, { error: 'Identifiant invalide.' });
		if (!db) return fail(503, { error: DB_UNAVAILABLE });

		try {
			const [item] = await db
				.select({ id: galleryItems.id })
				.from(galleryItems)
				.where(itemOfAlbum(itemId, albumId))
				.limit(1);
			if (!item) return fail(404, { error: 'Média introuvable dans cet album.' });
			await db
				.update(galleryAlbums)
				.set({ coverItemId: itemId, updatedAt: new Date() })
				.where(eq(galleryAlbums.id, albumId));
		} catch (err) {
			console.error(`Erreur couverture album #${albumId}:`, err);
			return fail(500, { error: 'Erreur lors du choix de la couverture.' });
		}
		return { success: true, message: 'Couverture de l’album mise à jour.' };
	},

	/** Déplace des médias de cet album vers un autre (placés à la fin de l'album cible) */
	moveItems: async ({ request, params }) => {
		const albumId = parseAlbumId(params.id);
		const formData = await request.formData();
		const targetAlbumId = Number(formData.get('targetAlbumId'));
		const itemIds = formData
			.getAll('itemIds')
			.map(Number)
			.filter((id) => Number.isInteger(id) && id > 0);

		if (itemIds.length === 0) return fail(400, { error: 'Sélectionnez au moins un média.' });
		if (!Number.isInteger(targetAlbumId) || targetAlbumId <= 0 || targetAlbumId === albumId) {
			return fail(400, { error: 'Choisissez l’album de destination.' });
		}
		if (!db) return fail(503, { error: DB_UNAVAILABLE });

		try {
			const [target] = await db
				.select({ title: galleryAlbums.title })
				.from(galleryAlbums)
				.where(eq(galleryAlbums.id, targetAlbumId))
				.limit(1);
			if (!target) return fail(404, { error: 'Album de destination introuvable.' });

			const movable = await db
				.select({ id: galleryItems.id })
				.from(galleryItems)
				.where(and(eq(galleryItems.albumId, albumId), inArray(galleryItems.id, itemIds)))
				.orderBy(asc(galleryItems.displayOrder), asc(galleryItems.id));
			if (movable.length === 0)
				return fail(404, { error: 'Aucun de ces médias n’est dans cet album.' });

			const firstOrder = await getNextItemOrder(targetAlbumId);
			for (const [index, item] of movable.entries()) {
				await db
					.update(galleryItems)
					.set({ albumId: targetAlbumId, displayOrder: firstOrder + index, updatedAt: new Date() })
					.where(itemOfAlbum(item.id, albumId));
			}

			// La couverture de cet album ne peut pas être un média déplacé ailleurs
			await db
				.update(galleryAlbums)
				.set({ coverItemId: null })
				.where(
					and(
						eq(galleryAlbums.id, albumId),
						inArray(
							galleryAlbums.coverItemId,
							movable.map((item) => item.id)
						)
					)
				);

			const count = movable.length;
			return {
				success: true,
				message: `${count} média${count > 1 ? 's déplacés' : ' déplacé'} vers « ${target.title} ».`
			};
		} catch (err) {
			console.error(`Erreur déplacement médias album #${albumId}:`, err);
			return fail(500, { error: 'Erreur lors du déplacement des médias.' });
		}
	},

	deleteItem: async ({ request, params }) => {
		const albumId = parseAlbumId(params.id);
		const itemId = parseItemId(await request.formData());
		if (!itemId) return fail(400, { error: 'Identifiant invalide.' });
		if (!db) return fail(503, { error: DB_UNAVAILABLE });

		let deleted: { title: string; imageKey: string | null; videoKey: string | null } | undefined;
		try {
			[deleted] = await db.delete(galleryItems).where(itemOfAlbum(itemId, albumId)).returning({
				title: galleryItems.title,
				imageKey: galleryItems.imageKey,
				videoKey: galleryItems.videoKey
			});
		} catch (err) {
			console.error(`Erreur suppression média #${itemId}:`, err);
			return fail(500, { error: 'Erreur lors de la suppression du média.' });
		}
		if (!deleted) return fail(404, { error: 'Média introuvable dans cet album.' });

		// Les fichiers ne sont retirés de R2 qu'une fois la ligne supprimée
		await deleteGalleryFiles([deleted.imageKey, deleted.videoKey]);

		return { success: true, message: `« ${deleted.title} » a été supprimé de l’album.` };
	}
};
