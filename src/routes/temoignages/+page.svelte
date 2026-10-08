<script lang="ts">
	import PageBanner from '$lib/design-system/patterns/PageBanner.svelte';
	import { onMount } from 'svelte';
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { replaceState } from '$app/navigation';
	import {
		Quote,
		Video,
		Play,
		Clock,
		MapPin,
		Send,
		CheckCircle2,
		ShieldCheck
	} from '@lucide/svelte';
	import Container from '$lib/design-system/components/Container.svelte';
	import GalleryLightbox from '$lib/design-system/components/GalleryLightbox.svelte';
	import type { MediaItem, PublishedTestimonial } from '$lib/design-system/types.js';
	import type { ActionData, PageData } from './$types.js';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const PAGE_SIZE = 12;
	const DEFAULT_VIDEO_POSTER = '/video-highlights-cover.jpg';

	// Écrits par défaut ; ?type=video ouvre directement l'onglet vidéos (lien partageable)
	let activeTab = $state<'text' | 'video'>(
		page.url.searchParams.get('type') === 'video' ? 'video' : 'text'
	);
	let visibleWrittenCount = $state(PAGE_SIZE);
	let visibleVideoCount = $state(PAGE_SIZE);

	function selectTab(tab: 'text' | 'video') {
		activeTab = tab;
		const url = new URL(page.url);
		if (tab === 'video') url.searchParams.set('type', 'video');
		else url.searchParams.delete('type');
		replaceState(url, {});
	}

	function subtitle(item: PublishedTestimonial): string {
		return [item.role, item.city].filter(Boolean).join(' · ');
	}

	// Lecture des vidéos dans la visionneuse de la galerie
	let isPlayerOpen = $state(false);
	let playerIndex = $state(0);
	let playerItems = $derived<MediaItem[]>(
		data.videos.map((item) => ({
			id: item.id,
			title: item.name,
			category: 'Témoignage',
			categorySlug: 'temoignage',
			type: 'video',
			url: item.posterUrl ?? DEFAULT_VIDEO_POSTER,
			videoUrl: item.videoUrl ?? undefined,
			duration: item.duration,
			location: item.city,
			date: item.publishedLabel,
			description: item.quote || item.role
		}))
	);

	// Formulaire de partage
	let startedAt = $state('');
	let isSending = $state(false);
	let hasSent = $state(false);
	let contentLength = $state(0);

	onMount(() => {
		// Sert à écarter les envois de robots, trop rapides pour un humain
		startedAt = String(Date.now());
	});

	const inputClass =
		'mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-3 font-body text-sm text-text-primary placeholder:text-gray-400 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15 focus:outline-hidden';
	const labelClass = 'block font-body text-sm font-semibold text-text-primary';
</script>

<svelte:head>
	<title>Témoignages — Des vies transformées | ECOFIP</title>
	<meta
		name="description"
		content="Lisez et regardez les témoignages de personnes touchées, restaurées et guéries lors des missions ECOFIP au Cameroun, et partagez le vôtre."
	/>
	<meta property="og:title" content="Témoignages — ECOFIP" />
	<meta property="og:type" content="website" />
</svelte:head>

<!-- En-tête -->
<PageBanner
	title="Témoignages"
	subtitle="Des vies transformées par la puissance de l’Évangile lors de nos missions à travers le Cameroun."
	backgroundImage="/about-worship-hd.jpg"
/>

