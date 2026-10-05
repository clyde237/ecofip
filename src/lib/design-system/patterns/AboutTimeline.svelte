<script lang="ts">
	import { onMount } from 'svelte';
	import Container from '../components/Container.svelte';
	import type { AboutTimelineProps, AboutTimelineMilestone } from '../types.js';

	const defaultMilestones: AboutTimelineMilestone[] = [
		{
			id: 'origines',
			tag: 'VISION DIVINE',
			title: 'La naissance de la vision',
			description:
				'ECOFIP est né d’une vision divine reçue par notre fondateur, Pasteur Valéry TCHAMEKWEN, appelé à susciter une génération d’économes fidèles qui géreraient avec sagesse et intégrité les ressources et les âmes confiées par Dieu.'
		},
		{
			id: 'parcours',
			tag: 'IMPACT HOLISTIQUE',
			title: 'Un message d’espoir à travers le Cameroun',
			description:
				'Depuis sa création, ECOFIP a parcouru les régions du Cameroun avec un message d’espoir, de salut et de transformation. Notre ministère se distingue par une approche holistique combinant l’évangélisation, l’enseignement biblique et l’action sociale.'
		},
		{
			id: 'cameroun-pour-jesus',
			tag: 'AUJOURD’HUI',
			title: 'Le projet national « Cameroun pour Jésus »',
			description:
				'Aujourd’hui, avec le projet « Cameroun pour Jésus », nous poursuivons cette mission avec une détermination renouvelée, croyant que Dieu fera de grandes choses à travers notre obéissance et notre fidélité.'
		}
	];

	let {
		eyebrow = 'NOTRE PARCOURS',
		title = 'Notre histoire',
		subtitle = 'L’histoire divine d’un ministère suscité pour toucher les cœurs et bâtir le Royaume au Cameroun.',
		milestones = defaultMilestones,
		class: customClass = ''
	}: AboutTimelineProps = $props();

	let sectionEl: HTMLElement | null = $state(null);
	let timelineContainerEl: HTMLElement | null = $state(null);
	let isVisible = $state(false);
	let fillHeight = $state(0);
	let revealedIds = $state<string[]>([]);
	let isReducedMotion = $state(false);

	let ticking = false;

	function updateScrollProgress() {
		if (isReducedMotion) {
			fillHeight = 9999;
			return;
		}

		if (!timelineContainerEl) return;

		const rect = timelineContainerEl.getBoundingClientRect();
		const windowHeight = window.innerHeight;
		// La ligne commence à se remplir dès que le haut de la timeline entre dans la moitié inférieure de l'écran
		const triggerY = windowHeight * 0.65;

		const currentProgressY = triggerY - rect.top;
		const totalHeight = rect.height;

		fillHeight = Math.max(0, Math.min(currentProgressY, totalHeight));

		// Vérifier l'apparition progressive au scroll de chaque étape
		for (const milestone of milestones) {
			if (!revealedIds.includes(milestone.id)) {
				const itemEl = document.getElementById(`timeline-milestone-${milestone.id}`);
				if (itemEl) {
					const itemRect = itemEl.getBoundingClientRect();
					if (itemRect.top <= triggerY + 20) {
						revealedIds.push(milestone.id);
					}
				}
			}
		}
	}

	function onWindowScroll() {
		if (!ticking) {
			window.requestAnimationFrame(() => {
				updateScrollProgress();
				ticking = false;
			});
			ticking = true;
		}
	}

	onMount(() => {
		isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (isReducedMotion) {
			isVisible = true;
			fillHeight = 9999;
			revealedIds = milestones.map((m) => m.id);
			return;
		}

		if (sectionEl) {
			const observer = new IntersectionObserver(
				(entries) => {
					for (const entry of entries) {
						if (entry.isIntersecting) {
							isVisible = true;
							updateScrollProgress();
							observer.disconnect();
							break;
						}
					}
				},
				{ threshold: 0.1 }
			);
			observer.observe(sectionEl);
		}

		// Initialisation différée au montage
		const timer = setTimeout(() => {
			updateScrollProgress();
		}, 60);

		return () => {
			clearTimeout(timer);
		};
	});
</script>

<svelte:window onscroll={onWindowScroll} onresize={onWindowScroll} />

<section
	id="parcours"
	bind:this={sectionEl}
	class="bg-[#f8fafc] py-16 sm:py-20 lg:py-28 {customClass}"
	aria-labelledby="about-timeline-heading"
