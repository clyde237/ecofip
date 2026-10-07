<script lang="ts">
	import { enhance } from '$app/forms';
	import {
		Images,
		Image as ImageIcon,
		Video,
		UploadCloud,
		Trash2,
		Pencil,
		Eye,
		EyeOff,
		X,
		Clock,
		MapPin,
		CalendarDays,
		Link as LinkIcon,
		CloudOff
	} from '@lucide/svelte';
	import type { PageData } from './$types.js';
	import Card from '$lib/design-system/components/Card.svelte';
	import Button from '$lib/design-system/components/Button.svelte';
	import Modal from '$lib/design-system/components/Modal.svelte';
	import { toast } from '$lib/design-system/toast.svelte.js';
	import { compressImage, toUploadFilename, uploadToR2 } from '$lib/utils/r2Upload.js';

	let { data }: { data: PageData } = $props();

	type GalleryItem = (typeof data.items)[number];

	const PRESET_CATEGORIES = [
		'Croisades',
		'Actions sociales',
		'Témoignages',
		'Mission nationale',
		'Jeunesse',
		'Formation',
		'Prière & intercession'
	];
	const MAX_PHOTOS_PER_BATCH = 50;

	let categorySuggestions = $derived(
		Array.from(new Set([...PRESET_CATEGORIES, ...data.items.map((item) => item.category)]))
	);

	const inputClass =
		'mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-text-primary placeholder:text-gray-400 focus:border-brand-primary focus:outline-hidden';
	const labelClass = 'block text-xs font-bold text-text-primary';

	function formatDate(value: string | null): string {
		if (!value) return '';
		return new Date(`${value}T12:00:00`).toLocaleDateString('fr-FR', {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		});
	}

	function titleFromFilename(filename: string): string {
		const clean = filename
			.replace(/\.[^/.]+$/, '')
			.replace(/[-_]+/g, ' ')
			.trim();
		return clean.charAt(0).toUpperCase() + clean.slice(1);
	}

	// ==========================================
	// AJOUT : champs communs (photos et vidéo)
	// ==========================================
	let addMode = $state<'photos' | 'video'>('photos');
	let category = $state('Croisades');
	let location = $state('');
	let takenAt = $state('');
	let description = $state('');
	let isPublished = $state(true);
	let isSubmitting = $state(false);

	// ==========================================
	// AJOUT DE PHOTOS (lot)
	// ==========================================
	type PendingPhoto = {
		id: string;
		file: File;
		previewUrl: string;
		title: string;
		progress: number;
		key: string | null;
	};
	let pendingPhotos = $state<PendingPhoto[]>([]);
	let photoInput: HTMLInputElement | null = $state(null);
	let isDragging = $state(false);

	function addPhotoFiles(files: FileList | File[]) {
		const images = Array.from(files).filter((file) => file.type.startsWith('image/'));
		if (images.length < Array.from(files).length) {
			toast.warning('Seules les images sont ajoutées dans cet onglet.', 'Fichiers ignorés');
		}
		const room = MAX_PHOTOS_PER_BATCH - pendingPhotos.length;
		if (images.length > room) {
			toast.warning(`${MAX_PHOTOS_PER_BATCH} photos maximum par envoi.`, 'Limite atteinte');
		}
		pendingPhotos = [
			...pendingPhotos,
			...images.slice(0, Math.max(room, 0)).map((file) => ({
				id: crypto.randomUUID(),
				file,
				previewUrl: URL.createObjectURL(file),
				title: titleFromFilename(file.name),
				progress: 0,
				key: null
			}))
		];
	}

	function removePendingPhoto(id: string) {
		const photo = pendingPhotos.find((p) => p.id === id);
		if (photo) URL.revokeObjectURL(photo.previewUrl);
		pendingPhotos = pendingPhotos.filter((p) => p.id !== id);
	}

	/** Compresse et envoie sur R2 les photos qui ne le sont pas encore (reprise possible après erreur) */
	async function uploadPendingPhotos(): Promise<boolean> {
		for (const photo of pendingPhotos) {
			if (photo.key) continue;
			try {
				const blob = await compressImage(photo.file);
				const result = await uploadToR2(blob, {
					filename: toUploadFilename(photo.file.name, blob),
					folder: 'gallery',
					onProgress: (percent) => (photo.progress = percent)
				});
				photo.key = result.key;
				photo.progress = 100;
			} catch (err) {
				const message = err instanceof Error ? err.message : String(err);
				toast.error(`« ${photo.title} » : ${message}`, 'Envoi interrompu');
				return false;
			}
		}
		return true;
	}

	function resetSharedFields() {
		location = '';
		takenAt = '';
		description = '';
		isPublished = true;
	}

	function resetPhotoForm() {
		pendingPhotos.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
		pendingPhotos = [];
		resetSharedFields();
	}

	// ==========================================
	// AJOUT D'UNE VIDÉO
	// ==========================================
	let videoTitle = $state('');
	let videoSource = $state<'upload' | 'url'>('upload');
	let videoFile = $state<File | null>(null);
	let videoKey = $state('');
	let externalVideoUrl = $state('');
	let videoDuration = $state('');
	let videoProgress = $state(0);
	let posterFile = $state<File | null>(null);
	let posterPreviewUrl = $state<string | null>(null);
	let posterKey = $state('');

	function formatDuration(seconds: number): string {
		const minutes = Math.floor(seconds / 60);
		const rest = Math.floor(seconds % 60);
		return `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`;
	}

	function handleVideoFile(file: File | undefined) {
		if (!file) return;
		if (!file.type.startsWith('video/')) {
			toast.error('Sélectionnez un fichier vidéo (MP4, WebM, MOV).', 'Format invalide');
			return;
		}
		videoFile = file;
		videoKey = '';
		videoProgress = 0;
		if (!videoTitle.trim()) videoTitle = titleFromFilename(file.name);

		// Lecture de la durée depuis les métadonnées du fichier local
		const probe = document.createElement('video');
		probe.preload = 'metadata';
		const probeUrl = URL.createObjectURL(file);
		probe.onloadedmetadata = () => {
			if (Number.isFinite(probe.duration)) videoDuration = formatDuration(probe.duration);
			URL.revokeObjectURL(probeUrl);
		};
		probe.onerror = () => URL.revokeObjectURL(probeUrl);
		probe.src = probeUrl;
	}

	function handlePosterFile(file: File | undefined) {
		if (!file) return;
		if (!file.type.startsWith('image/')) {
			toast.error('L’affiche doit être une image.', 'Format invalide');
			return;
		}
		if (posterPreviewUrl) URL.revokeObjectURL(posterPreviewUrl);
		posterFile = file;
		posterPreviewUrl = URL.createObjectURL(file);
		posterKey = '';
	}

	async function uploadVideoFiles(): Promise<boolean> {
		try {
			if (videoSource === 'upload' && videoFile && !videoKey) {
				const result = await uploadToR2(videoFile, {
					filename: videoFile.name,
					folder: 'gallery',
					onProgress: (percent) => (videoProgress = percent)
				});
				videoKey = result.key;
			}
			if (posterFile && !posterKey) {
				const blob = await compressImage(posterFile);
				const result = await uploadToR2(blob, {
					filename: toUploadFilename(posterFile.name, blob),
					folder: 'gallery'
				});
				posterKey = result.key;
			}
			return true;
		} catch (err) {
			toast.error(err instanceof Error ? err.message : String(err), 'Envoi interrompu');
			return false;
		}
	}

	function resetVideoForm() {
		videoTitle = '';
		videoFile = null;
		videoKey = '';
		externalVideoUrl = '';
		videoDuration = '';
		videoProgress = 0;
		if (posterPreviewUrl) URL.revokeObjectURL(posterPreviewUrl);
		posterFile = null;
		posterPreviewUrl = null;
		posterKey = '';
		resetSharedFields();
	}

	// ==========================================
	// LISTE, FILTRES
	// ==========================================
	let typeFilter = $state<'all' | 'photo' | 'video'>('all');
	let categoryFilter = $state('all');
	let statusFilter = $state<'all' | 'published' | 'hidden'>('all');

	let existingCategories = $derived(Array.from(new Set(data.items.map((item) => item.category))));
	let filteredItems = $derived(
		data.items.filter(
			(item) =>
				(typeFilter === 'all' || item.type === typeFilter) &&
				(categoryFilter === 'all' || item.category === categoryFilter) &&
				(statusFilter === 'all' || (statusFilter === 'published') === item.isPublished)
		)
	);
	let photoCount = $derived(data.items.filter((item) => item.type === 'photo').length);
	let videoCount = $derived(data.items.filter((item) => item.type === 'video').length);
	let publishedCount = $derived(data.items.filter((item) => item.isPublished).length);

	// ==========================================
	// MODIFICATION & SUPPRESSION
	// ==========================================
	let editingItem = $state<GalleryItem | null>(null);
	let isEditOpen = $state(false);
	let editTitle = $state('');
	let editDescription = $state('');
	let editCategory = $state('');
	let editLocation = $state('');
	let editTakenAt = $state('');
	let editDuration = $state('');
	let editDisplayOrder = $state(0);
	let editIsPublished = $state(true);
	let editImageFile = $state<File | null>(null);
	let editImagePreview = $state<string | null>(null);
	let editImageKey = $state('');
	let isEditSubmitting = $state(false);

	function openEdit(item: GalleryItem) {
		editingItem = item;
		editTitle = item.title;
		editDescription = item.description ?? '';
		editCategory = item.category;
		editLocation = item.location ?? '';
		editTakenAt = item.takenAt ?? '';
		editDuration = item.duration ?? '';
		editDisplayOrder = item.displayOrder;
		editIsPublished = item.isPublished;
		if (editImagePreview) URL.revokeObjectURL(editImagePreview);
		editImageFile = null;
		editImagePreview = null;
		editImageKey = '';
		isEditOpen = true;
	}

	function handleEditImage(file: File | undefined) {
		if (!file || !file.type.startsWith('image/')) return;
		if (editImagePreview) URL.revokeObjectURL(editImagePreview);
		editImageFile = file;
		editImagePreview = URL.createObjectURL(file);
		editImageKey = '';
	}

	let itemToDelete = $state<GalleryItem | null>(null);
	let isDeleteOpen = $state(false);

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

