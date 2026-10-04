import { db, isDbConfigured } from '$lib/server/db/index.js';
import { videos } from '$lib/server/db/schema.js';
import { eq, desc, asc } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types.js';
import { isR2Configured } from '$lib/server/r2.js';

const fallbackVideos = [
	{
		id: 1,
		title: 'Grande Croisade & Nuit d’Évangélisation',
		slug: 'croisade-yaounde',
		duration: '04:35',
		location: 'Yaoundé · Esplanade Omnisports',
		thumbnailUrl: '/video-highlights-cover.jpg',
		videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
		description:
			'Revivez la ferveur, les prières et les proclamations de foi lors de la grande croisade nationale.',
		isPublished: true,
		displayOrder: 1,
		createdAt: new Date('2026-08-20')
	},
	{
		id: 2,
		title: 'Secours d’Amour & Action Humanitaire',
		slug: 'action-humanitaire',
		duration: '03:12',
		location: 'Extrême-Nord & Zones rurales',
		thumbnailUrl: '/event-seminaire.jpg',
		videoUrl:
			'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
		description:
			'Distribution de vivres, kits scolaires et soutien pastoral aux familles et orphelins dans les villages.',
		isPublished: true,
		displayOrder: 2,
		createdAt: new Date('2026-08-15')
	},
	{
		id: 3,
		title: 'Camp National de la Jeunesse & Discipulat',
		slug: 'camp-jeunesse',
		duration: '05:20',
		location: 'Mont Fébé · Yaoundé',
		thumbnailUrl: '/event-camp.jpg',
		videoUrl:
			'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
		description:
			'Immersion spirituelle, louange vibrante et formation biblique de la prochaine génération d’ouvriers.',
		isPublished: true,
		displayOrder: 3,
		createdAt: new Date('2026-08-10')
	}
];

export const load: PageServerLoad = async () => {
	if (isDbConfigured && db) {
		try {
			const items = await db
				.select()
				.from(videos)
				.orderBy(asc(videos.displayOrder), desc(videos.createdAt));

			if (items.length > 0) {
				return {
					videos: items,
					usingNeonDb: true,
					isR2Configured
				};
			}
		} catch (err) {
			console.error('Erreur lecture table videos:', err);
		}
	}

	return {
		videos: fallbackVideos,
		usingNeonDb: false,
		isR2Configured
	};
};

export const actions: Actions = {
	create: async ({ request }) => {
		const formData = await request.formData();
		const title = String(formData.get('title') ?? '').trim();
		const duration = String(formData.get('duration') ?? '03:00').trim();
		const location = String(formData.get('location') ?? 'Yaoundé, Cameroun').trim();
		const description = String(formData.get('description') ?? '').trim();
		const videoUrl = String(formData.get('videoUrl') ?? '').trim();
		const thumbnailUrl = String(formData.get('thumbnailUrl') ?? '').trim();
		const isPublished = formData.get('isPublished') === 'on';

		if (!title) {
			return fail(400, { error: 'Le titre de la vidéo est obligatoire.' });
		}
		if (!videoUrl) {
			return fail(400, {
				error:
					'L’URL ou le fichier de la vidéo est obligatoire. Uploadez un fichier ou saisissez un lien.'
			});
		}

		const slug = title
			.toLowerCase()
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/(^-|-$)+/g, '');

		const finalThumbnail = thumbnailUrl || '/video-highlights-cover.jpg';

		if (isDbConfigured && db) {
			try {
				await db.insert(videos).values({
					title,
					slug,
					duration,
					location,
					description: description || null,
					videoUrl,
					thumbnailUrl: finalThumbnail,
					isPublished,
					displayOrder: 0
				});
				return { success: true, message: 'Vidéo ajoutée avec succès !' };
			} catch (err: unknown) {
				const msg = err instanceof Error ? err.message : String(err);
				return fail(500, { error: `Erreur lors de l'enregistrement en base : ${msg}` });
			}
		}

		return {
			success: true,
			message: 'Vidéo enregistrée (mode démonstration local sans Neon).'
		};
	},

	togglePublish: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));

		if (!id) {
			return fail(400, { error: 'Identifiant invalide' });
		}

		if (isDbConfigured && db) {
			try {
				const current = await db.select().from(videos).where(eq(videos.id, id)).limit(1);
				if (current.length > 0) {
					await db
						.update(videos)
						.set({ isPublished: !current[0].isPublished, updatedAt: new Date() })
						.where(eq(videos.id, id));
				}
				return { success: true };
			} catch (err: unknown) {
				const msg = err instanceof Error ? err.message : String(err);
				return fail(500, { error: msg });
			}
		}

		return { success: true };
	},

	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));

		if (!id) {
			return fail(400, { error: 'Identifiant invalide' });
		}

		if (isDbConfigured && db) {
			try {
				await db.delete(videos).where(eq(videos.id, id));
				return { success: true, message: 'Vidéo supprimée avec succès.' };
			} catch (err: unknown) {
				const msg = err instanceof Error ? err.message : String(err);
				return fail(500, { error: msg });
			}
		}

		return { success: true };
	}
};
