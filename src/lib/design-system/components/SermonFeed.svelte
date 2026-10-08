<script lang="ts">
	/**
	 * Lecteur plein écran des prédications, à faire défiler verticalement comme des reels.
	 * Seule la vidéo à l'écran est chargée et lue (économie de données mobiles) ; les vidéos
	 * démarrent sans le son (règle des navigateurs) et un bouton active le son pour la suite.
	 */
	import { tick } from 'svelte';
	import {
		X,
		Volume2,
		VolumeX,
		Link as LinkIcon,
		CheckCircle2,
		BookOpen,
		ChevronUp,
		ChevronDown,
		ExternalLink
	} from '@lucide/svelte';
	import type { PublicSermon } from '../types.js';
	import { toast } from '../toast.svelte.js';

	interface Props {
		sermons: PublicSermon[];
		startIndex?: number;
		open?: boolean;
		/** Appelé quand la prédication à l'écran change (ex. pour mettre l'adresse à jour) */
		onActiveChange?: (sermon: PublicSermon | null) => void;
	}

	let { sermons, startIndex = 0, open = $bindable(false), onActiveChange }: Props = $props();

	let container: HTMLDivElement | null = $state(null);
	let videos: (HTMLVideoElement | null)[] = $state([]);
	let activeIndex = $state(0);
	let isMuted = $state(true);
	let pausedByUser = $state(false);
	let copied = $state(false);

	function close() {
		open = false;
	}

	function playActive() {
		videos.forEach((video, index) => {
			if (!video) return;
			if (index === activeIndex && !pausedByUser) {
				video.muted = isMuted;
				void video.play().catch(() => {
					// Lecture refusée (économie d'énergie…) : le visiteur touche la vidéo pour lancer
				});
			} else {
				video.pause();
			}
		});
	}

	function togglePlay() {
		const video = videos[activeIndex];
		if (!video) return;
		if (video.paused) {
			pausedByUser = false;
			playActive();
		} else {
			pausedByUser = true;
			video.pause();
		}
	}

	function toggleMute() {
		isMuted = !isMuted;
		const video = videos[activeIndex];
		if (video) video.muted = isMuted;
	}

	function scrollToIndex(index: number, behavior: ScrollBehavior = 'smooth') {
		const target = container?.children[index] as HTMLElement | undefined;
		target?.scrollIntoView({ behavior, block: 'start' });
	}

	async function copyLink() {
		const sermon = sermons[activeIndex];
		if (!sermon) return;
		try {
			await navigator.clipboard.writeText(new URL(sermon.href, window.location.origin).href);
			copied = true;
			toast.success('Lien de la prédication copié.');
			setTimeout(() => (copied = false), 2500);
		} catch {
			toast.error('Copie impossible sur cet appareil.');
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (!open) return;
		if (event.key === 'Escape') close();
		else if (event.key === 'ArrowDown') {
			event.preventDefault();
			scrollToIndex(Math.min(activeIndex + 1, sermons.length - 1));
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			scrollToIndex(Math.max(activeIndex - 1, 0));
		} else if (event.key.toLowerCase() === 'm') toggleMute();
	}

	// Ouverture : positionnement sur la prédication choisie, défilement de la page bloqué
	$effect(() => {
		if (!open) return;
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		activeIndex = Math.min(Math.max(startIndex, 0), Math.max(sermons.length - 1, 0));
		pausedByUser = false;
		void tick().then(() => {
			scrollToIndex(activeIndex, 'instant');
			playActive();
		});
		return () => {
			document.body.style.overflow = previousOverflow;
			videos.forEach((video) => video?.pause());
			onActiveChange?.(null);
		};
	});

	// La prédication la plus visible devient active : elle est lue, les autres sont mises en pause
	$effect(() => {
		if (!open || !container) return;
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (!entry.isIntersecting) continue;
					const index = Number((entry.target as HTMLElement).dataset.index);
					if (index !== activeIndex) {
						activeIndex = index;
						pausedByUser = false;
						playActive();
					}
					onActiveChange?.(sermons[index] ?? null);
				}
			},
			{ root: container, threshold: 0.6 }
		);
		for (const child of Array.from(container.children)) observer.observe(child);
		return () => observer.disconnect();
	});
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<div
		class="fixed inset-0 z-[70] bg-black text-white"
		role="dialog"
		aria-modal="true"
		aria-label="Lecteur de prédications"
	>
		<div
			bind:this={container}
			class="h-dvh snap-y snap-mandatory [scrollbar-width:none] overflow-y-scroll overscroll-contain"
		>
			{#each sermons as sermon, index (sermon.id)}
				<section
					data-index={index}
					class="relative flex h-dvh snap-start snap-always items-center justify-center"
					aria-label={sermon.title}
				>
					<!-- Colonne vidéo verticale, centrée sur grand écran -->
					<div class="relative h-full w-full max-w-[calc(100dvh*9/16)]">
						<video
							bind:this={videos[index]}
							src={Math.abs(index - activeIndex) <= 1 ? sermon.videoUrl : undefined}
							poster={sermon.posterUrl ?? undefined}
							preload={index === activeIndex ? 'auto' : 'metadata'}
							playsinline
							loop
							muted={isMuted}
							onclick={togglePlay}
							class="h-full w-full cursor-pointer bg-black object-contain"
						></video>

						<!-- Informations en bas -->
						<div
							class="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-4 pt-16 pr-16 pb-6"
						>
							{#if sermon.series}
								<p class="font-body text-[11px] font-bold tracking-wider text-amber-300 uppercase">
									{sermon.series}
								</p>
							{/if}
							<h2 class="mt-1 font-display text-lg leading-snug font-bold">{sermon.title}</h2>
							<p class="mt-1 font-body text-sm text-white/80">
								{[sermon.preacher, sermon.dateLabel].filter(Boolean).join(' · ')}
							</p>
							{#if sermon.scripture}
								<p
									class="mt-1.5 flex items-center gap-1.5 font-body text-sm font-semibold text-white"
								>
									<BookOpen size={14} class="text-amber-300" />{sermon.scripture}
								</p>
							{/if}
						</div>

						<!-- Actions à droite -->
						<div class="absolute right-3 bottom-8 flex flex-col items-center gap-4">
							<button
								type="button"
								onclick={toggleMute}
								class="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white/15 backdrop-blur-sm hover:bg-white/25"
								aria-label={isMuted ? 'Activer le son' : 'Couper le son'}
							>
								{#if isMuted}<VolumeX size={20} />{:else}<Volume2 size={20} />{/if}
							</button>
							<button
								type="button"
								onclick={copyLink}
								class="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white/15 backdrop-blur-sm hover:bg-white/25"
								aria-label="Copier le lien de la prédication"
							>
								{#if copied}<CheckCircle2 size={20} class="text-emerald-400" />{:else}<LinkIcon
										size={20}
									/>{/if}
							</button>
							<a
								href={sermon.href}
								class="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm hover:bg-white/25"
								aria-label="Ouvrir la page de la prédication"
							>
								<ExternalLink size={19} />
							</a>
						</div>
					</div>
				</section>
			{/each}
		</div>

		<!-- Fermeture, position et navigation (au-dessus du défilement) -->
		<button
			type="button"
			onclick={close}
			class="absolute top-4 right-4 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white/15 backdrop-blur-sm hover:bg-white/25"
			aria-label="Fermer le lecteur"
		>
			<X size={22} />
		</button>
		<p class="absolute top-6 left-4 font-body text-xs font-semibold text-white/70">
			{activeIndex + 1} / {sermons.length}
		</p>
		{#if isMuted}
			<button
				type="button"
				onclick={toggleMute}
				class="absolute top-4 left-1/2 flex -translate-x-1/2 cursor-pointer items-center gap-2 rounded-full bg-black/60 px-4 py-2 font-body text-xs font-bold backdrop-blur-sm"
			>
				<VolumeX size={15} /> Activer le son
			</button>
		{/if}
		<div class="absolute top-1/2 right-6 hidden -translate-y-1/2 flex-col gap-3 lg:flex">
			<button
				type="button"
				onclick={() => scrollToIndex(Math.max(activeIndex - 1, 0))}
				disabled={activeIndex === 0}
				class="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white/15 hover:bg-white/25 disabled:opacity-30"
				aria-label="Prédication précédente"
			>
				<ChevronUp size={22} />
			</button>
			<button
				type="button"
				onclick={() => scrollToIndex(Math.min(activeIndex + 1, sermons.length - 1))}
				disabled={activeIndex === sermons.length - 1}
				class="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white/15 hover:bg-white/25 disabled:opacity-30"
				aria-label="Prédication suivante"
			>
				<ChevronDown size={22} />
			</button>
		</div>
	</div>
{/if}