<!-- Témoignages publiés -->
<section class="bg-[#f8fafc] py-14 sm:py-20" aria-label="Témoignages publiés">
	<Container>
		<div class="flex justify-center">
			<div
				class="inline-flex rounded-2xl border border-gray-200/80 bg-white p-1.5 shadow-xs"
				role="tablist"
				aria-label="Type de témoignage"
			>
				<button
					type="button"
					role="tab"
					id="tab-written"
					aria-selected={activeTab === 'text'}
					aria-controls="panel-written"
					onclick={() => selectTab('text')}
					class="flex cursor-pointer items-center gap-2 rounded-xl px-5 py-2.5 font-body text-sm font-bold transition-all {activeTab ===
					'text'
						? 'bg-brand-primary text-white shadow-xs'
						: 'text-text-secondary hover:text-text-primary'}"
				>
					<Quote size={16} /> Écrits ({data.written.length})
				</button>
				<button
					type="button"
					role="tab"
					id="tab-videos"
					aria-selected={activeTab === 'video'}
					aria-controls="panel-videos"
					onclick={() => selectTab('video')}
					class="flex cursor-pointer items-center gap-2 rounded-xl px-5 py-2.5 font-body text-sm font-bold transition-all {activeTab ===
					'video'
						? 'bg-brand-primary text-white shadow-xs'
						: 'text-text-secondary hover:text-text-primary'}"
				>
					<Video size={16} /> Vidéos ({data.videos.length})
				</button>
			</div>
		</div>

		{#if activeTab === 'text'}
			<div id="panel-written" role="tabpanel" aria-labelledby="tab-written" class="mt-10">
				{#if data.written.length === 0}
					<p
						class="rounded-3xl border border-gray-200 bg-white p-10 text-center font-body text-sm text-text-secondary"
					>
						Aucun témoignage écrit publié pour le moment. Soyez le premier à partager le vôtre !
					</p>
				{:else}
					<div class="columns-1 gap-6 md:columns-2 lg:columns-3">
						{#each data.written.slice(0, visibleWrittenCount) as item (item.id)}
							<article
								class="mb-6 break-inside-avoid rounded-3xl border border-gray-200/80 bg-white p-6 shadow-xs sm:p-7"
							>
								<Quote size={22} class="text-brand-primary/70" aria-hidden="true" />
								<blockquote
									class="mt-3 font-body text-[15px] leading-relaxed whitespace-pre-line text-text-primary"
								>
									{item.quote}
								</blockquote>
								<div class="mt-6 flex items-center gap-3 border-t border-gray-100 pt-4">
									{#if item.avatar}
										<img
											src={item.avatar}
											alt=""
											class="h-11 w-11 shrink-0 rounded-full object-cover"
											loading="lazy"
										/>
									{:else}
										<div
											class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-subtle font-display font-bold text-brand-primary"
											aria-hidden="true"
										>
											{item.name.charAt(0).toUpperCase()}
										</div>
									{/if}
									<div class="min-w-0">
										<p class="font-display text-sm font-bold text-text-primary">{item.name}</p>
										{#if subtitle(item)}
											<p class="truncate font-body text-xs text-text-secondary">{subtitle(item)}</p>
										{/if}
									</div>
									{#if item.publishedLabel}
										<span class="ml-auto shrink-0 font-body text-[11px] text-text-secondary"
											>{item.publishedLabel}</span
										>
									{/if}
								</div>
							</article>
						{/each}
					</div>
					{#if data.written.length > visibleWrittenCount}
						<div class="mt-4 text-center">
							<button
								type="button"
								onclick={() => (visibleWrittenCount += PAGE_SIZE)}
								class="cursor-pointer rounded-xl border border-gray-300 bg-white px-5 py-2.5 font-body text-sm font-bold text-text-primary hover:border-brand-primary hover:text-brand-primary"
							>
								Afficher plus de témoignages
							</button>
						</div>
					{/if}
				{/if}
			</div>
		{:else}
			<div id="panel-videos" role="tabpanel" aria-labelledby="tab-videos" class="mt-10">
				{#if data.videos.length === 0}
					<p
						class="rounded-3xl border border-gray-200 bg-white p-10 text-center font-body text-sm text-text-secondary"
					>
						Aucun témoignage vidéo publié pour le moment.
					</p>
				{:else}
					<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{#each data.videos.slice(0, visibleVideoCount) as item, index (item.id)}
							<button
								type="button"
								onclick={() => {
									playerIndex = index;
									isPlayerOpen = true;
								}}
								class="group flex cursor-pointer flex-col overflow-hidden rounded-3xl border border-gray-200/80 bg-white text-left shadow-xs transition-all hover:-translate-y-1 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-brand-primary"
							>
								<div class="relative aspect-video w-full overflow-hidden bg-gray-900">
									<img
										src={item.posterUrl ?? DEFAULT_VIDEO_POSTER}
										alt=""
										class="h-full w-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
										loading="lazy"
									/>
									<div
										class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"
									></div>
									<span
										class="absolute inset-0 m-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-primary text-white shadow-xl transition-transform group-hover:scale-110"
									>
										<Play size={22} class="translate-x-0.5 fill-white" />
										<span class="sr-only">Regarder le témoignage de {item.name}</span>
									</span>
									{#if item.duration}
										<span
											class="absolute right-3 bottom-3 inline-flex items-center gap-1 rounded-lg bg-black/75 px-2 py-0.5 font-body text-xs font-bold text-white"
										>
											<Clock size={12} />{item.duration}
										</span>
									{/if}
								</div>
								<div class="p-5">
									<p class="font-display text-base font-bold text-text-primary">{item.name}</p>
									{#if item.role}
										<p class="mt-0.5 font-body text-xs text-text-secondary">{item.role}</p>
									{/if}
									{#if item.quote}
										<p class="mt-2 line-clamp-2 font-body text-sm text-text-secondary">
											{item.quote}
										</p>
									{/if}
									{#if item.city}
										<p class="mt-3 flex items-center gap-1 font-body text-xs text-text-secondary">
											<MapPin size={12} class="text-brand-accent" />{item.city}
										</p>
									{/if}
								</div>
							</button>
						{/each}
					</div>
					{#if data.videos.length > visibleVideoCount}
						<div class="mt-8 text-center">
							<button
								type="button"
								onclick={() => (visibleVideoCount += PAGE_SIZE)}
								class="cursor-pointer rounded-xl border border-gray-300 bg-white px-5 py-2.5 font-body text-sm font-bold text-text-primary hover:border-brand-primary hover:text-brand-primary"
							>
								Afficher plus de vidéos
							</button>
						</div>
					{/if}
				{/if}
			</div>
		{/if}
	</Container>
</section>

<!-- Partage d'un témoignage -->
<section id="partager" class="scroll-mt-24 bg-white py-14 sm:py-20" aria-labelledby="share-title">
	<Container>
		<div class="mx-auto max-w-2xl">
			<h2
				id="share-title"
				class="text-center font-display text-2xl font-bold text-text-primary sm:text-3xl"
			>
				Dieu a-t-il accompli une merveille dans votre vie ?
			</h2>
			<p class="mt-3 text-center font-body text-sm text-text-secondary sm:text-base">
				Racontez-nous votre histoire. Chaque témoignage est relu par notre équipe avant d’être
				publié.
			</p>

			{#if hasSent}
				<div
					class="mt-8 rounded-3xl border border-emerald-200 bg-emerald-50 p-8 text-center"
					role="status"
				>
					<CheckCircle2 size={36} class="mx-auto text-emerald-600" />
					<p class="mt-3 font-display text-lg font-bold text-emerald-900">
						Merci pour votre témoignage !
					</p>
					<p class="mt-1 font-body text-sm text-emerald-800">
						Il sera publié sur le site après validation par notre équipe.
					</p>
					<button
						type="button"
						onclick={() => (hasSent = false)}
						class="mt-5 cursor-pointer font-body text-sm font-semibold text-emerald-800 underline underline-offset-4"
					>
						Envoyer un autre témoignage
					</button>
				</div>
			{:else}
				<form
					method="POST"
					action="?/submit"
					use:enhance={() => {
						isSending = true;
						return async ({ result, update }) => {
							isSending = false;
							if (result.type === 'success') {
								hasSent = true;
								contentLength = 0;
								startedAt = String(Date.now());
							}
							await update({ reset: result.type === 'success', invalidateAll: false });
						};
					}}
					class="mt-8 space-y-5 rounded-3xl border border-gray-200/80 bg-[#f8fafc] p-6 sm:p-8"
				>
					{#if form && 'error' in form && form.error}
						<p
							class="rounded-xl border border-red-200 bg-red-50 p-3.5 font-body text-sm text-red-800"
							role="alert"
						>
							{form.error}
						</p>
					{/if}

					<!-- Champs anti-robots, invisibles pour les visiteurs -->
					<input type="hidden" name="startedAt" value={startedAt} />
					<div class="hidden" aria-hidden="true">
						<label
							>Site web <input type="text" name="website" tabindex="-1" autocomplete="off" /></label
						>
					</div>

					<div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
						<div>
							<label for="share-name" class={labelClass}>Nom et prénom *</label>
							<input
								id="share-name"
								name="authorName"
								required
								maxlength="150"
								autocomplete="name"
								value={form && 'values' in form ? (form.values?.authorName ?? '') : ''}
								class={inputClass}
							/>
						</div>
						<div>
							<label for="share-city" class={labelClass}>Ville</label>
							<input
								id="share-city"
								name="authorCity"
								maxlength="100"
								placeholder="Ex : Bafoussam"
								value={form && 'values' in form ? (form.values?.authorCity ?? '') : ''}
								class={inputClass}
							/>
						</div>
					</div>
					<div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
						<div>
							<label for="share-role" class={labelClass}>Qui êtes-vous ?</label>
							<input
								id="share-role"
								name="authorRole"
								maxlength="150"
								placeholder="Ex : Commerçante, mère de famille"
								value={form && 'values' in form ? (form.values?.authorRole ?? '') : ''}
								class={inputClass}
							/>
						</div>
						<div>
							<label for="share-contact" class={labelClass}>Téléphone ou email</label>
							<input
								id="share-contact"
								name="contactInfo"
								maxlength="150"
								autocomplete="email"
								value={form && 'values' in form ? (form.values?.contactInfo ?? '') : ''}
								aria-describedby="share-contact-help"
								class={inputClass}
							/>
							<p id="share-contact-help" class="mt-1 font-body text-xs text-text-secondary">
								Facultatif, jamais publié : seulement pour vous recontacter si besoin.
							</p>
						</div>
					</div>
					<div>
						<label for="share-content" class={labelClass}>Votre témoignage *</label>
						<textarea
							id="share-content"
							name="content"
							required
							minlength="30"
							maxlength="3000"
							rows="7"
							placeholder="Racontez ce que Dieu a fait dans votre vie…"
							oninput={(e) => (contentLength = e.currentTarget.value.length)}
							class={inputClass}
							>{form && 'values' in form ? (form.values?.content ?? '') : ''}</textarea
						>
						<p class="mt-1 text-right font-body text-xs text-text-secondary">
							{contentLength} / 3000
						</p>
					</div>
					<label class="flex items-start gap-3 font-body text-sm text-text-primary">
						<input type="checkbox" name="consent" required class="mt-0.5 h-4 w-4 rounded-sm" />
						<span>
							J’accepte que mon témoignage soit publié sur le site d’ECOFIP avec mon nom, ma ville
							et ma fonction.
						</span>
					</label>
					<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<p class="flex items-center gap-1.5 font-body text-xs text-text-secondary">
							<ShieldCheck size={14} class="text-emerald-600" /> Relu par notre équipe avant publication
						</p>
						<button
							type="submit"
							disabled={isSending}
							class="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand-primary px-6 py-3 font-body text-sm font-bold text-white shadow-md hover:bg-brand-primary-hover disabled:opacity-60"
						>
							<Send size={16} />
							{isSending ? 'Envoi…' : 'Envoyer mon témoignage'}
						</button>
					</div>
				</form>
			{/if}
		</div>
	</Container>
</section>

<GalleryLightbox items={playerItems} bind:index={playerIndex} bind:open={isPlayerOpen} />
