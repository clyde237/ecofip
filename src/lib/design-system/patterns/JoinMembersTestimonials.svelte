<script lang="ts">
	import { onMount } from 'svelte';
	import Container from '../components/Container.svelte';
	import { Quote, Flame, HeartHandshake, Truck } from '@lucide/svelte';

	let { class: customClass = '' }: { class?: string } = $props();

	let sectionEl: HTMLElement | null = $state(null);
	let isVisible = $state(false);

	const testimonials = [
		{
			id: 1,
			author: 'Pasteur Jean-Paul',
			team: 'Équipe Évangélisation',
			quote:
				'Servir avec ECOFIP a transformé ma vie et mon ministère. Voir des âmes sauvées chaque jour est la plus grande récompense.',
			icon: Flame,
			accentColor: 'text-amber-500 bg-amber-50 border-amber-200/60'
		},
		{
			id: 2,
			author: 'Sœur Grace',
			team: 'Équipe Intercession',
			quote:
				'La prière est notre arme. J’ai vu Dieu opérer des miracles en réponse à nos intercessions pour les croisades.',
			icon: HeartHandshake,
			accentColor: 'text-brand-primary bg-brand-subtle border-brand-primary/20'
		},
		{
			id: 3,
			author: 'Frère David',
			team: 'Équipe Logistique',
			quote:
				'Même dans les tâches pratiques, je sens l’onction de Dieu. Chaque mission est une aventure de foi.',
			icon: Truck,
			accentColor: 'text-emerald-600 bg-emerald-50 border-emerald-200/60'
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
	class="border-t border-gray-100 bg-[#fafaf8] py-16 sm:py-20 lg:py-24 {customClass}"
	aria-labelledby="members-testimonials-title"
>
	<Container>
		<!-- Header -->
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
					ILS SERVENT LE SEIGNEUR AVEC NOUS
				</span>
				<span class="h-0.5 w-6 rounded-full bg-brand-primary" aria-hidden="true"></span>
			</div>

			<h2
				id="members-testimonials-title"
				class="font-display text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl"
			>
				Témoignages de membres
			</h2>

			<p class="mt-4 font-body text-base text-text-secondary sm:text-lg">
				Ceux qui servent témoignent de la bénédiction reçue.
			</p>
		</div>

		<!-- Grille des 3 témoignages -->
		<div class="mt-12 grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-3">
			{#each testimonials as item, index}
				{@const IconComponent = item.icon}
				<article
					class="relative flex flex-col justify-between rounded-3xl border border-gray-200/80 bg-white p-7 shadow-xs transition-all duration-700 ease-out hover:-translate-y-1 hover:shadow-lg sm:p-8 {isVisible
						? 'translate-y-0 opacity-100'
						: 'translate-y-8 opacity-0'}"
					style="transition-delay: {index * 120 + 150}ms;"
				>
					<div>
						<!-- Top icon & quote symbol -->
						<div class="flex items-center justify-between border-b border-gray-100 pb-5">
							<div
								class="flex h-11 w-11 items-center justify-center rounded-2xl border {item.accentColor}"
							>
								<IconComponent size={20} />
							</div>
							<Quote size={28} class="text-gray-200" />
						</div>

						<!-- Quote text -->
						<blockquote
							class="mt-6 font-body text-sm leading-relaxed text-text-secondary italic sm:text-base"
						>
							« {item.quote} »
						</blockquote>
					</div>

					<!-- Author info -->
					<div class="mt-8 border-t border-gray-100 pt-5">
						<div class="font-display text-base font-bold text-text-primary">
							{item.author}
						</div>
						<div class="mt-0.5 font-body text-xs font-semibold text-brand-primary">
							{item.team}
						</div>
					</div>
				</article>
			{/each}
		</div>
	</Container>
</section>
