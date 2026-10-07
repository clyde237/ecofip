import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { createPresignedUploadUrl, isR2Configured } from '$lib/server/r2.js';

export const POST: RequestHandler = async ({ request, locals }) => {
	// 1. Contrôler les autorisations d'administration
	if (!locals.admin) {
		return json(
			{ error: 'Non autorisé. Veuillez vous connecter à l’espace administration.' },
			{ status: 401 }
		);
	}

	// 2. Vérifier si R2 est configuré
	if (!isR2Configured) {
		return json(
			{
				error:
					'Cloudflare R2 n’est pas configuré. Veuillez renseigner R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY et R2_BUCKET_NAME.',
				notConfigured: true
			},
			{ status: 503 }
		);
	}

	try {
		const body = await request.json();
		const filename = String(body.filename ?? '').trim();
		const contentType = String(body.contentType ?? 'application/octet-stream').trim();
		const folder = String(body.folder ?? 'videos').trim();

		if (!filename) {
			return json({ error: 'Le nom du fichier est obligatoire.' }, { status: 400 });
		}

		// Validation du type MIME (vidéos et images autorisées)
		const allowedPrefixes = ['video/', 'image/'];
		const isAllowed = allowedPrefixes.some((prefix) => contentType.startsWith(prefix));
		if (!isAllowed) {
			return json(
				{ error: 'Format de fichier non supporté. Veuillez sélectionner une vidéo ou une image.' },
				{ status: 400 }
			);
		}

		const allowedFolders = [
			'thumbnails',
			'videos',
			'uploads',
			'team',
			'gallery',
			'events',
			'articles'
		];
		const targetFolder = allowedFolders.includes(folder) ? folder : 'videos';

		const result = await createPresignedUploadUrl({
			filename,
			contentType,
			folder: targetFolder,
			expiresIn: 3600 // 1 heure
		});

		return json({
			success: true,
			uploadUrl: result.uploadUrl,
			publicUrl: result.publicUrl,
			key: result.key
		});
	} catch (err: unknown) {
		console.error('Erreur génération upload URL R2:', err);
		const message = err instanceof Error ? err.message : 'Erreur interne du serveur';
		return json({ error: message }, { status: 500 });
	}
};
