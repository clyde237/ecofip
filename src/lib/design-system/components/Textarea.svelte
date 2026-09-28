<script lang="ts">
	import type { TextareaProps } from '../types.js';

	let {
		id,
		name,
		label,
		value = $bindable(''),
		placeholder = '',
		rows = 4,
		helperText = '',
		error = '',
		disabled = false,
		required = false,
		readonly = false,
		class: customClass = '',
		oninput,
		onchange,
		...restProps
	}: TextareaProps = $props();

	const autoId = `textarea-${Math.random().toString(36).substring(2, 9)}`;
	const textareaId = $derived(id ?? autoId);
	const describedById = $derived(
		error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined
	);
</script>

<div class="flex w-full flex-col gap-1.5 font-body {customClass}">
	{#if label}
		<label for={textareaId} class="flex items-center gap-1 text-sm font-semibold text-text-primary">
			{label}
			{#if required}
				<span class="text-brand-primary" aria-hidden="true">*</span>
			{/if}
		</label>
	{/if}

	<textarea
		id={textareaId}
		{name}
		bind:value
		{placeholder}
		{rows}
		{disabled}
		{required}
		{readonly}
		aria-invalid={error ? 'true' : 'false'}
		aria-describedby={describedById}
		{oninput}
		{onchange}
		class="w-full rounded-md border bg-white p-3.5 text-base text-text-primary transition-colors duration-150 placeholder:text-text-disabled focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-surface disabled:text-text-disabled {error
			? 'border-danger focus-visible:border-danger focus-visible:ring-2 focus-visible:ring-danger/25'
			: 'border-border hover:border-[#cbd5e1] focus-visible:border-brand-secondary focus-visible:ring-2 focus-visible:ring-brand-secondary/25'}"
		{...restProps}></textarea>

	{#if error}
		<p id="{textareaId}-error" class="flex items-center gap-1 text-xs text-danger sm:text-sm">
			{error}
		</p>
	{:else if helperText}
		<p id="{textareaId}-helper" class="text-xs text-text-secondary sm:text-sm">
			{helperText}
		</p>
	{/if}
</div>
