<script lang="ts">
	import { enhance } from '$app/forms';
	import {
		Plus,
		MapPin,
		Clock,
		Trash2,
		X,
		CalendarDays,
		Sparkles,
		Users,
		ListChecks,
		MoreVertical,
		ExternalLink,
		Pencil,
		Search,
		RotateCcw,
		ChevronLeft,
		ChevronRight,
		Ticket
	} from '@lucide/svelte';
	import { ImagePicker } from '$lib';
	import { toast } from '$lib/design-system/toast.svelte.js';
	import { isAbortError } from '$lib/utils/r2Upload.js';
	import {
		draftsFromStored,
		releaseDraftPreviews,
		serializeMerchandise,
		uploadMerchandiseImages,
		type MerchandiseDraft
	} from '$lib/utils/eventMerchandise.js';
	import EventMerchandiseEditor from './EventMerchandiseEditor.svelte';
	import { formatEventSchedule, toCameroonDateString } from '$lib/utils/eventDate.js';
	import type { PageData, ActionData } from './$types.js';

	let { data }: { data: PageData; form: ActionData } = $props();

	let isCreateModalOpen = $state(false);
	let isEditModalOpen = $state(false);
	let isDeleteModalOpen = $state(false);

	let isSubmitting = $state(false);
	let isEditSubmitting = $state(false);
	let isDeleteSubmitting = $state(false);

	let openMenuId = $state<number | null>(null);
	let eventToDelete = $state<(typeof data.events)[number] | null>(null);

	// ==========================================
	// ÉTAT RECHERCHE, FILTRES & PAGINATION (15/PAGE)
	// ==========================================
	let searchQuery = $state('');
	let categoryFilter = $state('all');
	let publicationFilter = $state('all');
	let featuredFilter = $state('all');
	let currentPage = $state(1);
	const pageSize = 15;

	let hasActiveFilters = $derived(
		searchQuery.trim().length > 0 ||
			categoryFilter !== 'all' ||
			publicationFilter !== 'all' ||
			featuredFilter !== 'all'
	);

	function resetFilters() {
		searchQuery = '';
		categoryFilter = 'all';
		publicationFilter = 'all';
		featuredFilter = 'all';
		currentPage = 1;
	}

	let filteredEvents = $derived(
		data.events.filter((ev) => {
			// 1. Recherche textuelle
			if (searchQuery.trim().length > 0) {
				const q = searchQuery.toLowerCase().trim();
				const matchTitle = (ev.title || '').toLowerCase().includes(q);
				const matchLocation = (ev.location || '').toLowerCase().includes(q);
				const matchCategory = (ev.category || '').toLowerCase().includes(q);
				const matchSpeakers = (ev.speakers || '').toLowerCase().includes(q);
				const matchDescription = (ev.description || '').toLowerCase().includes(q);
				if (
					!matchTitle &&
					!matchLocation &&
					!matchCategory &&
					!matchSpeakers &&
					!matchDescription
				) {
					return false;
				}
			}

			// 2. Filtre par Catégorie
			if (categoryFilter !== 'all' && ev.category !== categoryFilter) {
				return false;
			}

			// 3. Filtre par Statut de Publication
			if (publicationFilter === 'published' && !ev.isPublished) {
				return false;
			}
			if (publicationFilter === 'draft' && ev.isPublished) {
				return false;
			}

			// 4. Filtre par Mise en avant (Hero)
			if (featuredFilter === 'featured' && !ev.isFeatured) {
				return false;
			}
			if (featuredFilter === 'not_featured' && ev.isFeatured) {
				return false;
			}

			return true;
		})
	);

	let totalPages = $derived(Math.max(1, Math.ceil(filteredEvents.length / pageSize)));

	let paginatedEvents = $derived(
		filteredEvents.slice((currentPage - 1) * pageSize, currentPage * pageSize)
	);

	function goToPage(p: number) {
		if (p >= 1 && p <= totalPages) {
			currentPage = p;
		}
	}

	function getTodayDateString(): string {
		return toCameroonDateString(new Date());
	}

	function toDateInputValue(d: unknown): string {
		if (!d) return getTodayDateString();
		if (d instanceof Date && !isNaN(d.getTime())) {
			return toCameroonDateString(d);
		}
		if (typeof d === 'string') {
			if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
			const parsed = new Date(d);
			if (!isNaN(parsed.getTime())) {
				return toCameroonDateString(parsed);
			}
		}
		return getTodayDateString();
	}

	function parseTimeString(timeStr?: string | null): string {
		if (!timeStr) return '';
		if (/^\d{2}:\d{2}$/.test(timeStr)) return timeStr;
		const match = timeStr.match(/(\d{1,2})h(\d{2})?/i);
		if (match) {
			const m = match[2] || '00';
			return `${match[1].padStart(2, '0')}:${m}`;
		}
		return '';
	}

	// ==========================================
	// ÉTAT DU FORMULAIRE DE CRÉATION
	// ==========================================
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
	let registrationEnabled = $state(true);
	let merchItems = $state<MerchandiseDraft[]>([]);
	let merchWhatsapp = $state('');
	// Envoi des images de gadgets en cours, interrompu si le formulaire est fermé
	let createUpload: AbortController | null = null;

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

	function resetCreateForm() {
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
		registrationEnabled = true;
		releaseDraftPreviews(merchItems);
		merchItems = [];
		merchWhatsapp = '';
	}

	function closeCreateModal() {
		createUpload?.abort();
		createUpload = null;
		isSubmitting = false;
		isCreateModalOpen = false;
	}

	// ==========================================
	// ÉTAT DU FORMULAIRE DE MODIFICATION
	// ==========================================
	let editingId = $state<number | null>(null);
	let editTitle = $state('');
	let editCategory = $state('Croisade');
	let editIsSingleDay = $state(true);
	let editIsAllDay = $state(false);
	let editStartDate = $state(getTodayDateString());
	let editEndDate = $state(getTodayDateString());
	let editStartTime = $state('18:00');
	let editEndTime = $state('21:30');
	let editLocation = $state('');
	let editDescription = $state('');
	let editSpeakers = $state('');
	let editProgram = $state('');
	let editImageDataUrl = $state('');
	let editIsPublished = $state(true);
	let editIsFeatured = $state(false);
	let editRegistrationEnabled = $state(true);
	let editMerchItems = $state<MerchandiseDraft[]>([]);
	let editMerchWhatsapp = $state('');
	let editUpload: AbortController | null = null;

	function closeEditModal() {
		editUpload?.abort();
		editUpload = null;
		isEditSubmitting = false;
		isEditModalOpen = false;
		releaseDraftPreviews(editMerchItems);
	}

	let editSchedulePreview = $derived(
		editStartDate
			? formatEventSchedule({
					isSingleDay: editIsSingleDay,
					startDateStr: editStartDate,
					endDateStr: editIsSingleDay ? undefined : editEndDate,
					startTimeStr: editStartTime,
					endTimeStr: editEndTime,
					isAllDay: editIsAllDay
				})
			: null
	);

	function handleEditStartDateChange() {
		if (editEndDate && editEndDate < editStartDate) {
			editEndDate = editStartDate;
		}
	}

	function openEditModal(ev: (typeof data.events)[number]) {
		editingId = ev.id;
		editTitle = ev.title;
		editCategory = ev.category || 'Croisade';
		editIsSingleDay = ev.isSingleDay ?? true;
		editIsAllDay = ev.isAllDay ?? false;
		editStartDate = toDateInputValue(ev.startDate || ev.eventDate);
		editEndDate = toDateInputValue(ev.endDate || ev.eventDate || ev.startDate);
		editStartTime = ev.startTime || parseTimeString(ev.time) || '18:00';
		editEndTime =
			ev.endTime || parseTimeString(ev.time?.split('–')[1] || ev.time?.split('-')[1]) || '21:30';
		editLocation = ev.location || '';
		editDescription = ev.description || '';
		editSpeakers = ev.speakers || '';
		editProgram = ev.program || '';
		editImageDataUrl = ev.imageUrl || '';
		editIsPublished = Boolean(ev.isPublished);
		editIsFeatured = Boolean(ev.isFeatured);
		editRegistrationEnabled = ev.registrationEnabled ?? true;
		editMerchItems = draftsFromStored(ev.merchandise);
		editMerchWhatsapp = ev.merchandiseWhatsapp ? `+${ev.merchandiseWhatsapp}` : '';
		openMenuId = null;
		isEditModalOpen = true;
	}

	function openDeleteModal(ev: (typeof data.events)[number]) {
		eventToDelete = ev;
		openMenuId = null;
		isDeleteModalOpen = true;
	}

	function toggleMenu(id: number, event: MouseEvent) {
		event.stopPropagation();
		openMenuId = openMenuId === id ? null : id;
	}
