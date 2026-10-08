<script lang="ts">
	import Seo from '$lib/design-system/components/Seo.svelte';
	import { page } from '$app/state';
	import { replaceState } from '$app/navigation';
	import { Video } from '@lucide/svelte';
	import PageBanner from '$lib/design-system/patterns/PageBanner.svelte';
	import Container from '$lib/design-system/components/Container.svelte';
	import SermonCard from '$lib/design-system/components/SermonCard.svelte';
	import SermonFeed from '$lib/design-system/components/SermonFeed.svelte';
	import type { PublicSermon } from '$lib/design-system/types.js';
	import type { PageData } from './$types.js';

	let { data }: { data: PageData } = $props();

	// Séries présentes, dans l'ordre d'apparition (prédications les plus récentes d'abord)
	let seriesList = $derived(
		data.sermons
			.filter(
				(sermon, index) =>
					sermon.seriesSlug &&
					data.sermons.findIndex((other) => other.seriesSlug === sermon.seriesSlug) === index
			)
			.map((sermon) => ({ slug: sermon.seriesSlug, label: sermon.series }))
	);
	let activeSeries = $state('');
	let visible = $derived(
		activeSeries ? data.sermons.filter((s) => s.seriesSlug === activeSeries) : data.sermons
	);

	let isFeedOpen = $state(false);
	let feedStart = $state(0);

	function openFeed(index: number) {
		feedStart = index;
		isFeedOpen = true;
	}

	// L'adresse suit la prédication à l'écran : un lien copié dans la barre d'adresse est partageable
	function syncUrl(sermon: PublicSermon | null) {
		const target = sermon ? sermon.href : '/predications';
		if (page.url.pathname !== target) replaceState(target, {});
	}
</script>

<Seo
	title="Prédications en vidéo — Messages de foi | ECOFIP"
	description="Prédications courtes en vidéo d’ECOFIP : des messages de foi, d’encouragement et d’enseignement biblique à regarder et à partager."
	breadcrumbs={[{ name: 'Prédications', path: '/predications' }]}
/>

<PageBanner
	title="Prédications"
	subtitle="Des messages courts pour nourrir votre foi, à regarder et à partager."
	backgroundImage="/about-worship-hd.jpg"
/>

<section class="bg-[#f8fafc] py-12 sm:py-16" aria-label="Prédications vidéo">
	<Container>
		{#if !data.available}
			<p
				class="mx-auto max-w-xl rounded-3xl border border-gray-200 bg-white p-10 text-center font-body text-sm text-text-secondary"
			>
				Les prédications sont momentanément indisponibles. Merci de réessayer dans quelques
				instants.
			</p>
		{:else if data.sermons.length === 0}
			<div class="mx-auto max-w-xl rounded-3xl border border-gray-200 bg-white p-10 text-center">
				<Video size={36} class="mx-auto mb-3 text-gray-300" />
				<p class="font-body text-sm text-text-secondary">
					Les premières prédications seront bientôt en ligne.
				</p>
			</div>
		{:else}
			{#if seriesList.length > 0}
				<div
					class="-mx-4 mb-8 flex gap-2 overflow-x-auto px-4 pb-1 sm:flex-wrap sm:justify-center"
					role="group"
					aria-label="Séries"
				>
					<button
						type="button"
						aria-pressed={!activeSeries}
						onclick={() => (activeSeries = '')}
						class="shrink-0 cursor-pointer rounded-xl px-4 py-2 font-body text-sm font-bold {!activeSeries
							? 'bg-brand-primary text-white'
							: 'border border-gray-200 bg-white text-text-secondary hover:text-text-primary'}"
					>
						Toutes
					</button>
					{#each seriesList as series (series.slug)}
						<button
							type="button"
							aria-pressed={activeSeries === series.slug}
							onclick={() => (activeSeries = series.slug)}
							class="shrink-0 cursor-pointer rounded-xl px-4 py-2 font-body text-sm font-bold {activeSeries ===
							series.slug
								? 'bg-brand-primary text-white'
								: 'border border-gray-200 bg-white text-text-secondary hover:text-text-primary'}"
						>
							{series.label}
						</button>
					{/each}
				</div>
			{/if}

			<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
				{#each visible as sermon, index (sermon.id)}
					<SermonCard {sermon} onSelect={() => openFeed(index)} />
				{/each}
			</div>
		{/if}
	</Container>
</section>

<SermonFeed
	sermons={visible}
	startIndex={feedStart}
	bind:open={isFeedOpen}
	onActiveChange={syncUrl}
/>
