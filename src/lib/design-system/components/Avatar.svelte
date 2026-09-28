<script lang="ts">
	import type { AvatarProps } from '../types.js';

	let { src, alt = '', name = '', size = 'md', class: customClass = '' }: AvatarProps = $props();

	let imageError = $state(false);

	// Calcul des initiales si pas d'image ou si chargement échoué
	const initials = $derived(
		name
			? name
					.trim()
					.split(/\s+/)
					.map((part) => part[0])
					.slice(0, 2)
					.join('')
					.toUpperCase()
			: '?'
	);

	// Tailles selon le design system ECOFIP (section 24)
	const sizeStyles = {
		xs: 'h-7 w-7 text-xs font-semibold',
		sm: 'h-9 w-9 text-sm font-semibold',
		md: 'h-11 w-11 text-base font-semibold',
		lg: 'h-16 w-16 text-xl font-bold',
		xl: 'h-24 w-24 text-2xl font-bold'
	};
</script>

<div
	class="relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-surface font-body text-brand-primary select-none {sizeStyles[
		size
	]} {customClass}"
>
	{#if src && !imageError}
		<img
			{src}
			alt={alt || name}
			class="h-full w-full object-cover"
			onerror={() => (imageError = true)}
		/>
	{:else}
		<span
			class="flex h-full w-full items-center justify-center bg-brand-subtle font-semibold text-brand-primary"
		>
			{initials}
		</span>
	{/if}
</div>
