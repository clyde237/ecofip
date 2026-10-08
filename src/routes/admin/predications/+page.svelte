<script lang="ts">
	import { enhance } from '$app/forms';
	import {
		Plus,
		Video,
		UploadCloud,
		Eye,
		EyeOff,
		Pencil,
		Trash2,
		Clock,
		BookOpen,
		CloudOff,
		AlertTriangle,
		ExternalLink,
		Image as ImageIcon
	} from '@lucide/svelte';
	import type { PageData } from './$types.js';
	import Button from '$lib/design-system/components/Button.svelte';
	import Modal from '$lib/design-system/components/Modal.svelte';
	import { toast } from '$lib/design-system/toast.svelte.js';
	import { compressImage, toUploadFilename, uploadToR2 } from '$lib/utils/r2Upload.js';

	let { data }: { data: PageData } = $props();

	type Sermon = (typeof data.sermons)[number];

	const FOLDER = 'sermons';
	// Beaucoup de visiteurs regardent sur données mobiles : on limite le poids des vidéos
	const MAX_VIDEO_MB = 80;
	const RECOMMENDED_VIDEO_MB = 30;
	const RECOMMENDED_MAX_SECONDS = 180;
	const inputClass =
		'mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-text-primary placeholder:text-gray-400 focus:border-brand-primary focus:outline-hidden';
	const labelClass = 'block text-xs font-bold text-text-primary';

	// ==========================================
	// LISTE & FILTRES
	// ==========================================
	let statusFilter = $state<'all' | 'published' | 'draft'>('all');
	let seriesFilter = $state('all');
	let seriesList = $derived(
		Array.from(new Set(data.sermons.map((s) => s.series).filter((s): s is string => Boolean(s))))
	);
	let publishedCount = $derived(data.sermons.filter((s) => s.isPublished).length);
	let filtered = $derived(
		data.sermons.filter(
			(s) =>
				(statusFilter === 'all' || (statusFilter === 'published') === s.isPublished) &&
				(seriesFilter === 'all' || s.series === seriesFilter)
		)
	);

	function showActionResult(result: { type: string; data?: Record<string, unknown> }) {
		if (result.type === 'success') {
			toast.success(String(result.data?.message ?? 'Prédications mises à jour.'));
		} else if (result.type === 'failure') {
			toast.error(String(result.data?.error ?? 'Une erreur est survenue.'), 'Erreur');
		}
	}

	function formatDuration(seconds: number): string {
		const minutes = Math.floor(seconds / 60);
		const rest = Math.floor(seconds % 60);
		return `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`;
	}

	// ==========================================
	// ANALYSE DE LA VIDÉO CHOISIE
	// ==========================================
	type VideoInfo = { width: number; height: number; seconds: number; poster: Blob | null };

	/** Lit dimensions et durée, et capture une image vers 1 s pour servir d'affiche */
	function analyseVideo(file: File): Promise<VideoInfo> {
		return new Promise((resolve, reject) => {
			const url = URL.createObjectURL(file);
			const video = document.createElement('video');
			video.muted = true;
			video.playsInline = true;
			video.preload = 'auto';
			const done = (info: VideoInfo) => {
				URL.revokeObjectURL(url);
				resolve(info);
			};
			video.onerror = () => {
				URL.revokeObjectURL(url);
				reject(new Error('Ce fichier vidéo ne peut pas être lu par le navigateur.'));
			};
			// Certains fichiers (WebM enregistrés par un navigateur…) ne déclarent pas leur durée :
			// se placer très loin force le navigateur à la calculer, puis on revient vers 1 s.
			let measuringDuration = false;
			const seekToPosterFrame = () => {
				measuringDuration = false;
				video.currentTime = Math.min(1, (Number.isFinite(video.duration) ? video.duration : 2) / 2);
			};
			video.onloadedmetadata = () => {
				if (Number.isFinite(video.duration)) {
					seekToPosterFrame();
				} else {
					measuringDuration = true;
					video.currentTime = Number.MAX_SAFE_INTEGER;
				}
			};
			video.onseeked = () => {
				if (measuringDuration) {
					seekToPosterFrame();
					return;
				}
				const info = {
					width: video.videoWidth,
					height: video.videoHeight,
					seconds: Number.isFinite(video.duration) ? video.duration : 0
				};
				const scale = Math.min(1, 720 / Math.max(1, info.width));
				const canvas = document.createElement('canvas');
				canvas.width = Math.round(info.width * scale);
				canvas.height = Math.round(info.height * scale);
				const context = canvas.getContext('2d');
				if (!context || !canvas.width || !canvas.height) {
					done({ ...info, poster: null });
					return;
				}
				context.drawImage(video, 0, 0, canvas.width, canvas.height);
				canvas.toBlob((blob) => done({ ...info, poster: blob }), 'image/jpeg', 0.82);
			};
			video.src = url;
		});
	}

	// ==========================================
	// CRÉATION
	// ==========================================
	let isCreateOpen = $state(false);
	let isCreating = $state(false);
	let videoFile = $state<File | null>(null);
	let videoInfo = $state<VideoInfo | null>(null);
	let videoKey = $state('');
	let videoProgress = $state(0);
	let duration = $state('');
	let customPoster = $state<File | null>(null);
	let posterKey = $state('');
	let posterPreview = $state<string | null>(null);
	let isAnalysing = $state(false);

	let warnings = $derived.by(() => {
		const list: string[] = [];
		if (!videoFile || !videoInfo) return list;
		if (videoFile.size > RECOMMENDED_VIDEO_MB * 1024 * 1024) {
			list.push(
				`Fichier lourd (${(videoFile.size / 1024 / 1024).toFixed(0)} Mo) : visez moins de ${RECOMMENDED_VIDEO_MB} Mo (720×1280, H.264) pour les visiteurs sur données mobiles.`
			);
		}
		if (videoInfo.width > videoInfo.height) {
			list.push('Vidéo horizontale : le format court attendu est vertical (9:16).');
		}
		if (videoInfo.seconds > RECOMMENDED_MAX_SECONDS) {
			list.push(
				`Vidéo de ${formatDuration(videoInfo.seconds)} : un format court dure idéalement moins de 3 minutes.`
			);
		}
		return list;
	});

	function setPosterPreview(blob: Blob | null) {
		if (posterPreview) URL.revokeObjectURL(posterPreview);
		posterPreview = blob ? URL.createObjectURL(blob) : null;
	}

	function resetCreate() {
		videoFile = null;
		videoInfo = null;
		videoKey = '';
		videoProgress = 0;
		duration = '';
		customPoster = null;
		posterKey = '';
		setPosterPreview(null);
	}

	async function selectVideo(file: File | undefined) {
		if (!file) return;
		if (!file.type.startsWith('video/')) {
			toast.error('Sélectionnez un fichier vidéo (MP4, WebM, MOV).', 'Format invalide');
			return;
		}
		if (file.size > MAX_VIDEO_MB * 1024 * 1024) {
			toast.error(
				`La vidéo dépasse ${MAX_VIDEO_MB} Mo. Exportez-la en 720×1280 (H.264) pour l’alléger.`,
				'Fichier trop lourd'
			);
			return;
		}
		// Une affiche personnalisée choisie avant la vidéo est conservée
		const keptPoster = customPoster;
		resetCreate();
		customPoster = keptPoster;
		if (keptPoster) setPosterPreview(keptPoster);
		videoFile = file;
		isAnalysing = true;
		try {
			videoInfo = await analyseVideo(file);
			if (videoInfo.seconds) duration = formatDuration(videoInfo.seconds);
			if (!customPoster) setPosterPreview(videoInfo.poster);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : String(err), 'Vidéo illisible');
			videoFile = null;
		} finally {
			isAnalysing = false;
		}
	}

	function selectCustomPoster(file: File | undefined) {
		if (!file || !file.type.startsWith('image/')) return;
		customPoster = file;
		posterKey = '';
		setPosterPreview(file);
	}

	/** Envoie sur R2 ce qui ne l'est pas encore (reprise possible après une erreur) */
	async function uploadCreateFiles(): Promise<boolean> {
		try {
			if (videoFile && !videoKey) {
				const result = await uploadToR2(videoFile, {
					filename: videoFile.name,
					folder: FOLDER,
					onProgress: (percent) => (videoProgress = percent)
				});
				videoKey = result.key;
			}
			const posterSource = customPoster ?? videoInfo?.poster ?? null;
			if (posterSource && !posterKey) {
				const blob = customPoster ? await compressImage(customPoster, 1280) : posterSource;
				const result = await uploadToR2(blob, {
					filename: customPoster ? toUploadFilename(customPoster.name, blob) : 'affiche.jpg',
					folder: FOLDER
				});
				posterKey = result.key;
			}
			return true;
		} catch (err) {
			toast.error(err instanceof Error ? err.message : String(err), 'Envoi interrompu');
			return false;
		}
	}

	// ==========================================
	// MODIFICATION & SUPPRESSION
	// ==========================================
	let editing = $state<Sermon | null>(null);
	let isEditOpen = $state(false);
	let isSaving = $state(false);
	let editPosterFile = $state<File | null>(null);
	let editPosterKey = $state('');
	let editPosterPreview = $state<string | null>(null);

	function openEdit(sermon: Sermon) {
		editing = sermon;
		editPosterFile = null;
		editPosterKey = '';
		if (editPosterPreview) URL.revokeObjectURL(editPosterPreview);
		editPosterPreview = null;
		isEditOpen = true;
	}

	let toDelete = $state<Sermon | null>(null);
	let isDeleteOpen = $state(false);
