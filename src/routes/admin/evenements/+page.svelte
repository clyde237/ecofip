<script lang="ts">
	import { enhance } from '$app/forms';
	import { Plus, MapPin, Clock, Trash2, CheckCircle2, Eye, EyeOff, X } from '@lucide/svelte';
	import type { PageData, ActionData } from './$types.js';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let isCreateModalOpen = $state(false);
	let isSubmitting = $state(false);

	let title = $state('');
	let category = $state('Croisade');
	let dateDay = $state('15');
	let dateMonthYear = $state('NOV 2026');
	let time = $state('18h00 – 21h30');
	let location = $state('Douala, Cameroun');
	let description = $state('');
	let isPublished = $state(true);
</script>

<div class="mx-auto max-w-7xl space-y-6">
	<!-- En-tête -->
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h1 class="font-display text-2xl font-bold text-text-primary sm:text-3xl">
				Événements & Projets
			</h1>
			<p class="mt-1 text-sm text-text-secondary">
				Créez et publiez les événements, séminaires et rassemblements de réveil.
			</p>
		</div>

		<button
			type="button"
			onclick={() => (isCreateModalOpen = true)}
			class="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-brand-primary-hover hover:shadow-md sm:text-sm"
		>
			<Plus size={16} />
			<span>Créer un événement</span>
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

	<!-- Liste des événements -->
	<div class="space-y-4">
		{#each data.events as ev (ev.id)}
			<div
				class="flex flex-col gap-4 rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs transition-all hover:border-gray-300 md:flex-row md:items-center md:justify-between"
			>
				<div class="flex items-start gap-4">
					<!-- Date Pill -->
					<div
						class="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-brand-primary text-white shadow-xs"
					>
						<span class="font-display text-xl leading-none font-bold">{ev.dateDay}</span>
						<span class="mt-0.5 text-[9px] font-bold tracking-wider uppercase"
							>{ev.dateMonthYear}</span
						>
					</div>

					<!-- Infos -->
					<div>
						<div class="flex flex-wrap items-center gap-2">
							<span
								class="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-text-secondary"
							>
								{ev.category}
							</span>
							{#if ev.isPublished}
								<span
									class="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700"
								>
									Publié sur le site
								</span>
							{:else}
								<span
									class="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-text-disabled"
								>
									Brouillon (Non publié)
								</span>
							{/if}
						</div>

						<h3 class="mt-1.5 font-display text-base font-bold text-text-primary">
							{ev.title}
						</h3>

						<div class="mt-1 flex flex-wrap items-center gap-4 text-xs text-text-secondary">
							<span class="flex items-center gap-1">
								<MapPin size={12} class="text-text-disabled" />
								{ev.location}
							</span>
							{#if ev.time}
								<span class="flex items-center gap-1">
									<Clock size={12} class="text-text-disabled" />
									{ev.time}
								</span>
							{/if}
						</div>
					</div>
				</div>

				<!-- Actions -->
				<div class="flex items-center gap-2 border-t border-gray-100 pt-3 md:border-0 md:pt-0">
					<!-- Basculer statut de publication -->
					<form method="POST" action="?/togglePublish" use:enhance>
						<input type="hidden" name="id" value={ev.id} />
						<input type="hidden" name="currentStatus" value={String(ev.isPublished)} />
						<button
							type="submit"
							class="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors {ev.isPublished
								? 'border-gray-200 bg-white text-text-secondary hover:border-gray-300'
								: 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'}"
						>
							{#if ev.isPublished}
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
						<input type="hidden" name="id" value={ev.id} />
						<button
							type="submit"
							onclick={(e) => {
								if (!confirm('Supprimer cet événement ?')) e.preventDefault();
							}}
							class="cursor-pointer rounded-lg p-2 text-text-disabled transition-colors hover:bg-red-50 hover:text-brand-primary"
							title="Supprimer l'événement"
						>
							<Trash2 size={16} />
						</button>
					</form>
				</div>
			</div>
		{/each}
	</div>
</div>

<!-- Modale de création d'événement -->
{#if isCreateModalOpen}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
		role="dialog"
		aria-modal="true"
	>
		<div class="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl">
			<div class="flex items-center justify-between border-b border-gray-100 pb-4">
				<h3 class="font-display text-lg font-bold text-text-primary">Créer un nouvel événement</h3>
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
					<label for="ev-title" class="block font-semibold text-text-primary"
						>Titre de l’événement *</label
					>
					<input
						id="ev-title"
						name="title"
						bind:value={title}
						required
						placeholder="Ex: Croisade de Réveil Spirituel"
						class="mt-1 h-10 w-full rounded-xl border border-border px-3 text-text-primary focus:border-brand-primary focus:outline-none"
					/>
				</div>

				<div class="grid grid-cols-2 gap-3">
					<div>
						<label for="ev-cat" class="block font-semibold text-text-primary">Catégorie</label>
						<select
							id="ev-cat"
							name="category"
							bind:value={category}
							class="mt-1 h-10 w-full rounded-xl border border-border px-3 text-text-primary focus:border-brand-primary focus:outline-none"
						>
							<option value="Croisade">Croisade</option>
							<option value="Séminaire">Séminaire</option>
							<option value="Camp Jeunes">Camp Jeunes</option>
							<option value="Action Sociale">Action Sociale</option>
						</select>
					</div>

					<div>
						<label for="ev-day" class="block font-semibold text-text-primary">Jour (Ex: 15)</label>
						<input
							id="ev-day"
							name="dateDay"
							bind:value={dateDay}
							placeholder="15"
							class="mt-1 h-10 w-full rounded-xl border border-border px-3 text-text-primary focus:border-brand-primary focus:outline-none"
						/>
					</div>
				</div>

				<div class="grid grid-cols-2 gap-3">
					<div>
						<label for="ev-month" class="block font-semibold text-text-primary">Mois & Année</label>
						<input
							id="ev-month"
							name="dateMonthYear"
							bind:value={dateMonthYear}
							placeholder="NOV 2026"
							class="mt-1 h-10 w-full rounded-xl border border-border px-3 text-text-primary focus:border-brand-primary focus:outline-none"
						/>
					</div>

					<div>
						<label for="ev-time" class="block font-semibold text-text-primary">Horaires</label>
						<input
							id="ev-time"
							name="time"
							bind:value={time}
							placeholder="18h00 – 21h30"
							class="mt-1 h-10 w-full rounded-xl border border-border px-3 text-text-primary focus:border-brand-primary focus:outline-none"
						/>
					</div>
				</div>

				<div>
					<label for="ev-location" class="block font-semibold text-text-primary"
						>Lieu de l’événement *</label
					>
					<input
						id="ev-location"
						name="location"
						bind:value={location}
						required
						placeholder="Ex: Douala, Cameroun"
						class="mt-1 h-10 w-full rounded-xl border border-border px-3 text-text-primary focus:border-brand-primary focus:outline-none"
					/>
				</div>

				<div>
					<label for="ev-desc" class="block font-semibold text-text-primary">Description</label>
					<textarea
						id="ev-desc"
						name="description"
						bind:value={description}
						rows={2}
						placeholder="Présentation des temps forts..."
						class="mt-1 w-full rounded-xl border border-border p-3 text-text-primary focus:border-brand-primary focus:outline-none"
					></textarea>
				</div>

				<div class="flex items-center gap-2 pt-1">
					<input
						id="ev-published"
						name="isPublished"
						type="checkbox"
						bind:checked={isPublished}
						class="h-4 w-4 rounded text-brand-primary focus:ring-brand-primary"
					/>
					<label for="ev-published" class="text-xs font-semibold text-text-primary">
						Publier immédiatement sur le site
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
						{isSubmitting ? 'Enregistrement...' : 'Créer l’événement'}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
