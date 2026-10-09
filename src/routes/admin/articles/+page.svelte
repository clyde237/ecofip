<script lang="ts">
	import { tick } from 'svelte';
	import { enhance } from '$app/forms';
	import { afterNavigate, replaceState } from '$app/navigation';
	import { page } from '$app/state';
	import {
		Plus,
		Search,
		Pencil,
		Eye,
		EyeOff,
		Star,
		ExternalLink,
		Trash2,
		Newspaper,
		CloudOff,
		CalendarDays
	} from '@lucide/svelte';
	import type { PageData } from './$types.js';
	import Modal from '$lib/design-system/components/Modal.svelte';
	import Button from '$lib/design-system/components/Button.svelte';
	import { toast } from '$lib/design-system/toast.svelte.js';

	let { data }: { data: PageData } = $props();

	type Article = (typeof data.articles)[number];

	let statusFilter = $state<'all' | 'published' | 'draft'>('all');
	let categoryFilter = $state('all');
	let search = $state('');
	let toDelete = $state<Article | null>(null);
	let isDeleteOpen = $state(false);

	let categories = $derived(Array.from(new Set(data.articles.map((a) => a.category))));
	let publishedCount = $derived(data.articles.filter((a) => a.isPublished).length);
	let filtered = $derived(
		data.articles.filter((a) => {
			const query = search.trim().toLowerCase();
			return (
				(statusFilter === 'all' || (statusFilter === 'published') === a.isPublished) &&
				(categoryFilter === 'all' || a.category === categoryFilter) &&
				(!query ||
					a.title.toLowerCase().includes(query) ||
					(a.authorName ?? '').toLowerCase().includes(query))
			);
		})
	);

	// Retour après suppression : message affiché une seule fois, puis paramètre retiré de l'adresse
	// (au tick suivant : au premier chargement, le routeur n'est prêt qu'après ces rappels)
	afterNavigate(({ to }) => {
		if (to?.url.searchParams.get('deleted') === '1') {
			toast.success('Article supprimé.');
			const path = to.url.pathname;
			void tick().then(() => replaceState(path, page.state));
		}
	});

	function formatDate(value: Date | string | null): string {
		if (!value) return '';
		return new Date(value).toLocaleDateString('fr-FR', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	}

	function showActionResult(result: { type: string; data?: Record<string, unknown> }) {
		if (result.type === 'success') {
			toast.success(String(result.data?.message ?? 'Articles mis à jour.'));
		} else if (result.type === 'failure') {
			toast.error(String(result.data?.error ?? 'Une erreur est survenue.'), 'Erreur');
		}
	}

	const quickAction =
		() =>
		async ({
			result,
			update
		}: {
			result: { type: string; data?: Record<string, unknown> };
			update: (options?: { reset?: boolean }) => Promise<void>;
		}) => {
			showActionResult(result);
			await update({ reset: false });
		};
</script>

<svelte:head>
	<title>Articles — Administration ECOFIP</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
		<div>
			<p class="text-xs font-bold tracking-widest text-brand-primary uppercase">Page Actualités</p>
			<h1 class="mt-1 font-display text-2xl font-bold text-text-primary sm:text-3xl">
				Articles & actualités
			</h1>
			<p class="mt-1 max-w-2xl text-sm text-text-secondary">
				{data.articles.length} article{data.articles.length > 1 ? 's' : ''}, dont {publishedCount} publié{publishedCount >
				1
					? 's'
					: ''}. Les articles publiés apparaissent sur la page
				<a href="/actualites" target="_blank" class="font-semibold text-brand-primary underline"
					>Actualités</a
				> et les 3 plus récents sur l’accueil.
			</p>
		</div>
		<a
			href="/admin/articles/nouveau"
			class="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-brand-primary-hover"
		>
			<Plus size={17} /> Nouvel article
		</a>
	</div>

	{#if !data.usingNeonDb}
		<div
			class="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
			role="alert"
		>
			<CloudOff size={18} class="mt-0.5 shrink-0 text-amber-600" />
			La base de données Neon est indisponible : les articles ne peuvent pas être gérés.
		</div>
	{/if}

	<!-- Filtres -->
	<div class="flex flex-col gap-3 lg:flex-row lg:items-center">
		<div
			class="flex items-center gap-1 rounded-xl border border-gray-200 bg-white p-1 text-xs font-semibold"
		>
			{#each [{ id: 'all', label: 'Tous' }, { id: 'published', label: 'Publiés' }, { id: 'draft', label: 'Brouillons' }] as option (option.id)}
				<button
					type="button"
					aria-pressed={statusFilter === option.id}
					onclick={() => (statusFilter = option.id as typeof statusFilter)}
					class="cursor-pointer rounded-lg px-3 py-1.5 {statusFilter === option.id
						? 'bg-brand-primary text-white'
						: 'text-text-secondary hover:text-text-primary'}"
				>
					{option.label}
				</button>
			{/each}
		</div>
		{#if categories.length > 1}
			<label class="sr-only" for="article-category-filter">Catégorie</label>
			<select
				id="article-category-filter"
				bind:value={categoryFilter}
				class="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold"
			>
				<option value="all">Toutes les catégories</option>
				{#each categories as category (category)}
					<option value={category}>{category}</option>
				{/each}
			</select>
		{/if}
		<div class="relative lg:ml-auto lg:w-72">
			<Search size={15} class="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
			<label class="sr-only" for="article-search">Rechercher</label>
			<input
				id="article-search"
				bind:value={search}
				placeholder="Rechercher un titre, un auteur…"
				class="w-full rounded-xl border border-gray-200 bg-white py-2 pr-3 pl-9 text-xs"
			/>
		</div>
	</div>

	<!-- Liste -->
	{#if filtered.length === 0}
		<div
			class="rounded-2xl border border-gray-200 bg-white py-14 text-center text-sm text-text-secondary"
		>
			<Newspaper size={36} class="mx-auto mb-3 opacity-40" />
			{data.articles.length === 0
				? 'Aucun article pour le moment. Rédigez le premier !'
				: 'Aucun article ne correspond à ces filtres.'}
		</div>
	{:else}
		<div
			class="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-200 bg-white"
		>
			{#each filtered as article (article.id)}
				<div class="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
					<a href="/admin/articles/{article.id}" class="shrink-0">
						<img
							src={article.imageUrl}
							alt=""
							class="h-20 w-full rounded-xl object-cover sm:w-32"
							loading="lazy"
						/>
					</a>
					<div class="min-w-0 flex-1">
						<div class="flex flex-wrap items-center gap-1.5 text-[10px] font-bold">
							<span
								class="rounded-full px-2.5 py-0.5 {article.isPublished
									? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
									: 'border border-gray-200 bg-gray-50 text-text-secondary'}"
							>
								{article.isPublished ? 'Publié' : 'Brouillon'}
							</span>
							{#if article.isFeatured}
								<span
									class="inline-flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-0.5 text-amber-950"
								>
									<Star size={10} class="fill-amber-950" /> À la une
								</span>
							{/if}
							<span class="rounded-full bg-brand-subtle px-2.5 py-0.5 text-brand-primary"
								>{article.category}</span
							>
							{#if article.eventTitle}
								<span
									class="inline-flex max-w-full items-center gap-1 truncate rounded-full border border-gray-200 bg-white px-2.5 py-0.5 text-text-secondary"
									title="Événement lié"
								>
									<CalendarDays size={10} />{article.eventTitle}
								</span>
							{/if}
						</div>
						<a
							href="/admin/articles/{article.id}"
							class="mt-1.5 block truncate font-display text-base font-bold text-text-primary hover:text-brand-primary"
						>
							{article.title}
						</a>
						<p class="mt-0.5 text-xs text-text-secondary">
							{article.authorName ?? 'Équipe ECOFIP'} · {article.readTime ?? ''} ·
							{article.isPublished
								? `publié le ${formatDate(article.publishedAt)}`
								: `modifié le ${formatDate(article.updatedAt)}`}
						</p>
					</div>
					<div class="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-semibold">
						<a
							href="/admin/articles/{article.id}"
							class="inline-flex items-center gap-1 text-text-secondary hover:text-brand-primary"
						>
							<Pencil size={13} /> Modifier
						</a>
						<form method="POST" action="?/togglePublish" use:enhance={quickAction}>
							<input type="hidden" name="id" value={article.id} />
							<button
								type="submit"
								class="inline-flex cursor-pointer items-center gap-1 text-text-secondary hover:text-brand-primary"
							>
								{#if article.isPublished}<EyeOff size={13} /> Retirer{:else}<Eye size={13} /> Publier{/if}
							</button>
						</form>
						{#if article.isPublished}
							<form method="POST" action="?/toggleFeatured" use:enhance={quickAction}>
								<input type="hidden" name="id" value={article.id} />
								<button
									type="submit"
									class="inline-flex cursor-pointer items-center gap-1 text-text-secondary hover:text-amber-700"
								>
									<Star
										size={13}
										class={article.isFeatured ? 'fill-amber-400 text-amber-500' : ''}
									/>
									{article.isFeatured ? 'Retirer de la une' : 'À la une'}
								</button>
							</form>
							<a
								href="/actualites/{article.slug}"
								target="_blank"
								class="inline-flex items-center gap-1 text-text-secondary hover:text-brand-primary"
							>
								<ExternalLink size={13} /> Voir
							</a>
						{/if}
						<button
							type="button"
							onclick={() => {
								toDelete = article;
								isDeleteOpen = true;
							}}
							class="inline-flex cursor-pointer items-center gap-1 text-red-600 hover:text-red-700"
						>
							<Trash2 size={13} /> Supprimer
						</button>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<Modal bind:open={isDeleteOpen} title="Supprimer cet article ?">
	{#if toDelete}
		<p class="text-sm text-text-secondary">
			« {toDelete.title} » sera supprimé définitivement, ainsi que son image de couverture et les images
			de son texte sur Cloudflare R2.
		</p>
	{/if}
	{#snippet actions()}
		<Button variant="outline" size="md" onclick={() => (isDeleteOpen = false)}>Annuler</Button>
		{#if toDelete}
			<form
				method="POST"
				action="?/delete"
				use:enhance={() =>
					async ({ result, update }) => {
						showActionResult(result as { type: string; data?: Record<string, unknown> });
						isDeleteOpen = false;
						await update({ reset: false });
					}}
			>
				<input type="hidden" name="id" value={toDelete.id} />
				<Button type="submit" variant="primary" size="md">Supprimer définitivement</Button>
			</form>
		{/if}
	{/snippet}
</Modal>
