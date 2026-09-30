<script lang="ts">
	import { onMount } from 'svelte';
	import Container from '../components/Container.svelte';
	import Map from '../../Map.svelte';
	import { MapPin, Phone, Clock, ArrowRight, Building } from '@lucide/svelte';
	import type { CampaignLocation } from '../types.js';

	const branchLocations: CampaignLocation[] = [
		{
			id: 'bafoussam',
			name: 'Siège National (Bafoussam)',
			region: 'Région de l’Ouest · Centre-ville',
			coordinates: [5.477, 10.417],
			campaignType: 'Direction Générale, Secrétariat & Coordination Nationale',
			date: 'Bureaux ouverts du Lun au Ven (08h30 - 17h00)',
			impact: 'Siège officiel du mouvement'
		},
		{
			id: 'yaounde',
			name: 'Antenne Centre (Yaoundé)',
			region: 'Région du Centre · Quartier Omnisports',
			coordinates: [3.848, 11.502],
			campaignType: 'Coordination Régionale & Grands Rassemblements',
			date: 'Permanence & Réunions hebdomadaires',
			impact: 'Plateforme de croisades'
		},
		{
			id: 'douala',
			name: 'Antenne Littoral (Douala)',
			region: 'Région du Littoral · Bonabéri',
			coordinates: [4.051, 9.767],
			campaignType: 'Coordination Régionale & Ateliers Disciples',
			date: 'Permanence hebdomadaire',
			impact: 'Plateforme logistique'
		},
		{
			id: 'garoua',
			name: 'Antenne Grand-Nord (Garoua)',
			region: 'Région du Nord · Garoua',
			coordinates: [9.301, 13.397],
			campaignType: 'Implantation & Distribution de Bibles',
			date: 'Permanence missionnaire',
			impact: 'Front pionnier'
		}
	];

	let {
		eyebrow = 'NOS IMPLANTATIONS',
		title = 'Retrouvez nos bureaux et antennes régionales',
		subtitle = 'Le siège national d’ECOFIP est basé à Bafoussam, avec des représentations actives dans plusieurs chefs-lieux régionaux.',
		class: customClass = ''
	}: {
		eyebrow?: string;
		title?: string;
		subtitle?: string;
		class?: string;
	} = $props();

	let selectedLocationId = $state<string>('bafoussam');

	let selectedLocation = $derived(
		branchLocations.find((loc) => loc.id === selectedLocationId) || branchLocations[0]
	);

	let mapCenter = $derived<[number, number]>(selectedLocation.coordinates);

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
			{ threshold: 0.1 }
		);

		observer.observe(sectionEl);

		return () => {
			observer.disconnect();
		};
	});
</script>

<section
	id="siege"
	bind:this={sectionEl}
	class="bg-white py-16 sm:py-20 lg:py-28 {customClass}"
	aria-labelledby="contact-map-heading"
>
	<Container>
		<!-- En-tête centré -->
		<div
			class="mx-auto max-w-3xl text-center transition-all duration-700 ease-out {isVisible
				? 'translate-y-0 opacity-100'
				: 'translate-y-8 opacity-0'}"
		>
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

			<h2
				id="contact-map-heading"
				class="font-display text-3xl leading-[1.2] font-extrabold tracking-tight text-text-primary sm:text-4xl lg:text-[42px]"
			>
				{title}
			</h2>

			{#if subtitle}
				<p class="mt-4 font-body text-sm leading-relaxed text-text-secondary sm:text-base">
					{subtitle}
				</p>
			{/if}
		</div>

		<div class="mt-12 grid grid-cols-1 items-start gap-8 sm:mt-16 lg:grid-cols-12 lg:gap-10">
			<!-- Colonne Gauche : Liste des représentations (5 cols) -->
			<div
				class="space-y-4 transition-all duration-700 ease-out lg:col-span-5 {isVisible
					? 'translate-y-0 opacity-100'
					: 'translate-y-8 opacity-0'}"
				style="transition-delay: 100ms;"
			>
				{#each branchLocations as branch (branch.id)}
					{@const isSelected = selectedLocationId === branch.id}
					<button
						type="button"
						onclick={() => (selectedLocationId = branch.id)}
						class="w-full cursor-pointer rounded-2xl border p-5 text-left transition-all duration-200 {isSelected
							? 'border-brand-primary bg-brand-subtle/40 shadow-sm'
							: 'border-gray-200/80 bg-[#f8fafc] hover:border-gray-300 hover:bg-white'}"
					>
						<div class="flex items-center justify-between">
							<span
								class="font-display text-base font-bold text-text-primary sm:text-lg {isSelected
									? 'text-brand-primary'
									: ''}"
							>
								{branch.name}
							</span>
							{#if isSelected}
								<span class="flex h-2.5 w-2.5 rounded-full bg-brand-primary"></span>
							{/if}
						</div>

						<p class="mt-1.5 font-body text-xs text-text-secondary">
							{branch.region}
						</p>

						<div
							class="mt-3 flex items-center gap-2 font-body text-xs font-semibold text-brand-primary"
						>
							<MapPin size={14} class="shrink-0" />
							<span>{branch.campaignType}</span>
						</div>
					</button>
				{/each}
			</div>

			<!-- Colonne Droite : Carte Interactive Leaflet (7 cols) -->
			<div
				class="overflow-hidden rounded-3xl border border-gray-200 shadow-lg transition-all duration-700 ease-out lg:col-span-7 {isVisible
					? 'translate-y-0 opacity-100'
					: 'translate-y-8 opacity-0'}"
				style="transition-delay: 150ms;"
			>
				<div class="h-[420px] w-full sm:h-[480px]">
					<Map
						locations={branchLocations}
						activeLocationId={selectedLocationId}
						center={mapCenter}
						zoom={7}
					/>
				</div>
			</div>
		</div>
	</Container>
</section>
