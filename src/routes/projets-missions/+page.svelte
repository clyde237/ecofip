<script lang="ts">
	import {
		ProjectsHero,
		ProjectsListSection,
		ProjectsSpotlight,
		ProjectsHowToEngage,
		DonationCtaSection,
		Modal,
		Button,
		Input
	} from '$lib';
	import { Heart } from '@lucide/svelte';
	import { toast } from '$lib/design-system/toast.svelte.js';

	let isDonationModalOpen = $state(false);
	let selectedProjectCause = $state<'evangelisation' | 'sante' | 'disciples'>('evangelisation');
</script>

<svelte:head>
	<title>Projets & Missions — Actions et Impact sur le Terrain | ECOFIP</title>
	<meta
		name="description"
		content="Découvrez l’ensemble des projets et missions d’ECOFIP : grandes croisades d’évangélisation, cliniques mobiles gratuites, formations bibliques et centres communautaires au Cameroun."
	/>
	<meta property="og:title" content="Projets & Missions — Actions Terrain ECOFIP" />
	<meta
		property="og:description"
		content="Découvrez les actions d’évangélisation et d’aide communautaire portées par ECOFIP à travers tout le Cameroun."
	/>
	<meta property="og:type" content="website" />
</svelte:head>

<div>
	<!-- 1. Bannière simple, aérée et épurée -->
	<ProjectsHero />

	<!-- 2. Catalogue complet des projets avec filtres interactifs par catégorie -->
	<ProjectsListSection />

	<!-- 3. Projet phare à la une (Cliniques Mobiles & Soins aux plus vulnérables) -->
	<ProjectsSpotlight ctaHref="#faire-un-don" ctaLabel="Soutenir cette mission" />

	<!-- 4. Les 3 manières concrètes de participer (Prier, Devenir bénévole, Donner) -->
	<ProjectsHowToEngage />

	<!-- 5. Appel final à la générosité et au partenariat -->
	<DonationCtaSection onCtaClick={() => (isDonationModalOpen = true)} />
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
