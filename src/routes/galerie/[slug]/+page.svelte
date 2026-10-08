<script lang="ts">
	import PageBanner from '$lib/design-system/patterns/PageBanner.svelte';
	import { GalleryGridSection } from '$lib';
	import GalleryLightbox from '$lib/design-system/components/GalleryLightbox.svelte';
	import Container from '$lib/design-system/components/Container.svelte';
	import type { MediaItem } from '$lib/design-system/types.js';
	import {} from '@lucide/svelte';
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
<PageBanner
	title={data.album.title}
	subtitle={[data.album.category, data.album.location, data.album.dateLabel, countLabel]
		.filter(Boolean)
		.join(' · ')}
	breadcrumbParents={[{ label: 'Galerie', href: '/galerie' }]}
	backgroundImage={data.album.coverUrl}
/>

{#if data.album.description}
	<div class="bg-[#f8fafc] pt-10">
		<Container>
			<p
				class="mx-auto max-w-3xl text-center font-body text-base leading-relaxed text-text-secondary"
			>
				{data.album.description}
			</p>
		</Container>
	</div>
{/if}

<GalleryGridSection
	photos={data.photos}
	videos={data.videos}
	showFilters={false}
	onSelectMedia={(_media, index, list) => handleOpenLightbox(list, index)}
	class="pt-10!"
/>

<GalleryLightbox items={lightboxItems} bind:index={lightboxIndex} bind:open={isLightboxOpen} />
