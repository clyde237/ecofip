<script lang="ts">
	import { onMount } from 'svelte';
	import Container from '../components/Container.svelte';
	import Map from '../../Map.svelte';
	import { ArrowRight, MapPin } from '@lucide/svelte';
	import type { CampaignLocation, MapSectionProps } from '../types.js';
	import {
		CITY_COORDINATES,
		EDITIONS,
		FINAL_CRUSADE,
		IMPACT,
		formatNumber,
		type Edition
	} from '$lib/data/camerounPourJesus.js';

	// Parcours officiel de « Cameroun Pour Jésus » : une étape par ville (Tombel a accueilli
	// deux campagnes), et Bafoussam en vedette pour la croisade de clôture.
	function buildOfficialLocations(): CampaignLocation[] {
		const byCity: Record<string, Edition[]> = {};
		for (const edition of EDITIONS) {
			byCity[edition.city] = [...(byCity[edition.city] ?? []), edition];
		}
		const visited: CampaignLocation[] = Object.entries(byCity).map(([city, editions]) => {
			const people = editions.reduce((sum, e) => sum + e.peopleReached, 0);
			const testimonies = editions.reduce((sum, e) => sum + e.testimonies, 0);
			return {
				id: slug(city),
				name: city,
				region: `Région ${regionLabel(editions[0].region)}`,
				coordinates: CITY_COORDINATES[city],
				campaignType:
					editions.length > 1
						? `${editions.length} campagnes d’évangélisation`
						: 'Campagne d’évangélisation',
				date: editions.map((e) => e.dates).join(' et '),
				impact: `${formatNumber(people)} personnes touchées • ${testimonies} témoignages`
			};
		});
		return [
			{
				id: 'bafoussam',
				name: FINAL_CRUSADE.city,
				region: `Région ${regionLabel(FINAL_CRUSADE.region)}`,
				coordinates: CITY_COORDINATES[FINAL_CRUSADE.city],
				campaignType: `Croisade de clôture « ${FINAL_CRUSADE.name} »`,
				date: FINAL_CRUSADE.dates,
				impact: `${FINAL_CRUSADE.venue} • Siège national ECOFIP`,
				isFeatured: true
			},
			...visited
		];
	}

	function slug(value: string): string {
		return value
			.toLowerCase()
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.replace(/[^a-z0-9]+/g, '-');
	}

	/** « Ouest » → « de l’Ouest », « Sud » → « du Sud », « Extrême-Nord » → « de l’Extrême-Nord » */
	function regionLabel(region: string): string {
		return /^[AEÉIOU]/.test(region) ? `de l’${region}` : `du ${region}`;
	}

	const defaultLocations = buildOfficialLocations();

	let {
		eyebrow = 'MISSION NATIONALE — LES 10 RÉGIONS DU CAMEROUN',
		title = 'Le Cameroun parcouru',
		description = `${IMPACT.campaigns} campagnes d’évangélisation dans ${IMPACT.cities} villes et ${IMPACT.regionsVisited} des ${IMPACT.regionsTotal} régions depuis 2024, jusqu’à la croisade de clôture à Bafoussam. ECOFIP coordonne ces missions depuis son siège national de Bafoussam (Région de l’Ouest).`,
		ctaLabel = 'Afficher toute la carte',
		locations = defaultLocations,
		class: customClass = ''
	}: MapSectionProps = $props();

	let sectionEl: HTMLElement | null = $state(null);
	let isVisible = $state(false);
	let mapRef: { focusCity: (id: string) => void; fitAll: () => void } | null = $state(null);
	let activeCityId = $state<string | null>(null);

	function handleCityClick(loc: CampaignLocation) {
		activeCityId = loc.id;
		mapRef?.focusCity(loc.id);
	}

	function handleShowAll() {
		activeCityId = null;
		mapRef?.fitAll();
	}

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
	bind:this={sectionEl}
	class="bg-white py-16 sm:py-20 lg:py-24 {customClass}"
	aria-labelledby="map-section-heading"
