<script lang="ts">
	/**
	 * Statistiques d'une journée : image mise en avant, sessions (matinée, soirée…) et leurs
	 * chiffres. L'image part sur R2 à l'enregistrement ; fermer ou recharger l'annule.
	 */
	import { onDestroy } from 'svelte';
	import { enhance } from '$app/forms';
	import { ImagePlus, Plus, Trash2, X } from '@lucide/svelte';
	import { toast } from '$lib/design-system/toast.svelte.js';
	import {
		compressImage,
		isAbortError,
		toUploadFilename,
		uploadToR2
	} from '$lib/utils/r2Upload.js';

	type Session = { id: string; name: string; stats: { label: string; value: string }[] };

	interface Props {
		date: string;
		record: { sessions: Session[]; imageUrl: string | null; isPublished: boolean } | null;
		isR2Configured: boolean;
	}

	let { date, record, isR2Configured }: Props = $props();

	const STANDARD_LABELS = [
		'Personnes présentes',
		'Convertis',
		'Témoignages',
		'Personnes ayant reçu un miracle'
	];
	const inputClass =
		'w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-text-primary focus:border-brand-primary focus:outline-hidden';

	function newSession(name = ''): Session {
		return {
			id: crypto.randomUUID(),
			name,
			stats: STANDARD_LABELS.map((label) => ({ label, value: '' }))
		};
	}

	// Valeurs de départ ; le composant est recréé ({#key}) après chaque enregistrement
	// svelte-ignore state_referenced_locally
	let sessions = $state<Session[]>(
		record?.sessions.length
			? structuredClone(record.sessions).map((session) =>
					// Session enregistrée sans chiffres : les libellés habituels sont reproposés
					session.stats.length ? session : { ...session, stats: newSession().stats }
				)
			: [newSession('Soirée')]
	);
	// svelte-ignore state_referenced_locally
	let isPublished = $state(record?.isPublished ?? false);
	let imageFile = $state<File | null>(null);
	let imageKey = $state('');
	let imagePreview = $state<string | null>(null);
	let removeImage = $state(false);
	let isSaving = $state(false);
	let upload: AbortController | null = null;
	// Envoi de l'image interrompu si l'on quitte la page
	onDestroy(() => upload?.abort());
	let shownImage = $derived(imagePreview ?? (removeImage ? null : (record?.imageUrl ?? null)));

	function selectImage(file: File | undefined) {
		if (!file) return;
		if (!file.type.startsWith('image/')) {
			toast.error('Choisissez une image (JPG, PNG, WebP).', 'Format invalide');
			return;
		}
		if (imagePreview) URL.revokeObjectURL(imagePreview);
		imageFile = file;
		imageKey = '';
		imagePreview = URL.createObjectURL(file);
		removeImage = false;
	}
</script>

