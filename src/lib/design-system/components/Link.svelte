<script lang="ts">
	import type { LinkProps } from '../types.js';
	import { ExternalLink } from '@lucide/svelte';

	let {
		href,
		variant = 'navigation',
		active = false,
		external = false,
		class: customClass = '',
		children,
		target,
		rel,
		...restProps
	}: LinkProps = $props();

	const variantStyles = {
		navigation: 'font-medium transition-colors duration-150',
		inline:
			'text-brand-primary underline underline-offset-4 hover:text-brand-primary-hover font-medium',
		subtle: 'text-text-secondary hover:text-text-primary transition-colors duration-150'
	};

	const resolvedTarget = $derived(external ? (target ?? '_blank') : target);
	const resolvedRel = $derived(external ? (rel ?? 'noopener noreferrer') : rel);
</script>

<a
	{href}
	target={resolvedTarget}
	rel={resolvedRel}
	class="inline-flex items-center gap-1 font-body {variantStyles[variant]} {variant === 'navigation'
		? active
			? 'font-semibold text-brand-primary'
			: 'text-text-primary hover:text-brand-primary'
		: ''} {customClass}"
	{...restProps}
>
	{@render children?.()}
	{#if external}
		<ExternalLink size={14} class="opacity-75" aria-hidden="true" />
	{/if}
</a>
