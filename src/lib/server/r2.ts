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

export const isR2PublicDomainConfigured = Boolean(
	env.R2_PUBLIC_URL &&
	env.R2_PUBLIC_URL.trim().length > 0 &&
	!env.R2_PUBLIC_URL.includes('<votre-domaine-r2>')
);

/**
 * Construit l'URL accessible pour un objet stocké dans le bucket R2.
 * Si un domaine public (R2_PUBLIC_URL / r2.dev) est configuré, l'URL publique directe du CDN est utilisée.
 * Sinon, l'URL bascule automatiquement sur la route interne /api/media/[...key]
 * qui stream le fichier avec gestion complète des en-têtes HTTP Range.
 */
export function getR2PublicUrl(key: string): string {
	const cleanKey = key.replace(/^\/+/, '');
	const encodedKey = cleanKey
		.split('/')
		.map((segment) => encodeURIComponent(decodeURIComponent(segment)))
		.join('/');

	if (isR2PublicDomainConfigured && env.R2_PUBLIC_URL) {
		const base = env.R2_PUBLIC_URL.replace(/\/+$/, '');
		return `${base}/${encodedKey}`;
	}
	return `/api/media/${encodedKey}`;
}

/**
 * Normalise une URL média. Si l'URL enregistrée est une URL interne S3 brute
 * (ex: https://...r2.cloudflarestorage.com/bucket/key), elle est convertie
 * automatiquement en URL lisible par le navigateur.
 */
export function formatMediaUrl(url: string | null | undefined): string {
	if (!url) return '';
	if (url.includes('.r2.cloudflarestorage.com')) {
		const match = url.match(/\.r2\.cloudflarestorage\.com\/[^/]+\/(.+)$/);
		if (match && match[1]) {
			return getR2PublicUrl(match[1]);
		}
	}
	return url;
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
 * Vérifie qu'une clé a le format généré par /api/upload et /api/upload-url pour un dossier :
 * <dossier>/<uuid>-<nom assaini>. Sert à refuser toute clé envoyée par un formulaire modifié
 * qui viserait un autre fichier du bucket.
 */
export function isR2KeyInFolder(key: string, folder: string): boolean {
	const uuid = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';
	return new RegExp(`^${folder}/${uuid}-[A-Za-z0-9._-]+$`).test(key);
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
