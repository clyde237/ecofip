<script lang="ts">
	import { GalleryGridSection } from '$lib';
	import GalleryLightbox from '$lib/design-system/components/GalleryLightbox.svelte';
	import Container from '$lib/design-system/components/Container.svelte';
	import type { MediaItem } from '$lib/design-system/types.js';
	import {
		Home,
		ChevronRight,
		ArrowLeft,
		MapPin,
		Calendar,
		Image as ImageIcon,
		Video
	} from '@lucide/svelte';
	import type { PageData } from './$types.js';

	let { data }: { data: PageData } = $props();

	let isLightboxOpen = $state(false);
	let lightboxIndex = $state(0);
	let lightboxItems = $state<MediaItem[]>([]);

	function handleOpenLightbox(list: MediaItem[], index: number) {
		lightboxItems = list;
		lightboxIndex = Math.max(index, 0);
		isLightboxOpen = true;
	}

	let countLabel = $derived(
		[
			data.photos.length > 0
				? `${data.photos.length} photo${data.photos.length > 1 ? 's' : ''}`
				: '',
			data.videos.length > 0
				? `${data.videos.length} vidéo${data.videos.length > 1 ? 's' : ''}`
				: ''
		]
			.filter(Boolean)
			.join(' · ')
	);
</script>

<svelte:head>
	<title>{data.album.title} — Galerie | ECOFIP</title>
	<meta
		name="description"
		content={data.album.description ||
			`${data.album.title} : ${countLabel} de la mission ECOFIP${data.album.location ? ` à ${data.album.location}` : ''}.`}
	/>
	<meta property="og:title" content="{data.album.title} — Galerie ECOFIP" />
	<meta property="og:type" content="website" />
	{#if data.album.coverUrl.startsWith('http')}
		<meta property="og:image" content={data.album.coverUrl} />
	{/if}
</svelte:head>

<!-- En-tête de l'album -->
<section
	class="relative overflow-hidden bg-[#0d1c1d] pt-28 pb-12 text-white sm:pt-32 sm:pb-16"
	aria-labelledby="album-title"
>
	<div
		class="absolute inset-0 bg-cover bg-center opacity-35"
		style="background-image: url('{data.album.coverUrl}');"
		aria-hidden="true"
	></div>
	<div
		class="absolute inset-0 bg-gradient-to-b from-[#0d1c1d]/90 via-[#0d1c1d]/80 to-[#171B25]/95 sm:bg-gradient-to-r sm:to-[#96000A]/70"
		aria-hidden="true"
	></div>

	<Container class="relative z-10">
		<nav aria-label="Fil d’Ariane" class="flex items-center gap-1.5 text-xs text-white/70">
			<a href="/" class="flex items-center gap-1 hover:text-white"><Home size={13} /> Accueil</a>
			<ChevronRight size={13} />
			<a href="/galerie" class="hover:text-white">Galerie</a>
			<ChevronRight size={13} />
			<span class="truncate text-white" aria-current="page">{data.album.title}</span>
		</nav>

		<span
			class="mt-6 inline-block rounded-full bg-brand-primary px-3 py-1 text-xs font-bold tracking-wider uppercase"
		>
			{data.album.category}
		</span>
		<h1
			id="album-title"
			class="mt-3 max-w-4xl font-display text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl"
		>
			{data.album.title}
		</h1>
		<div class="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/80">
			{#if data.album.location}
				<span class="flex items-center gap-1.5"
					><MapPin size={15} class="text-brand-accent" />{data.album.location}</span
				>
			{/if}
			{#if data.album.dateLabel}
				<span class="flex items-center gap-1.5"><Calendar size={15} />{data.album.dateLabel}</span>
			{/if}
			<span class="flex items-center gap-1.5">
				{#if data.photos.length > 0}<ImageIcon size={15} />{:else}<Video size={15} />{/if}
				{countLabel}
			</span>
		</div>
		{#if data.album.description}
			<p class="mt-4 max-w-3xl text-sm leading-relaxed text-white/85 sm:text-base">
				{data.album.description}
			</p>
		{/if}
		<a
			href="/galerie"
			class="mt-6 inline-flex items-center gap-1.5 rounded-xl border border-white/25 bg-white/10 px-4 py-2 text-xs font-bold backdrop-blur-xs hover:bg-white/20"
		>
			<ArrowLeft size={14} /> Tous les albums
		</a>
	</Container>
</section>

<GalleryGridSection
	photos={data.photos}
	videos={data.videos}
	showFilters={false}
	onSelectMedia={(_media, index, list) => handleOpenLightbox(list, index)}
	class="pt-10!"
/>

<GalleryLightbox items={lightboxItems} bind:index={lightboxIndex} bind:open={isLightboxOpen} />
