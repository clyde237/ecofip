/**
 * Découpe un texte pour identifier et extraire automatiquement les URLs (liens web, WhatsApp, etc.)
 * Sécurisé contre les injections XSS sans nécessiter d'interpréteur HTML.
 */
export interface TextChunk {
	type: 'text' | 'link';
	content: string;
	url?: string;
}

export function parseTextWithLinks(text: string): TextChunk[] {
	if (!text) return [];

	// Expression régulière détectant les URLs commençant par http:// ou https://
	const urlRegex = /(https?:\/\/[^\s<]+)/g;
	const parts: TextChunk[] = [];
	let lastIndex = 0;
	let match: RegExpExecArray | null;

	while ((match = urlRegex.exec(text)) !== null) {
		const matchIndex = match.index;
		let rawUrl = match[0];

		// Texte brut précédant l'URL
		if (matchIndex > lastIndex) {
			parts.push({
				type: 'text',
				content: text.slice(lastIndex, matchIndex)
			});
		}

		// Retirer la ponctuation finale de phrase accidentellement capturée (ex: "https://lien.com.")
		let trailingPunctuation = '';
		while (/[.,;:!?)]$/.test(rawUrl)) {
			trailingPunctuation = rawUrl.slice(-1) + trailingPunctuation;
			rawUrl = rawUrl.slice(0, -1);
		}

		parts.push({
			type: 'link',
			content: rawUrl,
			url: rawUrl
		});

		if (trailingPunctuation) {
			parts.push({
				type: 'text',
				content: trailingPunctuation
			});
		}

		lastIndex = matchIndex + match[0].length;
	}

	// Texte brut restant après la dernière URL
	if (lastIndex < text.length) {
		parts.push({
			type: 'text',
			content: text.slice(lastIndex)
		});
	}

	return parts;
}
