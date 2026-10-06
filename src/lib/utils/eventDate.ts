/**
 * Utilitaires de formatage et calcul des dates/horaires pour les événements ECOFIP
 */

const MONTHS_FR = [
	'JAN',
	'FÉV',
	'MAR',
	'AVR',
	'MAI',
	'JUIN',
	'JUIL',
	'AOÛT',
	'SEPT',
	'OCT',
	'NOV',
	'DÉC'
];

const MONTHS_FULL_FR = [
	'janvier',
	'février',
	'mars',
	'avril',
	'mai',
	'juin',
	'juillet',
	'août',
	'septembre',
	'octobre',
	'novembre',
	'décembre'
];

/**
 * Les dates et heures saisies dans l'admin sont des heures locales du Cameroun
 * (Africa/Douala, UTC+1, sans heure d'été). Tous les calculs passent par ces helpers
 * pour ne pas dépendre du fuseau du serveur (Vercel = UTC) ni de celui du navigateur.
 */
const CAMEROON_UTC_OFFSET_MS = 60 * 60 * 1000;

/** Instant absolu correspondant à une date/heure locale camerounaise. */
export function cameroonDate(
	year: number,
	monthIndex: number,
	day: number,
	hours = 0,
	minutes = 0
): Date {
	return new Date(Date.UTC(year, monthIndex, day, hours, minutes) - CAMEROON_UTC_OFFSET_MS);
}

/** Jour calendaire (heure du Cameroun) d'un instant. */
export function toCameroonParts(date: Date): { year: number; monthIndex: number; day: number } {
	const shifted = new Date(date.getTime() + CAMEROON_UTC_OFFSET_MS);
	return {
		year: shifted.getUTCFullYear(),
		monthIndex: shifted.getUTCMonth(),
		day: shifted.getUTCDate()
	};
}

