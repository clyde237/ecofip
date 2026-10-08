import type { RequestHandler } from './$types.js';
import { db, isDbConfigured } from '$lib/server/db/index.js';
import { articles, events, galleryAlbums, galleryItems, sermons } from '$lib/server/db/schema.js';
import { and, eq, sql } from 'drizzle-orm';
import { SITE_URL } from '$lib/config/site.js';

type Entry = { path: string; lastmod?: Date | null; changefreq: string; priority: number };

// Pages fixes du site, par ordre d'importance
const STATIC_PAGES: Entry[] = [
	{ path: '/', changefreq: 'weekly', priority: 1.0 },
	{ path: '/projets-missions', changefreq: 'monthly', priority: 0.9 },
	{ path: '/nos-evenements', changefreq: 'weekly', priority: 0.9 },
	{ path: '/a-propos', changefreq: 'monthly', priority: 0.8 },
	{ path: '/actualites', changefreq: 'weekly', priority: 0.8 },
	{ path: '/predications', changefreq: 'weekly', priority: 0.8 },
	{ path: '/temoignages', changefreq: 'weekly', priority: 0.7 },
	{ path: '/galerie', changefreq: 'weekly', priority: 0.7 },
	{ path: '/nous-rejoindre', changefreq: 'monthly', priority: 0.6 },
	{ path: '/faire-un-don', changefreq: 'monthly', priority: 0.6 },
	{ path: '/contact', changefreq: 'yearly', priority: 0.5 }
];

function escapeXml(value: string): string {
	return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Contenus publiés (articles, événements, albums, prédications) ; vide si la base est indisponible */
async function loadDynamicEntries(): Promise<Entry[]> {
	if (!isDbConfigured || !db) return [];
	try {
		const [articleRows, eventRows, albumRows, sermonRows] = await Promise.all([
			db
				.select({ slug: articles.slug, updatedAt: articles.updatedAt })
				.from(articles)
				.where(eq(articles.isPublished, true)),
			db
				.select({ slug: events.slug, updatedAt: events.updatedAt })
				.from(events)
				.where(eq(events.isPublished, true)),
			// Seuls les albums publiés contenant au moins un média publié ont une page
			db
				.select({ slug: galleryAlbums.slug, updatedAt: galleryAlbums.updatedAt })
				.from(galleryAlbums)
				.where(
					and(
						eq(galleryAlbums.isPublished, true),
						sql`exists (select 1 from ${galleryItems} where ${galleryItems.albumId} = ${galleryAlbums.id} and ${galleryItems.isPublished} = true)`
					)
				),
			db
				.select({ slug: sermons.slug, updatedAt: sermons.updatedAt })
				.from(sermons)
				.where(eq(sermons.isPublished, true))
		]);
		return [
			...eventRows.map((row) => ({
				path: `/nos-evenements/${row.slug}`,
				lastmod: row.updatedAt,
				changefreq: 'weekly',
				priority: 0.8
			})),
			...articleRows.map((row) => ({
				path: `/actualites/${row.slug}`,
				lastmod: row.updatedAt,
				changefreq: 'monthly',
				priority: 0.7
			})),
			...sermonRows.map((row) => ({
				path: `/predications/${row.slug}`,
				lastmod: row.updatedAt,
				changefreq: 'monthly',
				priority: 0.6
			})),
			...albumRows.map((row) => ({
				path: `/galerie/${row.slug}`,
				lastmod: row.updatedAt,
				changefreq: 'monthly',
				priority: 0.5
			}))
		];
	} catch (err) {
		console.error('Erreur génération sitemap:', err);
		return [];
	}
}

export const GET: RequestHandler = async () => {
	const entries = [...STATIC_PAGES, ...(await loadDynamicEntries())];
	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
	.map(
		(entry) => `	<url>
		<loc>${escapeXml(`${SITE_URL}${entry.path}`)}</loc>${
			entry.lastmod ? `\n		<lastmod>${entry.lastmod.toISOString().slice(0, 10)}</lastmod>` : ''
		}
		<changefreq>${entry.changefreq}</changefreq>
		<priority>${entry.priority.toFixed(1)}</priority>
	</url>`
	)
	.join('\n')}
</urlset>
`;
	return new Response(body, {
		headers: {
			'content-type': 'application/xml; charset=utf-8',
			'cache-control': 'public, max-age=3600'
		}
	});
};
