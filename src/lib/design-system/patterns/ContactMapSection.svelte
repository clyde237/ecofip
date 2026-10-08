<script lang="ts">
	import { onMount } from 'svelte';
	import Container from '../components/Container.svelte';
	import Map from '../../Map.svelte';
	import { ArrowUpRight } from '@lucide/svelte';
	import type { CampaignLocation } from '../types.js';
	import { SOCIAL_LINKS } from '$lib/config/social.js';

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
				{#each SOCIAL_LINKS as net (net.name)}
					<a
						href={net.url}
						target="_blank"
						rel="noopener noreferrer"
						aria-label={net.label}
						class="inline-flex items-center gap-2.5 rounded-2xl {net.color} px-5 py-3 font-body text-xs font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-brand-primary sm:text-sm"
					>
						<svg class="h-4 w-4 fill-white" viewBox="0 0 24 24" aria-hidden="true">
							<path d={net.iconPath} />
						</svg>
						<span>{net.name}</span>
						<ArrowUpRight size={14} />
					</a>
				{/each}
			</div>
		</div>
	</Container>
</section>
