<script lang="ts">
	import {
		AboutHero,
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

<svelte:head>
	<title>À propos d'ECOFIP — Vision, Histoire & Mission Chrétienne</title>
	<meta
		name="description"
		content="Découvrez l'histoire, la vision biblique et les actions d'ECOFIP : un mouvement chrétien engagé pour le réveil spirituel, la formation de disciples et le soutien aux communautés au Cameroun."
	/>
	<meta property="og:title" content="À propos d'ECOFIP — Économes Fidèles et Prudents" />
	<meta
		property="og:description"
		content="Découvrez l'histoire, la vision biblique et les actions d'ECOFIP au Cameroun."
	/>
	<meta property="og:type" content="website" />
</svelte:head>

<div>
	<!-- Bannière principale de la page À Propos -->
	<AboutHero />

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
