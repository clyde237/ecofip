<script lang="ts">
	import Seo from '$lib/design-system/components/Seo.svelte';
	import { SITE_URL } from '$lib/config/site.js';
	import PageBanner from '$lib/design-system/patterns/PageBanner.svelte';
	import {
		AboutPresentation,
		AboutEngagements,
		AboutValues,
		AboutTimeline,
		AboutQuoteBanner,
		AboutTeam,
		AboutCtaSection
	} from '$lib';
	import type { PageData } from './$types.js';

	let { data }: { data: PageData } = $props();
</script>

<Seo
	title="À propos d’ECOFIP — Vision, histoire et mission au Cameroun"
	description="ECOFIP, département d’évangélisation de Go International Ministry fondé par le Pasteur Valéry Tchamekwen : vision, valeurs, équipe et programme « Cameroun pour Jésus »."
	breadcrumbs={[{ name: 'À propos', path: '/a-propos' }]}
	jsonLd={{
		'@type': 'AboutPage',
		name: 'À propos d’ECOFIP',
		about: { '@id': `${SITE_URL}/#organization` }
	}}
/>

<div>
	<!-- Bannière principale de la page À Propos -->
	<PageBanner
		title="Des Économes Fidèles et Prudents au Service du Royaume de Dieu"
		subtitle="Né d’une vision d’obéissance à la Grande Commission et d’un amour profond pour notre prochain, ECOFIP est un mouvement chrétien évangélique et humanitaire engagé à proclamer l’Évangile, former des disciples affermis et apporter une aide concrète aux communautés à travers le Cameroun."
		breadcrumbLabel="À propos de nous"
		backgroundImage="/about-worship-hd.jpg"
	/>

	<!-- Section Présentation du Mouvement & Porteur de Vision (Pasteur Valery Tchamekwen) -->
	<AboutPresentation
		image="/pasteur-valery-tchamekwen.png"
		imageAlt="Pasteur Valery Tchamekwen — Porteur de vision ECOFIP"
		badgeTitle="Pasteur Valery Tchamekwen"
		badgeSubtitle="Porteur de vision ECOFIP"
		ctaHref="#engagements"
	/>

	<!-- Section Les Trois Engagements (Vision, Mission, Appel) -->
	<AboutEngagements />

	<!-- Section Nos Valeurs (Foi, Fidélité, Amour, Excellence) -->
	<AboutValues />

	<!-- Section Notre Parcours (Chronologie historique) -->
	<AboutTimeline />

	<!-- Bannière Citation Biblique Rouge (1 Corinthiens 4:2) -->
	<AboutQuoteBanner />

	<!-- Section Notre Équipe (gérée depuis l'admin ; masquée si aucun membre n'est publié) -->
	{#if data.teamMembers === null}
		<AboutTeam />
	{:else if data.teamMembers.length > 0}
		<AboutTeam members={data.teamMembers} />
	{/if}

	<!-- Section Finale CTA (Vous souhaitez avancer avec nous ?) -->
	<AboutCtaSection />
</div>
