import { db, isDbConfigured } from '$lib/server/db/index.js';
import { articles } from '$lib/server/db/schema.js';
import { and, desc, eq, ne } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types.js';
import { formatMediaUrl } from '$lib/server/r2.js';
import { DEFAULT_ARTICLE_IMAGE, deleteArticleFiles } from '$lib/server/articles.js';

const DB_UNAVAILABLE = 'La base de données Neon n’est pas configurée.';

function parseId(formData: FormData): number | null {
	const id = Number(formData.get('id'));
	return Number.isInteger(id) && id > 0 ? id : null;
}

export const load: PageServerLoad = async () => {
	if (isDbConfigured && db) {
		try {
			const rows = await db
				.select({
					id: articles.id,
					title: articles.title,
					slug: articles.slug,
					category: articles.category,
					imageUrl: articles.imageUrl,
					authorName: articles.authorName,
					readTime: articles.readTime,
					isPublished: articles.isPublished,
					isFeatured: articles.isFeatured,
					publishedAt: articles.publishedAt,
					updatedAt: articles.updatedAt
				})
				.from(articles)
				.orderBy(desc(articles.updatedAt));
			return {
				articles: rows.map((row) => ({
					...row,
					imageUrl: formatMediaUrl(row.imageUrl) || DEFAULT_ARTICLE_IMAGE
				})),
				usingNeonDb: true
			};
		} catch (err) {
			console.error('Erreur lecture articles:', err);
		}
	}
	return { articles: [], usingNeonDb: false };
};

export const actions: Actions = {
	togglePublish: async ({ request }) => {
		const id = parseId(await request.formData());
		if (!id) return fail(400, { error: 'Identifiant invalide.' });
		if (!db) return fail(503, { error: DB_UNAVAILABLE });

		try {
			const [existing] = await db
				.select({ isPublished: articles.isPublished, publishedAt: articles.publishedAt })
				.from(articles)
				.where(eq(articles.id, id))
				.limit(1);
			if (!existing) return fail(404, { error: 'Article introuvable.' });

			const publish = !existing.isPublished;
			await db
				.update(articles)
				.set({
					isPublished: publish,
					// La date de première publication est conservée (ordre des articles sur le site)
					publishedAt: publish ? (existing.publishedAt ?? new Date()) : existing.publishedAt,
					// Un article retiré du site ne peut plus être à la une
					...(publish ? {} : { isFeatured: false }),
					updatedAt: new Date()
				})
				.where(eq(articles.id, id));
			return {
				success: true,
				message: publish ? 'Article publié sur le site.' : 'Article retiré du site.'
			};
		} catch (err) {
			console.error(`Erreur publication article #${id}:`, err);
			return fail(500, { error: 'Erreur lors de la mise à jour de la publication.' });
		}
	},

	/** Un seul article à la une : en mettre un à la une retire les autres */
	toggleFeatured: async ({ request }) => {
		const id = parseId(await request.formData());
		if (!id) return fail(400, { error: 'Identifiant invalide.' });
		if (!db) return fail(503, { error: DB_UNAVAILABLE });

		try {
			const [existing] = await db
				.select({ isFeatured: articles.isFeatured, isPublished: articles.isPublished })
				.from(articles)
				.where(eq(articles.id, id))
				.limit(1);
			if (!existing) return fail(404, { error: 'Article introuvable.' });
			if (!existing.isFeatured && !existing.isPublished) {
				return fail(400, { error: 'Publiez l’article avant de le mettre à la une.' });
			}

			const feature = !existing.isFeatured;
			if (feature) {
				await db
					.update(articles)
					.set({ isFeatured: false })
					.where(and(eq(articles.isFeatured, true), ne(articles.id, id)));
			}
			await db
				.update(articles)
				.set({ isFeatured: feature, updatedAt: new Date() })
				.where(eq(articles.id, id));
			return {
				success: true,
				message: feature
					? 'Article mis à la une de la page Actualités.'
					: 'Article retiré de la une.'
			};
		} catch (err) {
			console.error(`Erreur mise à la une article #${id}:`, err);
			return fail(500, { error: 'Erreur lors de la mise à la une.' });
		}
	},

	delete: async ({ request }) => {
		const id = parseId(await request.formData());
		if (!id) return fail(400, { error: 'Identifiant invalide.' });
		if (!db) return fail(503, { error: DB_UNAVAILABLE });

		let deleted: { imageKey: string | null; content: string } | undefined;
		try {
			[deleted] = await db
				.delete(articles)
				.where(eq(articles.id, id))
				.returning({ imageKey: articles.imageKey, content: articles.content });
		} catch (err) {
			console.error(`Erreur suppression article #${id}:`, err);
			return fail(500, { error: 'Erreur lors de la suppression.' });
		}
		if (!deleted) return fail(404, { error: 'Article introuvable.' });

		// Couverture et images insérées dans le texte ne sont retirées de R2 qu'une fois l'article supprimé
		await deleteArticleFiles(deleted.imageKey, deleted.content);
		return { success: true, message: 'Article supprimé.' };
	}
};
