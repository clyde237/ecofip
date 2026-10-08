import type { RequestHandler } from './$types.js';
import { SITE_URL } from '$lib/config/site.js';

/** Tout le site est indexable, sauf l'espace d'administration et les API */
export const GET: RequestHandler = () =>
	new Response(
		[
			'User-agent: *',
			'Allow: /',
			'Disallow: /admin',
			'Disallow: /api/',
			'',
			`Sitemap: ${SITE_URL}/sitemap.xml`,
			''
		].join('\n'),
		{
			headers: {
				'content-type': 'text/plain; charset=utf-8',
				'cache-control': 'public, max-age=3600'
			}
		}
	);
