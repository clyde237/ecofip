/**
 * Format du texte des articles, volontairement simple pour l'équipe et sûr à afficher :
 * le texte est découpé en blocs structurés, rendus par Svelte sans jamais injecter de HTML.
 *
 *   Paragraphe                 (séparés par une ligne vide)
 *   ## Intertitre
 *   - élément de liste         (ou « * élément »)
 *   > citation
 *   ![légende](https://…)      (image seule sur sa ligne)
 *   **gras**, [texte du lien](https://…), liens https:// écrits en clair
 */

export type InlineSegment = { text: string; bold?: boolean; href?: string };

export type ArticleBlock =
	| { type: 'heading'; text: string }
	| { type: 'paragraph'; segments: InlineSegment[] }
	| { type: 'quote'; segments: InlineSegment[] }
	| { type: 'list'; items: InlineSegment[][] }
	| { type: 'image'; src: string; alt: string };

const WORDS_PER_MINUTE = 200;
const IMAGE_LINE = /^!\[([^\]]*)\]\(([^)\s]+)\)$/;
// Lien Markdown [texte](url) ou URL écrite en clair
const LINK_PATTERN = /\[([^\]]+)\]\((https?:\/\/[^)\s]+|\/[^)\s]*)\)|(https?:\/\/[^\s)]+)/g;

/** Seuls les liens http(s) et les chemins du site sont acceptés (pas de javascript:, data:…) */
function safeHref(url: string): string | null {
	if (/^https?:\/\//i.test(url)) return url;
	if (url.startsWith('/') && !url.startsWith('//')) return url;
	return null;
}

function parseLinks(text: string, bold: boolean): InlineSegment[] {
	const segments: InlineSegment[] = [];
	let last = 0;
	for (const match of text.matchAll(LINK_PATTERN)) {
		const index = match.index ?? 0;
		if (index > last) segments.push({ text: text.slice(last, index), bold });
		// URL écrite en clair : la ponctuation finale (fin de phrase) ne fait pas partie du lien
		const bareUrl = match[3]?.replace(/[.,;:!?]+$/, '');
		const label = match[1] ?? bareUrl;
		const href = safeHref(match[2] ?? bareUrl);
		segments.push(href ? { text: label, bold, href } : { text: match[0], bold });
		last = index + (bareUrl ?? match[0]).length;
	}
	if (last < text.length) segments.push({ text: text.slice(last), bold });
	return segments;
}

export function parseInline(text: string): InlineSegment[] {
	// **gras** : les parties impaires du découpage sont en gras
	return text.split('**').flatMap((part, index) => (part ? parseLinks(part, index % 2 === 1) : []));
}

function safeImageSrc(url: string): string | null {
	if (/^https:\/\//i.test(url)) return url;
	if (url.startsWith('/') && !url.startsWith('//')) return url;
	return null;
}

export function parseArticleContent(content: string): ArticleBlock[] {
	const blocks: ArticleBlock[] = [];
	const paragraphs = content.replace(/\r\n?/g, '\n').split(/\n\s*\n/);

	for (const raw of paragraphs) {
		const lines = raw
			.split('\n')
			.map((line) => line.trim())
			.filter(Boolean);
		if (lines.length === 0) continue;

		let paragraphLines: string[] = [];
		let listItems: InlineSegment[][] = [];
		let quoteLines: string[] = [];

		const flush = () => {
			if (paragraphLines.length) {
				blocks.push({ type: 'paragraph', segments: parseInline(paragraphLines.join(' ')) });
				paragraphLines = [];
			}
			if (listItems.length) {
				blocks.push({ type: 'list', items: listItems });
				listItems = [];
			}
			if (quoteLines.length) {
				blocks.push({ type: 'quote', segments: parseInline(quoteLines.join(' ')) });
				quoteLines = [];
			}
		};

		for (const line of lines) {
			const image = line.match(IMAGE_LINE);
			if (line.startsWith('## ') || line.startsWith('# ')) {
				flush();
				blocks.push({ type: 'heading', text: line.replace(/^#+\s+/, '') });
			} else if (image && safeImageSrc(image[2])) {
				flush();
				blocks.push({ type: 'image', src: image[2], alt: image[1] });
			} else if (/^[-*]\s+/.test(line)) {
				if (paragraphLines.length || quoteLines.length) flush();
				listItems.push(parseInline(line.replace(/^[-*]\s+/, '')));
			} else if (line.startsWith('>')) {
				if (paragraphLines.length || listItems.length) flush();
				quoteLines.push(line.replace(/^>\s?/, ''));
			} else {
				if (listItems.length || quoteLines.length) flush();
				paragraphLines.push(line);
			}
		}
		flush();
	}

	return blocks;
}

/** Texte brut (sans balises de mise en forme), pour les extraits et le temps de lecture */
export function toPlainText(content: string): string {
	return content
		.replace(/!\[[^\]]*\]\([^)]*\)/g, '')
		.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
		.replace(/\*\*/g, '')
		.replace(/^\s*(#+|[-*]|>)\s*/gm, '')
		.replace(/\s+/g, ' ')
		.trim();
}

export function readingTimeLabel(content: string): string {
	const words = toPlainText(content).split(' ').filter(Boolean).length;
	const minutes = Math.max(1, Math.round(words / WORDS_PER_MINUTE));
	return `${minutes} min de lecture`;
}
