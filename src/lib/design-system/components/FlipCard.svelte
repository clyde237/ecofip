<script lang="ts">
	interface Props {
		value: number | string;
		label?: string;
		size?: 'sm' | 'card' | 'md' | 'detail' | 'hero';
		theme?: 'dark' | 'light' | 'brand';
	}

	let { value = 0, label = '', size = 'md', theme = 'light' }: Props = $props();

	let formattedValue = $derived(String(value).padStart(2, '0'));
	let currentValue = $state('');
	let previousValue = $state('');
	let isFlipping = $state(false);

	let currentDisplayValue = $derived(currentValue || formattedValue);
	let previousDisplayValue = $derived(previousValue || formattedValue);

	$effect(() => {
		const nextVal = formattedValue;
		if (!currentValue) {
			currentValue = nextVal;
			previousValue = nextVal;
			return;
		}
		if (nextVal !== currentValue) {
			previousValue = currentValue;
			currentValue = nextVal;
			isFlipping = false;
			// Reflow pour redémarrer l'animation
			requestAnimationFrame(() => {
				isFlipping = true;
			});
		}
	});

	// Dimensions selon la variante
	const sizeClasses = $derived(() => {
		switch (size) {
			case 'hero':
				return {
					container: 'w-16 sm:w-20 md:w-24 h-20 sm:h-24 md:h-28',
					fontSize: 'text-3xl sm:text-4xl md:text-5xl font-black',
					label: 'text-[9px] sm:text-xs md:text-xs tracking-wider font-bold mt-1.5 sm:mt-2',
					notch: 'w-1.5 h-3 sm:w-2 sm:h-3.5'
				};
			case 'detail':
				return {
					container: 'w-14 sm:w-18 h-18 sm:h-22',
					fontSize: 'text-2xl sm:text-3xl font-black',
					label: 'text-[9px] sm:text-[10px] tracking-wider font-bold mt-1.5',
					notch: 'w-1.5 h-2.5'
				};
			case 'card':
				return {
					container: 'w-10 sm:w-11 h-12 sm:h-13',
					fontSize: 'text-base sm:text-lg font-black',
					label: 'text-[8px] sm:text-[9px] tracking-tight font-bold mt-1',
					notch: 'w-1 h-2'
				};
			case 'sm':
				return {
					container: 'w-8 h-10',
					fontSize: 'text-xs font-black',
					label: 'text-[7px] mt-0.5',
					notch: 'w-0.5 h-1.5'
				};
			case 'md':
			default:
				return {
					container: 'w-12 sm:w-14 h-15 sm:h-17',
					fontSize: 'text-xl sm:text-2xl font-black',
					label: 'text-[9px] tracking-wider font-bold mt-1',
					notch: 'w-1.5 h-2.5'
				};
		}
	});

	// Couleurs et thèmes (Par défaut : THÈME CLAIR ÉLÉGANT)
	const themeClasses = $derived(() => {
		switch (theme) {
			case 'dark':
				return {
					border: 'border-slate-800',
					topCard: 'bg-gradient-to-b from-[#1e293b] to-[#0f172a] text-white border-slate-700/60',
					bottomCard: 'bg-gradient-to-b from-[#0f172a] to-[#020617] text-white border-slate-900',
					divider: 'bg-black/80 shadow-[0_1px_2px_rgba(0,0,0,0.8)]',
					labelColor: 'text-slate-400',
					notchColor: 'bg-[#0a0f1d]',
					shadow: 'shadow-[0_8px_20px_rgba(0,0,0,0.35)]'
				};
			case 'brand':
				return {
					border: 'border-red-900/60',
					topCard: 'bg-gradient-to-b from-[#8B1E1E] to-[#6c1414] text-white border-red-800/80',
					bottomCard: 'bg-gradient-to-b from-[#6c1414] to-[#500e0e] text-white border-red-950',
					divider: 'bg-black/60 shadow-xs',
					labelColor: 'text-brand-primary',
					notchColor: 'bg-[#420909]',
					shadow: 'shadow-[0_4px_16px_rgba(139,30,30,0.25)]'
				};
			case 'light':
			default:
				return {
					border: 'border-slate-200/90',
					topCard:
						'bg-gradient-to-b from-white via-white to-slate-50 text-slate-800 border-t border-x border-slate-200/80',
					bottomCard:
						'bg-gradient-to-b from-slate-100 to-slate-200/90 text-slate-900 border-b border-x border-slate-300/80',
					divider: 'bg-slate-300 shadow-[0_1px_1px_rgba(0,0,0,0.06)]',
					labelColor: 'text-slate-500',
					notchColor: 'bg-slate-200 border border-slate-300/70',
					shadow: 'shadow-[0_3px_10px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)]'
				};
		}
	});
</script>

