import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { uploadBufferToR2, isR2Configured } from '$lib/server/r2.js';

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
		const formData = await request.formData();
		const file = formData.get('file') as File | null;
		const folder = String(formData.get('folder') ?? 'uploads');

		if (!file || typeof file === 'string') {
			return json({ error: 'Aucun fichier valide fourni.' }, { status: 400 });
		}

		// Validation du type MIME
		const contentType = file.type || 'application/octet-stream';
		const allowedPrefixes = ['video/', 'image/'];
		const isAllowed = allowedPrefixes.some((prefix) => contentType.startsWith(prefix));
		if (!isAllowed) {
			return json(
				{ error: 'Format de fichier non supporté. Veuillez sélectionner une vidéo ou une image.' },
				{ status: 400 }
			);
		}

		// Limiter la taille pour l'upload direct serveur à 4 Mo (pour respecter le payload serverless Vercel)
		// Pour les fichiers plus gros, le frontend utilise /api/upload-url (URL pré-signée)
		const MAX_SERVER_UPLOAD_SIZE = 4.5 * 1024 * 1024;
		if (file.size > MAX_SERVER_UPLOAD_SIZE) {
			return json(
				{
					error:
						'Le fichier dépasse 4.5 Mo pour l’upload direct par le serveur. Veuillez utiliser le mode URL pré-signée direct vers Cloudflare R2.'
				},
				{ status: 413 }
			);
		}

		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		const allowedFolders = ['thumbnails', 'videos', 'uploads', 'team', 'events', 'articles'];
		const targetFolder = allowedFolders.includes(folder) ? folder : 'uploads';

		const result = await uploadBufferToR2({
			buffer,
			filename: file.name,
			contentType,
			folder: targetFolder
		});

		return json({
			success: true,
			url: result.publicUrl,
			key: result.key
		});
	} catch (err: unknown) {
		console.error('Erreur upload direct R2:', err);
		const message = err instanceof Error ? err.message : 'Erreur interne du serveur';
		return json({ error: message }, { status: 500 });
	}
};
