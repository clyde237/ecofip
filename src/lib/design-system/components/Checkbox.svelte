<script lang="ts">
	import type { CheckboxProps } from '../types.js';
	import { Check } from '@lucide/svelte';

	let {
		id,
		name,
		checked = $bindable(false),
		label = '',
		description = '',
		error = '',
		disabled = false,
		required = false,
		class: customClass = '',
		onchange,
		...restProps
	}: CheckboxProps = $props();

	const autoId = `checkbox-${Math.random().toString(36).substring(2, 9)}`;
	const checkboxId = $derived(id ?? autoId);
</script>

<div class="flex flex-col gap-1 font-body {customClass}">
	<label for={checkboxId} class="relative flex cursor-pointer items-start gap-3 select-none">
		<div class="relative flex items-center pt-0.5">
			<input
				type="checkbox"
				id={checkboxId}
				{name}
				bind:checked
				{disabled}
				{required}
				{onchange}
				class="peer sr-only"
				{...restProps}
			/>
			<div
				class="flex h-5 w-5 items-center justify-center rounded-[4px] border transition-all duration-150 {checked
					? 'border-brand-primary bg-brand-primary text-white'
					: 'border-border bg-white hover:border-[#94a3b8]'} peer-focus-visible:border-brand-secondary peer-focus-visible:ring-2 peer-focus-visible:ring-brand-secondary/30 peer-disabled:cursor-not-allowed peer-disabled:border-border peer-disabled:bg-surface {error
					? 'border-danger'
					: ''}"
			>
				{#if checked}
					<Check size={14} strokeWidth={3} class="animate-in zoom-in-50 duration-150" />
				{/if}
			</div>
		</div>

		{#if label || description}
			<div class="flex flex-col">
				{#if label}
					<span
						class="text-base font-medium text-text-primary {disabled
							? 'cursor-not-allowed text-text-disabled'
							: ''}"
					>
						{label}
						{#if required}
							<span class="text-brand-primary" aria-hidden="true">*</span>
						{/if}
					</span>
				{/if}
				{#if description}
					<span class="mt-0.5 text-sm text-text-secondary {disabled ? 'text-text-disabled' : ''}">
						{description}
					</span>
				{/if}
			</div>
		{/if}
	</label>

	{#if error}
		<p class="ml-8 text-sm text-danger">
			{error}
		</p>
	{/if}
</div>
