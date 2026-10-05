<script lang="ts">
	import { onMount } from 'svelte';
	import Container from '../components/Container.svelte';
	import { CircleDot, Sparkle, Clock, Heart } from '@lucide/svelte';
	import type { StatItem, StatsBarProps } from '../types.js';

	const defaultStats: StatItem[] = [
		{
			id: 'regions',
			value: 10,
			prefix: '',
			suffix: '',
			label: 'Régions visitées',
			icon: CircleDot,
			fillIcon: false
		},
		{
			id: 'impact',
			value: 50,
			prefix: '',
			suffix: 'K+',
			label: 'Vies touchées',
			icon: Sparkle,
			fillIcon: true
		},
		{
			id: 'mission',
			value: 3,
			prefix: '',
			suffix: ' ans',
			label: 'Projet national',
			icon: Clock,
			fillIcon: false
		},
		{
			id: 'croisades',
			value: 15,
			prefix: '+',
			suffix: '',
			label: 'Croisades organisées',
			icon: Heart,
			fillIcon: true
		}
	];

	let {
		title = 'Notre impact',
		description = 'Depuis le lancement de « Cameroun pour Jésus », Dieu a accompli de grandes choses.',
		items = defaultStats,
		duration = 2000,
		class: customClass = ''
	}: StatsBarProps & { title?: string; description?: string } = $props();

	let containerEl: HTMLElement | null = $state(null);
	let isVisible = $state(false);
	let currentValues = $state<number[]>([]);

	$effect.pre(() => {
		if (currentValues.length !== items.length) {
			currentValues = items.map((i) => (isVisible ? i.value : 0));
		}
	});

	// Fonction d'accélération puis décélération douce (ease-out exponentiel)
	function easeOutExpo(x: number): number {
		return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
	}

	function startCounter() {
		const startTime = performance.now();
		const targets = items.map((item) => item.value);

		function step(now: number) {
			const elapsed = now - startTime;
			const progress = Math.min(elapsed / duration, 1);
			const eased = easeOutExpo(progress);

			currentValues = targets.map((target) => Math.round(target * eased));

			if (progress < 1) {
				requestAnimationFrame(step);
			} else {
				// Garantir les valeurs finales exactes
				currentValues = targets.slice();
			}
		}

		requestAnimationFrame(step);
	}

	onMount(() => {
		// Respect des préférences WCAG d'accessibilité (réduction des animations)
		const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (prefersReducedMotion) {
			currentValues = items.map((i) => i.value);
			isVisible = true;
			return;
		}

		if (!containerEl) {
			currentValues = items.map((i) => i.value);
			isVisible = true;
			return;
		}

		// Déclenchement dès que le composant est visible à l'écran
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						isVisible = true;
						startCounter();
						observer.disconnect();
						break;
					}
				}
			},
			{ threshold: 0.15 }
		);

		observer.observe(containerEl);

		return () => {
			observer.disconnect();
		};
	});
</script>

<!-- Barre de statistiques flottante positionnée au-dessus de l'intersection -->
<section
	bind:this={containerEl}
	class="relative z-30 -mt-10 w-full sm:-mt-14 lg:-mt-16 {customClass}"
	aria-label="Statistiques clés et impact de la mission"
>
	<Container>
		<div
			class="rounded-2xl border border-gray-100 bg-white p-2 shadow-[0_16px_40px_-10px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.03)] sm:rounded-3xl sm:p-4 {isVisible
				? 'animate-stats-entrance'
				: 'opacity-0'}"
		>
			{#if title}
				<div class="mb-2 border-b border-gray-100/80 px-4 pt-2 pb-3 text-center sm:text-left">
					<h2 class="font-display text-lg font-bold text-text-primary sm:text-xl">
						{title}
					</h2>
					{#if description}
						<p class="mt-0.5 text-xs text-text-secondary sm:text-sm">
							{description}
						</p>
					{/if}
				</div>
			{/if}
			<div class="grid grid-cols-2 lg:grid-cols-4">
				{#each items as item, index (item.id)}
					{@const isLastColIn2 = index % 2 === 1}
					{@const isFirstRowIn2 = index < 2}
					{@const isLastIn4 = index === items.length - 1}
					<div
						class="flex items-center gap-3 px-3 py-3.5 sm:gap-4 sm:px-5 sm:py-4.5 lg:px-6 lg:py-5
						{isFirstRowIn2 ? 'border-b border-gray-100 lg:border-b-0' : ''}
						{!isLastColIn2 ? 'border-r border-gray-100' : ''}
						{isLastColIn2 && !isLastIn4 ? 'lg:border-r lg:border-gray-100' : ''}"
					>
						<!-- Pastille circulaire douce pour l'icône -->
						<div
							class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-subtle sm:h-12 sm:w-12"
						>
							{#if item.icon}
								<item.icon
									size={21}
									class="text-brand-primary {item.fillIcon ? 'fill-brand-primary' : ''}"
									aria-hidden="true"
								/>
							{/if}
						</div>

						<!-- Bloc Chiffre & Label -->
						<div class="min-w-0">
							<div
								class="font-display text-lg font-bold tracking-tight text-text-primary sm:text-xl lg:text-2xl"
								aria-label="{item.prefix || ''}{item.value}{item.suffix || ''}"
							>
								{item.prefix || ''}{currentValues[index]}{item.suffix || ''}
							</div>
							<div
								class="font-body text-xs font-medium text-text-secondary sm:text-[13px]"
								title={item.label}
							>
								{item.label}
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</Container>
</section>

<style>
	/* Animation d'apparition douce, progressive et fluide */
	@keyframes statsBarFadeUp {
		from {
			opacity: 0;
			transform: translate3d(0, 24px, 0);
		}
		to {
			opacity: 1;
			transform: translate3d(0, 0, 0);
		}
	}

	.animate-stats-entrance {
		animation: statsBarFadeUp 1.1s cubic-bezier(0.16, 1, 0.3, 1) both;
		will-change: transform, opacity;
	}

	/* Accessibilité : désactivation si réduction des mouvements demandée */
	@media (prefers-reduced-motion: reduce) {
		.animate-stats-entrance {
			animation: none !important;
			opacity: 1 !important;
			transform: none !important;
		}
	}
</style>
