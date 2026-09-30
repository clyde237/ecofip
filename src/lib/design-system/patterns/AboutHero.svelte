<script lang="ts">
	import Container from '../components/Container.svelte';
	import {
		Home,
		ChevronRight,
		Sparkles,
		ArrowRight,
		Heart,
		BookOpen,
		Compass,
		Users,
		ShieldCheck
	} from '@lucide/svelte';
	import type { AboutHeroProps } from '../types.js';

	let {
		breadcrumbLabel = 'À propos de nous',
		eyebrow = 'NOTRE IDENTITÉ · NOTRE VISION · NOTRE FOI',
		title = 'Des Économes Fidèles et Prudents au Service',
		highlightedTitle = 'du Royaume de Dieu',
		description = 'Né d’une vision d’obéissance à la Grande Commission et d’un amour profond pour notre prochain, ECOFIP est un mouvement chrétien évangélique et humanitaire engagé à proclamer l’Évangile, former des disciples affermis et apporter une aide concrète aux communautés à travers le Cameroun.',
		verseText = '« Quel est donc l’économe fidèle et prudent que le maître établira sur ses gens, pour leur donner la nourriture au temps convenable ? »',
		verseRef = 'Luc 12:42',
		backgroundImage = '/about-worship-hd.jpg',
		primaryCta = { label: 'Explorer notre mission', href: '#vision-mission' },
		secondaryCta = { label: 'Nous rejoindre', href: '/nous-rejoindre' },
		curvedBottom = true,
		class: customClass = ''
	}: AboutHeroProps = $props();

	const keyPillars = [
		{
			icon: BookOpen,
			label: 'Fondement biblique',
			value: 'Fidélité & Prudence',
			sub: 'Selon Luc 12:42'
		},
		{
			icon: Compass,
			label: 'Vocation spirituelle',
			value: 'Grande Commission',
			sub: 'Évangélisation & Discipulat'
		},
		{
			icon: Heart,
			label: 'Action humanitaire',
			value: 'Amour en action',
			sub: 'Santé & Soutien social'
		},
		{
			icon: Users,
			label: 'Rayonnement',
			value: '10 Régions',
			sub: 'Présence terrain active'
		}
	];
</script>

<section
	class="relative flex min-h-[660px] w-full flex-col justify-between overflow-hidden sm:min-h-[720px] lg:min-h-[780px] {customClass}"
	aria-labelledby="about-hero-title"
