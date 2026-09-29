<script lang="ts">
	import { onMount } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import 'leaflet/dist/leaflet.css';
	import type { CampaignLocation } from './design-system/types.js';

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
		locations = defaultLocations,
		activeLocationId = null,
		center = [7.2, 12.8],
		zoom = 6,
		class: customClass = '',
		onSelectLocation
	}: {
		locations?: CampaignLocation[];
		activeLocationId?: string | null;
		center?: [number, number];
		zoom?: number;
		class?: string;
		onSelectLocation?: (location: CampaignLocation) => void;
	} = $props();

	let mapElement: HTMLDivElement | null = $state(null);
	let map: import('leaflet').Map | null = null;
	const markersMap = new SvelteMap<string, import('leaflet').Marker>();

	export function focusCity(locId: string) {
		const target = locations.find((l) => l.id === locId);
		if (!target || !map) return;
		map.flyTo(target.coordinates, 8, { duration: 1.2 });
		const marker = markersMap.get(locId);
		if (marker) {
			marker.openPopup();
		}
	}

	export function fitAll() {
		if (!map || locations.length === 0) return;
		const bounds = locations.map((l) => l.coordinates);
		map.fitBounds(bounds, { padding: [50, 50], maxZoom: 8 });
	}

	onMount(() => {
		let isDestroyed = false;

		async function initMap() {
			if (!mapElement) return;

			// Import dynamique côté client de Leaflet pour éviter tout problème avec le SSR de SvelteKit
			const L = await import('leaflet');
			if (isDestroyed || !mapElement) return;

			// Initialisation de la carte avec vue centrée sur le Cameroun
			map = L.map(mapElement, {
				center,
				zoom,
				minZoom: 5,
				maxZoom: 14,
				scrollWheelZoom: false, // Évite d'intercepter le scroll de page accidentellement
				attributionControl: true
			});

			// Tuiles OpenStreetMap officielles recommandées par la documentation Leaflet (100% gratuites, sans clé API requise)
			L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
				maxZoom: 19,
				attribution:
					'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'
			}).addTo(map);

			// Création d'icônes HTML personnalisées (épingle rouge + étiquette blanche de la ville)
			locations.forEach((loc) => {
				const customHtml = `
					<div class="leaflet-custom-pin">
						<div class="marker-pill">${loc.name}</div>
						<div class="marker-teardrop">
							<div class="marker-inner-dot"></div>
						</div>
					</div>
				`;

				const customIcon = L.divIcon({
					html: customHtml,
					className: 'custom-leaflet-marker-container',
					iconSize: [80, 50],
					iconAnchor: [40, 48],
					popupAnchor: [0, -50]
				});

				const popupContent = `
					<div class="map-popup-card">
						<span class="popup-region">${loc.region}</span>
						<h4 class="popup-title">${loc.name}</h4>
						<p class="popup-campaign">${loc.campaignType}</p>
						<div class="popup-meta">
							<span>📅 ${loc.date}</span>
							<span>🎯 ${loc.impact}</span>
						</div>
					</div>
				`;

				const marker = L.marker(loc.coordinates, { icon: customIcon })
					.addTo(map!)
					.bindPopup(popupContent, {
						className: 'custom-leaflet-popup',
						maxWidth: 260
					});

				marker.on('click', () => {
					onSelectLocation?.(loc);
				});

				markersMap.set(loc.id, marker);
			});

			// Si une localisation est présélectionnée
			if (activeLocationId) {
				focusCity(activeLocationId);
			} else {
				// Ajustement fluide pour englober tous les marqueurs
				const bounds = locations.map((l) => l.coordinates);
				map.fitBounds(bounds, { padding: [40, 40], maxZoom: 7 });
			}
		}

		void initMap();

		return () => {
			isDestroyed = true;
			map?.remove();
			map = null;
			markersMap.clear();
		};
	});
</script>

<div class="relative h-full w-full {customClass}">
	<div
		bind:this={mapElement}
		class="h-full min-h-[380px] w-full sm:min-h-[440px] lg:min-h-[500px]"
	></div>
</div>

<style>
	/* Style personnalisé des marqueurs Leaflet */
	:global(.custom-leaflet-marker-container) {
		background: transparent !important;
		border: none !important;
	}

	:global(.leaflet-custom-pin) {
		display: flex;
		flex-direction: column;
		align-items: center;
		cursor: pointer;
		pointer-events: auto;
		transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
	}

	:global(.leaflet-custom-pin:hover) {
		transform: translateY(-2px) scale(1.05);
	}

	:global(.leaflet-custom-pin .marker-pill) {
		background: #ffffff;
		color: #111827;
		font-family:
			system-ui,
			-apple-system,
			BlinkMacSystemFont,
			'Segoe UI',
			Roboto,
			sans-serif;
		font-size: 11px;
		font-weight: 700;
		padding: 2px 8px;
		border-radius: 6px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		border: 1px solid rgba(0, 0, 0, 0.08);
		white-space: nowrap;
		margin-bottom: 3px;
		line-height: 1.3;
	}

	:global(.leaflet-custom-pin:hover .marker-pill) {
		color: #d90416;
		box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
	}

	:global(.leaflet-custom-pin .marker-teardrop) {
		width: 20px;
		height: 20px;
		background: #d90416;
		border: 2px solid #ffffff;
		border-radius: 50% 50% 50% 0;
		transform: rotate(-45deg);
		box-shadow: 0 4px 10px rgba(217, 4, 22, 0.45);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	:global(.leaflet-custom-pin .marker-inner-dot) {
		width: 5px;
		height: 5px;
		background: #ffffff;
		border-radius: 50%;
		transform: rotate(45deg);
	}

	/* Style de la Pop-up Leaflet */
	:global(.custom-leaflet-popup .leaflet-popup-content-wrapper) {
		border-radius: 14px;
		padding: 4px;
		box-shadow: 0 15px 35px -5px rgba(0, 0, 0, 0.2);
		border: 1px solid rgba(0, 0, 0, 0.06);
	}

	:global(.custom-leaflet-popup .leaflet-popup-content) {
		margin: 10px 14px;
		line-height: 1.4;
	}

	:global(.map-popup-card) {
		display: flex;
		flex-direction: column;
		gap: 3px;
		font-family:
			system-ui,
			-apple-system,
			BlinkMacSystemFont,
			'Segoe UI',
			Roboto,
			sans-serif;
	}

	:global(.map-popup-card .popup-region) {
		font-size: 10px;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.12em;
		color: #d90416;
	}

	:global(.map-popup-card .popup-title) {
		font-size: 16px;
		font-weight: 800;
		color: #111827;
		margin: 0;
	}

	:global(.map-popup-card .popup-campaign) {
		font-size: 12px;
		font-weight: 500;
		color: #374151;
		margin: 2px 0 0 0;
	}

	:global(.map-popup-card .popup-meta) {
		display: flex;
		flex-direction: column;
		gap: 2px;
		font-size: 11px;
		color: #6b7280;
		margin-top: 5px;
		padding-top: 5px;
		border-top: 1px solid #f3f4f6;
	}
</style>
