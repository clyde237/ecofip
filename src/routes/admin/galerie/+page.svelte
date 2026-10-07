<script lang="ts">
	import { enhance } from '$app/forms';
	import {
		FolderPlus,
		FolderOpen,
		Images,
		Image as ImageIcon,
		Video,
		Eye,
		EyeOff,
		Trash2,
		MapPin,
		CalendarDays,
		CloudOff
	} from '@lucide/svelte';
	import type { PageData } from './$types.js';
	import Card from '$lib/design-system/components/Card.svelte';
	import Button from '$lib/design-system/components/Button.svelte';
	import Modal from '$lib/design-system/components/Modal.svelte';
	import AlbumFormFields from './AlbumFormFields.svelte';
	import { toast } from '$lib/design-system/toast.svelte.js';

	let { data }: { data: PageData } = $props();

	type Album = (typeof data.albums)[number];

	let categoryFilter = $state('all');
	let isCreateOpen = $state(false);
	let isCreating = $state(false);
	let albumToDelete = $state<Album | null>(null);
	let isDeleteOpen = $state(false);

	let categories = $derived(Array.from(new Set(data.albums.map((album) => album.category))));
	let filteredAlbums = $derived(
		data.albums.filter((album) => categoryFilter === 'all' || album.category === categoryFilter)
	);
	let totalPhotos = $derived(data.albums.reduce((sum, album) => sum + album.photoCount, 0));
	let totalVideos = $derived(data.albums.reduce((sum, album) => sum + album.videoCount, 0));

	function showActionResult(result: { type: string; data?: Record<string, unknown> }) {
		if (result.type === 'success') {
			toast.success(String(result.data?.message ?? 'Galerie mise à jour.'));
		} else if (result.type === 'failure') {
			toast.error(String(result.data?.error ?? 'Une erreur est survenue.'), 'Erreur');
		}
	}
</script>

<svelte:head>
	<title>Galerie — Administration ECOFIP</title>
</svelte:head>

