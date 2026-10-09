<script lang="ts">
	/**
	 * Affichage du texte d'un article (document de l'éditeur ou ancien format texte,
	 * voir src/lib/utils/articleContent.ts). Rendu entièrement par Svelte : aucun HTML saisi
	 * n'est injecté dans la page.
	 */
	import {
		parseArticleContent,
		type InlineSegment,
		type ListBlock
	} from '$lib/utils/articleContent.js';

	interface Props {
		content: string;
		class?: string;
	}

	let { content, class: customClass = '' }: Props = $props();

	let blocks = $derived(parseArticleContent(content));
</script>

{#snippet styled(segment: InlineSegment)}
	{#if segment.bold && segment.italic}
		<strong class="font-bold text-text-primary"><em>{segment.text}</em></strong>
	{:else if segment.bold}
		<strong class="font-bold text-text-primary">{segment.text}</strong>
	{:else if segment.italic}
		<em>{segment.text}</em>
	{:else}
		{segment.text}
	{/if}
{/snippet}

{#snippet inline(segments: InlineSegment[])}
	{#each segments as segment, index (index)}
		{#if segment.lineBreak}
			<br />
		{:else if segment.href}
			<a
				href={segment.href}
				class="font-semibold text-brand-primary underline underline-offset-2 hover:text-brand-primary-hover"
				target={segment.href.startsWith('/') ? undefined : '_blank'}
				rel={segment.href.startsWith('/') ? undefined : 'noopener noreferrer'}
				>{@render styled(segment)}</a
			>
		{:else if segment.underline}
			<u class="underline-offset-2">{@render styled(segment)}</u>
		{:else}
			{@render styled(segment)}
		{/if}
	{/each}
{/snippet}

{#snippet list(block: ListBlock)}
	{#if block.ordered}
		<ol class="list-decimal space-y-1.5 pl-6 marker:font-semibold marker:text-brand-primary">
			{#each block.items as item, index (index)}
				<li>
					{@render inline(item.segments)}
					{#each item.children as child, childIndex (childIndex)}
						<div class="mt-1.5">{@render list(child)}</div>
					{/each}
				</li>
			{/each}
		</ol>
	{:else}
		<ul class="list-disc space-y-1.5 pl-6 marker:text-brand-primary">
			{#each block.items as item, index (index)}
				<li>
					{@render inline(item.segments)}
					{#each item.children as child, childIndex (childIndex)}
						<div class="mt-1.5">{@render list(child)}</div>
					{/each}
				</li>
			{/each}
		</ul>
	{/if}
{/snippet}

<div
	class="space-y-5 font-body text-base leading-relaxed text-text-secondary sm:text-[17px] {customClass}"
>
	{#each blocks as block, index (index)}
		{#if block.type === 'heading'}
			{#if block.level === 3}
				<h3 class="pt-2 font-display text-xl font-bold tracking-tight text-text-primary">
					{block.text}
				</h3>
			{:else}
				<h2
					class="pt-4 font-display text-2xl font-bold tracking-tight text-text-primary sm:text-[26px]"
				>
					{block.text}
				</h2>
			{/if}
		{:else if block.type === 'paragraph'}
			<p>{@render inline(block.segments)}</p>
		{:else if block.type === 'quote'}
			<blockquote
				class="rounded-r-2xl border-l-4 border-brand-primary bg-brand-subtle/50 py-3 pr-4 pl-5 font-display text-lg text-text-primary italic"
			>
				{@render inline(block.segments)}
			</blockquote>
		{:else if block.type === 'list'}
			{@render list(block)}
		{:else if block.type === 'image'}
			<figure class="py-2">
				<img
					src={block.src}
					alt={block.alt}
					class="w-full rounded-2xl border border-gray-200 object-cover"
					loading="lazy"
				/>
				{#if block.alt}
					<figcaption class="mt-2 text-center text-sm text-text-secondary italic">
						{block.alt}
					</figcaption>
				{/if}
			</figure>
		{:else if block.type === 'divider'}
			<hr class="my-8 border-gray-200" />
		{/if}
	{/each}
</div>
