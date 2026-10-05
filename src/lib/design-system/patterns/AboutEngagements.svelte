<script lang="ts">
	import { onMount } from 'svelte';
	import Container from '../components/Container.svelte';
	import { CircleDot, Sparkles, Diamond } from '@lucide/svelte';
	import type { AboutEngagementsProps, AboutEngagementItem } from '../types.js';

	const defaultEngagements: AboutEngagementItem[] = [
		{
			id: 'vision',
			icon: CircleDot,
			title: 'Notre vision',
			description:
				'Voir chaque région du Cameroun et d’Afrique touchée par la puissance transformatrice de l’Évangile de Jésus-Christ, formant une génération d’économes fidèles et prudents dans tous les domaines de la vie.'
		},
		{
			id: 'mission',
			icon: Sparkles,
			title: 'Notre mission',
			description:
				'Évangéliser massivement, former des leaders spirituels, et apporter l’espoir et la transformation par des actions humanitaires, tout en collaborant avec les églises locales pour bâtir le royaume de Dieu.'
		},
		{
			id: 'methodes',
			icon: Diamond,
			title: 'Nos méthodes d’action',
			description:
				'Des croisades massives pour annoncer l’Évangile avec puissance, des séminaires et formations pour équiper les disciples, et la production de traités bibliques pour la diffusion du message.'
		}
	];

	let {
		eyebrow = 'VISION & MISSION',
		title = 'Notre vision, mission et méthodes d’action',
		subtitle = 'Des stratégies bibliques pour toucher les cœurs, équiper les croyants et transformer les communautés.',
		items = defaultEngagements,
		class: customClass = ''
	}: AboutEngagementsProps = $props();

	let sectionEl: HTMLElement | null = $state(null);
	let isVisible = $state(false);

	onMount(() => {
		const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (prefersReducedMotion) {
			isVisible = true;
			return;
		}

		if (!sectionEl) {
			isVisible = true;
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						isVisible = true;
						observer.disconnect();
						break;
					}
				}
			},
			{ threshold: 0.15 }
		);

		observer.observe(sectionEl);

		return () => {
			observer.disconnect();
		};
	});
</script>

<section
	id="engagements"
	bind:this={sectionEl}
	class="bg-[#f8fafc] py-16 sm:py-20 lg:py-28 {customClass}"
	aria-labelledby="about-engagements-heading"
>
	<Container>
		<!-- En-tête centré fidèle à la maquette -->
		<div
			class="mx-auto max-w-3xl text-center transition-all duration-700 ease-out {isVisible
				? 'translate-y-0 opacity-100'
				: 'translate-y-8 opacity-0'}"
		>
			<!-- Surtitre avec filet rouge centré -->
			{#if eyebrow}
				<div class="mb-3 flex items-center justify-center gap-2.5">
					<span class="h-0.5 w-6 rounded-full bg-brand-primary" aria-hidden="true"></span>
					<span
						class="font-body text-xs font-bold tracking-wider text-brand-primary uppercase sm:text-sm"
					>
						{eyebrow}
					</span>
				</div>
			{/if}

			<!-- Grand Titre H2 en Playfair Display -->
			<h2
				id="about-engagements-heading"
				class="font-display text-3xl leading-[1.2] font-extrabold tracking-tight text-text-primary sm:text-4xl lg:text-[44px]"
			>
				{title}
			</h2>

			<!-- Sous-titre descriptif -->
			{#if subtitle}
				<p class="mt-4 font-body text-sm leading-relaxed text-text-secondary sm:text-base">
					{subtitle}
				</p>
			{/if}
		</div>

		<!-- Grille des 3 cartes d'engagements -->
		<div class="mt-12 grid grid-cols-1 gap-6 sm:mt-16 md:grid-cols-3 lg:gap-8">
			{#each items as item, index (item.id)}
				<div
					class="group relative flex flex-col rounded-3xl border border-gray-200/70 bg-white p-7 shadow-[0_10px_30px_rgba(0,0,0,0.04)] transition-all duration-500 ease-out hover:-translate-y-1.5 hover:border-gray-300 hover:shadow-[0_20px_45px_rgba(0,0,0,0.08)] sm:p-9 {isVisible
						? 'translate-y-0 opacity-100'
						: 'translate-y-8 opacity-0'}"
					style="transition-delay: {index * 150 + 100}ms;"
				>
					<!-- Pastille circulaire avec icône rouge sur fond rouge très pâle -->
					<div
						class="mb-6 flex h-13 w-13 items-center justify-center rounded-full bg-brand-subtle text-brand-primary shadow-xs transition-transform duration-300 group-hover:scale-110"
					>
						<item.icon size={22} strokeWidth={2.2} />
					</div>

					<!-- Titre de l'engagement -->
					<h3 class="font-body text-xl font-bold tracking-tight text-text-primary sm:text-[22px]">
						{item.title}
					</h3>

					<!-- Trait horizontal rouge distinctif sous le titre -->
					<span class="mt-3 mb-4 block h-0.5 w-7 rounded-full bg-brand-primary" aria-hidden="true"
					></span>

					<!-- Description détaillée -->
					<p class="font-body text-sm leading-relaxed text-text-secondary sm:text-[15px]">
						{item.description}
					</p>
				</div>
			{/each}
		</div>
	</Container>
</section>
