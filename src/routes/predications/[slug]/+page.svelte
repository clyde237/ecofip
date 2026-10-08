<script lang="ts">
	import Seo from '$lib/design-system/components/Seo.svelte';
	import { SITE_URL, absoluteUrl, shareableImageUrl, toIsoDuration } from '$lib/config/site.js';
	import { onMount } from 'svelte';
	import {
		Home,
		ChevronRight,
		BookOpen,
		Calendar,
		MessageCircle,
		Link as LinkIcon,
		CheckCircle2,
		Share2,
		Play
	} from '@lucide/svelte';
	import Container from '$lib/design-system/components/Container.svelte';
	import SermonCard from '$lib/design-system/components/SermonCard.svelte';
	import SermonFeed from '$lib/design-system/components/SermonFeed.svelte';
	import { toast } from '$lib/design-system/toast.svelte.js';
	import type { PageData } from './$types.js';

	let { data }: { data: PageData } = $props();

	let sermon = $derived(data.sermon);
	let sermonDescription = $derived(
		sermon.description ||
			`${sermon.title}${sermon.preacher ? ` — ${sermon.preacher}` : ''}${sermon.scripture ? ` (${sermon.scripture})` : ''}. Prédication en vidéo d’ECOFIP.`
	);
	let copied = $state(false);
	let canNativeShare = $state(false);
	let isFeedOpen = $state(false);
	let feedStart = $state(0);
	// Lecteur plein écran : la prédication de la page puis les suivantes
	let feedSermons = $derived([data.sermon, ...data.others]);

	onMount(() => {
		canNativeShare = 'share' in navigator;
	});

	async function copyLink() {
		try {
			await navigator.clipboard.writeText(data.canonicalUrl);
			copied = true;
			toast.success('Lien de la prédication copié.');
			setTimeout(() => (copied = false), 2500);
		} catch {
			toast.error('Copie impossible : sélectionnez l’adresse dans la barre du navigateur.');
		}
	}

	async function nativeShare() {
		try {
			await navigator.share({ title: sermon.title, url: data.canonicalUrl });
		} catch {
			// Partage annulé par le visiteur
		}
	}
</script>

<Seo
	title="{sermon.title} — Prédication | ECOFIP"
	description={sermonDescription}
	image={sermon.posterUrl}
	imageAlt={sermon.title}
	type="video.other"
	canonicalPath={sermon.href}
	breadcrumbs={[
		{ name: 'Prédications', path: '/predications' },
		{ name: sermon.title, path: sermon.href }
	]}
	jsonLd={{
		'@type': 'VideoObject',
		name: sermon.title,
		description: sermonDescription,
		thumbnailUrl: [shareableImageUrl(sermon.posterUrl)],
		uploadDate: data.uploadedAt,
		contentUrl: absoluteUrl(sermon.videoUrl),
		duration: sermon.duration ? toIsoDuration(sermon.duration) : undefined,
		inLanguage: 'fr',
		publisher: { '@id': `${SITE_URL}/#organization` }
	}}
