<script lang="ts">
	import { onMount } from 'svelte';
	import Container from '../components/Container.svelte';
	import { Calendar, MapPin, Sparkles, Flame, HeartHandshake, UserCheck } from '@lucide/svelte';

	let { class: customClass = '' }: { class?: string } = $props();

	let sectionEl: HTMLElement | null = $state(null);
	let isVisible = $state(false);

	const testimonies = [
		{
			id: 1,
			city: 'Kribi',
			year: '2023',
			title: 'Conversion miraculeuse à Kribi',
			story:
				'Jean-Pierre, ancien sorcier, a rencontré Christ et brûlé ses fétiches devant toute la foule.',
			icon: Flame,
			badgeColor: 'bg-amber-100 text-amber-800 border-amber-200'
		},
		{
			id: 2,
			city: 'Edéa',
			year: '2023',
			title: 'Guérison d’une paralysie de 12 ans',
			story:
				'Marie a retrouvé l’usage de ses jambes après la prière de foi lors de la croisade d’Edéa.',
			icon: Sparkles,
			badgeColor: 'bg-brand-subtle text-brand-primary border-brand-primary/20'
		},
		{
			id: 3,
			city: 'Touboro',
			year: '2024',
			title: 'Un pasteur renouvelé dans son ministère',
			story:
				'Le Pasteur Samuel a reçu une nouvelle vision pour son église après notre séminaire à Touboro.',
			icon: UserCheck,
			badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200'
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
	id="temoignages-marquants"
	bind:this={sectionEl}
	class="border-t border-gray-100 bg-white py-16 sm:py-20 lg:py-24 {customClass}"
	aria-labelledby="marking-testimonies-heading"
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
					PUISSANCE DE DIEU EN ACTION
				</span>
				<span class="h-0.5 w-6 rounded-full bg-brand-primary" aria-hidden="true"></span>
			</div>

			<h2
				id="marking-testimonies-heading"
				class="font-display text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl"
			>
				Témoignages marquants
			</h2>

			<p class="mt-4 font-body text-base text-text-secondary sm:text-lg">
				Des vies transformées par la puissance de l'Évangile.
			</p>
		</div>

		<!-- Grille des 3 témoignages -->
		<div class="mt-12 grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-3">
			{#each testimonies as item, index}
				{@const IconComponent = item.icon}
				<article
					class="relative flex flex-col justify-between rounded-3xl border border-gray-200/80 bg-[#f8fafc] p-7 shadow-xs transition-all duration-500 hover:-translate-y-1 hover:shadow-lg sm:p-8 {isVisible
						? 'translate-y-0 opacity-100'
						: 'translate-y-8 opacity-0'}"
					style="transition-delay: {index * 120 + 150}ms;"
				>
					<div>
						<!-- Badges Ville & Année -->
						<div class="flex items-center justify-between gap-2 border-b border-gray-200/70 pb-5">
							<span
								class="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-body text-xs font-bold {item.badgeColor}"
							>
								<MapPin size={13} />
								<span>{item.city}</span>
							</span>
							<span
								class="text-text-muted inline-flex items-center gap-1 font-body text-xs font-semibold"
							>
								<Calendar size={13} />
								<span>{item.year}</span>
							</span>
						</div>

						<!-- Titre & Récit -->
						<h3 class="mt-5 font-display text-xl font-bold tracking-tight text-text-primary">
							{item.title}
						</h3>

						<p class="mt-3 font-body text-sm leading-relaxed text-text-secondary sm:text-base">
							{item.story}
						</p>
					</div>

					<div
						class="mt-6 flex items-center gap-2 border-t border-gray-200/60 pt-4 text-xs font-semibold text-brand-primary"
					>
						<IconComponent size={16} />
						<span>Gloire à Jésus-Christ</span>
					</div>
				</article>
			{/each}
		</div>

		<!-- Action Lire la liste des témoignages -->
		<div class="mt-12 text-center">
			<a
				href="/projets-missions#temoignages"
				class="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-6 py-3.5 font-body text-sm font-bold text-white shadow-md transition-all hover:bg-brand-primary-hover hover:shadow-lg focus-visible:outline-2 focus-visible:outline-brand-primary"
			>
				<span>Lire la liste des témoignages</span>
			</a>
		</div>
	</Container>
</section>
