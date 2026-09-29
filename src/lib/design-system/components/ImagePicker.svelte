<script lang="ts">
	import { ImagePlus, UploadCloud, Trash2, RefreshCw } from '@lucide/svelte';

	interface Props {
		id?: string;
		name?: string;
		label?: string;
		required?: boolean;
		value?: string;
		helpText?: string;
	}

	let {
		id = 'image-picker',
		name = 'imageDataUrl',
		label = 'Image illustrative',
		required = false,
		value = $bindable(''),
		helpText = 'Sélectionnez une photo depuis votre appareil (JPG, PNG, WebP — max 5 Mo)'
	}: Props = $props();

	let fileInputRef: HTMLInputElement | undefined = $state();
	let isDragging = $state(false);
	let fileName = $state('');
	let fileSize = $state('');
	let isProcessing = $state(false);

	// Compresser l'image pour le stockage et l'affichage fluide
	function compressImage(dataUrl: string, maxDim = 1200, quality = 0.85): Promise<string> {
		return new Promise((resolve) => {
			const img = new Image();
			img.onload = () => {
				let width = img.width;
				let height = img.height;
				if (width > maxDim || height > maxDim) {
					if (width > height) {
						height = Math.round((height * maxDim) / width);
						width = maxDim;
					} else {
						width = Math.round((width * maxDim) / height);
						height = maxDim;
					}
				}
				const canvas = document.createElement('canvas');
				canvas.width = width;
				canvas.height = height;
				const ctx = canvas.getContext('2d');
				if (ctx) {
					ctx.drawImage(img, 0, 0, width, height);
					resolve(canvas.toDataURL('image/jpeg', quality));
				} else {
					resolve(dataUrl);
				}
			};
			img.onerror = () => resolve(dataUrl);
			img.src = dataUrl;
		});
	}

	async function processFile(file: File) {
		if (!file.type.startsWith('image/')) {
			alert('Veuillez sélectionner un fichier image valide.');
			return;
		}

		isProcessing = true;
		fileName = file.name;
		fileSize = (file.size / 1024).toFixed(0) + ' Ko';

		const reader = new FileReader();
		reader.onload = async (e) => {
			const rawDataUrl = e.target?.result as string;
			try {
				const compressed = await compressImage(rawDataUrl, 1200, 0.84);
				value = compressed;
			} catch {
				value = rawDataUrl;
			} finally {
				isProcessing = false;
			}
		};
		reader.readAsDataURL(file);
	}

	function handleFileChange(e: Event) {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file) {
			processFile(file);
		}
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		isDragging = false;
		const file = e.dataTransfer?.files?.[0];
		if (file) {
			processFile(file);
		}
	}

	function handleRemove() {
		value = '';
		fileName = '';
		fileSize = '';
		if (fileInputRef) {
			fileInputRef.value = '';
		}
	}
</script>

<div class="space-y-1.5">
	<div class="flex items-center justify-between">
		<label for={id} class="block text-xs font-bold text-text-primary sm:text-sm">
			{label}
			{#if required}
				<span class="text-brand-primary">*</span>
			{/if}
		</label>
		{#if value}
			<span class="text-[11px] font-medium text-emerald-600"> Image prête </span>
		{/if}
	</div>

	<!-- Champ input caché pour sélection de fichier système -->
	<input
		type="file"
		{id}
		bind:this={fileInputRef}
		accept="image/png,image/jpeg,image/webp,image/jpg"
		onchange={handleFileChange}
		class="sr-only"
	/>

	<!-- Champ hidden envoyé dans le formulaire standard SvelteKit -->
	<input type="hidden" {name} {value} />

	{#if value}
		<!-- ESPACE DE PRÉVISUALISATION -->
		<div
			class="group relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 transition-all hover:border-gray-300"
		>
			<div class="relative h-40 w-full overflow-hidden bg-black/5 sm:h-48">
				<img
					src={value}
					alt="Prévisualisation du fichier sélectionné"
					class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
				/>

				<div
					class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80"
				></div>

				<!-- Détails fichier en bas à gauche de la prévisualisation -->
				<div class="absolute bottom-3 left-3 text-white">
					{#if fileName}
						<p class="max-w-xs truncate text-xs font-bold drop-shadow-sm">{fileName}</p>
					{/if}
					{#if fileSize}
						<p class="text-[10px] text-white/80">{fileSize}</p>
					{/if}
				</div>

				<!-- Actions sur l'image en haut à droite -->
				<div class="absolute top-3 right-3 flex items-center gap-1.5">
					<button
						type="button"
						onclick={() => fileInputRef?.click()}
						class="flex cursor-pointer items-center gap-1 rounded-lg border border-white/30 bg-black/50 px-2.5 py-1.5 text-[11px] font-bold text-white backdrop-blur-xs transition-colors hover:bg-black/70"
						title="Changer d'image"
					>
						<RefreshCw size={12} />
						<span>Changer</span>
					</button>

					<button
						type="button"
						onclick={handleRemove}
						class="flex cursor-pointer items-center justify-center rounded-lg border border-white/30 bg-red-600/80 p-1.5 text-white backdrop-blur-xs transition-colors hover:bg-red-600"
						title="Supprimer cette image"
					>
						<Trash2 size={13} />
					</button>
				</div>
			</div>
		</div>
	{:else}
		<!-- ZONE DE SÉLECTION VIDE (CLIC OU GLISSER-DÉPOSER) -->
		<div
			role="button"
			tabindex="0"
			onclick={() => fileInputRef?.click()}
			onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && fileInputRef?.click()}
			ondragover={(e) => {
				e.preventDefault();
				isDragging = true;
			}}
			ondragleave={() => (isDragging = false)}
			ondrop={handleDrop}
			class="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all {isDragging
				? 'scale-[0.99] border-brand-primary bg-red-50/50'
				: 'border-gray-200 bg-gray-50/60 hover:border-brand-primary/50 hover:bg-gray-100/70'}"
		>
			<div
				class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-brand-primary shadow-xs"
			>
				{#if isProcessing}
					<RefreshCw size={22} class="animate-spin text-brand-primary" />
				{:else}
					<ImagePlus size={22} />
				{/if}
			</div>

			<p class="mt-3 text-xs font-bold text-text-primary sm:text-sm">
				{isProcessing ? 'Traitement de l’image...' : 'Sélectionner une photo depuis votre appareil'}
			</p>
			<p class="mt-1 text-[11px] text-text-secondary sm:text-xs">
				{helpText}
			</p>

			<div
				class="mt-3 flex items-center gap-1.5 rounded-lg border border-gray-100 bg-white px-3 py-1.5 text-xs font-bold text-brand-primary shadow-xs"
			>
				<UploadCloud size={14} />
				<span>Parcourir les photos</span>
			</div>
		</div>
	{/if}
</div>