/** Date au format "YYYY-MM-DD" (heure du Cameroun) d'un instant. */
export function toCameroonDateString(date: Date): string {
	const { year, monthIndex, day } = toCameroonParts(date);
	return `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/** Extrait l'heure de début depuis "HH:mm" ou, à défaut, depuis un libellé "17h30 – 21h30". */
function parseStartTime(
	startTime?: string | null,
	timeLabel?: string | null
): { hours: number; minutes: number } | null {
	if (startTime) {
		const [h, m] = startTime.split(':').map(Number);
		return { hours: h || 0, minutes: m || 0 };
	}
	const match = timeLabel?.match(/(\d{1,2})h(\d{2})?/);
	if (match) {
		return { hours: Number(match[1]), minutes: Number(match[2] || 0) };
	}
	return null;
}

export function formatTimeDisplay(timeStr?: string): string {
	if (!timeStr) return '';
	// Convertit "18:00" en "18h00"
	return timeStr.replace(':', 'h');
}

export function formatEventSchedule(params: {
	isSingleDay: boolean;
	startDateStr: string; // Format "YYYY-MM-DD"
	endDateStr?: string; // Format "YYYY-MM-DD"
	startTimeStr?: string; // Format "HH:mm"
	endTimeStr?: string; // Format "HH:mm"
	isAllDay?: boolean;
}): {
	dateDay: string;
	dateMonthYear: string;
	time: string;
	eventDate: Date;
	startDate: Date;
	endDate?: Date;
	summaryText: string;
} {
	const { isSingleDay, startDateStr, endDateStr, startTimeStr, endTimeStr, isAllDay } = params;

	if (!startDateStr) {
		const now = new Date();
		return {
			dateDay: '01',
			dateMonthYear: 'OCT 2026',
			time: '18h00',
			eventDate: now,
			startDate: now,
			summaryText: ''
		};
	}

	const [sYear, sMonth, sDay] = startDateStr.split('-').map(Number);
	const start = cameroonDate(sYear, sMonth - 1, sDay);

	// Construction du libellé horaire
	let time = '';
	if (isAllDay) {
		time = 'Toute la journée';
	} else if (startTimeStr && endTimeStr) {
		time = `${formatTimeDisplay(startTimeStr)} – ${formatTimeDisplay(endTimeStr)}`;
	} else if (startTimeStr) {
		time = `À partir de ${formatTimeDisplay(startTimeStr)}`;
	} else {
		time = 'Horaire à confirmer';
	}

	let dateDay = '';
	let dateMonthYear = '';
	let end: Date | undefined;
	let summaryText = '';

	const sMonthLabel = MONTHS_FR[sMonth - 1] || 'OCT';
	const sMonthFull = MONTHS_FULL_FR[sMonth - 1] || 'octobre';

	if (isSingleDay || !endDateStr || startDateStr === endDateStr) {
		dateDay = String(sDay).padStart(2, '0');
		dateMonthYear = `${sMonthLabel} ${sYear}`;
		summaryText = `Le ${sDay} ${sMonthFull} ${sYear} · ${time}`;
	} else {
		const [eYear, eMonth, eDay] = endDateStr.split('-').map(Number);
		end = cameroonDate(eYear, eMonth - 1, eDay);
		const eMonthLabel = MONTHS_FR[eMonth - 1] || 'OCT';
		const eMonthFull = MONTHS_FULL_FR[eMonth - 1] || 'octobre';

		if (sYear === eYear && sMonth === eMonth) {
			// Même mois et même année (ex: 27 – 30 OCT 2026)
			dateDay = `${String(sDay).padStart(2, '0')} – ${String(eDay).padStart(2, '0')}`;
			dateMonthYear = `${sMonthLabel} ${sYear}`;
			summaryText = `Du ${sDay} au ${eDay} ${sMonthFull} ${sYear} · ${time}`;
		} else if (sYear === eYear) {
			// Mois différents, même année (ex: 28 OCT – 02 NOV 2026)
			dateDay = `${String(sDay).padStart(2, '0')} ${sMonthLabel} – ${String(eDay).padStart(2, '0')} ${eMonthLabel}`;
			dateMonthYear = `${sYear}`;
			summaryText = `Du ${sDay} ${sMonthFull} au ${eDay} ${eMonthFull} ${sYear} · ${time}`;
		} else {
			// Années différentes
			dateDay = `${String(sDay).padStart(2, '0')} ${sMonthLabel} ${sYear} – ${String(eDay).padStart(2, '0')} ${eMonthLabel} ${eYear}`;
			dateMonthYear = `${sYear} – ${eYear}`;
			summaryText = `Du ${sDay} ${sMonthFull} ${sYear} au ${eDay} ${eMonthFull} ${eYear} · ${time}`;
		}
	}

	// eventDate pour les tris chronologiques
	const startTime = parseStartTime(startTimeStr);
	const eventDate = startTime
		? cameroonDate(sYear, sMonth - 1, sDay, startTime.hours, startTime.minutes)
		: new Date(start);

	return {
		dateDay,
		dateMonthYear,
		time,
		eventDate,
		startDate: start,
		endDate: end,
		summaryText
	};
}

/**
 * Détermine la date cible exacte (Date) d'un événement pour le compte à rebours
 */
export function getEventTargetDate(event: {
	startDate?: Date | string | null;
	eventDate?: Date | string | null;
	startTime?: string | null;
	time?: string | null;
	dateDay?: string | null;
	dateMonthYear?: string | null;
	dateMonth?: string | null;
	dateYear?: string | null;
}): Date {
	const startTime = parseStartTime(event.startTime, event.time);

	if (event.startDate) {
		const d = new Date(event.startDate);
		if (!isNaN(d.getTime())) {
			// startDate est stocké à minuit (heure du Cameroun) : on relit le jour camerounais
			// puis on applique l'heure de début, sans passer par le fuseau du serveur.
			const { year, monthIndex, day } = toCameroonParts(d);
			return startTime
				? cameroonDate(year, monthIndex, day, startTime.hours, startTime.minutes)
				: cameroonDate(year, monthIndex, day);
		}
	}

	if (event.eventDate) {
		const d = new Date(event.eventDate);
		if (!isNaN(d.getTime())) return d;
	}

	// Parsing depuis dateDay et dateMonthYear / dateMonth / dateYear
	const today = toCameroonParts(new Date());
	let year = today.year;
	let month = today.monthIndex;
	let day = 15;

	if (event.dateYear) {
		const y = parseInt(event.dateYear, 10);
		if (!isNaN(y)) year = y;
	}

	const monthSource = `${event.dateMonthYear || ''} ${event.dateMonth || ''}`.toUpperCase();
	for (let i = 0; i < MONTHS_FR.length; i++) {
		if (
			monthSource.includes(MONTHS_FR[i]) ||
			monthSource.includes(MONTHS_FULL_FR[i].toUpperCase())
		) {
			month = i;
			break;
		}
	}

	if (event.dateDay) {
		const firstDayMatch = event.dateDay.match(/\d+/);
		if (firstDayMatch) {
			day = parseInt(firstDayMatch[0], 10);
		}
	}

	return cameroonDate(year, month, day, startTime?.hours ?? 18, startTime?.minutes ?? 0);
}
