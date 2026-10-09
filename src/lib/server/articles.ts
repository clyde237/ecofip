/**
 * Règles communes des articles : validation du formulaire admin, adresses (slugs),
 * conversion pour l'affichage et lecture des articles publiés.
 */
import { db } from '$lib/server/db/index.js';
import { articles, events, type ArticleRecord } from '$lib/server/db/schema.js';
import { and, desc, eq, like, ne } from 'drizzle-orm';
import { deleteFromR2, formatMediaUrl, isR2KeyInFolder } from '$lib/server/r2.js';
import {
	hasArticleContent,
	isRichContent,
	normalizeRichContent,
	readingTimeLabel,
	toPlainText
} from '$lib/utils/articleContent.js';
import type { DetailedArticleItem } from '$lib/design-system/types.js';

export const ARTICLES_R2_FOLDER = 'articles';
export const DEFAULT_ARTICLE_IMAGE = '/article-bible.jpg';
const DEFAULT_AUTHOR = 'Équipe ECOFIP';

// Limites alignées sur les colonnes de la table articles
const MAX_TITLE_LENGTH = 255;
const MAX_CATEGORY_LENGTH = 100;
const MAX_AUTHOR_LENGTH = 150;
const MAX_EXCERPT_LENGTH = 500;
// Le document de l'éditeur (JSON) est plus long que le texte qu'il contient
const MAX_CONTENT_LENGTH = 300_000;
const AUTO_EXCERPT_LENGTH = 220;
const MAX_SLUG_BASE_LENGTH = 200;

type Parsed<T> = { value: T } | { error: string };

export type ArticleFields = {
	title: string;
	category: string;
	excerpt: string;
	content: string;
	authorName: string;
	authorRole: string | null;
	readTime: string;
	isPublished: boolean;
	isFeatured: boolean;
	eventId: number | null;
};

function text(formData: FormData, name: string): string {
	return String(formData.get(name) ?? '').trim();
}

/** Extrait automatique : début du texte, coupé proprement sur un mot */
function autoExcerpt(content: string): string {
	const plain = toPlainText(content);
	if (plain.length <= AUTO_EXCERPT_LENGTH) return plain;
	return `${plain.slice(0, AUTO_EXCERPT_LENGTH).replace(/\s+\S*$/, '')}…`;
}

