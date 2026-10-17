/**
 * Dons par Mobile Money. Sur téléphone, le lien « tel: » ouvre l'application Téléphone avec le
 * code déjà composé : le donateur n'a plus qu'à appeler puis valider avec son code secret.
 *
 * Deux jeux de coordonnées :
 *  - les codes marchands officiels de Go International Ministry, suspendus le temps de régler
 *    un souci avec les opérateurs (conservés ici pour les remettre en service) ;
 *  - des numéros provisoires, utilisés par un transfert vers un numéro.
 * USE_MERCHANT_CODES choisit ceux qui sont affichés sur le site.
 */

/** Remettre à true quand les codes marchands fonctionnent de nouveau */
export const USE_MERCHANT_CODES = false;

export const DONATION_MIN_AMOUNT = 100;
export const DONATION_MAX_AMOUNT = 5_000_000;
export const DONATION_PRESET_AMOUNTS = [1_000, 2_000, 5_000, 10_000, 25_000, 50_000];
export const DONATION_DEFAULT_AMOUNT = 5_000;

export type MobileMoneyOperator = {
	id: 'orange' | 'mtn';
	name: string;
	/** Code USSD, « {montant} » remplacé par le montant choisi */
	ussdTemplate: string;
	/** Nom affiché par l'opérateur au moment de la confirmation */
	recipient: string;
	/** Numéro qui reçoit le transfert (absent pour un code marchand) */
	phone?: string;
};

const MERCHANT_RECIPIENT = 'Go International Ministry';
const TRANSFER_RECIPIENT = 'Djougoue Tchappi Reine Raïssa';

/** Codes marchands officiels de Go International Ministry (suspendus, voir USE_MERCHANT_CODES) */
export const MERCHANT_OPERATORS: MobileMoneyOperator[] = [
	{
		id: 'orange',
		name: 'Orange Money',
		ussdTemplate: '#150*47*970436*{montant}#',
		recipient: MERCHANT_RECIPIENT
	},
	{
		id: 'mtn',
		name: 'MTN MoMo',
		ussdTemplate: '*126*4*742378*{montant}#',
		recipient: MERCHANT_RECIPIENT
	}
];

/** Numéros provisoires : transfert « vers un numéro » du menu de chaque opérateur */
export const TRANSFER_OPERATORS: MobileMoneyOperator[] = [
	{
		id: 'orange',
		name: 'Orange Money',
		ussdTemplate: '#150*1*1*693929470*{montant}#',
		recipient: TRANSFER_RECIPIENT,
		phone: '693 92 94 70'
	},
	{
		id: 'mtn',
		name: 'MTN MoMo',
		ussdTemplate: '*126*1*1*680243006*{montant}#',
		recipient: TRANSFER_RECIPIENT,
		phone: '680 24 30 06'
	}
];

export const MOBILE_MONEY_OPERATORS = USE_MERCHANT_CODES ? MERCHANT_OPERATORS : TRANSFER_OPERATORS;

/** Bénéficiaire à vérifier par le donateur avant de valider */
export const DONATION_RECIPIENT = USE_MERCHANT_CODES ? MERCHANT_RECIPIENT : TRANSFER_RECIPIENT;

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
