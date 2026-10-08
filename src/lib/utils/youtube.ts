/** Liens YouTube saisis dans l'admin (prédication complète d'un short) */

const YOUTUBE_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;
// Début de lecture accepté dans le lien : « 90 », « 90s » ou « 1h2m3s »
const YOUTUBE_START_PATTERN = /^(\d+s?|(?=\d)(\d+h)?(\d+m)?(\d+s)?)$/;
const MAX_URL_LENGTH = 500;

/**
 * Lien YouTube d'une vidéo (watch, youtu.be, live, shorts, embed) ramené à la forme
 * https://www.youtube.com/watch?v=ID, début de lecture conservé. null si ce n'est pas
 * une vidéo YouTube : seuls des liens vers YouTube sont affichés sur le site.
 */
export function normalizeYoutubeUrl(value: string): string | null {
	if (value.length > MAX_URL_LENGTH) return null;
	let url: URL;
	try {
		url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
	} catch {
		return null;
	}
	const host = url.hostname.toLowerCase().replace(/^(www\.|m\.|music\.)/, '');
	let id: string | null = null;
	if (host === 'youtu.be') {
		id = url.pathname.split('/')[1] ?? null;
	} else if (host === 'youtube.com') {
		id =
			url.pathname === '/watch'
				? url.searchParams.get('v')
				: (url.pathname.match(/^\/(?:live|shorts|embed)\/([^/]+)/)?.[1] ?? null);
	}
	if (!id || !YOUTUBE_ID_PATTERN.test(id)) return null;

	const start = url.searchParams.get('t') ?? url.searchParams.get('start');
	const startParam = start && YOUTUBE_START_PATTERN.test(start) ? `&t=${start}` : '';
	return `https://www.youtube.com/watch?v=${id}${startParam}`;
}
