<script lang="ts">
	import Seo from '$lib/design-system/components/Seo.svelte';
	import { SITE_URL } from '$lib/config/site.js';
	import PageBanner from '$lib/design-system/patterns/PageBanner.svelte';
	import {
		ContactChannelsSection,
		ContactFormSection,
		ContactMapSection,
		ContactPrayerSection,
		DonationCtaSection
	} from '$lib';
	import { donationDialog } from '$lib/design-system/donation.svelte.js';
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
		ctaHref="/faire-un-don#don"
		onCtaClick={() => donationDialog.show()}
	/>
</div>
