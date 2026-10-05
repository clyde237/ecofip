<script lang="ts">
	import { onMount } from 'svelte';
	import Container from '../components/Container.svelte';
	import { MapPin, ArrowRight, Image as ImageIcon } from '@lucide/svelte';

	let { class: customClass = '' }: { class?: string } = $props();

	let sectionEl: HTMLElement | null = $state(null);
	let isVisible = $state(false);

	const galleries = [
		{
			id: 'kribi',
			city: 'Kribi',
			region: 'Sud',
			image: '/event-croisade.jpg',
			badge: 'Croisade 2023'
		},
		{
			id: 'edea',
			city: 'Edéa',
			region: 'Littoral',
			image: '/about-mission.jpg',
			badge: 'Croisade 2023'
		},
		{
			id: 'touboro',
			city: 'Touboro',
			region: 'Nord',
			image: '/about-worship-hd.jpg',
			badge: 'Croisade 2024'
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
	bind:this={sectionEl}
	class="border-t border-gray-100 bg-[#f8fafc] py-16 sm:py-20 lg:py-24 {customClass}"
	aria-labelledby="previous-crusades-heading"
>
	<Container>
		<div class="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
			<!-- Header -->
			<div
				class="max-w-2xl transition-all duration-700 ease-out {isVisible
					? 'translate-y-0 opacity-100'
					: 'translate-y-8 opacity-0'}"
			>
				<div class="mb-3 flex items-center gap-2.5">
					<span class="h-0.5 w-6 rounded-full bg-brand-primary" aria-hidden="true"></span>
					<span
						class="font-body text-xs font-bold tracking-wider text-brand-primary uppercase sm:text-sm"
					>
						ARCHIVES VISUELLES
					</span>
				</div>

				<h2
					id="previous-crusades-heading"
					class="font-display text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl"
				>
					Galeries des croisades précédentes
				</h2>

				<p class="mt-3 font-body text-base text-text-secondary">
					Revivez les moments forts de nos missions à travers le Cameroun.
				</p>
			</div>

			<!-- Action Voir toute la galerie -->
			<div
				class="transition-all duration-700 ease-out {isVisible
					? 'translate-y-0 opacity-100'
					: 'translate-y-8 opacity-0'}"
				style="transition-delay: 100ms;"
			>
				<a
					href="/galerie"
					class="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 font-body text-sm font-bold text-brand-primary shadow-xs transition-all hover:border-brand-primary/40 hover:bg-brand-subtle focus-visible:outline-2 focus-visible:outline-brand-primary"
				>
					<ImageIcon size={18} />
					<span>Voir toute la galerie</span>
					<ArrowRight size={16} />
				</a>
			</div>
		</div>

		<!-- Grille des 3 villes -->
		<div class="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{#each galleries as item, index}
				<a
					href="/galerie"
					class="group relative overflow-hidden rounded-3xl border border-gray-200/80 bg-white shadow-xs transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl {isVisible
						? 'translate-y-0 opacity-100'
						: 'translate-y-8 opacity-0'}"
					style="transition-delay: {index * 120 + 150}ms;"
				>
					<div class="relative aspect-4/3 w-full overflow-hidden bg-gray-100">
						<img
							src={item.image}
							alt="{item.city} — {item.region}"
							class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-108"
							loading="lazy"
						/>
						<div
							class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent"
						></div>

						<div class="absolute top-4 left-4">
							<span
								class="rounded-full bg-brand-primary px-3 py-1 font-body text-xs font-bold text-white shadow-xs"
							>
								{item.badge}
							</span>
						</div>

						<div class="absolute right-4 bottom-4 left-4 text-white">
							<div
								class="flex items-center gap-1.5 font-body text-xs text-brand-accent drop-shadow-xs"
							>
								<MapPin size={14} />
								<span class="font-semibold">{item.region}</span>
							</div>
							<h3
								class="mt-1 font-display text-2xl font-bold tracking-tight text-white drop-shadow-sm"
							>
								{item.city}
							</h3>
						</div>
					</div>
				</a>
			{/each}
		</div>
	</Container>
</section>
