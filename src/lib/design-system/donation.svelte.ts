/**
 * Fenêtre de don partagée par tout le site : n'importe quel bouton « Faire un don » l'ouvre,
 * avec éventuellement l'objet du don (ex. un besoin de la page Faire un don).
 * La fenêtre elle-même est affichée une seule fois, dans l'en-tête.
 */
class DonationDialog {
	open = $state(false);
	purpose = $state<string | null>(null);

	show(purpose?: string) {
		this.purpose = purpose ?? null;
		this.open = true;
	}
}

export const donationDialog = new DonationDialog();
