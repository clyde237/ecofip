import { db, isDbConfigured } from '$lib/server/db/index.js';
import { sermons } from '$lib/server/db/schema.js';
import { desc, eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types.js';
import { formatMediaUrl, getR2PublicUrl, isR2Configured } from '$lib/server/r2.js';
import {
	createUniqueSermonSlug,
	deleteSermonFiles,
	parseSermonForm,
	parseSermonKey
} from '$lib/server/sermons.js';

const DB_UNAVAILABLE = 'La base de données Neon n’est pas configurée.';

function parseId(formData: FormData): number | null {
	const id = Number(formData.get('id'));
	return Number.isInteger(id) && id > 0 ? id : null;
}

export const load: PageServerLoad = async () => {
	if (isDbConfigured && db) {
		try {
			const rows = await db.select().from(sermons).orderBy(desc(sermons.createdAt));
			return {
				sermons: rows.map((row) => ({
					...row,
					videoUrl: formatMediaUrl(row.videoUrl),
					posterUrl: formatMediaUrl(row.posterUrl) || null
				})),
				usingNeonDb: true,
				isR2Configured
			};
		} catch (err) {
			console.error('Erreur lecture prédications:', err);
		}
	}
	return { sermons: [], usingNeonDb: false, isR2Configured };
};

export const actions: Actions = {
	/** La vidéo et l'affiche sont déjà sur R2 : le serveur ne reçoit que leurs clés, qu'il valide */
	create: async ({ request }) => {
		const formData = await request.formData();
		const parsed = parseSermonForm(formData);
		if ('error' in parsed) return fail(400, { error: parsed.error });

		const videoKey = parseSermonKey(formData.get('videoKey'));
		if (!videoKey) return fail(400, { error: 'La vidéo n’a pas été envoyée correctement sur R2.' });
		const posterKey = parseSermonKey(formData.get('posterKey'));
		if (!db) return fail(503, { error: DB_UNAVAILABLE });

		try {
			await db.insert(sermons).values({
				...parsed.value,
				slug: await createUniqueSermonSlug(parsed.value.title),
				videoUrl: getR2PublicUrl(videoKey),
				videoKey,
				posterUrl: posterKey ? getR2PublicUrl(posterKey) : null,
				posterKey,
				publishedAt: parsed.value.isPublished ? new Date() : null
			});
		} catch (err) {
			console.error('Erreur création prédication:', err);
			return fail(500, { error: 'Erreur lors de l’enregistrement de la prédication.' });
		}

		return {
			success: true,
			message: parsed.value.isPublished
				? 'Prédication publiée sur le site.'
				: 'Prédication enregistrée (non publiée).'
		};
	},

	update: async ({ request }) => {
		const formData = await request.formData();
		const id = parseId(formData);
		if (!id) return fail(400, { error: 'Identifiant invalide.' });
		const parsed = parseSermonForm(formData);
		if ('error' in parsed) return fail(400, { error: parsed.error });
		if (!db) return fail(503, { error: DB_UNAVAILABLE });

		// Nouvelle affiche éventuelle, déjà envoyée sur R2 (la vidéo elle-même ne se remplace pas)
		const newPosterKey = parseSermonKey(formData.get('posterKey'));
		let replacedPosterKey: string | null = null;

		try {
			const [existing] = await db
				.select({ posterKey: sermons.posterKey, publishedAt: sermons.publishedAt })
				.from(sermons)
				.where(eq(sermons.id, id))
				.limit(1);
			if (!existing) return fail(404, { error: 'Prédication introuvable.' });

			const posterChanged = newPosterKey !== null && newPosterKey !== existing.posterKey;
			// L'adresse publique (slug) est conservée pour ne pas casser les liens partagés
			await db
				.update(sermons)
				.set({
					...parsed.value,
					publishedAt: parsed.value.isPublished
						? (existing.publishedAt ?? new Date())
						: existing.publishedAt,
					...(posterChanged && newPosterKey
						? { posterUrl: getR2PublicUrl(newPosterKey), posterKey: newPosterKey }
						: {}),
					updatedAt: new Date()
				})
				.where(eq(sermons.id, id));

			if (posterChanged) replacedPosterKey = existing.posterKey;
		} catch (err) {
			console.error(`Erreur modification prédication #${id}:`, err);
			return fail(500, { error: 'Erreur lors de la mise à jour de la prédication.' });
		}

		// L'ancienne affiche n'est supprimée de R2 qu'une fois la base à jour
		await deleteSermonFiles([replacedPosterKey]);
		return { success: true, message: 'Prédication mise à jour.' };
	},

	togglePublish: async ({ request }) => {
		const id = parseId(await request.formData());
		if (!id) return fail(400, { error: 'Identifiant invalide.' });
		if (!db) return fail(503, { error: DB_UNAVAILABLE });

		try {
			const [existing] = await db
				.select({ isPublished: sermons.isPublished, publishedAt: sermons.publishedAt })
				.from(sermons)
				.where(eq(sermons.id, id))
				.limit(1);
			if (!existing) return fail(404, { error: 'Prédication introuvable.' });

			const publish = !existing.isPublished;
			await db
				.update(sermons)
				.set({
					isPublished: publish,
					// Date de première publication conservée (ordre d'affichage sur le site)
					publishedAt: publish ? (existing.publishedAt ?? new Date()) : existing.publishedAt,
					updatedAt: new Date()
				})
				.where(eq(sermons.id, id));
			return {
				success: true,
				message: publish ? 'Prédication publiée sur le site.' : 'Prédication retirée du site.'
			};
		} catch (err) {
			console.error(`Erreur publication prédication #${id}:`, err);
			return fail(500, { error: 'Erreur lors de la mise à jour de la publication.' });
		}
	},

	delete: async ({ request }) => {
		const id = parseId(await request.formData());
		if (!id) return fail(400, { error: 'Identifiant invalide.' });
		if (!db) return fail(503, { error: DB_UNAVAILABLE });

		let deleted: { videoKey: string | null; posterKey: string | null } | undefined;
		try {
			[deleted] = await db
				.delete(sermons)
				.where(eq(sermons.id, id))
				.returning({ videoKey: sermons.videoKey, posterKey: sermons.posterKey });
		} catch (err) {
			console.error(`Erreur suppression prédication #${id}:`, err);
			return fail(500, { error: 'Erreur lors de la suppression.' });
		}
		if (!deleted) return fail(404, { error: 'Prédication introuvable.' });

		// Vidéo et affiche ne sont retirées de R2 qu'une fois la ligne supprimée
		await deleteSermonFiles([deleted.videoKey, deleted.posterKey]);
		return { success: true, message: 'Prédication supprimée.' };
	}
};
