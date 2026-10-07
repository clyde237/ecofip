<script lang="ts">
	/**
	 * Visionneuse plein écran des photos et vidéos de la galerie.
	 * Flèches clavier / boutons pour naviguer dans « items », Échap pour fermer.
	 */
	import {
		X,
		ChevronLeft,
		ChevronRight,
		MapPin,
		Calendar,
		Share2,
		CheckCircle2
	} from '@lucide/svelte';
	import type { MediaItem } from '../types.js';
	import { toast } from '../toast.svelte.js';

	interface Props {
		items: MediaItem[];
		index?: number;
		open?: boolean;
	}

	let { items, index = $bindable(0), open = $bindable(false) }: Props = $props();

	let hasCopiedLink = $state(false);

	let currentMedia = $derived(index >= 0 && index < items.length ? items[index] : null);

	$effect(() => {
		if (open) hasCopiedLink = false;
	});

	function handlePrev() {
		if (items.length <= 1) return;
		index = (index - 1 + items.length) % items.length;
	}

	function handleNext() {
		if (items.length <= 1) return;
		index = (index + 1) % items.length;
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (!open) return;
		if (e.key === 'Escape') {
			open = false;
		} else if (e.key === 'ArrowLeft') {
			handlePrev();
		} else if (e.key === 'ArrowRight') {
			handleNext();
		}
	}

	function handleShare() {
		navigator.clipboard?.writeText(window.location.href);
		hasCopiedLink = true;
		toast.success('Lien de la galerie copié !', 'Partage');
		setTimeout(() => {
			hasCopiedLink = false;
		}, 3000);
	}
</script>

<svelte:window onkeydown={handleKeyDown} />

{#if open && currentMedia}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-3 backdrop-blur-md sm:p-6"
		role="dialog"
		aria-modal="true"
		aria-label="Visionneuse de média"
	>
		<!-- Bouton Fermer -->
		<button
			type="button"
			onclick={() => (open = false)}
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
						{#if currentMedia.location}
							<span class="flex items-center gap-1 font-body text-xs text-white/70">
								<MapPin size={13} class="text-brand-accent" />
								<span>{currentMedia.location}</span>
							</span>
						{/if}
						{#if currentMedia.location && currentMedia.date}
							<span class="text-white/40">•</span>
						{/if}
						{#if currentMedia.date}
							<span class="flex items-center gap-1 font-body text-xs text-white/70">
								<Calendar size={13} />
								<span>{currentMedia.date}</span>
							</span>
						{/if}
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
