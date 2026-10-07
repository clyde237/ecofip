<script lang="ts">
	import { enhance } from '$app/forms';
	import {
		Users,
		UserPlus,
		UploadCloud,
		CheckCircle2,
		AlertCircle,
		Trash2,
		Pencil,
		Eye,
		EyeOff,
		Search,
		Cloud,
		ExternalLink,
		Sparkles,
		Link as LinkIcon,
		X,
		Award
	} from '@lucide/svelte';
	import type { PageData, ActionData } from './$types.js';
	import Modal from '$lib/design-system/components/Modal.svelte';
	import TeamPhoto from '$lib/design-system/components/TeamPhoto.svelte';
	import { toast } from '$lib/design-system/toast.svelte.js';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	type TeamMemberItem = (typeof data.members)[number];

	// Tags / départements suggérés
	const presetTags = [
		'FONDATEUR',
		'DIRECTION',
		'MISSIONS',
		'INTERCESSION',
		'PASTORAL',
		'HUMANITAIRE',
		'LOGISTIQUE',
		'COMMUNICATION',
		'JEUNESSE'
	];

	// ==========================================
	// ÉTAT DU FORMULAIRE DE CRÉATION
	// ==========================================
	let name = $state('');
	let role = $state('');
	let tag = $state('DIRECTION');
	let description = $state('');
	let displayOrder = $state(4);
	let isPublished = $state(true);

	// Gestion photo & Cloudflare R2 (Création)
	let photoSourceMode = $state<'r2' | 'url'>('r2');
	let photoUrl = $state('');
	let photoKey = $state('');
	let selectedPhotoFile = $state<File | null>(null);
	let localPhotoPreview = $state<string | null>(null);
	let isUploadingR2 = $state(false);
	let uploadProgress = $state(0);
	let uploadStatusText = $state('');
	let isDraggingFile = $state(false);
	let createFileInput: HTMLInputElement | null = $state(null);
	let isCreateSubmitting = $state(false);

	// Synchroniser le prochain ordre d'affichage par défaut
	$effect(() => {
		const maxOrder = data.members.reduce((acc, m) => Math.max(acc, m.displayOrder || 0), 0);
		displayOrder = maxOrder + 1;
	});

	// ==========================================
	// ÉTAT RECHERCHE & FILTRES
	// ==========================================
	let searchQuery = $state('');
	let tagFilter = $state('all');
	let statusFilter = $state<'all' | 'published' | 'hidden'>('all');

	let availableTags = $derived(
		Array.from(new Set(data.members.map((m) => m.tag).filter(Boolean) as string[]))
	);

	let filteredMembers = $derived(
		data.members.filter((m) => {
			if (searchQuery.trim().length > 0) {
				const q = searchQuery.toLowerCase().trim();
				const matchName = (m.name || '').toLowerCase().includes(q);
				const matchRole = (m.role || '').toLowerCase().includes(q);
				const matchTag = (m.tag || '').toLowerCase().includes(q);
				const matchDesc = (m.description || '').toLowerCase().includes(q);
				if (!matchName && !matchRole && !matchTag && !matchDesc) return false;
			}
			if (tagFilter !== 'all' && m.tag !== tagFilter) return false;
			if (statusFilter === 'published' && !m.isPublished) return false;
			if (statusFilter === 'hidden' && m.isPublished) return false;
			return true;
		})
	);

	// Statistiques
	let totalMembersCount = $derived(data.members.length);
	let publishedMembersCount = $derived(data.members.filter((m) => m.isPublished).length);
	let r2HostedCount = $derived(
		data.members.filter(
			(m) => Boolean(m.photoKey) || (m.photoUrl && m.photoUrl.includes('/api/media/'))
		).length
	);

	// ==========================================
	// ÉTAT MODALES D'ÉDITION & SUPPRESSION
	// ==========================================
	let isEditModalOpen = $state(false);
	let editingMember = $state<TeamMemberItem | null>(null);
	let editName = $state('');
	let editRole = $state('');
	let editTag = $state('DIRECTION');
	let editDescription = $state('');
	let editDisplayOrder = $state(1);
	let editIsPublished = $state(true);
	let editPhotoUrl = $state('');
	let editPhotoKey = $state('');
	let editLocalPreview = $state<string | null>(null);
	let isEditUploadingR2 = $state(false);
	let editUploadProgress = $state(0);
	let isEditSubmitting = $state(false);

	let isDeleteModalOpen = $state(false);
	let memberToDelete = $state<TeamMemberItem | null>(null);
	let isDeleteSubmitting = $state(false);

	// ==========================================
	// FONCTIONS D'UPLOAD CLOUDFLARE R2
	// ==========================================
	async function uploadImageFileToR2(
		file: File,
		onProgress: (pct: number, text: string) => void
	): Promise<{ url: string; key: string } | null> {
		if (!file.type.startsWith('image/')) {
			toast.error(
				'Veuillez sélectionner un fichier image (JPG, PNG, WEBP, AVIF).',
				'Format invalide'
			);
			return null;
		}

		const MAX_DIRECT_SIZE = 4 * 1024 * 1024; // 4 Mo

		try {
			// Si le fichier est léger (<= 4 Mo), utiliser /api/upload direct
			if (file.size <= MAX_DIRECT_SIZE) {
				onProgress(25, 'Envoi de la photo vers Cloudflare R2...');
				const fd = new FormData();
				fd.append('file', file);
				fd.append('folder', 'team');

				const res = await fetch('/api/upload', {
					method: 'POST',
					body: fd
				});
				const result = await res.json();

				if (!res.ok || !result.success) {
					throw new Error(result.error || 'Échec de l’upload vers Cloudflare R2.');
				}

				onProgress(100, 'Photo stockée avec succès sur Cloudflare R2 !');
				return { url: result.url, key: result.key };
			} else {
				// Fichier haute résolution > 4 Mo : passer par l'URL pré-signée R2 (/api/upload-url)
				onProgress(10, 'Génération du lien sécurisé Cloudflare R2...');
				const presignRes = await fetch('/api/upload-url', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						filename: file.name,
						contentType: file.type || 'image/jpeg',
						folder: 'team'
					})
				});
				const presignData = await presignRes.json();

				if (!presignRes.ok || !presignData.success) {
					throw new Error(presignData.error || 'Impossible d’obtenir l’URL pré-signée R2.');
				}

				await new Promise<void>((resolve, reject) => {
					const xhr = new XMLHttpRequest();
					xhr.open('PUT', presignData.uploadUrl, true);
					xhr.setRequestHeader('Content-Type', file.type || 'image/jpeg');

					xhr.upload.onprogress = (ev) => {
						if (ev.lengthComputable) {
							const pct = Math.round((ev.loaded / ev.total) * 100);
							onProgress(pct, `Transfert vers Cloudflare R2 : ${pct}%`);
						}
					};

					xhr.onload = () => {
						if (xhr.status >= 200 && xhr.status < 300) resolve();
						else reject(new Error(`Erreur HTTP R2 ${xhr.status}`));
					};
					xhr.onerror = () => reject(new Error('Erreur réseau lors du transfert R2.'));
					xhr.send(file);
				});

				onProgress(100, 'Photo HD stockée sur Cloudflare R2 !');
				return { url: presignData.publicUrl, key: presignData.key };
			}
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : String(err);
			toast.error(msg, 'Erreur Cloudflare R2');
			return null;
		}
	}

	async function handleCreateFileSelect(file: File) {
		selectedPhotoFile = file;
		if (localPhotoPreview) URL.revokeObjectURL(localPhotoPreview);
		localPhotoPreview = URL.createObjectURL(file);

		// Lancer immédiatement l'upload vers Cloudflare R2 si configuré
		if (data.isR2Configured) {
			isUploadingR2 = true;
			uploadProgress = 10;
			uploadStatusText = 'Connexion à Cloudflare R2...';

			const uploaded = await uploadImageFileToR2(file, (pct, txt) => {
				uploadProgress = pct;
				uploadStatusText = txt;
			});

			isUploadingR2 = false;

			if (uploaded) {
				photoUrl = uploaded.url;
				photoKey = uploaded.key;
				toast.success(
					'La photo du membre a été transférée dans le bucket Cloudflare R2.',
					'Stockage R2 confirmé'
				);
			}
		}
	}

	function onCreateFileChange(e: Event) {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file) void handleCreateFileSelect(file);
	}

	function onCreateDrop(e: DragEvent) {
		e.preventDefault();
		isDraggingFile = false;
		const file = e.dataTransfer?.files?.[0];
		if (file) void handleCreateFileSelect(file);
	}

	function clearCreatePhoto() {
		selectedPhotoFile = null;
		if (localPhotoPreview) {
			URL.revokeObjectURL(localPhotoPreview);
			localPhotoPreview = null;
		}
		photoUrl = '';
		photoKey = '';
		uploadProgress = 0;
		uploadStatusText = '';
		if (createFileInput) createFileInput.value = '';
	}

	function resetCreateForm() {
		name = '';
		role = '';
		tag = 'DIRECTION';
		description = '';
		isPublished = true;
		clearCreatePhoto();
	}

	// Gestion de l'upload dans la modale d'édition
	async function onEditFileChange(e: Event) {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;

		if (editLocalPreview) URL.revokeObjectURL(editLocalPreview);
		editLocalPreview = URL.createObjectURL(file);

		if (data.isR2Configured) {
			isEditUploadingR2 = true;
			editUploadProgress = 15;

			const uploaded = await uploadImageFileToR2(file, (pct) => {
				editUploadProgress = pct;
			});

			isEditUploadingR2 = false;

			if (uploaded) {
				editPhotoUrl = uploaded.url;
				editPhotoKey = uploaded.key;
				toast.success('Nouvelle photo enregistrée sur Cloudflare R2.', 'Upload R2 réussi');
			}
		}
	}

	function openEditModal(member: TeamMemberItem) {
		editingMember = member;
		editName = member.name;
		editRole = member.role;
		editTag = member.tag || 'DIRECTION';
		editDescription = member.description || '';
		editDisplayOrder = member.displayOrder ?? 1;
		editIsPublished = member.isPublished;
		editPhotoUrl = member.photoUrl || '';
		editPhotoKey = member.photoKey || '';
		if (editLocalPreview) {
			URL.revokeObjectURL(editLocalPreview);
			editLocalPreview = null;
		}
		isEditModalOpen = true;
	}

	function openDeleteModal(member: TeamMemberItem) {
		memberToDelete = member;
		isDeleteModalOpen = true;
	}

	// Image affichée dans l'aperçu en direct
	let previewCardImage = $derived(localPhotoPreview || photoUrl || '/team-member-direction.png');
