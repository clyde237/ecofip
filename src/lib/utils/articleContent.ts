/**
 * Texte des articles, sûr à afficher : il est converti en blocs structurés, rendus par Svelte
 * sans jamais injecter de HTML.
 *
 * Deux formats sont lus :
 *  - le document de l'éditeur visuel (JSON TipTap), format actuel. Il est nettoyé à
 *    l'enregistrement (sanitizeArticleDoc) : seuls les éléments ci-dessous sont gardés ;
 *  - l'ancien format texte des premiers articles : paragraphes séparés par une ligne vide,
 *    « ## » / « ### » intertitres, « - » ou « 1. » listes, « > » citation, ![légende](url),
 *    **gras**, *italique*, [texte](url).
 */

export type InlineSegment = {
	text: string;
	bold?: boolean;
	italic?: boolean;
	underline?: boolean;
	href?: string;
	/** Retour à la ligne dans le paragraphe */
	lineBreak?: boolean;
};

export type ListBlock = { type: 'list'; ordered: boolean; items: ListItem[] };
export type ListItem = { segments: InlineSegment[]; children: ListBlock[] };

export type ArticleBlock =
	| { type: 'heading'; level: 2 | 3; text: string }
	| { type: 'paragraph'; segments: InlineSegment[] }
	| { type: 'quote'; segments: InlineSegment[] }
	| ListBlock
	| { type: 'image'; src: string; alt: string }
	| { type: 'divider' };

/** Nœud du document de l'éditeur (sous-ensemble du format ProseMirror / TipTap) */
export type DocMark = { type: string; attrs?: Record<string, unknown> };
export type DocNode = {
	type: string;
	attrs?: Record<string, unknown>;
	content?: DocNode[];
	text?: string;
	marks?: DocMark[];
};

const WORDS_PER_MINUTE = 200;
const MAX_TEXT_LENGTH = 20_000;
const MAX_ALT_LENGTH = 300;
const MAX_LIST_DEPTH = 3;
const IMAGE_LINE = /^!\[([^\]]*)\]\(([^)\s]+)\)$/;
// Lien Markdown [texte](url) ou URL écrite en clair
const LINK_PATTERN = /\[([^\]]+)\]\((https?:\/\/[^)\s]+|\/[^)\s]*)\)|(https?:\/\/[^\s)]+)/g;

/** Seuls les liens http(s) et les chemins du site sont acceptés (pas de javascript:, data:…) */
export function safeHref(url: string): string | null {
	const value = url.trim();
	if (/^https?:\/\/[^\s]+$/i.test(value)) return value;
	if (value.startsWith('/') && !value.startsWith('//') && !/\s/.test(value)) return value;
	return null;
}

export function safeImageSrc(url: string): string | null {
	const value = url.trim();
	if (/^https:\/\/[^\s]+$/i.test(value)) return value;
	if (value.startsWith('/') && !value.startsWith('//') && !/\s/.test(value)) return value;
	return null;
}

export function isRichContent(content: string): boolean {
	return content.trimStart().startsWith('{"type":"doc"');
}

// ==========================================
// DOCUMENT DE L'ÉDITEUR VISUEL
// ==========================================

function isNode(value: unknown): value is DocNode {
	return Boolean(value) && typeof value === 'object' && typeof (value as DocNode).type === 'string';
}

function children(node: DocNode): DocNode[] {
	return Array.isArray(node.content) ? node.content.filter(isNode) : [];
}

function sanitizeMarks(marks: unknown): DocMark[] | undefined {
	if (!Array.isArray(marks)) return undefined;
	const kept: DocMark[] = [];
	for (const mark of marks) {
		if (!mark || typeof mark !== 'object') continue;
		const type = (mark as DocMark).type;
		if (type === 'bold' || type === 'italic' || type === 'underline') {
			kept.push({ type });
		} else if (type === 'link') {
			const href = safeHref(String((mark as DocMark).attrs?.href ?? ''));
			if (href) kept.push({ type: 'link', attrs: { href } });
		}
	}
	return kept.length ? kept : undefined;
}

function sanitizeInline(nodes: DocNode[]): DocNode[] {
	const kept: DocNode[] = [];
	for (const node of nodes) {
		if (node.type === 'text' && typeof node.text === 'string' && node.text) {
			const marks = sanitizeMarks(node.marks);
			kept.push({
				type: 'text',
				text: node.text.slice(0, MAX_TEXT_LENGTH),
				...(marks ? { marks } : {})
			});
		} else if (node.type === 'hardBreak') {
			kept.push({ type: 'hardBreak' });
		}
	}
	return kept;
}

