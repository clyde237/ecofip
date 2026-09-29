import { db, isDbConfigured } from '$lib/server/db/index.js';
import { testimonials } from '$lib/server/db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types.js';

// Données de démonstration structurelle (si la base Neon n'est pas encore connectée)
const fallbackTestimonials = [
	{
		id: 1,
		authorName: 'Jean-Pierre Kamga',
		authorRole: 'Commerçant & Père de famille',
		authorCity: 'Douala',
		avatarUrl: '/avatar-jean-pierre.jpg',
		content:
			'Après des années d’échecs et de découragement, j’ai assisté à la grande croisade ECOFIP à Douala. Ma vie spirituelle et mes affaires ont été entièrement restaurées.',
		isApproved: false, // En attente de validation
		submittedAt: new Date('2026-09-25T14:30:00Z')
	},
	{
		id: 2,
		authorName: 'Sarah Mbarga',
		authorRole: 'Responsable de jeunesse',
		authorCity: 'Yaoundé',
		avatarUrl: '/avatar-sarah.jpg',
		content:
			'La formation des disciples m’a donné des repères bibliques solides et un zèle nouveau pour témoigner auprès de ma génération.',
		isApproved: false, // En attente de validation
		submittedAt: new Date('2026-09-26T09:15:00Z')
	},
	{
		id: 3,
		authorName: 'Marie Claire Ngono',
		authorRole: 'Enseignante',
		authorCity: 'Bafoussam',
		avatarUrl: '/avatar-marie.jpg',
		content:
			'Le soutien médical et spirituel apporté lors des missions communautaires a guéri non seulement mon corps, mais ravivé la foi de toute ma famille.',
		isApproved: true, // Déjà approuvé
		submittedAt: new Date('2026-09-20T11:00:00Z')
	}
];

export const load: PageServerLoad = async () => {
	if (isDbConfigured && db) {
		try {
			const items = await db.select().from(testimonials).orderBy(desc(testimonials.submittedAt));
			if (items.length > 0) {
				return { testimonials: items, usingNeonDb: true };
			}
		} catch {
			// En attente de migration
		}
	}

	return {
		testimonials: fallbackTestimonials,
		usingNeonDb: false
	};
};

export const actions: Actions = {
	approve: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		if (!id) return fail(400, { error: 'Identifiant invalide' });

		if (isDbConfigured && db) {
			try {
				await db
					.update(testimonials)
					.set({ isApproved: true, approvedAt: new Date(), updatedAt: new Date() })
					.where(eq(testimonials.id, id));
			} catch {
				return fail(500, { error: 'Erreur lors de la validation en base de données' });
			}
		}

		return { success: true, message: 'Témoignage validé avec succès !' };
	},

	reject: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		if (!id) return fail(400, { error: 'Identifiant invalide' });

		if (isDbConfigured && db) {
			try {
				await db
					.update(testimonials)
					.set({ isApproved: false, updatedAt: new Date() })
					.where(eq(testimonials.id, id));
			} catch {
				return fail(500, { error: 'Erreur lors du rejet en base de données' });
			}
		}

		return { success: true, message: 'Témoignage marqué comme non approuvé.' };
	},

	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		if (!id) return fail(400, { error: 'Identifiant invalide' });

		if (isDbConfigured && db) {
			try {
				await db.delete(testimonials).where(eq(testimonials.id, id));
			} catch {
				return fail(500, { error: 'Erreur lors de la suppression' });
			}
		}

		return { success: true, message: 'Témoignage supprimé avec succès.' };
	}
};
