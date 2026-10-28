/**
 * Statistiques d'un événement, jour par jour : validation du formulaire admin, jours de
 * l'événement, totaux et conversion pour le site. L'image de chaque jour est sur R2 (events/).
 */
import type { EventRecord, EventStatDayRecord, EventStatSession } from '$lib/server/db/schema.js';
import { deleteFromR2, formatMediaUrl, isR2KeyInFolder } from '$lib/server/r2.js';
import { toCameroonDateString } from '$lib/utils/eventDate.js';
import type { PublicEventStats, PublicStatLine } from '$lib/design-system/types.js';

export const STATS_R2_FOLDER = 'events';

const LIMITS = { sessions: 6, stats: 12, name: 80, label: 80, value: 80, days: 31 } as const;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const ID_PATTERN = /^[A-Za-z0-9-]{1,40}$/;

type Parsed<T> = { value: T } | { error: string };

/** « 04 », « 1 276 » → « 4 », « 1276 » ; un texte (« plusieurs ») est gardé tel quel */
export function normalizeStatValue(value: string): string {
	const trimmed = value.trim();
	const digits = trimmed.replace(/[\s.]/g, '');
	return /^\d+$/.test(digits) ? String(Number(digits)) : trimmed;
}

function numericValue(value: string): number | null {
	return /^\d+$/.test(value) ? Number(value) : null;
}

/** Jours de l'événement (AAAA-MM-JJ, heure du Cameroun), du premier au dernier */
export function eventDayDates(
	event: Pick<EventRecord, 'startDate' | 'endDate' | 'eventDate'>
): string[] {
	const start = event.startDate ?? event.eventDate;
	if (!start) return [];
	const first = toCameroonDateString(new Date(start));
	const last = event.endDate ? toCameroonDateString(new Date(event.endDate)) : first;
	const days: string[] = [];
	const cursor = new Date(`${first}T12:00:00Z`);
	while (days.length < LIMITS.days) {
		const day = cursor.toISOString().slice(0, 10);
		if (day > last) break;
		days.push(day);
		cursor.setUTCDate(cursor.getUTCDate() + 1);
	}
	return days;
}

export function formatStatDate(day: string): string {
	return new Date(`${day}T12:00:00Z`).toLocaleDateString('fr-FR', {
		weekday: 'long',
		day: 'numeric',
		month: 'long',
		year: 'numeric',
		timeZone: 'UTC'
	});
}

/** Sessions du formulaire (JSON), image et publication d'une journée */
export function parseStatDayForm(
	formData: FormData,
	allowedDays: string[]
): Parsed<{
	dayDate: string;
	sessions: EventStatSession[];
	imageKey: string | null;
	removeImage: boolean;
	isPublished: boolean;
}> {
	const dayDate = String(formData.get('dayDate') ?? '');
	if (!DATE_PATTERN.test(dayDate) || !allowedDays.includes(dayDate)) {
		return { error: 'Ce jour ne fait pas partie de l’événement.' };
	}

	let raw: unknown;
	try {
		raw = JSON.parse(String(formData.get('sessions') ?? '[]'));
	} catch {
		return { error: 'Les statistiques sont illisibles. Rechargez la page et recommencez.' };
	}
	if (!Array.isArray(raw)) return { error: 'Les statistiques sont invalides.' };
	if (raw.length > LIMITS.sessions) {
		return { error: `Pas plus de ${LIMITS.sessions} sessions par jour.` };
	}

	const sessions: EventStatSession[] = [];
	for (const [index, entry] of raw.entries()) {
		const item = (entry ?? {}) as Record<string, unknown>;
		const id = String(item.id ?? '');
		const name = String(item.name ?? '').trim();
		if (!ID_PATTERN.test(id)) return { error: `Session n°${index + 1} : identifiant invalide.` };
		if (!name || name.length > LIMITS.name) {
			return {
				error: `Session n°${index + 1} : le nom est obligatoire (${LIMITS.name} caractères maximum).`
			};
		}
		const rawStats = Array.isArray(item.stats) ? item.stats : [];
		if (rawStats.length > LIMITS.stats) {
			return { error: `« ${name} » : ${LIMITS.stats} statistiques maximum.` };
		}
		const stats: EventStatSession['stats'] = [];
		for (const stat of rawStats) {
			const line = (stat ?? {}) as Record<string, unknown>;
			const label = String(line.label ?? '').trim();
			const value = normalizeStatValue(String(line.value ?? ''));
			// Ligne sans valeur (libellé proposé mais non rempli) : ignorée
			if (!value) continue;
			if (!label) {
				return { error: `« ${name} » : la valeur « ${value} » n’a pas de libellé.` };
			}
			if (label.length > LIMITS.label || value.length > LIMITS.value) {
				return { error: `« ${name} » : libellé ou valeur trop long (${LIMITS.label} caractères).` };
			}
			stats.push({ label, value });
		}
		sessions.push({ id, name, stats });
	}

	const imageKey = String(formData.get('imageKey') ?? '').trim();
	return {
		value: {
			dayDate,
			sessions,
			imageKey: isR2KeyInFolder(imageKey, STATS_R2_FOLDER) ? imageKey : null,
			removeImage: formData.get('removeImage') === 'on',
			isPublished: formData.get('isPublished') === 'on'
		}
	};
}

