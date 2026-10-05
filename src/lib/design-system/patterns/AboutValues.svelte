<script lang="ts">
	import { onMount } from 'svelte';
	import Container from '../components/Container.svelte';
	import type { AboutValuesProps, AboutValueItem } from '../types.js';

	const defaultValues: AboutValueItem[] = [
		{
			number: '01',
			title: 'Amour',
			description: 'L’amour de Christ nous pousse à servir avec compassion et dévouement.'
		},
		{
			number: '02',
			title: 'Fidélité',
			description:
				'Être des économes fidèles de l’Évangile et des ressources qui nous sont confiées.'
		},
		{
			number: '03',
			title: 'Unité',
			description: 'Rassembler le corps de Christ dans l’unité pour la moisson des âmes.'
		},
		{
			number: '04',
			title: 'Excellence',
			description: 'Servir Dieu avec excellence et professionnalisme dans tout ce que nous faisons.'
		}
	];

	let {
		eyebrow = 'NOS VALEURS',
		title = 'Les principes qui guident notre service',
		subtitle = 'Quatre piliers spirituels et éthiques qui définissent notre identité et chacune de nos actions.',
		values = defaultValues,
		image = '/about-valeurs.png',
		imageAlt = 'Équipe et jeunes ECOFIP unis au coucher du soleil dans la communion fraternelle',
		class: customClass = ''
	}: AboutValuesProps = $props();

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
	id="valeurs"
	bind:this={sectionEl}
	class="bg-white py-16 sm:py-20 lg:py-28 {customClass}"
	aria-labelledby="about-values-heading"
>
	<Container>
		<div class="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-14 xl:gap-20">
			<!-- Colonne Gauche (6 colonnes) : Contenu éditorial et liste des 4 valeurs numérotées -->
			<div class="lg:col-span-6 xl:col-span-6">
				<div
					class="transition-all duration-700 ease-out {isVisible
						? 'translate-y-0 opacity-100'
						: 'translate-y-8 opacity-0'}"
				>
					<!-- Eyebrow avec tiret rouge distinctif -->
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

					<!-- Grand Titre H2 en Playfair Display -->
					<h2
						id="about-values-heading"
						class="font-display text-3xl leading-[1.18] font-extrabold tracking-tight text-text-primary sm:text-4xl lg:text-[44px]"
					>
						{title}
					</h2>

					<!-- Sous-titre descriptif -->
					{#if subtitle}
						<p class="mt-4 font-body text-sm leading-relaxed text-text-secondary sm:text-base">
							{subtitle}
						</p>
					{/if}

					<!-- Liste des 4 valeurs avec pastilles numérotées et séparateurs discrets -->
					<div class="mt-8 space-y-5 sm:mt-10 sm:space-y-6">
						{#each values as val, index (val.number)}
							<div class="flex items-start gap-4 sm:gap-5">
								<!-- Pastille circulaire numérotée rouge sur fond rose très pâle -->
								<div
									class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-subtle text-sm font-extrabold text-brand-primary shadow-xs"
								>
									{val.number}
								</div>

								<!-- Texte de la valeur -->
								<div class="flex-1 pt-0.5">
									<h3
										class="font-body text-base font-bold tracking-tight text-text-primary sm:text-lg"
									>
										{val.title}
									</h3>
									<p class="mt-1 font-body text-xs leading-relaxed text-text-secondary sm:text-sm">
										{val.description}
									</p>
								</div>
							</div>

							<!-- Ligne de séparation fine sauf après le dernier élément -->
							{#if index < values.length - 1}
								<div class="border-b border-gray-100 pt-1" aria-hidden="true"></div>
							{/if}
						{/each}
					</div>
				</div>
			</div>

			<!-- Colonne Droite (6 colonnes) : Image communautaire unie au coucher du soleil -->
			<div class="lg:col-span-6 xl:col-span-6">
				<div
					class="relative mx-auto max-w-lg transition-all duration-700 ease-out lg:max-w-none {isVisible
						? 'translate-y-0 opacity-100'
						: 'translate-y-8 opacity-0'}"
					style="transition-delay: 200ms;"
				>
					<!-- Halo lumineux d'arrière-plan doux et chaleureux -->
					<div
						class="pointer-events-none absolute -top-6 -right-6 h-64 w-64 rounded-full bg-brand-accent/15 blur-3xl"
						aria-hidden="true"
					></div>

					<!-- Cadre de l'image arrondi -->
					<div
						class="group relative overflow-hidden rounded-3xl border border-gray-100 bg-surface shadow-[0_20px_50px_rgba(0,0,0,0.1)]"
					>
						<div class="aspect-[16/11] w-full sm:aspect-[4/3] lg:aspect-[16/11]">
							<img
								src={image}
								alt={imageAlt}
								class="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
								loading="lazy"
							/>
						</div>

						<!-- Léger dégradé d'ambiance doré / chaud au bas de la photo -->
						<div
							class="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/25 to-transparent"
							aria-hidden="true"
						></div>
					</div>
				</div>
			</div>
		</div>
	</Container>
</section>
