<script lang="ts">
	import type { RadioGroupProps } from '../types.js';

	let {
		id,
		name,
		label = '',
		value = $bindable(''),
		options = [],
		error = '',
		disabled = false,
		required = false,
		class: customClass = '',
		onchange
	}: RadioGroupProps = $props();

	function handleSelect(val: string | number) {
		if (disabled) return;
		value = val;
		onchange?.(val);
	}
</script>

<fieldset {id} class="flex flex-col gap-2 font-body {customClass}" {disabled}>
	{#if label}
		<legend class="mb-1.5 flex items-center gap-1 text-sm font-semibold text-text-primary">
			{label}
			{#if required}
				<span class="text-brand-primary" aria-hidden="true">*</span>
			{/if}
		</legend>
	{/if}

	<div class="flex flex-col gap-2">
		{#each options as opt, index (opt.value)}
			{@const optId = `${name}-${index}`}
			{@const isSelected = value === opt.value}
			{@const isOptDisabled = disabled || opt.disabled}

			<label
				for={optId}
				class="relative flex cursor-pointer items-start gap-3 rounded-md border p-3.5 transition-colors duration-150 select-none {isSelected
					? 'border-brand-primary bg-brand-subtle/40'
					: 'border-border bg-white hover:border-[#cbd5e1]'} {isOptDisabled
					? 'cursor-not-allowed bg-surface opacity-60'
					: ''}"
			>
				<div class="relative flex items-center pt-0.5">
					<input
						type="radio"
						id={optId}
						{name}
						value={opt.value}
						checked={isSelected}
						disabled={isOptDisabled}
						onchange={() => handleSelect(opt.value)}
						class="peer sr-only"
					/>
					<div
						class="flex h-5 w-5 items-center justify-center rounded-full border transition-all duration-150 {isSelected
							? 'border-brand-primary'
							: 'border-border bg-white'} peer-focus-visible:border-brand-secondary peer-focus-visible:ring-2 peer-focus-visible:ring-brand-secondary/30"
					>
						{#if isSelected}
							<div class="h-2.5 w-2.5 rounded-full bg-brand-primary"></div>
						{/if}
					</div>
				</div>

				<div class="flex flex-col">
					<span
						class="text-base font-medium {isSelected
							? 'font-semibold text-brand-primary'
							: 'text-text-primary'}"
					>
						{opt.label}
					</span>
					{#if opt.description}
						<span class="mt-0.5 text-sm text-text-secondary">
							{opt.description}
						</span>
					{/if}
				</div>
			</label>
		{/each}
	</div>

	{#if error}
		<p class="text-sm text-danger">
			{error}
		</p>
	{/if}
</fieldset>