export async function deleteStatImage(key: string | null): Promise<void> {
	if (key && isR2KeyInFolder(key, STATS_R2_FOLDER)) await deleteFromR2(key);
}

/** Clé de regroupement d'un libellé : sans accents, majuscules ni espaces superflus */
function labelKey(label: string): string {
	return label.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim();
}

/** Additionne les chiffres par libellé ; une valeur en texte est signalée comme « non comptée » */
function sumLines(lines: { label: string; value: string }[]): PublicStatLine[] {
	const totals = new Map<string, PublicStatLine>();
	for (const line of lines) {
		const key = labelKey(line.label);
		const entry = totals.get(key) ?? { label: line.label, value: 0, text: null, uncounted: false };
		const number = numericValue(line.value);
		if (number === null) entry.uncounted = true;
		else entry.value = (entry.value ?? 0) + number;
		totals.set(key, entry);
	}
	return Array.from(totals.values());
}

/** Statistiques publiées d'un événement, prêtes à afficher */
export function toPublicEventStats(
	event: Pick<EventRecord, 'startDate' | 'endDate' | 'eventDate'>,
	rows: EventStatDayRecord[]
): PublicEventStats | null {
	const allDays = eventDayDates(event);
	const days = rows
		.filter((row) => row.isPublished && row.sessions.some((session) => session.stats.length > 0))
		.sort((a, b) => a.dayDate.localeCompare(b.dayDate))
		.map((row) => {
			const index = allDays.indexOf(row.dayDate);
			return {
				date: row.dayDate,
				dayNumber: index >= 0 ? index + 1 : null,
				dateLabel: formatStatDate(row.dayDate),
				imageUrl: formatMediaUrl(row.imageUrl) || null,
				sessions: row.sessions
					.filter((session) => session.stats.length > 0)
					.map((session) => ({
						name: session.name,
						stats: session.stats.map((stat) => {
							const number = numericValue(stat.value);
							return {
								label: stat.label,
								value: number,
								text: number === null ? stat.value : null,
								uncounted: false
							};
						})
					}))
			};
		});
	if (days.length === 0) return null;

	const lastDay = allDays.at(-1) ?? days.at(-1)!.date;
	const today = toCameroonDateString(new Date());
	return {
		days,
		totals: sumLines(
			days.flatMap((day) =>
				day.sessions.flatMap((session) =>
					session.stats.map((stat) => ({
						label: stat.label,
						value: stat.text ?? String(stat.value)
					}))
				)
			)
		),
		firstDateLabel: formatStatDate(days[0].date),
		totalDays: allDays.length,
		isFinished: today > lastDay
	};
}
