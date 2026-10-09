<script lang="ts">
	/**
	 * Éditeur d'article (création et modification) : couverture sur Cloudflare R2, texte saisi dans
	 * un éditeur visuel (gras, italique, intertitres, listes, liens, images…), événement lié
	 * facultatif, et aperçu fidèle au site.
	 */
	import { enhance } from '$app/forms';
	import { Eye, PenLine, UploadCloud, Trash2, Star, CalendarDays } from '@lucide/svelte';
	import Button from '$lib/design-system/components/Button.svelte';
	import ArticleContent from '$lib/design-system/components/ArticleContent.svelte';
	import { toast } from '$lib/design-system/toast.svelte.js';
	import { compressImage, toUploadFilename, uploadToR2 } from '$lib/utils/r2Upload.js';
	import { readingTimeLabel, toEditorDoc, toPlainText } from '$lib/utils/articleContent.js';
	import RichTextEditor from './RichTextEditor.svelte';

	interface Props {
		/** Action du formulaire : « ?/update » en modification, vide en création */
		action: string;
		submitLabel: string;
		categories: string[];
		eventChoices: { id: number; title: string; dateLabel: string; isPublished: boolean }[];
		isR2Configured: boolean;
		article?: {
			title: string;
			category: string;
			excerpt: string | null;
			content: string;
			authorName: string | null;
			authorRole: string | null;
			imageUrl: string | null;
			isPublished: boolean;
			isFeatured: boolean;
			eventId: number | null;
		};
	}

	let { action, submitLabel, categories, eventChoices, isR2Configured, article }: Props = $props();

	const PRESET_CATEGORIES = [
		'Rapport de mission',
		'Témoignage',
		'Enseignement biblique',
		'Santé & humanitaire',
		'Annonce',
		'Jeunesse'
	];
	const FOLDER = 'articles';
	const inputClass =
		'mt-1 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-text-primary placeholder:text-gray-400 focus:border-brand-primary focus:outline-hidden';
	const labelClass = 'block text-xs font-bold text-text-primary';

	let suggestions = $derived(Array.from(new Set([...PRESET_CATEGORIES, ...categories])));

	// Champs suivis pour l'aperçu, le temps de lecture et l'état « à la une ».
	// Valeurs initiales uniquement : l'éditeur est recréé ({#key}) quand on change d'article,
	// et la saisie en cours ne doit pas être écrasée par le rechargement après enregistrement.
	// svelte-ignore state_referenced_locally
	const initialDoc = toEditorDoc(article?.content ?? '');
	let content = $state(JSON.stringify(initialDoc));
	// svelte-ignore state_referenced_locally
	let isPublished = $state(article?.isPublished ?? false);
	// svelte-ignore state_referenced_locally
	let isFeatured = $state(article?.isFeatured ?? false);
	let mode = $state<'write' | 'preview'>('write');
	let isSaving = $state(false);

	let wordCount = $derived(toPlainText(content).split(' ').filter(Boolean).length);
	let readTime = $derived(readingTimeLabel(content));

	// Couverture
	let coverFile = $state<File | null>(null);
	let coverKey = $state('');
	let coverPreview = $state<string | null>(null);
	let removeCover = $state(false);
	let shownCover = $derived(coverPreview ?? (removeCover ? null : (article?.imageUrl ?? null)));

	function selectCover(file: File | undefined) {
		if (!file) return;
		if (!file.type.startsWith('image/')) {
			toast.error('La couverture doit être une image.', 'Format invalide');
			return;
		}
		if (coverPreview) URL.revokeObjectURL(coverPreview);
		coverFile = file;
		coverKey = '';
		coverPreview = URL.createObjectURL(file);
		removeCover = false;
	}

	/** Image insérée dans le texte : réduite puis envoyée sur R2 */
	async function uploadContentImage(file: File): Promise<string> {
		if (!file.type.startsWith('image/')) {
			toast.error('Sélectionnez une image.', 'Format invalide');
			throw new Error('Format invalide');
		}
		try {
			const blob = await compressImage(file, 1600);
			const result = await uploadToR2(blob, {
				filename: toUploadFilename(file.name, blob),
				folder: FOLDER
			});
			toast.success('Image insérée : cliquez dessus pour ajouter une légende.');
			return result.url;
		} catch (err) {
			toast.error(err instanceof Error ? err.message : String(err), 'Envoi interrompu');
			throw err;
		}
	}
