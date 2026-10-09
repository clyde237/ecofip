<script lang="ts">
	import { tick } from 'svelte';
	import { enhance } from '$app/forms';
	import { afterNavigate, replaceState } from '$app/navigation';
	import { page } from '$app/state';
	import { ArrowLeft, ExternalLink, Trash2 } from '@lucide/svelte';
	import ArticleEditor from '../ArticleEditor.svelte';
	import Modal from '$lib/design-system/components/Modal.svelte';
	import Button from '$lib/design-system/components/Button.svelte';
	import { toast } from '$lib/design-system/toast.svelte.js';
	import type { PageData } from './$types.js';

	let { data }: { data: PageData } = $props();

	let isDeleteOpen = $state(false);

	// Arrivée après création : message affiché une seule fois, puis paramètre retiré de l'adresse
	// (au tick suivant : au premier chargement, le routeur n'est prêt qu'après ces rappels)
	afterNavigate(({ to }) => {
		if (to?.url.searchParams.get('created') === '1') {
			toast.success('Article créé.');
			const path = to.url.pathname;
			void tick().then(() => replaceState(path, page.state));
		}
	});
</script>

<svelte:head>
	<title>{data.article.title} — Articles — Administration ECOFIP</title>
</svelte:head>

<div class="space-y-5">
	<div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
		<div>
			<a
				href="/admin/articles"
				class="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-brand-primary"
			>
				<ArrowLeft size={14} /> Tous les articles
			</a>
			<h1 class="mt-2 font-display text-2xl font-bold text-text-primary sm:text-3xl">
				Modifier l’article
			</h1>
		</div>
		<div class="flex gap-2">
			{#if data.article.isPublished}
				<a
					href="/actualites/{data.article.slug}"
					target="_blank"
					class="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-bold text-text-primary hover:border-brand-primary hover:text-brand-primary"
				>
					<ExternalLink size={14} /> Voir sur le site
				</a>
			{/if}
			<button
				type="button"
				onclick={() => (isDeleteOpen = true)}
				class="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-red-200 bg-white px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50"
			>
				<Trash2 size={14} /> Supprimer
			</button>
		</div>
	</div>

	{#key data.article.id}
		<ArticleEditor
			action="?/update"
			submitLabel="Enregistrer"
			categories={data.categories}
			eventChoices={data.eventChoices}
			isR2Configured={data.isR2Configured}
			article={data.article}
		/>
	{/key}
</div>

<Modal bind:open={isDeleteOpen} title="Supprimer cet article ?">
	<p class="text-sm text-text-secondary">
		« {data.article.title} » sera supprimé définitivement, ainsi que son image de couverture et les images
		de son texte sur Cloudflare R2.
	</p>
	{#snippet actions()}
		<Button variant="outline" size="md" onclick={() => (isDeleteOpen = false)}>Annuler</Button>
		<form method="POST" action="?/delete" use:enhance>
			<Button type="submit" variant="primary" size="md">Supprimer définitivement</Button>
		</form>
	{/snippet}
</Modal>
