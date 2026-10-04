import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '$env/dynamic/private';

/**
 * Vérifie si la configuration Cloudflare R2 est présente et active
 */
export const isR2Configured = Boolean(
	env.R2_ENDPOINT &&
	env.R2_ACCESS_KEY_ID &&
	env.R2_SECRET_ACCESS_KEY &&
	env.R2_BUCKET_NAME &&
	!env.R2_ENDPOINT.includes('<account-id>')
);

/**
 * Client AWS S3 configuré pour communiquer avec l'API compatible S3 de Cloudflare R2
 */
export const r2Client = new S3Client({
	region: 'auto',
	endpoint: env.R2_ENDPOINT || 'https://placeholder.r2.cloudflarestorage.com',
	credentials: {
		accessKeyId: env.R2_ACCESS_KEY_ID || '',
		secretAccessKey: env.R2_SECRET_ACCESS_KEY || ''
	}
});

/**
 * Construit l'URL publique accessible pour un objet stocké dans le bucket R2
 */
export function getR2PublicUrl(key: string): string {
	const cleanKey = key.replace(/^\/+/, '');
	if (env.R2_PUBLIC_URL && env.R2_PUBLIC_URL.trim().length > 0) {
		const base = env.R2_PUBLIC_URL.replace(/\/+$/, '');
		return `${base}/${cleanKey}`;
	}
	if (env.R2_ENDPOINT && env.R2_BUCKET_NAME) {
		const base = env.R2_ENDPOINT.replace(/\/+$/, '');
		return `${base}/${env.R2_BUCKET_NAME}/${cleanKey}`;
	}
	return `/${cleanKey}`;
}

/**
 * Génère une URL pré-signée pour permettre l'upload direct depuis le navigateur vers R2.
 * Indispensable pour les fichiers volumineux (vidéos > 4.5 Mo) afin d'éviter le timeout
 * et la limite de payload des fonctions serverless Vercel.
 */
export async function createPresignedUploadUrl(options: {
	filename: string;
	contentType: string;
	folder?: string;
	expiresIn?: number;
}): Promise<{ uploadUrl: string; publicUrl: string; key: string }> {
	if (!isR2Configured) {
		throw new Error(
			"Cloudflare R2 n'est pas encore configuré. Renseignez R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY et R2_BUCKET_NAME dans vos variables d'environnement."
		);
	}

	const folder = options.folder ?? 'videos';
	const safeFilename = options.filename.replace(/[^a-zA-Z0-9._-]/g, '_');
	const uniqueKey = `${folder}/${crypto.randomUUID()}-${safeFilename}`;

	const command = new PutObjectCommand({
		Bucket: env.R2_BUCKET_NAME,
		Key: uniqueKey,
		ContentType: options.contentType
	});

	const uploadUrl = await getSignedUrl(r2Client, command, {
		expiresIn: options.expiresIn ?? 3600 // Valable 1 heure
	});

	const publicUrl = getR2PublicUrl(uniqueKey);

	return {
		uploadUrl,
		publicUrl,
		key: uniqueKey
	};
}

/**
 * Upload direct d'un buffer vers Cloudflare R2 côté serveur
 * Utilisé pour les images, miniatures et fichiers légers.
 */
export async function uploadBufferToR2(options: {
	buffer: Buffer | Uint8Array;
	filename: string;
	contentType: string;
	folder?: string;
}): Promise<{ publicUrl: string; key: string }> {
	if (!isR2Configured) {
		throw new Error(
			"Cloudflare R2 n'est pas encore configuré. Renseignez R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY et R2_BUCKET_NAME dans vos variables d'environnement."
		);
	}

	const folder = options.folder ?? 'uploads';
	const safeFilename = options.filename.replace(/[^a-zA-Z0-9._-]/g, '_');
	const uniqueKey = `${folder}/${crypto.randomUUID()}-${safeFilename}`;

	await r2Client.send(
		new PutObjectCommand({
			Bucket: env.R2_BUCKET_NAME,
			Key: uniqueKey,
			Body: options.buffer,
			ContentType: options.contentType
		})
	);

	const publicUrl = getR2PublicUrl(uniqueKey);

	return {
		publicUrl,
		key: uniqueKey
	};
}

/**
 * Supprime un objet du bucket Cloudflare R2
 */
export async function deleteFromR2(key: string): Promise<boolean> {
	if (!isR2Configured || !env.R2_BUCKET_NAME) return false;
	try {
		await r2Client.send(
			new DeleteObjectCommand({
				Bucket: env.R2_BUCKET_NAME,
				Key: key
			})
		);
		return true;
	} catch (err) {
		console.error('Erreur lors de la suppression sur R2:', err);
		return false;
	}
}
