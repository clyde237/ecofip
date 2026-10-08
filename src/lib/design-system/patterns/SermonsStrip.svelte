<script lang="ts">
	/** Bandeau de l'accueil : dernières prédications en vignettes verticales défilant horizontalement. */
	import Container from '../components/Container.svelte';
	import SermonCard from '../components/SermonCard.svelte';
	import { ArrowRight } from '@lucide/svelte';
	import type { PublicSermon } from '../types.js';

	interface Props {
		sermons: PublicSermon[];
		class?: string;
	}

	let { sermons, class: customClass = '' }: Props = $props();
</script>

<section class="bg-white py-14 sm:py-20 {customClass}" aria-labelledby="sermons-strip-heading">
	<Container>
		<div class="flex items-end justify-between gap-4">
			<div>
				<p class="font-body text-xs font-bold tracking-widest text-brand-primary uppercase">
					Prédications
				</p>
				<h2
					id="sermons-strip-heading"
					class="mt-2 font-display text-3xl font-bold tracking-tight text-text-primary sm:text-4xl"
				>
					Dernières prédications
				</h2>
			</div>
			<a
				href="/predications"
				class="group inline-flex shrink-0 items-center gap-1.5 font-body text-sm font-bold text-brand-primary hover:underline"
			>
				Tout voir <ArrowRight size={16} class="transition-transform group-hover:translate-x-0.5" />
			</a>
		</div>
	</Container>

	<!-- Défilement horizontal, aligné sur la grille du site -->
	<div class="mx-auto mt-8 max-w-7xl">
		<ul
			class="flex snap-x snap-mandatory [scrollbar-width:thin] gap-4 overflow-x-auto px-4 pb-3 sm:px-6 lg:px-8"
		>
			{#each sermons as sermon (sermon.id)}
				<li class="w-40 shrink-0 snap-start sm:w-48">
					<SermonCard {sermon} />
				</li>
			{/each}
		</ul>
	</div>
</section>