function sanitizeTextBlock(node: DocNode): DocNode {
	const content = sanitizeInline(children(node));
	return content.length ? { type: 'paragraph', content } : { type: 'paragraph' };
}

function sanitizeList(node: DocNode, depth: number): DocNode | null {
	const items: DocNode[] = [];
	for (const item of children(node)) {
		if (item.type !== 'listItem') continue;
		const content: DocNode[] = [];
		for (const child of children(item)) {
			if (child.type === 'paragraph' || child.type === 'heading') {
				content.push(sanitizeTextBlock(child));
			} else if (
				(child.type === 'bulletList' || child.type === 'orderedList') &&
				depth < MAX_LIST_DEPTH
			) {
				const nested = sanitizeList(child, depth + 1);
				if (nested) content.push(nested);
			}
		}
		if (content[0]?.type !== 'paragraph') content.unshift({ type: 'paragraph' });
		items.push({ type: 'listItem', content });
	}
	return items.length ? { type: node.type, content: items } : null;
}

function sanitizeBlock(node: DocNode): DocNode | null {
	switch (node.type) {
		case 'paragraph':
			return sanitizeTextBlock(node);
		case 'heading': {
			const level = node.attrs?.level === 3 ? 3 : 2;
			const content = sanitizeInline(children(node)).map((child) =>
				// Les intertitres restent en texte simple (pas de gras ni de lien)
				child.type === 'text' ? { type: 'text', text: child.text } : child
			);
			return { type: 'heading', attrs: { level }, ...(content.length ? { content } : {}) };
		}
		case 'bulletList':
		case 'orderedList':
			return sanitizeList(node, 1);
		case 'blockquote': {
			const content = children(node)
				.filter((child) => child.type === 'paragraph' || child.type === 'heading')
				.map(sanitizeTextBlock);
			return { type: 'blockquote', content: content.length ? content : [{ type: 'paragraph' }] };
		}
		case 'image': {
			const src = safeImageSrc(String(node.attrs?.src ?? ''));
			if (!src) return null;
			const alt = String(node.attrs?.alt ?? '').slice(0, MAX_ALT_LENGTH);
			return { type: 'image', attrs: { src, alt } };
		}
		case 'horizontalRule':
			return { type: 'horizontalRule' };
		default:
			return null;
	}
}

/** Document de l'éditeur nettoyé : tout élément ou attribut non prévu est retiré */
export function sanitizeArticleDoc(input: unknown): DocNode {
	const blocks = isNode(input) && input.type === 'doc' ? children(input) : [];
	const content = blocks.map(sanitizeBlock).filter((node): node is DocNode => node !== null);
	return { type: 'doc', content: content.length ? content : [{ type: 'paragraph' }] };
}

/** Texte saisi dans l'éditeur, nettoyé et prêt à enregistrer ; null s'il est illisible */
export function normalizeRichContent(raw: string): string | null {
	try {
		return JSON.stringify(sanitizeArticleDoc(JSON.parse(raw)));
	} catch {
		return null;
	}
}

function segmentsFromInline(nodes: DocNode[]): InlineSegment[] {
	return nodes.map((node) => {
		if (node.type === 'hardBreak') return { text: '', lineBreak: true };
		const marks = node.marks ?? [];
		const has = (type: string) => marks.some((mark) => mark.type === type);
		const href = marks.find((mark) => mark.type === 'link')?.attrs?.href;
		return {
			text: node.text ?? '',
			bold: has('bold') || undefined,
			italic: has('italic') || undefined,
			underline: has('underline') || undefined,
			href: typeof href === 'string' ? (safeHref(href) ?? undefined) : undefined
		};
	});
}

/** Paragraphes d'un bloc joints par des retours à la ligne (citation, élément de liste) */
function joinedSegments(blocks: DocNode[]): InlineSegment[] {
	return blocks.flatMap((block, index) => [
		...(index > 0 ? [{ text: '', lineBreak: true }] : []),
		...segmentsFromInline(children(block))
	]);
}

function listFromDoc(node: DocNode): ListBlock {
	return {
		type: 'list',
		ordered: node.type === 'orderedList',
		items: children(node).map((item) => {
			const parts = children(item);
			return {
				segments: joinedSegments(parts.filter((part) => part.type === 'paragraph')),
				children: parts
					.filter((part) => part.type === 'bulletList' || part.type === 'orderedList')
					.map(listFromDoc)
			};
		})
	};
}

