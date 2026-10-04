<script lang="ts">
	interface Props {
		value: number | string;
		label?: string;
		size?: 'sm' | 'card' | 'md' | 'detail' | 'hero';
		theme?: 'dark' | 'light' | 'brand';
	}

	let { value = 0, label = '', size = 'md', theme = 'dark' }: Props = $props();

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
					container: 'w-18 sm:w-26 md:w-30 h-22 sm:h-30 md:h-34',
					fontSize: 'text-3xl sm:text-5xl md:text-6xl',
					label:
						'text-[10px] sm:text-xs md:text-sm tracking-wider sm:tracking-widest mt-2 sm:mt-2.5',
					notch: 'w-1.5 h-3 sm:w-2 sm:h-4'
				};
			case 'detail':
				return {
					container: 'w-16 sm:w-22 h-20 sm:h-26',
					fontSize: 'text-2xl sm:text-4xl',
					label: 'text-[9px] sm:text-xs tracking-wider mt-1.5 sm:mt-2',
					notch: 'w-1.5 h-3'
				};
			case 'card':
				return {
					container: 'w-11 sm:w-12 h-13 sm:h-14',
					fontSize: 'text-lg sm:text-xl',
					label: 'text-[8px] sm:text-[9px] tracking-tight mt-1',
					notch: 'w-1 h-2'
				};
			case 'sm':
				return {
					container: 'w-9 h-11',
					fontSize: 'text-sm font-bold',
					label: 'text-[7px] mt-0.5',
					notch: 'w-0.5 h-1.5'
				};
			case 'md':
			default:
				return {
					container: 'w-14 sm:w-18 h-18 sm:h-22',
					fontSize: 'text-2xl sm:text-3xl',
					label: 'text-[9px] sm:text-xs tracking-wider mt-1.5',
					notch: 'w-1.5 h-2.5'
				};
		}
	});

	// Couleurs et thèmes
	const themeClasses = $derived(() => {
		switch (theme) {
			case 'light':
				return {
					topCard: 'bg-gradient-to-b from-white to-gray-100 text-gray-900 border-gray-200',
					bottomCard: 'bg-gradient-to-b from-gray-50 to-gray-200 text-gray-900 border-gray-200',
					divider: 'bg-gray-400/80 shadow-xs',
					labelColor: 'text-gray-700',
					shadow: 'shadow-[0_8px_20px_rgba(0,0,0,0.12)]'
				};
			case 'brand':
				return {
					topCard: 'bg-gradient-to-b from-[#8B1E1E] to-[#6c1414] text-white border-red-900',
					bottomCard: 'bg-gradient-to-b from-[#6c1414] to-[#500e0e] text-white border-red-950',
					divider: 'bg-black/60 shadow-xs',
					labelColor: 'text-brand-accent',
					shadow: 'shadow-[0_8px_25px_rgba(108,20,20,0.35)]'
				};
			case 'dark':
			default:
				return {
					topCard: 'bg-gradient-to-b from-[#1e293b] to-[#0f172a] text-white border-slate-700/60',
					bottomCard: 'bg-gradient-to-b from-[#0f172a] to-[#020617] text-white border-slate-900',
					divider: 'bg-black/80 shadow-[0_1px_2px_rgba(0,0,0,0.8)]',
					labelColor: 'text-gray-300',
					shadow: 'shadow-[0_12px_28px_rgba(0,0,0,0.45)]'
				};
		}
	});
</script>

