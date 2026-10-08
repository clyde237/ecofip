<script lang="ts">
	import { onMount, tick } from 'svelte';
	import Container from '../components/Container.svelte';
	import LinkifiedText from '../components/LinkifiedText.svelte';
	import {
		Play,
		Pause,
		Volume2,
		VolumeX,
		Maximize2,
		RotateCcw,
		Film,
		Globe,
		Flame,
		HeartHandshake
	} from '@lucide/svelte';
	import type { VideoChapter, VideoSectionProps } from '../types.js';
	import { IMPACT, formatNumber } from '$lib/data/camerounPourJesus.js';

	const defaultChapters: VideoChapter[] = [
		{
			id: 'croisade-yaounde',
			title: 'Grande Croisade & Nuit d’Évangélisation',
			location: 'Yaoundé · Esplanade Omnisports',
			duration: '04:35',
			thumbnail: '/video-highlights-cover.jpg',
			videoUrl:
				'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
			description:
				'Revivez la ferveur, les prières et les proclamations de foi lors de la grande croisade nationale.'
		},
		{
			id: 'action-humanitaire',
			title: 'Secours d’Amour & Action Humanitaire',
			location: 'Extrême-Nord & Zones rurales',
			duration: '03:12',
			thumbnail: '/event-seminaire.jpg',
			videoUrl:
				'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
			description:
				'Distribution de vivres, kits scolaires et soutien pastoral aux familles et orphelins dans les villages.'
		},
		{
			id: 'camp-jeunesse',
			title: 'Camp National de la Jeunesse & Discipulat',
			location: 'Mont Fébé · Yaoundé',
			duration: '05:20',
			thumbnail: '/event-camp.jpg',
			videoUrl:
				'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
			description:
				'Immersion spirituelle, louange vibrante et formation biblique de la prochaine génération d’ouvriers.'
		}
	];

	let {
		eyebrow = 'TEMPS FORTS DU MOUVEMENT',
		title = 'Vivre la puissance de Dieu en action :',
		highlightedTitle = 'nos temps forts en vidéo',
		description = 'Plongez au cœur de nos croisades d’évangélisation, de nos actions humanitaires et de nos rassemblements de prière à travers tout le Cameroun.',
		mainVideoCover = '/video-highlights-cover.jpg',
		chapters = defaultChapters,
		class: customClass = ''
	}: VideoSectionProps = $props();

	let sectionEl: HTMLElement | null = $state(null);
	let isVisible = $state(false);

	// États du lecteur vidéo
	let activeChapterIndex = $state(0);
	let isPlaying = $state(false);
	// Démarre en muet : les navigateurs n'autorisent la lecture automatique que sans le son
	let isMuted = $state(true);
	let videoEl: HTMLVideoElement | null = $state(null);
	let playerEl: HTMLElement | null = $state(null);
	let progress = $state(0);
	let currentTimeFormatted = $state('00:00');

	// Lecture automatique quand le lecteur est visible, sauf si le visiteur a mis en pause lui-même
	let isPlayerInView = false;
	let userPaused = false;

	let activeChapter = $derived(chapters[activeChapterIndex] || defaultChapters[0]);

	function playVideo() {
		if (!videoEl) return;
		videoEl
			.play()
			.then(() => (isPlaying = true))
			.catch((err: unknown) => {
				// Lecture avec le son refusée par le navigateur : nouvelle tentative en muet.
				// Les autres échecs (pause ou changement de source pendant le chargement) sont ignorés.
				const blocked = err instanceof DOMException && err.name === 'NotAllowedError';
				if (blocked && videoEl && !videoEl.muted) {
					isMuted = true;
					videoEl.muted = true;
					videoEl
						.play()
						.then(() => (isPlaying = true))
						.catch(() => (isPlaying = false));
				} else if (videoEl?.paused) {
					isPlaying = false;
				}
			});
	}

	function autoplay() {
		if (!videoEl || userPaused || !isPlayerInView || !videoEl.paused) return;
		playVideo();
	}

	async function selectChapter(index: number) {
		activeChapterIndex = index;
		progress = 0;
		currentTimeFormatted = '00:00';
		userPaused = false;
		// Attendre que la nouvelle source soit appliquée avant de lancer la lecture
		await tick();
		playVideo();
	}

	function togglePlay() {
		if (!videoEl) return;
		if (videoEl.paused) {
			userPaused = false;
			playVideo();
		} else {
			userPaused = true;
			videoEl.pause();
			isPlaying = false;
		}
	}

	function toggleMute() {
		isMuted = !isMuted;
	}

	function restartVideo() {
		if (videoEl) {
			videoEl.currentTime = 0;
			userPaused = false;
			playVideo();
		}
	}

	function toggleFullscreen() {
		if (!videoEl) return;
		if (document.fullscreenElement) {
			document.exitFullscreen();
		} else {
			videoEl.requestFullscreen?.();
		}
	}

	function handleTimeUpdate() {
		if (!videoEl || !videoEl.duration) return;
		progress = (videoEl.currentTime / videoEl.duration) * 100;
		const mins = Math.floor(videoEl.currentTime / 60);
		const secs = Math.floor(videoEl.currentTime % 60);
		currentTimeFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
	}

	function handleVideoEnded() {
		isPlaying = false;
		progress = 100;
		// Ne pas relancer automatiquement une vidéo terminée quand le lecteur revient à l'écran
		userPaused = true;
	}

	onMount(() => {
		const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (prefersReducedMotion) {
			// Pas de lecture automatique ni d'animation : le visiteur lance la vidéo lui-même
			isVisible = true;
			return;
		}

		// Lecture automatique quand au moins la moitié du lecteur est à l'écran, pause quand il en sort
		const playerObserver = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					isPlayerInView = entry.isIntersecting;
					if (isPlayerInView) {
						autoplay();
					} else if (videoEl && !videoEl.paused) {
						videoEl.pause();
						isPlaying = false;
					}
				}
			},
			{ threshold: 0.5 }
		);
		if (playerEl) playerObserver.observe(playerEl);

		if (!sectionEl) {
			isVisible = true;
			return () => playerObserver.disconnect();
		}

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						isVisible = true;
						observer.disconnect();
						break;
					}
				}
			},
			{ threshold: 0.15 }
		);

		observer.observe(sectionEl);

		return () => {
			observer.disconnect();
			playerObserver.disconnect();
		};
	});