</script>

<svelte:window
	onclick={() => {
		openMenuId = null;
	}}
	onkeydown={(e) => {
		if (e.key === 'Escape') {
			openMenuId = null;
			if (isCreateModalOpen) closeCreateModal();
			if (isEditModalOpen) closeEditModal();
			if (isDeleteModalOpen) isDeleteModalOpen = false;
		}
	}}
/>

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
				resetCreateForm();
				isCreateModalOpen = true;
			}}
			class="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-brand-primary-hover hover:shadow-md sm:text-sm"
		>
			<Plus size={16} />
			<span>Créer un événement</span>
		</button>
	</div>

	<!-- Tableau des événements avec barre de recherche, filtres et pagination -->
	<div class="overflow-hidden rounded-3xl border border-gray-200/80 bg-white shadow-xs">
		<!-- Barre d'outils du tableau -->
		<div class="space-y-4 border-b border-gray-100 p-5">
			<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div class="flex items-center gap-2">
					<CalendarDays size={18} class="text-brand-primary" />
					<h2 class="font-display text-base font-bold text-text-primary sm:text-lg">
						Liste des événements ({filteredEvents.length} / {data.events.length})
					</h2>
				</div>

				<!-- Barre de recherche -->
				<div class="relative w-full sm:w-80">
					<Search size={15} class="absolute top-1/2 left-3.5 -translate-y-1/2 text-gray-400" />
					<input
						type="search"
						placeholder="Rechercher par titre, lieu, orateur..."
						bind:value={searchQuery}
						oninput={() => (currentPage = 1)}
						class="h-9 w-full rounded-xl border border-gray-200 bg-[#f8fafc] pr-9 pl-9 text-xs text-text-primary placeholder:text-gray-400 focus:border-brand-primary focus:bg-white focus:outline-hidden sm:text-sm"
					/>
					{#if searchQuery}
						<button
							type="button"
							onclick={() => {
								searchQuery = '';
								currentPage = 1;
							}}
							class="absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600"
							aria-label="Effacer la recherche"
						>
							<X size={14} />
						</button>
					{/if}
				</div>
			</div>

			<!-- Rangée de Filtres -->
			<div class="flex flex-wrap items-center gap-3 pt-1">
				<!-- Filtre Catégorie -->
				<div class="flex items-center gap-1.5">
					<span class="text-[11px] font-bold text-text-secondary uppercase">Catégorie :</span>
					<select
						bind:value={categoryFilter}
						onchange={() => (currentPage = 1)}
						class="h-8 rounded-lg border border-gray-200 bg-[#f8fafc] px-2.5 text-xs font-semibold text-text-primary focus:border-brand-primary focus:bg-white focus:outline-hidden"
					>
						<option value="all">Toutes les catégories</option>
						<option value="Croisade">Croisade</option>
						<option value="Séminaire">Séminaire</option>
						<option value="Camp Jeunes">Camp Jeunes</option>
						<option value="Action Sociale">Action Sociale</option>
						<option value="Mission">Campagne Missionnaire</option>
					</select>
				</div>

				<!-- Filtre Statut Publication -->
				<div class="flex items-center gap-1.5">
					<span class="text-[11px] font-bold text-text-secondary uppercase">Publication :</span>
					<select
						bind:value={publicationFilter}
						onchange={() => (currentPage = 1)}
						class="h-8 rounded-lg border border-gray-200 bg-[#f8fafc] px-2.5 text-xs font-semibold text-text-primary focus:border-brand-primary focus:bg-white focus:outline-hidden"
					>
						<option value="all">Tous les statuts</option>
						<option value="published">Publiés sur le site</option>
						<option value="draft">Brouillons (Non publiés)</option>
					</select>
				</div>

				<!-- Filtre À la Une -->
				<div class="flex items-center gap-1.5">
					<span class="text-[11px] font-bold text-text-secondary uppercase">Hero :</span>
					<select
						bind:value={featuredFilter}
						onchange={() => (currentPage = 1)}
						class="h-8 rounded-lg border border-gray-200 bg-[#f8fafc] px-2.5 text-xs font-semibold text-text-primary focus:border-brand-primary focus:bg-white focus:outline-hidden"
					>
						<option value="all">Toutes</option>
						<option value="featured">À la Une (Hero) uniquement</option>
						<option value="not_featured">Non mis en avant</option>
					</select>
				</div>

				<!-- Bouton réinitialiser -->
				{#if hasActiveFilters}
					<button
						type="button"
						onclick={resetFilters}
						class="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-semibold text-text-secondary transition-colors hover:bg-gray-50 hover:text-brand-primary"
					>
						<RotateCcw size={12} />
						<span>Réinitialiser les filtres</span>
					</button>
				{/if}
			</div>
		</div>

		<!-- Tableau responsive -->
		<div class="overflow-x-auto">
			<table class="w-full text-left text-xs sm:text-sm">
				<thead
					class="border-b border-gray-100 bg-gray-50/80 text-[11px] font-bold text-text-secondary uppercase"
				>
					<tr>
						<th class="px-5 py-3.5">Date</th>
						<th class="px-5 py-3.5">Événement & Lieu</th>
						<th class="px-5 py-3.5">Catégorie</th>
						<th class="px-5 py-3.5 text-center">À la Une (Hero)</th>
						<th class="px-5 py-3.5 text-center">Publication</th>
						<th class="px-5 py-3.5 text-right">Actions</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-100">
					{#if paginatedEvents.length === 0}
						<tr>
							<td colspan="6" class="py-12 text-center text-text-secondary">
								{#if hasActiveFilters}
									<p class="font-semibold">Aucun événement ne correspond à vos filtres.</p>
									<button
										type="button"
										onclick={resetFilters}
										class="mt-2 cursor-pointer text-xs font-bold text-brand-primary hover:underline"
									>
										Réinitialiser les filtres
									</button>
								{:else}
									<p class="font-semibold">Aucun événement enregistré pour le moment.</p>
									<button
										type="button"
										onclick={() => {
											resetCreateForm();
											isCreateModalOpen = true;
										}}
										class="mt-2 inline-flex cursor-pointer items-center gap-1 text-xs font-bold text-brand-primary hover:underline"
									>
										<Plus size={14} />
										<span>Créer le premier événement</span>
									</button>
								{/if}
							</td>
						</tr>
					{:else}
						{#each paginatedEvents as ev (ev.id)}
							<tr class="transition-colors hover:bg-gray-50/60">
								<!-- 1. Colonne Date Pill -->
								<td class="px-5 py-3.5 whitespace-nowrap">
									<div
										class="flex h-12 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-brand-primary px-1.5 text-white shadow-xs"
									>
										<span
											class="text-center font-display leading-none font-bold {ev.dateDay &&
											ev.dateDay.length > 4
												? 'text-[11px]'
												: 'text-base'}">{ev.dateDay || '—'}</span
										>
										<span class="mt-0.5 text-center text-[8px] font-bold tracking-wider uppercase"
											>{ev.dateMonthYear || ''}</span
										>
									</div>
								</td>

								<!-- 2. Colonne Événement & Lieu -->
								<td class="px-5 py-3.5">
									<div class="flex items-center gap-3">
										{#if ev.imageUrl}
											<div
												class="h-11 w-14 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-100"
											>
												<img src={ev.imageUrl} alt={ev.title} class="h-full w-full object-cover" />
											</div>
										{/if}
										<div class="max-w-md min-w-0">
											<a
												href="/nos-evenements/{ev.slug || ev.id}"
												target="_blank"
												rel="noopener noreferrer"
												class="group/title inline-flex items-center gap-1.5 font-display text-xs font-bold text-text-primary transition-colors hover:text-brand-primary sm:text-sm"
												title="Voir la page détail"
											>
												<span class="truncate">{ev.title}</span>
												<ExternalLink
													size={12}
													class="shrink-0 text-text-disabled group-hover/title:text-brand-primary"
												/>
											</a>
											<div
												class="mt-0.5 flex flex-wrap items-center gap-3 text-[11px] text-text-secondary"
											>
												<span class="flex items-center gap-1">
													<MapPin size={11} class="text-text-disabled" />
													<span class="max-w-[200px] truncate">{ev.location}</span>
												</span>
												{#if ev.time}
													<span class="flex items-center gap-1">
														<Clock size={11} class="text-text-disabled" />
														<span>{ev.time}</span>
													</span>
												{/if}
											</div>
										</div>
									</div>
								</td>

								<!-- 3. Colonne Catégorie -->
								<td class="px-5 py-3.5 whitespace-nowrap">
									<span
										class="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-semibold text-text-secondary"
									>
										{ev.category}
									</span>
								</td>

								<!-- 4. Colonne À la Une (Hero Switch) -->
								<td class="px-5 py-3.5 text-center whitespace-nowrap">
									<form
										method="POST"
										action="?/toggleFeatured"
										use:enhance={() => {
											return async ({ result, update }) => {
												if (result.type === 'success') {
													const msg =
														(result.data as { message?: string })?.message ||
														'Mise en avant mise à jour.';
													toast.success(msg);
												} else if (result.type === 'failure') {
													const err =
														(result.data as { error?: string })?.error ||
														'Erreur lors de la mise à jour.';
													toast.error(err);
												}
												await update({ reset: false });
											};
										}}
										class="inline-flex justify-center"
									>
										<input type="hidden" name="id" value={ev.id} />
										<input type="hidden" name="target" value={ev.isFeatured ? 'false' : 'true'} />
										<button
											type="submit"
											role="switch"
											aria-checked={Boolean(ev.isFeatured)}
											class="group inline-flex cursor-pointer items-center gap-2 rounded-xl border px-2.5 py-1 text-xs font-semibold transition-all {ev.isFeatured
												? 'border-amber-300 bg-amber-50/80 text-amber-900 shadow-2xs'
												: 'border-gray-200 bg-white text-text-secondary hover:border-gray-300'}"
											title={ev.isFeatured
												? 'Désactiver la mise en avant'
												: 'Mettre en avant sous la Hero'}
										>
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
												<span>{ev.isFeatured ? 'À la Une' : 'Inactif'}</span>
											</span>
										</button>
									</form>
								</td>

								<!-- 5. Colonne Statut Publication -->
								<td class="px-5 py-3.5 text-center whitespace-nowrap">
									<form
										method="POST"
										action="?/togglePublish"
										use:enhance={() => {
											return async ({ result, update }) => {
												if (result.type === 'success') {
													const msg =
														(result.data as { message?: string })?.message ||
														'Statut de publication mis à jour.';
													toast.success(msg);
												} else if (result.type === 'failure') {
													const err =
														(result.data as { error?: string })?.error ||
														'Erreur lors de la mise à jour.';
													toast.error(err);
												}
												await update({ reset: false });
											};
										}}
										class="inline-flex justify-center"
									>
										<input type="hidden" name="id" value={ev.id} />
										<input type="hidden" name="target" value={ev.isPublished ? 'false' : 'true'} />
										<button
											type="submit"
											class="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors {ev.isPublished
												? 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
												: 'border-gray-200 bg-gray-50 text-text-disabled hover:bg-gray-100'}"
											title={ev.isPublished ? 'Mettre en brouillon' : 'Publier sur le site'}
										>
											<span
												class="h-1.5 w-1.5 rounded-full {ev.isPublished
													? 'bg-emerald-500'
													: 'bg-gray-400'}"
											></span>
											<span>{ev.isPublished ? 'Publié' : 'Brouillon'}</span>
										</button>
									</form>
								</td>

								<!-- 6. Colonne Actions (Menu 3-points) -->
								<td class="px-5 py-3.5 text-right whitespace-nowrap">
									<div class="relative inline-block text-left">
										<button
											type="button"
											aria-label="Options de l'événement"
											aria-haspopup="true"
											aria-expanded={openMenuId === ev.id}
											onclick={(e) => toggleMenu(ev.id, e)}
											class="cursor-pointer rounded-xl border border-gray-200 bg-white p-2 text-text-secondary transition-colors hover:border-gray-300 hover:bg-gray-50 hover:text-text-primary"
											title="Options supplémentaires"
										>
											<MoreVertical size={16} />
										</button>

										{#if openMenuId === ev.id}
											<div
												role="menu"
												tabindex="-1"
												onclick={(e) => e.stopPropagation()}
												onkeydown={(e) => e.stopPropagation()}
												class="absolute top-full right-0 z-30 mt-1.5 w-52 rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl shadow-gray-200/50"
											>
												<!-- Option 1 : Voir la page détail -->
												<a
													role="menuitem"
													href="/nos-evenements/{ev.slug || ev.id}"
													target="_blank"
													rel="noopener noreferrer"
													onclick={() => (openMenuId = null)}
													class="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-text-primary transition-colors hover:bg-gray-50"
												>
													<ExternalLink size={14} class="text-text-secondary" />
													<span>Voir la page détail</span>
												</a>

												<!-- Option 2 : Modifier l'événement -->
												<button
													role="menuitem"
													type="button"
													onclick={() => openEditModal(ev)}
													class="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-text-primary transition-colors hover:bg-gray-50"
												>
													<Pencil size={14} class="text-brand-primary" />
													<span>Modifier l’événement</span>
												</button>

												<!-- Option 3 : Basculer À la une -->
												<form
													method="POST"
													action="?/toggleFeatured"
													use:enhance={() => {
														return async ({ result, update }) => {
															if (result.type === 'success') {
																const msg =
																	(result.data as { message?: string })?.message ||
																	'Mise en avant mise à jour.';
																toast.success(msg);
															} else if (result.type === 'failure') {
																const err =
																	(result.data as { error?: string })?.error ||
																	'Erreur lors de la mise à jour.';
																toast.error(err);
															}
															await update({ reset: false });
														};
													}}
												>
													<input type="hidden" name="id" value={ev.id} />
													<input
														type="hidden"
														name="target"
														value={ev.isFeatured ? 'false' : 'true'}
													/>
													<button
														role="menuitem"
														type="submit"
														onclick={() => (openMenuId = null)}
														class="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-text-primary transition-colors hover:bg-gray-50"
													>
														<Sparkles
															size={14}
															class={ev.isFeatured
																? 'fill-amber-400 text-amber-600'
																: 'text-gray-400'}
														/>
														<span>{ev.isFeatured ? 'Retirer de la une' : 'Mettre à la une'}</span>
													</button>
												</form>

												<div class="my-1 border-t border-gray-100"></div>

												<!-- Option 4 : Supprimer l'événement -->
												<button
													role="menuitem"
													type="button"
													onclick={() => openDeleteModal(ev)}
													class="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
												>
													<Trash2 size={14} />
													<span>Supprimer</span>
												</button>
											</div>
										{/if}
									</div>
								</td>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>

		<!-- Pied de tableau : Pagination (15 éléments / page) -->
		{#if filteredEvents.length > 0}
			<div
				class="flex flex-col items-center justify-between gap-3 border-t border-gray-100 bg-[#f8fafc] p-4 sm:flex-row sm:px-6"
			>
				<div class="text-xs text-text-secondary">
					Affichage de <span class="font-bold text-text-primary"
						>{(currentPage - 1) * pageSize + 1}</span
					>
					à
					<span class="font-bold text-text-primary"
						>{Math.min(currentPage * pageSize, filteredEvents.length)}</span
					>
					sur <span class="font-bold text-text-primary">{filteredEvents.length}</span> événements
				</div>

				<div class="flex items-center gap-1.5">
					<!-- Bouton Précédent -->
					<button
						type="button"
						onclick={() => goToPage(currentPage - 1)}
						disabled={currentPage <= 1}
						class="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-white text-text-secondary transition-colors hover:bg-gray-50 hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
						aria-label="Page précédente"
					>
						<ChevronLeft size={16} />
					</button>

					<!-- Numéros de page -->
					{#each Array.from({ length: totalPages }, (_, i) => i + 1) as p}
						{#if p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1)}
							<button
								type="button"
								onclick={() => goToPage(p)}
								class="inline-flex h-8 min-w-8 cursor-pointer items-center justify-center rounded-lg px-2 text-xs font-bold transition-colors {currentPage ===
								p
									? 'bg-brand-primary text-white shadow-xs'
									: 'border border-gray-200 bg-white text-text-secondary hover:bg-gray-50 hover:text-text-primary'}"
							>
								{p}
							</button>
						{:else if (p === 2 && currentPage > 3) || (p === totalPages - 1 && currentPage < totalPages - 2)}
							<span class="px-1 text-xs text-text-disabled">...</span>
						{/if}
					{/each}

					<!-- Bouton Suivant -->
					<button
						type="button"
						onclick={() => goToPage(currentPage + 1)}
						disabled={currentPage >= totalPages}
						class="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-white text-text-secondary transition-colors hover:bg-gray-50 hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
						aria-label="Page suivante"
					>
						<ChevronRight size={16} />
					</button>
				</div>
			</div>
		{/if}
	</div>
</div>

<!-- ==============================================================================
     MODALE 1 : CRÉATION D'UN ÉVÉNEMENT
     ============================================================================== -->
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
					onclick={closeCreateModal}
					class="rounded-lg p-1.5 text-text-secondary hover:bg-gray-100"
				>
					<X size={18} />
				</button>
			</div>

			<form
				method="POST"
				action="?/create"
				use:enhance={async ({ formData, cancel }) => {
					isSubmitting = true;
					// Images de gadgets envoyées sur R2 avant l'enregistrement de l'événement
					const upload = new AbortController();
					createUpload = upload;
					try {
						await uploadMerchandiseImages(merchItems, upload.signal);
					} catch (err) {
						if (!isAbortError(err)) {
							toast.error(err instanceof Error ? err.message : String(err), 'Envoi interrompu');
							isSubmitting = false;
						}
						cancel();
						return;
					}
					// Formulaire fermé pendant l'envoi : closeCreateModal a déjà tout remis à zéro
					if (upload.signal.aborted) {
						cancel();
						return;
					}
					createUpload = null;
					formData.set('merchandise', serializeMerchandise(merchItems));
					return async ({ update, result }) => {
						isSubmitting = false;
						if (result.type === 'success') {
							isCreateModalOpen = false;
							resetCreateForm();
							const msg =
								(result.data as { message?: string })?.message ||
								'Événement enregistré avec succès !';
							toast.success(msg);
						} else if (result.type === 'failure') {
							const err =
								(result.data as { error?: string })?.error || 'Erreur lors de la création.';
							toast.error(err);
						}
						await update();
					};
				}}
				class="mt-5 space-y-4 text-xs sm:text-sm"
			>
				<div>
					<label for="create-ev-title" class="block font-semibold text-text-primary"
						>Titre de l’événement *</label
					>
					<input
						id="create-ev-title"
						name="title"
						bind:value={title}
						required
						placeholder="Ex: Croisade de Réveil Spirituel"
						class="mt-1 h-10 w-full rounded-xl border border-border px-3 text-text-primary focus:border-brand-primary focus:outline-none"
					/>
				</div>

				<div>
					<label for="create-ev-cat" class="block font-semibold text-text-primary">Catégorie</label>
					<select
						id="create-ev-cat"
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
								<label for="create-ev-date" class="block font-semibold text-text-primary">
									Date du jour *
								</label>
								<input
									type="date"
									id="create-ev-date"
									name="startDate"
									bind:value={startDate}
									onchange={handleStartDateChange}
									required
									class="mt-1 h-10 w-full rounded-xl border border-border bg-white px-3 text-text-primary focus:border-brand-primary focus:outline-none"
								/>
							</div>

							<div>
								<label for="create-ev-start-time" class="block font-semibold text-text-primary">
									Heure de début {!isAllDay ? '*' : ''}
								</label>
								<input
									type="time"
									id="create-ev-start-time"
									name="startTime"
									bind:value={startTime}
									disabled={isAllDay}
									required={!isAllDay}
									class="mt-1 h-10 w-full rounded-xl border border-border bg-white px-3 text-text-primary focus:border-brand-primary focus:outline-none disabled:bg-gray-100 disabled:text-text-disabled"
								/>
							</div>

							<div>
								<label for="create-ev-end-time" class="block font-semibold text-text-primary">
									Heure de fin
								</label>
								<input
									type="time"
									id="create-ev-end-time"
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
								<label for="create-ev-start-date" class="block font-semibold text-text-primary">
									Date de début *
								</label>
								<input
									type="date"
									id="create-ev-start-date"
									name="startDate"
									bind:value={startDate}
									onchange={handleStartDateChange}
									required
									class="mt-1 h-10 w-full rounded-xl border border-border bg-white px-3 text-text-primary focus:border-brand-primary focus:outline-none"
								/>
							</div>

							<div>
								<label for="create-ev-end-date" class="block font-semibold text-text-primary">
									Date de fin *
								</label>
								<input
									type="date"
									id="create-ev-end-date"
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
								<label
									for="create-ev-start-time-multi"
									class="block font-semibold text-text-primary"
								>
									Heure de début (quotidien) {!isAllDay ? '*' : ''}
								</label>
								<input
									type="time"
									id="create-ev-start-time-multi"
									name="startTime"
									bind:value={startTime}
									disabled={isAllDay}
									required={!isAllDay}
									class="mt-1 h-10 w-full rounded-xl border border-border bg-white px-3 text-text-primary focus:border-brand-primary focus:outline-none disabled:bg-gray-100 disabled:text-text-disabled"
								/>
							</div>

							<div>
								<label for="create-ev-end-time-multi" class="block font-semibold text-text-primary">
									Heure de fin (quotidien)
								</label>
								<input
									type="time"
									id="create-ev-end-time-multi"
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
					<label for="create-ev-location" class="block font-semibold text-text-primary"
						>Lieu de l’événement *</label
					>
					<input
						id="create-ev-location"
						name="location"
						bind:value={location}
						required
						placeholder="Ex: Douala, Cameroun"
						class="mt-1 h-10 w-full rounded-xl border border-border px-3 text-text-primary focus:border-brand-primary focus:outline-none"
					/>
				</div>

				<!-- CHAMP SÉLECTION IMAGE DEPUIS L'APPAREIL AVEC PRÉVISUALISATION -->
				<ImagePicker
					id="create-ev-image"
					name="imageDataUrl"
					label="Photo / Affiche de l’événement (depuis votre appareil)"
					bind:value={imageDataUrl}
					helpText="Sélectionnez une affiche ou photo depuis vos fichiers (JPG, PNG, WebP)"
				/>

				<div>
					<label for="create-ev-desc" class="block font-semibold text-text-primary"
						>Description</label
					>
					<textarea
						id="create-ev-desc"
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
							for="create-ev-speakers"
							class="flex items-center gap-1.5 text-xs font-semibold text-text-primary sm:text-sm"
						>
							<Users size={14} class="text-brand-primary" />
							<span>Orateurs & Intervenants</span>
							<span class="text-[11px] font-normal text-text-disabled">(Optionnel)</span>
						</label>
						<span class="text-[10px] text-text-disabled">Séparez par des virgules</span>
					</div>
					<input
						id="create-ev-speakers"
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
							for="create-ev-program"
							class="flex items-center gap-1.5 text-xs font-semibold text-text-primary sm:text-sm"
						>
							<ListChecks size={14} class="text-brand-primary" />
							<span>Organisation & Déroulé de l'événement</span>
							<span class="text-[11px] font-normal text-text-disabled">(Optionnel)</span>
						</label>
						<span class="text-[10px] text-text-disabled">1 étape par ligne</span>
					</div>
					<textarea
						id="create-ev-program"
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

				<EventMerchandiseEditor
					idPrefix="create"
					bind:items={merchItems}
					bind:whatsapp={merchWhatsapp}
				/>

				<!-- WIDGET SWITCH : INSCRIPTIONS (PLACES LIMITÉES) OU ACCÈS LIBRE -->
				<div
					class="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 transition-colors"
				>
					<div class="flex items-center gap-3">
						<div
							class="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700"
						>
							<Ticket size={16} />
						</div>
						<div>
							<label for="create-ev-registration" class="block text-xs font-bold text-emerald-950">
								Activer les inscriptions (places limitées)
							</label>
							<span class="block text-[11px] text-emerald-800">
								{registrationEnabled
									? 'Le bouton « Participer / S’inscrire » est affiché sur le site'
									: 'Accès libre : le bouton « Participer / S’inscrire » est masqué'}
							</span>
						</div>
					</div>

					<label class="relative inline-flex cursor-pointer items-center select-none">
						<input
							id="create-ev-registration"
							type="checkbox"
							name="registrationEnabled"
							bind:checked={registrationEnabled}
							class="peer sr-only"
						/>
						<div
							class="h-6 w-11 rounded-full bg-gray-200 transition-colors peer-checked:bg-emerald-500 peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-500 peer-focus-visible:ring-offset-2 after:absolute after:top-0.5 after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-xs after:transition-all after:content-[''] peer-checked:after:translate-x-full"
						></div>
					</label>
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
						id="create-ev-published"
						name="isPublished"
						type="checkbox"
						bind:checked={isPublished}
						class="h-4 w-4 rounded text-brand-primary focus:ring-brand-primary"
					/>
					<label for="create-ev-published" class="text-xs font-semibold text-text-primary">
						Publier immédiatement sur le site
					</label>
				</div>

				<div class="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
					<button
						type="button"
						onclick={closeCreateModal}
						class="cursor-pointer rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-text-secondary hover:bg-gray-50"
					>
						Annuler
					</button>
					<button
						type="submit"
						disabled={isSubmitting}
						class="cursor-pointer rounded-xl bg-brand-primary px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-brand-primary-hover disabled:opacity-50"
					>
						{isSubmitting ? 'Enregistrement...' : 'Créer l’événement'}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- ==============================================================================
     MODALE 2 : MODIFICATION D'UN ÉVÉNEMENT
     ============================================================================== -->
{#if isEditModalOpen && editingId !== null}
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
					<h3 class="font-display text-lg font-bold text-text-primary">Modifier l’événement</h3>
					<p class="text-xs text-text-secondary">
						Modifiez les informations, la programmation ou les intervenants de l’événement.
					</p>
				</div>
				<button
					type="button"
					onclick={closeEditModal}
					class="cursor-pointer rounded-lg p-1.5 text-text-secondary hover:bg-gray-100"
				>
					<X size={18} />
				</button>
			</div>

			<form
				method="POST"
				action="?/update"
				use:enhance={async ({ formData, cancel }) => {
					isEditSubmitting = true;
					const upload = new AbortController();
					editUpload = upload;
					try {
						await uploadMerchandiseImages(editMerchItems, upload.signal);
					} catch (err) {
						if (!isAbortError(err)) {
							toast.error(err instanceof Error ? err.message : String(err), 'Envoi interrompu');
							isEditSubmitting = false;
						}
						cancel();
						return;
					}
					if (upload.signal.aborted) {
						cancel();
						return;
					}
					editUpload = null;
					formData.set('merchandise', serializeMerchandise(editMerchItems));
					return async ({ update, result }) => {
						isEditSubmitting = false;
						if (result.type === 'success') {
							closeEditModal();
							const msg =
								(result.data as { message?: string })?.message || 'Événement modifié avec succès !';
							toast.success(msg);
						} else if (result.type === 'failure') {
							const err =
								(result.data as { error?: string })?.error || 'Erreur lors de la modification.';
							toast.error(err);
						}
						await update();
					};
				}}
				class="mt-5 space-y-4 text-xs sm:text-sm"
			>
				<input type="hidden" name="id" value={editingId} />

				<div>
					<label for="edit-ev-title" class="block font-semibold text-text-primary"
						>Titre de l’événement *</label
					>
					<input
						id="edit-ev-title"
						name="title"
						bind:value={editTitle}
						required
						placeholder="Ex: Croisade de Réveil Spirituel"
						class="mt-1 h-10 w-full rounded-xl border border-border px-3 text-text-primary focus:border-brand-primary focus:outline-none"
					/>
				</div>

				<div>
					<label for="edit-ev-cat" class="block font-semibold text-text-primary">Catégorie</label>
					<select
						id="edit-ev-cat"
						name="category"
						bind:value={editCategory}
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
								bind:checked={editIsSingleDay}
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
								bind:checked={editIsAllDay}
								class="h-4 w-4 rounded text-brand-primary focus:ring-brand-primary"
							/>
							<span>Toute la journée</span>
						</label>
					</div>

					{#if editIsSingleDay}
						<!-- RÈGLE 1 : UN SEUL JOUR -->
						<div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
							<div class="sm:col-span-1">
								<label for="edit-ev-date" class="block font-semibold text-text-primary">
									Date du jour *
								</label>
								<input
									type="date"
									id="edit-ev-date"
									name="startDate"
									bind:value={editStartDate}
									onchange={handleEditStartDateChange}
									required
									class="mt-1 h-10 w-full rounded-xl border border-border bg-white px-3 text-text-primary focus:border-brand-primary focus:outline-none"
								/>
							</div>

							<div>
								<label for="edit-ev-start-time" class="block font-semibold text-text-primary">
									Heure de début {!editIsAllDay ? '*' : ''}
								</label>
								<input
									type="time"
									id="edit-ev-start-time"
									name="startTime"
									bind:value={editStartTime}
									disabled={editIsAllDay}
									required={!editIsAllDay}
									class="mt-1 h-10 w-full rounded-xl border border-border bg-white px-3 text-text-primary focus:border-brand-primary focus:outline-none disabled:bg-gray-100 disabled:text-text-disabled"
								/>
							</div>

							<div>
								<label for="edit-ev-end-time" class="block font-semibold text-text-primary">
									Heure de fin
								</label>
								<input
									type="time"
									id="edit-ev-end-time"
									name="endTime"
									bind:value={editEndTime}
									disabled={editIsAllDay}
									class="mt-1 h-10 w-full rounded-xl border border-border bg-white px-3 text-text-primary focus:border-brand-primary focus:outline-none disabled:bg-gray-100 disabled:text-text-disabled"
								/>
							</div>
						</div>
					{:else}
						<!-- RÈGLE 2 : PLUSIEURS JOURS -->
						<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
							<div>
								<label for="edit-ev-start-date" class="block font-semibold text-text-primary">
									Date de début *
								</label>
								<input
									type="date"
									id="edit-ev-start-date"
									name="startDate"
									bind:value={editStartDate}
									onchange={handleEditStartDateChange}
									required
									class="mt-1 h-10 w-full rounded-xl border border-border bg-white px-3 text-text-primary focus:border-brand-primary focus:outline-none"
								/>
							</div>

							<div>
								<label for="edit-ev-end-date" class="block font-semibold text-text-primary">
									Date de fin *
								</label>
								<input
									type="date"
									id="edit-ev-end-date"
									name="endDate"
									bind:value={editEndDate}
									min={editStartDate}
									required
									class="mt-1 h-10 w-full rounded-xl border border-border bg-white px-3 text-text-primary focus:border-brand-primary focus:outline-none"
								/>
							</div>
						</div>

						<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
							<div>
								<label for="edit-ev-start-time-multi" class="block font-semibold text-text-primary">
									Heure de début (quotidien) {!editIsAllDay ? '*' : ''}
								</label>
								<input
									type="time"
									id="edit-ev-start-time-multi"
									name="startTime"
									bind:value={editStartTime}
									disabled={editIsAllDay}
									required={!editIsAllDay}
									class="mt-1 h-10 w-full rounded-xl border border-border bg-white px-3 text-text-primary focus:border-brand-primary focus:outline-none disabled:bg-gray-100 disabled:text-text-disabled"
								/>
							</div>

							<div>
								<label for="edit-ev-end-time-multi" class="block font-semibold text-text-primary">
									Heure de fin (quotidien)
								</label>
								<input
									type="time"
									id="edit-ev-end-time-multi"
									name="endTime"
									bind:value={editEndTime}
									disabled={editIsAllDay}
									class="mt-1 h-10 w-full rounded-xl border border-border bg-white px-3 text-text-primary focus:border-brand-primary focus:outline-none disabled:bg-gray-100 disabled:text-text-disabled"
								/>
							</div>
						</div>
					{/if}

					<!-- Aperçu dynamique interactif de la programmation -->
					{#if editSchedulePreview}
						<div
							class="mt-2 flex items-center gap-3 rounded-xl border border-brand-primary/20 bg-white p-3 shadow-2xs"
						>
							<div
								class="flex h-12 min-w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-brand-primary px-2.5 text-white shadow-xs"
							>
								<span
									class="font-display leading-none font-bold {editSchedulePreview.dateDay.length > 4
										? 'text-xs'
										: 'text-sm'}">{editSchedulePreview.dateDay}</span
								>
								<span class="mt-0.5 text-[8px] font-bold tracking-wider uppercase"
									>{editSchedulePreview.dateMonthYear}</span
								>
							</div>
							<div class="min-w-0 flex-1 text-xs">
								<div class="text-[10px] font-bold tracking-wider text-brand-primary uppercase">
									Aperçu calendrier
								</div>
								<div class="font-semibold text-text-primary">{editSchedulePreview.summaryText}</div>
							</div>
						</div>
					{/if}
				</div>

				<div>
					<label for="edit-ev-location" class="block font-semibold text-text-primary"
						>Lieu de l’événement *</label
					>
					<input
						id="edit-ev-location"
						name="location"
						bind:value={editLocation}
						required
						placeholder="Ex: Douala, Cameroun"
						class="mt-1 h-10 w-full rounded-xl border border-border px-3 text-text-primary focus:border-brand-primary focus:outline-none"
					/>
				</div>

				<ImagePicker
					id="edit-ev-image"
					name="imageDataUrl"
					label="Photo / Affiche de l’événement"
					bind:value={editImageDataUrl}
					helpText="Sélectionnez une affiche ou photo depuis vos fichiers (JPG, PNG, WebP)"
				/>

				<div>
					<label for="edit-ev-desc" class="block font-semibold text-text-primary">Description</label
					>
					<textarea
						id="edit-ev-desc"
						name="description"
						bind:value={editDescription}
						rows={2}
						placeholder="Présentation des temps forts..."
						class="mt-1 w-full rounded-xl border border-border p-3 text-text-primary focus:border-brand-primary focus:outline-none"
					></textarea>
				</div>

				<!-- CHAMP ORATEURS & INTERVENANTS (OPTIONNEL) -->
				<div>
					<div class="flex items-center justify-between">
						<label
							for="edit-ev-speakers"
							class="flex items-center gap-1.5 text-xs font-semibold text-text-primary sm:text-sm"
						>
							<Users size={14} class="text-brand-primary" />
							<span>Orateurs & Intervenants</span>
							<span class="text-[11px] font-normal text-text-disabled">(Optionnel)</span>
						</label>
						<span class="text-[10px] text-text-disabled">Séparez par des virgules</span>
					</div>
					<input
						id="edit-ev-speakers"
						name="speakers"
						type="text"
						bind:value={editSpeakers}
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
							for="edit-ev-program"
							class="flex items-center gap-1.5 text-xs font-semibold text-text-primary sm:text-sm"
						>
							<ListChecks size={14} class="text-brand-primary" />
							<span>Organisation & Déroulé de l'événement</span>
							<span class="text-[11px] font-normal text-text-disabled">(Optionnel)</span>
						</label>
						<span class="text-[10px] text-text-disabled">1 étape par ligne</span>
					</div>
					<textarea
						id="edit-ev-program"
						name="program"
						bind:value={editProgram}
						rows={3}
						placeholder="Ex:&#10;01. Accueil & Prière d'ouverture (17h30)&#10;02. Louange & Adoration vivante (18h00)&#10;03. Prédication de l'Évangile & Ministère pour les malades (19h30)&#10;04. Communion fraternelle & Distribution de bibles (21h00)"
						class="mt-1 w-full rounded-xl border border-border p-3 font-mono text-xs text-text-primary focus:border-brand-primary focus:outline-hidden"
					></textarea>
					<p class="mt-1 text-[11px] text-text-secondary">
						Chaque ligne sera automatiquement mise en forme comme étape numérotée dans le programme
						de la page détail.
					</p>
				</div>

				<EventMerchandiseEditor
					idPrefix="edit"
					bind:items={editMerchItems}
					bind:whatsapp={editMerchWhatsapp}
				/>

				<!-- WIDGET SWITCH : INSCRIPTIONS (PLACES LIMITÉES) OU ACCÈS LIBRE -->
				<div
					class="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 transition-colors"
				>
					<div class="flex items-center gap-3">
						<div
							class="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700"
						>
							<Ticket size={16} />
						</div>
						<div>
							<label for="edit-ev-registration" class="block text-xs font-bold text-emerald-950">
								Activer les inscriptions (places limitées)
							</label>
							<span class="block text-[11px] text-emerald-800">
								{editRegistrationEnabled
									? 'Le bouton « Participer / S’inscrire » est affiché sur le site'
									: 'Accès libre : le bouton « Participer / S’inscrire » est masqué'}
							</span>
						</div>
					</div>

					<label class="relative inline-flex cursor-pointer items-center select-none">
						<input
							id="edit-ev-registration"
							type="checkbox"
							name="registrationEnabled"
							bind:checked={editRegistrationEnabled}
							class="peer sr-only"
						/>
						<div
							class="h-6 w-11 rounded-full bg-gray-200 transition-colors peer-checked:bg-emerald-500 peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-500 peer-focus-visible:ring-offset-2 after:absolute after:top-0.5 after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-xs after:transition-all after:content-[''] peer-checked:after:translate-x-full"
						></div>
					</label>
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
							bind:checked={editIsFeatured}
							class="peer sr-only"
						/>
						<div
							class="h-6 w-11 rounded-full bg-gray-200 transition-colors peer-checked:bg-amber-500 peer-focus:outline-hidden after:absolute after:top-0.5 after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-xs after:transition-all after:content-[''] peer-checked:after:translate-x-full"
						></div>
					</label>
				</div>

				<div class="flex items-center gap-2 pt-1">
					<input
						id="edit-ev-published"
						name="isPublished"
						type="checkbox"
						bind:checked={editIsPublished}
						class="h-4 w-4 rounded text-brand-primary focus:ring-brand-primary"
					/>
					<label for="edit-ev-published" class="text-xs font-semibold text-text-primary">
						Publier immédiatement sur le site
					</label>
				</div>

				<div class="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
					<button
						type="button"
						onclick={closeEditModal}
						class="cursor-pointer rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-text-secondary hover:bg-gray-50"
					>
						Annuler
					</button>
					<button
						type="submit"
						disabled={isEditSubmitting}
						class="cursor-pointer rounded-xl bg-brand-primary px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-brand-primary-hover disabled:opacity-50"
					>
						{isEditSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- ==============================================================================
     MODALE 3 : CONFIRMATION DE SUPPRESSION
     ============================================================================== -->
{#if isDeleteModalOpen && eventToDelete}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
		role="dialog"
		aria-modal="true"
	>
		<div class="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl">
			<div class="flex items-center justify-between border-b border-gray-100 pb-3">
				<h3 class="font-display text-lg font-bold text-text-primary">Supprimer l’événement</h3>
				<button
					type="button"
					onclick={() => {
						isDeleteModalOpen = false;
						eventToDelete = null;
					}}
					class="cursor-pointer rounded-lg p-1.5 text-text-secondary hover:bg-gray-100"
				>
					<X size={18} />
				</button>
			</div>

			<p class="mt-4 text-xs text-text-secondary sm:text-sm">
				Êtes-vous sûr de vouloir supprimer définitivement l’événement
				<strong class="font-bold text-text-primary">« {eventToDelete.title} »</strong> ?
			</p>
			<p class="mt-2 text-[11px] text-red-600">
				Cette action est irréversible et retirera cet événement de l’ensemble du site.
			</p>

			<form
				method="POST"
				action="?/delete"
				use:enhance={() => {
					isDeleteSubmitting = true;
					return async ({ result, update }) => {
						isDeleteSubmitting = false;
						if (result.type === 'success') {
							isDeleteModalOpen = false;
							eventToDelete = null;
							const msg =
								(result.data as { message?: string })?.message || 'Événement supprimé avec succès.';
							toast.success(msg);
						} else if (result.type === 'failure') {
							const err =
								(result.data as { error?: string })?.error || 'Erreur lors de la suppression.';
							toast.error(err);
						}
						await update();
					};
				}}
				class="mt-6 flex items-center justify-end gap-3"
			>
				<input type="hidden" name="id" value={eventToDelete.id} />
				<button
					type="button"
					onclick={() => {
						isDeleteModalOpen = false;
						eventToDelete = null;
					}}
					class="cursor-pointer rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-text-secondary hover:bg-gray-50"
				>
					Annuler
				</button>
				<button
					type="submit"
					disabled={isDeleteSubmitting}
					class="cursor-pointer rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-red-700 disabled:opacity-50"
				>
					{isDeleteSubmitting ? 'Suppression...' : 'Supprimer définitivement'}
				</button>
			</form>
		</div>
	</div>
{/if}