</script>

<svelte:head>
	<title>Gestion de l’Équipe Dirigeante — Administration ECOFIP</title>
</svelte:head>

<div class="mx-auto max-w-7xl space-y-8">
	<!-- =========================================================================
	     1. EN-TÊTE DE LA PAGE & STATUT CLOUDFLARE R2 / NEON
	     ========================================================================= -->
	<div
		class="flex flex-col gap-4 rounded-3xl border border-gray-200/80 bg-white p-6 shadow-xs sm:flex-row sm:items-center sm:justify-between sm:p-8"
	>
		<div class="space-y-1.5">
			<div class="flex flex-wrap items-center gap-2">
				<span
					class="inline-flex items-center gap-1.5 rounded-full bg-brand-subtle px-3 py-1 text-xs font-bold text-brand-primary uppercase"
				>
					<Award size={14} />
					<span>Page À propos · Gouvernance</span>
				</span>

				{#if data.isR2Configured}
					<span
						class="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700"
					>
						<Cloud size={13} />
						<span>Cloudflare R2 connecté</span>
					</span>
				{:else}
					<span
						class="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800"
					>
						<AlertCircle size={13} />
						<span>R2 en attente (.env)</span>
					</span>
				{/if}
			</div>

			<h1 class="font-display text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
				Gestion de l’Équipe Dirigeante
			</h1>
			<p class="max-w-2xl text-xs leading-relaxed text-text-secondary sm:text-sm">
				Ajoutez, modifiez et organisez les membres de l’équipe dirigeante d’ECOFIP. Les photos sont
				hébergées sur <strong class="text-text-primary">Cloudflare R2</strong> et synchronisées
				directement avec la section
				<strong class="text-brand-primary">« Notre équipe dirigeante »</strong>
				de la page À propos.
			</p>
		</div>

		<div class="flex flex-wrap items-center gap-3">
			<a
				href="/a-propos#equipe"
				target="_blank"
				rel="noopener noreferrer"
				class="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-text-primary shadow-2xs transition-all hover:border-brand-primary/40 hover:text-brand-primary sm:text-sm"
			>
				<span>Voir sur À propos</span>
				<ExternalLink size={15} />
			</a>
		</div>
	</div>

	<!-- =========================================================================
	     2. CARTES D'INDICATEURS CLÉS (KPI)
	     ========================================================================= -->
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
		<div class="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-2xs">
			<div class="flex items-center justify-between">
				<span class="text-xs font-bold text-text-secondary uppercase">Effectif Dirigeant</span>
				<div
					class="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-subtle text-brand-primary"
				>
					<Users size={18} />
				</div>
			</div>
			<div class="mt-3 flex items-baseline gap-2">
				<span class="font-display text-2xl font-black text-text-primary">{totalMembersCount}</span>
				<span class="text-xs text-text-secondary">membres enregistrés</span>
			</div>
		</div>

		<div class="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-5 shadow-2xs">
			<div class="flex items-center justify-between">
				<span class="text-xs font-bold text-emerald-900 uppercase">Publiés sur À Propos</span>
				<div
					class="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700"
				>
					<Eye size={18} />
				</div>
			</div>
			<div class="mt-3 flex items-baseline gap-2">
				<span class="font-display text-2xl font-black text-emerald-950"
					>{publishedMembersCount}</span
				>
				<span class="text-xs text-emerald-700">affichés publiquement</span>
			</div>
		</div>

		<div class="rounded-2xl border border-sky-100 bg-sky-50/40 p-5 shadow-2xs">
			<div class="flex items-center justify-between">
				<span class="text-xs font-bold text-sky-900 uppercase">Stockage Cloudflare R2</span>
				<div class="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
					<Cloud size={18} />
				</div>
			</div>
			<div class="mt-3 flex items-baseline gap-2">
				<span class="font-display text-2xl font-black text-sky-950">{r2HostedCount}</span>
				<span class="text-xs text-sky-700">photos dans le bucket R2</span>
			</div>
		</div>
	</div>

	<!-- =========================================================================
	     3. FORMULAIRE DE CRÉATION + APERÇU EN DIRECT DE LA CARTE À PROPOS
	     ========================================================================= -->
	<div class="grid grid-cols-1 gap-8 lg:grid-cols-12">
		<!-- Colonne Gauche (7 cols) : Formulaire de création d'un membre -->
		<div class="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-xs sm:p-8 lg:col-span-7">
			<div class="mb-6 flex items-center justify-between border-b border-gray-100 pb-4">
				<div class="flex items-center gap-3">
					<div
						class="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary text-white shadow-xs"
					>
						<UserPlus size={20} />
					</div>
					<div>
						<h2 class="font-display text-lg font-bold text-text-primary sm:text-xl">
							Ajouter un membre à l’équipe
						</h2>
						<p class="text-xs text-text-secondary">
							Remplissez les informations et téléversez la photo sur Cloudflare R2
						</p>
					</div>
				</div>
			</div>

			{#if form?.error}
				<div
					class="mb-6 flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700"
				>
					<AlertCircle size={16} class="shrink-0" />
					<span>{form.error}</span>
				</div>
			{/if}

			<form
				method="POST"
				action="?/create"
				use:enhance={({ cancel }) => {
					if (isUploadingR2) {
						toast.error(
							'Veuillez patienter pendant la fin du téléversement sur Cloudflare R2.',
							'Upload en cours'
						);
						cancel();
						return;
					}
					isCreateSubmitting = true;
					return async ({ result, update }) => {
						isCreateSubmitting = false;
						if (result.type === 'success') {
							const msg =
								(result.data as { message?: string })?.message || 'Membre ajouté avec succès !';
							toast.success(msg, 'Équipe mise à jour');
							resetCreateForm();
						} else if (result.type === 'failure') {
							const err =
								(result.data as { error?: string })?.error || 'Erreur lors de l’ajout du membre.';
							toast.error(err, 'Erreur');
						}
						await update();
					};
				}}
				class="space-y-5"
			>
				<!-- Champs cachés pour l'URL et la clé Cloudflare R2 -->
				<input type="hidden" name="photoUrl" value={photoUrl} />
				<input type="hidden" name="photoKey" value={photoKey} />

				<!-- 1. Nom complet & Rôle -->
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div>
						<label
							for="member-name"
							class="mb-1.5 block text-xs font-bold text-text-primary uppercase"
						>
							Nom complet & Titre <span class="text-brand-primary">*</span>
						</label>
						<input
							id="member-name"
							name="name"
							type="text"
							required
							bind:value={name}
							placeholder="Ex : Pasteur Valéry TCHAMEKWEN"
							class="w-full rounded-xl border border-gray-200 bg-[#f8fafc] px-3.5 py-2.5 text-sm text-text-primary placeholder:text-gray-400 focus:border-brand-primary focus:bg-white focus:outline-hidden"
						/>
					</div>

					<div>
						<label
							for="member-role"
							class="mb-1.5 block text-xs font-bold text-text-primary uppercase"
						>
							Fonction / Rôle officiel <span class="text-brand-primary">*</span>
						</label>
						<input
							id="member-role"
							name="role"
							type="text"
							required
							bind:value={role}
							placeholder="Ex : Fondateur & Coordinateur National"
							class="w-full rounded-xl border border-gray-200 bg-[#f8fafc] px-3.5 py-2.5 text-sm text-text-primary placeholder:text-gray-400 focus:border-brand-primary focus:bg-white focus:outline-hidden"
						/>
					</div>
				</div>

				<!-- 2. Badge Département (Tag) & Ordre d'affichage -->
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
					<div class="sm:col-span-2">
						<label
							for="member-tag"
							class="mb-1.5 block text-xs font-bold text-text-primary uppercase"
						>
							Badge / Pôle (Tag affiché en doré)
						</label>
						<input
							id="member-tag"
							name="tag"
							type="text"
							bind:value={tag}
							placeholder="Ex : FONDATEUR, MISSIONS, INTERCESSION..."
							class="w-full rounded-xl border border-gray-200 bg-[#f8fafc] px-3.5 py-2.5 text-sm font-bold tracking-wider text-text-primary uppercase placeholder:font-normal placeholder:text-gray-400 focus:border-brand-primary focus:bg-white focus:outline-hidden"
						/>
						<!-- Puces de sélection rapide de tag -->
						<div class="mt-2 flex flex-wrap gap-1.5">
							{#each presetTags as preset (preset)}
								<button
									type="button"
									onclick={() => (tag = preset)}
									class="cursor-pointer rounded-md border px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase transition-all {tag ===
									preset
										? 'border-brand-primary bg-brand-primary text-white'
										: 'border-gray-200 bg-gray-50 text-text-secondary hover:border-brand-primary/40 hover:text-brand-primary'}"
								>
									{preset}
								</button>
							{/each}
						</div>
					</div>

					<div>
						<label
							for="member-order"
							class="mb-1.5 block text-xs font-bold text-text-primary uppercase"
						>
							Ordre d’affichage
						</label>
						<input
							id="member-order"
							name="displayOrder"
							type="number"
							min="1"
							max="99"
							bind:value={displayOrder}
							class="w-full rounded-xl border border-gray-200 bg-[#f8fafc] px-3.5 py-2.5 text-sm font-bold text-text-primary focus:border-brand-primary focus:bg-white focus:outline-hidden"
						/>
						<p class="mt-1 text-[11px] text-text-secondary">
							Position sur la page À propos (1 = en premier)
						</p>
					</div>
				</div>

				<!-- 3. Description / Responsabilités -->
				<div>
					<label
						for="member-description"
						class="mb-1.5 block text-xs font-bold text-text-primary uppercase"
					>
						Biographie courte & Responsabilités
					</label>
					<textarea
						id="member-description"
						name="description"
						rows="3"
						bind:value={description}
						placeholder="Ex : Vision, prédication et conduite du projet national « Cameroun pour Jésus » à travers les 10 régions."
						class="w-full rounded-xl border border-gray-200 bg-[#f8fafc] p-3.5 text-sm leading-relaxed text-text-primary placeholder:text-gray-400 focus:border-brand-primary focus:bg-white focus:outline-hidden"
					></textarea>
				</div>

				<!-- 4. Photo du membre — Liaison Cloudflare R2 -->
				<div class="space-y-3 rounded-2xl border border-gray-200/80 bg-[#f8fafc] p-4">
					<div class="flex flex-wrap items-center justify-between gap-2">
						<span class="flex items-center gap-2 text-xs font-bold text-text-primary uppercase">
							<Cloud size={15} class="text-brand-primary" />
							<span>Photo officielle (Stockage Cloudflare R2)</span>
						</span>

						<div class="inline-flex rounded-lg border border-gray-200 bg-white p-0.5 text-xs">
							<button
								type="button"
								onclick={() => (photoSourceMode = 'r2')}
								class="cursor-pointer rounded-md px-2.5 py-1 font-semibold transition-all {photoSourceMode ===
								'r2'
									? 'bg-brand-primary text-white'
									: 'text-text-secondary hover:text-text-primary'}"
							>
								Upload R2
							</button>
							<button
								type="button"
								onclick={() => (photoSourceMode = 'url')}
								class="cursor-pointer rounded-md px-2.5 py-1 font-semibold transition-all {photoSourceMode ===
								'url'
									? 'bg-brand-primary text-white'
									: 'text-text-secondary hover:text-text-primary'}"
							>
								Lien URL
							</button>
						</div>
					</div>

					{#if photoSourceMode === 'r2'}
						<!-- Zone Drag & Drop Cloudflare R2 -->
						<div
							role="button"
							tabindex="0"
							ondragover={(e) => {
								e.preventDefault();
								isDraggingFile = true;
							}}
							ondragleave={() => (isDraggingFile = false)}
							ondrop={onCreateDrop}
							onclick={() => createFileInput?.click()}
							onkeydown={(e) => {
								if (e.key === 'Enter' || e.key === ' ') createFileInput?.click();
							}}
							class="relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all {isDraggingFile
								? 'border-brand-primary bg-brand-subtle/30'
								: photoKey
									? 'border-emerald-300 bg-emerald-50/40'
									: 'border-gray-300 bg-white hover:border-brand-primary/60'}"
						>
							<input
								bind:this={createFileInput}
								type="file"
								accept="image/jpeg,image/png,image/webp,image/avif"
								onchange={onCreateFileChange}
								class="hidden"
							/>

							{#if localPhotoPreview || photoUrl}
								<div class="flex flex-col items-center gap-3 sm:flex-row">
									<img
										src={localPhotoPreview || photoUrl}
										alt="Aperçu"
										class="h-20 w-28 rounded-xl object-cover shadow-sm ring-2 ring-white"
									/>
									<div class="text-left">
										{#if isUploadingR2}
											<p class="text-xs font-bold text-brand-primary">{uploadStatusText}</p>
											<div class="mt-2 h-2 w-48 overflow-hidden rounded-full bg-gray-200">
												<div
													class="h-full bg-brand-primary transition-all duration-200"
													style="width: {uploadProgress}%"
												></div>
											</div>
										{:else if photoKey}
											<span
												class="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800"
											>
												<CheckCircle2 size={12} />
												<span>Hébergé sur Cloudflare R2</span>
											</span>
											<p class="mt-1 max-w-xs truncate font-mono text-[10px] text-text-secondary">
												Clé : {photoKey}
											</p>
										{:else}
											<p class="text-xs font-semibold text-text-primary">
												{selectedPhotoFile?.name || 'Photo sélectionnée'}
											</p>
										{/if}

										<button
											type="button"
											onclick={(e) => {
												e.stopPropagation();
												clearCreatePhoto();
											}}
											class="mt-2 inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:underline"
										>
											<X size={13} />
											<span>Changer de photo</span>
										</button>
									</div>
								</div>
							{:else}
								<div
									class="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-subtle text-brand-primary"
								>
									<UploadCloud size={24} />
								</div>
								<p class="text-xs font-bold text-text-primary sm:text-sm">
									Glissez-déposez la photo du membre ou cliquez pour parcourir
								</p>
								<p class="mt-1 text-[11px] text-text-secondary">
									JPG, PNG, WEBP ou AVIF · Téléversement direct vers le bucket Cloudflare R2 (<code
										>team/</code
									>)
								</p>
							{/if}
						</div>
					{:else}
						<!-- Saisie manuelle d'une URL d'image -->
						<div>
							<div class="relative">
								<LinkIcon
									size={15}
									class="absolute top-1/2 left-3.5 -translate-y-1/2 text-gray-400"
								/>
								<input
									type="text"
									bind:value={photoUrl}
									placeholder="Ex : https://... ou /team-member-direction.png"
									class="w-full rounded-xl border border-gray-200 bg-white py-2.5 pr-3.5 pl-9 text-sm text-text-primary placeholder:text-gray-400 focus:border-brand-primary focus:outline-hidden"
								/>
							</div>
						</div>
					{/if}
				</div>

				<!-- 5. Visibilité & Bouton d'enregistrement -->
				<div
					class="flex flex-col gap-4 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between"
				>
					<label class="inline-flex cursor-pointer items-center gap-2.5 select-none">
						<input
							type="checkbox"
							name="isPublished"
							bind:checked={isPublished}
							class="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
						/>
						<span class="text-xs font-bold text-text-primary sm:text-sm">
							Afficher immédiatement sur la page À propos
						</span>
					</label>

					<button
						type="submit"
						disabled={isCreateSubmitting || isUploadingR2}
						class="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand-primary px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-brand-primary-hover hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
					>
						<UserPlus size={17} />
						<span>
							{#if isUploadingR2}
								Transfert R2 en cours ({uploadProgress}%)...
							{:else if isCreateSubmitting}
								Enregistrement...
							{:else}
								Enregistrer dans l’équipe
							{/if}
						</span>
					</button>
				</div>
			</form>
		</div>

		<!-- Colonne Droite (5 cols) : Aperçu en direct fidèle à la section À propos -->
		<div class="flex flex-col justify-between lg:col-span-5">
			<div
				class="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#a8000a] via-brand-primary to-[#820008] p-6 text-white shadow-lg sm:p-8"
			>
				<div class="mb-5 flex items-center justify-between">
					<span
						class="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold tracking-wider text-amber-300 uppercase backdrop-blur-xs"
					>
						<Sparkles size={12} />
						<span>Aperçu en direct · Page À Propos</span>
					</span>
					<span class="text-xs font-semibold text-white/75">Ordre #{displayOrder}</span>
				</div>

				<!-- Carte Glassmorphism identique à AboutTeam.svelte -->
				<div
					class="group relative flex flex-col overflow-hidden rounded-3xl border border-white/25 bg-white/12 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-xl sm:p-5"
				>
					<div
						class="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-white/15 bg-black/30"
					>
						<TeamPhoto
							src={previewCardImage}
							alt={name || 'Aperçu du membre'}
							class="h-full w-full"
						/>
						<div
							class="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/45 to-transparent"
						></div>
					</div>

					<div class="flex flex-1 flex-col pt-4 pb-1 sm:pt-5">
						<span
							class="inline-block self-start rounded-md border border-white/25 bg-white/10 px-2.5 py-1 font-body text-[11px] font-black tracking-widest text-amber-300 uppercase shadow-2xs backdrop-blur-xs"
						>
							{tag || 'DIRECTION'}
						</span>

						<h3
							class="mt-2.5 font-display text-xl leading-snug font-bold tracking-tight text-white sm:text-[22px]"
						>
							{name || 'Nom du Membre'}
						</h3>

						<p class="mt-0.5 text-xs font-semibold text-amber-200/95 sm:text-sm">
							{role || 'Fonction & Responsabilité'}
						</p>

						<p class="mt-2 font-body text-xs leading-relaxed text-white/80 sm:text-sm">
							{description ||
								'La description des responsabilités et de la mission du membre s’affichera ici sur la page À propos.'}
						</p>
					</div>
				</div>

				<p class="mt-4 text-center text-[11px] text-white/75">
					Rendu fidèle de la carte telle qu’elle apparaît dans la section « Notre équipe dirigeante
					».
				</p>
			</div>
		</div>
	</div>

	<!-- =========================================================================
	     4. LISTE DES MEMBRES DE L'ÉQUIPE (RECHERCHE, FILTRES & ACTIONS)
	     ========================================================================= -->
	<div class="overflow-hidden rounded-3xl border border-gray-200/80 bg-white shadow-xs">
		<!-- Barre de recherche et filtres -->
		<div
			class="flex flex-col gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"
		>
			<div class="flex items-center gap-2.5">
				<Users size={19} class="text-brand-primary" />
				<h2 class="font-display text-base font-bold text-text-primary sm:text-lg">
					Membres de l’Équipe ({filteredMembers.length})
				</h2>
			</div>

			<div class="flex flex-wrap items-center gap-3">
				<!-- Recherche -->
				<div class="relative w-full sm:w-64">
					<Search size={15} class="absolute top-1/2 left-3.5 -translate-y-1/2 text-gray-400" />
					<input
						type="search"
						bind:value={searchQuery}
						placeholder="Rechercher un nom, rôle, pôle..."
						class="h-9 w-full rounded-xl border border-gray-200 bg-[#f8fafc] pr-3 pl-9 text-xs text-text-primary placeholder:text-gray-400 focus:border-brand-primary focus:bg-white focus:outline-hidden"
					/>
				</div>

				<!-- Filtre par Tag -->
				<select
					bind:value={tagFilter}
					class="h-9 rounded-xl border border-gray-200 bg-[#f8fafc] px-3 text-xs font-semibold text-text-primary focus:border-brand-primary focus:bg-white focus:outline-hidden"
				>
					<option value="all">Tous les pôles</option>
					{#each availableTags as t (t)}
						<option value={t}>{t}</option>
					{/each}
				</select>

				<!-- Filtre par Statut -->
				<select
					bind:value={statusFilter}
					class="h-9 rounded-xl border border-gray-200 bg-[#f8fafc] px-3 text-xs font-semibold text-text-primary focus:border-brand-primary focus:bg-white focus:outline-hidden"
				>
					<option value="all">Tous les statuts</option>
					<option value="published">Publiés sur À propos</option>
					<option value="hidden">Masqués</option>
				</select>
			</div>
		</div>

		<!-- Grille des cartes de membres -->
		{#if filteredMembers.length === 0}
			<div class="p-12 text-center">
				<div
					class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-400"
				>
					<Users size={24} />
				</div>
				<p class="font-display text-base font-bold text-text-primary">Aucun membre trouvé</p>
				<p class="mt-1 text-xs text-text-secondary">
					Modifiez vos filtres de recherche ou ajoutez un nouveau membre via le formulaire
					ci-dessus.
				</p>
			</div>
		{:else}
			<div class="grid grid-cols-1 gap-6 p-6 md:grid-cols-2 lg:grid-cols-3">
				{#each filteredMembers as member (member.id)}
					<div
						class="group flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-2xs transition-all duration-200 hover:border-brand-primary/30 hover:shadow-md {!member.isPublished
							? 'opacity-70'
							: ''}"
					>
						<div>
							<!-- Image avec badges superposés -->
							<div class="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
								<TeamPhoto
									src={member.photoUrl || '/team-member-direction.png'}
									alt={member.name}
									class="h-full w-full"
								/>
								<div
									class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"
								></div>

								<!-- Haut gauche : Ordre & Tag -->
								<div class="absolute top-3 left-3 flex items-center gap-1.5">
									<span
										class="rounded-lg bg-black/70 px-2 py-0.5 text-[11px] font-extrabold text-white backdrop-blur-xs"
									>
										#{member.displayOrder}
									</span>
									{#if member.tag}
										<span
											class="rounded-lg bg-brand-primary px-2.5 py-0.5 text-[10px] font-black tracking-wider text-white uppercase shadow-xs"
										>
											{member.tag}
										</span>
									{/if}
								</div>

								<!-- Haut droite : Badge R2 & Statut -->
								<div class="absolute top-3 right-3 flex items-center gap-1.5">
									{#if member.photoKey || (member.photoUrl && member.photoUrl.includes('/api/media/'))}
										<span
											title="Photo hébergée sur Cloudflare R2"
											class="inline-flex items-center gap-1 rounded-lg bg-sky-600/90 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs"
										>
											<Cloud size={11} />
											<span>R2</span>
										</span>
									{/if}
									<span
										class="inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-bold backdrop-blur-xs {member.isPublished
											? 'bg-emerald-600/90 text-white'
											: 'bg-gray-800/85 text-gray-200'}"
									>
										{#if member.isPublished}
											<Eye size={11} />
											<span>Publié</span>
										{:else}
											<EyeOff size={11} />
											<span>Masqué</span>
										{/if}
									</span>
								</div>
							</div>

							<!-- Contenu textuel -->
							<div class="p-5">
								<h3 class="font-display text-lg font-bold text-text-primary">
									{member.name}
								</h3>
								<p class="mt-0.5 text-xs font-bold text-brand-primary">
									{member.role}
								</p>
								{#if member.description}
									<p class="mt-2.5 line-clamp-3 text-xs leading-relaxed text-text-secondary">
										{member.description}
									</p>
								{/if}
							</div>
						</div>

						<!-- Barre d'actions de la carte -->
						<div
							class="flex items-center justify-between border-t border-gray-100 bg-gray-50/60 px-4 py-3"
						>
							<!-- Toggle Publier / Masquer -->
							<form
								method="POST"
								action="?/togglePublish"
								use:enhance={() => {
									return async ({ result, update }) => {
										if (result.type === 'success') {
											const msg =
												(result.data as { message?: string })?.message || 'Visibilité mise à jour.';
											toast.success(msg, 'Visibilité');
										}
										await update();
									};
								}}
							>
								<input type="hidden" name="id" value={member.id} />
								<button
									type="submit"
									class="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-bold transition-colors {member.isPublished
										? 'border-gray-200 bg-white text-text-secondary hover:border-amber-300 hover:text-amber-700'
										: 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}"
								>
									{#if member.isPublished}
										<EyeOff size={13} />
										<span>Masquer</span>
									{:else}
										<Eye size={13} />
										<span>Publier</span>
									{/if}
								</button>
							</form>

							<!-- Modifier & Supprimer -->
							<div class="flex items-center gap-1.5">
								<button
									type="button"
									onclick={() => openEditModal(member)}
									class="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-bold text-text-primary transition-colors hover:border-brand-primary/40 hover:text-brand-primary"
								>
									<Pencil size={13} />
									<span>Modifier</span>
								</button>

								<button
									type="button"
									onclick={() => openDeleteModal(member)}
									class="inline-flex cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-white p-1.5 text-gray-500 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
									aria-label="Supprimer {member.name}"
								>
									<Trash2 size={14} />
								</button>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

<!-- =========================================================================
     MODALE DE MODIFICATION D'UN MEMBRE
     ========================================================================= -->
<Modal bind:open={isEditModalOpen} title="Modifier le membre de l’équipe">
	{#if editingMember}
		<form
			method="POST"
			action="?/update"
			use:enhance={({ cancel }) => {
				if (isEditUploadingR2) {
					toast.error('Veuillez attendre la fin du transfert Cloudflare R2.', 'Upload en cours');
					cancel();
					return;
				}
				isEditSubmitting = true;
				return async ({ result, update }) => {
					isEditSubmitting = false;
					if (result.type === 'success') {
						isEditModalOpen = false;
						toast.success(
							(result.data as { message?: string })?.message || 'Membre mis à jour.',
							'Modification enregistrée'
						);
					} else if (result.type === 'failure') {
						toast.error(
							(result.data as { error?: string })?.error || 'Erreur lors de la mise à jour.',
							'Erreur'
						);
					}
					await update();
				};
			}}
			class="space-y-4"
		>
			<input type="hidden" name="id" value={editingMember.id} />
			<input type="hidden" name="photoUrl" value={editPhotoUrl} />
			<input type="hidden" name="photoKey" value={editPhotoKey} />

			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<div>
					<label for="edit-name" class="mb-1 block text-xs font-bold text-text-primary uppercase">
						Nom complet & Titre <span class="text-brand-primary">*</span>
					</label>
					<input
						id="edit-name"
						name="name"
						type="text"
						required
						bind:value={editName}
						class="w-full rounded-xl border border-gray-200 bg-[#f8fafc] px-3.5 py-2 text-sm text-text-primary focus:border-brand-primary focus:bg-white focus:outline-hidden"
					/>
				</div>

				<div>
					<label for="edit-role" class="mb-1 block text-xs font-bold text-text-primary uppercase">
						Fonction / Rôle <span class="text-brand-primary">*</span>
					</label>
					<input
						id="edit-role"
						name="role"
						type="text"
						required
						bind:value={editRole}
						class="w-full rounded-xl border border-gray-200 bg-[#f8fafc] px-3.5 py-2 text-sm text-text-primary focus:border-brand-primary focus:bg-white focus:outline-hidden"
					/>
				</div>
			</div>

			<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
				<div class="sm:col-span-2">
					<label for="edit-tag" class="mb-1 block text-xs font-bold text-text-primary uppercase">
						Badge / Pôle
					</label>
					<input
						id="edit-tag"
						name="tag"
						type="text"
						bind:value={editTag}
						class="w-full rounded-xl border border-gray-200 bg-[#f8fafc] px-3.5 py-2 text-sm font-bold text-text-primary uppercase focus:border-brand-primary focus:bg-white focus:outline-hidden"
					/>
				</div>

				<div>
					<label for="edit-order" class="mb-1 block text-xs font-bold text-text-primary uppercase">
						Ordre
					</label>
					<input
						id="edit-order"
						name="displayOrder"
						type="number"
						min="1"
						max="99"
						bind:value={editDisplayOrder}
						class="w-full rounded-xl border border-gray-200 bg-[#f8fafc] px-3.5 py-2 text-sm font-bold text-text-primary focus:border-brand-primary focus:bg-white focus:outline-hidden"
					/>
				</div>
			</div>

			<div>
				<label for="edit-desc" class="mb-1 block text-xs font-bold text-text-primary uppercase">
					Biographie & Responsabilités
				</label>
				<textarea
					id="edit-desc"
					name="description"
					rows="3"
					bind:value={editDescription}
					class="w-full rounded-xl border border-gray-200 bg-[#f8fafc] p-3 text-sm text-text-primary focus:border-brand-primary focus:bg-white focus:outline-hidden"
				></textarea>
			</div>

			<!-- Remplacement de la photo sur Cloudflare R2 -->
			<div class="space-y-2 rounded-2xl border border-gray-200 bg-[#f8fafc] p-4">
				<span class="block text-xs font-bold text-text-primary uppercase">
					Photo du membre (Cloudflare R2)
				</span>

				<div class="flex items-center gap-4">
					<img
						src={editLocalPreview || editPhotoUrl || '/team-member-direction.png'}
						alt={editName}
						class="h-16 w-24 shrink-0 rounded-xl object-cover shadow-2xs ring-1 ring-gray-200"
					/>
					<div class="flex-1 space-y-1.5">
						<input
							type="file"
							accept="image/jpeg,image/png,image/webp,image/avif"
							onchange={onEditFileChange}
							class="block w-full text-xs text-text-secondary file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-brand-primary file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white hover:file:bg-brand-primary-hover"
						/>
						{#if isEditUploadingR2}
							<p class="text-xs font-bold text-brand-primary">
								Téléversement vers R2 : {editUploadProgress}%
							</p>
						{:else if editPhotoKey}
							<p class="truncate font-mono text-[10px] text-emerald-700">
								✓ R2 : {editPhotoKey}
							</p>
						{/if}
					</div>
				</div>
			</div>

			<div class="flex items-center justify-between pt-2">
				<label class="inline-flex cursor-pointer items-center gap-2 select-none">
					<input
						type="checkbox"
						name="isPublished"
						bind:checked={editIsPublished}
						class="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
					/>
					<span class="text-xs font-bold text-text-primary">Visible sur la page À propos</span>
				</label>

				<div class="flex items-center gap-2">
					<button
						type="button"
						onclick={() => (isEditModalOpen = false)}
						class="cursor-pointer rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-text-secondary hover:bg-gray-50"
					>
						Annuler
					</button>
					<button
						type="submit"
						disabled={isEditSubmitting || isEditUploadingR2}
						class="cursor-pointer rounded-xl bg-brand-primary px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-brand-primary-hover disabled:opacity-60"
					>
						{isEditSubmitting ? 'Enregistrement...' : 'Enregistrer'}
					</button>
				</div>
			</div>
		</form>
	{/if}
</Modal>

<!-- =========================================================================
     MODALE DE CONFIRMATION DE SUPPRESSION
     ========================================================================= -->
<Modal bind:open={isDeleteModalOpen} title="Supprimer ce membre de l’équipe">
	{#if memberToDelete}
		<div class="space-y-4">
			<p class="text-sm leading-relaxed text-text-secondary">
				Êtes-vous sûr de vouloir retirer <strong class="text-text-primary"
					>{memberToDelete.name}</strong
				>
				({memberToDelete.role}) de l’équipe dirigeante ?
			</p>
			{#if memberToDelete.photoKey}
				<div
					class="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-medium text-amber-900"
				>
					La photo associée (<code class="font-mono">{memberToDelete.photoKey}</code>) sera
					également supprimée du bucket <strong>Cloudflare R2</strong>.
				</div>
			{/if}

			<form
				method="POST"
				action="?/delete"
				use:enhance={() => {
					isDeleteSubmitting = true;
					return async ({ result, update }) => {
						isDeleteSubmitting = false;
						if (result.type === 'success') {
							isDeleteModalOpen = false;
							toast.success(
								(result.data as { message?: string })?.message || 'Membre supprimé.',
								'Suppression effectuée'
							);
						}
						await update();
					};
				}}
				class="flex items-center justify-end gap-2 pt-2"
			>
				<input type="hidden" name="id" value={memberToDelete.id} />
				<button
					type="button"
					onclick={() => (isDeleteModalOpen = false)}
					class="cursor-pointer rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-text-secondary hover:bg-gray-50"
				>
					Annuler
				</button>
				<button
					type="submit"
					disabled={isDeleteSubmitting}
					class="cursor-pointer rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-red-700 disabled:opacity-60"
				>
					{isDeleteSubmitting ? 'Suppression...' : 'Confirmer la suppression'}
				</button>
			</form>
		</div>
	{/if}
</Modal>
