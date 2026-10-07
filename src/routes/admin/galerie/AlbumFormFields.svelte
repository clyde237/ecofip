<script lang="ts">
	/**
	 * Champs d'un album de galerie (création et modification).
	 * Catégorie, lieu et date s'appliquent à tous les médias de l'album.
	 */
	interface Props {
		idPrefix: string;
		categorySuggestions?: string[];
		values?: {
			title?: string;
			category?: string;
			location?: string | null;
			year?: number | null;
			description?: string | null;
			isPublished?: boolean;
		};
	}

	let { idPrefix, categorySuggestions = [], values = {} }: Props = $props();

	const PRESET_CATEGORIES = [
		'Croisades',
		'Actions sociales',
		'Témoignages',
		'Mission nationale',
		'Jeunesse',
		'Formation',
		'Prière & intercession'
	];

	let suggestions = $derived(Array.from(new Set([...PRESET_CATEGORIES, ...categorySuggestions])));

	const inputClass =
		'mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-text-primary placeholder:text-gray-400 focus:border-brand-primary focus:outline-hidden';
	const labelClass = 'block text-xs font-bold text-text-primary';
</script>

<datalist id="{idPrefix}-category-suggestions">
	{#each suggestions as suggestion (suggestion)}
		<option value={suggestion}></option>
	{/each}
</datalist>

<div>
	<label for="{idPrefix}-title" class={labelClass}>Nom de l’album *</label>
	<input
		id="{idPrefix}-title"
		name="title"
		value={values.title ?? ''}
		required
		maxlength="200"
		placeholder="Ex : Croisade Bafoussam pour Jésus 2026"
		class={inputClass}
	/>
</div>
<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
	<div>
		<label for="{idPrefix}-category" class={labelClass}>Catégorie *</label>
		<input
			id="{idPrefix}-category"
			name="category"
			list="{idPrefix}-category-suggestions"
			value={values.category ?? 'Croisades'}
			required
			maxlength="100"
			class={inputClass}
		/>
	</div>
	<div>
		<label for="{idPrefix}-location" class={labelClass}>Lieu</label>
		<input
			id="{idPrefix}-location"
			name="location"
			value={values.location ?? ''}
			maxlength="150"
			placeholder="Ex : Bafoussam, Ouest"
			class={inputClass}
		/>
	</div>
	<div>
		<label for="{idPrefix}-year" class={labelClass}>Année</label>
		<input
			id="{idPrefix}-year"
			name="year"
			type="number"
			inputmode="numeric"
			min="1990"
			max={new Date().getFullYear() + 1}
			step="1"
			value={values.year ?? ''}
			placeholder="Ex : {new Date().getFullYear()}"
			class={inputClass}
		/>
	</div>
</div>
<div>
	<label for="{idPrefix}-description" class={labelClass}>Description</label>
	<textarea
		id="{idPrefix}-description"
		name="description"
		rows="3"
		maxlength="1000"
		placeholder="Présentation affichée en haut de l’album sur le site"
		class={inputClass}>{values.description ?? ''}</textarea
	>
</div>
<label class="flex items-center gap-2 text-sm font-semibold text-text-primary">
	<input
		type="checkbox"
		name="isPublished"
		checked={values.isPublished ?? true}
		class="h-4 w-4 rounded-sm text-brand-primary"
	/>
	Album visible sur le site (les médias masqués restent cachés)
</label>
