<script lang="ts">
	import type { AlertProps } from '../types.js';
	import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from '@lucide/svelte';

	let {
		variant = 'info',
		title = '',
		dismissible = false,
		ondismiss,
		class: customClass = '',
		children
	}: AlertProps = $props();

	let dismissed = $state(false);

	function handleDismiss() {
		dismissed = true;
		ondismiss?.();
	}

	const variantStyles = {
		success: 'bg-emerald-50/80 border-success/20 text-[#0f5132]',
		warning: 'bg-amber-50/80 border-warning/30 text-[#855d00]',
		danger: 'bg-red-50/80 border-danger/25 text-[#842029]',
		info: 'bg-blue-50/80 border-info/25 text-[#084298]'
	};

	const iconStyles = {
		success: 'text-success',
		warning: 'text-warning',
		danger: 'text-danger',
		info: 'text-info'
	};
</script>

{#if !dismissed}
	<div
		role="alert"
		class="relative flex gap-3.5 rounded-lg border p-4 font-body transition-all duration-200 {variantStyles[
			variant
		]} {customClass}"
	>
		<div class="shrink-0 pt-0.5 {iconStyles[variant]}">
			{#if variant === 'success'}
				<CheckCircle2 size={20} />
			{:else if variant === 'warning'}
				<AlertTriangle size={20} />
			{:else if variant === 'danger'}
				<AlertCircle size={20} />
			{:else}
				<Info size={20} />
			{/if}
		</div>

		<div class="flex-1 text-sm leading-relaxed sm:text-base">
			{#if title}
				<h5 class="mb-1 text-base font-bold text-text-primary">{title}</h5>
			{/if}
			<div>
				{@render children?.()}
			</div>
		</div>

		{#if dismissible}
			<button
				type="button"
				onclick={handleDismiss}
				aria-label="Fermer l'alerte"
				class="-mt-1 -mr-1 shrink-0 rounded-md p-1.5 text-text-secondary transition-colors hover:bg-black/5 hover:text-text-primary"
			>
				<X size={18} />
			</button>
		{/if}
	</div>
{/if}
