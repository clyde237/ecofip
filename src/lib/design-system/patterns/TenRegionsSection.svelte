<script lang="ts">
	import Container from '../components/Container.svelte';
	import { MapPin, Sparkles, ArrowRight } from '@lucide/svelte';

	let {
		title = '10 régions, 1 message',
		subtitle = 'Chaque année, nous visitons les 10 régions du Cameroun pour annoncer l’Évangile.',
		class: customClass = ''
	}: {
		title?: string;
		subtitle?: string;
		class?: string;
	} = $props();

	const regions = [
		{ name: 'Adamaoua', chefLieu: 'Ngaoundéré', tag: 'Savane & Mission' },
		{ name: 'Centre', chefLieu: 'Yaoundé', tag: 'Capitale & Réveil' },
		{ name: 'Est', chefLieu: 'Bertoua', tag: 'Forêt & Évangélisation' },
		{ name: 'Extrême-Nord', chefLieu: 'Maroua', tag: 'Sahel & Compassion' },
		{ name: 'Littoral', chefLieu: 'Douala', tag: 'Port & Impact Massif' },
		{ name: 'Nord', chefLieu: 'Garoua', tag: 'Nord-Cameroun en Feu' },
		{ name: 'Nord-Ouest', chefLieu: 'Bamenda', tag: 'Hauts Plateaux & Paix' },
		{ name: 'Ouest', chefLieu: 'Bafoussam', tag: 'Foyer Spirituel ECOFIP' },
		{ name: 'Sud', chefLieu: 'Ebolowa / Kribi', tag: 'Côte & Guérisons' },
		{ name: 'Sud-Ouest', chefLieu: 'Buea / Limbe', tag: 'Mont Cameroun & Grâce' }
	];
</script>

<section class="border-y border-gray-100 bg-[#f8fafc] py-16 sm:py-20 lg:py-24 {customClass}">
	<Container>
		<div class="mx-auto mb-12 max-w-3xl text-center sm:mb-16">
			<div
				class="mb-3 inline-flex items-center gap-2 rounded-full bg-brand-subtle px-3.5 py-1 text-xs font-bold tracking-wider text-brand-primary uppercase"
			>
				<Sparkles size={14} />
				<span>Mission Nationale Cameroun</span>
			</div>
			<h2 class="font-display text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
				{title}
			</h2>
			<p class="mt-3 text-base leading-relaxed text-text-secondary sm:text-lg">
				{subtitle}
			</p>
		</div>

		<!-- Grille des 10 régions -->
		<div class="grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-4 md:grid-cols-5">
			{#each regions as r, index (r.name)}
				<div
					class="group relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-4 shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:border-brand-primary/40 hover:shadow-md sm:p-5"
				>
					<div class="mb-2 flex items-center justify-between">
						<span
							class="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-subtle text-xs font-bold text-brand-primary transition-colors group-hover:bg-brand-primary group-hover:text-white"
						>
							{String(index + 1).padStart(2, '0')}
						</span>
						<MapPin
							size={16}
							class="text-gray-300 transition-colors group-hover:text-brand-primary"
						/>
					</div>
					<h3
						class="font-display text-base font-bold text-text-primary transition-colors group-hover:text-brand-primary sm:text-lg"
					>
						{r.name}
					</h3>
					<p class="mt-1 text-xs text-text-secondary">
						{r.chefLieu}
					</p>
					<div class="mt-3 border-t border-gray-100 pt-2">
						<span class="text-[10px] font-semibold tracking-wider text-brand-primary uppercase">
							{r.tag}
						</span>
					</div>
				</div>
			{/each}
		</div>

		<div class="mt-10 text-center">
			<a
				href="/projets-missions"
				class="inline-flex items-center gap-2 text-sm font-bold text-brand-primary hover:text-brand-primary-hover hover:underline"
			>
				<span>Découvrir la carte interactive et l’itinéraire des missions</span>
				<ArrowRight size={16} />
			</a>
		</div>
	</Container>
</section>
