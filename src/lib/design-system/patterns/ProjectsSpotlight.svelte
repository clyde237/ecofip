<script lang="ts">
	import { onMount } from 'svelte';
	import Container from '../components/Container.svelte';
	import { Heart, Activity, CheckCircle, ShieldCheck, ArrowRight } from '@lucide/svelte';
	import type { ProjectsSpotlightProps } from '../types.js';

	const defaultMetrics = [
		{ label: 'Consultations gratuites', value: '4 200+' },
		{ label: 'Médicaments offerts', value: '100%' },
		{ label: 'Soignants bénévoles', value: '35' },
		{ label: 'Localités isolées desservies', value: '12' }
	];

	let {
		eyebrow = 'PROJET MAJEUR EN COURS',
		title = 'Cliniques Mobiles & Soins aux Populations Vulnérables',
		description = 'Dans de nombreuses zones rurales du Cameroun, l’accès aux soins de santé de base représente un défi financier et logistique majeur. En partenariat avec des professionnels de santé chrétiens, ECOFIP déploie des cliniques mobiles gratuites, alliant compassion médicale et annonce de la Bonne Nouvelle.',
		image = '/article-communaute.jpg',
		imageAlt = 'Équipe médicale et missionnaire ECOFIP en action sur le terrain',
		location = 'Grand Nord & Région de l’Est',
		badgeLabel = 'Action Humanitaire & Santé',
		metrics = defaultMetrics,
		ctaLabel = 'Soutenir cette mission',
		ctaHref = '/faire-un-don#don',
		class: customClass = ''
	}: ProjectsSpotlightProps = $props();

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
	id="projet-phare"
	bind:this={sectionEl}
	class="bg-[#f8fafc] py-16 sm:py-20 lg:py-28 {customClass}"
	aria-labelledby="projects-spotlight-heading"
>
	<Container>
		<div class="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-14 xl:gap-20">
			<!-- Colonne Gauche (6 colonnes) : Image du projet phare avec encart d'impact -->
			<div class="lg:col-span-6 xl:col-span-6">
				<div class="relative mx-auto max-w-lg lg:max-w-none">
					<!-- Halo lumineux décoratif -->
					<div
						class="pointer-events-none absolute -top-8 -left-8 h-72 w-72 rounded-full bg-brand-primary/10 blur-3xl"
						aria-hidden="true"
					></div>

					<!-- Carte d'image principale -->
					<div
						class="group relative overflow-hidden rounded-3xl border border-gray-200/80 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.08)] transition-all duration-700 ease-out {isVisible
							? 'translate-y-0 opacity-100'
							: 'translate-y-8 opacity-0'}"
					>
						<div class="aspect-[4/3] w-full sm:aspect-[16/11]">
							<img
								src={image}
								alt={imageAlt}
								class="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
								loading="lazy"
							/>
						</div>

						<!-- Voile dégradé bas -->
						<div
							class="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/60 to-transparent"
							aria-hidden="true"
						></div>

						<!-- Badge flottant sur l'image -->
						<div class="absolute right-5 bottom-5 left-5 flex items-center justify-between">
							<div class="rounded-xl bg-white/95 px-3.5 py-1.5 shadow-md backdrop-blur-md">
								<span class="font-body text-xs font-bold text-brand-primary">
									{location}
								</span>
							</div>
							<div class="rounded-xl bg-emerald-600/90 px-3.5 py-1.5 shadow-md backdrop-blur-md">
								<span class="font-body text-xs font-bold text-white">
									{badgeLabel}
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Colonne Droite (6 colonnes) : Détails de la mission & Chiffres d'impact -->
			<div class="lg:col-span-6 xl:col-span-6">
				<div
					class="transition-all duration-700 ease-out {isVisible
						? 'translate-y-0 opacity-100'
						: 'translate-y-8 opacity-0'}"
					style="transition-delay: 150ms;"
				>
					<!-- Eyebrow -->
					{#if eyebrow}
						<div class="mb-4 flex items-center gap-2.5">
							<span class="h-0.5 w-6 rounded-full bg-brand-primary" aria-hidden="true"></span>
							<span
								class="font-body text-xs font-bold tracking-wider text-brand-primary uppercase sm:text-sm"
							>
								{eyebrow}
							</span>
						</div>
					{/if}

					<!-- Titre H2 en Playfair Display -->
					<h2
						id="projects-spotlight-heading"
						class="font-display text-3xl leading-[1.2] font-extrabold tracking-tight text-text-primary sm:text-4xl lg:text-[42px]"
					>
						{title}
					</h2>

					<!-- Description -->
					{#if description}
						<p
							class="mt-5 font-body text-sm leading-relaxed text-text-secondary sm:text-base sm:leading-relaxed"
						>
							{description}
						</p>
					{/if}

					<!-- Grille des 4 indicateurs d'impact immédiats -->
					{#if metrics && metrics.length > 0}
						<div
							class="mt-8 grid grid-cols-2 gap-4 border-y border-gray-200/80 py-6 sm:mt-10 sm:gap-6"
						>
							{#each metrics as metric (metric.label)}
								<div class="flex flex-col">
									<span class="font-display text-2xl font-black text-brand-primary sm:text-3xl">
										{metric.value}
									</span>
									<span class="mt-1 font-body text-xs font-medium text-text-secondary sm:text-sm">
										{metric.label}
									</span>
								</div>
							{/each}
						</div>
					{/if}

					<!-- Boutons d'action -->
					<div class="mt-8 flex flex-wrap items-center gap-4 sm:mt-10">
						{#if ctaLabel}
							<a
								href={ctaHref}
								class="group inline-flex cursor-pointer items-center gap-2 rounded-xl bg-brand-primary px-7 py-3.5 font-body text-sm font-bold text-white shadow-md transition-all duration-200 select-none hover:translate-x-0.5 hover:bg-brand-primary-hover hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-secondary active:bg-[#a6000a] sm:text-base"
							>
								<Heart size={16} class="fill-white text-white" aria-hidden="true" />
								<span>{ctaLabel}</span>
								<ArrowRight
									size={16}
									class="transition-transform duration-200 group-hover:translate-x-1"
									aria-hidden="true"
								/>
							</a>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</Container>
</section>
