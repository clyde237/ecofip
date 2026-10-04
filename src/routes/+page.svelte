<script lang="ts">
	import {
		Hero,
		StatsBar,
		AboutSection,
		EventsSection,
		TestimonialsSection,
		VideoSection,
		MapSection,
		NewsSection,
		DonationCtaSection,
		Modal,
		Button,
		Input,
		toast
	} from '$lib';
	import type { PageData } from './$types.js';

	let { data }: { data: PageData } = $props();

	// État de la modale de don
	let isModalOpen = $state(false);
	let donationAmount = $state('50');
	let selectedCause = $state<'medical' | 'education'>('medical');

	function handleConfirmDonation() {
		isModalOpen = false;
		toast.success(
			'Votre promesse de don a été validée avec succès ! Que Dieu vous bénisse.',
			'Merci pour votre soutien'
		);
	}
</script>

<svelte:head>
	<title>ECOFIP — Les Économes Fidèles et Prudents | Mouvement Chrétien & Humanitaire</title>
	<meta
		name="description"
		content="Site officiel d'ECOFIP : réveil spirituel, actions concrètes, campagnes missionnaires et soutien aux communautés."
	/>
</svelte:head>

<div>
	<!-- Hero Pattern officiel ECOFIP -->
	<Hero />

	<!-- Barre des statistiques clés (flottant à l'intersection avec décompte dynamique) -->
	<StatsBar />

	<!-- Section À propos d'ECOFIP (Vision, Mission, Valeurs et Call To Action) -->
	<AboutSection />

	<!-- Section Nos Projets & Événements (Cartes d'actions concrètes, dates et inscriptions) -->
	<EventsSection />

	<!-- Section Témoignages (Fond Rouge officiel, Glassmorphism, Portraits et Vies transformées) -->
	<TestimonialsSection />

	<!-- Section Vidéo Pleine Largeur (Temps forts, Rétrospective et Impact) -->
	<VideoSection chapters={data.videos && data.videos.length > 0 ? data.videos : undefined} />

	<!-- Section Carte Interactive Leaflet (Présence nationale, croisades et missions) -->
	<MapSection />

	<!-- Section Actualités & Dernières Nouvelles (3 articles, filtres et liens) -->
	<NewsSection />

	<!-- Dernière Section : Soutenez la Mission (Donation CTA avec dégradé et image de fond) -->
	<DonationCtaSection onCtaClick={() => (isModalOpen = true)} />
</div>

<!-- Modale de don interactive -->
<Modal
	bind:open={isModalOpen}
	title="Faire un don à la mission ECOFIP"
	description="Votre générosité permet de financer les croisades d'évangélisation, les soins médicaux et l'aide aux orphelins."
>
	<div class="space-y-5 py-2">
		<p class="font-body text-sm font-semibold text-text-primary">
			Sélectionnez l'action que vous souhaitez soutenir en priorité :
		</p>
		<div class="grid grid-cols-2 gap-3">
			<button
				type="button"
				onclick={() => (selectedCause = 'medical')}
				class="cursor-pointer rounded-xl border-2 p-3.5 text-center transition-all {selectedCause ===
				'medical'
					? 'border-brand-primary bg-brand-subtle'
					: 'border-border bg-white hover:border-brand-primary/50'}"
			>
				<div class="text-sm font-bold text-brand-primary">Missions Médicales</div>
				<div class="mt-1 text-xs text-text-secondary">Équipements et soins</div>
			</button>
			<button
				type="button"
				onclick={() => (selectedCause = 'education')}
				class="cursor-pointer rounded-xl border-2 p-3.5 text-center transition-all {selectedCause ===
				'education'
					? 'border-brand-primary bg-brand-subtle'
					: 'border-border bg-white hover:border-brand-primary/50'}"
			>
				<div class="text-sm font-bold text-text-primary">Éducation & Écoles</div>
				<div class="mt-1 text-xs text-text-secondary">Fournitures scolaires</div>
			</button>
		</div>
		<Input
			label="Montant du don (€)"
			type="number"
			bind:value={donationAmount}
			placeholder="50"
			required
		/>
	</div>

	{#snippet actions()}
		<Button variant="outline" size="md" onclick={() => (isModalOpen = false)}>Annuler</Button>
		<Button variant="primary" size="md" onclick={handleConfirmDonation}>Confirmer le don</Button>
	{/snippet}
</Modal>
