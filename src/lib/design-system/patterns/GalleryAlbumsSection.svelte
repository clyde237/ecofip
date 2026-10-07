<script lang="ts">
	import Container from '../components/Container.svelte';
	import { Images, Image as ImageIcon, Video, MapPin, Calendar, ArrowRight } from '@lucide/svelte';
	import type { GalleryAlbumCard } from '../types.js';

	interface Props {
		albums: GalleryAlbumCard[];
		class?: string;
	}

	let { albums, class: customClass = '' }: Props = $props();

	// Filtres construits à partir des albums : « Tout », chaque catégorie, puis chaque année
	type FilterTab = { id: string; label: string; matches: (album: GalleryAlbumCard) => boolean };

	let filterTabs = $derived.by((): FilterTab[] => {
		const categories = albums.filter(
			(album, index) =>
				albums.findIndex((other) => other.categorySlug === album.categorySlug) === index
		);
		const years = Array.from(
			new Set(albums.map((album) => album.year).filter((year): year is string => Boolean(year)))
		).sort((a, b) => b.localeCompare(a));

		return [
			{ id: 'all', label: 'Tout', matches: () => true },
			...categories.map(({ categorySlug, category }) => ({
				id: `category:${categorySlug}`,
				label: category,
				matches: (album: GalleryAlbumCard) => album.categorySlug === categorySlug
			})),
			...years.map((year) => ({
				id: `year:${year}`,
				label: year,
				matches: (album: GalleryAlbumCard) => album.year === year
			}))
		];
	});

	let activeFilter = $state('all');
	let activeTab = $derived(filterTabs.find((tab) => tab.id === activeFilter) ?? filterTabs[0]);
	let visibleAlbums = $derived(albums.filter((album) => activeTab.matches(album)));

	function countLabel(album: GalleryAlbumCard): string {
		const parts = [];
		if (album.photoCount > 0)
			parts.push(`${album.photoCount} photo${album.photoCount > 1 ? 's' : ''}`);
		if (album.videoCount > 0)
			parts.push(`${album.videoCount} vidéo${album.videoCount > 1 ? 's' : ''}`);
		return parts.join(' · ');
	}
</script>

<section
	id="albums"
	class="bg-[#f8fafc] py-16 sm:py-20 lg:py-28 {customClass}"
	aria-labelledby="gallery-albums-heading"
>
	<Container>
		<div class="mb-8 flex flex-col items-center gap-6">
			<h2
				id="gallery-albums-heading"
				class="font-display text-2xl font-extrabold tracking-tight text-text-primary sm:text-3xl"
			>
				Nos albums
			</h2>
			{#if filterTabs.length > 1}
				<div
					class="inline-flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-gray-200/80 bg-white p-2 shadow-xs"
				>
					{#each filterTabs as tab (tab.id)}
						<button
							type="button"
							aria-pressed={activeFilter === tab.id}
							onclick={() => (activeFilter = tab.id)}
							class="cursor-pointer rounded-xl px-4 py-2 font-body text-xs font-bold transition-all sm:text-sm {activeFilter ===
							tab.id
								? 'bg-brand-primary text-white shadow-xs'
								: 'text-text-secondary hover:bg-gray-100 hover:text-text-primary'}"
						>
							{tab.label}
						</button>
					{/each}
				</div>
			{/if}
		</div>

		{#if albums.length === 0}
			<div class="rounded-3xl border border-gray-200 bg-white p-12 text-center">
				<Images size={36} class="mx-auto mb-3 text-gray-300" />
				<p class="font-body text-sm text-text-secondary">
					Les albums de nos missions seront bientôt disponibles.
				</p>
			</div>
		{:else}
			<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{#each visibleAlbums as album (album.slug)}
					<a
						href="/galerie/{album.slug}"
						class="group flex flex-col overflow-hidden rounded-3xl border border-gray-200/80 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-brand-primary/30 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-brand-primary"
					>
						<div class="relative aspect-4/3 w-full overflow-hidden bg-gray-100">
							<img
								src={album.coverUrl}
								alt=""
								class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
								loading="lazy"
							/>
							<div
								class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"
							></div>
							<span
								class="absolute top-3.5 left-3.5 rounded-full bg-black/60 px-3 py-1 font-body text-[11px] font-bold text-white backdrop-blur-xs"
							>
								{album.category}
							</span>
							<span
								class="absolute right-3.5 bottom-3.5 inline-flex items-center gap-1.5 rounded-lg bg-black/70 px-2.5 py-1 font-body text-xs font-bold text-white"
							>
								{#if album.photoCount > 0}<ImageIcon size={13} />{:else}<Video size={13} />{/if}
								{countLabel(album)}
							</span>
						</div>
						<div class="flex flex-1 flex-col p-5">
							<h3
								class="font-display text-lg font-bold text-text-primary transition-colors group-hover:text-brand-primary"
							>
								{album.title}
							</h3>
							<div
								class="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 font-body text-xs text-text-secondary"
							>
								{#if album.location}
									<span class="flex items-center gap-1">
										<MapPin size={13} class="text-brand-accent" />{album.location}
									</span>
								{/if}
								{#if album.dateLabel}
									<span class="flex items-center gap-1"
										><Calendar size={13} />{album.dateLabel}</span
									>
								{/if}
							</div>
							<span
								class="mt-auto inline-flex items-center gap-1.5 pt-4 font-body text-xs font-bold text-brand-primary"
							>
								Voir l’album
								<ArrowRight size={14} class="transition-transform group-hover:translate-x-0.5" />
							</span>
						</div>
					</a>
				{/each}
			</div>
		{/if}
	</Container>
</section>
