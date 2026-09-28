<script lang="ts">
	import { toast } from '../toast.svelte.js';
	import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from '@lucide/svelte';

	const typeStyles = {
		success: 'bg-white border-success/30 text-text-primary shadow-md',
		warning: 'bg-white border-warning/40 text-text-primary shadow-md',
		danger: 'bg-white border-danger/30 text-text-primary shadow-md',
		info: 'bg-white border-info/30 text-text-primary shadow-md'
	};

	const iconMap = {
		success: CheckCircle2,
		warning: AlertTriangle,
		danger: AlertCircle,
		info: Info
	};

	const iconColors = {
		success: 'text-success',
		warning: 'text-warning',
		danger: 'text-danger',
		info: 'text-info'
	};
</script>

<div
	aria-live="polite"
	aria-atomic="true"
	class="pointer-events-none fixed right-4 bottom-4 z-50 flex w-full max-w-sm flex-col gap-2 px-4 sm:px-0"
>
	{#each toast.items as item (item.id)}
		{@const Icon = iconMap[item.type]}
		<div
			role="status"
			class="animate-in slide-in-from-bottom-2 fade-in pointer-events-auto flex items-start gap-3 rounded-lg border p-3.5 font-body transition-all duration-200 {typeStyles[
				item.type
			]}"
		>
			<div class="shrink-0 pt-0.5 {iconColors[item.type]}">
				<Icon size={18} />
			</div>

			<div class="flex-1 text-xs leading-relaxed">
				{#if item.title}
					<h6 class="mb-0.5 font-bold text-text-primary">{item.title}</h6>
				{/if}
				<p class="text-text-secondary">{item.message}</p>
			</div>

			<button
				type="button"
				onclick={() => toast.remove(item.id)}
				aria-label="Fermer la notification"
				class="-mt-1 -mr-1 shrink-0 rounded-md p-1 text-text-disabled transition-colors hover:bg-surface hover:text-text-primary"
			>
				<X size={14} />
			</button>
		</div>
	{/each}
</div>
