<script lang="ts">
	import { enhance } from '$app/forms';
	import {
		Plus,
		MapPin,
		Clock,
		Trash2,
		CheckCircle2,
		AlertCircle,
		Eye,
		EyeOff,
		X,
		Calendar,
		CalendarDays,
		Sparkles,
		Users,
		ListChecks
	} from '@lucide/svelte';
	import { ImagePicker } from '$lib';
	import { formatEventSchedule } from '$lib/utils/eventDate.js';
	import type { PageData, ActionData } from './$types.js';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let isCreateModalOpen = $state(false);
	let isSubmitting = $state(false);

	function getTodayDateString(): string {
		const today = new Date();
		const year = today.getFullYear();
		const month = String(today.getMonth() + 1).padStart(2, '0');
		const day = String(today.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	}

	let title = $state('');
	let category = $state('Croisade');
	let isSingleDay = $state(true);
	let isAllDay = $state(false);
	let startDate = $state(getTodayDateString());
	let endDate = $state(getTodayDateString());
	let startTime = $state('18:00');
	let endTime = $state('21:30');
	let location = $state('Douala, Cameroun');
	let description = $state('');
	let speakers = $state('');
	let program = $state('');
	let imageDataUrl = $state('');
	let isPublished = $state(true);
	let isFeatured = $state(false);

	// Aperçu dynamique calculé en temps réel
	let schedulePreview = $derived(
		startDate
			? formatEventSchedule({
					isSingleDay,
					startDateStr: startDate,
					endDateStr: isSingleDay ? undefined : endDate,
					startTimeStr: startTime,
					endTimeStr: endTime,
					isAllDay
				})
			: null
	);

	function handleStartDateChange() {
		if (endDate && endDate < startDate) {
			endDate = startDate;
		}
	}

	function resetForm() {
		title = '';
		category = 'Croisade';
		isSingleDay = true;
		isAllDay = false;
		startDate = getTodayDateString();
		endDate = getTodayDateString();
		startTime = '18:00';
		endTime = '21:30';
		location = 'Douala, Cameroun';
		description = '';
		speakers = '';
		program = '';
		imageDataUrl = '';
		isPublished = true;
		isFeatured = false;
	}
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
			onclick={() => {
				resetForm();
				isCreateModalOpen = true;
			}}
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
						class="flex h-16 min-w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-brand-primary px-2 text-white shadow-xs"
					>
						<span
							class="text-center font-display leading-none font-bold {ev.dateDay &&
							ev.dateDay.length > 4
								? 'text-xs'
								: 'text-xl'}">{ev.dateDay}</span
						>
						<span class="mt-0.5 text-center text-[9px] font-bold tracking-wider uppercase"
							>{ev.dateMonthYear}</span
						>
					</div>

					<!-- Image Miniature si disponible -->
					{#if ev.imageUrl}
						<div
							class="hidden h-16 w-24 shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-100 sm:block"
						>
							<img src={ev.imageUrl} alt={ev.title} class="h-full w-full object-cover" />
						</div>
					{/if}

					<!-- Infos -->
					<div>
						<div class="flex flex-wrap items-center gap-2">
							<span
								class="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-text-secondary"
							>
								{ev.category}
							</span>
							{#if ev.isFeatured}
								<span
									class="inline-flex items-center gap-1 rounded-md border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800"
								>
									<Sparkles size={11} class="fill-amber-400 text-amber-600" />
									<span>À la Une (Sous la Hero)</span>
								</span>
							{/if}
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
				<div
					class="flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3 md:border-0 md:pt-0"
				>
					<!-- Widget Switch pour Mettre en avant -->
					<form method="POST" action="?/toggleFeatured" use:enhance class="flex items-center">
						<input type="hidden" name="id" value={ev.id} />
						<input type="hidden" name="currentStatus" value={String(Boolean(ev.isFeatured))} />
						<button
							type="submit"
							role="switch"
							aria-checked={Boolean(ev.isFeatured)}
							class="group inline-flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all {ev.isFeatured
								? 'border-amber-300 bg-amber-50/80 text-amber-900 shadow-2xs'
								: 'border-gray-200 bg-white text-text-secondary hover:border-gray-300'}"
							title={ev.isFeatured ? 'Retirer de la mise en avant' : 'Mettre en avant sous la Hero'}
						>
							<!-- Switch pill track -->
							<span
								class="relative inline-flex h-4.5 w-8 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out {ev.isFeatured
									? 'bg-amber-500'
									: 'bg-gray-200'}"
							>
								<span
									class="inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out {ev.isFeatured
										? 'translate-x-4'
										: 'translate-x-0.5'}"
								></span>
							</span>
							<span class="flex items-center gap-1">
								<Sparkles
									size={12}
									class={ev.isFeatured ? 'fill-amber-400 text-amber-600' : 'text-gray-400'}
								/>
								<span>{ev.isFeatured ? 'À la Une' : 'Mettre en avant'}</span>
							</span>
						</button>
					</form>

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
		<div
			class="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl"
		>
			<div class="flex items-center justify-between border-b border-gray-100 pb-4">
				<div>
					<h3 class="font-display text-lg font-bold text-text-primary">
						Créer un nouvel événement
					</h3>
					<p class="text-xs text-text-secondary">
						Définissez la programmation temporelle et les informations de la mission.
					</p>
				</div>
				<button
					type="button"
					onclick={() => (isCreateModalOpen = false)}
					class="rounded-lg p-1.5 text-text-secondary hover:bg-gray-100"
				>
					<X size={18} />
				</button>
			</div>

			<!-- Message d'erreur éventuel -->
			{#if form?.error}
				<div
					class="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-800"
				>
					<AlertCircle size={16} class="shrink-0 text-red-600" />
					<span>{form.error}</span>
				</div>
			{/if}

			<form
				method="POST"
				action="?/create"
				use:enhance={() => {
					isSubmitting = true;
					return async ({ update, result }) => {
						isSubmitting = false;
						if (result.type === 'success') {
							isCreateModalOpen = false;
							resetForm();
						}
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

				<div>
					<label for="ev-cat" class="block font-semibold text-text-primary">Catégorie</label>
					<select
						id="ev-cat"
						name="category"
						bind:value={category}
						class="mt-1 h-10 w-full rounded-xl border border-border bg-white px-3 text-text-primary focus:border-brand-primary focus:outline-none"
					>
						<option value="Croisade">Croisade</option>
						<option value="Séminaire">Séminaire</option>
						<option value="Camp Jeunes">Camp Jeunes</option>
						<option value="Action Sociale">Action Sociale</option>
						<option value="Mission">Campagne Missionnaire</option>
					</select>
				</div>

				<!-- BLOC DATES & HORAIRES TYPÉS -->
				<div class="space-y-3 rounded-2xl border border-gray-200/90 bg-[#f8fafc] p-4">
					<div
						class="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200/60 pb-3"
					>
						<label
							class="flex cursor-pointer items-center gap-2 text-xs font-bold text-text-primary select-none"
						>
							<input
								type="checkbox"
								name="isSingleDay"
								bind:checked={isSingleDay}
								class="h-4 w-4 rounded text-brand-primary focus:ring-brand-primary"
							/>
							<CalendarDays size={15} class="text-brand-primary" />
							<span>Événement sur une seule journée</span>
						</label>

						<label
							class="flex cursor-pointer items-center gap-1.5 text-xs text-text-secondary select-none"
						>
							<input
								type="checkbox"
								name="isAllDay"
								bind:checked={isAllDay}
								class="h-4 w-4 rounded text-brand-primary focus:ring-brand-primary"
							/>
							<span>Toute la journée</span>
						</label>
					</div>

					{#if isSingleDay}
						<!-- RÈGLE 1 : UN SEUL JOUR -->
						<div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
							<div class="sm:col-span-1">
								<label for="ev-date" class="block font-semibold text-text-primary">
									Date du jour *
								</label>
								<input
									type="date"
									id="ev-date"
									name="startDate"
									bind:value={startDate}
									onchange={handleStartDateChange}
									required
									class="mt-1 h-10 w-full rounded-xl border border-border bg-white px-3 text-text-primary focus:border-brand-primary focus:outline-none"
								/>
							</div>

							<div>
								<label for="ev-start-time" class="block font-semibold text-text-primary">
									Heure de début {!isAllDay ? '*' : ''}
								</label>
								<input
									type="time"
									id="ev-start-time"
									name="startTime"
									bind:value={startTime}
									disabled={isAllDay}
									required={!isAllDay}
									class="mt-1 h-10 w-full rounded-xl border border-border bg-white px-3 text-text-primary focus:border-brand-primary focus:outline-none disabled:bg-gray-100 disabled:text-text-disabled"
								/>
							</div>

							<div>
								<label for="ev-end-time" class="block font-semibold text-text-primary">
									Heure de fin
								</label>
								<input
									type="time"
									id="ev-end-time"
									name="endTime"
									bind:value={endTime}
									disabled={isAllDay}
									class="mt-1 h-10 w-full rounded-xl border border-border bg-white px-3 text-text-primary focus:border-brand-primary focus:outline-none disabled:bg-gray-100 disabled:text-text-disabled"
								/>
							</div>
						</div>
					{:else}
						<!-- RÈGLE 2 : PLUSIEURS JOURS -->
						<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
							<div>
								<label for="ev-start-date" class="block font-semibold text-text-primary">
									Date de début *
								</label>
								<input
									type="date"
									id="ev-start-date"
									name="startDate"
									bind:value={startDate}
									onchange={handleStartDateChange}
									required
									class="mt-1 h-10 w-full rounded-xl border border-border bg-white px-3 text-text-primary focus:border-brand-primary focus:outline-none"
								/>
							</div>

							<div>
								<label for="ev-end-date" class="block font-semibold text-text-primary">
									Date de fin *
								</label>
								<input
									type="date"
									id="ev-end-date"
									name="endDate"
									bind:value={endDate}
									min={startDate}
									required
									class="mt-1 h-10 w-full rounded-xl border border-border bg-white px-3 text-text-primary focus:border-brand-primary focus:outline-none"
								/>
							</div>
						</div>

						<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
							<div>
								<label for="ev-start-time-multi" class="block font-semibold text-text-primary">
									Heure de début (quotidien) {!isAllDay ? '*' : ''}
								</label>
								<input
									type="time"
									id="ev-start-time-multi"
									name="startTime"
									bind:value={startTime}
									disabled={isAllDay}
									required={!isAllDay}
									class="mt-1 h-10 w-full rounded-xl border border-border bg-white px-3 text-text-primary focus:border-brand-primary focus:outline-none disabled:bg-gray-100 disabled:text-text-disabled"
								/>
							</div>

							<div>
								<label for="ev-end-time-multi" class="block font-semibold text-text-primary">
									Heure de fin (quotidien)
								</label>
								<input
									type="time"
									id="ev-end-time-multi"
									name="endTime"
									bind:value={endTime}
									disabled={isAllDay}
									class="mt-1 h-10 w-full rounded-xl border border-border bg-white px-3 text-text-primary focus:border-brand-primary focus:outline-none disabled:bg-gray-100 disabled:text-text-disabled"
								/>
							</div>
						</div>
					{/if}

					<!-- Aperçu dynamique interactif de la programmation -->
					{#if schedulePreview}
						<div
							class="mt-2 flex items-center gap-3 rounded-xl border border-brand-primary/20 bg-white p-3 shadow-2xs"
						>
							<div
								class="flex h-12 min-w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-brand-primary px-2.5 text-white shadow-xs"
							>
								<span
									class="font-display leading-none font-bold {schedulePreview.dateDay.length > 4
										? 'text-xs'
										: 'text-sm'}">{schedulePreview.dateDay}</span
								>
								<span class="mt-0.5 text-[8px] font-bold tracking-wider uppercase"
									>{schedulePreview.dateMonthYear}</span
								>
							</div>
							<div class="min-w-0 flex-1 text-xs">
								<div class="text-[10px] font-bold tracking-wider text-brand-primary uppercase">
									Aperçu calendrier
								</div>
								<div class="font-semibold text-text-primary">{schedulePreview.summaryText}</div>
							</div>
						</div>
					{/if}
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

				<!-- CHAMP SÉLECTION IMAGE DEPUIS L'APPAREIL AVEC PRÉVISUALISATION -->
				<ImagePicker
					id="ev-image"
					name="imageDataUrl"
					label="Photo / Affiche de l’événement (depuis votre appareil)"
					bind:value={imageDataUrl}
					helpText="Sélectionnez une affiche ou photo depuis vos fichiers (JPG, PNG, WebP)"
				/>

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

				<!-- CHAMP ORATEURS & INTERVENANTS (OPTIONNEL) -->
				<div>
					<div class="flex items-center justify-between">
						<label
							for="ev-speakers"
							class="flex items-center gap-1.5 text-xs font-semibold text-text-primary sm:text-sm"
						>
							<Users size={14} class="text-brand-primary" />
							<span>Orateurs & Intervenants</span>
							<span class="text-[11px] font-normal text-text-disabled">(Optionnel)</span>
						</label>
						<span class="text-[10px] text-text-disabled">Séparez par des virgules</span>
					</div>
					<input
						id="ev-speakers"
						name="speakers"
						type="text"
						bind:value={speakers}
						placeholder="Ex: Pasteur Valéry Tchamekwen, Évangéliste Paul, Chorale Hosanna"
						class="mt-1 h-10 w-full rounded-xl border border-border px-3 text-xs text-text-primary focus:border-brand-primary focus:outline-hidden sm:text-sm"
					/>
					<p class="mt-1 text-[11px] text-text-secondary">
						Affiché sur les fiches d'événements et dans la section Intervenants de la page détail.
					</p>
				</div>

				<!-- CHAMP ORGANISATION & DÉROULÉ (OPTIONNEL) -->
				<div>
					<div class="flex items-center justify-between">
						<label
							for="ev-program"
							class="flex items-center gap-1.5 text-xs font-semibold text-text-primary sm:text-sm"
						>
							<ListChecks size={14} class="text-brand-primary" />
							<span>Organisation & Déroulé de l'événement</span>
							<span class="text-[11px] font-normal text-text-disabled">(Optionnel)</span>
						</label>
						<span class="text-[10px] text-text-disabled">1 étape par ligne</span>
					</div>
					<textarea
						id="ev-program"
						name="program"
						bind:value={program}
						rows={3}
						placeholder="Ex:&#10;01. Accueil & Prière d'ouverture (17h30)&#10;02. Louange & Adoration vivante (18h00)&#10;03. Prédication de l'Évangile & Ministère pour les malades (19h30)&#10;04. Communion fraternelle & Distribution de bibles (21h00)"
						class="mt-1 w-full rounded-xl border border-border p-3 font-mono text-xs text-text-primary focus:border-brand-primary focus:outline-hidden"
					></textarea>
					<p class="mt-1 text-[11px] text-text-secondary">
						Chaque ligne sera automatiquement mise en forme comme étape numérotée dans le programme
						de la page détail.
					</p>
				</div>

				<!-- WIDGET SWITCH : METTRE EN AVANT SOUS LA HERO -->
				<div
					class="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 transition-colors"
				>
					<div class="flex items-center gap-3">
						<div
							class="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700"
						>
							<Sparkles size={16} />
						</div>
						<div>
							<span class="block text-xs font-bold text-amber-950">
								Mettre en avant sous la Hero Section
							</span>
							<span class="block text-[11px] text-amber-800">
								Occupe toute la largeur d’écran avec affiche grand format et compte à rebours
							</span>
						</div>
					</div>

					<label class="relative inline-flex cursor-pointer items-center select-none">
						<input
							type="checkbox"
							name="isFeatured"
							bind:checked={isFeatured}
							class="peer sr-only"
						/>
						<div
							class="h-6 w-11 rounded-full bg-gray-200 transition-colors peer-checked:bg-amber-500 peer-focus:outline-hidden after:absolute after:top-0.5 after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-xs after:transition-all after:content-[''] peer-checked:after:translate-x-full"
						></div>
					</label>
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
