<script lang="ts">
	import { enhance } from '$app/forms';
	import {
		ArrowLeft,
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
		Star,
		ExternalLink,
		CloudOff,
		FolderInput
	} from '@lucide/svelte';
	import type { PageData } from './$types.js';
	import Card from '$lib/design-system/components/Card.svelte';
	import Button from '$lib/design-system/components/Button.svelte';
	import Modal from '$lib/design-system/components/Modal.svelte';
	import AlbumFormFields from '../AlbumFormFields.svelte';
	import { toast } from '$lib/design-system/toast.svelte.js';
	import { compressImage, toUploadFilename, uploadToR2 } from '$lib/utils/r2Upload.js';

	let { data }: { data: PageData } = $props();

	type GalleryItem = (typeof data.items)[number];

	const MAX_PHOTOS_PER_BATCH = 50;
	const inputClass =
		'mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-text-primary placeholder:text-gray-400 focus:border-brand-primary focus:outline-hidden';
	const labelClass = 'block text-xs font-bold text-text-primary';

	let album = $derived(data.album);
	let photoCount = $derived(data.items.filter((item) => item.type === 'photo').length);
	let videoCount = $derived(data.items.filter((item) => item.type === 'video').length);
	let coverId = $derived(
		data.items.find((item) => item.id === album.coverItemId)?.id ??
			data.items.find((item) => item.type === 'photo')?.id ??
			data.items[0]?.id
	);

	function titleFromFilename(filename: string): string {
		const clean = filename
			.replace(/\.[^/.]+$/, '')
			.replace(/[-_]+/g, ' ')
			.trim();
		return clean.charAt(0).toUpperCase() + clean.slice(1);
	}

	function showActionResult(result: { type: string; data?: Record<string, unknown> }) {
		if (result.type === 'success') {
			toast.success(String(result.data?.message ?? 'Album mis à jour.'));
		} else if (result.type === 'failure') {
			toast.error(String(result.data?.error ?? 'Une erreur est survenue.'), 'Erreur');
		}
	}

	// ==========================================
	// MODIFICATION DE L'ALBUM
	// ==========================================
	let isAlbumEditOpen = $state(false);
	let isAlbumSaving = $state(false);

	// ==========================================
	// AJOUT DE MÉDIAS
	// ==========================================
	let addMode = $state<'photos' | 'video'>('photos');
	let description = $state('');
	let isPublished = $state(true);
	let isSubmitting = $state(false);

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
		const all = Array.from(files);
		const images = all.filter((file) => file.type.startsWith('image/'));
		if (images.length < all.length) {
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

	function resetPhotoForm() {
		pendingPhotos.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
		pendingPhotos = [];
		description = '';
		isPublished = true;
	}

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
		description = '';
		isPublished = true;
	}

	// ==========================================
	// MODIFICATION & SUPPRESSION D'UN MÉDIA
	// ==========================================
	let editingItem = $state<GalleryItem | null>(null);
	let isEditOpen = $state(false);
	let editTitle = $state('');
	let editDescription = $state('');
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

	// Sélection multiple pour déplacer des médias vers un autre album
	let selectedIds = $state<number[]>([]);
	let moveTargetId = $state('');
	let isMoving = $state(false);
	let allSelected = $derived(
		data.items.length > 0 && data.items.every((item) => selectedIds.includes(item.id))
	);

	function toggleSelected(id: number) {
		selectedIds = selectedIds.includes(id)
			? selectedIds.filter((selected) => selected !== id)
			: [...selectedIds, id];
	}

	let itemToDelete = $state<GalleryItem | null>(null);
	let isDeleteOpen = $state(false);
</script>

<svelte:head>
	<title>{album.title} — Galerie — Administration ECOFIP</title>
</svelte:head>