export function parseArticleForm(formData: FormData): Parsed<ArticleFields> {
	// Un « # » tapé par habitude en début de titre n'a pas sa place dans le titre affiché
	const title = text(formData, 'title').replace(/^#+\s*/, '');
	const category = text(formData, 'category');
	const rawContent = text(formData, 'content');
	const content = isRichContent(rawContent) ? normalizeRichContent(rawContent) : rawContent;
	const excerpt = text(formData, 'excerpt');
	const authorName = text(formData, 'authorName');
	const authorRole = text(formData, 'authorRole');

	if (!title) return { error: 'Le titre est obligatoire.' };
	if (!category) return { error: 'La catégorie est obligatoire.' };
	if (content === null) {
		return { error: 'Le texte de l’article est illisible. Rechargez la page et recommencez.' };
	}
	if (!hasArticleContent(content)) return { error: 'Le texte de l’article est obligatoire.' };

	const limits: [string, number, string][] = [
		[title, MAX_TITLE_LENGTH, 'Le titre'],
		[category, MAX_CATEGORY_LENGTH, 'La catégorie'],
		[excerpt, MAX_EXCERPT_LENGTH, 'Le résumé'],
		[content, MAX_CONTENT_LENGTH, 'Le texte (mise en forme comprise)'],
		[authorName, MAX_AUTHOR_LENGTH, 'Le nom de l’auteur'],
		[authorRole, MAX_AUTHOR_LENGTH, 'La fonction de l’auteur']
	];
	for (const [value, max, label] of limits) {
		if (value.length > max) return { error: `${label} ne doit pas dépasser ${max} caractères.` };
	}

	const rawEventId = text(formData, 'eventId');
	const eventId = rawEventId ? Number(rawEventId) : null;
	if (eventId !== null && (!Number.isInteger(eventId) || eventId <= 0)) {
		return { error: 'L’événement lié est invalide.' };
	}

	const isPublished = formData.get('isPublished') === 'on';
	return {
		value: {
			title,
			category,
			excerpt: excerpt || autoExcerpt(content),
			content,
			authorName: authorName || DEFAULT_AUTHOR,
			authorRole: authorRole || null,
			readTime: readingTimeLabel(content),
			isPublished,
			// Seul un article publié peut être mis en avant sur le site
			isFeatured: isPublished && formData.get('isFeatured') === 'on',
			eventId
		}
	};
}

/** Clé R2 envoyée par le formulaire, acceptée seulement si elle vise le dossier des articles */
export function parseArticleImageKey(value: unknown): string | null {
	const key = String(value ?? '').trim();
	return isR2KeyInFolder(key, ARTICLES_R2_FOLDER) ? key : null;
}

export async function deleteArticleImage(key: string | null): Promise<void> {
	if (key && isR2KeyInFolder(key, ARTICLES_R2_FOLDER)) await deleteFromR2(key);
}

/** Clés R2 des images insérées dans le texte d'un article (dossier des articles uniquement) */
export function extractContentImageKeys(content: string): string[] {
	const pattern =
		/articles\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-[A-Za-z0-9._-]+/g;
	return Array.from(new Set(content.match(pattern) ?? [])).filter((key) =>
		isR2KeyInFolder(key, ARTICLES_R2_FOLDER)
	);
}

/** Supprime de R2 la couverture et les images du texte d'un article supprimé */
export async function deleteArticleFiles(coverKey: string | null, content: string): Promise<void> {
	await deleteArticleImage(coverKey);
	for (const key of extractContentImageKeys(content)) await deleteFromR2(key);
}

/**
 * Images retirées du texte lors d'une modification, effacées de R2 après la mise à jour.
 * Une image recopiée dans un autre article est conservée.
 */
export async function deleteRemovedContentImages(
	articleId: number,
	previousContent: string,
	newContent: string
): Promise<void> {
	if (!db) return;
	const kept = new Set(extractContentImageKeys(newContent));
	for (const key of extractContentImageKeys(previousContent)) {
		if (kept.has(key)) continue;
		const [usedElsewhere] = await db
			.select({ id: articles.id })
			.from(articles)
			.where(and(ne(articles.id, articleId), like(articles.content, `%${key}%`)))
			.limit(1);
		if (!usedElsewhere) await deleteFromR2(key);
	}
}

/** Événements proposés dans le formulaire d'article (les plus récents d'abord) */
export async function loadEventChoices(): Promise<
	{ id: number; title: string; dateLabel: string; isPublished: boolean }[]
> {
	if (!db) return [];
	const rows = await db
		.select({
			id: events.id,
			title: events.title,
			dateDay: events.dateDay,
			dateMonthYear: events.dateMonthYear,
			isPublished: events.isPublished
		})
		.from(events)
		.orderBy(desc(events.startDate), desc(events.id));
	return rows.map((row) => ({
		id: row.id,
		title: row.title,
		dateLabel: [row.dateDay, row.dateMonthYear].filter(Boolean).join(' '),
		isPublished: row.isPublished
	}));
}

/** L'événement choisi existe-t-il encore ? */
export async function eventExists(eventId: number): Promise<boolean> {
	if (!db) return false;
	const [row] = await db
		.select({ id: events.id })
		.from(events)
		.where(eq(events.id, eventId))
		.limit(1);
	return Boolean(row);
}

/** Articles publiés liés à un événement, du plus récent au plus ancien */
export async function loadPublishedArticlesForEvent(eventId: number): Promise<ArticleRecord[]> {
	if (!db) return [];
	return db
		.select()
		.from(articles)
		.where(and(eq(articles.isPublished, true), eq(articles.eventId, eventId)))
		.orderBy(desc(articles.publishedAt), desc(articles.id));
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

/** Adresse d'article unique : « titre », puis « titre-2 », etc. */
export async function createUniqueArticleSlug(title: string): Promise<string> {
	const base = slugify(title) || 'article';
	if (!db) return base;
	const taken = new Set(
		(
			await db
				.select({ slug: articles.slug })
				.from(articles)
				.where(like(articles.slug, `${base}%`))
		).map((row) => row.slug)
	);
	if (!taken.has(base)) return base;
	let suffix = 2;
	while (taken.has(`${base}-${suffix}`)) suffix++;
	return `${base}-${suffix}`;
}

export function formatArticleDate(value: Date | null): string {
	if (!value) return '';
	return value.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

/** Article tel qu'affiché sur le site */
export function toPublicArticle(row: ArticleRecord): DetailedArticleItem {
	return {
		id: String(row.id),
		title: row.title,
		category: row.category,
		categorySlug: slugify(row.category),
		href: `/actualites/${row.slug}`,
		date: formatArticleDate(row.publishedAt ?? row.createdAt),
		readTime: row.readTime || readingTimeLabel(row.content),
		image: formatMediaUrl(row.imageUrl) || DEFAULT_ARTICLE_IMAGE,
		imageAlt: row.title,
		authorName: row.authorName || DEFAULT_AUTHOR,
		authorRole: row.authorRole ?? undefined,
		excerpt: row.excerpt || autoExcerpt(row.content),
		isFeatured: row.isFeatured
	};
}

/** Articles publiés, du plus récent au plus ancien */
export async function loadPublishedArticles(limit?: number): Promise<ArticleRecord[]> {
	if (!db) return [];
	const query = db
		.select()
		.from(articles)
		.where(eq(articles.isPublished, true))
		.orderBy(desc(articles.publishedAt), desc(articles.id));
	return limit ? query.limit(limit) : query;
}

export async function loadPublishedArticleBySlug(slug: string): Promise<ArticleRecord | null> {
	if (!db) return null;
	const [row] = await db
		.select()
		.from(articles)
		.where(and(eq(articles.slug, slug), eq(articles.isPublished, true)))
		.limit(1);
	return row ?? null;
}

/** Autres articles publiés (hors article courant) */
export async function loadOtherPublishedArticles(excludeId: number): Promise<ArticleRecord[]> {
	if (!db) return [];
	return db
		.select()
		.from(articles)
		.where(and(eq(articles.isPublished, true), ne(articles.id, excludeId)))
		.orderBy(desc(articles.publishedAt), desc(articles.id));
}

/** Catégories des articles publiés, avec leur nombre d'articles */
export function countCategories(
	rows: Pick<ArticleRecord, 'category'>[]
): { label: string; slug: string; count: number }[] {
	const counts = new Map<string, { label: string; slug: string; count: number }>();
	for (const row of rows) {
		const slug = slugify(row.category);
		const entry = counts.get(slug) ?? { label: row.category, slug, count: 0 };
		entry.count++;
		counts.set(slug, entry);
	}
	return Array.from(counts.values()).sort((a, b) => b.count - a.count);
}
