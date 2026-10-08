/**
 * Règles communes des articles : validation du formulaire admin, adresses (slugs),
 * conversion pour l'affichage et lecture des articles publiés.
 */
import { db } from '$lib/server/db/index.js';
import { articles, type ArticleRecord } from '$lib/server/db/schema.js';
import { and, desc, eq, like, ne } from 'drizzle-orm';
import { deleteFromR2, formatMediaUrl, isR2KeyInFolder } from '$lib/server/r2.js';
import { readingTimeLabel, toPlainText } from '$lib/utils/articleContent.js';
import type { DetailedArticleItem } from '$lib/design-system/types.js';

export const ARTICLES_R2_FOLDER = 'articles';
export const DEFAULT_ARTICLE_IMAGE = '/article-bible.jpg';
const DEFAULT_AUTHOR = 'Équipe ECOFIP';

// Limites alignées sur les colonnes de la table articles
const MAX_TITLE_LENGTH = 255;
const MAX_CATEGORY_LENGTH = 100;
const MAX_AUTHOR_LENGTH = 150;
const MAX_EXCERPT_LENGTH = 500;
const MAX_CONTENT_LENGTH = 60_000;
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
	const title = text(formData, 'title');
	const category = text(formData, 'category');
	const content = text(formData, 'content');
	const excerpt = text(formData, 'excerpt');
	const authorName = text(formData, 'authorName');
	const authorRole = text(formData, 'authorRole');

	if (!title) return { error: 'Le titre est obligatoire.' };
	if (!category) return { error: 'La catégorie est obligatoire.' };
	if (!content) return { error: 'Le texte de l’article est obligatoire.' };

	const limits: [string, number, string][] = [
		[title, MAX_TITLE_LENGTH, 'Le titre'],
		[category, MAX_CATEGORY_LENGTH, 'La catégorie'],
		[excerpt, MAX_EXCERPT_LENGTH, 'Le résumé'],
		[content, MAX_CONTENT_LENGTH, 'Le texte'],
		[authorName, MAX_AUTHOR_LENGTH, 'Le nom de l’auteur'],
		[authorRole, MAX_AUTHOR_LENGTH, 'La fonction de l’auteur']
	];
	for (const [value, max, label] of limits) {
		if (value.length > max) return { error: `${label} ne doit pas dépasser ${max} caractères.` };
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
			isFeatured: isPublished && formData.get('isFeatured') === 'on'
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
