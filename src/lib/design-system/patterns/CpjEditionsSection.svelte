<script lang="ts">
	/** Page Projets : tableau des campagnes précédentes de « Cameroun Pour Jésus ». */
	import Container from '../components/Container.svelte';
	import { EDITIONS, formatNumber } from '$lib/data/camerounPourJesus.js';

	let { class: customClass = '' }: { class?: string } = $props();

	const years = Array.from(new Set(EDITIONS.map((edition) => edition.startDate.slice(0, 4))));
</script>

<section class="bg-white py-16 sm:py-20 lg:py-24 {customClass}" aria-labelledby="cpj-editions">
	<Container>
		<div class="max-w-3xl">
			<p class="font-body text-xs font-bold tracking-widest text-brand-primary uppercase">
				Les éditions précédentes
			</p>
			<h2
				id="cpj-editions"
				class="mt-3 font-display text-3xl font-bold tracking-tight text-text-primary sm:text-4xl"
			>
				{EDITIONS.length} campagnes d’évangélisation à travers le Cameroun
			</h2>
			<p class="mt-4 font-body text-base leading-relaxed text-text-secondary">
				Chaque campagne, chaque rencontre, chaque prière laisse une trace éternelle. Voici les
				personnes touchées et les témoignages de guérisons ou de délivrances recueillis à chaque
				étape.
			</p>
		</div>

		{#each years as year (year)}
			{@const editions = EDITIONS.filter((edition) => edition.startDate.startsWith(year))}
			<h3 class="mt-10 font-display text-xl font-bold text-text-primary">{year}</h3>
			<!-- Tableau sur grand écran -->
			<div class="mt-4 hidden overflow-hidden rounded-2xl border border-gray-200 md:block">
				<table class="w-full text-left font-body text-sm">
					<caption class="sr-only">Campagnes Cameroun Pour Jésus en {year}</caption>
					<thead class="bg-[#f8fafc] text-xs tracking-wider text-text-secondary uppercase">
						<tr>
							<th scope="col" class="px-5 py-3 font-bold">Ville</th>
							<th scope="col" class="px-5 py-3 font-bold">Région</th>
							<th scope="col" class="px-5 py-3 font-bold">Dates</th>
							<th scope="col" class="px-5 py-3 text-right font-bold">Personnes touchées</th>
							<th scope="col" class="px-5 py-3 text-right font-bold">Témoignages</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-100">
						{#each editions as edition (edition.startDate)}
							<tr class="hover:bg-[#f8fafc]">
								<th scope="row" class="px-5 py-3 font-bold text-text-primary">{edition.city}</th>
								<td class="px-5 py-3 text-text-secondary">{edition.region}</td>
								<td class="px-5 py-3 text-text-secondary">{edition.dates}</td>
								<td class="px-5 py-3 text-right font-semibold text-text-primary"
									>{formatNumber(edition.peopleReached)}</td
								>
								<td class="px-5 py-3 text-right font-semibold text-brand-primary"
									>{edition.testimonies}</td
								>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
			<!-- Cartes sur mobile -->
			<ul class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 md:hidden">
				{#each editions as edition (edition.startDate)}
					<li class="rounded-2xl border border-gray-200 p-4">
						<p class="font-display text-base font-bold text-text-primary">{edition.city}</p>
						<p class="font-body text-xs text-text-secondary">
							Région {edition.region} · {edition.dates}
						</p>
						<p class="mt-2 font-body text-sm text-text-primary">
							<strong>{formatNumber(edition.peopleReached)}</strong> personnes touchées ·
							<strong class="text-brand-primary">{edition.testimonies}</strong> témoignages
						</p>
					</li>
				{/each}
			</ul>
		{/each}
	</Container>
</section>