</script>

<svelte:head>
	<title>Prédications — Administration ECOFIP</title>
</svelte:head>

<datalist id="sermon-series">
	{#each seriesList as series (series)}
		<option value={series}></option>
	{/each}
</datalist>

<!-- Champs communs à la création et à la modification -->
{#snippet sermonFields(prefix: string, sermon: Sermon | null)}
	<div>
		<label for="{prefix}-title" class={labelClass}>Titre *</label>
		<input
			id="{prefix}-title"
			name="title"
			required
			maxlength="200"
			value={sermon?.title ?? ''}
			placeholder="Ex : La foi qui déplace les montagnes"
			class={inputClass}
		/>
	</div>
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
		<div>
			<label for="{prefix}-preacher" class={labelClass}>Prédicateur</label>
			<input
				id="{prefix}-preacher"
				name="preacher"
				maxlength="150"
				value={sermon?.preacher ?? ''}
				placeholder="Ex : Pasteur Valéry Tchamekwen"
				class={inputClass}
			/>
		</div>
		<div>
			<label for="{prefix}-scripture" class={labelClass}>Référence biblique</label>
			<input
				id="{prefix}-scripture"
				name="scripture"
				maxlength="120"
				value={sermon?.scripture ?? ''}
				placeholder="Ex : Marc 11:23"
				class={inputClass}
			/>
		</div>
		<div>
			<label for="{prefix}-series" class={labelClass}>Série / thème</label>
			<input
				id="{prefix}-series"
				name="series"
				list="sermon-series"
				maxlength="100"
				value={sermon?.series ?? ''}
				placeholder="Ex : La foi"
				class={inputClass}
			/>
		</div>
		<div>
			<label for="{prefix}-date" class={labelClass}>Date de la prédication</label>
			<input
				id="{prefix}-date"
				name="preachedOn"
				type="date"
				value={sermon?.preachedOn ?? ''}
				class={inputClass}
			/>
		</div>
	</div>
	<div>
		<label for="{prefix}-description" class={labelClass}>Description (facultatif)</label>
		<textarea
			id="{prefix}-description"
			name="description"
			rows="2"
			maxlength="1000"
			class={inputClass}>{sermon?.description ?? ''}</textarea
		>
	</div>
{/snippet}

<div class="space-y-6">
	<div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
		<div>
			<p class="text-xs font-bold tracking-widest text-brand-primary uppercase">
				Page Prédications
			</p>
			<h1 class="mt-1 font-display text-2xl font-bold text-text-primary sm:text-3xl">
				Prédications vidéo
			</h1>
			<p class="mt-1 max-w-2xl text-sm text-text-secondary">
				{data.sermons.length} prédication{data.sermons.length > 1 ? 's' : ''}, dont {publishedCount}
				publiée{publishedCount > 1 ? 's' : ''}. Format court vertical (9:16), stocké sur Cloudflare
				R2 et visible sur la page
				<a href="/predications" target="_blank" class="font-semibold text-brand-primary underline"
					>Prédications</a
				> et sur l’accueil.
			</p>
		</div>
		<Button
			variant="primary"
			size="md"
			onclick={() => {
				resetCreate();
				isCreateOpen = true;
			}}
			disabled={!data.usingNeonDb || !data.isR2Configured}
		>
			<Plus size={17} class="mr-2" /> Nouvelle prédication
		</Button>
	</div>

	{#if !data.usingNeonDb || !data.isR2Configured}
		<div
			class="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
			role="alert"
		>
			<CloudOff size={18} class="mt-0.5 shrink-0 text-amber-600" />
			{!data.usingNeonDb
				? 'La base de données Neon est indisponible : les prédications ne peuvent pas être gérées.'
				: 'Cloudflare R2 n’est pas configuré : l’envoi de vidéos est impossible.'}
		</div>
	{/if}

	<div class="flex flex-wrap items-center gap-3">
		<div
			class="flex items-center gap-1 rounded-xl border border-gray-200 bg-white p-1 text-xs font-semibold"
		>
			{#each [{ id: 'all', label: 'Toutes' }, { id: 'published', label: 'Publiées' }, { id: 'draft', label: 'Brouillons' }] as option (option.id)}
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
		{#if seriesList.length > 0}
			<label class="sr-only" for="series-filter">Série</label>
			<select
				id="series-filter"
				bind:value={seriesFilter}
				class="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold"
			>
				<option value="all">Toutes les séries</option>
				{#each seriesList as series (series)}
					<option value={series}>{series}</option>
				{/each}
			</select>
		{/if}
	</div>

	{#if filtered.length === 0}
		<div
			class="rounded-2xl border border-gray-200 bg-white py-14 text-center text-sm text-text-secondary"
		>
			<Video size={36} class="mx-auto mb-3 opacity-40" />
			{data.sermons.length === 0
				? 'Aucune prédication pour le moment. Publiez la première !'
				: 'Aucune prédication ne correspond à ces filtres.'}
		</div>
	{:else}
		<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
			{#each filtered as sermon (sermon.id)}
				<article
					class="flex flex-col overflow-hidden rounded-2xl border bg-white shadow-xs {sermon.isPublished
						? 'border-gray-200'
						: 'border-dashed border-gray-300'}"
				>
					<div class="relative aspect-[9/16] bg-gray-900">
						{#if sermon.posterUrl}
							<img
								src={sermon.posterUrl}
								alt=""
								class="h-full w-full object-cover {sermon.isPublished ? '' : 'opacity-60'}"
								loading="lazy"
							/>
						{:else}
							<div class="flex h-full items-center justify-center text-white/40">
								<Video size={36} />
							</div>
						{/if}
						<span
							class="absolute top-2 left-2 rounded-full px-2 py-0.5 text-[10px] font-bold {sermon.isPublished
								? 'bg-emerald-500 text-white'
								: 'bg-gray-700 text-white'}"
						>
							{sermon.isPublished ? 'Publiée' : 'Brouillon'}
						</span>
						{#if sermon.duration}
							<span
								class="absolute right-2 bottom-2 inline-flex items-center gap-1 rounded-md bg-black/75 px-1.5 py-0.5 text-[10px] font-bold text-white"
							>
								<Clock size={10} />{sermon.duration}
							</span>
						{/if}
					</div>
					<div class="flex-1 p-3">
						<h3 class="line-clamp-2 text-sm leading-snug font-bold text-text-primary">
							{sermon.title}
						</h3>
						{#if sermon.preacher}
							<p class="mt-1 truncate text-[11px] text-text-secondary">{sermon.preacher}</p>
						{/if}
						{#if sermon.scripture}
							<p class="mt-0.5 flex items-center gap-1 truncate text-[11px] text-brand-primary">
								<BookOpen size={11} />{sermon.scripture}
							</p>
						{/if}
					</div>
					<div
						class="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 border-t border-gray-100 px-3 py-2 text-[11px] font-semibold"
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
							<input type="hidden" name="id" value={sermon.id} />
							<button
								type="submit"
								class="inline-flex cursor-pointer items-center gap-1 text-text-secondary hover:text-brand-primary"
							>
								{#if sermon.isPublished}<EyeOff size={12} /> Retirer{:else}<Eye size={12} /> Publier{/if}
							</button>
						</form>
						<button
							type="button"
							onclick={() => openEdit(sermon)}
							class="inline-flex cursor-pointer items-center gap-1 text-text-secondary hover:text-brand-primary"
						>
							<Pencil size={12} /> Modifier
						</button>
						{#if sermon.isPublished}
							<a
								href="/predications/{sermon.slug}"
								target="_blank"
								class="inline-flex items-center gap-1 text-text-secondary hover:text-brand-primary"
							>
								<ExternalLink size={12} /> Voir
							</a>
						{/if}
						<button
							type="button"
							onclick={() => {
								toDelete = sermon;
								isDeleteOpen = true;
							}}
							class="inline-flex cursor-pointer items-center gap-1 text-red-600 hover:text-red-700"
						>
							<Trash2 size={12} /> Supprimer
						</button>
					</div>
				</article>
			{/each}
		</div>
	{/if}
</div>

<!-- ==================== CRÉATION ==================== -->
<Modal bind:open={isCreateOpen} title="Nouvelle prédication">
	<form
		id="sermon-create-form"
		method="POST"
		action="?/create"
		use:enhance={async ({ formData, cancel }) => {
			if (!videoFile) {
				toast.error('Choisissez la vidéo de la prédication.', 'Vidéo manquante');
				cancel();
				return;
			}
			isCreating = true;
			if (!(await uploadCreateFiles())) {
				isCreating = false;
				cancel();
				return;
			}
			formData.set('videoKey', videoKey);
			formData.set('posterKey', posterKey);
			return async ({ result, update }) => {
				isCreating = false;
				showActionResult(result as { type: string; data?: Record<string, unknown> });
				if (result.type === 'success') {
					isCreateOpen = false;
					resetCreate();
				}
				await update({ reset: result.type === 'success' });
			};
		}}
		class="space-y-4"
	>
		<div class="grid grid-cols-[110px_1fr] gap-4">
			<!-- Aperçu vertical de l'affiche -->
			<div class="relative aspect-[9/16] overflow-hidden rounded-xl bg-gray-900">
				{#if posterPreview}
					<img src={posterPreview} alt="Affiche" class="h-full w-full object-cover" />
				{:else}
					<div class="flex h-full items-center justify-center text-white/40">
						<Video size={26} />
					</div>
				{/if}
			</div>
			<div class="space-y-3">
				<label
					class="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-[#f8fafc] p-4 text-center hover:border-brand-primary/60"
				>
					<UploadCloud size={22} class="text-brand-primary" />
					<span class="mt-1 text-xs font-bold text-text-primary">
						{isAnalysing
							? 'Analyse de la vidéo…'
							: videoFile
								? videoFile.name
								: 'Choisir la vidéo (verticale, MP4)'}
					</span>
					{#if videoFile && videoInfo}
						<span class="mt-0.5 text-[11px] text-text-secondary">
							{(videoFile.size / 1024 / 1024).toFixed(1)} Mo · {videoInfo.width}×{videoInfo.height} ·
							{duration}
						</span>
					{/if}
					<input
						type="file"
						accept="video/mp4,video/webm,video/quicktime"
						class="sr-only"
						onchange={(e) => selectVideo(e.currentTarget.files?.[0])}
					/>
				</label>
				{#if videoProgress > 0}
					<div class="h-2 overflow-hidden rounded-full bg-gray-100">
						<div
							class="h-full rounded-full bg-brand-primary transition-all"
							style="width: {videoProgress}%"
						></div>
					</div>
				{/if}
				<label
					class="flex cursor-pointer items-center gap-2 text-xs font-semibold text-text-secondary hover:text-brand-primary"
				>
					<ImageIcon size={14} />
					{customPoster
						? 'Affiche personnalisée choisie'
						: 'Changer l’affiche (sinon image de la vidéo)'}
					<input
						type="file"
						accept="image/jpeg,image/png,image/webp"
						class="sr-only"
						onchange={(e) => selectCustomPoster(e.currentTarget.files?.[0])}
					/>
				</label>
			</div>
		</div>

		{#if warnings.length > 0}
			<ul
				class="space-y-1 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900"
			>
				{#each warnings as warning (warning)}
					<li class="flex gap-2"><AlertTriangle size={13} class="mt-0.5 shrink-0" />{warning}</li>
				{/each}
			</ul>
		{/if}

		{@render sermonFields('create', null)}
		<input type="hidden" name="duration" value={duration} />
		<label class="flex items-center gap-2 text-sm font-semibold text-text-primary">
			<input type="checkbox" name="isPublished" checked class="h-4 w-4 rounded-sm" />
			Publier immédiatement
		</label>
	</form>

	{#snippet actions()}
		<Button variant="outline" size="md" onclick={() => (isCreateOpen = false)}>Annuler</Button>
		<Button
			type="submit"
			form="sermon-create-form"
			variant="primary"
			size="md"
			disabled={isCreating || isAnalysing || !videoFile}
		>
			{isCreating
				? videoProgress < 100
					? `Envoi ${videoProgress} %`
					: 'Enregistrement…'
				: 'Enregistrer'}
		</Button>
	{/snippet}
</Modal>

<!-- ==================== MODIFICATION ==================== -->
<Modal bind:open={isEditOpen} title="Modifier la prédication">
	{#if editing}
		<form
			id="sermon-edit-form"
			method="POST"
			action="?/update"
			use:enhance={async ({ formData, cancel }) => {
				isSaving = true;
				if (editPosterFile && !editPosterKey) {
					try {
						const blob = await compressImage(editPosterFile, 1280);
						const result = await uploadToR2(blob, {
							filename: toUploadFilename(editPosterFile.name, blob),
							folder: FOLDER
						});
						editPosterKey = result.key;
					} catch (err) {
						toast.error(err instanceof Error ? err.message : String(err), 'Envoi interrompu');
						isSaving = false;
						cancel();
						return;
					}
				}
				formData.set('posterKey', editPosterKey);
				return async ({ result, update }) => {
					isSaving = false;
					showActionResult(result as { type: string; data?: Record<string, unknown> });
					if (result.type === 'success') isEditOpen = false;
					await update({ reset: false });
				};
			}}
			class="space-y-4"
		>
			<input type="hidden" name="id" value={editing.id} />
			<input type="hidden" name="duration" value={editing.duration ?? ''} />
			<div class="grid grid-cols-[110px_1fr] gap-4">
				<!-- svelte-ignore a11y_media_has_caption -->
				<video
					src={editing.videoUrl}
					poster={editPosterPreview ?? editing.posterUrl ?? undefined}
					controls
					preload="none"
					class="aspect-[9/16] w-full rounded-xl bg-black object-cover"
				></video>
				<div class="space-y-2 text-xs text-text-secondary">
					<label
						class="flex cursor-pointer items-center gap-2 font-semibold hover:text-brand-primary"
					>
						<ImageIcon size={14} /> Changer l’affiche
						<input
							type="file"
							accept="image/jpeg,image/png,image/webp"
							class="sr-only"
							onchange={(e) => {
								const file = e.currentTarget.files?.[0];
								if (!file) return;
								editPosterFile = file;
								editPosterKey = '';
								if (editPosterPreview) URL.revokeObjectURL(editPosterPreview);
								editPosterPreview = URL.createObjectURL(file);
							}}
						/>
					</label>
					<p>
						Pour remplacer la vidéo elle-même, supprimez cette prédication et créez-en une nouvelle.
					</p>
				</div>
			</div>
			{@render sermonFields('edit', editing)}
			<label class="flex items-center gap-2 text-sm font-semibold text-text-primary">
				<input
					type="checkbox"
					name="isPublished"
					checked={editing.isPublished}
					class="h-4 w-4 rounded-sm"
				/>
				Publiée sur le site
			</label>
		</form>
	{/if}

	{#snippet actions()}
		<Button variant="outline" size="md" onclick={() => (isEditOpen = false)}>Annuler</Button>
		<Button type="submit" form="sermon-edit-form" variant="primary" size="md" disabled={isSaving}>
			{isSaving ? 'Enregistrement…' : 'Enregistrer'}
		</Button>
	{/snippet}
</Modal>

<!-- ==================== SUPPRESSION ==================== -->
<Modal bind:open={isDeleteOpen} title="Supprimer cette prédication ?">
	{#if toDelete}
		<p class="text-sm text-text-secondary">
			« {toDelete.title} » sera supprimée définitivement, ainsi que sa vidéo et son affiche sur Cloudflare
			R2.
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
