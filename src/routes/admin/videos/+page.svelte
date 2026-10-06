<script lang="ts">
	import { enhance } from '$app/forms';
	import {
		Film,
		UploadCloud,
		Play,
		CheckCircle2,
		AlertCircle,
		Trash2,
		Eye,
		EyeOff,
		Clock,
		MapPin,
		Link as LinkIcon,
		FileVideo,
		Image as ImageIcon,
		Cloud,
		ExternalLink,
		Sparkles,
		X
	} from '@lucide/svelte';
	import type { PageData, ActionData } from './$types.js';
	import Card from '$lib/design-system/components/Card.svelte';
	import Button from '$lib/design-system/components/Button.svelte';
	import Input from '$lib/design-system/components/Input.svelte';
	import Textarea from '$lib/design-system/components/Textarea.svelte';
	import Badge from '$lib/design-system/components/Badge.svelte';
	import Alert from '$lib/design-system/components/Alert.svelte';
	import Modal from '$lib/design-system/components/Modal.svelte';
	import LinkifiedText from '$lib/design-system/components/LinkifiedText.svelte';
	import { toast } from '$lib/design-system/toast.svelte.js';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	// Mode d'entrée vidéo : 'upload' (Cloudflare R2) ou 'url' (URL externe directe)
	let videoSourceMode = $state<'upload' | 'url'>('upload');

	// Champs du formulaire
	let title = $state('');
	let duration = $state('03:30');
	let location = $state('Yaoundé · Esplanade Omnisports');
	let description = $state('');
	let videoUrl = $state('');
	let thumbnailUrl = $state('');
	let isPublished = $state(true);
	let isFeatured = $state(false);

	// États d'upload Cloudflare R2
	let videoFileInput: HTMLInputElement | null = $state(null);
	let thumbnailFileInput: HTMLInputElement | null = $state(null);
	let selectedVideoFile = $state<File | null>(null);
	let isUploadingToR2 = $state(false);
	let uploadProgress = $state(0);
	let uploadStatusText = $state('');

	// Aperçu vidéo local & détection durée
	let localVideoPreviewUrl = $state<string | null>(null);
	let hiddenVideoDetectEl: HTMLVideoElement | null = $state(null);

	// Modale de prévisualisation vidéo
	let previewModalOpen = $state(false);
	let previewingVideo = $state<{
		title: string;
		url: string;
		thumbnail?: string | null;
		description?: string | null;
	} | null>(null);

	// Guide R2 rétractable
	let showR2Guide = $state(false);

	// Formatage automatique des secondes en mm:ss
	function formatDuration(seconds: number): string {
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
	}

	// Gestion de la sélection du fichier vidéo
	function handleVideoFileChange(e: Event) {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;

		selectedVideoFile = file;

		// Créer URL locale pour aperçu et calcul durée
		if (localVideoPreviewUrl) {
			URL.revokeObjectURL(localVideoPreviewUrl);
		}
		localVideoPreviewUrl = URL.createObjectURL(file);

		// Si le titre est vide, suggérer le nom du fichier sans extension
		if (!title.trim()) {
			const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
			title = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
		}
	}

	// Quand les métadonnées de la vidéo locale sont chargées
	function onVideoMetadataLoaded(e: Event) {
		const video = e.target as HTMLVideoElement;
		if (video && video.duration && !isNaN(video.duration) && isFinite(video.duration)) {
			duration = formatDuration(video.duration);
		}
	}

	// Upload vers Cloudflare R2 via URL pré-signée (indispensable pour les gros fichiers sur Vercel)
	async function startUploadVideoToR2(): Promise<string | null> {
		if (!selectedVideoFile) {
			toast.error('Veuillez sélectionner un fichier vidéo.', 'Fichier requis');
			return null;
		}

		isUploadingToR2 = true;
		uploadProgress = 0;
		uploadStatusText = 'Obtention de l’autorisation sécurisée Cloudflare R2...';

		try {
			// 1. Demander une URL pré-signée à SvelteKit
			const res = await fetch('/api/upload-url', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					filename: selectedVideoFile.name,
					contentType: selectedVideoFile.type || 'video/mp4',
					folder: 'videos'
				})
			});

			const data = await res.json();

			if (!res.ok || !data.success) {
				throw new Error(data.error || 'Impossible de générer l’URL d’upload Cloudflare R2.');
			}

			const { uploadUrl, publicUrl } = data;

			uploadStatusText = 'Transfert direct vers le stockage Cloudflare R2...';

			// 2. Upload direct du navigateur vers Cloudflare R2 avec suivi de progression XMLHttpRequest
			await new Promise<void>((resolve, reject) => {
				const xhr = new XMLHttpRequest();
				xhr.open('PUT', uploadUrl, true);
				xhr.setRequestHeader('Content-Type', selectedVideoFile!.type || 'video/mp4');

				xhr.upload.onprogress = (event) => {
					if (event.lengthComputable) {
						uploadProgress = Math.round((event.loaded / event.total) * 100);
						uploadStatusText = `Envoi vers Cloudflare R2 : ${uploadProgress}%`;
					}
				};

				xhr.onload = () => {
					if (xhr.status >= 200 && xhr.status < 300) {
						resolve();
					} else {
						reject(new Error(`Échec de l’envoi vers R2 (code HTTP ${xhr.status})`));
					}
				};

				xhr.onerror = () =>
					reject(new Error('Erreur réseau lors du transfert vers Cloudflare R2.'));
				xhr.send(selectedVideoFile);
			});

			uploadProgress = 100;
			uploadStatusText = 'Vidéo uploadée avec succès sur Cloudflare R2 !';
			videoUrl = publicUrl;

			toast.success('Votre vidéo a été stockée sur Cloudflare R2.', 'Upload R2 réussi');
			return publicUrl;
		} catch (err: unknown) {
			console.error('Erreur upload R2:', err);
			const msg = err instanceof Error ? err.message : String(err);
			uploadStatusText = `Erreur : ${msg}`;
			toast.error(msg, 'Échec d’upload');
			return null;
		} finally {
			isUploadingToR2 = false;
		}
	}

	// Upload d'une miniature / cover vers R2
	async function handleThumbnailFileChange(e: Event) {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;

		try {
			const formData = new FormData();
			formData.append('file', file);
			formData.append('folder', 'thumbnails');

			const res = await fetch('/api/upload', {
				method: 'POST',
				body: formData
			});

			const data = await res.json();
			if (res.ok && data.success && data.url) {
				thumbnailUrl = data.url;
				toast.success('Miniature uploadée sur Cloudflare R2.', 'Miniature enregistrée');
			} else {
				throw new Error(data.error || 'Erreur upload miniature');
			}
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : String(err);
			toast.error(msg, 'Erreur');
		}
	}

	function resolveMediaUrl(url: string | null | undefined): string {
		if (!url) return '';
		if (url.includes('.r2.cloudflarestorage.com')) {
			const match = url.match(/\.r2\.cloudflarestorage\.com\/[^/]+\/(.+)$/);
			if (match && match[1]) {
				const encodedKey = match[1]
					.split('/')
					.map((seg) => encodeURIComponent(decodeURIComponent(seg)))
					.join('/');
				return `/api/media/${encodedKey}`;
			}
		}
		return url;
	}

	function openPreviewModal(video: {
		title: string;
		url: string;
		thumbnail?: string | null;
		description?: string | null;
	}) {
		previewingVideo = {
			...video,
			url: resolveMediaUrl(video.url),
			thumbnail: resolveMediaUrl(video.thumbnail)
		};
		previewModalOpen = true;
	}