>
	<!-- Image d'arrière-plan avec zoom cinématographique très doux -->
	<div
		class="animate-hero-bg absolute inset-0 bg-cover bg-center"
		style="background-image: url('{backgroundImage}');"
		aria-hidden="true"
	></div>

	<!-- Overlay dégradé multi-niveaux : contraste WCAG AAA, teintes profondes nuit et bordeaux ECOFIP -->
	<div
		class="absolute inset-0 bg-gradient-to-b from-[#0d1c1d]/95 via-[#0d1c1d]/85 to-[#171B25]/95 sm:bg-gradient-to-r sm:from-[#0d1c1d]/95 sm:via-[#171B25]/85 sm:to-[#96000A]/70"
		aria-hidden="true"
	></div>

	<!-- Glow d'ambiance doré subtil (symbole de la lumière divine) -->
	<div
		class="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-brand-accent/20 blur-3xl"
		aria-hidden="true"
	></div>

	<!-- Contenu principal centré avec marges appropriées sous le Header fixe (pt-24 sm:pt-28) -->
	<div class="relative z-10 flex-1 pt-24 pb-12 sm:pt-28 sm:pb-16 lg:pt-32 lg:pb-20">
		<Container>
			<!-- Fil d'Ariane (Breadcrumbs) pour une navigation limpide -->
			<nav
				aria-label="Fil d'Ariane"
				class="animate-fade-up delay-breadcrumb mb-6 flex items-center gap-2 font-body text-xs font-semibold text-white/70 sm:text-sm"
			>
				<a
					href="/"
					class="flex items-center gap-1.5 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-brand-accent"
				>
					<Home size={14} class="text-white/80" />
					<span>Accueil</span>
				</a>
				<ChevronRight size={13} class="text-white/40" aria-hidden="true" />
				<span
					class="rounded-md bg-white/10 px-2.5 py-0.5 font-bold text-white shadow-xs backdrop-blur-xs"
					aria-current="page"
				>
					{breadcrumbLabel}
				</span>
			</nav>

			<!-- Grille principale de la bannière : Texte fort à gauche & Encart d'ancrage à droite -->
			<div class="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12 xl:gap-16">
				<!-- Colonne Gauche (7 colonnes) : Titre, badge, description et actions -->
				<div class="lg:col-span-7 xl:col-span-7">
					<!-- Eyebrow Badge avec effet lumineux -->
					{#if eyebrow}
						<div class="animate-fade-up delay-eyebrow mb-4 inline-flex items-center gap-2">
							<span
								class="inline-flex items-center gap-2 rounded-full border border-brand-accent/40 bg-black/40 px-3.5 py-1.5 font-body text-xs font-bold tracking-widest text-brand-accent uppercase shadow-xs backdrop-blur-md"
							>
								<span class="relative flex h-2 w-2">
									<span
										class="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-primary opacity-75"
									></span>
									<span class="relative inline-flex h-2 w-2 rounded-full bg-brand-primary"></span>
								</span>
								<Sparkles size={13} class="text-brand-accent" aria-hidden="true" />
								<span>{eyebrow}</span>
							</span>
						</div>
					{/if}

					<!-- Grand Titre H1 avec Playfair Display élégant -->
					<h1
						id="about-hero-title"
						class="animate-fade-up delay-title font-display text-3xl leading-[1.15] font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl lg:text-[54px]"
					>
						{title}
						{#if highlightedTitle}
							<span
								class="mt-1 block bg-gradient-to-r from-red-400 via-brand-primary to-amber-300 bg-clip-text text-transparent drop-shadow-xs"
							>
								{highlightedTitle}
							</span>
						{/if}
					</h1>

					<!-- Paragraphe descriptif fondateur -->
					{#if description}
						<p
							class="animate-fade-up delay-desc mt-5 max-w-2xl font-body text-base leading-relaxed text-white/90 sm:text-lg sm:leading-relaxed"
						>
							{description}
						</p>
					{/if}

					<!-- Boutons Call To Action -->
					<div
						class="animate-fade-up delay-cta mt-8 flex flex-wrap items-center gap-3.5 font-body sm:mt-10 sm:gap-4"
					>
						{#if primaryCta}
							<a
								href={primaryCta.href}
								class="group inline-flex cursor-pointer items-center gap-2 rounded-xl bg-brand-primary px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-all duration-200 select-none hover:translate-x-0.5 hover:bg-brand-primary-hover hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:bg-[#a6000a] sm:text-base"
							>
								<span>{primaryCta.label}</span>
								<ArrowRight
									size={17}
									class="transition-transform duration-200 group-hover:translate-x-1"
									aria-hidden="true"
								/>
							</a>
						{/if}

						{#if secondaryCta}
							<a
								href={secondaryCta.href}
								class="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-3.5 text-sm font-bold text-white shadow-xs backdrop-blur-md transition-all duration-200 select-none hover:border-white/60 hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:text-base"
							>
								<Heart size={16} class="text-brand-accent" aria-hidden="true" />
								<span>{secondaryCta.label}</span>
							</a>
						{/if}
					</div>
				</div>

				<!-- Colonne Droite (5 colonnes) : Carte Verse Biblique Fondateur (Luc 12:42) -->
				<div class="lg:col-span-5 xl:col-span-5">
					<div
						class="animate-fade-up delay-verse group relative overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-white/15 via-white/10 to-black/30 p-6 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-white/35 hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] sm:p-8"
					>
						<!-- Éclat décoratif au coin supérieur -->
						<div
							class="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-brand-primary/30 blur-2xl transition-all group-hover:scale-125"
							aria-hidden="true"
						></div>

						<div class="relative z-10">
							<!-- En-tête de la carte avec icône de bouclier de fidélité -->
							<div class="mb-4 flex items-center justify-between border-b border-white/15 pb-4">
								<div class="flex items-center gap-2.5">
									<div
										class="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/80 text-white shadow-xs"
									>
										<ShieldCheck size={20} />
									</div>
									<div>
										<span
											class="block font-body text-xs font-bold tracking-wider text-brand-accent uppercase"
										>
											Verset de Référence
										</span>
										<span class="block font-display text-sm font-bold text-white">
											Origine du nom ECOFIP
										</span>
									</div>
								</div>
								<span
									class="rounded-lg border border-amber-300/40 bg-amber-400/20 px-2.5 py-1 text-xs font-black text-amber-200"
								>
									{verseRef}
								</span>
							</div>

							<!-- Citation du verset biblique -->
							<blockquote
								class="my-4 font-display text-base leading-relaxed text-white/95 italic sm:text-lg sm:leading-relaxed"
							>
								{verseText}
							</blockquote>

							<!-- Explication de la portée -->
							<div class="mt-5 rounded-xl border border-white/10 bg-black/25 p-3.5">
								<p class="font-body text-xs leading-relaxed text-white/80 sm:text-sm">
									<strong class="text-white">ECOFIP</strong> incarne cet appel du Christ : être des administrateurs
									fidèles et prudents de Sa grâce, pour nourrir spirituellement et matériellement notre
									génération.
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</Container>
	</div>

	<!-- Bandeau de réassurance / 4 Piliers clés d'identité (Docké en bas de la bannière) -->
	<div class="relative z-10 border-t border-white/15 bg-black/40 backdrop-blur-md">
		<Container>
			<div class="grid grid-cols-2 gap-4 py-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6 lg:py-7">
				{#each keyPillars as pillar (pillar.label)}
					<div
						class="flex items-center gap-3.5 rounded-xl p-2 transition-transform duration-200 hover:translate-y-[-2px]"
					>
						<div
							class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-brand-accent shadow-xs"
						>
							<pillar.icon size={20} />
						</div>
						<div class="min-w-0">
							<span class="block truncate font-body text-xs font-medium text-white/70">
								{pillar.label}
							</span>
							<span class="block truncate font-display text-sm font-bold text-white sm:text-base">
								{pillar.value}
							</span>
							<span class="block truncate font-body text-[11px] text-white/50">
								{pillar.sub}
							</span>
						</div>
					</div>
				{/each}
			</div>
		</Container>
	</div>

	<!-- Courbe inférieure fluide vers le reste du contenu de page -->
	{#if curvedBottom}
		<div
			class="pointer-events-none relative z-10 -mt-1 w-full overflow-hidden leading-none select-none"
			aria-hidden="true"
		>
			<svg
				class="relative block h-7 w-full text-[#f8fafc] sm:h-10 lg:h-14"
				viewBox="0 0 1440 60"
				preserveAspectRatio="none"
				fill="currentColor"
			>
				<path d="M0,60 L0,35 Q720,0 1440,35 L1440,60 Z" />
			</svg>
		</div>
	{/if}
</section>

<style>
	/* Animation d'arrière-plan cinématographique doux */
	@keyframes aboutBgZoom {
		from {
			transform: scale(1.05);
		}
		to {
			transform: scale(1);
		}
	}

	/* Animation Fade-up fluide et progressive */
	@keyframes aboutFadeUp {
		from {
			opacity: 0;
			transform: translate3d(0, 24px, 0);
		}
		to {
			opacity: 1;
			transform: translate3d(0, 0, 0);
		}
	}

	.animate-hero-bg {
		animation: aboutBgZoom 2.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
		will-change: transform;
	}

	.animate-fade-up {
		animation: aboutFadeUp 1.1s cubic-bezier(0.16, 1, 0.3, 1) both;
		will-change: transform, opacity;
	}

	/* Délais échelonnés naturels (Staggered cascade) */
	.delay-breadcrumb {
		animation-delay: 80ms;
	}

	.delay-eyebrow {
		animation-delay: 180ms;
	}

	.delay-title {
		animation-delay: 300ms;
	}

	.delay-desc {
		animation-delay: 440ms;
	}

	.delay-cta {
		animation-delay: 580ms;
	}

	.delay-verse {
		animation-delay: 400ms;
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
