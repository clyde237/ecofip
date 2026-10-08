/**
 * Identité du site pour le référencement (URL canoniques, sitemap, partages, données structurées).
 * PUBLIC_SITE_URL permet de passer à un nom de domaine personnalisé sans toucher au code.
 */
import { env } from '$env/dynamic/public';

export const SITE_URL = (env.PUBLIC_SITE_URL || 'https://ecofip.vercel.app').replace(/\/+$/, '');
export const SITE_NAME = 'ECOFIP — Cameroun pour Jésus';
export const DEFAULT_DESCRIPTION =
	'ECOFIP, Les Économes Fidèles et Prudents, mène « Cameroun pour Jésus » : des campagnes d’évangélisation, de guérison et d’actions sociales dans les 10 régions du Cameroun.';
/** Image de partage par défaut (1200 × 630) */
export const DEFAULT_SHARE_IMAGE = '/og-image.jpg';
export const LOGO_PATH = '/logo_ecofip.png';

/** URL absolue d'un chemin du site (laisse intactes les URL déjà absolues) */
export function absoluteUrl(path: string): string {
	if (/^https?:\/\//i.test(path)) return path;
	return `${SITE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

/**
 * Image utilisable par Google et les réseaux sociaux : URL absolue, ou image de partage
 * par défaut si l'image manque ou est intégrée en base64 (data:), que les robots ignorent.
 */
export function shareableImageUrl(src?: string | null): string {
	return absoluteUrl(src && !src.startsWith('data:') ? src : DEFAULT_SHARE_IMAGE);
}

/** Date au format ISO 8601 avec le fuseau du Cameroun (UTC+1), pour les données structurées */
export function toCameroonIso(date: Date | string): string {
	const instant = typeof date === 'string' ? new Date(date) : date;
	return new Date(instant.getTime() + 60 * 60 * 1000).toISOString().replace(/\.\d{3}Z$/, '+01:00');
}

/** Durée « mm:ss » ou « h:mm:ss » au format ISO 8601 (PT1M30S) */
export function toIsoDuration(duration: string): string | undefined {
	const parts = duration.split(':').map(Number);
	if (parts.length < 2 || parts.some((part) => !Number.isFinite(part))) return undefined;
	const [hours, minutes, seconds] = parts.length === 3 ? parts : [0, ...parts];
	return `PT${hours ? `${hours}H` : ''}${minutes ? `${minutes}M` : ''}${seconds}S`;
}

/**
 * Balise <script type="application/ld+json"> prête à insérer dans <svelte:head>.
 * « < » est échappé : le contenu ne peut pas refermer la balise ni injecter du HTML.
 */
export function jsonLdScriptTag(data: unknown): string {
	const json = JSON.stringify(data).replace(/</g, '\\u003c');
	return `<script type="application/ld+json">${json}</` + 'script>';
}
