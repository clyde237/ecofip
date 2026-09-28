<script lang="ts">
	import type { SelectProps } from '../types.js';
	import { ChevronDown } from '@lucide/svelte';

	let {
		id,
		name,
		label,
		value = $bindable(''),
		options = [],
		placeholder = 'Sélectionner une option',
		helperText = '',
		error = '',
		disabled = false,
		required = false,
		class: customClass = '',
		onchange,
		...restProps
	}: SelectProps = $props();

	const autoId = `select-${Math.random().toString(36).substring(2, 9)}`;
	const selectId = $derived(id ?? autoId);
	const describedById = $derived(
		error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined
	);
</script>

<div class="flex w-full flex-col gap-1.5 font-body {customClass}">
	{#if label}
		<label for={selectId} class="flex items-center gap-1 text-sm font-semibold text-text-primary">
			{label}
			{#if required}
				<span class="text-brand-primary" aria-hidden="true">*</span>
			{/if}
		</label>
	{/if}

	<div class="relative flex items-center">
		<select
			id={selectId}
			{name}
			bind:value
			{disabled}
			{required}
			aria-invalid={error ? 'true' : 'false'}
			aria-describedby={describedById}
			{onchange}
			class="h-11 w-full appearance-none rounded-md border bg-white pr-10 pl-4 text-base text-text-primary transition-colors duration-150 focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-surface disabled:text-text-disabled {error
				? 'border-danger focus-visible:border-danger focus-visible:ring-2 focus-visible:ring-danger/25'
				: 'border-border hover:border-[#cbd5e1] focus-visible:border-brand-secondary focus-visible:ring-2 focus-visible:ring-brand-secondary/25'}"
			{...restProps}
		>
			{#if placeholder}
				<option value="" disabled selected={!value}>
					{placeholder}
				</option>
			{/if}
			{#each options as opt (opt.value)}
				<option value={opt.value} disabled={opt.disabled}>
					{opt.label}
				</option>
			{/each}
		</select>

		<div class="pointer-events-none absolute right-3 text-text-secondary" aria-hidden="true">
			<ChevronDown size={18} />
		</div>
	</div>

	{#if error}
		<p id="{selectId}-error" class="flex items-center gap-1 text-xs text-danger sm:text-sm">
			{error}
		</p>
	{:else if helperText}
		<p id="{selectId}-helper" class="text-xs text-text-secondary sm:text-sm">
			{helperText}
		</p>
	{/if}
</div>
