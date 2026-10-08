<script lang="ts">
	/** Carte d'article (grille des Actualités, « À lire aussi »). wide : version large à la une. */
	import { Calendar, Clock, ArrowRight, Star } from '@lucide/svelte';
	import type { DetailedArticleItem } from '../types.js';

	interface Props {
		article: DetailedArticleItem;
		wide?: boolean;
		featuredBadge?: boolean;
		class?: string;
	}

	let { article, wide = false, featuredBadge = false, class: customClass = '' }: Props = $props();
</script>

<a
	href={article.href}
	class="group flex overflow-hidden rounded-3xl border border-gray-200/80 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-gray-300 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-brand-primary {wide
		? 'flex-col md:flex-row'
		: 'flex-col'} {customClass}"
>
	<div
		class="relative shrink-0 overflow-hidden bg-gray-100 {wide
			? 'aspect-[16/10] md:aspect-auto md:w-1/2'
			: 'aspect-[16/10]'}"
	>
		<img
			src={article.image}
			alt=""
			class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
			loading="lazy"
		/>
		<div class="absolute top-3.5 left-3.5 flex flex-wrap gap-1.5">
			{#if featuredBadge}
				<span
					class="inline-flex items-center gap-1 rounded-full bg-amber-400 px-3 py-1 font-body text-[11px] font-bold text-amber-950 shadow-xs"
				>
					<Star size={11} class="fill-amber-950" /> À la une
				</span>
			{/if}
			<span
				class="rounded-full bg-white/95 px-3 py-1 font-body text-[11px] font-bold text-brand-primary shadow-xs"
			>
				{article.category}
			</span>
		</div>
	</div>
	<div class="flex flex-1 flex-col p-5 {wide ? 'md:p-8' : ''}">
		<div
			class="flex flex-wrap items-center gap-3 font-body text-xs font-semibold text-text-secondary"
		>
			<span class="flex items-center gap-1.5">
				<Calendar size={13} class="text-brand-primary" />{article.date}
			</span>
			<span class="flex items-center gap-1.5"><Clock size={13} />{article.readTime}</span>
		</div>
		<h3
			class="mt-3 font-display leading-snug font-bold tracking-tight text-text-primary transition-colors group-hover:text-brand-primary {wide
				? 'text-2xl md:text-[28px]'
				: 'line-clamp-2 text-lg'}"
		>
			{article.title}
		</h3>
		<p
			class="mt-2.5 font-body text-sm leading-relaxed text-text-secondary {wide
				? 'line-clamp-4'
				: 'line-clamp-3'}"
		>
			{article.excerpt}
		</p>
		<div
			class="mt-auto flex items-center justify-between border-t border-gray-100 pt-4 font-body text-xs"
		>
			<span class="truncate font-semibold text-text-primary">{article.authorName}</span>
			<span class="flex shrink-0 items-center gap-1 font-bold text-brand-primary">
				Lire <ArrowRight size={14} class="transition-transform group-hover:translate-x-0.5" />
			</span>
		</div>
	</div>
</a>