<div class="flex flex-col items-center">
	<!-- Carte à rabat (Flip Flap Card) -->
	<div
		class="relative flex flex-col items-center select-none {sizeClasses().container} {themeClasses()
			.shadow} rounded-xl border sm:rounded-2xl {themeClasses().border}"
		style="perspective: 500px;"
	>
		<!-- ENCOCHES LATÉRALES (Charnière du calendrier mécanique discrète et raffinée) -->
		<div
			class="absolute top-1/2 left-0 z-30 -translate-x-[1px] -translate-y-1/2 {sizeClasses()
				.notch} rounded-r-full {themeClasses().notchColor}"
			aria-hidden="true"
		></div>
		<div
			class="absolute top-1/2 right-0 z-30 translate-x-[1px] -translate-y-1/2 {sizeClasses()
				.notch} rounded-l-full {themeClasses().notchColor}"
			aria-hidden="true"
		></div>

		<!-- 1. MOITIÉ SUPÉRIEURE FIXE (Affiche la nouvelle valeur une fois le rabat tombé) -->
		<div
			class="relative h-1/2 w-full overflow-hidden rounded-t-xl border-b border-b-black/10 sm:rounded-t-2xl {themeClasses()
				.topCard}"
		>
			<div
				class="absolute inset-0 flex items-end justify-center pb-[1px] font-mono {sizeClasses()
					.fontSize} leading-none tracking-tight"
				style="transform: translateY(50%);"
			>
				{currentDisplayValue}
			</div>
			<!-- Reflet brillant haut de page -->
			<div
				class="pointer-events-none absolute inset-x-0 top-0 h-[35%] bg-gradient-to-b from-white/70 to-transparent"
			></div>
		</div>

		<!-- 2. MOITIÉ INFÉRIEURE FIXE (Affiche la nouvelle valeur) -->
		<div
			class="relative h-1/2 w-full overflow-hidden rounded-b-xl border-t border-t-black/10 sm:rounded-b-2xl {themeClasses()
				.bottomCard}"
		>
			<div
				class="absolute inset-0 flex items-start justify-center pt-[1px] font-mono {sizeClasses()
					.fontSize} leading-none tracking-tight"
				style="transform: translateY(-50%);"
			>
				{currentDisplayValue}
			</div>
			<!-- Ombre interne du pli -->
			<div
				class="pointer-events-none absolute inset-x-0 top-0 h-[25%] bg-gradient-to-b from-black/15 to-transparent"
			></div>
		</div>

		<!-- 3. VOLET RABATTABLE SUPÉRIEUR (Tourne vers le bas : ancienne valeur) -->
		{#if isFlipping}
			<div
				class="absolute inset-x-0 top-0 z-20 h-1/2 origin-bottom overflow-hidden rounded-t-xl border-b border-b-black/15 sm:rounded-t-2xl {themeClasses()
					.topCard} animate-flip-top"
				style="backface-visibility: hidden; transform-style: preserve-3d;"
			>
				<div
					class="absolute inset-0 flex items-end justify-center pb-[1px] font-mono {sizeClasses()
						.fontSize} leading-none tracking-tight"
					style="transform: translateY(50%);"
				>
					{previousDisplayValue}
				</div>
				<div
					class="pointer-events-none absolute inset-x-0 top-0 h-[35%] bg-gradient-to-b from-white/70 to-transparent"
				></div>
			</div>

			<!-- 4. VOLET RABATTABLE INFÉRIEUR (Tombe en place : nouvelle valeur) -->
			<div
				class="absolute inset-x-0 top-1/2 z-20 h-1/2 origin-top overflow-hidden rounded-b-xl border-t border-t-black/15 sm:rounded-b-2xl {themeClasses()
					.bottomCard} animate-flip-bottom"
				style="backface-visibility: hidden; transform-style: preserve-3d;"
			>
				<div
					class="absolute inset-0 flex items-start justify-center pt-[1px] font-mono {sizeClasses()
						.fontSize} leading-none tracking-tight"
					style="transform: translateY(-50%);"
				>
					{currentDisplayValue}
				</div>
				<div
					class="pointer-events-none absolute inset-x-0 top-0 h-[25%] bg-gradient-to-b from-black/15 to-transparent"
				></div>
			</div>
		{/if}

		<!-- LIGNE DE PLIURE / FENTE CENTRALE -->
		<div
			class="absolute inset-x-0 top-1/2 z-25 h-[1px] -translate-y-1/2 {themeClasses().divider}"
			aria-hidden="true"
		></div>
	</div>

	<!-- LIBELLÉ (ex: JOURS, HEURES, MINUTES, SECONDES) -->
	{#if label}
		<span class="font-body {sizeClasses().label} text-center uppercase {themeClasses().labelColor}">
			{label}
		</span>
	{/if}
</div>

<style>
	@keyframes flipTopAnimation {
		0% {
			transform: rotateX(0deg);
			opacity: 1;
		}
		100% {
			transform: rotateX(-90deg);
			opacity: 0.9;
		}
	}

	@keyframes flipBottomAnimation {
		0% {
			transform: rotateX(90deg);
			opacity: 0.9;
		}
		100% {
			transform: rotateX(0deg);
			opacity: 1;
		}
	}

	.animate-flip-top {
		animation: flipTopAnimation 0.28s ease-in forwards;
	}

	.animate-flip-bottom {
		animation: flipBottomAnimation 0.28s ease-out 0.26s forwards;
		transform: rotateX(90deg);
	}

	@media (prefers-reduced-motion: reduce) {
		.animate-flip-top,
		.animate-flip-bottom {
			animation: none !important;
		}
	}
</style>
