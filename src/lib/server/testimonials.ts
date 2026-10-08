/**
 * Règles communes des témoignages : validation des formulaires (admin et visiteurs),
 * lecture des témoignages publiés et nettoyage des fichiers Cloudflare R2.
 */
import { db } from '$lib/server/db/index.js';
import { testimonials } from '$lib/server/db/schema.js';
import { and, desc, eq, sql } from 'drizzle-orm';
import { deleteFromR2, formatMediaUrl, getR2PublicUrl, isR2KeyInFolder } from '$lib/server/r2.js';
import type { PublishedTestimonial } from '$lib/design-system/types.js';

export const TESTIMONIALS_R2_FOLDER = 'testimonials';

// Limites alignées sur les colonnes de la table testimonials
const MAX_NAME_LENGTH = 150;
const MAX_ROLE_LENGTH = 150;
const MAX_CITY_LENGTH = 100;
const MAX_CONTACT_LENGTH = 150;
const MAX_CONTENT_LENGTH = 3000;
const MIN_VISITOR_CONTENT_LENGTH = 30;
// Un humain met plus de quelques secondes à écrire un témoignage : en dessous, c'est un robot
const MIN_VISITOR_FILL_TIME_MS = 4000;
const DURATION_PATTERN = /^\d{1,3}:\d{2}(:\d{2})?$/;

type Parsed<T> = { value: T } | { error: string };

function text(formData: FormData, name: string): string {
	return String(formData.get(name) ?? '').trim();
}

function checkLength(value: string, max: number, label: string): string | null {
	return value.length > max ? `${label} ne doit pas dépasser ${max} caractères.` : null;
}

type AuthorFields = { authorName: string; authorRole: string | null; authorCity: string | null };

function parseAuthor(formData: FormData): Parsed<AuthorFields> {
	const authorName = text(formData, 'authorName');
	const authorRole = text(formData, 'authorRole');
	const authorCity = text(formData, 'authorCity');
	if (!authorName) return { error: 'Le nom est obligatoire.' };
	const tooLong =
		checkLength(authorName, MAX_NAME_LENGTH, 'Le nom') ??
		checkLength(authorRole, MAX_ROLE_LENGTH, 'La fonction') ??
		checkLength(authorCity, MAX_CITY_LENGTH, 'La ville');
	if (tooLong) return { error: tooLong };
	return { value: { authorName, authorRole: authorRole || null, authorCity: authorCity || null } };
}

/** Clé R2 envoyée par le formulaire, acceptée seulement si elle vise le dossier des témoignages */
export function parseTestimonialKey(value: unknown): string | null {
	const key = String(value ?? '').trim();
	return isR2KeyInFolder(key, TESTIMONIALS_R2_FOLDER) ? key : null;
}

export type AdminTestimonialFields = AuthorFields & {
	type: 'text' | 'video';
	content: string | null;
	duration: string | null;
	isApproved: boolean;
};

/**
 * Champs saisis par l'admin (création et modification). Les fichiers (photo, vidéo, affiche)
 * sont traités à part, via leurs clés R2.
 */
export function parseAdminTestimonial(
	formData: FormData,
	type: 'text' | 'video'
): Parsed<AdminTestimonialFields> {
	const author = parseAuthor(formData);
	if ('error' in author) return author;

	const content = text(formData, 'content');
	if (type === 'text' && !content) return { error: 'Le texte du témoignage est obligatoire.' };
	const tooLong = checkLength(content, MAX_CONTENT_LENGTH, 'Le texte');
	if (tooLong) return { error: tooLong };

	const duration = text(formData, 'duration');
	if (type === 'video' && duration && !DURATION_PATTERN.test(duration)) {
		return { error: 'La durée doit être au format mm:ss (ex: 03:45).' };
	}

	return {
		value: {
			...author.value,
			type,
			content: content || null,
			duration: type === 'video' ? duration || null : null,
			isApproved: formData.get('isApproved') === 'on'
		}
	};
}

export type VisitorSubmission = AuthorFields & { content: string; contactInfo: string | null };

/**
 * Témoignage écrit envoyé depuis le site. Deux protections simples contre les robots :
 * un champ caché qu'un humain ne remplit pas, et un délai minimal de saisie.
 */
export function parseVisitorSubmission(
	formData: FormData
): Parsed<VisitorSubmission> | { spam: true } {
	if (text(formData, 'website')) return { spam: true };
	const startedAt = Number(formData.get('startedAt'));
	if (!Number.isFinite(startedAt) || Date.now() - startedAt < MIN_VISITOR_FILL_TIME_MS) {
		return { spam: true };
	}

	const author = parseAuthor(formData);
	if ('error' in author) return author;

	const content = text(formData, 'content');
	if (content.length < MIN_VISITOR_CONTENT_LENGTH) {
		return {
			error: `Racontez-nous votre témoignage en quelques phrases (${MIN_VISITOR_CONTENT_LENGTH} caractères minimum).`
		};
	}
	const contactInfo = text(formData, 'contactInfo');
	const tooLong =
		checkLength(content, MAX_CONTENT_LENGTH, 'Le témoignage') ??
		checkLength(contactInfo, MAX_CONTACT_LENGTH, 'Le contact');
	if (tooLong) return { error: tooLong };
	if (formData.get('consent') !== 'on') {
		return { error: 'Merci d’accepter la publication de votre témoignage sur le site.' };
	}

	return { value: { ...author.value, content, contactInfo: contactInfo || null } };
}

/** URL publique d'un fichier du dossier des témoignages */
export function testimonialFileUrl(key: string): string {
	return getR2PublicUrl(key);
}

/** Supprime des fichiers de R2 ; seules les clés du dossier des témoignages sont acceptées */
export async function deleteTestimonialFiles(keys: (string | null)[]): Promise<void> {
	for (const key of keys) {
		if (key && isR2KeyInFolder(key, TESTIMONIALS_R2_FOLDER)) await deleteFromR2(key);
	}
}

function formatPublishedDate(value: Date | null): string {
	if (!value) return '';
	return value.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
}

/**
 * Témoignages publiés, du plus récemment publié au plus ancien.
 * type : limiter aux écrits ou aux vidéos ; limit : nombre maximal.
 */
export async function loadPublishedTestimonials(
	options: { type?: 'text' | 'video'; limit?: number } = {}
): Promise<PublishedTestimonial[]> {
	if (!db) return [];

	const conditions = [eq(testimonials.isApproved, true)];
	if (options.type) conditions.push(eq(testimonials.type, options.type));

	const query = db
		.select()
		.from(testimonials)
		.where(and(...conditions))
		.orderBy(
			desc(sql`coalesce(${testimonials.approvedAt}, ${testimonials.submittedAt})`),
			desc(testimonials.id)
		);
	const rows = options.limit ? await query.limit(options.limit) : await query;

	return rows.map((row) => ({
		id: String(row.id),
		type: row.type === 'video' ? 'video' : 'text',
		name: row.authorName,
		role: row.authorRole ?? '',
		city: row.authorCity ?? '',
		quote: row.content ?? '',
		avatar: formatMediaUrl(row.avatarUrl) || null,
		videoUrl: row.videoUrl ? formatMediaUrl(row.videoUrl) : null,
		posterUrl: formatMediaUrl(row.posterUrl) || formatMediaUrl(row.avatarUrl) || null,
		duration: row.duration ?? '',
		publishedLabel: formatPublishedDate(row.approvedAt ?? row.submittedAt)
	}));
}
