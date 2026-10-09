<script lang="ts">
	import Seo from '$lib/design-system/components/Seo.svelte';
	import PageBanner from '$lib/design-system/patterns/PageBanner.svelte';
	import {
		ProjectsListSection,
		ProjectsSpotlight,
		ProjectsHowToEngage,
		DonationCtaSection,
		MapSection
	} from '$lib';
	import ProjectAxesAndStats from '$lib/design-system/patterns/ProjectAxesAndStats.svelte';
	import CpjTimelineSection from '$lib/design-system/patterns/CpjTimelineSection.svelte';
	import CpjEditionsSection from '$lib/design-system/patterns/CpjEditionsSection.svelte';
	import type { PageData } from './$types.js';
	import TestimonyCategoriesSection from '$lib/design-system/patterns/TestimonyCategoriesSection.svelte';
	import { donationDialog } from '$lib/design-system/donation.svelte.js';

	let { data }: { data: PageData } = $props();
</script>

<Seo
	title="Cameroun pour Jésus 2024-2026 — Projets et missions | ECOFIP"
	description="Programme « Cameroun pour Jésus » : 20 campagnes dans 19 villes et 9 régions, plus de 20 000 personnes touchées. Bilan par édition et croisade de clôture à Bafoussam."
	breadcrumbs={[{ name: 'Projets & Missions', path: '/projets-missions' }]}
/>

<div>
	<!-- SECTION 02 — INTRODUCTION DU PROJET (Cameroun pour Jésus - 2024-2026) -->
	<PageBanner
		title="Cameroun pour Jésus"
		subtitle="Une stratégie missionnaire nationale (2024–2026) : 1 croisade par région et par an, en collaboration étroite avec les églises locales pour impacter durablement notre nation."
		breadcrumbLabel="Projets & Missions"
		backgroundImage="/article-evangelisation.jpg"
	/>

	<!-- SECTION 03, 04, 05 — LE PROJET EN DÉTAIL, LES 4 AXES & CHIFFRES CLÉS -->
	<ProjectAxesAndStats />

	<!-- Chronologie 2024-2026 et croisade de clôture (pressbook « Bafoussam pour Jésus ») -->
	<CpjTimelineSection finalCrusadeHref={data.finalCrusadeHref} />

	<!-- Les 20 campagnes précédentes, ville par ville -->
	<CpjEditionsSection />

	<!-- Catalogue des projets de terrain -->
	<ProjectsListSection />

	<!-- SECTION 06 — CARTE INTERACTIVE DES MISSIONS (Villes visitées, à venir, équipes) -->
	<MapSection />

	<!-- SECTION 07 — CATÉGORIES DE TÉMOIGNAGES (Conversion, Pardon, Guérison, Transformation) -->
	<TestimonyCategoriesSection />

	<!-- Projet phare à la une -->
	<ProjectsSpotlight ctaHref="/faire-un-don#don" ctaLabel="Soutenir cette mission" />

	<!-- Les manières concrètes de participer -->
	<ProjectsHowToEngage />

	<!-- SECTION 08 — APPEL À PARTICIPER (Rejoignez-nous dans cette grande moisson) -->
	<DonationCtaSection
		eyebrow="APPEL À LA MISSION"
		title="Rejoignez-nous dans cette grande moisson"
		description="Il reste encore 10 villes à parcourir. Soyez partenaire de cette vision et participez à la transformation du Cameroun par l'Évangile."
		ctaLabel="Participer à la mission"
		ctaHref="/nous-rejoindre"
		secondaryCtaLabel="Faire un don"
		secondaryCtaHref="/faire-un-don#don"
		onSecondaryCtaClick={() => donationDialog.show('Le programme « Cameroun pour Jésus »')}
	/>
</div>
