<script lang="ts">
	/**
	 * Bannière compacte en haut des pages intérieures (toutes sauf l'accueil) :
	 * fil d'Ariane, titre et sous-titre sur une image de fond assombrie. Pas de badge ni de bouton.
	 */
	import Container from '../components/Container.svelte';
	import { Home, ChevronRight } from '@lucide/svelte';

	interface Props {
		title: string;
		subtitle?: string;
		/** Libellé de la page courante dans le fil d'Ariane (par défaut : le titre) */
		breadcrumbLabel?: string;
		/** Pages intermédiaires du fil d'Ariane, entre « Accueil » et la page courante */
		breadcrumbParents?: { label: string; href: string }[];
		backgroundImage?: string;
		class?: string;
	}

	let {
		title,
		subtitle,
		breadcrumbLabel,
		breadcrumbParents = [],
		backgroundImage,
		class: customClass = ''
	}: Props = $props();
</script>

<section
	class="relative overflow-hidden bg-[#0d1c1d] pt-28 pb-10 text-white sm:pt-32 sm:pb-12 {customClass}"
	aria-labelledby="page-banner-title"
>
	{#if backgroundImage}
		<div
			class="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity"
			style="background-image: url('{backgroundImage}');"
			aria-hidden="true"
		></div>
	{/if}
	<div
		class="absolute inset-0 bg-gradient-to-b from-[#0d1c1d]/95 via-[#0d1c1d]/85 to-[#171B25]/95 sm:bg-gradient-to-r sm:from-[#0d1c1d]/95 sm:via-[#171B25]/90 sm:to-[#96000A]/70"
		aria-hidden="true"
	></div>

	<Container class="relative z-10">
		<div class="mx-auto max-w-3xl text-center">
			<nav
				aria-label="Fil d’Ariane"
				class="flex flex-wrap items-center justify-center gap-1.5 font-body text-xs font-semibold text-white/65"
			>
				<a href="/" class="flex items-center gap-1 transition-colors hover:text-white">
					<Home size={13} /> Accueil
				</a>
				{#each breadcrumbParents as parent (parent.href)}
					<ChevronRight size={12} class="text-white/40" aria-hidden="true" />
					<a href={parent.href} class="transition-colors hover:text-white">{parent.label}</a>
				{/each}
				<ChevronRight size={12} class="text-white/40" aria-hidden="true" />
				<span class="max-w-[60vw] truncate text-white/90" aria-current="page">
					{breadcrumbLabel ?? title}
				</span>
			</nav>

			<h1
				id="page-banner-title"
				class="mt-4 font-display text-3xl leading-tight font-extrabold tracking-tight text-white sm:text-4xl lg:text-[44px]"
			>
				{title}
			</h1>

			{#if subtitle}
				<p
					class="mx-auto mt-3 max-w-2xl font-body text-sm leading-relaxed text-white/80 sm:text-base"
				>
					{subtitle}
				</p>
			{/if}
		</div>
	</Container>
</section>
