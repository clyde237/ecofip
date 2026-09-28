<script lang="ts">
	import type { CardProps } from '../types.js';

	let {
		variant = 'standard',
		padding = 'md',
		class: customClass = '',
		children
	}: CardProps = $props();

	const variantStyles = {
		standard: 'bg-white border border-border rounded-lg shadow-sm',
		interactive:
			'bg-white border border-border rounded-lg shadow-sm hover:shadow-md hover:border-brand-primary/30 transition-all duration-250 cursor-pointer',
		flat: 'bg-surface border border-border rounded-lg'
	};

	const paddingStyles = {
		none: 'p-0',
		sm: 'p-4',
		md: 'p-6',
		lg: 'p-8'
	};
</script>

<div class="overflow-hidden {variantStyles[variant]} {paddingStyles[padding]} {customClass}">
	{@render children?.()}
</div>
