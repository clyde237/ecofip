<script lang="ts">
	import { onMount } from 'svelte';
	import Container from '../components/Container.svelte';
	import Map from '../../Map.svelte';
	import { MapPin, ArrowUpRight } from '@lucide/svelte';
	import type { CampaignLocation } from '../types.js';

	const branchLocations: CampaignLocation[] = [
		{
			id: 'bafoussam',
			name: 'Quartier Tamja, Bafoussam',
			region: 'Bafoussam, Région de l’Ouest',
			coordinates: [5.477, 10.417],
			campaignType: 'Siège National ECOFIP',
			date: 'Bureaux ouverts du Lun au Ven',
			impact: 'Coordination générale'
		}
	];

	let { class: customClass = '' }: { class?: string } = $props();

	let sectionEl: HTMLElement | null = $state(null);
	let isVisible = $state(false);

	const socialNetworks = [
		{
			name: 'Facebook',
			url: 'https://facebook.com/ecofip',
			color: 'bg-[#1877F2]',
			textColor: 'text-white',
			iconSvg:
				'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z'
		},
		{
			name: 'Instagram',
			url: 'https://instagram.com/ecofip',
			color: 'bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045]',
			textColor: 'text-white',
			iconSvg:
				'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z'
		},
		{
			name: 'YouTube',
			url: 'https://youtube.com/@ecofip',
			color: 'bg-[#FF0000]',
			textColor: 'text-white',
			iconSvg:
				'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z'
		},
		{
			name: 'Twitter',
			url: 'https://twitter.com/ecofip',
			color: 'bg-black',
			textColor: 'text-white',
			iconSvg:
				'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z'
		}
	];

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
	id="localisation"
	bind:this={sectionEl}
	class="border-t border-gray-100 bg-white py-16 sm:py-20 lg:py-28 {customClass}"
	aria-labelledby="contact-map-heading"
>
	<Container>
		<!-- SECTION 05 — LOCALISATION -->
		<div
			class="mx-auto max-w-3xl text-center transition-all duration-700 ease-out {isVisible
				? 'translate-y-0 opacity-100'
				: 'translate-y-8 opacity-0'}"
		>
			<div class="mb-3 inline-flex items-center gap-2">
				<span class="h-0.5 w-6 rounded-full bg-brand-primary" aria-hidden="true"></span>
				<span
					class="font-body text-xs font-bold tracking-wider text-brand-primary uppercase sm:text-sm"
				>
					SIÈGE DU MINISTÈRE
				</span>
				<span class="h-0.5 w-6 rounded-full bg-brand-primary" aria-hidden="true"></span>
			</div>

			<h2
				id="contact-map-heading"
				class="font-display text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl"
			>
				Notre localisation
			</h2>

			<p class="mt-3 font-body text-base text-text-secondary sm:text-lg">
				Quartier Tamja, Bafoussam, Cameroun
			</p>
		</div>

		<!-- Carte interactive -->
		<div
			class="mt-10 overflow-hidden rounded-3xl border border-gray-200/90 shadow-md transition-all duration-700 ease-out {isVisible
				? 'translate-y-0 opacity-100'
				: 'translate-y-8 opacity-0'}"
			style="transition-delay: 100ms;"
		>
			<div class="h-[380px] w-full sm:h-[440px]">
				<Map
					locations={branchLocations}
					activeLocationId="bafoussam"
					center={[5.477, 10.417]}
					zoom={12}
				/>
			</div>
		</div>

		<!-- SECTION 06 — RÉSEAUX SOCIAUX -->
		<div class="mt-20 border-t border-gray-100 pt-16">
			<div class="mx-auto max-w-3xl text-center">
				<div class="mb-3 inline-flex items-center gap-2">
					<span class="h-0.5 w-6 rounded-full bg-brand-primary" aria-hidden="true"></span>
					<span
						class="font-body text-xs font-bold tracking-wider text-brand-primary uppercase sm:text-sm"
					>
						COMMUNAUTÉ
					</span>
					<span class="h-0.5 w-6 rounded-full bg-brand-primary" aria-hidden="true"></span>
				</div>

				<h3 class="font-display text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
					Suivez-nous sur les réseaux
				</h3>

				<p class="mt-2 font-body text-sm text-text-secondary sm:text-base">
					Restez connectés avec nos dernières publications, directs et témoignages.
				</p>
			</div>

			<div class="mt-8 flex flex-wrap items-center justify-center gap-4">
				{#each socialNetworks as net}
					<a
						href={net.url}
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center gap-2.5 rounded-2xl {net.color} px-5 py-3 font-body text-xs font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-brand-primary sm:text-sm"
					>
						<svg class="h-4 w-4 fill-white" viewBox="0 0 24 24" aria-hidden="true">
							<path d={net.iconSvg} />
						</svg>
						<span>{net.name}</span>
						<ArrowUpRight size={14} />
					</a>
				{/each}
			</div>
		</div>
	</Container>
</section>