</script>

<datalist id="article-categories">
	{#each suggestions as suggestion (suggestion)}
		<option value={suggestion}></option>
	{/each}
</datalist>

<form
	method="POST"
	{action}
	use:enhance={async ({ formData, cancel }) => {
		isSaving = true;
		if (coverFile && !coverKey) {
			try {
				const blob = await compressImage(coverFile, 2000);
				const result = await uploadToR2(blob, {
					filename: toUploadFilename(coverFile.name, blob),
					folder: FOLDER
				});
				coverKey = result.key;
			} catch (err) {
				toast.error(err instanceof Error ? err.message : String(err), 'Envoi interrompu');
				isSaving = false;
				cancel();
				return;
			}
		}
		formData.set('imageKey', coverKey);
		formData.set('content', content);
		return async ({ result, update }) => {
			isSaving = false;
			if (result.type === 'success') {
				toast.success(String(result.data?.message ?? 'Article enregistré.'));
			} else if (result.type === 'failure') {
				toast.error(String(result.data?.error ?? 'Une erreur est survenue.'), 'Erreur');
			}
			await update({ reset: false });
		};
	}}
	class="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]"
>
	<!-- Colonne principale : titre et texte -->
	<div class="space-y-5">
		<div>
			<label for="article-title" class="sr-only">Titre de l’article</label>
			<input
				id="article-title"
				name="title"
				required
				maxlength="255"
				value={article?.title ?? ''}
				placeholder="Titre de l’article"
				class="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 font-display text-2xl font-bold text-text-primary placeholder:text-gray-300 focus:border-brand-primary focus:outline-hidden"
			/>
		</div>

		<div class="overflow-hidden rounded-2xl border border-gray-200 bg-white">
			<!-- Onglets Écrire / Aperçu et barre de mise en forme -->
			<div
				class="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 bg-[#f8fafc] px-3 py-2"
			>
				<div class="flex rounded-xl bg-white p-1 shadow-2xs" role="tablist" aria-label="Mode">
					<button
						type="button"
						role="tab"
						aria-selected={mode === 'write'}
						onclick={() => (mode = 'write')}
						class="flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold {mode ===
						'write'
							? 'bg-brand-primary text-white'
							: 'text-text-secondary'}"
					>
						<PenLine size={14} /> Écrire
					</button>
					<button
						type="button"
						role="tab"
						aria-selected={mode === 'preview'}
						onclick={() => (mode = 'preview')}
						class="flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold {mode ===
						'preview'
							? 'bg-brand-primary text-white'
							: 'text-text-secondary'}"
					>
						<Eye size={14} /> Aperçu
					</button>
				</div>
			</div>

			<!-- L'éditeur reste monté pendant l'aperçu pour conserver l'historique d'annulation -->
			<div class:hidden={mode !== 'write'}>
				<RichTextEditor
					initial={initialDoc}
					onchange={(json) => (content = json)}
					uploadImage={uploadContentImage}
					canUploadImages={isR2Configured}
				/>
			</div>
			{#if mode === 'preview'}
				<div class="min-h-[420px] px-6 py-5">
					{#if content.trim()}
						<ArticleContent {content} />
					{:else}
						<p class="text-sm text-text-secondary">Rien à afficher pour l’instant.</p>
					{/if}
				</div>
			{/if}
			<div
				class="flex justify-between border-t border-gray-100 bg-[#f8fafc] px-4 py-2 text-[11px] text-text-secondary"
			>
				<span>{wordCount} mot{wordCount > 1 ? 's' : ''} · {readTime}</span>
				<span>Ctrl+B gras · Ctrl+I italique · Ctrl+K lien</span>
			</div>
		</div>

		<div>
			<label for="article-excerpt" class={labelClass}>Résumé (facultatif)</label>
			<textarea
				id="article-excerpt"
				name="excerpt"
				rows="2"
				maxlength="500"
				placeholder="Affiché sur les cartes d’articles. Laissé vide : début du texte."
				class={inputClass}>{article?.excerpt ?? ''}</textarea
			>
		</div>
	</div>

	<!-- Colonne latérale : publication, couverture, classement, auteur -->
	<aside class="space-y-5">
		<div class="rounded-2xl border border-gray-200 bg-white p-4">
			<p class="text-xs font-bold tracking-wider text-text-secondary uppercase">Publication</p>
			<label class="mt-3 flex items-center gap-2 text-sm font-semibold text-text-primary">
				<input
					type="checkbox"
					name="isPublished"
					bind:checked={isPublished}
					onchange={() => {
						if (!isPublished) isFeatured = false;
					}}
					class="h-4 w-4 rounded-sm"
				/>
				Publié sur le site
			</label>
			<label
				class="mt-2 flex items-center gap-2 text-sm font-semibold {isPublished
					? 'text-text-primary'
					: 'text-text-secondary opacity-60'}"
			>
				<input
					type="checkbox"
					name="isFeatured"
					bind:checked={isFeatured}
					disabled={!isPublished}
					class="h-4 w-4 rounded-sm"
				/>
				<Star size={14} class="text-amber-500" /> À la une des Actualités
			</label>
			<div class="mt-4">
				<Button type="submit" variant="primary" size="md" fullWidth disabled={isSaving}>
					{isSaving ? 'Enregistrement…' : submitLabel}
				</Button>
			</div>
		</div>

		<div class="rounded-2xl border border-gray-200 bg-white p-4">
			<p class="text-xs font-bold tracking-wider text-text-secondary uppercase">
				Image de couverture
			</p>
			<label
				class="mt-3 flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-gray-300 bg-[#f8fafc] text-center hover:border-brand-primary/60 {isR2Configured
					? ''
					: 'pointer-events-none opacity-50'}"
			>
				{#if shownCover}
					<img src={shownCover} alt="" class="aspect-video w-full object-cover" />
				{:else}
					<span class="flex flex-col items-center gap-1.5 p-6 text-xs text-text-secondary">
						<UploadCloud size={22} class="text-brand-primary" />
						Choisir une image (envoyée sur R2)
					</span>
				{/if}
				<input
					type="file"
					accept="image/jpeg,image/png,image/webp"
					class="sr-only"
					onchange={(e) => selectCover(e.currentTarget.files?.[0])}
				/>
			</label>
			{#if article?.imageUrl && !coverFile}
				<label class="mt-2 flex items-center gap-2 text-xs text-text-secondary">
					<input type="checkbox" name="removeImage" bind:checked={removeCover} class="h-4 w-4" />
					<Trash2 size={12} /> Retirer la couverture
				</label>
			{/if}
		</div>

		<div class="rounded-2xl border border-gray-200 bg-white p-4">
			<label
				for="article-event"
				class="flex items-center gap-1.5 text-xs font-bold tracking-wider text-text-secondary uppercase"
			>
				<CalendarDays size={14} class="text-brand-primary" /> Événement lié
			</label>
			<select id="article-event" name="eventId" class={inputClass}>
				<option value="" selected={!article?.eventId}>Aucun événement</option>
				{#each eventChoices as choice (choice.id)}
					<option value={choice.id} selected={article?.eventId === choice.id}>
						{choice.title}{choice.dateLabel ? ` — ${choice.dateLabel}` : ''}{choice.isPublished
							? ''
							: ' (brouillon)'}
					</option>
				{/each}
			</select>
			<p class="mt-1.5 text-[11px] text-text-secondary">
				L’article sera aussi présenté sur la page de cet événement, avec un lien vers lui.
			</p>
		</div>

		<div class="space-y-4 rounded-2xl border border-gray-200 bg-white p-4">
			<div>
				<label for="article-category" class={labelClass}>Catégorie *</label>
				<input
					id="article-category"
					name="category"
					list="article-categories"
					required
					maxlength="100"
					value={article?.category ?? ''}
					placeholder="Ex : Rapport de mission"
					class={inputClass}
				/>
			</div>
			<div>
				<label for="article-author" class={labelClass}>Auteur</label>
				<input
					id="article-author"
					name="authorName"
					maxlength="150"
					value={article?.authorName ?? ''}
					placeholder="Équipe ECOFIP"
					class={inputClass}
				/>
			</div>
			<div>
				<label for="article-author-role" class={labelClass}>Fonction de l’auteur</label>
				<input
					id="article-author-role"
					name="authorRole"
					maxlength="150"
					value={article?.authorRole ?? ''}
					placeholder="Ex : Département Évangélisation"
					class={inputClass}
				/>
			</div>
		</div>
	</aside>
</form>