<div class="space-y-8">
	<!-- En-tête -->
	<div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
		<div>
			<p class="text-xs font-bold tracking-widest text-brand-primary uppercase">Page Galerie</p>
			<h1 class="mt-1 font-display text-2xl font-bold text-text-primary sm:text-3xl">
				Albums de la galerie
			</h1>
			<p class="mt-1 max-w-2xl text-sm text-text-secondary">
				Chaque album regroupe les photos et vidéos d’un événement. Ouvrez un album pour y ajouter
				des médias : ils apparaissent directement sur la page
				<a href="/galerie" target="_blank" class="font-semibold text-brand-primary underline"
					>Galerie</a
				> s’ils sont publiés.
			</p>
		</div>
		<div class="flex items-center gap-3">
			<div class="hidden gap-3 text-center sm:grid sm:grid-cols-3">
				<div class="rounded-2xl border border-gray-200 bg-white px-4 py-2">
					<div class="font-display text-lg font-bold text-text-primary">{data.albums.length}</div>
					<div class="text-[11px] text-text-secondary">Albums</div>
				</div>
				<div class="rounded-2xl border border-gray-200 bg-white px-4 py-2">
					<div class="font-display text-lg font-bold text-text-primary">{totalPhotos}</div>
					<div class="text-[11px] text-text-secondary">Photos</div>
				</div>
				<div class="rounded-2xl border border-gray-200 bg-white px-4 py-2">
					<div class="font-display text-lg font-bold text-text-primary">{totalVideos}</div>
					<div class="text-[11px] text-text-secondary">Vidéos</div>
				</div>
			</div>
			<Button
				variant="primary"
				size="md"
				onclick={() => (isCreateOpen = true)}
				disabled={!data.usingNeonDb}
			>
				<FolderPlus size={17} class="mr-2" /> Nouvel album
			</Button>
		</div>
	</div>

	{#if !data.isR2Configured || !data.usingNeonDb}
		<div
			class="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
			role="alert"
		>
			<CloudOff size={18} class="mt-0.5 shrink-0 text-amber-600" />
			<p>
				{#if !data.usingNeonDb}
					La base de données Neon est indisponible : la galerie ne peut pas être modifiée.
				{:else}
					Cloudflare R2 n’est pas configuré : l’envoi de fichiers est impossible. Renseignez les
					variables R2_* du fichier .env.
				{/if}
			</p>
		</div>
	{/if}

	<Card class="p-6 sm:p-8">
		<div
			class="mb-6 flex flex-col gap-3 border-b border-gray-100 pb-4 sm:flex-row sm:items-center sm:justify-between"
		>
			<h2 class="font-display text-xl font-bold text-text-primary">
				Albums ({filteredAlbums.length})
			</h2>
			{#if categories.length > 1}
				<label class="sr-only" for="album-category-filter">Catégorie</label>
				<select
					id="album-category-filter"
					bind:value={categoryFilter}
					class="rounded-xl border border-gray-200 px-3 py-2 text-xs"
				>
					<option value="all">Toutes les catégories</option>
					{#each categories as category (category)}
						<option value={category}>{category}</option>
					{/each}
				</select>
			{/if}
		</div>

		{#if data.albums.length === 0}
			<div class="py-14 text-center text-text-secondary">
				<FolderOpen size={40} class="mx-auto mb-3 opacity-40" />
				<p class="text-sm">Aucun album pour le moment.</p>
				<p class="mt-1 text-xs">
					Créez un album (ex : « Croisade Bafoussam 2026 »), puis ajoutez-y vos photos.
				</p>
			</div>
		{:else}
			<div class="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
				{#each filteredAlbums as album (album.id)}
					<article
						class="group flex flex-col overflow-hidden rounded-2xl border bg-white shadow-xs transition-shadow hover:shadow-md {album.isPublished
							? 'border-gray-200'
							: 'border-dashed border-gray-300'}"
					>
						<a href="/admin/galerie/{album.id}" class="block">
							<div class="relative aspect-[4/3] bg-gray-100">
								{#if album.coverUrl}
									<img
										src={album.coverUrl}
										alt=""
										class="h-full w-full object-cover {album.isPublished ? '' : 'opacity-60'}"
										loading="lazy"
									/>
								{:else}
									<div class="flex h-full items-center justify-center text-gray-300">
										<Images size={48} />
									</div>
								{/if}
								<div class="absolute top-2.5 left-2.5 flex gap-1.5">
									<span
										class="rounded-full bg-black/65 px-2.5 py-0.5 text-[11px] font-bold text-white"
									>
										{album.category}
									</span>
									{#if !album.isPublished}
										<span
											class="rounded-full bg-gray-700 px-2.5 py-0.5 text-[11px] font-bold text-white"
											>Masqué</span
										>
									{/if}
								</div>
								<div
									class="absolute right-2.5 bottom-2.5 flex gap-1.5 text-[11px] font-bold text-white"
								>
									<span class="inline-flex items-center gap-1 rounded-md bg-black/70 px-2 py-0.5">
										<ImageIcon size={11} />
										{album.photoCount}
									</span>
									{#if album.videoCount > 0}
										<span class="inline-flex items-center gap-1 rounded-md bg-black/70 px-2 py-0.5">
											<Video size={11} />
											{album.videoCount}
										</span>
									{/if}
								</div>
							</div>
							<div class="p-4">
								<h3
									class="line-clamp-2 font-display text-base font-bold text-text-primary group-hover:text-brand-primary"
								>
									{album.title}
								</h3>
								<div class="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-text-secondary">
									{#if album.location}
										<span class="flex items-center gap-1"><MapPin size={11} />{album.location}</span
										>
									{/if}
									{#if album.year}
										<span class="flex items-center gap-1"
											><CalendarDays size={11} />{album.year}</span
										>
									{/if}
								</div>
							</div>
						</a>
						<div
							class="mt-auto flex items-center justify-between gap-2 border-t border-gray-100 bg-[#f8fafc] px-4 py-2.5"
						>
							<a
								href="/admin/galerie/{album.id}"
								class="inline-flex items-center gap-1.5 text-xs font-bold text-brand-primary hover:underline"
							>
								<FolderOpen size={14} /> Ouvrir
							</a>
							<div class="flex items-center gap-3">
								<form
									method="POST"
									action="?/toggleAlbumPublish"
									use:enhance={() =>
										async ({ result, update }) => {
											showActionResult(result as { type: string; data?: Record<string, unknown> });
											await update({ reset: false });
										}}
								>
									<input type="hidden" name="id" value={album.id} />
									<button
										type="submit"
										class="inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-text-secondary hover:text-brand-primary"
									>
										{#if album.isPublished}
											<EyeOff size={14} /> Masquer
										{:else}
											<Eye size={14} /> Publier
										{/if}
									</button>
								</form>
								<button
									type="button"
									onclick={() => {
										albumToDelete = album;
										isDeleteOpen = true;
									}}
									class="inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700"
								>
									<Trash2 size={14} /> Supprimer
								</button>
							</div>
						</div>
					</article>
				{/each}
			</div>
		{/if}
	</Card>
</div>

<!-- Création d'un album -->
<Modal bind:open={isCreateOpen} title="Nouvel album">
	<form
		id="album-create-form"
		method="POST"
		action="?/createAlbum"
		use:enhance={() => {
			isCreating = true;
			return async ({ result, update }) => {
				isCreating = false;
				if (result.type === 'failure') {
					showActionResult(result as { type: string; data?: Record<string, unknown> });
				}
				// Succès : redirection vers la page de l'album pour y ajouter les photos
				await update();
			};
		}}
		class="space-y-4"
	>
		<AlbumFormFields idPrefix="create" categorySuggestions={categories} />
	</form>

	{#snippet actions()}
		<Button variant="outline" size="md" onclick={() => (isCreateOpen = false)}>Annuler</Button>
		<Button
			type="submit"
			form="album-create-form"
			variant="primary"
			size="md"
			disabled={isCreating}
		>
			{isCreating ? 'Création…' : 'Créer et ajouter des photos'}
		</Button>
	{/snippet}
</Modal>

<!-- Suppression d'un album -->
<Modal bind:open={isDeleteOpen} title="Supprimer cet album ?">
	{#if albumToDelete}
		<p class="text-sm text-text-secondary">
			L’album « {albumToDelete.title} » et ses {albumToDelete.photoCount + albumToDelete.videoCount}
			média(s) seront supprimés, ainsi que leurs fichiers sur Cloudflare R2. Cette action est irréversible.
		</p>
	{/if}

	{#snippet actions()}
		<Button variant="outline" size="md" onclick={() => (isDeleteOpen = false)}>Annuler</Button>
		{#if albumToDelete}
			<form
				method="POST"
				action="?/deleteAlbum"
				use:enhance={() =>
					async ({ result, update }) => {
						showActionResult(result as { type: string; data?: Record<string, unknown> });
						isDeleteOpen = false;
						await update({ reset: false });
					}}
			>
				<input type="hidden" name="id" value={albumToDelete.id} />
				<Button type="submit" variant="primary" size="md">Supprimer l’album</Button>
			</form>
		{/if}
	{/snippet}
</Modal>