<datalist id="stat-labels">
	{#each STANDARD_LABELS as label (label)}
		<option value={label}></option>
	{/each}
</datalist>
<datalist id="session-names">
	<option value="Session matinale"></option>
	<option value="Après-midi"></option>
	<option value="Soirée"></option>
	<option value="Ateliers"></option>
</datalist>

<form
	method="POST"
	action="?/saveDay"
	use:enhance={async ({ formData, cancel }) => {
		isSaving = true;
		if (imageFile && !imageKey) {
			const current = new AbortController();
			upload = current;
			try {
				const blob = await compressImage(imageFile, 1600);
				const result = await uploadToR2(blob, {
					filename: toUploadFilename(imageFile.name, blob),
					folder: 'events',
					signal: current.signal
				});
				imageKey = result.key;
			} catch (err) {
				if (!isAbortError(err)) {
					toast.error(err instanceof Error ? err.message : String(err), 'Envoi interrompu');
				}
				isSaving = false;
				cancel();
				return;
			} finally {
				upload = null;
			}
		}
		formData.set('imageKey', imageKey);
		formData.set('sessions', JSON.stringify(sessions));
		return async ({ result, update }) => {
			isSaving = false;
			if (result.type === 'success') {
				toast.success(String(result.data?.message ?? 'Statistiques enregistrées.'));
			} else if (result.type === 'failure') {
				toast.error(String(result.data?.error ?? 'Une erreur est survenue.'), 'Erreur');
			}
			await update({ reset: false });
		};
	}}
	class="space-y-5"
>
	<input type="hidden" name="dayDate" value={date} />

	<div class="grid grid-cols-1 gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
		<!-- Image mise en avant -->
		<div>
			<span class="block text-xs font-bold text-text-primary">Image mise en avant</span>
			<label
				class="mt-1.5 flex aspect-[4/3] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-gray-300 bg-[#f8fafc] text-center hover:border-brand-primary/60 {isR2Configured
					? ''
					: 'pointer-events-none opacity-50'}"
			>
				{#if shownImage}
					<img src={shownImage} alt="" class="h-full w-full object-cover" />
				{:else}
					<span class="flex flex-col items-center gap-1.5 p-4 text-xs text-text-secondary">
						<ImagePlus size={22} class="text-brand-primary" />
						Choisir une photo de la journée
					</span>
				{/if}
				<input
					type="file"
					accept="image/jpeg,image/png,image/webp"
					class="sr-only"
					onchange={(event) => {
						selectImage(event.currentTarget.files?.[0]);
						event.currentTarget.value = '';
					}}
				/>
			</label>
			{#if record?.imageUrl && !imageFile}
				<label class="mt-2 flex items-center gap-2 text-xs text-text-secondary">
					<input type="checkbox" name="removeImage" bind:checked={removeImage} class="h-4 w-4" />
					Retirer l’image
				</label>
			{/if}
		</div>

		<!-- Sessions de la journée -->
		<div class="space-y-4">
			{#each sessions as session, sessionIndex (session.id)}
				<fieldset class="rounded-2xl border border-gray-200 bg-[#f8fafc] p-4">
					<legend class="sr-only">Session {sessionIndex + 1}</legend>
					<div class="flex items-center gap-2">
						<label class="sr-only" for="session-{date}-{session.id}">Nom de la session</label>
						<input
							id="session-{date}-{session.id}"
							bind:value={session.name}
							list="session-names"
							required
							maxlength="80"
							placeholder="Nom de la session (ex : Soirée)"
							class="{inputClass} font-bold"
						/>
						<button
							type="button"
							onclick={() => sessions.splice(sessionIndex, 1)}
							class="shrink-0 cursor-pointer rounded-lg p-2 text-red-600 hover:bg-red-50"
							aria-label="Retirer la session {session.name || sessionIndex + 1}"
						>
							<Trash2 size={16} />
						</button>
					</div>

					<div class="mt-3 space-y-2">
						{#each session.stats as stat, statIndex (statIndex)}
							<div class="grid grid-cols-[minmax(0,1fr)_120px_auto] items-center gap-2">
								<input
									bind:value={stat.label}
									list="stat-labels"
									maxlength="80"
									placeholder="Libellé"
									aria-label="Libellé de la statistique {statIndex + 1}"
									class={inputClass}
								/>
								<input
									bind:value={stat.value}
									maxlength="80"
									placeholder="Valeur"
									aria-label="Valeur : {stat.label || `statistique ${statIndex + 1}`}"
									class="{inputClass} text-right font-semibold"
								/>
								<button
									type="button"
									onclick={() => session.stats.splice(statIndex, 1)}
									class="cursor-pointer rounded-lg p-1.5 text-text-secondary hover:bg-white hover:text-red-600"
									aria-label="Retirer {stat.label || `la statistique ${statIndex + 1}`}"
								>
									<X size={15} />
								</button>
							</div>
						{/each}
					</div>
					<button
						type="button"
						onclick={() => session.stats.push({ label: '', value: '' })}
						disabled={session.stats.length >= 12}
						class="mt-2 inline-flex cursor-pointer items-center gap-1 text-xs font-bold text-brand-primary hover:underline disabled:opacity-40"
					>
						<Plus size={13} /> Ajouter une statistique
					</button>
				</fieldset>
			{/each}

			<button
				type="button"
				onclick={() => sessions.push(newSession())}
				disabled={sessions.length >= 6}
				class="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-dashed border-brand-primary/50 px-3.5 py-2 text-xs font-bold text-brand-primary hover:bg-brand-primary/5 disabled:opacity-40"
			>
				<Plus size={14} /> Ajouter une session (matinée, ateliers…)
			</button>
			<p class="text-[11px] text-text-secondary">
				Valeur en chiffres (ex : 1276) ou en texte si on ne pouvait pas compter (ex : plusieurs).
				Une ligne sans valeur est ignorée.
			</p>
		</div>
	</div>

	<div class="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
		<label class="flex items-center gap-2 text-sm font-semibold text-text-primary">
			<input type="checkbox" name="isPublished" bind:checked={isPublished} class="h-4 w-4" />
			Publié sur la page de l’événement
		</label>
		<button
			type="submit"
			disabled={isSaving}
			class="cursor-pointer rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-primary-hover disabled:opacity-50"
		>
			{isSaving ? 'Enregistrement…' : 'Enregistrer ce jour'}
		</button>
	</div>
</form>
