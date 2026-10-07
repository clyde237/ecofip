import { db, isDbConfigured } from '$lib/server/db/index.js';
import { galleryAlbums, galleryItems } from '$lib/server/db/schema.js';
import { eq, sql } from 'drizzle-orm';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types.js';
import { isR2Configured } from '$lib/server/r2.js';
import {
	createUniqueAlbumSlug,
	deleteGalleryFiles,
	loadAlbumSummaries,
	parseAlbumFields
} from '$lib/server/gallery.js';

export const load: PageServerLoad = async () => {
	if (isDbConfigured && db) {
		try {
			return { albums: await loadAlbumSummaries(false), usingNeonDb: true, isR2Configured };
		} catch (err) {
			console.error('Erreur lecture albums galerie:', err);
		}
	}
	return { albums: [], usingNeonDb: false, isR2Configured };
};

export const actions: Actions = {
	/** Crée l'album puis ouvre sa page pour y ajouter les photos */
	createAlbum: async ({ request }) => {
		const parsed = parseAlbumFields(await request.formData());
		if ('error' in parsed) return fail(400, { error: parsed.error });
		if (!isDbConfigured || !db) {
			return fail(503, { error: 'La base de données Neon n’est pas configurée.' });
		}

		let albumId: number;
		try {
			const [{ max }] = await db
				.select({ max: sql<number>`coalesce(max(${galleryAlbums.displayOrder}), 0)` })
				.from(galleryAlbums);
			const [created] = await db
				.insert(galleryAlbums)
				.values({
					...parsed.value,
					slug: await createUniqueAlbumSlug(parsed.value.title),
					displayOrder: Number(max) + 1
				})
				.returning({ id: galleryAlbums.id });
			albumId = created.id;
		} catch (err) {
			console.error('Erreur création album galerie:', err);
			return fail(500, { error: 'Erreur lors de la création de l’album.' });
		}

		throw redirect(303, `/admin/galerie/${albumId}`);
	},

	toggleAlbumPublish: async ({ request }) => {
		const id = Number((await request.formData()).get('id'));
		if (!Number.isInteger(id) || id <= 0) return fail(400, { error: 'Identifiant invalide.' });
		if (!isDbConfigured || !db) {
			return fail(503, { error: 'La base de données Neon n’est pas configurée.' });
		}

		try {
			const [updated] = await db
				.update(galleryAlbums)
				.set({ isPublished: sql`not ${galleryAlbums.isPublished}`, updatedAt: new Date() })
				.where(eq(galleryAlbums.id, id))
				.returning({ title: galleryAlbums.title, isPublished: galleryAlbums.isPublished });
			if (!updated) return fail(404, { error: 'Album introuvable.' });
			return {
				success: true,
				message: updated.isPublished
					? `L’album « ${updated.title} » est visible dans la galerie.`
					: `L’album « ${updated.title} » et tout son contenu sont masqués.`
			};
		} catch (err) {
			console.error(`Erreur visibilité album #${id}:`, err);
			return fail(500, { error: 'Erreur lors de la mise à jour de la visibilité.' });
		}
	},

	/** Supprime l'album, ses médias (cascade en base) puis leurs fichiers R2 */
	deleteAlbum: async ({ request }) => {
		const id = Number((await request.formData()).get('id'));
		if (!Number.isInteger(id) || id <= 0) return fail(400, { error: 'Identifiant invalide.' });
		if (!isDbConfigured || !db) {
			return fail(503, { error: 'La base de données Neon n’est pas configurée.' });
		}

		let title: string;
		let fileKeys: (string | null)[];
		try {
			const files = await db
				.select({ imageKey: galleryItems.imageKey, videoKey: galleryItems.videoKey })
				.from(galleryItems)
				.where(eq(galleryItems.albumId, id));
			const [deleted] = await db
				.delete(galleryAlbums)
				.where(eq(galleryAlbums.id, id))
				.returning({ title: galleryAlbums.title });
			if (!deleted) return fail(404, { error: 'Album introuvable.' });
			title = deleted.title;
			fileKeys = files.flatMap((file) => [file.imageKey, file.videoKey]);
		} catch (err) {
			console.error(`Erreur suppression album #${id}:`, err);
			return fail(500, { error: 'Erreur lors de la suppression de l’album.' });
		}

		// Les fichiers ne sont retirés de R2 qu'une fois l'album supprimé en base
		await deleteGalleryFiles(fileKeys);

		return { success: true, message: `L’album « ${title} » a été supprimé.` };
	}
};