</script>

<svelte:head>
	<title>Gestion des Vidéos Homepage — Administration ECOFIP</title>
</svelte:head>

<div class="space-y-8">
	<!-- En-tête de la page -->
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<div class="flex items-center gap-2.5">
				<h1 class="font-display text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
					Vidéos & Temps Forts (Homepage)
				</h1>
				<Badge color={data.isR2Configured ? 'success' : 'neutral'}>
					<Cloud size={13} class="mr-1" />
					<span>{data.isR2Configured ? 'R2 Connecté' : 'R2 Non Configuré'}</span>
				</Badge>
				{#if data.isR2Configured && !data.isR2PublicDomainConfigured}
					<span
						class="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800"
					>
						Streaming interne actif
					</span>
				{/if}
			</div>
			<p class="mt-1 font-body text-sm text-text-secondary">
				Publiez et organisez les reportages vidéo qui s’affichent dans la section immersive de la
				page d’accueil.
			</p>
		</div>

		<!-- Bouton pour afficher le guide Cloudflare R2 -->
		<Button
			variant="outline"
			size="sm"
			onclick={() => (showR2Guide = !showR2Guide)}
			class="self-start sm:self-auto"
		>
			<Cloud size={16} class="mr-2 text-brand-primary" />
			<span>{showR2Guide ? 'Masquer la configuration R2' : 'Configuration Cloudflare R2'}</span>
		</Button>
	</div>

	<!-- Panneau d'instructions Cloudflare R2 -->
	{#if showR2Guide || !data.isR2Configured}
		<Card class="border-blue-200 bg-blue-50/60 p-6">
			<div class="flex items-start gap-4">
				<div
					class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white"
				>
					<Cloud size={20} />
				</div>
				<div class="flex-1 space-y-3 font-body text-sm">
					<div>
						<h3 class="font-bold text-blue-950">
							Stockage Cloudflare R2 & Vercel — Guide d'intégration
						</h3>
						<p class="mt-0.5 text-xs leading-relaxed text-blue-900">
							Cloudflare R2 utilise une API compatible S3 sans frais de bande passante sortante. Les
							vidéos sont uploadées directement depuis votre navigateur vers R2 via des URLs
							pré-signées pour contourner la limite de 4.5 Mo de Vercel.
						</p>
					</div>

					<div
						class="space-y-1 rounded-xl bg-blue-950 p-4 font-mono text-xs text-blue-100 select-all"
					>
						<div class="mb-1 font-bold text-blue-300">
							# Variables à renseigner dans Vercel ou dans votre .env :
						</div>
						<div>R2_ENDPOINT="https://&lt;account-id&gt;.r2.cloudflarestorage.com"</div>
						<div>R2_ACCESS_KEY_ID="&lt;votre-access-key&gt;"</div>
						<div>R2_SECRET_ACCESS_KEY="&lt;votre-secret-key&gt;"</div>
						<div>R2_BUCKET_NAME="ecofip-media"</div>
						<div>R2_PUBLIC_URL="https://&lt;votre-domaine-r2&gt;.r2.dev"</div>
					</div>

					<div
						class="space-y-1.5 rounded-xl border border-blue-200 bg-white/70 p-3 text-xs leading-relaxed text-blue-900"
					>
						<p class="font-bold text-blue-950">💡 Diffusion des vidéos (R2_PUBLIC_URL) :</p>
						<p>
							Cloudflare R2 sépare l’API de stockage (privée S3) de la diffusion publique. Pour un
							chargement CDN ultra-rapide : dans votre console Cloudflare &gt; R2 &gt; votre bucket
							<code>ecofip-media</code> &gt; <strong>Settings</strong> &gt;
							<strong>Public access</strong>, activez le sous-domaine
							<strong>R2.dev subdomain</strong>
							(cliquer sur <em>Allow Access</em>) puis renseignez l’URL
							<code>https://pub-xxxxxx.r2.dev</code>
							dans
							<code>R2_PUBLIC_URL</code>.
						</p>
						<p class="text-blue-800 italic">
							En attendant ou en développement local, notre serveur prend le relais automatiquement
							via le streaming interne (<code>/api/media/...</code>) pour que vos vidéos soient
							immédiatement visibles.
						</p>
					</div>
				</div>
			</div>
		</Card>
	{/if}

	<!-- Messages de succès ou d'erreur -->
	{#if form?.error}
		<Alert variant="danger">
			{form.error}
		</Alert>
	{/if}

	{#if form?.success && form?.message}
		<Alert variant="success">
			{form.message}
		</Alert>
	{/if}

	<!-- Formulaire d'ajout d'une nouvelle vidéo -->
	<Card class="p-6 sm:p-8">
		<div class="mb-6 border-b border-gray-100 pb-4">
			<h2 class="font-display text-xl font-bold text-text-primary">
				Ajouter une nouvelle vidéo sur la Homepage
			</h2>
			<p class="mt-1 font-body text-xs text-text-secondary sm:text-sm">
				Téléversez une vidéo directement sur Cloudflare R2 ou saisissez une URL de diffusion.
			</p>
		</div>

		<!-- Onglets de choix de source vidéo -->
		<div class="mb-6 flex max-w-md items-center gap-2 rounded-2xl bg-gray-100 p-1.5">
			<button
				type="button"
				onclick={() => (videoSourceMode = 'upload')}
				class="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl py-2 font-body text-xs font-bold transition-all {videoSourceMode ===
				'upload'
					? 'bg-white text-brand-primary shadow-xs'
					: 'text-text-secondary hover:text-text-primary'}"
			>
				<UploadCloud size={16} />
				<span>Upload Cloudflare R2</span>
			</button>
			<button
				type="button"
				onclick={() => (videoSourceMode = 'url')}
				class="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl py-2 font-body text-xs font-bold transition-all {videoSourceMode ===
				'url'
					? 'bg-white text-brand-primary shadow-xs'
					: 'text-text-secondary hover:text-text-primary'}"
			>
				<LinkIcon size={16} />
				<span>URL Vidéo Directe</span>
			</button>
		</div>

		<!-- Formulaire principal avec SvelteKit Form Action -->
		<form
			method="POST"
			action="?/create"
			use:enhance={async ({ formData, cancel }) => {
				// 1. Si un fichier vidéo est choisi mais pas encore uploadé sur R2, lancer l'upload automatiquement
				if (videoSourceMode === 'upload' && selectedVideoFile && !videoUrl) {
					const uploadedUrl = await startUploadVideoToR2();
					if (!uploadedUrl) {
						cancel();
						return;
					}
					formData.set('videoUrl', uploadedUrl);
				}

				// 2. Garantir la transmission des valeurs liées dans FormData
				formData.set('title', title);
				formData.set('duration', duration);
				formData.set('location', location);
				formData.set('description', description);
				if (thumbnailUrl) formData.set('thumbnailUrl', thumbnailUrl);
				if (videoUrl) formData.set('videoUrl', videoUrl);

				return async ({ update, result }) => {
					await update();
					if (result.type === 'success') {
						title = '';
						duration = '03:30';
						location = 'Yaoundé · Esplanade Omnisports';
						description = '';
						videoUrl = '';
						thumbnailUrl = '';
						isFeatured = false;
						selectedVideoFile = null;
						if (videoFileInput) videoFileInput.value = '';
						if (localVideoPreviewUrl) {
							URL.revokeObjectURL(localVideoPreviewUrl);
							localVideoPreviewUrl = null;
						}
						toast.success('La vidéo a été ajoutée avec succès !', 'Enregistrement réussi');
					}
				};
			}}
			class="space-y-6"
		>
			<!-- Zone Dédiée au Choix / Upload de la Vidéo -->
			{#if videoSourceMode === 'upload'}
				<div
					class="rounded-3xl border-2 border-dashed border-gray-300 bg-[#f8fafc] p-6 text-center transition-colors hover:border-brand-primary/50"
				>
					<input
						type="file"
						accept="video/mp4,video/webm,video/quicktime"
						bind:this={videoFileInput}
						onchange={handleVideoFileChange}
						class="hidden"
						id="video-file-picker"
					/>

					{#if selectedVideoFile}
						<div class="space-y-4">
							<div class="flex items-center justify-center gap-3">
								<div
									class="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary text-white shadow-xs"
								>
									<FileVideo size={24} />
								</div>
								<div class="text-left">
									<strong class="block font-body text-sm font-bold text-text-primary">
										{selectedVideoFile.name}
									</strong>
									<span class="font-body text-xs text-text-secondary">
										{(selectedVideoFile.size / (1024 * 1024)).toFixed(2)} Mo • Type : {selectedVideoFile.type ||
											'video/mp4'}
									</span>
								</div>
							</div>

							<!-- Barre de progression -->
							{#if isUploadingToR2}
								<div class="mx-auto max-w-md space-y-2">
									<div class="h-2 w-full overflow-hidden rounded-full bg-gray-200">
										<div
											class="h-full bg-brand-primary transition-all duration-300"
											style="width: {uploadProgress}%;"
										></div>
									</div>
									<p class="font-body text-xs font-medium text-brand-primary">
										{uploadStatusText}
									</p>
								</div>
							{:else if videoUrl}
								<div
									class="flex items-center justify-center gap-2 font-body text-xs font-bold text-emerald-600"
								>
									<CheckCircle2 size={16} />
									<span>Prêt pour enregistrement (URL R2 stockée)</span>
								</div>
							{/if}

							<!-- Boutons d'action pour le fichier sélectionné -->
							<div class="flex flex-wrap items-center justify-center gap-3 pt-2">
								{#if !videoUrl && !isUploadingToR2}
									<Button type="button" variant="primary" size="sm" onclick={startUploadVideoToR2}>
										<UploadCloud size={16} class="mr-2" />
										<span>Envoyer le fichier vers Cloudflare R2</span>
									</Button>
								{/if}

								<Button
									type="button"
									variant="outline"
									size="sm"
									onclick={() => {
										selectedVideoFile = null;
										if (videoFileInput) videoFileInput.value = '';
										if (localVideoPreviewUrl) {
											URL.revokeObjectURL(localVideoPreviewUrl);
											localVideoPreviewUrl = null;
										}
									}}
								>
									Changer de fichier
								</Button>
							</div>
						</div>
					{:else}
						<label for="video-file-picker" class="flex cursor-pointer flex-col items-center py-4">
							<div
								class="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-subtle text-brand-primary shadow-xs"
							>
								<UploadCloud size={28} />
							</div>
							<span class="font-display text-base font-bold text-text-primary">
								Cliquez pour choisir une vidéo (.mp4, .webm, .mov)
							</span>
							<span class="mt-1 font-body text-xs text-text-secondary">
								Le fichier sera uploadé directement sur Cloudflare R2 via URL pré-signée sécurisée
							</span>
						</label>
					{/if}

					<!-- Élément vidéo masqué pour détecter automatiquement la durée -->
					{#if localVideoPreviewUrl}
						<video
							src={localVideoPreviewUrl}
							bind:this={hiddenVideoDetectEl}
							onloadedmetadata={onVideoMetadataLoaded}
							class="hidden"
						>
							<track kind="captions" />
						</video>
					{/if}
				</div>
			{:else}
				<!-- Mode Saisie URL Directe -->
				<Input
					name="directVideoUrl"
					label="URL directe du fichier vidéo (.mp4, .webm)"
					placeholder="https://commondatastorage.googleapis.com/.../video.mp4 ou https://r2.dev/video.mp4"
					bind:value={videoUrl}
					required
				/>
			{/if}

			<!-- Champ caché pour transmettre l'URL vidéo au formulaire action -->
			<input type="hidden" name="videoUrl" value={videoUrl} />

			<!-- Grille Titre & Durée & Lieu -->
			<div class="grid grid-cols-1 gap-5 sm:grid-cols-3">
				<div class="sm:col-span-2">
					<Input
						name="title"
						label="Titre de la vidéo"
						placeholder="Ex: Grande Croisade & Nuit d’Évangélisation"
						bind:value={title}
						required
					/>
				</div>
				<Input
					name="duration"
					label="Durée (mm:ss)"
					placeholder="Ex: 04:35"
					bind:value={duration}
					required
				/>
			</div>

			<div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
				<Input
					name="location"
					label="Lieu / Ville de tournage"
					placeholder="Ex: Yaoundé · Esplanade Omnisports"
					bind:value={location}
					required
				/>

				<div>
					<label
						for="thumbnail-input"
						class="mb-1.5 block font-body text-xs font-semibold text-text-primary"
					>
						Miniature / Image de couverture (URL ou fichier)
					</label>
					<div class="flex gap-2">
						<input
							type="text"
							id="thumbnail-input"
							placeholder="/video-highlights-cover.jpg ou URL R2"
							bind:value={thumbnailUrl}
							class="flex-1 rounded-xl border border-gray-200 bg-white px-3.5 py-2 font-body text-sm text-text-primary focus:border-brand-primary focus:outline-hidden"
						/>
						<input
							type="file"
							accept="image/*"
							bind:this={thumbnailFileInput}
							onchange={handleThumbnailFileChange}
							class="hidden"
							id="thumb-file-picker"
						/>
						<label
							for="thumb-file-picker"
							class="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 font-body text-xs font-semibold text-text-secondary hover:bg-gray-100"
						>
							<ImageIcon size={15} />
							<span>Upload</span>
						</label>
					</div>
					<input type="hidden" name="thumbnailUrl" value={thumbnailUrl} />
				</div>
			</div>

			<Textarea
				name="description"
				label="Description / Contexte du reportage"
				placeholder="Partagez un court résumé des événements de foi vécus lors de cette croisade..."
				rows={3}
				bind:value={description}
			/>

			<!-- Publication immédiate -->
			<div class="flex items-center gap-3">
				<input
					type="checkbox"
					id="isPublished"
					name="isPublished"
					checked={isPublished}
					class="h-4.5 w-4.5 cursor-pointer rounded-sm border-gray-300 text-brand-primary focus:ring-brand-primary"
				/>
				<label
					for="isPublished"
					class="cursor-pointer font-body text-sm font-semibold text-text-primary select-none"
				>
					Afficher immédiatement cette vidéo sur la Homepage
				</label>
			</div>

			<!-- WIDGET SWITCH : VIDÉO À LA UNE -->
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
						<label for="isFeatured" class="block text-xs font-bold text-amber-950">
							Mettre en avant sur la Homepage
						</label>
						<span class="block text-[11px] text-amber-800">
							Vidéo chargée en premier dans le lecteur et lancée automatiquement (une seule à la
							une)
						</span>
					</div>
				</div>

				<label class="relative inline-flex cursor-pointer items-center select-none">
					<input
						type="checkbox"
						id="isFeatured"
						name="isFeatured"
						bind:checked={isFeatured}
						class="peer sr-only"
					/>
					<div
						class="h-6 w-11 rounded-full bg-gray-200 transition-colors peer-checked:bg-amber-500 peer-focus-visible:ring-2 peer-focus-visible:ring-amber-500 peer-focus-visible:ring-offset-2 after:absolute after:top-0.5 after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-xs after:transition-all after:content-[''] peer-checked:after:translate-x-full"
					></div>
				</label>
			</div>

			<!-- Bouton de soumission -->
			<div class="pt-2">
				<Button
					type="submit"
					variant="primary"
					size="lg"
					disabled={isUploadingToR2 ||
						(!videoUrl && videoSourceMode === 'upload' && !selectedVideoFile)}
				>
					{#if isUploadingToR2}
						<UploadCloud size={18} class="mr-2 animate-bounce" />
						<span>Upload R2 en cours ({uploadProgress}%)...</span>
					{:else}
						<Film size={18} class="mr-2" />
						<span>Enregistrer et publier la vidéo</span>
					{/if}
				</Button>
			</div>
		</form>
	</Card>

	<!-- Liste des vidéos existantes -->
	<Card class="p-6 sm:p-8">
		<div
			class="mb-6 flex flex-col gap-2 border-b border-gray-100 pb-4 sm:flex-row sm:items-center sm:justify-between"
		>
			<div>
				<h2 class="font-display text-xl font-bold text-text-primary">
					Vidéos enregistrées ({data.videos.length})
				</h2>
				<p class="font-body text-xs text-text-secondary">
					Les vidéos publiées apparaissent dans le carrousel des chapitres de la homepage.
				</p>
			</div>
			{#if data.usingNeonDb}
				<Badge color="success">Base Neon connectée</Badge>
			{:else}
				<Badge color="neutral">Mode fallback local</Badge>
			{/if}
		</div>

		{#if data.videos.length === 0}
			<div class="py-12 text-center text-text-secondary">
				<Film size={36} class="mx-auto mb-3 opacity-40" />
				<p class="font-body text-sm">Aucune vidéo enregistrée pour le moment.</p>
			</div>
		{:else}
			<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				{#each data.videos as video (video.id)}
					<div
						class="group flex flex-col justify-between overflow-hidden rounded-3xl border border-gray-200/80 bg-white shadow-xs transition-all duration-200 hover:shadow-md"
					>
						<div>
							<!-- Aperçu miniature avec bouton lecture -->
							<div class="relative aspect-video w-full overflow-hidden bg-black">
								<img
									src={video.thumbnailUrl || '/video-highlights-cover.jpg'}
									alt={video.title}
									class="h-full w-full object-cover opacity-85 transition-transform duration-300 group-hover:scale-105"
								/>
								<div
									class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"
								></div>

								<!-- Bouton Play pour ouvrir la prévisualisation -->
								<button
									type="button"
									onclick={() =>
										openPreviewModal({
											title: video.title,
											url: video.videoUrl,
											thumbnail: video.thumbnailUrl,
											description: video.description
										})}
									class="absolute inset-0 flex cursor-pointer items-center justify-center transition-transform hover:scale-110"
									aria-label="Lire la vidéo"
								>
									<span
										class="flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary text-white shadow-lg"
									>
										<Play size={20} class="translate-x-0.5 fill-white" />
									</span>
								</button>

								<!-- Badge Durée -->
								<div
									class="absolute bottom-3 left-3 flex items-center gap-1 rounded-md bg-black/75 px-2 py-0.5 font-body text-[11px] font-bold text-white backdrop-blur-xs"
								>
									<Clock size={12} />
									<span>{video.duration}</span>
								</div>

								{#if video.isFeatured}
									<!-- Badge À la une en haut à gauche -->
									<div class="absolute top-3 left-3">
										<span
											class="inline-flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-0.5 font-body text-[11px] font-bold text-amber-950 shadow-xs"
										>
											<Sparkles size={11} class="fill-amber-950" />
											À la une
										</span>
									</div>
								{/if}

								<!-- Badge Statut en haut à droite -->
								<div class="absolute top-3 right-3">
									{#if video.isPublished}
										<span
											class="rounded-full bg-emerald-500 px-2.5 py-0.5 font-body text-[11px] font-bold text-white shadow-xs"
										>
											En ligne
										</span>
									{:else}
										<span
											class="rounded-full bg-gray-500 px-2.5 py-0.5 font-body text-[11px] font-bold text-white shadow-xs"
										>
											Masquée
										</span>
									{/if}
								</div>
							</div>

							<!-- Contenu descriptif -->
							<div class="p-5">
								<h3 class="line-clamp-1 font-display text-base font-bold text-text-primary">
									{video.title}
								</h3>

								<div class="mt-2 flex items-center gap-1.5 font-body text-xs text-text-secondary">
									<MapPin size={13} class="shrink-0 text-brand-primary" />
									<span class="truncate">{video.location}</span>
								</div>

								{#if video.description}
									<div
										class="mt-2.5 line-clamp-2 font-body text-xs leading-relaxed text-text-secondary"
									>
										<LinkifiedText
											text={video.description}
											linkClass="text-brand-primary font-semibold underline underline-offset-2 hover:text-brand-primary-hover break-all"
										/>
									</div>
								{/if}
							</div>
						</div>

						<!-- Actions de gestion -->
						<div
							class="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 bg-[#f8fafc] px-5 py-3"
						>
							<!-- Basculer publication -->
							<form method="POST" action="?/togglePublish" use:enhance>
								<input type="hidden" name="id" value={video.id} />
								<button
									type="submit"
									class="inline-flex cursor-pointer items-center gap-1.5 font-body text-xs font-semibold text-text-secondary transition-colors hover:text-brand-primary"
								>
									{#if video.isPublished}
										<EyeOff size={14} />
										<span>Masquer</span>
									{:else}
										<Eye size={14} />
										<span>Publier</span>
									{/if}
								</button>
							</form>

							<!-- Basculer mise à la une -->
							<form
								method="POST"
								action="?/toggleFeatured"
								use:enhance={() => {
									return async ({ result, update }) => {
										if (result.type === 'success') {
											toast.success(
												(result.data as { message?: string })?.message ||
													'Mise en avant mise à jour.'
											);
										} else if (result.type === 'failure') {
											toast.error(
												(result.data as { error?: string })?.error ||
													'Erreur lors de la mise à jour.'
											);
										}
										await update({ reset: false });
									};
								}}
							>
								<input type="hidden" name="id" value={video.id} />
								<input type="hidden" name="target" value={video.isFeatured ? 'false' : 'true'} />
								<button
									type="submit"
									aria-pressed={Boolean(video.isFeatured)}
									class="inline-flex cursor-pointer items-center gap-1.5 font-body text-xs font-semibold transition-colors {video.isFeatured
										? 'text-amber-700 hover:text-amber-800'
										: 'text-text-secondary hover:text-amber-700'}"
								>
									<Sparkles size={14} class={video.isFeatured ? 'fill-amber-400' : ''} />
									<span>{video.isFeatured ? 'Retirer de la une' : 'Mettre à la une'}</span>
								</button>
							</form>

							<!-- Supprimer -->
							<form method="POST" action="?/delete" use:enhance>
								<input type="hidden" name="id" value={video.id} />
								<button
									type="submit"
									onclick={(e) => {
										if (!confirm(`Supprimer définitivement la vidéo « ${video.title} » ?`)) {
											e.preventDefault();
										}
									}}
									class="inline-flex cursor-pointer items-center gap-1 font-body text-xs font-semibold text-red-600 transition-colors hover:text-red-700"
								>
									<Trash2 size={14} />
									<span>Supprimer</span>
								</button>
							</form>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</Card>
</div>

<!-- Modal de prévisualisation vidéo -->
<Modal
	bind:open={previewModalOpen}
	title={previewingVideo?.title || 'Aperçu vidéo'}
	description={previewingVideo?.description || ''}
>
	{#if previewingVideo}
		<div class="space-y-4 py-2">
			<div class="relative overflow-hidden rounded-2xl bg-black">
				<video
					src={previewingVideo.url}
					poster={previewingVideo.thumbnail || '/video-highlights-cover.jpg'}
					controls
					autoplay
					class="max-h-[60vh] w-full object-contain"
				>
					<track kind="captions" />
					Votre navigateur ne supporte pas la lecture vidéo.
				</video>
			</div>

			<div class="rounded-xl bg-gray-50 p-3 font-mono text-xs break-all text-text-secondary">
				<strong class="mb-1 block font-sans font-bold text-text-primary">URL de diffusion :</strong>
				{previewingVideo.url}
			</div>
		</div>
	{/if}

	{#snippet actions()}
		<Button variant="outline" size="md" onclick={() => (previewModalOpen = false)}>Fermer</Button>
	{/snippet}
</Modal>