</script>

<!-- Section Vidéo Pleine Largeur (Full-Width) -->
<section
	bind:this={sectionEl}
	class="relative w-full overflow-hidden bg-[#091016] py-16 text-white sm:py-20 lg:py-28 {customClass}"
	aria-labelledby="video-highlights-heading"
>
	<!-- Effets d'ambiance scénique nocturne -->
	<div
		class="pointer-events-none absolute -top-32 -left-32 h-[450px] w-[450px] rounded-full bg-brand-primary/15 blur-3xl"
		aria-hidden="true"
	></div>
	<div
		class="pointer-events-none absolute -right-32 bottom-1/4 h-[420px] w-[420px] rounded-full bg-amber-400/10 blur-3xl"
		aria-hidden="true"
	></div>

	<!-- En-tête textuel dans le Container standard -->
	<Container>
		<div
			class="mx-auto max-w-3xl text-center transition-all duration-700 {isVisible
				? 'translate-y-0 opacity-100'
				: 'translate-y-6 opacity-0'}"
		>
			{#if eyebrow}
				<div
					class="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold tracking-[0.2em] text-white uppercase shadow-xs backdrop-blur-md sm:text-sm"
				>
					<span>{eyebrow}</span>
				</div>
			{/if}

			<h2
				id="video-highlights-heading"
				class="mt-4 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-[46px] lg:leading-[1.16]"
			>
				{title}
				<span class="text-brand-primary">{highlightedTitle}</span>
			</h2>

			{#if description}
				<p
					class="mx-auto mt-4 max-w-2xl font-body text-base leading-relaxed text-white/80 sm:text-lg"
				>
					{description}
				</p>
			{/if}
		</div>
	</Container>

	<!-- Lecteur Vidéo Pleine Largeur Immersif -->
	<div class="mx-auto mt-10 max-w-7xl px-4 sm:mt-12 sm:px-6 lg:px-8">
		<div
			class="group relative overflow-hidden rounded-2xl border border-white/15 bg-black shadow-[0_30px_70px_-15px_rgba(0,0,0,0.8)] transition-all duration-700 sm:rounded-3xl {isVisible
				? 'translate-y-0 opacity-100'
				: 'translate-y-8 opacity-0'}"
			style="transition-delay: 150ms;"
		>
			<!-- Ratio Cinéma 16:9 panoramique -->
			<div bind:this={playerEl} class="relative aspect-video w-full">
				<!-- Lecteur HTML5 Vidéo (actif en lecture) -->
				<video
					bind:this={videoEl}
					src={activeChapter.videoUrl ||
						'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'}
					poster={activeChapter.thumbnail || mainVideoCover}
					bind:muted={isMuted}
					ontimeupdate={handleTimeUpdate}
					onended={handleVideoEnded}
					playsinline
					class="h-full w-full object-cover transition-opacity duration-300 {isPlaying
						? 'opacity-100'
						: 'opacity-0'}"
				>
					<track kind="captions" />
				</video>

				<!-- Couverture d'affiche avec overlays cinématiques (visible tant que non lancé) -->
				{#if !isPlaying}
					<div class="absolute inset-0 z-10">
						<img
							src={activeChapter.thumbnail || mainVideoCover}
							alt={activeChapter.title}
							class="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-102"
						/>
						<!-- Voile dégradé cinéma -->
						<div
							class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/30"
							aria-hidden="true"
						></div>

						<!-- Badge supérieur : 4K UHD & Durée -->
						<div
							class="absolute top-4 right-4 left-4 flex items-center justify-between sm:top-6 sm:right-6 sm:left-6"
						>
							<div
								class="flex items-center gap-2 rounded-full border border-white/20 bg-black/60 px-3.5 py-1.5 text-xs font-bold tracking-wider text-white backdrop-blur-md"
							>
								<span class="h-2 w-2 animate-pulse rounded-full bg-brand-primary"></span>
								<span>{activeChapter.isFeatured ? 'À LA UNE' : 'RÉTROSPECTIVE OFFICIELLE'}</span>
							</div>

							<div
								class="rounded-lg border border-white/15 bg-black/60 px-3 py-1 font-mono text-xs font-bold text-white/90 backdrop-blur-md"
							>
								{activeChapter.duration}
							</div>
						</div>

						<!-- Bouton Play Central Spectaculaire avec Onde Pulsante -->
						<div class="absolute inset-0 flex flex-col items-center justify-center">
							<button
								type="button"
								onclick={togglePlay}
								aria-label="Lire la vidéo : {activeChapter.title}"
								class="group/play flex cursor-pointer flex-col items-center focus:outline-none"
							>
								<div class="relative flex items-center justify-center">
									<!-- Cercles d'ondes animés -->
									<span
										class="absolute h-24 w-24 animate-ping rounded-full bg-brand-primary/40 duration-1000 sm:h-28 sm:w-28"
										aria-hidden="true"
									></span>
									<span
										class="absolute h-20 w-20 rounded-full bg-brand-primary/50 sm:h-24 sm:w-24"
										aria-hidden="true"
									></span>

									<!-- Bouton circulaire rouge central -->
									<div
										class="relative flex h-16 w-16 items-center justify-center rounded-full bg-brand-primary text-white shadow-2xl transition-all duration-300 group-hover/play:scale-110 group-hover/play:bg-brand-primary-hover sm:h-20 sm:w-20"
									>
										<Play size={28} class="ml-1 fill-white text-white" />
									</div>
								</div>

								<span
									class="mt-4 font-body text-xs font-bold tracking-wider text-white uppercase drop-shadow-md sm:text-sm"
								>
									Lancer le film
								</span>
							</button>
						</div>

						<!-- Descriptif inférieur sur l'affiche -->
						<div class="absolute right-4 bottom-4 left-4 sm:right-6 sm:bottom-6 sm:left-6">
							<div class="max-w-2xl">
								<span
									class="font-body text-xs font-semibold text-brand-accent uppercase sm:text-sm"
								>
									{activeChapter.location}
								</span>
								<h3 class="mt-1 font-display text-lg font-bold text-white sm:text-2xl lg:text-3xl">
									{activeChapter.title}
								</h3>
								{#if activeChapter.description}
									<div class="mt-1 font-body text-xs text-white/90 sm:text-sm">
										<LinkifiedText
											text={activeChapter.description}
											linkClass="text-amber-300 font-semibold underline underline-offset-2 hover:text-amber-200 break-all transition-colors"
										/>
									</div>
								{/if}
							</div>
						</div>
					</div>
				{/if}

				<!-- Invitation à activer le son pendant la lecture automatique muette -->
				{#if isPlaying && isMuted}
					<button
						type="button"
						onclick={toggleMute}
						class="absolute top-4 right-4 z-20 inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/20 bg-black/60 px-3.5 py-1.5 font-body text-xs font-bold text-white backdrop-blur-md transition-colors hover:bg-black/80 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none sm:top-6 sm:right-6"
					>
						<VolumeX size={15} />
						<span>Activer le son</span>
					</button>
				{/if}

				<!-- Barre de Contrôles Personnalisés (visible pendant la lecture) -->
				{#if isPlaying}
					<div
						class="absolute right-0 bottom-0 left-0 z-20 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 sm:p-5"
					>
						<!-- Barre de progression de la vidéo -->
						<div
							class="h-1.5 w-full cursor-pointer overflow-hidden rounded-full bg-white/20 transition-all hover:h-2"
						>
							<div
								class="h-full bg-brand-primary transition-all duration-150"
								style="width: {progress}%;"
							></div>
						</div>

						<!-- Boutons de commande -->
						<div class="mt-3 flex items-center justify-between">
							<div class="flex items-center gap-3">
								<button
									type="button"
									onclick={togglePlay}
									class="cursor-pointer text-white transition-colors hover:text-brand-primary"
									aria-label={isPlaying ? 'Pause' : 'Lecture'}
								>
									{#if isPlaying}
										<Pause size={20} class="fill-white" />
									{:else}
										<Play size={20} class="fill-white" />
									{/if}
								</button>

								<button
									type="button"
									onclick={restartVideo}
									class="cursor-pointer text-white/80 transition-colors hover:text-white"
									aria-label="Recommencer"
								>
									<RotateCcw size={17} />
								</button>

								<button
									type="button"
									onclick={toggleMute}
									class="cursor-pointer text-white/80 transition-colors hover:text-white"
									aria-label={isMuted ? 'Activer le son' : 'Couper le son'}
								>
									{#if isMuted}
										<VolumeX size={19} />
									{:else}
										<Volume2 size={19} />
									{/if}
								</button>

								<span class="font-mono text-xs text-white/80">
									{currentTimeFormatted} / {activeChapter.duration}
								</span>
							</div>

							<div class="flex items-center gap-3">
								<span class="hidden font-body text-xs font-semibold text-white/80 sm:inline">
									{activeChapter.title}
								</span>
								<button
									type="button"
									onclick={toggleFullscreen}
									class="cursor-pointer text-white/80 transition-colors hover:text-white"
									aria-label="Plein écran"
								>
									<Maximize2 size={18} />
								</button>
							</div>
						</div>
					</div>
				{/if}
			</div>
		</div>

		<!-- Sélecteur de Chapitres / Temps Forts (3 cartes sous le lecteur) -->
		<div class="mt-6 grid grid-cols-1 gap-4 sm:mt-8 sm:grid-cols-3">
			{#each chapters as chapter, idx (chapter.id)}
				{@const isActive = idx === activeChapterIndex}
				<button
					type="button"
					onclick={() => selectChapter(idx)}
					class="group flex cursor-pointer items-center gap-3.5 rounded-2xl border p-3.5 text-left transition-all duration-300 sm:p-4 {isActive
						? 'border-brand-primary bg-white/12 shadow-md ring-1 ring-brand-primary'
						: 'border-white/15 bg-white/[0.04] hover:border-white/30 hover:bg-white/[0.08]'}"
				>
					<!-- Miniature avec icône play -->
					<div
						class="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-black/50 sm:h-18 sm:w-24"
					>
						<img
							src={chapter.thumbnail}
							alt={chapter.title}
							class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
						/>
						<div
							class="absolute inset-0 flex items-center justify-center bg-black/40 {isActive
								? 'bg-brand-primary/40'
								: ''}"
						>
							<Play size={15} class="fill-white text-white" />
						</div>
						<span
							class="absolute right-1.5 bottom-1.5 rounded-sm bg-black/70 px-1 py-0.5 font-mono text-[9px] text-white"
						>
							{chapter.duration}
						</span>
					</div>

					<!-- Informations du temps fort -->
					<div class="min-w-0 flex-1">
						<span
							class="font-body text-[10px] font-bold tracking-wider text-brand-primary uppercase"
						>
							{chapter.location}
						</span>
						<h4
							class="mt-0.5 line-clamp-2 font-display text-xs font-bold text-white transition-colors group-hover:text-brand-accent sm:text-sm"
						>
							{chapter.title}
						</h4>
					</div>
				</button>
			{/each}
		</div>

		<!-- Bandeau d'Impact & Chiffres clés du mouvement -->
		<div
			class="mt-12 grid grid-cols-2 gap-4 rounded-2xl border border-white/15 bg-white/[0.04] p-5 backdrop-blur-md sm:mt-16 sm:grid-cols-4 sm:p-6"
		>
			<div class="flex items-center gap-3">
				<div
					class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary/20 text-brand-primary"
				>
					<Film size={20} />
				</div>
				<div>
					<div class="font-display text-base font-bold text-white sm:text-lg">+120 h</div>
					<div class="font-body text-[11px] text-white/70 sm:text-xs">Prédications & cultes</div>
				</div>
			</div>

			<div class="flex items-center gap-3">
				<div
					class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary/20 text-brand-primary"
				>
					<Globe size={20} />
				</div>
				<div>
					<div class="font-display text-base font-bold text-white sm:text-lg">
						{IMPACT.campaigns} campagnes
					</div>
					<div class="font-body text-[11px] text-white/70 sm:text-xs">
						Dans 9 régions du Cameroun
					</div>
				</div>
			</div>

			<div class="flex items-center gap-3">
				<div
					class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary/20 text-brand-primary"
				>
					<Flame size={20} />
				</div>
				<div>
					<div class="font-display text-base font-bold text-white sm:text-lg">
						{formatNumber(IMPACT.peopleReached)}+
					</div>
					<div class="font-body text-[11px] text-white/70 sm:text-xs">Personnes touchées</div>
				</div>
			</div>

			<div class="flex items-center gap-3">
				<div
					class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary/20 text-brand-primary"
				>
					<HeartHandshake size={20} />
				</div>
				<div>
					<div class="font-display text-base font-bold text-white sm:text-lg">100% Foi</div>
					<div class="font-body text-[11px] text-white/70 sm:text-xs">Soutenu par la prière</div>
				</div>
			</div>
		</div>
	</div>
</section>
