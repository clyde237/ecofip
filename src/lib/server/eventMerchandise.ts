/**
 * Gadgets vendus autour d'un événement (t-shirts, polos, casquettes…) pour soutenir l'œuvre :
 * validation du formulaire admin, numéro WhatsApp de commande et conversion pour le site.
 * Les images sont envoyées sur R2 (dossier events/) avant l'enregistrement : le serveur ne reçoit
 * que leurs clés, qu'il vérifie.
 */
import type { StoredMerchandiseItem } from '$lib/server/db/schema.js';
import { deleteFromR2, getR2PublicUrl, isR2KeyInFolder } from '$lib/server/r2.js';
import type { PublicMerchandiseItem } from '$lib/design-system/types.js';

export const MERCHANDISE_R2_FOLDER = 'events';

const LIMITS = {
	items: 12,
	name: 80,
	description: 200,
	images: 4,
	maxPrice: 10_000_000
} as const;
const ITEM_ID_PATTERN = /^[A-Za-z0-9-]{1,40}$/;

type Parsed<T> = { value: T } | { error: string };

/**
 * Numéro WhatsApp saisi sous toutes ses formes (lien wa.me, +237 690 76 33 27, 690763327…)
 * ramené aux chiffres attendus par wa.me. Un numéro camerounais à 9 chiffres reçoit l'indicatif 237.
 */
export function normalizeWhatsappNumber(value: string): string | null {
	let raw = value.trim();
	if (!raw) return null;
	if (/wa\.me|whatsapp\.com/i.test(raw)) {
		try {
			const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
			raw = url.searchParams.get('phone') ?? url.pathname.replace(/^\/+/, '').split('/')[0];
		} catch {
			return null;
		}
	}
	let digits = raw.replace(/[\s.\-()]/g, '').replace(/^(\+|00)/, '');
	if (!/^\d+$/.test(digits)) return null;
	if (digits.length === 9 && /^[26]/.test(digits)) digits = `237${digits}`;
	return digits.length >= 10 && digits.length <= 15 ? digits : null;
}

function text(value: unknown, max: number): string | null {
	if (value === null || value === undefined) return '';
	if (typeof value !== 'string') return null;
	const trimmed = value.trim();
	return trimmed.length > max ? null : trimmed;
}

/** Liste de gadgets (JSON du champ « merchandise ») et numéro WhatsApp du formulaire d'événement */
export function parseMerchandiseForm(
	formData: FormData
): Parsed<{ items: StoredMerchandiseItem[]; whatsapp: string | null }> {
	const rawList = String(formData.get('merchandise') ?? '').trim();
	let list: unknown = [];
	if (rawList) {
		try {
			list = JSON.parse(rawList);
		} catch {
			return { error: 'La liste des gadgets est illisible. Rechargez la page et recommencez.' };
		}
	}
	if (!Array.isArray(list)) return { error: 'La liste des gadgets est invalide.' };
	if (list.length > LIMITS.items) {
		return { error: `Pas plus de ${LIMITS.items} gadgets par événement.` };
	}

	const items: StoredMerchandiseItem[] = [];
	for (const [index, entry] of list.entries()) {
		const position = `Gadget n°${index + 1}`;
		if (!entry || typeof entry !== 'object') return { error: `${position} : données invalides.` };
		const item = entry as Record<string, unknown>;

		const id = String(item.id ?? '');
		if (!ITEM_ID_PATTERN.test(id)) return { error: `${position} : identifiant invalide.` };
		const name = text(item.name, LIMITS.name);
		if (!name) {
			return { error: `${position} : le nom est obligatoire (${LIMITS.name} caractères maximum).` };
		}
		const price = Number(item.price);
		if (!Number.isInteger(price) || price < 0 || price > LIMITS.maxPrice) {
			return { error: `« ${name} » : le prix doit être un nombre entier de FCFA.` };
		}
		const description = text(item.description, LIMITS.description);
		if (description === null) {
			return {
				error: `« ${name} » : la description ne doit pas dépasser ${LIMITS.description} caractères.`
			};
		}
		const imageKeys = Array.isArray(item.imageKeys) ? item.imageKeys.map(String) : [];
		if (imageKeys.length > LIMITS.images) {
			return { error: `« ${name} » : ${LIMITS.images} images maximum.` };
		}
		if (!imageKeys.every((key) => isR2KeyInFolder(key, MERCHANDISE_R2_FOLDER))) {
			return { error: `« ${name} » : une image n'a pas été envoyée correctement sur R2.` };
		}

		items.push({
			id,
			name,
			price,
			description: description || null,
			imageKeys,
			available: item.available !== false
		});
	}

	const whatsappInput = String(formData.get('merchandiseWhatsapp') ?? '');
	const whatsapp = normalizeWhatsappNumber(whatsappInput);
	if (whatsappInput.trim() && !whatsapp) {
		return { error: 'Le numéro WhatsApp des commandes est invalide (ex : +237 690 76 33 27).' };
	}
	if (items.length > 0 && !whatsapp) {
		return { error: 'Indiquez le numéro WhatsApp qui recevra les commandes de gadgets.' };
	}
	return { value: { items, whatsapp } };
}

export function merchandiseImageKeys(items: StoredMerchandiseItem[] | null | undefined): string[] {
	return (items ?? []).flatMap((item) => item.imageKeys);
}

/** Images retirées d'un événement (ou de tout l'événement supprimé), effacées après la mise à jour en base */
export async function deleteMerchandiseImages(keys: string[]): Promise<void> {
	for (const key of keys) {
		if (isR2KeyInFolder(key, MERCHANDISE_R2_FOLDER)) await deleteFromR2(key);
	}
}

export function formatPrice(price: number): string {
	return `${price.toLocaleString('fr-FR')} FCFA`;
}

/** Lien WhatsApp avec un message prérempli, pour savoir d'où vient la commande */
export function whatsappOrderUrl(whatsapp: string, message: string): string {
	return `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`;
}

export function toPublicMerchandise(
	items: StoredMerchandiseItem[] | null | undefined,
	whatsapp: string | null,
	eventTitle: string
): PublicMerchandiseItem[] {
	return (items ?? []).map((item) => ({
		id: item.id,
		name: item.name,
		price: item.price,
		priceLabel: formatPrice(item.price),
		description: item.description ?? '',
		images: item.imageKeys.map(getR2PublicUrl),
		available: item.available,
		orderUrl: whatsapp
			? whatsappOrderUrl(
					whatsapp,
					`Bonjour, je souhaite commander : ${item.name} (${formatPrice(item.price)}) pour « ${eventTitle} ». Vu sur le site ECOFIP.`
				)
			: null
	}));
}
