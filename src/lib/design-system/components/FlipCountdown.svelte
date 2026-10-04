<script lang="ts">
	import { onDestroy } from 'svelte';
	import FlipCard from './FlipCard.svelte';
	import { Clock, Calendar, Sparkles } from '@lucide/svelte';

	interface Props {
		targetDate: Date | string | number | null | undefined;
		size?: 'sm' | 'card' | 'md' | 'detail' | 'hero';
		theme?: 'dark' | 'light' | 'brand';
		showSummaryBanner?: boolean;
		showTitle?: boolean;
		titleText?: string;
		class?: string;
	}

	let {
		targetDate,
		size = 'md',
		theme = 'dark',
		showSummaryBanner = true,
		showTitle = false,
		titleText = 'COMPTE À REBOURS OFFICIEL',
		class: customClass = ''
	}: Props = $props();

	let days = $state(0);
	let hours = $state(0);
	let minutes = $state(0);
	let seconds = $state(0);
	let isPassed = $state(false);

	let timerId: ReturnType<typeof setInterval> | null = null;

	function calculateRemainingTime() {
		if (!targetDate) {
			days = 0;
			hours = 0;
			minutes = 0;
			seconds = 0;
			isPassed = false;
			return;
		}

		const target = new Date(targetDate).getTime();
		if (isNaN(target)) {
			days = 0;
			hours = 0;
			minutes = 0;
			seconds = 0;
			return;
		}

		const now = Date.now();
		const diff = target - now;

		if (diff <= 0) {
			days = 0;
			hours = 0;
			minutes = 0;
			seconds = 0;
			isPassed = true;
			return;
		}

		isPassed = false;
		days = Math.floor(diff / (1000 * 60 * 60 * 24));
		hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
		minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
		seconds = Math.floor((diff % (1000 * 60)) / 1000);
	}

	$effect(() => {
		// Calcul immédiat
		calculateRemainingTime();

		// Lance l'intervalle d'une seconde
		if (timerId) clearInterval(timerId);
		timerId = setInterval(() => {
			calculateRemainingTime();
		}, 1000);

		return () => {
			if (timerId) clearInterval(timerId);
		};
	});

	onDestroy(() => {
		if (timerId) clearInterval(timerId);
	});

	// Texte formaté exact : "jj - X jours Y heures Z minutes et W secondes"
	let summaryText = $derived(() => {
		if (isPassed) {
			return 'JJ - Événement en cours';
		}
		const jStr = `${days} jour${days > 1 ? 's' : ''}`;
		const hStr = `${hours} heure${hours > 1 ? 's' : ''}`;
		const mStr = `${minutes} minute${minutes > 1 ? 's' : ''}`;
		const sStr = `${seconds} seconde${seconds > 1 ? 's' : ''}`;
		return `JJ - ${jStr} ${hStr} ${mStr} et ${sStr}`;
	});

	// Classes d'espacement des séparateurs
	const colonClasses = $derived(() => {
		switch (size) {
			case 'hero':
				return 'text-3xl sm:text-5xl md:text-6xl mx-1 sm:mx-2 md:mx-3 text-white/50 pb-7 sm:pb-9 md:pb-11';
			case 'detail':
				return 'text-2xl sm:text-4xl mx-1 sm:mx-2 text-white/50 pb-6 sm:pb-8';
			case 'card':
				return 'text-lg sm:text-xl mx-0.5 text-white/60 pb-4';
			case 'sm':
				return 'text-sm mx-0.5 text-white/60 pb-3';
			case 'md':
			default:
				return 'text-2xl sm:text-3xl mx-1 text-white/50 pb-5';
		}
	});
</script>

<div
	class="flex flex-col items-center {customClass}"
	role="timer"
	aria-live="polite"
	aria-label="Compte à rebours avant l'événement"
>
	<!-- TITRE FACULTATIF -->
	{#if showTitle}
		<div class="mb-3 flex items-center gap-2">
			<Clock size={16} class="animate-pulse text-brand-accent" />
			<span
				class="font-body text-[11px] font-bold tracking-widest text-white/80 uppercase sm:text-xs"
			>
				{titleText}
			</span>
		</div>
	{/if}

	<!-- BANNIÈRE DE SYNTHÈSE FORMATÉE : JJ - X jours Y heures Z minutes et W secondes -->
	{#if showSummaryBanner}
		<div
			class="mb-3 inline-flex items-center gap-2 rounded-full border border-brand-accent/40 bg-brand-primary/20 px-3.5 py-1 text-center shadow-xs backdrop-blur-md sm:mb-4 sm:px-4 sm:py-1.5"
		>
			<Sparkles size={13} class="shrink-0 animate-pulse text-brand-accent" />
			<span
				class="font-mono text-xs font-bold tracking-wide text-brand-accent select-none sm:text-sm"
			>
				{summaryText()}
			</span>
		</div>
	{/if}

	<!-- CONTENEUR DES VOLETS MÉCANIQUES (CALENDRIER À RABAT) -->
	<div class="flex items-center justify-center">
		<!-- 1. JOURS -->
		<FlipCard value={days} label="Jours" {size} {theme} />

		<!-- Séparateur double point -->
		<span class="font-mono font-black select-none {colonClasses()}">:</span>

		<!-- 2. HEURES -->
		<FlipCard value={hours} label="Heures" {size} {theme} />

		<!-- Séparateur double point -->
		<span class="font-mono font-black select-none {colonClasses()}">:</span>

		<!-- 3. MINUTES -->
		<FlipCard value={minutes} label="Minutes" {size} {theme} />

		<!-- Séparateur double point -->
		<span class="font-mono font-black select-none {colonClasses()}">:</span>

		<!-- 4. SECONDES (S'écoule en direct) -->
		<FlipCard value={seconds} label="Secondes" {size} {theme} />
	</div>
</div>