>
	<Container>
		<!-- En-tête centré fidèle à la maquette -->
		<div
			class="mx-auto max-w-3xl text-center transition-all duration-700 ease-out {isVisible
				? 'translate-y-0 opacity-100'
				: 'translate-y-8 opacity-0'}"
		>
			<!-- Surtitre avec trait rouge centré -->
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
				id="about-timeline-heading"
				class="font-display text-3xl leading-[1.2] font-extrabold tracking-tight text-text-primary sm:text-4xl lg:text-[44px]"
			>
				{title}
			</h2>

			<!-- Sous-titre descriptif -->
			{#if subtitle}
				<p class="mt-4 font-body text-xs leading-relaxed text-text-secondary sm:text-sm">
					{subtitle}
				</p>
			{/if}
		</div>

		<!-- Chronologie dynamique : barre progressive et apparitions au scroll -->
		<div bind:this={timelineContainerEl} class="relative mx-auto mt-14 max-w-4xl sm:mt-20">
			<!-- 1. Piste de fond grise inerte de la timeline -->
			<div
				class="absolute top-3 bottom-3 left-4 w-0.5 -translate-x-1/2 rounded-full bg-gray-200 md:left-1/2"
				aria-hidden="true"
			></div>

			<!-- 2. Barre rouge progressive qui se remplit fluidement au scroll -->
			<div
				class="pointer-events-none absolute top-3 left-4 w-0.5 -translate-x-1/2 rounded-full bg-brand-primary shadow-[0_0_8px_rgba(237,7,20,0.4)] transition-[height] duration-150 ease-out md:left-1/2"
				style="height: {fillHeight}px;"
				aria-hidden="true"
			>
				<!-- Tête de lecture lumineuse au bout de la barre qui se remplit -->
				{#if fillHeight > 5}
					<span
						class="absolute -bottom-1 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-brand-primary shadow-[0_0_10px_#ed0714]"
					></span>
				{/if}
			</div>

			<!-- 3. Liste des étapes chronologiques avec révélation au fur et à mesure -->
			<div class="space-y-12 sm:space-y-16 lg:space-y-20">
				{#each milestones as milestone, index (milestone.id)}
					{@const isEven = index % 2 === 1}
					{@const isReached = isReducedMotion || revealedIds.includes(milestone.id)}
					<div
						id="timeline-milestone-{milestone.id}"
						class="relative flex flex-col md:flex-row {isEven
							? 'md:justify-end'
							: 'md:justify-start'}"
					>
						<!-- Point central (Node de la timeline) qui s'illumine dès qu'atteint par le scroll -->
						<div
							class="absolute top-1.5 left-4 z-10 flex h-4.5 w-4.5 -translate-x-1/2 items-center justify-center rounded-full border-2 transition-all duration-500 md:left-1/2 {isReached
								? 'scale-110 border-brand-primary bg-brand-primary shadow-[0_0_12px_rgba(237,7,20,0.5)] ring-4 ring-brand-subtle'
								: 'scale-90 border-gray-300 bg-white opacity-60'}"
							aria-hidden="true"
						>
							<span
								class="h-1.5 w-1.5 rounded-full transition-colors duration-300 {isReached
									? 'bg-white'
									: 'bg-gray-400'}"
							></span>
						</div>

						<!-- Bloc de contenu de l'étape : animation d'apparition fluide et translation -->
						<div
							class="pl-10 transition-all duration-700 ease-out md:w-1/2 {isEven
								? 'md:pl-10 md:text-left'
								: 'md:pr-10 md:pl-0 md:text-left'} {isReached
								? 'translate-y-0 opacity-100'
								: 'translate-y-8 opacity-0'}"
						>
							<!-- Badge tag en rouge (ex: ORIGINES, DÉVELOPPEMENT, EXPANSION) -->
							<span
								class="block font-body text-xs font-bold tracking-wider text-brand-primary uppercase"
							>
								{milestone.tag}
							</span>

							<!-- Titre de l'étape -->
							<h3
								class="mt-1 font-body text-lg font-bold tracking-tight text-text-primary sm:text-xl"
							>
								{milestone.title}
							</h3>

							<!-- Description de l'étape -->
							<p
								class="mt-2 font-body text-xs leading-relaxed text-text-secondary sm:text-sm sm:leading-relaxed"
							>
								{milestone.description}
							</p>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</Container>
</section>