<div class="flex flex-col items-center">
	<!-- Carte à rabat (Flip Flap Card) -->
	<div
		class="relative flex flex-col items-center select-none {sizeClasses().container} {themeClasses()
			.shadow} rounded-xl border border-white/10 sm:rounded-2xl"
		style="perspective: 600px;"
	>
		<!-- ENCOCHES LATÉRALES (Charnière du calendrier mécanique) -->
		<div
			class="absolute top-1/2 left-0 z-30 -translate-x-[1px] -translate-y-1/2 {sizeClasses()
				.notch} rounded-r-full bg-[#0a0f1d] shadow-inner"
			aria-hidden="true"
		></div>
		<div
			class="absolute top-1/2 right-0 z-30 translate-x-[1px] -translate-y-1/2 {sizeClasses()
				.notch} rounded-l-full bg-[#0a0f1d] shadow-inner"
			aria-hidden="true"
		></div>

		<!-- 1. MOITIÉ SUPÉRIEURE FIXE (Affiche la nouvelle valeur une fois le rabat tombé) -->
		<div
			class="relative h-1/2 w-full overflow-hidden rounded-t-xl border-x border-t border-b border-b-black/30 sm:rounded-t-2xl {themeClasses()
				.topCard}"
		>
			<div
				class="absolute inset-0 flex items-end justify-center pb-[1px] font-mono {sizeClasses()
					.fontSize} leading-none font-black tracking-tight"
				style="transform: translateY(50%);"
			>
				{currentDisplayValue}
			</div>
			<!-- Reflet brillant haut de page -->
			<div
				class="pointer-events-none absolute inset-x-0 top-0 h-[30%] bg-gradient-to-b from-white/20 to-transparent"
			></div>
		</div>

		<!-- 2. MOITIÉ INFÉRIEURE FIXE (Affiche la nouvelle valeur) -->
		<div
			class="relative h-1/2 w-full overflow-hidden rounded-b-xl border-x border-t border-b border-t-black/40 sm:rounded-b-2xl {themeClasses()
				.bottomCard}"
		>
			<div
				class="absolute inset-0 flex items-start justify-center pt-[1px] font-mono {sizeClasses()
					.fontSize} leading-none font-black tracking-tight"
				style="transform: translateY(-50%);"
			>
				{currentDisplayValue}
			</div>
			<!-- Ombre interne du pli -->
			<div
				class="pointer-events-none absolute inset-x-0 top-0 h-[25%] bg-gradient-to-b from-black/40 to-transparent"
			></div>
		</div>

		<!-- 3. VOLET RABATTABLE SUPÉRIEUR (Tourne vers le bas : ancienne valeur) -->
		{#if isFlipping}
			<div
				class="absolute inset-x-0 top-0 z-20 h-1/2 origin-bottom overflow-hidden rounded-t-xl border-x border-t border-b border-b-black/40 sm:rounded-t-2xl {themeClasses()
					.topCard} animate-flip-top"
				style="backface-visibility: hidden; transform-style: preserve-3d;"
			>
				<div
					class="absolute inset-0 flex items-end justify-center pb-[1px] font-mono {sizeClasses()
						.fontSize} leading-none font-black tracking-tight"
					style="transform: translateY(50%);"
				>
					{previousDisplayValue}
				</div>
				<div
					class="pointer-events-none absolute inset-x-0 top-0 h-[30%] bg-gradient-to-b from-white/20 to-transparent"
				></div>
			</div>

			<!-- 4. VOLET RABATTABLE INFÉRIEUR (Tombe en place : nouvelle valeur) -->
			<div
				class="absolute inset-x-0 top-1/2 z-20 h-1/2 origin-top overflow-hidden rounded-b-xl border-x border-t border-b border-t-black/50 sm:rounded-b-2xl {themeClasses()
					.bottomCard} animate-flip-bottom"
				style="backface-visibility: hidden; transform-style: preserve-3d;"
			>
				<div
					class="absolute inset-0 flex items-start justify-center pt-[1px] font-mono {sizeClasses()
						.fontSize} leading-none font-black tracking-tight"
					style="transform: translateY(-50%);"
				>
					{currentDisplayValue}
				</div>
				<div
					class="pointer-events-none absolute inset-x-0 top-0 h-[25%] bg-gradient-to-b from-black/40 to-transparent"
				></div>
			</div>
		{/if}

		<!-- LIGNE DE PLIURE / FENTE CENTRALE -->
		<div
			class="absolute inset-x-0 top-1/2 z-25 h-[1.5px] -translate-y-1/2 {themeClasses().divider}"
			aria-hidden="true"
		></div>
	</div>

	<!-- LIBELLÉ (ex: JOURS, HEURES, MINUTES, SECONDES) -->
	{#if label}
		<span
			class="font-body {sizeClasses().label} text-center font-extrabold uppercase {themeClasses()
				.labelColor}"
		>
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
			opacity: 0.8;
		}
	}

	@keyframes flipBottomAnimation {
		0% {
			transform: rotateX(90deg);
			opacity: 0.8;
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
