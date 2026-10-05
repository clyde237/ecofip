<script lang="ts">
	import { onMount } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import 'leaflet/dist/leaflet.css';
	import type { CampaignLocation } from './design-system/types.js';

	const defaultLocations: CampaignLocation[] = [
		{
			id: 'bafoussam',
			name: 'Bafoussam',
			region: 'Région de l’Ouest',
			coordinates: [5.477, 10.417],
			campaignType: 'Siège National & Foyer Spirituel ECOFIP',
			date: 'Centre de coordination permanente',
			impact: 'Quartier Tamja • Mobilisation des 10 Régions',
			isFeatured: true,
			badge: 'Siège National • Ouest'
		},
		{
			id: 'yaounde',
			name: 'Yaoundé',
			region: 'Région du Centre',
			coordinates: [3.848, 11.502],
			campaignType: 'Capitale & Rassemblements Nationaux',
			date: 'Missions permanentes',
			impact: '+25 000 personnes touchées'
		},
		{
			id: 'douala',
			name: 'Douala',
			region: 'Région du Littoral',
			coordinates: [4.051, 9.767],
			campaignType: 'Grande Croisade & Réveil Évangélique',
			date: 'Campagne annuelle',
			impact: '+20 000 participants'
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
			campaignType: 'Secours Humanitaire & Compassion',
			date: 'Missions frontalières',
			impact: '+7 200 familles secourues'
		},
		{
			id: 'ngaoundere',
			name: 'Ngaoundéré',
			region: 'Région de l’Adamaoua',
			coordinates: [7.316, 13.583],
			campaignType: 'Évangélisation en Terre de Savane',
			date: 'Croisade régionale',
			impact: '+5 000 personnes touchées'
		},
		{
			id: 'bertoua',
			name: 'Bertoua',
			region: 'Région de l’Est',
			coordinates: [4.577, 13.684],
			campaignType: 'Mission Forestière & Réveil Communautaire',
			date: 'Campagnes rurales et urbaines',
			impact: '+4 800 personnes touchées'
		},
		{
			id: 'bamenda',
			name: 'Bamenda',
			region: 'Région du Nord-Ouest',
			coordinates: [5.959, 10.159],
			campaignType: 'Message de Paix, Réconciliation & Espoir',
			date: 'Missions des Hauts Plateaux',
			impact: '+6 000 personnes touchées'
		},
		{
			id: 'ebolowa',
			name: 'Ebolowa',
			region: 'Région du Sud',
			coordinates: [2.916, 11.15],
			campaignType: 'Croisades Régionales & Actions Sociales',
			date: 'Missions Sud-Cameroun',
			impact: '+5 500 participants'
		},
		{
			id: 'buea',
			name: 'Buea',
			region: 'Région du Sud-Ouest',
			coordinates: [4.155, 9.243],
			campaignType: 'Campus Universitaire & Réveil Jeunesse',
			date: 'Missions Mont Cameroun',
			impact: '+8 500 jeunes et familles'
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

			// Création d'icônes HTML personnalisées (épingles des 10 régions & effet infini sur Bafoussam)
			locations.forEach((loc) => {
				const isSpecial = Boolean(loc.isFeatured || loc.id === 'bafoussam');

				const customHtml = isSpecial
					? `
					<div class="leaflet-custom-pin is-featured-pin">
						<div class="marker-pill featured-pill">
							<span class="pill-star" aria-hidden="true">★</span>
							<span class="pill-title">${loc.name}</span>
							<span class="pill-tag"><span class="pill-infinite">∞</span> OUEST</span>
						</div>
						<div class="teardrop-anchor featured-teardrop-anchor">
							<div class="infinite-beacon-sonar sonar-1" aria-hidden="true"></div>
							<div class="infinite-beacon-sonar sonar-2" aria-hidden="true"></div>
							<div class="infinite-beacon-sonar sonar-3" aria-hidden="true"></div>
							<div class="infinite-beacon-glow" aria-hidden="true"></div>
							<div class="marker-teardrop featured-teardrop">
								<div class="marker-inner-dot featured-inner-dot">
									<span class="dot-star">★</span>
								</div>
							</div>
						</div>
					</div>
				`
					: `
					<div class="leaflet-custom-pin">
						<div class="marker-pill">${loc.name}</div>
						<div class="teardrop-anchor">
							<div class="marker-teardrop">
								<div class="marker-inner-dot"></div>
							</div>
						</div>
					</div>
				`;

				const customIcon = L.divIcon({
					html: customHtml,
					className: isSpecial
						? 'custom-leaflet-marker-container featured-marker-container'
						: 'custom-leaflet-marker-container',
					iconSize: isSpecial ? [140, 68] : [80, 52],
					iconAnchor: isSpecial ? [70, 62] : [40, 50],
					popupAnchor: isSpecial ? [0, -66] : [0, -52]
				});

				const popupContent = isSpecial
					? `
					<div class="map-popup-card featured-popup-card">
						<div class="popup-featured-header">
							<span class="popup-featured-badge">
								<span class="badge-star">★</span>
								<span>FOYER SPIRITUEL & SIÈGE NATIONAL</span>
								<span class="badge-inf">∞</span>
							</span>
						</div>
						<div class="popup-body">
							<span class="popup-region">${loc.region}</span>
							<h4 class="popup-title featured-title">${loc.name}</h4>
							<p class="popup-campaign">${loc.campaignType}</p>
							<div class="popup-meta">
								<span>📍 Quartier Tamja • Siège & Coordination Générale</span>
								<span>📅 ${loc.date}</span>
								<span>🎯 ${loc.impact}</span>
							</div>
						</div>
					</div>
				`
					: `
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

				const marker = L.marker(loc.coordinates, {
					icon: customIcon,
					zIndexOffset: isSpecial ? 2500 : 100
				})
					.addTo(map!)
					.bindPopup(popupContent, {
						className: isSpecial
							? 'custom-leaflet-popup featured-leaflet-popup'
							: 'custom-leaflet-popup',
						maxWidth: isSpecial ? 300 : 260
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
		overflow: visible !important;
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

	:global(.teardrop-anchor) {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 20px;
		height: 20px;
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

	/* --- STYLES EXCLUSIFS BAFOUSSAM (RÉGION DE L'OUEST) & EFFET EN MODE INFINI --- */
	:global(.leaflet-custom-pin.is-featured-pin) {
		filter: drop-shadow(0 4px 14px rgba(217, 4, 22, 0.4));
	}

	:global(.leaflet-custom-pin.is-featured-pin:hover) {
		transform: translateY(-3px) scale(1.08);
	}

	/* Étiquette / Pillule Bafoussam */
	:global(.marker-pill.featured-pill) {
		background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%) !important;
		color: #ffffff !important;
		border: 1.5px solid #f59e0b !important;
		box-shadow:
			0 4px 16px rgba(0, 0, 0, 0.35),
			0 0 12px rgba(245, 158, 11, 0.45) !important;
		padding: 2.5px 8px !important;
		display: inline-flex !important;
		align-items: center !important;
		gap: 4px !important;
		animation: infinite-pill-pulse 2.8s ease-in-out infinite alternate !important;
	}

	:global(.marker-pill.featured-pill .pill-star) {
		color: #fbbf24;
		font-size: 11px;
		line-height: 1;
		animation: infinite-star-rotate 6s linear infinite;
		display: inline-block;
	}

	:global(.marker-pill.featured-pill .pill-title) {
		font-weight: 800;
		letter-spacing: 0.02em;
		color: #ffffff;
	}

	:global(.marker-pill.featured-pill .pill-tag) {
		background: rgba(245, 158, 11, 0.25);
		border: 1px solid rgba(245, 158, 11, 0.6);
		color: #fbbf24;
		font-size: 8.5px;
		font-weight: 900;
		padding: 1px 4.5px;
		border-radius: 4px;
		letter-spacing: 0.06em;
		display: inline-flex;
		align-items: center;
		gap: 2px;
	}

	:global(.marker-pill.featured-pill .pill-infinite) {
		font-size: 10px;
		line-height: 1;
		font-weight: 900;
	}

	/* Ancre et ondes radar infinies de Bafoussam */
	:global(.teardrop-anchor.featured-teardrop-anchor) {
		width: 28px;
		height: 28px;
	}

	:global(.infinite-beacon-sonar) {
		position: absolute;
		top: 50%;
		left: 50%;
		width: 28px;
		height: 28px;
		margin-top: -14px;
		margin-left: -14px;
		border-radius: 50%;
		border: 2px solid #d90416;
		background: radial-gradient(
			circle,
			rgba(217, 4, 22, 0.35) 0%,
			rgba(245, 158, 11, 0.18) 50%,
			transparent 75%
		);
		pointer-events: none;
		will-change: transform, opacity;
	}

	:global(.infinite-beacon-sonar.sonar-1) {
		animation: infinite-radar-sweep 2.4s cubic-bezier(0.1, 0.4, 0.2, 1) infinite;
	}

	:global(.infinite-beacon-sonar.sonar-2) {
		animation: infinite-radar-sweep 2.4s cubic-bezier(0.1, 0.4, 0.2, 1) infinite 0.8s;
	}

	:global(.infinite-beacon-sonar.sonar-3) {
		animation: infinite-radar-sweep 2.4s cubic-bezier(0.1, 0.4, 0.2, 1) infinite 1.6s;
	}

	:global(.infinite-beacon-glow) {
		position: absolute;
		top: 50%;
		left: 50%;
		width: 38px;
		height: 38px;
		margin-top: -19px;
		margin-left: -19px;
		border-radius: 50%;
		background: radial-gradient(
			circle,
			rgba(245, 158, 11, 0.5) 0%,
			rgba(217, 4, 22, 0.3) 50%,
			transparent 75%
		);
		pointer-events: none;
		animation: infinite-halo-glow 2.4s ease-in-out infinite alternate;
	}

	/* Teardrop Bafoussam */
	:global(.marker-teardrop.featured-teardrop) {
		width: 26px !important;
		height: 26px !important;
		background: linear-gradient(135deg, #e11d48 0%, #d90416 60%, #991b1b 100%) !important;
		border: 2.5px solid #ffffff !important;
		box-shadow:
			0 0 0 2px #f59e0b,
			0 6px 18px rgba(217, 4, 22, 0.65) !important;
		animation: infinite-teardrop-pulse 2.4s ease-in-out infinite alternate !important;
	}

	:global(.marker-inner-dot.featured-inner-dot) {
		width: 10px !important;
		height: 10px !important;
		background: #fbbf24 !important;
		border: 1px solid #ffffff !important;
		color: #78350f;
		display: flex !important;
		align-items: center;
		justify-content: center;
	}

	:global(.marker-inner-dot.featured-inner-dot .dot-star) {
		font-size: 7px;
		line-height: 1;
		font-weight: 900;
	}

	/* Keyframes d'animation infinie */
	@keyframes infinite-radar-sweep {
		0% {
			transform: scale(0.6);
			opacity: 1;
			border-color: #f59e0b;
		}
		40% {
			opacity: 0.75;
			border-color: #d90416;
		}
		100% {
			transform: scale(3.5);
			opacity: 0;
			border-color: rgba(217, 4, 22, 0);
		}
	}

	@keyframes infinite-halo-glow {
		0% {
			transform: scale(0.85);
			opacity: 0.5;
		}
		100% {
			transform: scale(1.35);
			opacity: 0.95;
		}
	}

	@keyframes infinite-pill-pulse {
		0% {
			border-color: #f59e0b;
			box-shadow:
				0 4px 16px rgba(0, 0, 0, 0.35),
				0 0 10px rgba(245, 158, 11, 0.3);
		}
		100% {
			border-color: #fde047;
			box-shadow:
				0 6px 20px rgba(0, 0, 0, 0.45),
				0 0 20px rgba(245, 158, 11, 0.75);
		}
	}

	@keyframes infinite-teardrop-pulse {
		0% {
			box-shadow:
				0 0 0 2px #f59e0b,
				0 4px 12px rgba(217, 4, 22, 0.6);
		}
		100% {
			box-shadow:
				0 0 0 3px #fde047,
				0 8px 24px rgba(217, 4, 22, 0.85),
				0 0 16px rgba(245, 158, 11, 0.6);
		}
	}

	@keyframes infinite-star-rotate {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		:global(.infinite-beacon-sonar),
		:global(.infinite-beacon-glow),
		:global(.marker-teardrop.featured-teardrop),
		:global(.marker-pill.featured-pill),
		:global(.marker-pill.featured-pill .pill-star) {
			animation: none !important;
		}
	}

	/* Style de la Pop-up Leaflet */
	:global(.custom-leaflet-popup .leaflet-popup-content-wrapper) {
		border-radius: 14px;
		padding: 4px;
		box-shadow: 0 15px 35px -5px rgba(0, 0, 0, 0.2);
		border: 1px solid rgba(0, 0, 0, 0.06);
	}

	:global(.custom-leaflet-popup.featured-leaflet-popup .leaflet-popup-content-wrapper) {
		border: 1.5px solid rgba(245, 158, 11, 0.5) !important;
		box-shadow:
			0 18px 45px -5px rgba(217, 4, 22, 0.25),
			0 0 15px rgba(245, 158, 11, 0.2) !important;
	}

	:global(.popup-featured-header) {
		margin-bottom: 6px;
	}

	:global(.popup-featured-badge) {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		background: linear-gradient(135deg, #111827, #1f2937);
		color: #fbbf24;
		border: 1px solid rgba(245, 158, 11, 0.5);
		font-size: 9px;
		font-weight: 800;
		letter-spacing: 0.05em;
		padding: 2px 7px;
		border-radius: 6px;
		text-transform: uppercase;
	}

	:global(.popup-featured-badge .badge-inf) {
		font-size: 11px;
		font-weight: 900;
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

	:global(.map-popup-card.featured-popup-card .popup-title) {
		color: #b91c1c;
		font-size: 18px;
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