<datalist id="gallery-categories">
	{#each categorySuggestions as suggestion (suggestion)}
		<option value={suggestion}></option>
	{/each}
</datalist>

<!-- Champs communs aux formulaires d’ajout (photos et vidéo) -->
{#snippet sharedFields(idPrefix: string)}
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
		<div>
			<label for="{idPrefix}-category" class={labelClass}>Catégorie *</label>
			<input
				id="{idPrefix}-category"
				name="category"
				list="gallery-categories"
				bind:value={category}
				required
				maxlength="100"
				placeholder="Ex : Croisades"
				class={inputClass}
			/>
		</div>
		<div>
			<label for="{idPrefix}-location" class={labelClass}>Lieu</label>
			<input
				id="{idPrefix}-location"
				name="location"
				bind:value={location}
				maxlength="150"
				placeholder="Ex : Bafoussam, Ouest"
				class={inputClass}
			/>
		</div>
		<div>
			<label for="{idPrefix}-date" class={labelClass}>Date</label>
			<input
				id="{idPrefix}-date"
				name="takenAt"
				type="date"
				bind:value={takenAt}
				class={inputClass}
			/>
		</div>
	</div>
{/snippet}

<div class="space-y-8">
	<!-- En-tête -->
	<div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
		<div>
			<p class="text-xs font-bold tracking-widest text-brand-primary uppercase">Page Galerie</p>
			<h1 class="mt-1 font-display text-2xl font-bold text-text-primary sm:text-3xl">
				Photos & vidéos de la galerie
			</h1>
			<p class="mt-1 max-w-2xl text-sm text-text-secondary">
				Les fichiers sont stockés sur Cloudflare R2. Seuls les médias publiés apparaissent sur la
				page <a href="/galerie" target="_blank" class="font-semibold text-brand-primary underline"
					>Galerie</a
				>.
			</p>
		</div>
		<div class="grid grid-cols-3 gap-3 text-center">
			<div class="rounded-2xl border border-gray-200 bg-white px-4 py-2.5">
				<div class="font-display text-xl font-bold text-text-primary">{photoCount}</div>
				<div class="text-[11px] text-text-secondary">Photos</div>
			</div>
			<div class="rounded-2xl border border-gray-200 bg-white px-4 py-2.5">
				<div class="font-display text-xl font-bold text-text-primary">{videoCount}</div>
				<div class="text-[11px] text-text-secondary">Vidéos</div>
			</div>
			<div class="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2.5">
				<div class="font-display text-xl font-bold text-emerald-800">{publishedCount}</div>
				<div class="text-[11px] text-emerald-700">Publiés</div>
			</div>
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

	<!-- ==================== AJOUT ==================== -->
	<Card class="p-6 sm:p-8">
		<div class="mb-6 flex flex-col gap-4 border-b border-gray-100 pb-4 sm:flex-row sm:items-center">
			<div class="flex-1">
				<h2 class="font-display text-xl font-bold text-text-primary">Ajouter à la galerie</h2>
				<p class="mt-1 text-xs text-text-secondary sm:text-sm">
					Plusieurs photos à la fois, ou une vidéo avec son affiche.
				</p>
			</div>
			<div class="flex rounded-2xl bg-gray-100 p-1.5" role="tablist" aria-label="Type de média">
				<button
					type="button"
					role="tab"
					aria-selected={addMode === 'photos'}
					onclick={() => (addMode = 'photos')}
					class="flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all {addMode ===
					'photos'
						? 'bg-white text-brand-primary shadow-xs'
						: 'text-text-secondary hover:text-text-primary'}"
				>
					<ImageIcon size={15} /> Photos
				</button>
				<button
					type="button"
					role="tab"
					aria-selected={addMode === 'video'}
					onclick={() => (addMode = 'video')}
					class="flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all {addMode ===
					'video'
						? 'bg-white text-brand-primary shadow-xs'
						: 'text-text-secondary hover:text-text-primary'}"
				>
					<Video size={15} /> Vidéo
				</button>
			</div>
		</div>

		{#if addMode === 'photos'}
			<form
				method="POST"
				action="?/createPhotos"
				use:enhance={async ({ formData, cancel }) => {
					if (pendingPhotos.length === 0) {
						toast.error('Ajoutez au moins une photo.', 'Aucune photo');
						cancel();
						return;
					}
					if (pendingPhotos.some((photo) => !photo.title.trim())) {
						toast.error('Chaque photo doit avoir un titre.', 'Titre manquant');
						cancel();
						return;
					}
					isSubmitting = true;
					if (!(await uploadPendingPhotos())) {
						isSubmitting = false;
						cancel();
						return;
					}
					formData.set(
						'photos',
						JSON.stringify(pendingPhotos.map((photo) => ({ title: photo.title, key: photo.key })))
					);
					return async ({ result, update }) => {
						isSubmitting = false;
						showActionResult(result as { type: string; data?: Record<string, unknown> });
						if (result.type === 'success') resetPhotoForm();
						await update({ reset: false });
					};
				}}
				class="space-y-5"
			>
				<!-- Zone de dépôt -->
				<div
					role="button"
					tabindex="0"
					onclick={() => photoInput?.click()}
					onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && photoInput?.click()}
					ondragover={(e) => {
						e.preventDefault();
						isDragging = true;
					}}
					ondragleave={() => (isDragging = false)}
					ondrop={(e) => {
						e.preventDefault();
						isDragging = false;
						if (e.dataTransfer?.files) addPhotoFiles(e.dataTransfer.files);
					}}
					class="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-colors focus-visible:outline-2 focus-visible:outline-brand-primary {isDragging
						? 'border-brand-primary bg-brand-subtle/40'
						: 'border-gray-300 bg-[#f8fafc] hover:border-brand-primary/60'}"
				>
					<UploadCloud size={30} class="text-brand-primary" />
					<p class="mt-2 text-sm font-bold text-text-primary">
						Glissez vos photos ici ou cliquez pour les choisir
					</p>
					<p class="mt-1 text-xs text-text-secondary">
						JPG, PNG, WebP · {MAX_PHOTOS_PER_BATCH} max par envoi · redimensionnées à 2000 px avant envoi
					</p>
					<input
						bind:this={photoInput}
						type="file"
						accept="image/jpeg,image/png,image/webp,image/avif"
						multiple
						class="hidden"
						onchange={(e) => {
							const input = e.currentTarget;
							if (input.files) addPhotoFiles(input.files);
							input.value = '';
						}}
					/>
				</div>

				{#if pendingPhotos.length > 0}
					<ul class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
						{#each pendingPhotos as photo, index (photo.id)}
							<li class="flex gap-3 rounded-2xl border border-gray-200 bg-white p-2.5">
								<img
									src={photo.previewUrl}
									alt=""
									class="h-20 w-24 shrink-0 rounded-xl object-cover"
								/>
								<div class="min-w-0 flex-1">
									<label for="photo-title-{photo.id}" class="sr-only"
										>Titre de la photo {index + 1}</label
									>
									<input
										id="photo-title-{photo.id}"
										bind:value={photo.title}
										maxlength="200"
										placeholder="Titre de la photo"
										class="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-text-primary focus:border-brand-primary focus:outline-hidden"
									/>
									<div class="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100">
										<div
											class="h-full rounded-full transition-all {photo.key
												? 'bg-emerald-500'
												: 'bg-brand-primary'}"
											style="width: {photo.progress}%"
										></div>
									</div>
									<p class="mt-1 text-[11px] text-text-secondary">
										{photo.key
											? 'Envoyée sur R2'
											: `${(photo.file.size / 1024 / 1024).toFixed(1)} Mo`}
									</p>
								</div>
								<button
									type="button"
									onclick={() => removePendingPhoto(photo.id)}
									disabled={isSubmitting}
									class="self-start rounded-lg p-1 text-gray-400 hover:bg-red-50 hover:text-brand-primary disabled:opacity-40"
									aria-label="Retirer {photo.title}"
								>
									<X size={15} />
								</button>
							</li>
						{/each}
					</ul>
				{/if}

				{@render sharedFields('photos')}

				<div>
					<label for="photos-description" class={labelClass}>Description commune (facultatif)</label
					>
					<textarea
						id="photos-description"
						name="description"
						bind:value={description}
						rows="2"
						maxlength="1000"
						placeholder="Contexte affiché dans la visionneuse"
						class={inputClass}></textarea>
				</div>

				<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<label class="flex items-center gap-2 text-sm font-semibold text-text-primary">
						<input
							type="checkbox"
							name="isPublished"
							bind:checked={isPublished}
							class="h-4 w-4 rounded-sm text-brand-primary"
						/>
						Publier immédiatement dans la galerie
					</label>
					<Button
						type="submit"
						variant="primary"
						size="md"
						disabled={isSubmitting || pendingPhotos.length === 0 || !data.isR2Configured}
					>
						<UploadCloud size={16} class="mr-2" />
						{isSubmitting
							? 'Envoi en cours…'
							: `Ajouter ${pendingPhotos.length || ''} photo${pendingPhotos.length > 1 ? 's' : ''}`}
					</Button>
				</div>
			</form>
		{:else}
			<form
				method="POST"
				action="?/createVideo"
				use:enhance={async ({ formData, cancel }) => {
					if (videoSource === 'upload' && !videoFile) {
						toast.error('Choisissez un fichier vidéo.', 'Vidéo manquante');
						cancel();
						return;
					}
					isSubmitting = true;
					if (!(await uploadVideoFiles())) {
						isSubmitting = false;
						cancel();
						return;
					}
					formData.set('videoKey', videoSource === 'upload' ? videoKey : '');
					formData.set('videoUrl', videoSource === 'url' ? externalVideoUrl : '');
					formData.set('posterKey', posterKey);
					return async ({ result, update }) => {
						isSubmitting = false;
						showActionResult(result as { type: string; data?: Record<string, unknown> });
						if (result.type === 'success') resetVideoForm();
						await update({ reset: false });
					};
				}}
				class="space-y-5"
			>
				<div class="grid grid-cols-1 gap-5 lg:grid-cols-2">
					<!-- Fichier vidéo -->
					<div class="space-y-3">
						<div class="flex gap-2 text-xs font-bold">
							<button
								type="button"
								onclick={() => (videoSource = 'upload')}
								class="flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 {videoSource ===
								'upload'
									? 'bg-brand-primary text-white'
									: 'bg-gray-100 text-text-secondary'}"
							>
								<UploadCloud size={14} /> Fichier → R2
							</button>
							<button
								type="button"
								onclick={() => (videoSource = 'url')}
								class="flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 {videoSource ===
								'url'
									? 'bg-brand-primary text-white'
									: 'bg-gray-100 text-text-secondary'}"
							>
								<LinkIcon size={14} /> Lien https
							</button>
						</div>
						{#if videoSource === 'upload'}
							<label
								class="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-[#f8fafc] p-6 text-center hover:border-brand-primary/60"
							>
								<Video size={26} class="text-brand-primary" />
								<span class="mt-2 text-sm font-bold text-text-primary">
									{videoFile ? videoFile.name : 'Choisir une vidéo (MP4, WebM, MOV)'}
								</span>
								{#if videoFile}
									<span class="mt-1 text-xs text-text-secondary">
										{(videoFile.size / 1024 / 1024).toFixed(1)} Mo
									</span>
								{/if}
								<input
									type="file"
									accept="video/mp4,video/webm,video/quicktime"
									class="sr-only"
									onchange={(e) => handleVideoFile(e.currentTarget.files?.[0])}
								/>
							</label>
							{#if videoProgress > 0}
								<div class="h-2 overflow-hidden rounded-full bg-gray-100">
									<div
										class="h-full rounded-full bg-brand-primary transition-all"
										style="width: {videoProgress}%"
									></div>
								</div>
								<p class="text-xs text-text-secondary">Envoi vers R2 : {videoProgress}%</p>
							{/if}
						{:else}
							<div>
								<label for="video-url" class={labelClass}>Lien de la vidéo (https)</label>
								<input
									id="video-url"
									type="url"
									bind:value={externalVideoUrl}
									required
									placeholder="https://…/video.mp4"
									class={inputClass}
								/>
							</div>
						{/if}
					</div>

					<!-- Affiche -->
					<div>
						<span class={labelClass}>Affiche (facultatif)</span>
						<label
							class="mt-1 flex cursor-pointer items-center gap-4 rounded-2xl border border-gray-200 bg-white p-3 hover:border-brand-primary/60"
						>
							<img
								src={posterPreviewUrl ?? '/video-highlights-cover.jpg'}
								alt=""
								class="h-20 w-32 shrink-0 rounded-xl object-cover"
							/>
							<span class="text-xs text-text-secondary">
								{posterFile
									? posterFile.name
									: 'Image affichée avant la lecture. Par défaut : affiche générique ECOFIP.'}
							</span>
							<input
								type="file"
								accept="image/jpeg,image/png,image/webp"
								class="sr-only"
								onchange={(e) => handlePosterFile(e.currentTarget.files?.[0])}
							/>
						</label>
					</div>
				</div>

				<div class="grid grid-cols-1 gap-4 sm:grid-cols-4">
					<div class="sm:col-span-3">
						<label for="video-title" class={labelClass}>Titre *</label>
						<input
							id="video-title"
							name="title"
							bind:value={videoTitle}
							required
							maxlength="200"
							placeholder="Ex : Résumé de la croisade de Bafoussam"
							class={inputClass}
						/>
					</div>
					<div>
						<label for="video-duration" class={labelClass}>Durée (mm:ss)</label>
						<input
							id="video-duration"
							name="duration"
							bind:value={videoDuration}
							pattern={'\\d{1,3}:\\d{2}(:\\d{2})?'}
							placeholder="05:32"
							class={inputClass}
						/>
					</div>
				</div>

				{@render sharedFields('video')}

				<div>
					<label for="video-description" class={labelClass}>Description</label>
					<textarea
						id="video-description"
						name="description"
						bind:value={description}
						rows="2"
						maxlength="1000"
						class={inputClass}></textarea>
				</div>

				<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<label class="flex items-center gap-2 text-sm font-semibold text-text-primary">
						<input
							type="checkbox"
							name="isPublished"
							bind:checked={isPublished}
							class="h-4 w-4 rounded-sm text-brand-primary"
						/>
						Publier immédiatement dans la galerie
					</label>
					<Button
						type="submit"
						variant="primary"
						size="md"
						disabled={isSubmitting || (videoSource === 'upload' && !data.isR2Configured)}
					>
						<Video size={16} class="mr-2" />
						{isSubmitting ? 'Envoi en cours…' : 'Ajouter la vidéo'}
					</Button>
				</div>
			</form>
		{/if}
	</Card>

	<!-- ==================== LISTE ==================== -->
	<Card class="p-6 sm:p-8">
		<div
			class="mb-6 flex flex-col gap-4 border-b border-gray-100 pb-4 lg:flex-row lg:items-center lg:justify-between"
		>
			<h2 class="font-display text-xl font-bold text-text-primary">
				Médias de la galerie ({filteredItems.length})
			</h2>
			<div class="flex flex-wrap gap-2">
				<label class="sr-only" for="filter-type">Type</label>
				<select
					id="filter-type"
					bind:value={typeFilter}
					class="rounded-xl border border-gray-200 px-3 py-2 text-xs"
				>
					<option value="all">Photos et vidéos</option>
					<option value="photo">Photos</option>
					<option value="video">Vidéos</option>
				</select>
				<label class="sr-only" for="filter-category">Catégorie</label>
				<select
					id="filter-category"
					bind:value={categoryFilter}
					class="rounded-xl border border-gray-200 px-3 py-2 text-xs"
				>
					<option value="all">Toutes les catégories</option>
					{#each existingCategories as existingCategory (existingCategory)}
						<option value={existingCategory}>{existingCategory}</option>
					{/each}
				</select>
				<label class="sr-only" for="filter-status">Statut</label>
				<select
					id="filter-status"
					bind:value={statusFilter}
					class="rounded-xl border border-gray-200 px-3 py-2 text-xs"
				>
					<option value="all">Tous les statuts</option>
					<option value="published">Publiés</option>
					<option value="hidden">Masqués</option>
				</select>
			</div>
		</div>

		{#if filteredItems.length === 0}
			<div class="py-12 text-center text-text-secondary">
				<Images size={36} class="mx-auto mb-3 opacity-40" />
				<p class="text-sm">
					{data.items.length === 0
						? 'La galerie est vide. Ajoutez vos premières photos ci-dessus.'
						: 'Aucun média ne correspond à ces filtres.'}
				</p>
			</div>
		{:else}
			<div class="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
				{#each filteredItems as item (item.id)}
					<article
						class="flex flex-col overflow-hidden rounded-2xl border bg-white shadow-xs {item.isPublished
							? 'border-gray-200'
							: 'border-dashed border-gray-300 opacity-75'}"
					>
						<div class="relative aspect-video bg-gray-100">
							<img
								src={item.imageUrl}
								alt={item.title}
								class="h-full w-full object-cover"
								loading="lazy"
							/>
							<div class="absolute top-2.5 left-2.5 flex gap-1.5">
								<span
									class="inline-flex items-center gap-1 rounded-full bg-black/65 px-2.5 py-0.5 text-[11px] font-bold text-white"
								>
									{#if item.type === 'video'}
										<Video size={11} /> Vidéo
									{:else}
										<ImageIcon size={11} /> Photo
									{/if}
								</span>
								{#if !item.isPublished}
									<span
										class="rounded-full bg-gray-600 px-2.5 py-0.5 text-[11px] font-bold text-white"
										>Masqué</span
									>
								{/if}
							</div>
							{#if item.duration}
								<span
									class="absolute right-2.5 bottom-2.5 inline-flex items-center gap-1 rounded-md bg-black/75 px-2 py-0.5 text-[11px] font-bold text-white"
								>
									<Clock size={11} />
									{item.duration}
								</span>
							{/if}
						</div>
						<div class="flex-1 p-4">
							<p class="text-[11px] font-bold tracking-wider text-brand-primary uppercase">
								{item.category} · #{item.displayOrder}
							</p>
							<h3 class="mt-1 line-clamp-2 font-display text-sm font-bold text-text-primary">
								{item.title}
							</h3>
							<div class="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-text-secondary">
								{#if item.location}
									<span class="flex items-center gap-1"><MapPin size={11} />{item.location}</span>
								{/if}
								{#if item.takenAt}
									<span class="flex items-center gap-1"
										><CalendarDays size={11} />{formatDate(item.takenAt)}</span
									>
								{/if}
							</div>
						</div>
						<div
							class="flex items-center justify-between gap-2 border-t border-gray-100 bg-[#f8fafc] px-4 py-2.5"
						>
							<form
								method="POST"
								action="?/togglePublish"
								use:enhance={() =>
									async ({ result, update }) => {
										showActionResult(result as { type: string; data?: Record<string, unknown> });
										await update({ reset: false });
									}}
							>
								<input type="hidden" name="id" value={item.id} />
								<button
									type="submit"
									class="inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-brand-primary"
								>
									{#if item.isPublished}
										<EyeOff size={14} /> Masquer
									{:else}
										<Eye size={14} /> Publier
									{/if}
								</button>
							</form>
							<div class="flex items-center gap-3">
								<button
									type="button"
									onclick={() => openEdit(item)}
									class="inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-text-secondary hover:text-brand-primary"
								>
									<Pencil size={14} /> Modifier
								</button>
								<button
									type="button"
									onclick={() => {
										itemToDelete = item;
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

<!-- ==================== MODALE DE MODIFICATION ==================== -->
<Modal bind:open={isEditOpen} title="Modifier le média">
	{#if editingItem}
		<form
			id="gallery-edit-form"
			method="POST"
			action="?/update"
			use:enhance={async ({ formData, cancel }) => {
				isEditSubmitting = true;
				if (editImageFile && !editImageKey) {
					try {
						const blob = await compressImage(editImageFile);
						const result = await uploadToR2(blob, {
							filename: toUploadFilename(editImageFile.name, blob),
							folder: 'gallery'
						});
						editImageKey = result.key;
					} catch (err) {
						toast.error(err instanceof Error ? err.message : String(err), 'Envoi interrompu');
						isEditSubmitting = false;
						cancel();
						return;
					}
				}
				formData.set('imageKey', editImageKey);
				return async ({ result, update }) => {
					isEditSubmitting = false;
					showActionResult(result as { type: string; data?: Record<string, unknown> });
					if (result.type === 'success') isEditOpen = false;
					await update({ reset: false });
				};
			}}
			class="space-y-4"
		>
			<input type="hidden" name="id" value={editingItem.id} />

			<label class="flex cursor-pointer items-center gap-4 rounded-2xl border border-gray-200 p-3">
				<img
					src={editImagePreview ?? editingItem.imageUrl}
					alt=""
					class="h-20 w-32 shrink-0 rounded-xl object-cover"
				/>
				<span class="text-xs text-text-secondary">
					{editingItem.type === 'video' ? 'Changer l’affiche' : 'Remplacer la photo'} (l’ancien fichier
					sera supprimé de R2)
				</span>
				<input
					type="file"
					accept="image/jpeg,image/png,image/webp"
					class="sr-only"
					onchange={(e) => handleEditImage(e.currentTarget.files?.[0])}
				/>
			</label>

			<div>
				<label for="edit-title" class={labelClass}>Titre *</label>
				<input
					id="edit-title"
					name="title"
					bind:value={editTitle}
					required
					maxlength="200"
					class={inputClass}
				/>
			</div>
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<div>
					<label for="edit-category" class={labelClass}>Catégorie *</label>
					<input
						id="edit-category"
						name="category"
						list="gallery-categories"
						bind:value={editCategory}
						required
						maxlength="100"
						class={inputClass}
					/>
				</div>
				<div>
					<label for="edit-location" class={labelClass}>Lieu</label>
					<input
						id="edit-location"
						name="location"
						bind:value={editLocation}
						maxlength="150"
						class={inputClass}
					/>
				</div>
				<div>
					<label for="edit-date" class={labelClass}>Date</label>
					<input
						id="edit-date"
						name="takenAt"
						type="date"
						bind:value={editTakenAt}
						class={inputClass}
					/>
				</div>
				<div>
					<label for="edit-order" class={labelClass}>Ordre d’affichage</label>
					<input
						id="edit-order"
						name="displayOrder"
						type="number"
						min="0"
						bind:value={editDisplayOrder}
						class={inputClass}
					/>
				</div>
				{#if editingItem.type === 'video'}
					<div>
						<label for="edit-duration" class={labelClass}>Durée (mm:ss)</label>
						<input
							id="edit-duration"
							name="duration"
							bind:value={editDuration}
							pattern={'\\d{1,3}:\\d{2}(:\\d{2})?'}
							class={inputClass}
						/>
					</div>
				{/if}
			</div>
			<div>
				<label for="edit-description" class={labelClass}>Description</label>
				<textarea
					id="edit-description"
					name="description"
					bind:value={editDescription}
					rows="3"
					maxlength="1000"
					class={inputClass}></textarea>
			</div>
			<label class="flex items-center gap-2 text-sm font-semibold text-text-primary">
				<input
					type="checkbox"
					name="isPublished"
					bind:checked={editIsPublished}
					class="h-4 w-4 rounded-sm"
				/>
				Publié dans la galerie
			</label>
		</form>
	{/if}

	{#snippet actions()}
		<Button variant="outline" size="md" onclick={() => (isEditOpen = false)}>Annuler</Button>
		<Button
			type="submit"
			form="gallery-edit-form"
			variant="primary"
			size="md"
			disabled={isEditSubmitting}
		>
			{isEditSubmitting ? 'Enregistrement…' : 'Enregistrer'}
		</Button>
	{/snippet}
</Modal>

<!-- ==================== MODALE DE SUPPRESSION ==================== -->
<Modal bind:open={isDeleteOpen} title="Supprimer ce média ?">
	{#if itemToDelete}
		<p class="text-sm text-text-secondary">
			« {itemToDelete.title} » sera retiré de la galerie et ses fichiers supprimés définitivement de Cloudflare
			R2. Cette action est irréversible.
		</p>
	{/if}

	{#snippet actions()}
		<Button variant="outline" size="md" onclick={() => (isDeleteOpen = false)}>Annuler</Button>
		{#if itemToDelete}
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
				<input type="hidden" name="id" value={itemToDelete.id} />
				<Button type="submit" variant="primary" size="md">Supprimer définitivement</Button>
			</form>
		{/if}
	{/snippet}
</Modal>
