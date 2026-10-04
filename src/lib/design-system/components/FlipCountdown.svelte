<script lang="ts">
	import { onDestroy } from 'svelte';
	import FlipCard from './FlipCard.svelte';
	import { Clock, Sparkles } from '@lucide/svelte';

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
		theme = 'light',
		showSummaryBanner = true,
		showTitle = false,
		titleText = 'COMPTE À REBOURS',
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
		calculateRemainingTime();

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

	// Texte formaté élégant : "JJ - X jours Y heures Z minutes et W secondes"
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

	// Classes des deux-points séparateurs selon taille et thème
	const colonClasses = $derived(() => {
		const colorClass = theme === 'dark' ? 'text-white/40' : 'text-slate-400';
		switch (size) {
			case 'hero':
				return `text-2xl sm:text-3xl md:text-4xl mx-1 sm:mx-1.5 pb-5 sm:pb-7 ${colorClass}`;
			case 'detail':
				return `text-xl sm:text-2xl mx-1 pb-5 ${colorClass}`;
			case 'card':
				return `text-sm sm:text-base mx-0.5 pb-3.5 ${colorClass}`;
			case 'sm':
				return `text-xs mx-0.5 pb-2 ${colorClass}`;
			case 'md':
			default:
				return `text-lg sm:text-xl mx-0.5 sm:mx-1 pb-4 ${colorClass}`;
		}
	});

	// Style de la bannière selon thème
	const bannerClasses = $derived(() => {
		if (theme === 'dark') {
			return 'border-amber-400/30 bg-black/60 text-amber-300';
		}
		if (theme === 'brand') {
			return 'border-red-200 bg-red-50 text-brand-primary';
		}
		return 'border-red-200/80 bg-red-50/90 text-brand-primary';
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
		<div class="mb-2 flex items-center gap-1.5">
			<Clock size={13} class="animate-pulse text-brand-primary" />
			<span class="font-body text-[10px] font-bold tracking-wider text-slate-600 uppercase">
				{titleText}
			</span>
		</div>
	{/if}

	<!-- BANNIÈRE DE SYNTHÈSE FORMATÉE : JJ - X jours Y heures Z minutes et W secondes -->
	{#if showSummaryBanner}
		<div
			class="mb-2.5 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-center shadow-2xs backdrop-blur-xs sm:mb-3 {bannerClasses()}"
		>
			<Sparkles size={12} class="shrink-0 animate-pulse text-brand-primary" />
			<span class="font-mono text-[11px] font-bold tracking-tight select-none sm:text-xs">
				{summaryText()}
			</span>
		</div>
	{/if}

	<!-- CONTENEUR DES VOLETS MÉCANIQUES (CALENDRIER À RABAT) -->
	<div class="flex items-center justify-center">
		<!-- 1. JOURS -->
		<FlipCard value={days} label="Jours" {size} {theme} />

		<!-- Séparateur double point -->
		<span class="font-mono font-bold select-none {colonClasses()}">:</span>

		<!-- 2. HEURES -->
		<FlipCard value={hours} label="Heures" {size} {theme} />

		<!-- Séparateur double point -->
		<span class="font-mono font-bold select-none {colonClasses()}">:</span>

		<!-- 3. MINUTES -->
		<FlipCard value={minutes} label="Minutes" {size} {theme} />

		<!-- Séparateur double point -->
		<span class="font-mono font-bold select-none {colonClasses()}">:</span>

		<!-- 4. SECONDES (S'écoule en direct) -->
		<FlipCard value={seconds} label="Secondes" {size} {theme} />
	</div>
</div>
