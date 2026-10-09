<script lang="ts">
	/**
	 * Gadgets d'un événement (t-shirts, polos, casquettes…) dans le formulaire admin.
	 * Les images choisies restent dans le navigateur ; elles partent sur R2 à l'enregistrement.
	 */
	import {
		ArrowDown,
		ArrowUp,
		ImagePlus,
		MessageCircle,
		Plus,
		ShoppingBag,
		Trash2,
		X
	} from '@lucide/svelte';
	import { toast } from '$lib/design-system/toast.svelte.js';
	import {
		MAX_MERCHANDISE_IMAGES,
		MAX_MERCHANDISE_ITEMS,
		newMerchandiseDraft,
		releaseDraftPreviews,
		type MerchandiseDraft
	} from '$lib/utils/eventMerchandise.js';

	interface Props {
		items: MerchandiseDraft[];
		whatsapp: string;
		idPrefix: string;
	}

	let { items = $bindable(), whatsapp = $bindable(), idPrefix }: Props = $props();

	const MAX_SOURCE_IMAGE_MB = 15;
	const inputClass =
		'mt-1 w-full rounded-xl border border-border bg-white px-3 text-text-primary focus:border-brand-primary focus:outline-none';

	function addItem() {
		if (items.length >= MAX_MERCHANDISE_ITEMS) return;
		items.push(newMerchandiseDraft());
	}

	function removeItem(index: number) {
		releaseDraftPreviews(items.slice(index, index + 1));
		items.splice(index, 1);
	}

	function moveItem(index: number, offset: -1 | 1) {
		const target = index + offset;
		if (target < 0 || target >= items.length) return;
		[items[index], items[target]] = [items[target], items[index]];
	}

	function addImages(item: MerchandiseDraft, files: FileList | null) {
		const free = MAX_MERCHANDISE_IMAGES - item.images.length;
		const selected = Array.from(files ?? []);
		if (selected.length > free) {
			toast.error(`${MAX_MERCHANDISE_IMAGES} images maximum par gadget.`, 'Trop d’images');
		}
		for (const file of selected.slice(0, Math.max(free, 0))) {
			if (!file.type.startsWith('image/')) {
				toast.error(`« ${file.name} » n’est pas une image.`, 'Format invalide');
				continue;
			}
			if (file.size > MAX_SOURCE_IMAGE_MB * 1024 * 1024) {
				toast.error(`« ${file.name} » dépasse ${MAX_SOURCE_IMAGE_MB} Mo.`, 'Image trop lourde');
				continue;
			}
			item.images.push({ key: null, previewUrl: URL.createObjectURL(file), file });
		}
	}

	function removeImage(item: MerchandiseDraft, index: number) {
		const [image] = item.images.splice(index, 1);
		if (image?.file) URL.revokeObjectURL(image.previewUrl);
	}
</script>

