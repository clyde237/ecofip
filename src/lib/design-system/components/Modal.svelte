<script lang="ts">
	import type { ModalProps } from '../types.js';
	import { X } from '@lucide/svelte';

	let {
		open = $bindable(false),
		title = '',
		description = '',
		onclose,
		closeOnBackdropClick = true,
		class: customClass = '',
		children,
		actions
	}: ModalProps = $props();

	let dialogElement: HTMLDialogElement | null = $state(null);

	$effect(() => {
		if (!dialogElement) return;

		if (open && !dialogElement.open) {
			dialogElement.showModal();
		} else if (!open && dialogElement.open) {
			dialogElement.close();
		}
	});

	function handleClose() {
		open = false;
		onclose?.();
	}

	function handleCancel(event: Event) {
		event.preventDefault();
		handleClose();
	}

	function handleBackdropClick(event: MouseEvent) {
		if (closeOnBackdropClick && event.target === dialogElement) {
			handleClose();
		}
	}
</script>

<dialog
	bind:this={dialogElement}
	oncancel={handleCancel}
	onclick={handleBackdropClick}
	class="open:animate-in open:fade-in-0 open:zoom-in-95 fixed inset-0 m-auto w-full max-w-lg rounded-xl border border-border bg-white p-0 font-body text-text-primary shadow-lg duration-200 backdrop:bg-black/40 backdrop:backdrop-blur-xs {customClass}"
>
	<div class="flex flex-col">
		<!-- Header -->
		<div class="flex items-start justify-between border-b border-border p-6 pb-4">
			<div>
				{#if title}
					<h3 class="font-display text-xl font-bold text-text-primary sm:text-2xl">
						{title}
					</h3>
				{/if}
				{#if description}
					<p class="mt-1.5 text-sm leading-relaxed text-text-secondary sm:text-base">
						{description}
					</p>
				{/if}
			</div>

			<button
				type="button"
				onclick={handleClose}
				aria-label="Fermer la boîte de dialogue"
				class="rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface hover:text-text-primary focus-visible:outline-2 focus-visible:outline-brand-secondary"
			>
				<X size={20} />
			</button>
		</div>

		<!-- Content -->
		<div class="p-6 text-base leading-relaxed text-text-primary">
			{@render children?.()}
		</div>

		<!-- Actions -->
		{#if actions}
			<div
				class="flex items-center justify-end gap-3 border-t border-border bg-surface/50 px-6 py-4"
			>
				{@render actions()}
			</div>
		{/if}
	</div>
</dialog>
