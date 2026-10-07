/**
 * Upload de fichiers vers Cloudflare R2 depuis le navigateur (espace admin).
 * - Fichiers légers : envoi via /api/upload (le serveur transmet à R2).
 * - Fichiers lourds (vidéos, photos HD) : URL pré-signée via /api/upload-url, puis envoi direct
 *   du navigateur vers R2, pour contourner la limite de 4,5 Mo des fonctions Vercel.
 */

export interface R2UploadResult {
	url: string;
	key: string;
}

export type UploadProgressHandler = (percent: number) => void;

// Marge sous la limite de 4,5 Mo du corps de requête des fonctions serverless Vercel
const MAX_DIRECT_UPLOAD_BYTES = 4 * 1024 * 1024;

export async function uploadToR2(
	file: Blob,
	options: { filename: string; folder: string; onProgress?: UploadProgressHandler }
): Promise<R2UploadResult> {
	const contentType = file.type || 'application/octet-stream';

	if (file.size <= MAX_DIRECT_UPLOAD_BYTES) {
		const formData = new FormData();
		formData.append('file', file, options.filename);
		formData.append('folder', options.folder);
		options.onProgress?.(30);

		const response = await fetch('/api/upload', { method: 'POST', body: formData });
		const result = await response.json().catch(() => ({}));
		if (!response.ok || !result.success) {
			throw new Error(result.error || 'Échec de l’envoi vers Cloudflare R2.');
		}
		options.onProgress?.(100);
		return { url: result.url, key: result.key };
	}

	const presignResponse = await fetch('/api/upload-url', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ filename: options.filename, contentType, folder: options.folder })
	});
	const presign = await presignResponse.json().catch(() => ({}));
	if (!presignResponse.ok || !presign.success) {
		throw new Error(presign.error || 'Impossible d’obtenir l’autorisation d’envoi Cloudflare R2.');
	}

	await new Promise<void>((resolve, reject) => {
		const xhr = new XMLHttpRequest();
		xhr.open('PUT', presign.uploadUrl, true);
		xhr.setRequestHeader('Content-Type', contentType);
		xhr.upload.onprogress = (event) => {
			if (event.lengthComputable) {
				options.onProgress?.(Math.round((event.loaded / event.total) * 100));
			}
		};
		xhr.onload = () =>
			xhr.status >= 200 && xhr.status < 300
				? resolve()
				: reject(new Error(`Échec de l’envoi vers Cloudflare R2 (HTTP ${xhr.status}).`));
		xhr.onerror = () => reject(new Error('Erreur réseau pendant l’envoi vers Cloudflare R2.'));
		xhr.send(file);
	});

	return { url: presign.publicUrl, key: presign.key };
}

/**
 * Réduit une photo avant envoi (côté le plus long limité à maxDimension, JPEG).
 * Garde l'original si le navigateur ne sait pas la décoder ou si la version réduite est plus lourde.
 */
export async function compressImage(
	file: File,
	maxDimension = 2000,
	quality = 0.85
): Promise<Blob> {
	try {
		const bitmap = await createImageBitmap(file);
		const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
		const width = Math.round(bitmap.width * scale);
		const height = Math.round(bitmap.height * scale);

		const canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;
		const context = canvas.getContext('2d');
		if (!context) return file;
		context.drawImage(bitmap, 0, 0, width, height);
		bitmap.close();

		const blob = await new Promise<Blob | null>((resolve) =>
			canvas.toBlob(resolve, 'image/jpeg', quality)
		);
		return blob && blob.size < file.size ? blob : file;
	} catch {
		return file;
	}
}

/** Nom de fichier lisible à partir du nom d'origine (extension remplacée si besoin). */
export function toUploadFilename(originalName: string, blob: Blob): string {
	const base = originalName.replace(/\.[^/.]+$/, '') || 'media';
	const extension = blob.type === 'image/jpeg' ? 'jpg' : (originalName.split('.').pop() ?? 'bin');
	return `${base}.${extension}`;
}
