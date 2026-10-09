/**
 * Gadgets d'un événement côté formulaire admin : brouillon modifiable, envoi des nouvelles
 * images sur R2 au moment d'enregistrer, puis liste envoyée au serveur (JSON).
 */
import { compressImage, toUploadFilename, uploadToR2 } from './r2Upload.js';

export const MERCHANDISE_FOLDER = 'events';
export const MAX_MERCHANDISE_ITEMS = 12;
export const MAX_MERCHANDISE_IMAGES = 4;

export type MerchandiseDraftImage = {
	/** Clé R2, absente tant que l'image n'est pas envoyée */
	key: string | null;
	previewUrl: string;
	file: File | null;
};

export type MerchandiseDraft = {
	id: string;
	name: string;
	price: string;
	description: string;
	available: boolean;
	images: MerchandiseDraftImage[];
};

export function newMerchandiseDraft(): MerchandiseDraft {
	return {
		id: crypto.randomUUID(),
		name: '',
		price: '',
		description: '',
		available: true,
		images: []
	};
}

/** Gadgets enregistrés (avec l'adresse de leurs images) transformés en brouillon modifiable */
export function draftsFromStored(
	items: {
		id: string;
		name: string;
		price: number;
		description: string | null;
		available: boolean;
		imageKeys: string[];
		imageUrls: string[];
	}[]
): MerchandiseDraft[] {
	return items.map((item) => ({
		id: item.id,
		name: item.name,
		price: String(item.price),
		description: item.description ?? '',
		available: item.available,
		images: item.imageKeys.map((key, index) => ({
			key,
			previewUrl: item.imageUrls[index] ?? '',
			file: null
		}))
	}));
}

/** Libère les aperçus locaux (URL blob) d'une liste de brouillons */
export function releaseDraftPreviews(drafts: MerchandiseDraft[]): void {
	for (const image of drafts.flatMap((draft) => draft.images)) {
		if (image.file) URL.revokeObjectURL(image.previewUrl);
	}
}

/** Envoie sur R2 les images choisies mais pas encore envoyées (reprise possible après une erreur) */
export async function uploadMerchandiseImages(
	drafts: MerchandiseDraft[],
	signal: AbortSignal
): Promise<void> {
	for (const image of drafts.flatMap((draft) => draft.images)) {
		if (image.key || !image.file) continue;
		const blob = await compressImage(image.file, 1200);
		const result = await uploadToR2(blob, {
			filename: toUploadFilename(image.file.name, blob),
			folder: MERCHANDISE_FOLDER,
			signal
		});
		image.key = result.key;
	}
}

/** Liste attendue par le serveur ; le prix accepte « 2 500 » ou « 2500 » */
export function serializeMerchandise(drafts: MerchandiseDraft[]): string {
	return JSON.stringify(
		drafts.map((draft) => ({
			id: draft.id,
			name: draft.name.trim(),
			price: Number(draft.price.replace(/\s/g, '')),
			description: draft.description.trim(),
			available: draft.available,
			imageKeys: draft.images.flatMap((image) => (image.key ? [image.key] : []))
		}))
	);
}
