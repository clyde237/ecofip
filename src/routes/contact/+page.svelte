<script lang="ts">
	import {
		ContactHero,
		ContactChannelsSection,
		ContactFormSection,
		ContactMapSection,
		DonationCtaSection,
		Modal,
		Button,
		Input
	} from '$lib';
	import { Heart } from '@lucide/svelte';
	import { toast } from '$lib/design-system/toast.svelte.js';

	let isDonationModalOpen = $state(false);
</script>

<svelte:head>
	<title>Contact & Écoute Pastorale — Famille Missionnaire | ECOFIP</title>
	<meta
		name="description"
		content="Contactez ECOFIP au Cameroun : permanence de prière et d’intercession, secrétariat général, coordination des missions de terrain et partenariats d’église."
	/>
	<meta property="og:title" content="Contact & Écoute Pastorale — ECOFIP" />
	<meta
		property="og:description"
		content="Une question, une requête de prière ou un projet de mission ? L'équipe de coordination ECOFIP est à votre écoute."
	/>
	<meta property="og:type" content="website" />
</svelte:head>

<div>
	<!-- 1. Bannière d'introduction avec fil d'ariane et contacts rapides -->
	<ContactHero />

	<!-- 2. Les 4 Pôles et Départements dédiés avec coordonnées directes -->
	<ContactChannelsSection />

	<!-- 3. Formulaire interactif complet avec validation et rassurance -->
	<ContactFormSection />

	<!-- 4. Implantations géographiques avec Carte interactive Leaflet -->
	<ContactMapSection />

	<!-- 5. Appel au partenariat & semence missionnaire -->
	<DonationCtaSection
		eyebrow="SOUTENIR LE MINISTÈRE"
		title="Faites un don, semez dans l’œuvre de Dieu au Cameroun"
		description="Votre contribution permet de déployer nos équipes de terrain, d'offrir des soins médicaux gratuits et de proclamer le salut dans les contrées les plus reculées."
		ctaLabel="Faire un don maintenant"
		onCtaClick={() => (isDonationModalOpen = true)}
	/>
</div>

<!-- Modal interactive de don missionnaire -->
<Modal
	bind:open={isDonationModalOpen}
	title="Soutenir l’œuvre missionnaire ECOFIP"
	description="« Que chacun donne comme il l'a résolu en son cœur, sans tristesse ni contrainte. »"
>
	<div class="space-y-4 py-2">
		<p class="font-body text-sm font-semibold text-text-primary">Affectation de votre don :</p>
		<div class="grid grid-cols-3 gap-2.5">
			<div class="rounded-xl border-2 border-brand-primary bg-brand-subtle p-3 text-center">
				<div class="text-xs font-bold text-brand-primary sm:text-sm">Croisades</div>
				<div class="mt-0.5 text-[11px] text-text-secondary">Évangélisation</div>
			</div>
			<div class="rounded-xl border border-border bg-white p-3 text-center">
				<div class="text-xs font-bold text-text-primary sm:text-sm">Soins Gratuits</div>
				<div class="mt-0.5 text-[11px] text-text-secondary">Cliniques Mobiles</div>
			</div>
			<div class="rounded-xl border border-border bg-white p-3 text-center">
				<div class="text-xs font-bold text-text-primary sm:text-sm">Discipulat</div>
				<div class="mt-0.5 text-[11px] text-text-secondary">Bibles & Édification</div>
			</div>
		</div>

		<Input label="Montant du don (FCFA)" type="number" placeholder="Ex: 25 000" />
	</div>

	{#snippet actions()}
		<Button variant="outline" size="md" onclick={() => (isDonationModalOpen = false)}>
			Annuler
		</Button>
		<Button
			variant="primary"
			size="md"
			onclick={() => {
				isDonationModalOpen = false;
				toast.success(
					'Merci de tout cœur pour votre soutien à la mission ECOFIP !',
					'Don enregistré'
				);
			}}
		>
			<Heart size={16} class="mr-1.5 fill-white text-white" />
			Valider mon don
		</Button>
	{/snippet}
</Modal>
