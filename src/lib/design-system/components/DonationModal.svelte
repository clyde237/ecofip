<script lang="ts">
	/** Fenêtre « Faire un don » partagée par tout le site (voir donation.svelte.ts) */
	import Modal from './Modal.svelte';
	import Button from './Button.svelte';
	import MobileMoneyDonation from './MobileMoneyDonation.svelte';
	import { donationDialog } from '../donation.svelte.js';
</script>

<Modal
	bind:open={donationDialog.open}
	title="Faire un don à l’œuvre"
	description="« Donnez, et il vous sera donné » — Luc 6:38"
>
	<div class="py-2">
		{#if donationDialog.open}
			<MobileMoneyDonation idPrefix="don-modal" purpose={donationDialog.purpose} />
		{/if}
	</div>

	{#snippet actions()}
		<a
			href="/faire-un-don#don"
			onclick={() => (donationDialog.open = false)}
			class="mr-auto self-center text-xs font-semibold text-text-secondary hover:text-brand-primary"
		>
			Autres façons de soutenir
		</a>
		<Button variant="outline" size="md" onclick={() => (donationDialog.open = false)}>Fermer</Button
		>
	{/snippet}
</Modal>