function blocksFromDoc(doc: DocNode): ArticleBlock[] {
	const blocks: ArticleBlock[] = [];
	for (const node of children(doc)) {
		if (node.type === 'paragraph') {
			const segments = segmentsFromInline(children(node));
			if (segments.some((segment) => segment.text.trim()))
				blocks.push({ type: 'paragraph', segments });
		} else if (node.type === 'heading') {
			const text = children(node)
				.map((child) => child.text ?? '')
				.join('')
				.trim();
			if (text) blocks.push({ type: 'heading', level: node.attrs?.level === 3 ? 3 : 2, text });
		} else if (node.type === 'bulletList' || node.type === 'orderedList') {
			blocks.push(listFromDoc(node));
		} else if (node.type === 'blockquote') {
			blocks.push({ type: 'quote', segments: joinedSegments(children(node)) });
		} else if (node.type === 'image') {
			const src = safeImageSrc(String(node.attrs?.src ?? ''));
			if (src) blocks.push({ type: 'image', src, alt: String(node.attrs?.alt ?? '') });
		} else if (node.type === 'horizontalRule') {
			blocks.push({ type: 'divider' });
		}
	}
	return blocks;
}

// ==========================================
// ANCIEN FORMAT TEXTE
// ==========================================

function parseLinks(text: string, style: Pick<InlineSegment, 'bold' | 'italic'>): InlineSegment[] {
	const segments: InlineSegment[] = [];
	let last = 0;
	for (const match of text.matchAll(LINK_PATTERN)) {
		const index = match.index ?? 0;
		if (index > last) segments.push({ text: text.slice(last, index), ...style });
		// URL écrite en clair : la ponctuation finale (fin de phrase) ne fait pas partie du lien
		const bareUrl = match[3]?.replace(/[.,;:!?]+$/, '');
		const label = match[1] ?? bareUrl;
		const href = safeHref(match[2] ?? bareUrl);
		segments.push(href ? { text: label, ...style, href } : { text: match[0], ...style });
		last = index + (bareUrl ?? match[0]).length;
	}
	if (last < text.length) segments.push({ text: text.slice(last), ...style });
	return segments;
}

/** **gras** puis *italique* (seulement si les astérisques vont par paires) */
function parseInline(text: string): InlineSegment[] {
	return text.split('**').flatMap((part, boldIndex) => {
		if (!part) return [];
		const bold = boldIndex % 2 === 1 || undefined;
		const pieces = part.split('*');
		if (pieces.length % 2 === 0) return parseLinks(part, { bold });
		return pieces.flatMap((piece, italicIndex) =>
			piece ? parseLinks(piece, { bold, italic: italicIndex % 2 === 1 || undefined }) : []
		);
	});
}

/** Lignes consécutives d'un même paragraphe : retours à la ligne conservés */
function inlineLines(lines: string[]): InlineSegment[] {
	return lines.flatMap((line, index) => [
		...(index > 0 ? [{ text: '', lineBreak: true }] : []),
		...parseInline(line)
	]);
}

function parseLegacyContent(content: string): ArticleBlock[] {
	const blocks: ArticleBlock[] = [];
	const paragraphs = content.replace(/\r\n?/g, '\n').split(/\n\s*\n/);

	for (const raw of paragraphs) {
		const lines = raw
			.split('\n')
			.map((line) => line.trim())
			.filter(Boolean);
		if (lines.length === 0) continue;

		let paragraphLines: string[] = [];
		let quoteLines: string[] = [];
		let list: ListBlock | null = null;

		const flush = () => {
			if (paragraphLines.length) {
				blocks.push({ type: 'paragraph', segments: inlineLines(paragraphLines) });
				paragraphLines = [];
			}
			if (list) {
				blocks.push(list);
				list = null;
			}
			if (quoteLines.length) {
				blocks.push({ type: 'quote', segments: inlineLines(quoteLines) });
				quoteLines = [];
			}
		};

		for (const line of lines) {
			const image = line.match(IMAGE_LINE);
			const bullet = line.match(/^[-*]\s+(.*)$/);
			const numbered = line.match(/^\d+[.)]\s+(.*)$/);
			if (/^#{1,6}\s/.test(line)) {
				flush();
				blocks.push({
					type: 'heading',
					level: line.startsWith('###') ? 3 : 2,
					text: line.replace(/^#+\s+/, '')
				});
			} else if (image && safeImageSrc(image[2])) {
				flush();
				blocks.push({ type: 'image', src: image[2], alt: image[1] });
			} else if (bullet || numbered) {
				const ordered = Boolean(numbered);
				const current = list as ListBlock | null;
				if (
					paragraphLines.length ||
					quoteLines.length ||
					(current && current.ordered !== ordered)
				) {
					flush();
				}
				list ??= { type: 'list', ordered, items: [] };
				list.items.push({ segments: parseInline((bullet ?? numbered)![1]), children: [] });
			} else if (line.startsWith('>')) {
				if (paragraphLines.length || list) flush();
				quoteLines.push(line.replace(/^>\s?/, ''));
			} else {
				if (list || quoteLines.length) flush();
				paragraphLines.push(line);
			}
		}
		flush();
	}

	return blocks;
}

