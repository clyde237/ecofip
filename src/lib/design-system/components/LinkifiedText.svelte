<script lang="ts">
	import { parseTextWithLinks } from '$lib/utils/linkify.js';

	let {
		text = '',
		class: customClass = '',
		linkClass = 'text-brand-primary underline hover:text-brand-primary-hover break-all font-medium'
	}: {
		text?: string | null;
		class?: string;
		linkClass?: string;
	} = $props();

	let chunks = $derived(parseTextWithLinks(text ?? ''));
</script>

{#if text}
	<span class="whitespace-pre-line {customClass}">
		{#each chunks as chunk}
			{#if chunk.type === 'link'}
				<a
					href={chunk.url}
					target="_blank"
					rel="noopener noreferrer"
					class={linkClass}
					onclick={(e) => e.stopPropagation()}
				>
					{chunk.content}
				</a>
			{:else}
				{chunk.content}
			{/if}
		{/each}
	</span>
{/if}