/>
<svelte:head>
	{#if sermon.videoUrl}
		<meta property="og:video" content={absoluteUrl(sermon.videoUrl)} />
	{/if}
</svelte:head>

<section class="bg-[#0d1c1d] pt-24 pb-12 text-white sm:pt-28 sm:pb-16">
	<Container>
		<nav
			aria-label="Fil d’Ariane"
			class="flex flex-wrap items-center gap-1.5 text-xs text-white/65"
		>
			<a href="/" class="flex items-center gap-1 hover:text-white"><Home size={13} /> Accueil</a>
			<ChevronRight size={12} class="text-white/40" />
			<a href="/predications" class="hover:text-white">Prédications</a>
			<ChevronRight size={12} class="text-white/40" />
			<span class="truncate text-white/90" aria-current="page">{sermon.title}</span>
		</nav>

		<div
			class="mt-6 grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,420px)_1fr] lg:gap-12"
		>
			<!-- Lecteur vertical -->
			<div class="mx-auto w-full max-w-[420px]">
				<!-- svelte-ignore a11y_media_has_caption -->
				<video
					src={sermon.videoUrl}
					poster={sermon.posterUrl ?? undefined}
					controls
					playsinline
					preload="metadata"
					class="aspect-[9/16] max-h-[78dvh] w-full rounded-3xl bg-black object-contain shadow-2xl"
				></video>
			</div>

			<!-- Informations et partage -->
			<div>
				{#if sermon.series}
					<p class="font-body text-xs font-bold tracking-wider text-amber-300 uppercase">
						{sermon.series}
					</p>
				{/if}
				<h1 class="mt-2 font-display text-3xl leading-tight font-extrabold sm:text-4xl">
					{sermon.title}
				</h1>
				<div class="mt-4 space-y-1.5 font-body text-sm text-white/80">
					{#if sermon.preacher}<p class="font-semibold text-white">{sermon.preacher}</p>{/if}
					{#if sermon.scripture}
						<p class="flex items-center gap-1.5">
							<BookOpen size={15} class="text-amber-300" />{sermon.scripture}
						</p>
					{/if}
					<p class="flex items-center gap-1.5"><Calendar size={15} />{sermon.dateLabel}</p>
				</div>
				{#if sermon.description}
					<p
						class="mt-5 max-w-xl font-body text-base leading-relaxed whitespace-pre-line text-white/85"
					>
						{sermon.description}
					</p>
				{/if}

				<div class="mt-7 flex flex-wrap gap-2 font-body text-sm font-bold">
					<a
						href="https://wa.me/?text={encodeURIComponent(
							`${sermon.title} — ${data.canonicalUrl}`
						)}"
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-white hover:opacity-90"
					>
						<MessageCircle size={16} /> WhatsApp
					</a>
					<a
						href="https://www.facebook.com/sharer/sharer.php?u={encodeURIComponent(
							data.canonicalUrl
						)}"
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center gap-2 rounded-xl bg-[#1877F2] px-4 py-2.5 text-white hover:opacity-90"
					>
						Facebook
					</a>
					<button
						type="button"
						onclick={copyLink}
						class="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/25 px-4 py-2.5 hover:bg-white/10"
					>
						{#if copied}<CheckCircle2 size={16} class="text-emerald-400" /> Lien copié{:else}<LinkIcon
								size={16}
							/> Copier le lien{/if}
					</button>
					{#if canNativeShare}
						<button
							type="button"
							onclick={nativeShare}
							class="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/25 px-4 py-2.5 hover:bg-white/10"
						>
							<Share2 size={16} /> Partager
						</button>
					{/if}
				</div>

				{#if data.others.length > 0}
					<button
						type="button"
						onclick={() => {
							feedStart = 0;
							isFeedOpen = true;
						}}
						class="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-brand-primary px-5 py-3 font-body text-sm font-bold text-white hover:bg-brand-primary-hover"
					>
						<Play size={16} class="fill-white" /> Regarder à la suite en plein écran
					</button>
				{/if}
			</div>
		</div>
	</Container>
</section>

{#if data.others.length > 0}
	<section class="bg-[#f8fafc] py-12 sm:py-16" aria-labelledby="more-sermons">
		<Container>
			<div class="mb-6 flex items-baseline justify-between gap-4">
				<h2 id="more-sermons" class="font-display text-2xl font-bold text-text-primary">
					Autres prédications
				</h2>
				<a
					href="/predications"
					class="font-body text-sm font-bold text-brand-primary hover:underline">Tout voir</a
				>
			</div>
			<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-6">
				{#each data.others as other, index (other.id)}
					<SermonCard
						sermon={other}
						onSelect={() => {
							feedStart = index + 1;
							isFeedOpen = true;
						}}
					/>
				{/each}
			</div>
		</Container>
	</section>
{/if}

<SermonFeed sermons={feedSermons} startIndex={feedStart} bind:open={isFeedOpen} />
