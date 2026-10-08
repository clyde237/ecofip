/**
 * Règles communes des prédications vidéo : validation du formulaire admin, adresses (slugs),
 * conversion pour l'affichage, lecture des prédications publiées et nettoyage des fichiers R2.
 */
import { db } from '$lib/server/db/index.js';
import { sermons, type SermonRecord } from '$lib/server/db/schema.js';
import { and, desc, eq, like, ne } from 'drizzle-orm';
import { deleteFromR2, formatMediaUrl, isR2KeyInFolder } from '$lib/server/r2.js';
import type { PublicSermon } from '$lib/design-system/types.js';
import { normalizeYoutubeUrl } from '$lib/utils/youtube.js';

export const SERMONS_R2_FOLDER = 'sermons';

// Limites alignées sur les colonnes de la table sermons
const LIMITS = {
	title: 200,
	preacher: 150,
	scripture: 120,
	series: 100,
	description: 1000
} as const;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DURATION_PATTERN = /^\d{1,3}:\d{2}(:\d{2})?$/;
const MAX_SLUG_BASE_LENGTH = 200;

type Parsed<T> = { value: T } | { error: string };

export type SermonFields = {
	title: string;
	preacher: string | null;
	scripture: string | null;
	series: string | null;
	description: string | null;
	preachedOn: string | null;
	duration: string | null;
	fullVideoUrl: string | null;
	isPublished: boolean;
};

function text(formData: FormData, name: string): string {
	return String(formData.get(name) ?? '').trim();
}

export function parseSermonForm(formData: FormData): Parsed<SermonFields> {
	const values = {
		title: text(formData, 'title'),
		preacher: text(formData, 'preacher'),
		scripture: text(formData, 'scripture'),
		series: text(formData, 'series'),
		description: text(formData, 'description')
	};
	if (!values.title) return { error: 'Le titre est obligatoire.' };

	const labels: Record<keyof typeof LIMITS, string> = {
		title: 'Le titre',
		preacher: 'Le nom du prédicateur',
		scripture: 'La référence biblique',
		series: 'La série',
		description: 'La description'
	};
	for (const key of Object.keys(LIMITS) as (keyof typeof LIMITS)[]) {
		if (values[key].length > LIMITS[key]) {
			return { error: `${labels[key]} ne doit pas dépasser ${LIMITS[key]} caractères.` };
		}
	}

	const preachedOn = text(formData, 'preachedOn');
	if (preachedOn && (!DATE_PATTERN.test(preachedOn) || Number.isNaN(Date.parse(preachedOn)))) {
		return { error: 'La date de la prédication est invalide.' };
	}
	const duration = text(formData, 'duration');
	if (duration && !DURATION_PATTERN.test(duration)) {
		return { error: 'La durée doit être au format mm:ss (ex: 01:30).' };
	}
	const fullVideoInput = text(formData, 'fullVideoUrl');
	const fullVideoUrl = fullVideoInput ? normalizeYoutubeUrl(fullVideoInput) : null;
	if (fullVideoInput && !fullVideoUrl) {
		return {
			error:
				'Le lien de la prédication complète doit être une vidéo YouTube (ex : https://www.youtube.com/watch?v=…).'
		};
	}

	return {
		value: {
			title: values.title,
			preacher: values.preacher || null,
			scripture: values.scripture || null,
			series: values.series || null,
			description: values.description || null,
			preachedOn: preachedOn || null,
			duration: duration || null,
			fullVideoUrl,
			isPublished: formData.get('isPublished') === 'on'
		}
	};
}

/** Clé R2 envoyée par le formulaire, acceptée seulement si elle vise le dossier des prédications */
export function parseSermonKey(value: unknown): string | null {
	const key = String(value ?? '').trim();
	return isR2KeyInFolder(key, SERMONS_R2_FOLDER) ? key : null;
}

export async function deleteSermonFiles(keys: (string | null)[]): Promise<void> {
	for (const key of keys) {
		if (key && isR2KeyInFolder(key, SERMONS_R2_FOLDER)) await deleteFromR2(key);
	}
}

export function slugify(value: string): string {
	return value
		.toLowerCase()
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)+/g, '')
		.slice(0, MAX_SLUG_BASE_LENGTH);
}

/** Adresse unique : « titre », puis « titre-2 », etc. */
export async function createUniqueSermonSlug(title: string): Promise<string> {
	const base = slugify(title) || 'predication';
	if (!db) return base;
	const taken = new Set(
		(
			await db
				.select({ slug: sermons.slug })
				.from(sermons)
				.where(like(sermons.slug, `${base}%`))
		).map((row) => row.slug)
	);
	if (!taken.has(base)) return base;
	let suffix = 2;
	while (taken.has(`${base}-${suffix}`)) suffix++;
	return `${base}-${suffix}`;
}

function formatDate(row: SermonRecord): string {
	if (row.preachedOn) {
		return new Date(`${row.preachedOn}T12:00:00Z`).toLocaleDateString('fr-FR', {
			day: 'numeric',
			month: 'long',
			year: 'numeric',
			timeZone: 'UTC'
		});
	}
	const published = row.publishedAt ?? row.createdAt;
	return published.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function toPublicSermon(row: SermonRecord): PublicSermon {
	return {
		id: String(row.id),
		slug: row.slug,
		href: `/predications/${row.slug}`,
		title: row.title,
		preacher: row.preacher ?? '',
		scripture: row.scripture ?? '',
		series: row.series ?? '',
		seriesSlug: row.series ? slugify(row.series) : '',
		description: row.description ?? '',
		videoUrl: formatMediaUrl(row.videoUrl),
		posterUrl: formatMediaUrl(row.posterUrl) || null,
		duration: row.duration ?? '',
		dateLabel: formatDate(row),
		fullVideoUrl: row.fullVideoUrl
	};
}

/** Prédications publiées, de la plus récente à la plus ancienne */
export async function loadPublishedSermons(limit?: number): Promise<SermonRecord[]> {
	if (!db) return [];
	const query = db
		.select()
		.from(sermons)
		.where(eq(sermons.isPublished, true))
		.orderBy(desc(sermons.publishedAt), desc(sermons.id));
	return limit ? query.limit(limit) : query;
}

export async function loadPublishedSermonBySlug(slug: string): Promise<SermonRecord | null> {
	if (!db) return null;
	const [row] = await db
		.select()
		.from(sermons)
		.where(and(eq(sermons.slug, slug), eq(sermons.isPublished, true)))
		.limit(1);
	return row ?? null;
}

export async function loadOtherPublishedSermons(excludeId: number): Promise<SermonRecord[]> {
	if (!db) return [];
	return db
		.select()
		.from(sermons)
		.where(and(eq(sermons.isPublished, true), ne(sermons.id, excludeId)))
		.orderBy(desc(sermons.publishedAt), desc(sermons.id));
}
