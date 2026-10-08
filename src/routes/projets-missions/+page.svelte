<script lang="ts">
	import PageBanner from '$lib/design-system/patterns/PageBanner.svelte';
	import {
		ProjectsListSection,
		ProjectsSpotlight,
		ProjectsHowToEngage,
		DonationCtaSection,
		MapSection,
		Modal,
		Button,
		Input
	} from '$lib';
	import ProjectAxesAndStats from '$lib/design-system/patterns/ProjectAxesAndStats.svelte';
	import TestimonyCategoriesSection from '$lib/design-system/patterns/TestimonyCategoriesSection.svelte';
	import { Heart } from '@lucide/svelte';
	import { toast } from '$lib/design-system/toast.svelte.js';

	let isDonationModalOpen = $state(false);
	let selectedProjectCause = $state<'evangelisation' | 'sante' | 'disciples'>('evangelisation');
</script>

<svelte:head>
	<title>Projets & Missions — Cameroun pour Jésus | ECOFIP</title>
	<meta
		name="description"
		content="« Cameroun pour Jésus » : stratégie missionnaire sur 3 ans (2024-2026) visant à toucher systématiquement les 10 régions du pays avec l'Évangile et des actions humanitaires."
	/>
</svelte:head>

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

	<!-- Catalogue des projets de terrain -->
	<ProjectsListSection />

	<!-- SECTION 06 — CARTE INTERACTIVE DES MISSIONS (Villes visitées, à venir, équipes) -->
	<MapSection />

	<!-- SECTION 07 — CATÉGORIES DE TÉMOIGNAGES (Conversion, Pardon, Guérison, Transformation) -->
	<TestimonyCategoriesSection />

	<!-- Projet phare à la une -->
	<ProjectsSpotlight ctaHref="/faire-un-don" ctaLabel="Soutenir cette mission" />

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
		secondaryCtaHref="/faire-un-don"
		onCtaClick={() => (isDonationModalOpen = true)}
	/>
</div>

<!-- Modal interactive de soutien aux projets -->
<Modal
	bind:open={isDonationModalOpen}
	title="Soutenir un projet de mission ECOFIP"
	description="« Semez dans l'œuvre de Dieu pour bénir des vies et propager l'Évangile au Cameroun. »"
>
	<div class="space-y-5 py-2">
		<p class="font-body text-sm font-semibold text-text-primary">
			Choisissez le domaine d’action que vous souhaitez parrainer en priorité :
		</p>
		<div class="grid grid-cols-3 gap-2.5">
			<button
				type="button"
				onclick={() => (selectedProjectCause = 'evangelisation')}
				class="cursor-pointer rounded-xl border-2 p-3 text-center transition-all {selectedProjectCause ===
				'evangelisation'
					? 'border-brand-primary bg-brand-subtle'
					: 'border-border bg-white hover:border-brand-primary/50'}"
			>
				<div class="text-xs font-bold text-brand-primary sm:text-sm">Croisades</div>
				<div class="mt-0.5 text-[11px] text-text-secondary">Évangélisation</div>
			</button>
			<button
				type="button"
				onclick={() => (selectedProjectCause = 'sante')}
				class="cursor-pointer rounded-xl border-2 p-3 text-center transition-all {selectedProjectCause ===
				'sante'
					? 'border-brand-primary bg-brand-subtle'
					: 'border-border bg-white hover:border-brand-primary/50'}"
			>
				<div class="text-xs font-bold text-brand-primary sm:text-sm">Cliniques Mobiles</div>
				<div class="mt-0.5 text-[11px] text-text-secondary">Santé & Vivres</div>
			</button>
			<button
				type="button"
				onclick={() => (selectedProjectCause = 'disciples')}
				class="cursor-pointer rounded-xl border-2 p-3 text-center transition-all {selectedProjectCause ===
				'disciples'
					? 'border-brand-primary bg-brand-subtle'
					: 'border-border bg-white hover:border-brand-primary/50'}"
			>
				<div class="text-xs font-bold text-brand-primary sm:text-sm">Discipulat</div>
				<div class="mt-0.5 text-[11px] text-text-secondary">Bibles & Cours</div>
			</button>
		</div>

		<div class="space-y-2">
			<span class="block font-body text-xs font-semibold text-text-secondary">
				Montant suggéré (FCFA)
			</span>
			<div class="grid grid-cols-3 gap-2.5">
				<button
					type="button"
					class="cursor-pointer rounded-xl border border-border bg-white py-2.5 text-center font-body text-sm font-bold text-text-primary hover:border-brand-primary/50 hover:bg-brand-subtle/30"
				>
					10 000 F
				</button>
				<button
					type="button"
					class="cursor-pointer rounded-xl border-2 border-brand-primary bg-brand-subtle py-2.5 text-center font-body text-sm font-bold text-brand-primary"
				>
					25 000 F
				</button>
				<button
					type="button"
					class="cursor-pointer rounded-xl border border-border bg-white py-2.5 text-center font-body text-sm font-bold text-text-primary hover:border-brand-primary/50 hover:bg-brand-subtle/30"
				>
					50 000 F
				</button>
			</div>
		</div>

		<Input label="Montant libre (FCFA)" type="number" placeholder="Ex: 30 000" />
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
