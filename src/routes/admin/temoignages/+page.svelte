<script lang="ts">
	import { enhance } from '$app/forms';
	import {
		Plus,
		Quote,
		Video,
		UploadCloud,
		Link as LinkIcon,
		Eye,
		EyeOff,
		Pencil,
		Trash2,
		Phone,
		CloudOff,
		UserRound,
		Clock
	} from '@lucide/svelte';
	import type { PageData } from './$types.js';
	import Button from '$lib/design-system/components/Button.svelte';
	import Modal from '$lib/design-system/components/Modal.svelte';
	import { toast } from '$lib/design-system/toast.svelte.js';
	import { compressImage, toUploadFilename, uploadToR2 } from '$lib/utils/r2Upload.js';

	let { data }: { data: PageData } = $props();

	type Testimonial = (typeof data.testimonials)[number];

	const FOLDER = 'testimonials';
	const inputClass =
		'mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-text-primary placeholder:text-gray-400 focus:border-brand-primary focus:outline-hidden';
	const labelClass = 'block text-xs font-bold text-text-primary';

	// ==========================================
	// FILTRES
	// ==========================================
	let statusFilter = $state<'all' | 'pending' | 'published'>('all');
	let typeFilter = $state<'all' | 'text' | 'video'>('all');

	let pendingCount = $derived(data.testimonials.filter((t) => !t.isApproved).length);
	let publishedCount = $derived(data.testimonials.filter((t) => t.isApproved).length);
	let videoCount = $derived(data.testimonials.filter((t) => t.type === 'video').length);
	let filtered = $derived(
		data.testimonials.filter(
			(t) =>
				(statusFilter === 'all' || (statusFilter === 'published') === t.isApproved) &&
				(typeFilter === 'all' || t.type === typeFilter)
		)
	);

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
			toast.success(String(result.data?.message ?? 'Témoignages mis à jour.'));
		} else if (result.type === 'failure') {
			toast.error(String(result.data?.error ?? 'Une erreur est survenue.'), 'Erreur');
		}
	}

	function formatDuration(seconds: number): string {
		const minutes = Math.floor(seconds / 60);
		const rest = Math.floor(seconds % 60);
		return `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`;
	}

	/** Compresse une photo (portrait ou affiche) puis l'envoie dans le dossier R2 des témoignages */
	async function uploadImage(file: File, maxDimension: number): Promise<string> {
		const blob = await compressImage(file, maxDimension);
		const result = await uploadToR2(blob, {
			filename: toUploadFilename(file.name, blob),
			folder: FOLDER
		});
		return result.key;
	}

	function previewOf(file: File | null): string | null {
		return file ? URL.createObjectURL(file) : null;
	}

	// ==========================================
	// CRÉATION
	// ==========================================
	let isCreateOpen = $state(false);
	let isCreating = $state(false);
	let createType = $state<'text' | 'video'>('text');
	let createAvatarFile = $state<File | null>(null);
	let createAvatarKey = $state('');
	let videoSource = $state<'upload' | 'url'>('upload');
	let createVideoFile = $state<File | null>(null);
	let createVideoKey = $state('');
	let createVideoProgress = $state(0);
	let createDuration = $state('');
	let createPosterFile = $state<File | null>(null);
	let createPosterKey = $state('');
	let createAvatarPreview = $derived(previewOf(createAvatarFile));
	let createPosterPreview = $derived(previewOf(createPosterFile));

	function openCreate(type: 'text' | 'video') {
		createType = type;
		createAvatarFile = null;
		createAvatarKey = '';
		videoSource = 'upload';
		createVideoFile = null;
		createVideoKey = '';
		createVideoProgress = 0;
		createDuration = '';
		createPosterFile = null;
		createPosterKey = '';
		isCreateOpen = true;
	}

	function handleVideoFile(file: File | undefined) {
		if (!file) return;
		if (!file.type.startsWith('video/')) {
			toast.error('Sélectionnez un fichier vidéo (MP4, WebM, MOV).', 'Format invalide');
			return;
		}
		createVideoFile = file;
		createVideoKey = '';
		createVideoProgress = 0;
		// Durée lue dans les métadonnées du fichier local
		const probe = document.createElement('video');
		probe.preload = 'metadata';
		const probeUrl = URL.createObjectURL(file);
		probe.onloadedmetadata = () => {
			if (Number.isFinite(probe.duration)) createDuration = formatDuration(probe.duration);
			URL.revokeObjectURL(probeUrl);
		};
		probe.onerror = () => URL.revokeObjectURL(probeUrl);
		probe.src = probeUrl;
	}

	/** Envoie sur R2 les fichiers pas encore envoyés (reprise possible après une erreur) */
	async function uploadCreateFiles(): Promise<boolean> {
		try {
			if (createAvatarFile && !createAvatarKey) {
				createAvatarKey = await uploadImage(createAvatarFile, 600);
			}
			if (createType === 'video') {
				if (videoSource === 'upload' && createVideoFile && !createVideoKey) {
					const result = await uploadToR2(createVideoFile, {
						filename: createVideoFile.name,
						folder: FOLDER,
						onProgress: (percent) => (createVideoProgress = percent)
					});
					createVideoKey = result.key;
				}
				if (createPosterFile && !createPosterKey) {
					createPosterKey = await uploadImage(createPosterFile, 1600);
				}
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
	let editing = $state<Testimonial | null>(null);
	let isEditOpen = $state(false);
	let isSaving = $state(false);
	let editAvatarFile = $state<File | null>(null);
	let editAvatarKey = $state('');
	let removeAvatar = $state(false);
	let editPosterFile = $state<File | null>(null);
	let editPosterKey = $state('');
	let editAvatarPreview = $derived(previewOf(editAvatarFile));
	let editPosterPreview = $derived(previewOf(editPosterFile));

	function openEdit(item: Testimonial) {
		editing = item;
		editAvatarFile = null;
		editAvatarKey = '';
		removeAvatar = false;
		editPosterFile = null;
		editPosterKey = '';
		isEditOpen = true;
	}

	async function uploadEditFiles(): Promise<boolean> {
		try {
			if (editAvatarFile && !editAvatarKey) editAvatarKey = await uploadImage(editAvatarFile, 600);
			if (editPosterFile && !editPosterKey) editPosterKey = await uploadImage(editPosterFile, 1600);
			return true;
		} catch (err) {
			toast.error(err instanceof Error ? err.message : String(err), 'Envoi interrompu');
			return false;
		}
	}

	let toDelete = $state<Testimonial | null>(null);
	let isDeleteOpen = $state(false);
</script>

<svelte:head>
	<title>Témoignages — Administration ECOFIP</title>
</svelte:head>

<div class="space-y-6">
	<!-- En-tête -->
	<div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
		<div>
			<p class="text-xs font-bold tracking-widest text-brand-primary uppercase">
				Accueil & page Témoignages
			</p>
			<h1 class="mt-1 font-display text-2xl font-bold text-text-primary sm:text-3xl">
				Témoignages
			</h1>
			<p class="mt-1 max-w-2xl text-sm text-text-secondary">
				Validez les témoignages envoyés par les visiteurs, ou publiez-en vous-même (écrits ou
				vidéos). L’accueil affiche les 3 derniers témoignages écrits publiés ; la page
				<a href="/temoignages" target="_blank" class="font-semibold text-brand-primary underline"
					>Témoignages</a
				> les liste tous.
			</p>
		</div>
		<div class="flex flex-wrap gap-2">
			<Button
				variant="outline"
				size="md"
				onclick={() => openCreate('text')}
				disabled={!data.usingNeonDb}
			>
				<Quote size={16} class="mr-2" /> Témoignage écrit
			</Button>
			<Button
				variant="primary"
				size="md"
				onclick={() => openCreate('video')}
				disabled={!data.usingNeonDb}
			>
				<Plus size={16} class="mr-2" /> Témoignage vidéo
			</Button>
		</div>
	</div>

	{#if !data.usingNeonDb || !data.isR2Configured}
		<div
			class="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
			role="alert"
		>
			<CloudOff size={18} class="mt-0.5 shrink-0 text-amber-600" />
			<p>
				{#if !data.usingNeonDb}
					La base de données Neon est indisponible : les témoignages ne peuvent pas être gérés.
				{:else}
					Cloudflare R2 n’est pas configuré : l’envoi de photos et de vidéos est impossible.
				{/if}
			</p>
		</div>
	{/if}

	<!-- Filtres -->
	<div class="flex flex-wrap items-center gap-3">
		<div
			class="flex items-center gap-1 rounded-xl border border-gray-200 bg-white p-1 text-xs font-semibold shadow-xs"
		>
			{#each [{ id: 'all', label: `Tous (${data.testimonials.length})` }, { id: 'pending', label: `À valider (${pendingCount})` }, { id: 'published', label: `Publiés (${publishedCount})` }] as option (option.id)}
				<button
					type="button"
					aria-pressed={statusFilter === option.id}
					onclick={() => (statusFilter = option.id as typeof statusFilter)}
					class="cursor-pointer rounded-lg px-3 py-1.5 transition-colors {statusFilter === option.id
						? 'bg-brand-primary text-white'
						: 'text-text-secondary hover:text-text-primary'}"
				>
					{option.label}
				</button>
			{/each}
		</div>
		<label class="sr-only" for="type-filter">Type</label>
		<select
			id="type-filter"
			bind:value={typeFilter}
			class="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold"
		>
			<option value="all">Écrits et vidéos</option>
			<option value="text">Écrits</option>
			<option value="video">Vidéos ({videoCount})</option>
		</select>
	</div>

	<!-- Liste -->
	{#if filtered.length === 0}
		<div
			class="rounded-2xl border border-gray-200 bg-white py-14 text-center text-sm text-text-secondary"
		>
			{data.testimonials.length === 0
				? 'Aucun témoignage pour le moment.'
				: 'Aucun témoignage ne correspond à ces filtres.'}
		</div>
	{:else}
		<div class="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
			{#each filtered as item (item.id)}
				<article
					class="flex flex-col rounded-2xl border bg-white shadow-xs {item.isApproved
						? 'border-emerald-200'
						: 'border-amber-200'}"
				>
					{#if item.type === 'video'}
						<div class="relative aspect-video overflow-hidden rounded-t-2xl bg-gray-900">
							<img
								src={item.posterUrl ?? item.avatarUrl ?? '/video-highlights-cover.jpg'}
								alt=""
								class="h-full w-full object-cover opacity-90"
								loading="lazy"
							/>
							{#if item.duration}
								<span
									class="absolute right-2 bottom-2 inline-flex items-center gap-1 rounded-md bg-black/75 px-2 py-0.5 text-[11px] font-bold text-white"
								>
									<Clock size={11} />{item.duration}
								</span>
							{/if}
						</div>
					{/if}
					<div class="flex flex-1 flex-col p-5">
						<div class="flex flex-wrap gap-1.5 text-[10px] font-bold">
							<span
								class="rounded-full px-2.5 py-0.5 {item.isApproved
									? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
									: 'border border-amber-200 bg-amber-50 text-amber-700'}"
							>
								{item.isApproved ? 'Publié' : 'À valider'}
							</span>
							<span
								class="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-text-secondary"
							>
								{item.type === 'video' ? 'Vidéo' : 'Écrit'}
							</span>
							<span
								class="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-text-secondary"
							>
								{item.source === 'admin' ? 'Créé par l’admin' : 'Envoyé par un visiteur'}
							</span>
						</div>

						<div class="mt-3 flex items-center gap-3">
							{#if item.avatarUrl}
								<img src={item.avatarUrl} alt="" class="h-10 w-10 rounded-full object-cover" />
							{:else}
								<div
									class="flex h-10 w-10 items-center justify-center rounded-full bg-brand-subtle text-sm font-bold text-brand-primary"
								>
									{item.authorName.charAt(0).toUpperCase()}
								</div>
							{/if}
							<div class="min-w-0">
								<h3 class="truncate font-display text-sm font-bold text-text-primary">
									{item.authorName}
								</h3>
								<p class="truncate text-xs text-text-secondary">
									{[item.authorRole, item.authorCity].filter(Boolean).join(' · ') || '—'}
								</p>
							</div>
						</div>

						{#if item.content}
							<p
								class="mt-3 line-clamp-6 rounded-xl bg-gray-50 p-3 text-xs leading-relaxed whitespace-pre-line text-text-secondary"
							>
								{item.content}
							</p>
						{/if}

						<div class="mt-3 space-y-1 text-[11px] text-text-secondary">
							<p>Reçu le {formatDate(item.submittedAt)}</p>
							{#if item.contactInfo}
								<p class="flex items-center gap-1" title="Visible uniquement dans l’admin">
									<Phone size={11} /> Contact (privé) : {item.contactInfo}
								</p>
							{/if}
						</div>
					</div>

					<div
						class="flex items-center justify-between gap-2 border-t border-gray-100 bg-[#f8fafc] px-5 py-3 text-xs font-semibold"
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
							{#if item.isApproved}
								<button
									type="submit"
									class="inline-flex cursor-pointer items-center gap-1 text-text-secondary hover:text-amber-700"
								>
									<EyeOff size={14} /> Retirer du site
								</button>
							{:else}
								<button
									type="submit"
									class="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-white hover:bg-emerald-700"
								>
									<Eye size={14} /> Valider et publier
								</button>
							{/if}
						</form>
						<div class="flex items-center gap-3">
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
									toDelete = item;
									isDeleteOpen = true;
								}}
								class="inline-flex cursor-pointer items-center gap-1 text-red-600 hover:text-red-700"
							>
								<Trash2 size={13} /> Supprimer
							</button>
						</div>
					</div>
				</article>
			{/each}
		</div>
	{/if}
</div>

<!-- Champs auteur communs à la création et à la modification -->
{#snippet authorFields(prefix: string, item: Testimonial | null)}
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
		<div>
			<label for="{prefix}-name" class={labelClass}>Nom *</label>
			<input
				id="{prefix}-name"
				name="authorName"
				required
				maxlength="150"
				value={item?.authorName ?? ''}
				class={inputClass}
			/>
		</div>
		<div>
			<label for="{prefix}-role" class={labelClass}>Fonction / présentation</label>
			<input
				id="{prefix}-role"
				name="authorRole"
				maxlength="150"
				value={item?.authorRole ?? ''}
				placeholder="Ex : Commerçant"
				class={inputClass}
			/>
		</div>
		<div>
			<label for="{prefix}-city" class={labelClass}>Ville</label>
			<input
				id="{prefix}-city"
				name="authorCity"
				maxlength="100"
				value={item?.authorCity ?? ''}
				placeholder="Ex : Douala"
				class={inputClass}
			/>
		</div>
	</div>
{/snippet}

<!-- ==================== CRÉATION ==================== -->
<Modal
	bind:open={isCreateOpen}
	title={createType === 'video' ? 'Nouveau témoignage vidéo' : 'Nouveau témoignage écrit'}
>
	<form
		id="testimonial-create-form"
		method="POST"
		action="?/create"
		use:enhance={async ({ formData, cancel }) => {
			if (createType === 'video' && videoSource === 'upload' && !createVideoFile) {
				toast.error('Choisissez un fichier vidéo.', 'Vidéo manquante');
				cancel();
				return;
			}
			isCreating = true;
			if (!(await uploadCreateFiles())) {
				isCreating = false;
				cancel();
				return;
			}
			formData.set('type', createType);
			formData.set('avatarKey', createAvatarKey);
			formData.set(
				'videoKey',
				createType === 'video' && videoSource === 'upload' ? createVideoKey : ''
			);
			formData.set('posterKey', createPosterKey);
			return async ({ result, update }) => {
				isCreating = false;
				showActionResult(result as { type: string; data?: Record<string, unknown> });
				if (result.type === 'success') isCreateOpen = false;
				await update({ reset: result.type === 'success' });
			};
		}}
		class="space-y-4"
	>
		{@render authorFields('create', null)}

		<label class="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 p-3">
			{#if createAvatarPreview}
				<img src={createAvatarPreview} alt="" class="h-12 w-12 rounded-full object-cover" />
			{:else}
				<span
					class="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400"
				>
					<UserRound size={22} />
				</span>
			{/if}
			<span class="text-xs text-text-secondary">
				{createAvatarFile ? createAvatarFile.name : 'Photo de la personne (facultatif)'}
			</span>
			<input
				type="file"
				accept="image/jpeg,image/png,image/webp"
				class="sr-only"
				onchange={(e) => {
					createAvatarFile = e.currentTarget.files?.[0] ?? null;
					createAvatarKey = '';
				}}
			/>
		</label>

		{#if createType === 'video'}
			<div class="space-y-3 rounded-xl border border-gray-200 p-3">
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
						class="flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed border-gray-300 bg-[#f8fafc] p-5 text-center"
					>
						<Video size={24} class="text-brand-primary" />
						<span class="mt-1.5 text-sm font-bold text-text-primary">
							{createVideoFile ? createVideoFile.name : 'Choisir la vidéo (MP4, WebM, MOV)'}
						</span>
						<input
							type="file"
							accept="video/mp4,video/webm,video/quicktime"
							class="sr-only"
							onchange={(e) => handleVideoFile(e.currentTarget.files?.[0])}
						/>
					</label>
					{#if createVideoProgress > 0}
						<div class="h-2 overflow-hidden rounded-full bg-gray-100">
							<div
								class="h-full rounded-full bg-brand-primary transition-all"
								style="width: {createVideoProgress}%"
							></div>
						</div>
					{/if}
				{:else}
					<div>
						<label for="create-video-url" class={labelClass}>Lien de la vidéo (https)</label>
						<input
							id="create-video-url"
							name="videoUrl"
							type="url"
							required
							placeholder="https://…/video.mp4"
							class={inputClass}
						/>
					</div>
				{/if}
				<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
					<label
						class="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 p-2.5"
					>
						<img
							src={createPosterPreview ?? '/video-highlights-cover.jpg'}
							alt=""
							class="h-12 w-20 rounded-lg object-cover"
						/>
						<span class="text-xs text-text-secondary">Affiche (facultatif, sinon la photo)</span>
						<input
							type="file"
							accept="image/jpeg,image/png,image/webp"
							class="sr-only"
							onchange={(e) => {
								createPosterFile = e.currentTarget.files?.[0] ?? null;
								createPosterKey = '';
							}}
						/>
					</label>
					<div>
						<label for="create-duration" class={labelClass}>Durée (mm:ss)</label>
						<input
							id="create-duration"
							name="duration"
							bind:value={createDuration}
							pattern={'\\d{1,3}:\\d{2}(:\\d{2})?'}
							placeholder="03:45"
							class={inputClass}
						/>
					</div>
				</div>
			</div>
		{/if}

		<div>
			<label for="create-content" class={labelClass}>
				{createType === 'video' ? 'Résumé (facultatif)' : 'Témoignage *'}
			</label>
			<textarea
				id="create-content"
				name="content"
				required={createType === 'text'}
				maxlength="3000"
				rows={createType === 'video' ? 3 : 6}
				class={inputClass}></textarea>
		</div>

		<label class="flex items-center gap-2 text-sm font-semibold text-text-primary">
			<input type="checkbox" name="isApproved" checked class="h-4 w-4 rounded-sm" />
			Publier immédiatement sur le site
		</label>
	</form>

	{#snippet actions()}
		<Button variant="outline" size="md" onclick={() => (isCreateOpen = false)}>Annuler</Button>
		<Button
			type="submit"
			form="testimonial-create-form"
			variant="primary"
			size="md"
			disabled={isCreating}
		>
			{isCreating ? 'Envoi…' : 'Enregistrer'}
		</Button>
	{/snippet}
</Modal>

<!-- ==================== MODIFICATION ==================== -->
<Modal bind:open={isEditOpen} title="Modifier le témoignage">
	{#if editing}
		<form
			id="testimonial-edit-form"
			method="POST"
			action="?/update"
			use:enhance={async ({ formData, cancel }) => {
				isSaving = true;
				if (!(await uploadEditFiles())) {
					isSaving = false;
					cancel();
					return;
				}
				formData.set('avatarKey', editAvatarKey);
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
			{@render authorFields('edit', editing)}

			<div class="flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 p-3">
				<label class="flex cursor-pointer items-center gap-3">
					{#if editAvatarPreview || (editing.avatarUrl && !removeAvatar)}
						<img
							src={editAvatarPreview ?? editing.avatarUrl}
							alt=""
							class="h-12 w-12 rounded-full object-cover"
						/>
					{:else}
						<span
							class="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400"
						>
							<UserRound size={22} />
						</span>
					{/if}
					<span class="text-xs font-semibold text-text-secondary">Changer la photo</span>
					<input
						type="file"
						accept="image/jpeg,image/png,image/webp"
						class="sr-only"
						onchange={(e) => {
							editAvatarFile = e.currentTarget.files?.[0] ?? null;
							editAvatarKey = '';
							removeAvatar = false;
						}}
					/>
				</label>
				{#if editing.avatarUrl && !editAvatarFile}
					<label class="ml-auto flex items-center gap-2 text-xs text-text-secondary">
						<input
							type="checkbox"
							name="removeAvatar"
							bind:checked={removeAvatar}
							class="h-4 w-4"
						/>
						Retirer la photo
					</label>
				{/if}
			</div>

			{#if editing.type === 'video'}
				<div class="space-y-3 rounded-xl border border-gray-200 p-3">
					{#if editing.videoUrl}
						<!-- svelte-ignore a11y_media_has_caption -->
						<video
							src={editing.videoUrl}
							poster={editing.posterUrl ?? undefined}
							controls
							preload="metadata"
							class="max-h-56 w-full rounded-lg bg-black"
						></video>
					{/if}
					<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
						<label
							class="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 p-2.5"
						>
							<img
								src={editPosterPreview ?? editing.posterUrl ?? '/video-highlights-cover.jpg'}
								alt=""
								class="h-12 w-20 rounded-lg object-cover"
							/>
							<span class="text-xs text-text-secondary">Changer l’affiche</span>
							<input
								type="file"
								accept="image/jpeg,image/png,image/webp"
								class="sr-only"
								onchange={(e) => {
									editPosterFile = e.currentTarget.files?.[0] ?? null;
									editPosterKey = '';
								}}
							/>
						</label>
						<div>
							<label for="edit-duration" class={labelClass}>Durée (mm:ss)</label>
							<input
								id="edit-duration"
								name="duration"
								value={editing.duration ?? ''}
								pattern={'\\d{1,3}:\\d{2}(:\\d{2})?'}
								class={inputClass}
							/>
						</div>
					</div>
					<p class="text-[11px] text-text-secondary">
						Pour remplacer la vidéo elle-même, supprimez ce témoignage et créez-en un nouveau.
					</p>
				</div>
			{/if}

			<div>
				<label for="edit-content" class={labelClass}>
					{editing.type === 'video' ? 'Résumé' : 'Témoignage *'}
				</label>
				<textarea
					id="edit-content"
					name="content"
					required={editing.type === 'text'}
					maxlength="3000"
					rows={editing.type === 'video' ? 3 : 7}
					class={inputClass}>{editing.content ?? ''}</textarea
				>
			</div>
			{#if editing.contactInfo}
				<p class="flex items-center gap-1.5 text-xs text-text-secondary">
					<Phone size={12} /> Contact laissé par le visiteur (jamais publié) : {editing.contactInfo}
				</p>
			{/if}
			<label class="flex items-center gap-2 text-sm font-semibold text-text-primary">
				<input
					type="checkbox"
					name="isApproved"
					checked={editing.isApproved}
					class="h-4 w-4 rounded-sm"
				/>
				Publié sur le site
			</label>
		</form>
	{/if}

	{#snippet actions()}
		<Button variant="outline" size="md" onclick={() => (isEditOpen = false)}>Annuler</Button>
		<Button
			type="submit"
			form="testimonial-edit-form"
			variant="primary"
			size="md"
			disabled={isSaving}
		>
			{isSaving ? 'Enregistrement…' : 'Enregistrer'}
		</Button>
	{/snippet}
</Modal>

<!-- ==================== SUPPRESSION ==================== -->
<Modal bind:open={isDeleteOpen} title="Supprimer ce témoignage ?">
	{#if toDelete}
		<p class="text-sm text-text-secondary">
			Le témoignage de « {toDelete.authorName} » sera supprimé définitivement{toDelete.type ===
				'video' || toDelete.avatarKey
				? ', ainsi que ses fichiers sur Cloudflare R2'
				: ''}. Cette action est irréversible.
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
