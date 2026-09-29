import { db, isDbConfigured } from '$lib/server/db/index.js';
import { articles } from '$lib/server/db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types.js';

const fallbackArticles = [
	{
		id: 1,
		title: 'Retour sur nos dernières actions missionnaires',
		slug: 'actions-missionnaires',
		category: 'Mission',
		excerpt: 'Bilan complet de nos récentes croisades et actions d’évangélisation.',
		content:
			'Nos équipes ont parcouru plusieurs localités pour porter l’Évangile et distribuer des vivres...',
		imageUrl: '/article-bible.jpg',
		readTime: '4 min',
		isPublished: true,
		createdAt: new Date('2026-09-12')
	},
	{
		id: 2,
		title: 'Des vies restaurées par la puissance de Dieu',
		slug: 'vies-restaurees',
		category: 'Témoignage',
		excerpt: 'Récits émouvants de délivrance et de relèvement spirituel.',
		content:
			'Découvrez les témoignages marquants des jeunes et des familles touchées par la grâce...',
		imageUrl: '/article-communaute.jpg',
		readTime: '3 min',
		isPublished: true,
		createdAt: new Date('2026-09-08')
	},
	{
		id: 3,
		title: 'Porter l’Évangile jusque dans les localités',
		slug: 'porter-evangile',
		category: 'Évangélisation',
		excerpt: 'La vision d’implantation et de formation de nouveaux disciples.',
		content: 'Comment ECOFIP prépare les responsables de demain à travers le pays...',
		imageUrl: '/article-evangelisation.jpg',
		readTime: '5 min',
		isPublished: true,
		createdAt: new Date('2026-09-01')
	}
];

export const load: PageServerLoad = async () => {
	if (isDbConfigured && db) {
		try {
			const items = await db.select().from(articles).orderBy(desc(articles.createdAt));
			if (items.length > 0) {
				return { articles: items, usingNeonDb: true };
			}
		} catch {
			// En attente de migration
		}
	}

	return {
		articles: fallbackArticles,
		usingNeonDb: false
	};
};

export const actions: Actions = {
	create: async ({ request }) => {
		const formData = await request.formData();
		const title = String(formData.get('title') ?? '').trim();
		const category = String(formData.get('category') ?? 'Mission').trim();
		const excerpt = String(formData.get('excerpt') ?? '').trim();
		const content = String(formData.get('content') ?? '').trim();
		const readTime = String(formData.get('readTime') ?? '4 min').trim();
		const imageDataUrl = String(formData.get('imageDataUrl') ?? '').trim();
		const isPublished = formData.get('isPublished') === 'on';

		if (!title || !content) {
			return fail(400, { error: 'Le titre et le contenu de l’article sont obligatoires.' });
		}

		const slug = title
			.toLowerCase()
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/(^-|-$)+/g, '');

		// Image uploadée depuis l'appareil ou image par défaut selon catégorie
		const fallbackImage =
			category === 'Témoignage'
				? '/article-communaute.jpg'
				: category === 'Évangélisation'
					? '/article-evangelisation.jpg'
					: '/article-bible.jpg';
		const imageUrl = imageDataUrl || fallbackImage;

		if (isDbConfigured && db) {
			try {
				await db.insert(articles).values({
					title,
					slug: slug || `article-${Date.now()}`,
					category,
					excerpt: excerpt || title,
					content,
					imageUrl,
					readTime: readTime || '4 min',
					isPublished,
					publishedAt: isPublished ? new Date() : null
				});
			} catch {
				return fail(500, { error: 'Erreur lors de la création de l’article sur Neon.' });
			}
		}

		return { success: true, message: 'Article créé et enregistré avec succès !' };
	},

	togglePublish: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		const currentStatus = formData.get('currentStatus') === 'true';

		if (!id) return fail(400, { error: 'Identifiant invalide' });

		if (isDbConfigured && db) {
			try {
				await db
					.update(articles)
					.set({
						isPublished: !currentStatus,
						publishedAt: !currentStatus ? new Date() : null,
						updatedAt: new Date()
					})
					.where(eq(articles.id, id));
			} catch {
				return fail(500, { error: 'Erreur lors de la mise à jour' });
			}
		}

		return { success: true, message: 'Statut de publication de l’article mis à jour.' };
	},

	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));

		if (!id) return fail(400, { error: 'Identifiant invalide' });

		if (isDbConfigured && db) {
			try {
				await db.delete(articles).where(eq(articles.id, id));
			} catch {
				return fail(500, { error: 'Erreur lors de la suppression' });
			}
		}

		return { success: true, message: 'Article supprimé avec succès.' };
	}
};
