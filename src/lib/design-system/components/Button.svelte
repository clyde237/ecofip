<script lang="ts">
	import type { ButtonProps } from '../types.js';
	import { Loader2 } from '@lucide/svelte';

	let {
		variant = 'primary',
		size = 'md',
		type = 'button',
		loading = false,
		fullWidth = false,
		disabled = false,
		href,
		class: customClass = '',
		children,
		...restProps
	}: ButtonProps = $props();

	const variantStyles = {
		primary:
			'bg-brand-primary text-white hover:bg-brand-primary-hover active:bg-[#a6000a] shadow-sm',
		secondary: 'bg-white text-brand-primary hover:bg-brand-subtle active:bg-[#ffe0e3] shadow-sm',
		outline:
			'bg-transparent border border-brand-primary text-brand-primary hover:bg-brand-subtle active:bg-[#ffe0e3]'
	};

	const sizeStyles = {
		sm: 'h-9 px-4 text-sm font-semibold rounded-md gap-2',
		md: 'h-11 px-5 text-base font-semibold rounded-lg gap-2.5',
		lg: 'h-13 px-7 text-lg font-bold rounded-xl gap-3'
	};
</script>

{#if href}
	<a
		{href}
		class="inline-flex cursor-pointer items-center justify-center font-body transition-all duration-200 select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-secondary disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 {variantStyles[
			variant
		]} {sizeStyles[size]} {fullWidth ? 'w-full' : ''} {customClass}"
		aria-disabled={disabled || loading}
		tabindex={disabled || loading ? -1 : undefined}
		{...restProps}
	>
		{#if loading}
			<Loader2
				class="animate-spin text-current"
				size={size === 'sm' ? 16 : size === 'lg' ? 22 : 18}
			/>
		{/if}
		{@render children?.()}
	</a>
{:else}
	<button
		{type}
		class="inline-flex cursor-pointer items-center justify-center font-body font-medium transition-all duration-200 select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-secondary disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 {variantStyles[
			variant
		]} {sizeStyles[size]} {fullWidth ? 'w-full' : ''} {customClass}"
		disabled={disabled || loading}
		aria-busy={loading}
		{...restProps}
	>
		{#if loading}
			<Loader2
				class="animate-spin text-current"
				size={size === 'sm' ? 16 : size === 'lg' ? 22 : 18}
			/>
		{/if}
		{@render children?.()}
	</button>
{/if}
