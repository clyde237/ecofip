import { db, isDbConfigured } from '$lib/server/db/index.js';
import { testimonials } from '$lib/server/db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types.js';
import { formatMediaUrl, isR2Configured } from '$lib/server/r2.js';
import {
	deleteTestimonialFiles,
	parseAdminTestimonial,
	parseTestimonialKey,
	testimonialFileUrl
} from '$lib/server/testimonials.js';

const DB_UNAVAILABLE = 'La base de données Neon n’est pas configurée.';

function parseId(formData: FormData): number | null {
	const id = Number(formData.get('id'));
	return Number.isInteger(id) && id > 0 ? id : null;
}

/** URL https saisie à la main (vidéo hébergée ailleurs) */
function parseExternalUrl(value: unknown): string | null {
	const url = String(value ?? '').trim();
	return /^https:\/\/[^\s]+$/i.test(url) ? url : null;
}

export const load: PageServerLoad = async () => {
	if (isDbConfigured && db) {
		try {
			const items = await db.select().from(testimonials).orderBy(desc(testimonials.submittedAt));
			return {
				testimonials: items.map((item) => ({
					...item,
					avatarUrl: formatMediaUrl(item.avatarUrl) || null,
					videoUrl: formatMediaUrl(item.videoUrl) || null,
					posterUrl: formatMediaUrl(item.posterUrl) || null
				})),
				usingNeonDb: true,
				isR2Configured
			};
		} catch (err) {
			console.error('Erreur lecture témoignages:', err);
		}
	}
	return { testimonials: [], usingNeonDb: false, isR2Configured };
};