// ==========================================
// CONVERSIONS
// ==========================================

export function parseArticleContent(content: string): ArticleBlock[] {
	if (isRichContent(content)) {
		try {
			return blocksFromDoc(sanitizeArticleDoc(JSON.parse(content)));
		} catch {
			return [];
		}
	}
	return parseLegacyContent(content);
}

function inlineToDoc(segments: InlineSegment[]): DocNode[] {
	return segments.flatMap((segment): DocNode[] => {
		if (segment.lineBreak) return [{ type: 'hardBreak' }];
		if (!segment.text) return [];
		const marks: DocMark[] = [];
		if (segment.bold) marks.push({ type: 'bold' });
		if (segment.italic) marks.push({ type: 'italic' });
		if (segment.underline) marks.push({ type: 'underline' });
		if (segment.href) marks.push({ type: 'link', attrs: { href: segment.href } });
		return [{ type: 'text', text: segment.text, ...(marks.length ? { marks } : {}) }];
	});
}

function paragraphDoc(segments: InlineSegment[]): DocNode {
	const content = inlineToDoc(segments);
	return content.length ? { type: 'paragraph', content } : { type: 'paragraph' };
}

function listToDoc(list: ListBlock): DocNode {
	return {
		type: list.ordered ? 'orderedList' : 'bulletList',
		content: list.items.map((item) => ({
			type: 'listItem',
			content: [paragraphDoc(item.segments), ...item.children.map(listToDoc)]
		}))
	};
}

/** Contenu d'un article (ancien format ou document) prêt à charger dans l'éditeur visuel */
export function toEditorDoc(content: string): DocNode {
	if (isRichContent(content)) {
		try {
			return sanitizeArticleDoc(JSON.parse(content));
		} catch {
			return sanitizeArticleDoc(null);
		}
	}
	const nodes = parseLegacyContent(content).map((block): DocNode => {
		switch (block.type) {
			case 'heading':
				return {
					type: 'heading',
					attrs: { level: block.level },
					content: [{ type: 'text', text: block.text }]
				};
			case 'paragraph':
				return paragraphDoc(block.segments);
			case 'quote':
				return { type: 'blockquote', content: [paragraphDoc(block.segments)] };
			case 'list':
				return listToDoc(block);
			case 'image':
				return { type: 'image', attrs: { src: block.src, alt: block.alt } };
			case 'divider':
				return { type: 'horizontalRule' };
		}
	});
	return sanitizeArticleDoc({ type: 'doc', content: nodes });
}

function plainFromSegments(segments: InlineSegment[]): string {
	return segments.map((segment) => (segment.lineBreak ? ' ' : segment.text)).join('');
}

function plainFromList(list: ListBlock): string[] {
	return list.items.flatMap((item) => [
		plainFromSegments(item.segments),
		...item.children.flatMap(plainFromList)
	]);
}

/** Texte brut (sans mise en forme), pour les extraits, le nombre de mots et le temps de lecture */
export function toPlainText(content: string): string {
	return parseArticleContent(content)
		.flatMap((block) => {
			switch (block.type) {
				case 'heading':
					return [block.text];
				case 'paragraph':
				case 'quote':
					return [plainFromSegments(block.segments)];
				case 'list':
					return plainFromList(block);
				default:
					return [];
			}
		})
		.join(' ')
		.replace(/\s+/g, ' ')
		.trim();
}

/** Vrai si l'article contient du texte ou au moins une image */
export function hasArticleContent(content: string): boolean {
	return (
		toPlainText(content).length > 0 ||
		parseArticleContent(content).some((block) => block.type === 'image')
	);
}

export function readingTimeLabel(content: string): string {
	const words = toPlainText(content).split(' ').filter(Boolean).length;
	const minutes = Math.max(1, Math.round(words / WORDS_PER_MINUTE));
	return `${minutes} min de lecture`;
}
