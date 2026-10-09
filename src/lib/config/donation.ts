/**
 * Dons par Mobile Money (codes marchands officiels de Go International Ministry).
 * Sur téléphone, le lien « tel: » ouvre l'application Téléphone avec le code déjà composé :
 * le donateur n'a plus qu'à appeler puis valider avec son code secret.
 */

/** Nom affiché par l'opérateur au moment de la confirmation */
export const DONATION_RECIPIENT = 'Go International Ministry';

export const DONATION_MIN_AMOUNT = 100;
export const DONATION_MAX_AMOUNT = 5_000_000;
export const DONATION_PRESET_AMOUNTS = [1_000, 2_000, 5_000, 10_000, 25_000, 50_000];
export const DONATION_DEFAULT_AMOUNT = 5_000;

export type MobileMoneyOperator = {
	id: 'orange' | 'mtn';
	name: string;
	/** Code USSD, « {montant} » remplacé par le montant choisi */
	ussdTemplate: string;
};

export const MOBILE_MONEY_OPERATORS: MobileMoneyOperator[] = [
	{ id: 'orange', name: 'Orange Money', ussdTemplate: '#150*47*970436*{montant}#' },
	{ id: 'mtn', name: 'MTN MoMo', ussdTemplate: '*126*4*742378*{montant}#' }
];

/** Code à composer, avec le montant ou « montant » s'il n'est pas encore choisi */
export function ussdCode(operator: MobileMoneyOperator, amount: number | null): string {
	return operator.ussdTemplate.replace('{montant}', amount ? String(amount) : 'montant');
}

/** Lien qui ouvre l'application Téléphone avec le code (« # » doit être encodé dans un lien tel:) */
export function ussdHref(code: string): string {
	return `tel:${code.replace(/#/g, '%23')}`;
}

/** Montant saisi (« 5 000 », « 5000 ») en nombre entier de FCFA, ou null s'il est invalide */
export function parseDonationAmount(value: string): number | null {
	const cleaned = value.replace(/[\s.]/g, '');
	if (!/^\d+$/.test(cleaned)) return null;
	const amount = Number(cleaned);
	return amount >= DONATION_MIN_AMOUNT && amount <= DONATION_MAX_AMOUNT ? amount : null;
}