<div class="space-y-8">
	<!-- En-tête de l'album -->
	<div>
		<a
			href="/admin/galerie"
			class="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-brand-primary"
		>
			<ArrowLeft size={14} /> Tous les albums
		</a>
		<div class="mt-3 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
			<div>
				<div class="flex flex-wrap items-center gap-2">
					<span
						class="rounded-full bg-brand-subtle px-3 py-0.5 text-xs font-bold text-brand-primary"
					>
						{album.category}
					</span>
					{#if !album.isPublished}
						<span class="rounded-full bg-gray-700 px-3 py-0.5 text-xs font-bold text-white">
							Album masqué
						</span>
					{/if}
				</div>
				<h1 class="mt-2 font-display text-2xl font-bold text-text-primary sm:text-3xl">
					{album.title}
				</h1>
				<div class="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-text-secondary">
					{#if album.location}
						<span class="flex items-center gap-1.5"><MapPin size={14} />{album.location}</span>
					{/if}
					{#if album.year}
						<span class="flex items-center gap-1.5"><CalendarDays size={14} />{album.year}</span>
					{/if}
					<span class="flex items-center gap-1.5"
						><ImageIcon size={14} />{photoCount} photo{photoCount > 1 ? 's' : ''}</span
					>
					<span class="flex items-center gap-1.5"
						><Video size={14} />{videoCount} vidéo{videoCount > 1 ? 's' : ''}</span
					>
				</div>
				{#if album.description}
					<p class="mt-2 max-w-3xl text-sm text-text-secondary">{album.description}</p>
				{/if}
			</div>
			<div class="flex shrink-0 gap-2">
				{#if album.isPublished}
					<a
						href="/galerie/{album.slug}"
						target="_blank"
						class="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-bold text-text-primary hover:border-brand-primary hover:text-brand-primary"
					>
						<ExternalLink size={14} /> Voir sur le site
					</a>
				{/if}
				<button
					type="button"
					onclick={() => (isAlbumEditOpen = true)}
					class="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-bold text-text-primary hover:border-brand-primary hover:text-brand-primary"
				>
					<Pencil size={14} /> Modifier l’album
				</button>
			</div>
		</div>
	</div>

	{#if !data.isR2Configured}
		<div
			class="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
			role="alert"
		>
			<CloudOff size={18} class="mt-0.5 shrink-0 text-amber-600" />
			<p>
				Cloudflare R2 n’est pas configuré : l’envoi de fichiers est impossible. Renseignez les
				variables R2_* du fichier .env.
			</p>
		</div>
	{/if}

	<!-- ==================== AJOUT DE MÉDIAS ==================== -->
	<Card class="p-6 sm:p-8">
		<div class="mb-6 flex flex-col gap-4 border-b border-gray-100 pb-4 sm:flex-row sm:items-center">
			<div class="flex-1">
				<h2 class="font-display text-xl font-bold text-text-primary">Ajouter à cet album</h2>
				<p class="mt-1 text-xs text-text-secondary sm:text-sm">
					Catégorie, lieu et date sont repris de l’album.
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

				<div>
					<label for="photos-description" class={labelClass}>Légende commune (facultatif)</label>
					<textarea
						id="photos-description"
						name="description"
						bind:value={description}
						rows="2"
						maxlength="1000"
						placeholder="Texte affiché sous chaque photo dans la visionneuse"
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
						Publier immédiatement
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
							placeholder="Ex : Résumé de la soirée d’ouverture"
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
						Publier immédiatement
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

	<!-- ==================== MÉDIAS DE L'ALBUM ==================== -->
	<Card class="p-6 sm:p-8">
		<div
			class="mb-6 flex flex-col gap-3 border-b border-gray-100 pb-4 lg:flex-row lg:items-center lg:justify-between"
		>
			<h2 class="font-display text-xl font-bold text-text-primary">
				Contenu de l’album ({data.items.length})
			</h2>
			{#if data.items.length > 0}
				<div class="flex flex-wrap items-center gap-3 text-xs">
					<label class="flex items-center gap-2 font-semibold text-text-secondary">
						<input
							type="checkbox"
							checked={allSelected}
							onchange={() => (selectedIds = allSelected ? [] : data.items.map((item) => item.id))}
							class="h-4 w-4 rounded-sm"
						/>
						Tout sélectionner
					</label>
					{#if selectedIds.length > 0}
						<form
							method="POST"
							action="?/moveItems"
							use:enhance={() => {
								isMoving = true;
								return async ({ result, update }) => {
									isMoving = false;
									showActionResult(result as { type: string; data?: Record<string, unknown> });
									if (result.type === 'success') {
										selectedIds = [];
										moveTargetId = '';
									}
									await update({ reset: false });
								};
							}}
							class="flex flex-wrap items-center gap-2"
						>
							{#each selectedIds as id (id)}
								<input type="hidden" name="itemIds" value={id} />
							{/each}
							<span class="font-bold text-text-primary">{selectedIds.length} sélectionné(s)</span>
							{#if data.otherAlbums.length > 0}
								<label for="move-target" class="sr-only">Album de destination</label>
								<select
									id="move-target"
									name="targetAlbumId"
									bind:value={moveTargetId}
									required
									class="max-w-56 rounded-xl border border-gray-200 px-3 py-2"
								>
									<option value="" disabled>Déplacer vers…</option>
									{#each data.otherAlbums as other (other.id)}
										<option value={String(other.id)}>{other.title}</option>
									{/each}
								</select>
								<button
									type="submit"
									disabled={!moveTargetId || isMoving}
									class="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-brand-primary px-3.5 py-2 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
								>
									<FolderInput size={14} />
									{isMoving ? 'Déplacement…' : 'Déplacer'}
								</button>
							{:else}
								<span class="text-text-secondary"
									>Créez un autre album pour pouvoir y déplacer des médias.</span
								>
							{/if}
						</form>
					{/if}
				</div>
			{/if}
		</div>

		{#if data.items.length === 0}
			<div class="py-12 text-center text-text-secondary">
				<Images size={36} class="mx-auto mb-3 opacity-40" />
				<p class="text-sm">L’album est vide. Ajoutez vos premières photos ci-dessus.</p>
				<p class="mt-1 text-xs">Un album vide n’apparaît pas sur le site.</p>
			</div>
		{:else}
			<div class="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
				{#each data.items as item (item.id)}
					<article
						class="flex flex-col overflow-hidden rounded-2xl border bg-white shadow-xs {selectedIds.includes(
							item.id
						)
							? 'border-brand-primary ring-2 ring-brand-primary/40'
							: item.isPublished
								? 'border-gray-200'
								: 'border-dashed border-gray-300 opacity-75'}"
					>
						<div class="relative aspect-[4/3] bg-gray-100">
							<label
								class="absolute top-2 right-2 z-10 flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg bg-white/90 shadow-xs"
							>
								<span class="sr-only">Sélectionner {item.title}</span>
								<input
									type="checkbox"
									checked={selectedIds.includes(item.id)}
									onchange={() => toggleSelected(item.id)}
									class="h-4 w-4 cursor-pointer rounded-sm"
								/>
							</label>
							<img
								src={item.imageUrl}
								alt={item.title}
								class="h-full w-full object-cover"
								loading="lazy"
							/>
							<div class="absolute top-2 left-2 flex flex-wrap gap-1.5">
								{#if item.type === 'video'}
									<span
										class="inline-flex items-center gap-1 rounded-full bg-black/65 px-2 py-0.5 text-[11px] font-bold text-white"
									>
										<Video size={11} /> Vidéo
									</span>
								{/if}
								{#if item.id === coverId}
									<span
										class="inline-flex items-center gap-1 rounded-full bg-amber-400 px-2 py-0.5 text-[11px] font-bold text-amber-950"
									>
										<Star size={11} class="fill-amber-950" /> Couverture
									</span>
								{/if}
								{#if !item.isPublished}
									<span
										class="rounded-full bg-gray-700 px-2 py-0.5 text-[11px] font-bold text-white"
										>Masqué</span
									>
								{/if}
							</div>
							{#if item.duration}
								<span
									class="absolute right-2 bottom-2 inline-flex items-center gap-1 rounded-md bg-black/75 px-2 py-0.5 text-[11px] font-bold text-white"
								>
									<Clock size={11} />
									{item.duration}
								</span>
							{/if}
						</div>
						<div class="flex-1 px-3.5 pt-3">
							<p class="text-[11px] font-bold text-text-secondary">#{item.displayOrder}</p>
							<h3 class="line-clamp-2 text-sm font-bold text-text-primary">{item.title}</h3>
						</div>
						<div
							class="flex flex-wrap items-center gap-x-3 gap-y-1.5 px-3.5 py-3 text-xs font-semibold"
						>
							<form
								method="POST"
								action="?/toggleItemPublish"
								use:enhance={() =>
									async ({ result, update }) => {
										showActionResult(result as { type: string; data?: Record<string, unknown> });
										await update({ reset: false });
									}}
							>
								<input type="hidden" name="itemId" value={item.id} />
								<button
									type="submit"
									class="inline-flex cursor-pointer items-center gap-1 text-text-secondary hover:text-brand-primary"
								>
									{#if item.isPublished}
										<EyeOff size={13} /> Masquer
									{:else}
										<Eye size={13} /> Publier
									{/if}
								</button>
							</form>
							{#if item.id !== coverId}
								<form
									method="POST"
									action="?/setCover"
									use:enhance={() =>
										async ({ result, update }) => {
											showActionResult(result as { type: string; data?: Record<string, unknown> });
											await update({ reset: false });
										}}
								>
									<input type="hidden" name="itemId" value={item.id} />
									<button
										type="submit"
										class="inline-flex cursor-pointer items-center gap-1 text-text-secondary hover:text-amber-700"
									>
										<Star size={13} /> Couverture
									</button>
								</form>
							{/if}
							<button
								type="button"
								onclick={() => openEdit(item)}
								class="inline-flex cursor-pointer items-center gap-1 text-text-secondary hover:text-brand-primary"
							>
								<Pencil size={13} /> Modifier
							</button>
							<button
								type="button"
								onclick={() => {
									itemToDelete = item;
									isDeleteOpen = true;
								}}
								class="inline-flex cursor-pointer items-center gap-1 text-red-600 hover:text-red-700"
							>
								<Trash2 size={13} /> Supprimer
							</button>
						</div>
					</article>
				{/each}
			</div>
		{/if}
	</Card>
</div>

<!-- ==================== MODIFICATION DE L'ALBUM ==================== -->
<Modal bind:open={isAlbumEditOpen} title="Modifier l’album">
	<form
		id="album-edit-form"
		method="POST"
		action="?/updateAlbum"
		use:enhance={() => {
			isAlbumSaving = true;
			return async ({ result, update }) => {
				isAlbumSaving = false;
				showActionResult(result as { type: string; data?: Record<string, unknown> });
				if (result.type === 'success') isAlbumEditOpen = false;
				await update({ reset: false });
			};
		}}
		class="space-y-4"
	>
		<AlbumFormFields idPrefix="edit-album" categorySuggestions={data.categories} values={album} />
	</form>

	{#snippet actions()}
		<Button variant="outline" size="md" onclick={() => (isAlbumEditOpen = false)}>Annuler</Button>
		<Button
			type="submit"
			form="album-edit-form"
			variant="primary"
			size="md"
			disabled={isAlbumSaving}
		>
			{isAlbumSaving ? 'Enregistrement…' : 'Enregistrer'}
		</Button>
	{/snippet}
</Modal>

<!-- ==================== MODIFICATION D'UN MÉDIA ==================== -->
<Modal bind:open={isEditOpen} title="Modifier le média">
	{#if editingItem}
		<form
			id="item-edit-form"
			method="POST"
			action="?/updateItem"
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
			<input type="hidden" name="itemId" value={editingItem.id} />

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
					<label for="edit-order" class={labelClass}>Ordre dans l’album</label>
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
				<label for="edit-description" class={labelClass}>Légende</label>
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
				Publié
			</label>
		</form>
	{/if}

	{#snippet actions()}
		<Button variant="outline" size="md" onclick={() => (isEditOpen = false)}>Annuler</Button>
		<Button
			type="submit"
			form="item-edit-form"
			variant="primary"
			size="md"
			disabled={isEditSubmitting}
		>
			{isEditSubmitting ? 'Enregistrement…' : 'Enregistrer'}
		</Button>
	{/snippet}
</Modal>

<!-- ==================== SUPPRESSION D'UN MÉDIA ==================== -->
<Modal bind:open={isDeleteOpen} title="Supprimer ce média ?">
	{#if itemToDelete}
		<p class="text-sm text-text-secondary">
			« {itemToDelete.title} » sera retiré de l’album et ses fichiers supprimés définitivement de Cloudflare
			R2. Cette action est irréversible.
		</p>
	{/if}

	{#snippet actions()}
		<Button variant="outline" size="md" onclick={() => (isDeleteOpen = false)}>Annuler</Button>
		{#if itemToDelete}
			<form
				method="POST"
				action="?/deleteItem"
				use:enhance={() =>
					async ({ result, update }) => {
						showActionResult(result as { type: string; data?: Record<string, unknown> });
						isDeleteOpen = false;
						await update({ reset: false });
					}}
			>
				<input type="hidden" name="itemId" value={itemToDelete.id} />
				<Button type="submit" variant="primary" size="md">Supprimer définitivement</Button>
			</form>
		{/if}
	{/snippet}
</Modal>
