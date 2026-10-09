import { db, isDbConfigured } from '$lib/server/db/index.js';
import { articles } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types.js';
import { getR2PublicUrl, isR2Configured } from '$lib/server/r2.js';
import {
	createUniqueArticleSlug,
	eventExists,
	loadEventChoices,
	parseArticleForm,
	parseArticleImageKey
} from '$lib/server/articles.js';

export const load: PageServerLoad = async () => {
	let categories: string[] = [];
	let eventChoices: Awaited<ReturnType<typeof loadEventChoices>> = [];
	if (isDbConfigured && db) {
		try {
			[categories, eventChoices] = await Promise.all([
				db
					.selectDistinct({ category: articles.category })
					.from(articles)
					.then((rows) => rows.map((row) => row.category)),
				loadEventChoices()
			]);
		} catch (err) {
			console.error('Erreur lecture catégories articles:', err);
		}
	}
	return { categories, eventChoices, isR2Configured, usingNeonDb: Boolean(isDbConfigured && db) };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const parsed = parseArticleForm(formData);
		if ('error' in parsed) return fail(400, { error: parsed.error });
		if (!db) return fail(503, { error: 'La base de données Neon n’est pas configurée.' });
		if (parsed.value.eventId !== null && !(await eventExists(parsed.value.eventId))) {
			return fail(400, { error: 'L’événement lié n’existe plus. Choisissez-en un autre.' });
		}

		const imageKey = parseArticleImageKey(formData.get('imageKey'));
		let id: number;
		try {
			if (parsed.value.isFeatured) {
				await db.update(articles).set({ isFeatured: false }).where(eq(articles.isFeatured, true));
			}
			const [created] = await db
				.insert(articles)
				.values({
					...parsed.value,
					slug: await createUniqueArticleSlug(parsed.value.title),
					imageUrl: imageKey ? getR2PublicUrl(imageKey) : null,
					imageKey,
					publishedAt: parsed.value.isPublished ? new Date() : null
				})
				.returning({ id: articles.id });
			id = created.id;
		} catch (err) {
			console.error('Erreur création article:', err);
			return fail(500, { error: 'Erreur lors de l’enregistrement de l’article.' });
		}

		throw redirect(303, `/admin/articles/${id}?created=1`);
	}
};
