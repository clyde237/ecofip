<script lang="ts">
	import type { Snippet } from 'svelte';
	import Container from '../components/Container.svelte';
	import { ArrowRight } from '@lucide/svelte';

	interface CtaButton {
		label: string;
		href: string;
	}

	let {
		eyebrow = 'UNE MISSION · UNE VISION · UNE FOI',
		title,
		description = "Nous sommes un ministère chrétien évangélique engagé à porter l'Évangile, former des disciples et transformer des vies au Cameroun et au-delà.",
		primaryCta = { label: 'Découvrir nos missions', href: '/projets-missions' },
		secondaryCta = { label: 'En savoir plus', href: '/a-propos' },
		tertiaryCta = { label: 'Nous rejoindre', href: '/nous-rejoindre' },
		backgroundImage = '/hero-bg.jpg',
		curvedBottom = true,
		class: customClass = ''
	}: {
		eyebrow?: string;
		title?: Snippet;
		description?: string;
		primaryCta?: CtaButton;
		secondaryCta?: CtaButton;
		tertiaryCta?: CtaButton;
		backgroundImage?: string;
		curvedBottom?: boolean;
		class?: string;
	} = $props();
</script>

<section
	class="relative flex min-h-[640px] w-full items-center overflow-hidden sm:min-h-[720px] lg:min-h-[780px] {customClass}"
>
	<!-- Arrière-plan savane avec zoom doux et cinématographique au chargement -->
	<div
		class="animate-hero-bg absolute inset-0 bg-cover bg-center sm:bg-[center_right]"
		style="background-image: url('{backgroundImage}');"
		aria-hidden="true"
	></div>

	<!-- Overlay gradient de contraste optimisé WCAG AAA pour la lisibilité textuelle -->
	<div
		class="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/20 sm:from-[#0d1c1d]/90 sm:via-[#0d1c1d]/65 sm:to-transparent"
		aria-hidden="true"
	></div>

	<!-- Glow d'ambiance chaud subtil en haut à droite -->
	<div
		class="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-brand-accent/15 blur-3xl"
		aria-hidden="true"
	></div>

	<Container class="relative z-10 pt-16 pb-24 sm:pt-20 sm:pb-32 lg:pt-28 lg:pb-38">
		<div class="max-w-3xl">
			<!-- Eyebrow (Fade-up slow & smooth) -->
			{#if eyebrow}
				<div class="animate-fade-up delay-eyebrow mb-5 flex items-center gap-2 sm:mb-6">
					<span
						class="font-body text-xs font-semibold tracking-[0.22em] text-white/90 uppercase sm:text-sm"
					>
						{eyebrow}
					</span>
				</div>
			{/if}

			<!-- Heading H1 (Fade-up slow & smooth) -->
			<h1
				class="animate-fade-up delay-title font-display text-4xl leading-[1.12] font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-[68px]"
			>
				{#if title}
					{@render title()}
				{:else}
					Un mouvement au<br />
					service du <span class="text-brand-primary">Royaume</span><br />
					<span class="text-brand-primary">de Dieu</span>
				{/if}
			</h1>

			<!-- Description (Fade-up slow & smooth) -->
			{#if description}
				<p
					class="animate-fade-up delay-desc mt-6 max-w-2xl font-body text-base leading-relaxed text-white/85 sm:text-lg"
				>
					{description}
				</p>
			{/if}

			<!-- Call To Actions (Fade-up slow & smooth avec micro-interactions) -->
			<div
				class="animate-fade-up delay-cta mt-8 flex flex-wrap items-center gap-3.5 font-body sm:mt-10 sm:gap-4"
			>
				{#if primaryCta}
					<a
						href={primaryCta.href}
						class="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-brand-primary px-6 py-3.5 text-sm font-bold text-white shadow-md transition-all duration-200 select-none hover:translate-x-0.5 hover:bg-brand-primary-hover hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:bg-[#a6000a] sm:text-base"
					>
						<span>{primaryCta.label}</span>
						<ArrowRight size={18} aria-hidden="true" />
					</a>
				{/if}

				{#if secondaryCta}
					<a
						href={secondaryCta.href}
						class="inline-flex cursor-pointer items-center justify-center rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-brand-primary shadow-md transition-all duration-200 select-none hover:-translate-y-0.5 hover:bg-white/95 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:bg-gray-100 sm:text-base"
					>
						<span>{secondaryCta.label}</span>
					</a>
				{/if}

				{#if tertiaryCta}
					<a
						href={tertiaryCta.href}
						class="inline-flex cursor-pointer items-center justify-center rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-brand-primary shadow-md transition-all duration-200 select-none hover:-translate-y-0.5 hover:bg-white/95 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:bg-gray-100 sm:text-base"
					>
						<span>{tertiaryCta.label}</span>
					</a>
				{/if}
			</div>
		</div>
	</Container>

	<!-- Ligne / courbe d'intersection fluide avec la section suivante -->
	{#if curvedBottom}
		<div
			class="pointer-events-none absolute right-0 bottom-0 left-0 z-10 w-full overflow-hidden leading-none select-none"
			aria-hidden="true"
		>
			<svg
				class="relative block h-10 w-full text-white sm:h-14 lg:h-20"
				viewBox="0 0 1440 80"
				preserveAspectRatio="none"
				fill="currentColor"
			>
				<path d="M0,80 L0,50 Q720,0 1440,50 L1440,80 Z" />
			</svg>
		</div>
	{/if}
</section>

<style>
	/* Animation d'arrière-plan cinématographique doux */
	@keyframes heroBgZoom {
		from {
			transform: scale(1.06);
		}
		to {
			transform: scale(1);
		}
	}

	/* Animation Fade-up lente, onctueuse et progressive */
	@keyframes heroFadeUp {
		from {
			opacity: 0;
			transform: translate3d(0, 26px, 0);
		}
		to {
			opacity: 1;
			transform: translate3d(0, 0, 0);
		}
	}

	.animate-hero-bg {
		animation: heroBgZoom 2.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
		will-change: transform;
	}

	.animate-fade-up {
		animation: heroFadeUp 1.15s cubic-bezier(0.16, 1, 0.3, 1) both;
		will-change: transform, opacity;
	}

	/* Délais échelonnés naturels (Staggered cascade) */
	.delay-eyebrow {
		animation-delay: 150ms;
	}

	.delay-title {
		animation-delay: 320ms;
	}

	.delay-desc {
		animation-delay: 480ms;
	}

	.delay-cta {
		animation-delay: 640ms;
	}

	/* Respect des préférences de réduction de mouvement (Accessibilité WCAG AAA) */
	@media (prefers-reduced-motion: reduce) {
		.animate-hero-bg,
		.animate-fade-up {
			animation: none !important;
			opacity: 1 !important;
			transform: none !important;
		}
	}
</style>