export const actions: Actions = {
	/** Témoignage créé par l'admin : écrit, ou vidéo dont les fichiers sont déjà sur R2 */
	create: async ({ request }) => {
		const formData = await request.formData();
		const type = formData.get('type') === 'video' ? 'video' : 'text';
		const parsed = parseAdminTestimonial(formData, type);
		if ('error' in parsed) return fail(400, { error: parsed.error });

		const avatarKey = parseTestimonialKey(formData.get('avatarKey'));
		const posterKey = parseTestimonialKey(formData.get('posterKey'));
		const videoKey = parseTestimonialKey(formData.get('videoKey'));
		const videoUrl = videoKey
			? testimonialFileUrl(videoKey)
			: parseExternalUrl(formData.get('videoUrl'));
		if (type === 'video' && !videoUrl) {
			return fail(400, { error: 'Envoyez un fichier vidéo ou indiquez un lien https.' });
		}
		if (!db) return fail(503, { error: DB_UNAVAILABLE });

		try {
			await db.insert(testimonials).values({
				...parsed.value,
				source: 'admin',
				avatarUrl: avatarKey ? testimonialFileUrl(avatarKey) : null,
				avatarKey,
				videoUrl: type === 'video' ? videoUrl : null,
				videoKey: type === 'video' ? videoKey : null,
				posterUrl: type === 'video' && posterKey ? testimonialFileUrl(posterKey) : null,
				posterKey: type === 'video' ? posterKey : null,
				approvedAt: parsed.value.isApproved ? new Date() : null
			});
		} catch (err) {
			console.error('Erreur création témoignage:', err);
			return fail(500, { error: 'Erreur lors de l’enregistrement du témoignage.' });
		}

		return {
			success: true,
			message: parsed.value.isApproved
				? 'Témoignage publié sur le site.'
				: 'Témoignage enregistré (non publié).'
		};
	},

	/** Modification (corriger un témoignage de visiteur, changer la photo ou l'affiche…) */
	update: async ({ request }) => {
		const formData = await request.formData();
		const id = parseId(formData);
		if (!id) return fail(400, { error: 'Identifiant invalide.' });
		if (!db) return fail(503, { error: DB_UNAVAILABLE });

		let replacedKeys: (string | null)[];
		try {
			const [existing] = await db
				.select()
				.from(testimonials)
				.where(eq(testimonials.id, id))
				.limit(1);
			if (!existing) return fail(404, { error: 'Témoignage introuvable.' });

			const type = existing.type === 'video' ? 'video' : 'text';
			const parsed = parseAdminTestimonial(formData, type);
			if ('error' in parsed) return fail(400, { error: parsed.error });

			// Nouvelle photo / nouvelle affiche éventuelles, déjà envoyées sur R2
			const newAvatarKey = parseTestimonialKey(formData.get('avatarKey'));
			const removeAvatar = formData.get('removeAvatar') === 'on';
			const newPosterKey = type === 'video' ? parseTestimonialKey(formData.get('posterKey')) : null;

			const avatarChanged = (newAvatarKey && newAvatarKey !== existing.avatarKey) || removeAvatar;
			const posterChanged = newPosterKey !== null && newPosterKey !== existing.posterKey;

			// Première publication : on date la validation (ordre d'affichage sur l'accueil)
			const approvedAt = parsed.value.isApproved
				? (existing.approvedAt ?? new Date())
				: existing.approvedAt;

			await db
				.update(testimonials)
				.set({
					...parsed.value,
					approvedAt,
					...(avatarChanged
						? {
								avatarUrl: newAvatarKey ? testimonialFileUrl(newAvatarKey) : null,
								avatarKey: newAvatarKey
							}
						: {}),
					...(posterChanged && newPosterKey
						? { posterUrl: testimonialFileUrl(newPosterKey), posterKey: newPosterKey }
						: {}),
					updatedAt: new Date()
				})
				.where(eq(testimonials.id, id));

			replacedKeys = [
				avatarChanged ? existing.avatarKey : null,
				posterChanged ? existing.posterKey : null
			];
		} catch (err) {
			console.error(`Erreur modification témoignage #${id}:`, err);
			return fail(500, { error: 'Erreur lors de la mise à jour du témoignage.' });
		}

		// Les anciens fichiers ne sont supprimés de R2 qu'une fois la base à jour
		await deleteTestimonialFiles(replacedKeys);

		return { success: true, message: 'Témoignage mis à jour.' };
	},

	/** Publier (valider) ou retirer du site */
	togglePublish: async ({ request }) => {
		const id = parseId(await request.formData());
		if (!id) return fail(400, { error: 'Identifiant invalide.' });
		if (!db) return fail(503, { error: DB_UNAVAILABLE });

		try {
			const [existing] = await db
				.select({ isApproved: testimonials.isApproved, approvedAt: testimonials.approvedAt })
				.from(testimonials)
				.where(eq(testimonials.id, id))
				.limit(1);
			if (!existing) return fail(404, { error: 'Témoignage introuvable.' });

			const publish = !existing.isApproved;
			await db
				.update(testimonials)
				.set({
					isApproved: publish,
					// Date de la première validation conservée lors d'un retrait puis d'une republication
					approvedAt: publish ? (existing.approvedAt ?? new Date()) : existing.approvedAt,
					updatedAt: new Date()
				})
				.where(eq(testimonials.id, id));

			return {
				success: true,
				message: publish ? 'Témoignage publié sur le site.' : 'Témoignage retiré du site.'
			};
		} catch (err) {
			console.error(`Erreur publication témoignage #${id}:`, err);
			return fail(500, { error: 'Erreur lors de la mise à jour de la publication.' });
		}
	},

	delete: async ({ request }) => {
		const id = parseId(await request.formData());
		if (!id) return fail(400, { error: 'Identifiant invalide.' });
		if (!db) return fail(503, { error: DB_UNAVAILABLE });

		let deleted:
			{ avatarKey: string | null; videoKey: string | null; posterKey: string | null } | undefined;
		try {
			[deleted] = await db.delete(testimonials).where(eq(testimonials.id, id)).returning({
				avatarKey: testimonials.avatarKey,
				videoKey: testimonials.videoKey,
				posterKey: testimonials.posterKey
			});
		} catch (err) {
			console.error(`Erreur suppression témoignage #${id}:`, err);
			return fail(500, { error: 'Erreur lors de la suppression.' });
		}
		if (!deleted) return fail(404, { error: 'Témoignage introuvable.' });

		// Les fichiers ne sont retirés de R2 qu'une fois la ligne supprimée
		await deleteTestimonialFiles([deleted.avatarKey, deleted.videoKey, deleted.posterKey]);

		return { success: true, message: 'Témoignage supprimé.' };
	}
};
