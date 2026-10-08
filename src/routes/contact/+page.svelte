<script lang="ts">
	import Seo from '$lib/design-system/components/Seo.svelte';
	import { SITE_URL } from '$lib/config/site.js';
	import PageBanner from '$lib/design-system/patterns/PageBanner.svelte';
	import {
		ContactChannelsSection,
		ContactFormSection,
		ContactMapSection,
		ContactPrayerSection,
		DonationCtaSection,
		Modal,
		Button,
		Input
	} from '$lib';
	import { Heart } from '@lucide/svelte';
	import { toast } from '$lib/design-system/toast.svelte.js';

	let isDonationModalOpen = $state(false);
</script>

<Seo
	title="Contact ECOFIP — Bafoussam, Cameroun"
	description="Contactez ECOFIP à Bafoussam (quartier Tamja) : téléphone, WhatsApp, email et équipe d’intercession disponible pour vos sujets de prière."
	breadcrumbs={[{ name: 'Contact', path: '/contact' }]}
	jsonLd={{
		'@type': 'ContactPage',
		name: 'Contacter ECOFIP',
		about: { '@id': `${SITE_URL}/#organization` }
	}}
/>

<div>
	<!-- SECTION 02 — Introduction Contact -->
	<PageBanner
		title="Restons en Contact"
		subtitle="Une question ? Une suggestion ? Besoin de prière ? N'hésitez pas à nous contacter. Nous serions ravis d'échanger avec vous !"
		breadcrumbLabel="Contact"
		backgroundImage="/about-mission.jpg"
	/>

	<!-- SECTION 03 — Coordonnées -->
	<ContactChannelsSection />

	<!-- SECTION 04 — Formulaire de contact -->
	<ContactFormSection />

	<!-- SECTIONS 05 & 06 — Localisation et Réseaux sociaux -->
	<ContactMapSection />

	<!-- SECTION 07 — Besoin de prière ? -->
	<ContactPrayerSection />

	<!-- Appel au soutien missionnaire -->
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
