import { GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { r2Client, isR2Configured } from '$lib/server/r2.js';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types.js';

/**
 * Route de streaming direct pour les médias hébergés sur Cloudflare R2.
 * Permet la lecture vidéo avec requêtes par plage d'octets (HTTP Range / 206 Partial Content),
 * permettant le défilement et la lecture fluide même sans domaine public R2.dev configuré.
 */
export const GET: RequestHandler = async ({ params, request }) => {
	const rawKey = params.key;
	if (!rawKey) {
		return new Response('Clé média requise', { status: 400 });
	}

	if (!isR2Configured || !env.R2_BUCKET_NAME) {
		return new Response('Stockage Cloudflare R2 non configuré', { status: 503 });
	}

	const key = decodeURIComponent(rawKey);

	try {
		const rangeHeader = request.headers.get('range');

		const command = new GetObjectCommand({
			Bucket: env.R2_BUCKET_NAME,
			Key: key,
			Range: rangeHeader ?? undefined
		});

		const response = await r2Client.send(command);

		const headers = new Headers();
		if (response.ContentType) {
			headers.set('Content-Type', response.ContentType);
		} else {
			if (key.endsWith('.mp4')) headers.set('Content-Type', 'video/mp4');
			else if (key.endsWith('.webm')) headers.set('Content-Type', 'video/webm');
			else if (key.endsWith('.mov')) headers.set('Content-Type', 'video/quicktime');
			else if (key.endsWith('.jpg') || key.endsWith('.jpeg'))
				headers.set('Content-Type', 'image/jpeg');
			else if (key.endsWith('.png')) headers.set('Content-Type', 'image/png');
			else headers.set('Content-Type', 'application/octet-stream');
		}

		if (response.ContentLength !== undefined) {
			headers.set('Content-Length', String(response.ContentLength));
		}
		if (response.ContentRange) {
			headers.set('Content-Range', response.ContentRange);
		}
		headers.set('Accept-Ranges', 'bytes');
		headers.set('Cache-Control', 'public, max-age=31536000, immutable');

		const status = response.ContentRange ? 206 : 200;

		const body = response.Body;
		const stream =
			body && typeof (body as any).transformToWebStream === 'function'
				? (body as any).transformToWebStream()
				: (body as any);

		return new Response(stream, {
			status,
			headers
		});
	} catch (err: unknown) {
		const errorName = (err as { name?: string })?.name;
		if (errorName === 'NoSuchKey' || errorName === 'NotFound') {
			return new Response('Fichier média non trouvé', { status: 404 });
		}
		console.error('Erreur streaming media R2:', err);
		return new Response('Erreur serveur lors de la lecture du média', { status: 500 });
	}
};

export const HEAD: RequestHandler = async ({ params }) => {
	const rawKey = params.key;
	if (!rawKey) return new Response(null, { status: 400 });
	if (!isR2Configured || !env.R2_BUCKET_NAME) return new Response(null, { status: 503 });

	const key = decodeURIComponent(rawKey);

	try {
		const command = new HeadObjectCommand({
			Bucket: env.R2_BUCKET_NAME,
			Key: key
		});
		const response = await r2Client.send(command);

		const headers = new Headers();
		if (response.ContentType) headers.set('Content-Type', response.ContentType);
		if (response.ContentLength !== undefined) {
			headers.set('Content-Length', String(response.ContentLength));
		}
		headers.set('Accept-Ranges', 'bytes');
		headers.set('Cache-Control', 'public, max-age=31536000, immutable');

		return new Response(null, { status: 200, headers });
	} catch {
		return new Response(null, { status: 404 });
	}
};