>
	<Container>
		<!-- Carte unifiée regroupant les textes et la carte interactive Leaflet -->
		<div
			class="grid grid-cols-1 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_15px_45px_-15px_rgba(0,0,0,0.07)] transition-all duration-700 sm:rounded-3xl lg:grid-cols-12 {isVisible
				? 'translate-y-0 opacity-100'
				: 'translate-y-8 opacity-0'}"
		>
			<!-- Colonne Gauche : Présentation éditoriale & sélecteur de villes -->
			<div class="flex flex-col justify-center p-6 sm:p-10 lg:col-span-5 lg:p-12">
				{#if eyebrow}
					<span
						class="font-body text-xs font-bold tracking-[0.2em] text-brand-primary uppercase sm:text-sm"
					>
						{eyebrow}
					</span>
				{/if}

				<h2
					id="map-section-heading"
					class="mt-3 font-display text-2xl font-bold tracking-tight text-text-primary sm:text-3xl lg:text-[38px] lg:leading-[1.18]"
				>
					{title}
				</h2>

				{#if description}
					<p class="mt-4 font-body text-sm leading-relaxed text-text-secondary sm:text-base">
						{description}
					</p>
				{/if}

				<!-- Sélecteur rapide des 10 régions & villes pour zoomer sur la carte -->
				<div class="mt-6 flex flex-wrap gap-2">
					{#each locations as loc (loc.id)}
						{@const isSelected = activeCityId === loc.id}
						{@const isSpecial = loc.isFeatured || loc.id === 'bafoussam'}
						<button
							type="button"
							onclick={() => handleCityClick(loc)}
							class="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all duration-200 {isSpecial
								? isSelected
									? 'border-brand-primary bg-brand-primary text-white shadow-md ring-2 ring-brand-primary/20'
									: 'border-amber-400/90 bg-amber-50/80 font-bold text-brand-primary shadow-2xs ring-1 ring-amber-400/30 hover:border-brand-primary hover:bg-amber-100'
								: isSelected
									? 'border-brand-primary bg-brand-primary text-white shadow-xs'
									: 'border-gray-200 bg-surface text-text-primary hover:border-brand-primary/50 hover:bg-white'}"
						>
							{#if isSpecial}
								<span class="relative flex h-2 w-2">
									<span
										class="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-primary opacity-75"
									></span>
									<span class="relative inline-flex h-2 w-2 rounded-full bg-brand-primary"></span>
								</span>
								<span>★ {loc.name}</span>
								<span
									class="py-0.2 rounded bg-amber-200/80 px-1 text-[9px] font-black tracking-wider text-amber-900"
								>
									OUEST • SIÈGE
								</span>
							{:else}
								<MapPin size={12} class={isSelected ? 'text-white' : 'text-brand-primary'} />
								<span>{loc.name}</span>
							{/if}
						</button>
					{/each}
				</div>

				<!-- Légende officielle des 10 régions & Foyer de Bafoussam -->
				<div
					class="mt-6 flex flex-wrap items-center gap-4 border-t border-gray-100 pt-4 text-xs font-semibold text-text-secondary"
				>
					<div class="flex items-center gap-1.5">
						<span class="relative flex h-3 w-3 items-center justify-center">
							<span
								class="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-primary opacity-75"
							></span>
							<span
								class="relative inline-flex h-2.5 w-2.5 rounded-full bg-brand-primary ring-1 ring-amber-400"
							></span>
						</span>
						<span class="font-bold text-text-primary"
							>Foyer Spirituel & Siège (Bafoussam, Ouest)</span
						>
					</div>
					<div class="flex items-center gap-1.5">
						<span class="h-2.5 w-2.5 rounded-full bg-brand-primary"></span>
						<span>Les 10 régions du Cameroun</span>
					</div>
					<div class="flex items-center gap-1.5">
						<span class="h-2.5 w-2.5 rounded-full bg-amber-500"></span>
						<span>Missions & Croisades</span>
					</div>
				</div>

				<!-- Bouton d'action principal -->
				{#if ctaLabel}
					<div class="mt-8">
						<button
							type="button"
							onclick={handleShowAll}
							class="group inline-flex cursor-pointer items-center gap-2 rounded-xl bg-brand-primary px-6 py-3.5 text-sm font-bold text-white shadow-md transition-all duration-200 select-none hover:bg-brand-primary-hover hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-secondary active:bg-[#a6000a] sm:text-base"
						>
							<span>{ctaLabel}</span>
							<ArrowRight
								size={16}
								class="transition-transform duration-200 group-hover:translate-x-1"
								aria-hidden="true"
							/>
						</button>
					</div>
				{/if}
			</div>

			<!-- Colonne Droite : Carte Leaflet interactive -->
			<div
				class="relative min-h-[380px] bg-[#f8f9fa] sm:min-h-[440px] lg:col-span-7 lg:min-h-[520px]"
			>
				<Map
					bind:this={mapRef}
					{locations}
					activeLocationId={activeCityId}
					onSelectLocation={(loc) => (activeCityId = loc.id)}
				/>
			</div>
		</div>
	</Container>
</section>
