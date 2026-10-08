import { db, isDbConfigured } from '$lib/server/db/index.js';
import { articles } from '$lib/server/db/schema.js';
import { and, eq, ne } from 'drizzle-orm';
import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types.js';
import { formatMediaUrl, getR2PublicUrl, isR2Configured } from '$lib/server/r2.js';
import {
	deleteArticleFiles,
	deleteArticleImage,
	parseArticleForm,
	parseArticleImageKey
} from '$lib/server/articles.js';

const DB_UNAVAILABLE = 'La base de données Neon n’est pas configurée.';

function parseArticleId(param: string): number {
	const id = Number(param);
	if (!Number.isInteger(id) || id <= 0) throw error(404, 'Article introuvable');
	return id;
}

export const load: PageServerLoad = async ({ params }) => {
	const id = parseArticleId(params.id);
	if (!isDbConfigured || !db) throw error(503, DB_UNAVAILABLE);

	const [article] = await db.select().from(articles).where(eq(articles.id, id)).limit(1);
	if (!article) throw error(404, 'Article introuvable');

	const categories = (await db.selectDistinct({ category: articles.category }).from(articles)).map(
		(row) => row.category
	);

	return {
		article: { ...article, imageUrl: formatMediaUrl(article.imageUrl) || null },
		categories,
		isR2Configured
	};
};

export const actions: Actions = {
	update: async ({ request, params }) => {
		const id = parseArticleId(params.id);
		const formData = await request.formData();
		const parsed = parseArticleForm(formData);
		if ('error' in parsed) return fail(400, { error: parsed.error });
		if (!db) return fail(503, { error: DB_UNAVAILABLE });

		const newImageKey = parseArticleImageKey(formData.get('imageKey'));
		const removeImage = formData.get('removeImage') === 'on';
		let replacedImageKey: string | null = null;

		try {
			const [existing] = await db
				.select({ imageKey: articles.imageKey, publishedAt: articles.publishedAt })
				.from(articles)
				.where(eq(articles.id, id))
				.limit(1);
			if (!existing) return fail(404, { error: 'Article introuvable.' });

			const imageChanged = (newImageKey && newImageKey !== existing.imageKey) || removeImage;
			if (parsed.value.isFeatured) {
				await db
					.update(articles)
					.set({ isFeatured: false })
					.where(and(eq(articles.isFeatured, true), ne(articles.id, id)));
			}

			// L'adresse publique (slug) est conservée pour ne pas casser les liens partagés
			await db
				.update(articles)
				.set({
					...parsed.value,
					// Date de première publication conservée lors des modifications
					publishedAt: parsed.value.isPublished
						? (existing.publishedAt ?? new Date())
						: existing.publishedAt,
					...(imageChanged
						? {
								imageUrl: newImageKey && !removeImage ? getR2PublicUrl(newImageKey) : null,
								imageKey: newImageKey && !removeImage ? newImageKey : null
							}
						: {}),
					updatedAt: new Date()
				})
				.where(eq(articles.id, id));

			if (imageChanged) replacedImageKey = existing.imageKey;
		} catch (err) {
			console.error(`Erreur modification article #${id}:`, err);
			return fail(500, { error: 'Erreur lors de la mise à jour de l’article.' });
		}

		// L'ancienne couverture n'est supprimée de R2 qu'une fois la base à jour
		await deleteArticleImage(replacedImageKey);
		return { success: true, message: 'Article enregistré.' };
	},

	delete: async ({ params }) => {
		const id = parseArticleId(params.id);
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

		await deleteArticleFiles(deleted.imageKey, deleted.content);
		throw redirect(303, '/admin/articles?deleted=1');
	}
};
