<script lang="ts">
	import PageBanner from '$lib/design-system/patterns/PageBanner.svelte';
	import {
		GalleryGridSection,
		GalleryShareCta,
		DonationCtaSection,
		Modal,
		Button,
		Input
	} from '$lib';
	import { defaultMediaItems } from '$lib/design-system/patterns/GalleryGridSection.svelte';
	import type { MediaItem } from '$lib/design-system/types.js';
	import { Heart } from '@lucide/svelte';
	import GalleryLightbox from '$lib/design-system/components/GalleryLightbox.svelte';
	import GalleryAlbumsSection from '$lib/design-system/patterns/GalleryAlbumsSection.svelte';
	import { toast } from '$lib/design-system/toast.svelte.js';
	import type { PageData } from './$types.js';

	let { data }: { data: PageData } = $props();

	let isLightboxOpen = $state(false);
	let lightboxIndex = $state(0);
	let lightboxItems = $state<MediaItem[]>(defaultMediaItems);
	let isDonationModalOpen = $state(false);

	// Contenu par défaut (base indisponible) : la visionneuse parcourt les médias affichés
	function handleOpenLightbox(list: MediaItem[], index: number) {
		lightboxItems = list;
		lightboxIndex = Math.max(index, 0);
		isLightboxOpen = true;
	}
</script>

<svelte:head>
	<title>Galerie — Photothèque & Vidéothèque de la Mission | ECOFIP</title>
	<meta
		name="description"
		content="Explorez les archives photos et vidéos des grandes croisades, cliniques mobiles gratuites, camps de jeunesse et actions communautaires portées par ECOFIP au Cameroun."
	/>
	<meta property="og:title" content="Galerie Multimédia & Archives Missionnaires — ECOFIP" />
	<meta
		property="og:description"
		content="Revivez la mission ECOFIP en photos haute définition et reportages vidéos immersifs."
	/>
	<meta property="og:type" content="website" />
</svelte:head>

<div>
	<!-- SECTION 02 — Introduction -->
	<PageBanner
		title="Photos & Vidéos"
		subtitle="Revivez les moments forts de nos missions à travers le Cameroun."
		breadcrumbLabel="Galerie"
		backgroundImage="/video-highlights-cover.jpg"
	/>

	<!-- SECTIONS 03, 04, 05 — Albums gérés depuis l'admin ; contenu par défaut si la base est indisponible -->
	{#if data.albums !== null}
		<GalleryAlbumsSection albums={data.albums} />
	{:else}
		<GalleryGridSection onSelectMedia={(_media, index, list) => handleOpenLightbox(list, index)} />
	{/if}

	<!-- SECTION 06 — Réseaux sociaux -->
	<GalleryShareCta />

	<!-- 4. Appel au soutien média & audiovisuel de la mission -->
	<DonationCtaSection
		eyebrow="ÉQUIPEMENT AUDIOVISUEL & MÉDIAS"
		title="Aidez-nous à diffuser l’Évangile par l’image et le son"
		description="Vos dons financent l’équipement des régies mobiles, les caméras de captation des croisades et la retransmission en direct pour toucher les âmes au-delà des frontières."
		ctaLabel="Soutenir le pôle multimédia"
		onCtaClick={() => (isDonationModalOpen = true)}
	/>
</div>

<!-- Visionneuse plein écran (contenu par défaut uniquement) -->
<GalleryLightbox items={lightboxItems} bind:index={lightboxIndex} bind:open={isLightboxOpen} />

<!-- Modal interactive de don audiovisuel -->
<Modal
	bind:open={isDonationModalOpen}
	title="Soutenir les équipements audiovisuels et multimédias"
	description="« Que la parole du Seigneur se répande et soit glorifiée. »"
>
	<div class="space-y-4 py-2">
		<p class="font-body text-sm font-semibold text-text-primary">
			Sélectionnez l'équipement que vous souhaitez soutenir :
		</p>
		<div class="grid grid-cols-3 gap-2.5">
			<div class="rounded-xl border-2 border-brand-primary bg-brand-subtle p-3 text-center">
				<div class="text-xs font-bold text-brand-primary sm:text-sm">Régie Vidéo</div>
				<div class="mt-0.5 text-[11px] text-text-secondary">Direct streaming</div>
			</div>
			<div class="rounded-xl border border-border bg-white p-3 text-center">
				<div class="text-xs font-bold text-text-primary sm:text-sm">Sonorisation</div>
				<div class="mt-0.5 text-[11px] text-text-secondary">Enceintes & Micros</div>
			</div>
			<div class="rounded-xl border border-border bg-white p-3 text-center">
				<div class="text-xs font-bold text-text-primary sm:text-sm">Éclairage</div>
				<div class="mt-0.5 text-[11px] text-text-secondary">Projecteurs scène</div>
			</div>
		</div>

		<Input label="Montant du parrainage matériel (FCFA)" type="number" placeholder="Ex: 50 000" />
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
					'Merci infiniment pour votre investissement dans l’équipement de la moisson !',
					'Don validé'
				);
			}}
		>
			<Heart size={16} class="mr-1.5 fill-white text-white" />
			Valider mon don
		</Button>
	{/snippet}
</Modal>