<div class="space-y-4 rounded-2xl border border-gray-200/90 bg-[#f8fafc] p-4">
	<div class="flex items-start gap-3">
		<div
			class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary"
		>
			<ShoppingBag size={16} />
		</div>
		<div>
			<h4 class="text-xs font-bold text-text-primary sm:text-sm">
				Gadgets & boutique <span class="font-normal text-text-disabled">(optionnel)</span>
			</h4>
			<p class="mt-0.5 text-[11px] text-text-secondary">
				T-shirts, polos, casquettes… vendus avant et après l’événement pour soutenir l’œuvre. Les
				visiteurs commandent sur WhatsApp depuis la page de l’événement.
			</p>
		</div>
	</div>

	{#if items.length > 0}
		<div>
			<label for="{idPrefix}-merch-whatsapp" class="block font-semibold text-text-primary">
				Numéro WhatsApp des commandes *
			</label>
			<div class="relative">
				<MessageCircle
					size={15}
					class="pointer-events-none absolute top-1/2 left-3 mt-0.5 -translate-y-1/2 text-[#25D366]"
				/>
				<input
					id="{idPrefix}-merch-whatsapp"
					name="merchandiseWhatsapp"
					bind:value={whatsapp}
					required
					inputmode="tel"
					maxlength="60"
					placeholder="Ex : +237 690 76 33 27 ou https://wa.me/237690763327"
					class="{inputClass} h-10 pl-9"
				/>
			</div>
		</div>
	{:else}
		<input type="hidden" name="merchandiseWhatsapp" value={whatsapp} />
	{/if}

	{#each items as item, index (item.id)}
		<fieldset class="space-y-3 rounded-xl border border-gray-200 bg-white p-3.5">
			<legend class="sr-only">Gadget {index + 1}</legend>
			<div class="flex items-center justify-between gap-2">
				<span class="text-xs font-bold text-text-primary">
					Gadget {index + 1}{item.name.trim() ? ` · ${item.name.trim()}` : ''}
				</span>
				<div class="flex items-center gap-1">
					<button
						type="button"
						onclick={() => moveItem(index, -1)}
						disabled={index === 0}
						class="cursor-pointer rounded-lg p-1.5 text-text-secondary hover:bg-gray-100 disabled:cursor-default disabled:opacity-30"
						aria-label="Monter le gadget {index + 1}"
					>
						<ArrowUp size={14} />
					</button>
					<button
						type="button"
						onclick={() => moveItem(index, 1)}
						disabled={index === items.length - 1}
						class="cursor-pointer rounded-lg p-1.5 text-text-secondary hover:bg-gray-100 disabled:cursor-default disabled:opacity-30"
						aria-label="Descendre le gadget {index + 1}"
					>
						<ArrowDown size={14} />
					</button>
					<button
						type="button"
						onclick={() => removeItem(index)}
						class="cursor-pointer rounded-lg p-1.5 text-red-600 hover:bg-red-50"
						aria-label="Retirer le gadget {index + 1}"
					>
						<Trash2 size={14} />
					</button>
				</div>
			</div>

			<div class="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_140px]">
				<div>
					<label
						for="{idPrefix}-merch-{item.id}-name"
						class="block font-semibold text-text-primary"
					>
						Nom *
					</label>
					<input
						id="{idPrefix}-merch-{item.id}-name"
						bind:value={item.name}
						required
						maxlength="80"
						placeholder="Ex : T-shirt officiel"
						class="{inputClass} h-10"
					/>
				</div>
				<div>
					<label
						for="{idPrefix}-merch-{item.id}-price"
						class="block font-semibold text-text-primary"
					>
						Prix (FCFA) *
					</label>
					<input
						id="{idPrefix}-merch-{item.id}-price"
						bind:value={item.price}
						required
						inputmode="numeric"
						pattern="[0-9 ]+"
						maxlength="12"
						placeholder="Ex : 2500"
						class="{inputClass} h-10"
					/>
				</div>
			</div>

			<div>
				<label
					for="{idPrefix}-merch-{item.id}-description"
					class="block font-semibold text-text-primary"
				>
					Description <span class="font-normal text-text-disabled">(coloris, tailles…)</span>
				</label>
				<input
					id="{idPrefix}-merch-{item.id}-description"
					bind:value={item.description}
					maxlength="200"
					placeholder="Ex : Coloris bleu, blanc ou noir"
					class="{inputClass} h-10"
				/>
			</div>

			<div>
				<span class="block font-semibold text-text-primary">
					Images <span class="font-normal text-text-disabled">
						({item.images.length}/{MAX_MERCHANDISE_IMAGES}, la première sert de vignette)
					</span>
				</span>
				<div class="mt-1.5 flex flex-wrap gap-2">
					{#each item.images as image, imageIndex (image.previewUrl)}
						<div
							class="relative h-[86px] w-[72px] overflow-hidden rounded-lg border border-gray-200 bg-gray-100"
						>
							<img src={image.previewUrl} alt="" class="h-full w-full object-cover" />
							<button
								type="button"
								onclick={() => removeImage(item, imageIndex)}
								class="absolute top-1 right-1 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-black/70 text-white hover:bg-black"
								aria-label="Retirer l’image {imageIndex + 1} de {item.name ||
									`gadget ${index + 1}`}"
							>
								<X size={11} />
							</button>
						</div>
					{/each}
					{#if item.images.length < MAX_MERCHANDISE_IMAGES}
						<label
							class="flex h-[86px] w-[72px] cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-gray-300 text-[10px] font-semibold text-text-secondary hover:border-brand-primary/60 hover:text-brand-primary"
						>
							<ImagePlus size={16} />
							Ajouter
							<input
								type="file"
								accept="image/jpeg,image/png,image/webp"
								multiple
								class="sr-only"
								onchange={(event) => {
									addImages(item, event.currentTarget.files);
									event.currentTarget.value = '';
								}}
							/>
						</label>
					{/if}
				</div>
			</div>

			<label class="flex cursor-pointer items-center gap-2 text-xs font-semibold text-text-primary">
				<input
					type="checkbox"
					bind:checked={item.available}
					class="h-4 w-4 rounded text-brand-primary focus:ring-brand-primary"
				/>
				Disponible à la commande
				<span class="font-normal text-text-secondary">
					{item.available ? '' : '(affiché « Épuisé » sur le site)'}
				</span>
			</label>
		</fieldset>
	{/each}

	<button
		type="button"
		onclick={addItem}
		disabled={items.length >= MAX_MERCHANDISE_ITEMS}
		class="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-dashed border-brand-primary/50 px-3.5 py-2 text-xs font-bold text-brand-primary hover:bg-brand-primary/5 disabled:cursor-default disabled:opacity-40"
	>
		<Plus size={14} /> Ajouter un gadget
	</button>
</div>
