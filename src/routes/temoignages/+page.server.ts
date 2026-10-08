import { db, isDbConfigured } from '$lib/server/db/index.js';
import { testimonials } from '$lib/server/db/schema.js';
import { fail } from '@sveltejs/kit';
import { loadPublishedTestimonials, parseVisitorSubmission } from '$lib/server/testimonials.js';
import type { Actions, PageServerLoad } from './$types.js';
import type { PublishedTestimonial } from '$lib/design-system/types.js';

export const load: PageServerLoad = async () => {
	let published: PublishedTestimonial[] = [];
	if (isDbConfigured && db) {
		try {
			published = await loadPublishedTestimonials();
		} catch (err) {
			console.error('Erreur chargement page témoignages:', err);
		}
	}
	return {
		written: published.filter((item) => item.type === 'text'),
		videos: published.filter((item) => item.type === 'video')
	};
};

export const actions: Actions = {
	/** Témoignage écrit envoyé par un visiteur : enregistré en attente de validation */
	submit: async ({ request }) => {
		const formData = await request.formData();
		const parsed = parseVisitorSubmission(formData);

		// Robot détecté : réponse identique à un envoi réussi, pour ne rien lui apprendre
		if ('spam' in parsed) return { success: true };
		if ('error' in parsed) {
			return fail(400, {
				error: parsed.error,
				values: {
					authorName: String(formData.get('authorName') ?? ''),
					authorRole: String(formData.get('authorRole') ?? ''),
					authorCity: String(formData.get('authorCity') ?? ''),
					contactInfo: String(formData.get('contactInfo') ?? ''),
					content: String(formData.get('content') ?? '')
				}
			});
		}
		if (!isDbConfigured || !db) {
			return fail(503, {
				error: 'L’envoi est momentanément indisponible. Merci de réessayer plus tard.',
				values: parsed.value
			});
		}

		try {
			await db.insert(testimonials).values({
				...parsed.value,
				type: 'text',
				source: 'visitor',
				isApproved: false
			});
		} catch (err) {
			console.error('Erreur enregistrement témoignage visiteur:', err);
			return fail(500, {
				error: 'Votre témoignage n’a pas pu être enregistré. Merci de réessayer.',
				values: parsed.value
			});
		}

		return { success: true };
	}
};
