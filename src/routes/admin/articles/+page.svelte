<script lang="ts">
	import { enhance } from '$app/forms';
	import { Plus, Newspaper, Clock, Trash2, CheckCircle2, Eye, EyeOff, X } from '@lucide/svelte';
	import type { PageData, ActionData } from './$types.js';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let isCreateModalOpen = $state(false);
	let isSubmitting = $state(false);

	let title = $state('');
	let category = $state('Mission');
	let excerpt = $state('');
	let content = $state('');
	let readTime = $state('4 min');
	let isPublished = $state(true);
</script>

<div class="mx-auto max-w-7xl space-y-6">
	<!-- En-tête -->
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h1 class="font-display text-2xl font-bold text-text-primary sm:text-3xl">
				Articles & Actualités
			</h1>
			<p class="mt-1 text-sm text-text-secondary">
				Rédigez, modifiez et publiez les articles et nouvelles de la mission ECOFIP.
			</p>
		</div>

		<button
			type="button"
			onclick={() => (isCreateModalOpen = true)}
			class="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-brand-primary-hover hover:shadow-md sm:text-sm"
		>
			<Plus size={16} />
			<span>Rédiger un article</span>
		</button>
	</div>

	<!-- Message de retour -->
	{#if form?.message}
		<div
			class="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-800"
		>
			<CheckCircle2 size={16} class="text-emerald-600" />
			<span>{form.message}</span>
		</div>
	{/if}

	<!-- Liste des articles -->
	<div class="space-y-4">
		{#each data.articles as art (art.id)}
			<div
				class="flex flex-col gap-4 rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs transition-all hover:border-gray-300 sm:flex-row sm:items-center sm:justify-between"
			>
				<div class="flex items-start gap-4">
					<!-- Thumbnail -->
					<div
						class="h-16 w-24 shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-100"
					>
						{#if art.imageUrl}
							<img src={art.imageUrl} alt={art.title} class="h-full w-full object-cover" />
						{:else}
							<div class="flex h-full w-full items-center justify-center text-text-disabled">
								<Newspaper size={20} />
							</div>
						{/if}
					</div>

					<!-- Infos -->
					<div>
						<div class="flex flex-wrap items-center gap-2">
							<span
								class="rounded-md bg-red-50 px-2 py-0.5 text-[10px] font-bold text-brand-primary"
							>
								{art.category}
							</span>
							{#if art.isPublished}
								<span
									class="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700"
								>
									Publié
								</span>
							{:else}
								<span
									class="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-text-disabled"
								>
									Brouillon
								</span>
							{/if}
							<span class="flex items-center gap-1 text-[11px] text-text-disabled">
								<Clock size={11} />
								{art.readTime || '3 min'}
							</span>
						</div>

						<h3 class="mt-1 font-display text-base font-bold text-text-primary">
							{art.title}
						</h3>

						{#if art.excerpt}
							<p class="mt-0.5 line-clamp-1 max-w-xl text-xs text-text-secondary">
								{art.excerpt}
							</p>
						{/if}
					</div>
				</div>

				<!-- Actions -->
				<div class="flex items-center gap-2 border-t border-gray-100 pt-3 sm:border-0 sm:pt-0">
					<!-- Basculer statut de publication -->
					<form method="POST" action="?/togglePublish" use:enhance>
						<input type="hidden" name="id" value={art.id} />
						<input type="hidden" name="currentStatus" value={String(art.isPublished)} />
						<button
							type="submit"
							class="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors {art.isPublished
								? 'border-gray-200 bg-white text-text-secondary hover:border-gray-300'
								: 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'}"
						>
							{#if art.isPublished}
								<EyeOff size={13} />
								<span>Dépublier</span>
							{:else}
								<Eye size={13} />
								<span>Publier</span>
							{/if}
						</button>
					</form>

					<!-- Supprimer -->
					<form method="POST" action="?/delete" use:enhance>
						<input type="hidden" name="id" value={art.id} />
						<button
							type="submit"
							onclick={(e) => {
								if (!confirm('Supprimer cet article ?')) e.preventDefault();
							}}
							class="cursor-pointer rounded-lg p-2 text-text-disabled transition-colors hover:bg-red-50 hover:text-brand-primary"
							title="Supprimer l'article"
						>
							<Trash2 size={16} />
						</button>
					</form>
				</div>
			</div>
		{/each}
	</div>
</div>

<!-- Modale de rédaction d'article -->
{#if isCreateModalOpen}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
		role="dialog"
		aria-modal="true"
	>
		<div class="w-full max-w-xl rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl">
			<div class="flex items-center justify-between border-b border-gray-100 pb-4">
				<h3 class="font-display text-lg font-bold text-text-primary">Rédiger un nouvel article</h3>
				<button
					type="button"
					onclick={() => (isCreateModalOpen = false)}
					class="rounded-lg p-1.5 text-text-secondary hover:bg-gray-100"
				>
					<X size={18} />
				</button>
			</div>

			<form
				method="POST"
				action="?/create"
				use:enhance={() => {
					isSubmitting = true;
					return async ({ update }) => {
						isSubmitting = false;
						isCreateModalOpen = false;
						await update();
					};
				}}
				class="mt-5 space-y-4 text-xs sm:text-sm"
			>
				<div>
					<label for="art-title" class="block font-semibold text-text-primary"
						>Titre de l’article *</label
					>
					<input
						id="art-title"
						name="title"
						bind:value={title}
						required
						placeholder="Ex: Impact de la mission au Nord-Cameroun"
						class="mt-1 h-10 w-full rounded-xl border border-border px-3 text-text-primary focus:border-brand-primary focus:outline-none"
					/>
				</div>

				<div class="grid grid-cols-2 gap-3">
					<div>
						<label for="art-cat" class="block font-semibold text-text-primary">Catégorie</label>
						<select
							id="art-cat"
							name="category"
							bind:value={category}
							class="mt-1 h-10 w-full rounded-xl border border-border px-3 text-text-primary focus:border-brand-primary focus:outline-none"
						>
							<option value="Mission">Mission</option>
							<option value="Témoignage">Témoignage</option>
							<option value="Évangélisation">Évangélisation</option>
							<option value="Enseignement">Enseignement</option>
						</select>
					</div>

					<div>
						<label for="art-time" class="block font-semibold text-text-primary"
							>Temps de lecture</label
						>
						<input
							id="art-time"
							name="readTime"
							bind:value={readTime}
							placeholder="4 min"
							class="mt-1 h-10 w-full rounded-xl border border-border px-3 text-text-primary focus:border-brand-primary focus:outline-none"
						/>
					</div>
				</div>

				<div>
					<label for="art-excerpt" class="block font-semibold text-text-primary"
						>Bref résumé / Accroche</label
					>
					<input
						id="art-excerpt"
						name="excerpt"
						bind:value={excerpt}
						placeholder="Court aperçu de l'article pour les cartes..."
						class="mt-1 h-10 w-full rounded-xl border border-border px-3 text-text-primary focus:border-brand-primary focus:outline-none"
					/>
				</div>

				<div>
					<label for="art-content" class="block font-semibold text-text-primary"
						>Corps de l'article *</label
					>
					<textarea
						id="art-content"
						name="content"
						bind:value={content}
						required
						rows={4}
						placeholder="Rédigez le contenu complet de votre article..."
						class="mt-1 w-full rounded-xl border border-border p-3 text-text-primary focus:border-brand-primary focus:outline-none"
					></textarea>
				</div>

				<div class="flex items-center gap-2 pt-1">
					<input
						id="art-published"
						name="isPublished"
						type="checkbox"
						bind:checked={isPublished}
						class="h-4 w-4 rounded text-brand-primary focus:ring-brand-primary"
					/>
					<label for="art-published" class="text-xs font-semibold text-text-primary">
						Publier immédiatement sur la page d'accueil
					</label>
				</div>

				<div class="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
					<button
						type="button"
						onclick={() => (isCreateModalOpen = false)}
						class="rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-text-secondary hover:bg-gray-50"
					>
						Annuler
					</button>
					<button
						type="submit"
						disabled={isSubmitting}
						class="rounded-xl bg-brand-primary px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-brand-primary-hover disabled:opacity-50"
					>
						{isSubmitting ? 'Enregistrement...' : 'Enregistrer l’article'}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
