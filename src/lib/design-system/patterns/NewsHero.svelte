<script lang="ts">
	import Container from '../components/Container.svelte';
	import { Home, ChevronRight, Newspaper, Sparkles } from '@lucide/svelte';
	import type { NewsHeroProps } from '../types.js';

	let {
		breadcrumbLabel = 'Actualités',
		eyebrow = 'CHRONIQUES, ENSEIGNEMENTS & TÉMOIGNAGES',
		title = 'Les nouvelles vivantes de la mission ECOFIP',
		subtitle = 'Découvrez les rapports de terrain de nos croisades, les récits vibrants de vies transformées par l’Évangile, les enseignements pour fortifier votre foi et les avancées humanitaires au Cameroun.',
		backgroundImage = '/article-evangelisation.jpg',
		class: customClass = ''
	}: NewsHeroProps = $props();

	const quickTags = [
		'Rapports de Croisades',
		'Témoignages de Guérison',
		'Enseignements Bibliques',
		'Actions Humanitaires'
	];
</script>

<section
	class="relative flex w-full flex-col justify-center overflow-hidden bg-[#0d1c1d] pt-28 pb-16 sm:pt-32 sm:pb-20 lg:pt-36 lg:pb-24 {customClass}"
	aria-labelledby="news-hero-title"
>
	<!-- Arrière-plan avec photo missionnaire et dégradé immersif WCAG AAA -->
	{#if backgroundImage}
		<div
			class="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity"
			style="background-image: url('{backgroundImage}');"
			aria-hidden="true"
		></div>
	{/if}

	<!-- Dégradé riche de marque : bleu nuit vers bordeaux profond ECOFIP -->
	<div
		class="absolute inset-0 bg-gradient-to-b from-[#0d1c1d]/95 via-[#0d1c1d]/85 to-[#171B25]/95 sm:bg-gradient-to-r sm:from-[#0d1c1d]/95 sm:via-[#171B25]/90 sm:to-[#96000A]/70"
		aria-hidden="true"
	></div>

	<!-- Lueurs lumineuses discrètes d'ambiance -->
	<div
		class="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-brand-primary/20 blur-3xl"
		aria-hidden="true"
	></div>
	<div
		class="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-brand-accent/15 blur-3xl"
		aria-hidden="true"
	></div>

	<Container class="relative z-10">
		<div class="mx-auto max-w-3xl text-center">
			<!-- Fil d'Ariane -->
			<nav
				aria-label="Fil d'Ariane"
				class="mb-5 flex items-center justify-center gap-2 font-body text-xs font-semibold text-white/70 sm:text-sm"
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

			<!-- Badge / Surtitre simple -->
			{#if eyebrow}
				<div class="mb-4 inline-flex items-center justify-center">
					<span
						class="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/30 px-3.5 py-1.5 font-body text-xs font-bold tracking-widest text-brand-accent uppercase shadow-xs backdrop-blur-md"
					>
						<Sparkles size={13} class="text-brand-accent" aria-hidden="true" />
						<span>{eyebrow}</span>
					</span>
				</div>
			{/if}

			<!-- Grand Titre H1 en Playfair Display blanc -->
			<h1
				id="news-hero-title"
				class="font-display text-3xl leading-[1.15] font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl lg:text-[54px]"
			>
				{title}
			</h1>

			<!-- Sous-titre descriptif en DM Sans -->
			{#if subtitle}
				<p
					class="mt-5 font-body text-sm leading-relaxed text-white/85 sm:text-base sm:leading-relaxed md:text-lg"
				>
					{subtitle}
				</p>
			{/if}

			<!-- Badges des thématiques rapides -->
			<div class="mt-8 flex flex-wrap items-center justify-center gap-2.5 sm:mt-10 sm:gap-3">
				{#each quickTags as tag (tag)}
					<span
						class="rounded-xl border border-white/15 bg-white/10 px-3.5 py-2 font-body text-xs font-semibold text-white shadow-2xs backdrop-blur-md transition-colors hover:border-white/30 hover:bg-white/15 sm:text-sm"
					>
						{tag}
					</span>
				{/each}
			</div>

			<!-- Bouton de saut direct aux articles -->
			<div class="mt-8 flex justify-center sm:mt-10">
				<a
					href="#articles"
					class="group inline-flex items-center gap-2 rounded-xl bg-brand-primary px-7 py-3.5 font-body text-sm font-bold text-white shadow-md transition-all duration-200 select-none hover:translate-y-[-1px] hover:bg-brand-primary-hover hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:text-base"
				>
					<Newspaper size={18} class="text-white" aria-hidden="true" />
					<span>Découvrir les articles et témoignages</span>
				</a>
			</div>
		</div>
	</Container>
</section>
