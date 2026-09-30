<script lang="ts">
	import {
		GalleryHero,
		GalleryGridSection,
		GalleryShareCta,
		DonationCtaSection,
		Modal,
		Button,
		Input
	} from '$lib';
	import { defaultMediaItems } from '$lib/design-system/patterns/GalleryGridSection.svelte';
	import type { MediaItem } from '$lib/design-system/types.js';
	import {
		X,
		ChevronLeft,
		ChevronRight,
		MapPin,
		Calendar,
		Share2,
		CheckCircle2,
		Heart,
		Film
	} from '@lucide/svelte';
	import { toast } from '$lib/design-system/toast.svelte.js';

	let isLightboxOpen = $state(false);
	let currentMediaIndex = $state<number>(0);
	let currentMediaList = $state<MediaItem[]>(defaultMediaItems);
	let hasCopiedLink = $state(false);

	let isDonationModalOpen = $state(false);

	let currentMedia = $derived(
		currentMediaList.length > 0 &&
			currentMediaIndex >= 0 &&
			currentMediaIndex < currentMediaList.length
			? currentMediaList[currentMediaIndex]
			: null
	);

	function handleOpenLightbox(media: MediaItem, index: number) {
		currentMediaIndex = index;
		hasCopiedLink = false;
		isLightboxOpen = true;
	}

	function handlePrev() {
		if (currentMediaList.length <= 1) return;
		currentMediaIndex = (currentMediaIndex - 1 + currentMediaList.length) % currentMediaList.length;
	}

	function handleNext() {
		if (currentMediaList.length <= 1) return;
		currentMediaIndex = (currentMediaIndex + 1) % currentMediaList.length;
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (!isLightboxOpen) return;
		if (e.key === 'Escape') {
			isLightboxOpen = false;
		} else if (e.key === 'ArrowLeft') {
			handlePrev();
		} else if (e.key === 'ArrowRight') {
			handleNext();
		}
	}

	function handleShare() {
		if (typeof window !== 'undefined') {
			navigator.clipboard?.writeText(window.location.href);
			hasCopiedLink = true;
			toast.success('Lien de la photo copié !', 'Partage');
			setTimeout(() => {
				hasCopiedLink = false;
			}, 3000);
		}
	}
</script>

<svelte:window onkeydown={handleKeyDown} />

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
	<!-- 1. Bannière d'introduction avec fil d'ariane et filtres rapides -->
	<GalleryHero />

	<!-- 2. Grille complète des photos & vidéos avec filtres dynamiques -->
	<GalleryGridSection
		onSelectMedia={(media, index) => {
			handleOpenLightbox(media, index);
		}}
	/>

	<!-- 3. Section Appel à contributions photos et vidéos des fidèles -->
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

<!-- Modal Lightbox interactive plein écran pour photos et vidéos -->
{#if isLightboxOpen && currentMedia}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-3 backdrop-blur-md sm:p-6"
		role="dialog"
		aria-modal="true"
		aria-label="Visionneuse de média"
	>
		<!-- Bouton Fermer -->
		<button
			type="button"
			onclick={() => (isLightboxOpen = false)}
			class="absolute top-4 right-4 z-50 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-white"
			aria-label="Fermer la visionneuse"
		>
			<X size={22} />
		</button>

		<!-- Bouton Précédent -->
		<button
			type="button"
			onclick={handlePrev}
			class="absolute top-1/2 left-3 z-50 flex h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-all hover:scale-105 hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-white sm:left-6"
			aria-label="Média précédent"
		>
			<ChevronLeft size={26} />
		</button>

		<!-- Bouton Suivant -->
		<button
			type="button"
			onclick={handleNext}
			class="absolute top-1/2 right-3 z-50 flex h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-all hover:scale-105 hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-white sm:right-6"
			aria-label="Média suivant"
		>
			<ChevronRight size={26} />
		</button>

		<!-- Conteneur central du média -->
		<div
			class="relative flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-white/15 bg-[#0d1c1d] shadow-2xl"
		>
			<!-- Zone Visuelle (Photo ou Vidéo) -->
			<div class="relative flex max-h-[65vh] w-full items-center justify-center bg-black">
				{#if currentMedia.type === 'video' && currentMedia.videoUrl}
					<!-- Lecteur vidéo HTML5 avec contrôles complets -->
					<video
						src={currentMedia.videoUrl}
						poster={currentMedia.url}
						controls
						autoplay
						class="max-h-[65vh] w-full object-contain"
					>
						<track kind="captions" />
						Votre navigateur ne supporte pas la lecture vidéo.
					</video>
				{:else}
					<!-- Photo plein format -->
					<img
						src={currentMedia.url}
						alt={currentMedia.title}
						class="max-h-[65vh] w-full object-contain select-none"
					/>
				{/if}
			</div>

			<!-- Zone descriptive basse -->
			<div
				class="flex flex-col justify-between gap-4 p-5 text-white sm:flex-row sm:items-center sm:p-7"
			>
				<div>
					<div class="flex flex-wrap items-center gap-2.5">
						<span
							class="rounded-full bg-brand-primary px-3 py-1 font-body text-xs font-bold tracking-wider text-white uppercase"
						>
							{currentMedia.category}
						</span>
						<span class="flex items-center gap-1 font-body text-xs text-white/70">
							<MapPin size={13} class="text-brand-accent" />
							<span>{currentMedia.location}</span>
						</span>
						<span class="text-white/40">•</span>
						<span class="flex items-center gap-1 font-body text-xs text-white/70">
							<Calendar size={13} />
							<span>{currentMedia.date}</span>
						</span>
					</div>

					<h3 class="mt-2 font-display text-lg font-bold text-white sm:text-xl">
						{currentMedia.title}
					</h3>

					{#if currentMedia.description}
						<p class="mt-1 font-body text-xs text-white/80 sm:text-sm">
							{currentMedia.description}
						</p>
					{/if}
				</div>

				<!-- Actions : Partage et compteur -->
				<div class="flex shrink-0 items-center gap-3">
					<button
						type="button"
						onclick={handleShare}
						class="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3.5 py-2 font-body text-xs font-semibold text-white backdrop-blur-xs transition-colors hover:bg-white/20"
					>
						{#if hasCopiedLink}
							<CheckCircle2 size={14} class="text-emerald-400" />
							<span class="text-emerald-400">Lien copié</span>
						{:else}
							<Share2 size={14} />
							<span>Partager</span>
						{/if}
					</button>

					<a
						href={currentMedia.url}
						target="_blank"
						rel="noopener noreferrer"
						download
						class="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-brand-primary px-4 py-2 font-body text-xs font-bold text-white shadow-xs transition-all hover:bg-brand-primary-hover"
					>
						<span>Télécharger HD</span>
					</a>
				</div>
			</div>
		</div>
	</div>
{/if}

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
