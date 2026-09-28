<script lang="ts">
	import type { InputProps } from '../types.js';
	import { AlertCircle } from '@lucide/svelte';

	let {
		id,
		name,
		label,
		type = 'text',
		value = $bindable(''),
		placeholder = '',
		helperText = '',
		error = '',
		disabled = false,
		required = false,
		readonly = false,
		class: customClass = '',
		oninput,
		onchange,
		...restProps
	}: InputProps = $props();

	// Génération d'un ID unique si non fourni pour l'accessibilité RGAA
	const autoId = `input-${Math.random().toString(36).substring(2, 9)}`;
	const inputId = $derived(id ?? autoId);
	const describedById = $derived(
		error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
	);
</script>

<div class="flex w-full flex-col gap-1.5 font-body {customClass}">
	{#if label}
		<label for={inputId} class="flex items-center gap-1 text-sm font-semibold text-text-primary">
			{label}
			{#if required}
				<span class="text-brand-primary" aria-hidden="true">*</span>
			{/if}
		</label>
	{/if}

	<div class="relative flex items-center">
		<input
			id={inputId}
			{name}
			{type}
			bind:value
			{placeholder}
			{disabled}
			{required}
			{readonly}
			aria-invalid={error ? 'true' : 'false'}
			aria-describedby={describedById}
			{oninput}
			{onchange}
			class="h-11 w-full rounded-md border bg-white px-4 text-base text-text-primary transition-colors duration-150 placeholder:text-text-disabled focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-surface disabled:text-text-disabled {error
				? 'border-danger focus-visible:border-danger focus-visible:ring-2 focus-visible:ring-danger/25'
				: 'border-border hover:border-[#cbd5e1] focus-visible:border-brand-secondary focus-visible:ring-2 focus-visible:ring-brand-secondary/25'}"
			{...restProps}
		/>

		{#if error}
			<div class="pointer-events-none absolute right-3 text-danger" aria-hidden="true">
				<AlertCircle size={18} />
			</div>
		{/if}
	</div>

	{#if error}
		<p id="{inputId}-error" class="flex items-center gap-1 text-xs text-danger sm:text-sm">
			{error}
		</p>
	{:else if helperText}
		<p id="{inputId}-helper" class="text-xs text-text-secondary sm:text-sm">
			{helperText}
		</p>
	{/if}
</div>
