<script lang="ts">
	import type { BadgeProps } from '../types.js';

	let {
		variant = 'category',
		color = 'brand',
		class: customClass = '',
		children
	}: BadgeProps = $props();

	// Couleurs selon les tokens sémantiques et de marque
	const colorStyles = {
		brand: 'bg-brand-subtle text-brand-primary border-brand-primary/10',
		success: 'bg-emerald-50 text-success border-success/15',
		warning: 'bg-amber-50 text-[#b58000] border-warning/20',
		danger: 'bg-red-50 text-danger border-danger/15',
		info: 'bg-blue-50 text-info border-info/15',
		neutral: 'bg-surface text-text-secondary border-border'
	};

	// Variantes de forme et typographie (text-xs = 12px, text-sm = 14px)
	const variantStyles = {
		category: 'px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-md',
		status: 'px-3 py-1 text-xs font-semibold rounded-pill',
		date: 'px-2.5 py-1 text-xs font-bold rounded-md',
		tag: 'px-3 py-1.5 text-sm font-medium rounded-lg'
	};
</script>

<span
	class="inline-flex items-center gap-1.5 border font-body transition-colors duration-150 {colorStyles[
		color
	]} {variantStyles[variant]} {customClass}"
>
	{@render children?.()}
</span>
