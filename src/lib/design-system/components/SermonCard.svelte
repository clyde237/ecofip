<script lang="ts">
	/** Vignette verticale (9:16) d'une prédication : lien vers sa page, ou ouverture du lecteur. */
	import { Play, Clock } from '@lucide/svelte';
	import type { PublicSermon } from '../types.js';

	interface Props {
		sermon: PublicSermon;
		/** Si fourni, la vignette ouvre le lecteur au lieu de naviguer vers la page */
		onSelect?: () => void;
		class?: string;
	}

	let { sermon, onSelect, class: customClass = '' }: Props = $props();

	const cardClass =
		'group relative block aspect-[9/16] w-full overflow-hidden rounded-2xl bg-gray-900 text-left shadow-sm transition-transform duration-300 hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary';
</script>

{#snippet content()}
	{#if sermon.posterUrl}
		<img
			src={sermon.posterUrl}
			alt=""
			class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
			loading="lazy"
		/>
	{/if}
	<div
		class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/20"
		aria-hidden="true"
	></div>
	<span
		class="absolute top-1/2 left-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-transform group-hover:scale-110"
		aria-hidden="true"
	>
		<Play size={20} class="translate-x-0.5 fill-white" />
	</span>
	{#if sermon.duration}
		<span
			class="absolute top-2.5 right-2.5 inline-flex items-center gap-1 rounded-md bg-black/60 px-1.5 py-0.5 font-body text-[10px] font-bold text-white"
		>
			<Clock size={10} />{sermon.duration}
		</span>
	{/if}
	<span class="absolute inset-x-0 bottom-0 p-3 text-white">
		{#if sermon.series}
			<span
				class="block truncate font-body text-[10px] font-bold tracking-wider text-amber-300 uppercase"
				>{sermon.series}</span
			>
		{/if}
		<span class="mt-0.5 line-clamp-2 block font-display text-sm leading-snug font-bold">
			{sermon.title}
		</span>
		{#if sermon.preacher}
			<span class="mt-1 block truncate font-body text-[11px] text-white/75">{sermon.preacher}</span>
		{/if}
	</span>
{/snippet}

{#if onSelect}
	<button type="button" onclick={onSelect} class="{cardClass} cursor-pointer {customClass}">
		{@render content()}
		<span class="sr-only">Regarder « {sermon.title} »</span>
	</button>
{:else}
	<a href={sermon.href} class="{cardClass} {customClass}">
		{@render content()}
		<span class="sr-only">Regarder « {sermon.title} »</span>
	</a>
{/if}
