<script lang="ts">
	import { onMount } from 'svelte';
	import Container from '../components/Container.svelte';
	import Map from '../../Map.svelte';
	import { ArrowRight, MapPin } from '@lucide/svelte';
	import type { CampaignLocation, MapSectionProps } from '../types.js';

	const defaultLocations: CampaignLocation[] = [
		{
			id: 'douala',
			name: 'Douala',
			region: 'Région du Littoral',
			coordinates: [4.051, 9.767],
			campaignType: 'Grande Croisade & Réveil Spirituel',
			date: 'Campagne annuelle',
			impact: '+20 000 participants'
		},
		{
			id: 'yaounde',
			name: 'Yaoundé',
			region: 'Région du Centre',
			coordinates: [3.848, 11.502],
			campaignType: 'Siège National & Rassemblements',
			date: 'Missions permanentes',
			impact: '+25 000 personnes touchées'
		},
		{
			id: 'bafoussam',
			name: 'Bafoussam',
			region: 'Région de l’Ouest',
			coordinates: [5.477, 10.417],
			campaignType: 'Mission d’Évangélisation & Action Sociale',
			date: 'Croisade régionale',
			impact: '+8 000 participants'
		},
		{
			id: 'garoua',
			name: 'Garoua',
			region: 'Région du Nord',
			coordinates: [9.301, 13.397],
			campaignType: 'Implantation & Formation de Disciples',
			date: 'Mission Nord-Cameroun',
			impact: '+6 500 personnes touchées'
		},
		{
			id: 'maroua',
			name: 'Maroua',
			region: 'Région de l’Extrême-Nord',
			coordinates: [10.597, 14.315],
			campaignType: 'Secours Humanitaire & Prédication',
			date: 'Missions frontalières',
			impact: '+7 200 familles secourues'
		}
	];

	let {
		eyebrow = 'NOTRE PRÉSENCE AU CAMEROUN',
		title = 'Un mouvement présent dans plusieurs régions',
		description = 'Découvrez les localités touchées par nos campagnes, nos actions sociales et nos missions.',
		ctaLabel = 'Voir les localisations',
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

				<!-- Sélecteur rapide des 5 villes pour zoomer sur la carte -->
				<div class="mt-6 flex flex-wrap gap-2">
					{#each locations as loc (loc.id)}
						{@const isSelected = activeCityId === loc.id}
						<button
							type="button"
							onclick={() => handleCityClick(loc)}
							class="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all duration-150 {isSelected
								? 'border-brand-primary bg-brand-primary text-white shadow-xs'
								: 'border-gray-200 bg-surface text-text-primary hover:border-brand-primary/50 hover:bg-white'}"
						>
							<MapPin size={12} class={isSelected ? 'text-white' : 'text-brand-primary'} />
							<span>{loc.name}</span>
						</button>
					{/each}
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
