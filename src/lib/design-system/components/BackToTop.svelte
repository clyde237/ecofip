<script lang="ts">
	/**
	 * Bouton flottant « Retour en haut de page » (Go to top)
	 * Apparaît progressivement après un certain seuil de défilement, affiche la progression
	 * circulaire du scroll, et remonte la page de manière fluide et accessible.
	 */
	import { onMount } from 'svelte';
	import { ChevronUp } from '@lucide/svelte';

	interface Props {
		/** Seuil de défilement (en pixels) à partir duquel le bouton apparaît */
		threshold?: number;
		class?: string;
	}

	let { threshold = 350, class: customClass = '' }: Props = $props();

	let isVisible = $state(false);
	let scrollProgress = $state(0);

	function scrollToTop() {
		const prefersReducedMotion =
			typeof window !== 'undefined' &&
			window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		window.scrollTo({
			top: 0,
			behavior: prefersReducedMotion ? 'auto' : 'smooth'
		});
	}

	function handleScroll() {
		if (typeof window === 'undefined') return;
		const currentScroll = window.scrollY || document.documentElement.scrollTop;
		isVisible = currentScroll > threshold;

		const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
		if (totalHeight > 0) {
			scrollProgress = Math.min(100, Math.max(0, (currentScroll / totalHeight) * 100));
		} else {
			scrollProgress = 0;
		}
	}

	onMount(() => {
		handleScroll();
		window.addEventListener('scroll', handleScroll, { passive: true });
		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	});

	const RADIUS = 22;
	const CIRCUMFERENCE = 2 * Math.PI * RADIUS; // ~138.23
	let strokeDashoffset = $derived(CIRCUMFERENCE - (scrollProgress / 100) * CIRCUMFERENCE);
</script>

<div
	class="fixed right-5 bottom-6 z-40 transition-all duration-300 sm:right-7 sm:bottom-7 {isVisible
		? 'translate-y-0 opacity-100'
		: 'pointer-events-none translate-y-4 opacity-0'} {customClass}"
	aria-hidden={!isVisible}
>
	<button
		type="button"
		onclick={scrollToTop}
		tabindex={isVisible ? 0 : -1}
		aria-label="Retourner en haut de la page"
		title="Haut de page"
		class="group relative flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-brand-primary text-white shadow-lg shadow-brand-primary/30 transition-all duration-300 hover:scale-105 hover:bg-brand-primary-hover hover:shadow-xl hover:shadow-brand-primary/45 focus-visible:ring-3 focus-visible:ring-amber-300 focus-visible:outline-hidden active:scale-95 sm:h-13 sm:w-13"
	>
		<!-- Anneau SVG de progression circulaire du scroll -->
		<svg
			class="pointer-events-none absolute inset-0 -rotate-90 h-full w-full p-0.5"
			viewBox="0 0 52 52"
			aria-hidden="true"
		>
			<!-- Cercle de piste transparent -->
			<circle
				cx="26"
				cy="26"
				r={RADIUS}
				fill="none"
				stroke="currentColor"
				stroke-width="2.5"
				class="text-white/20"
			/>
			<!-- Cercle de progression dynamique -->
			<circle
				cx="26"
				cy="26"
				r={RADIUS}
				fill="none"
				stroke="currentColor"
				stroke-width="2.5"
				stroke-dasharray={CIRCUMFERENCE}
				stroke-dashoffset={strokeDashoffset}
				stroke-linecap="round"
				class="text-amber-300 transition-[stroke-dashoffset] duration-150 ease-out"
			/>
		</svg>

		<!-- Icône flèche centrale avec micro-animation d'élévation au survol -->
		<ChevronUp
			size={22}
			strokeWidth={2.5}
			class="relative z-10 transition-transform duration-200 group-hover:-translate-y-0.5"
		/>
	</button>
</div>
