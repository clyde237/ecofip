<script lang="ts">
	/** Page Projets : les 3 ans de « Cameroun Pour Jésus » et la croisade de clôture à Bafoussam. */
	import Container from '../components/Container.svelte';
	import { Calendar, MapPin, Users, ArrowRight } from '@lucide/svelte';
	import { FINAL_CRUSADE, KEY_VERSES, PROGRAM, TIMELINE } from '$lib/data/camerounPourJesus.js';

	interface Props {
		/** Page de l'événement de clôture, si elle est publiée */
		finalCrusadeHref?: string;
		class?: string;
	}

	let { finalCrusadeHref, class: customClass = '' }: Props = $props();
</script>

<section class="bg-[#f8fafc] py-16 sm:py-20 lg:py-24 {customClass}" aria-labelledby="cpj-timeline">
	<Container>
		<div class="mx-auto max-w-3xl text-center">
			<p class="font-body text-xs font-bold tracking-widest text-brand-primary uppercase">
				3 ans sur le terrain
			</p>
			<h2
				id="cpj-timeline"
				class="mt-3 font-display text-3xl font-bold tracking-tight text-text-primary sm:text-4xl"
			>
				C’est quoi « {PROGRAM.name} » ?
			</h2>
			<p class="mt-4 font-body text-base leading-relaxed text-text-secondary">{PROGRAM.summary}</p>
			<ul class="mt-5 flex flex-wrap justify-center gap-2" aria-label="Les trois axes">
				{#each PROGRAM.pillars as pillar (pillar)}
					<li
						class="rounded-full border border-brand-primary/20 bg-white px-4 py-1.5 font-body text-sm font-semibold text-brand-primary"
					>
						{pillar}
					</li>
				{/each}
			</ul>
		</div>

		<!-- Chronologie 2024 → 2026 -->
		<ol class="relative mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
			{#each TIMELINE as step (step.year)}
				<li class="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-xs">
					<p class="font-display text-3xl font-extrabold text-brand-primary">{step.year}</p>
					<h3 class="mt-2 font-display text-lg font-bold text-text-primary">{step.title}</h3>
					<p class="mt-1.5 font-body text-sm leading-relaxed text-text-secondary">
						{step.description}
					</p>
				</li>
			{/each}
		</ol>

		<!-- Destination finale -->
		<div
			class="mt-12 overflow-hidden rounded-3xl bg-gradient-to-br from-[#0d1c1d] via-[#171B25] to-[#96000A] p-8 text-white shadow-xl sm:p-10"
		>
			<p class="font-body text-xs font-bold tracking-widest text-amber-300 uppercase">
				La destination finale
			</p>
			<h3 class="mt-2 font-display text-3xl font-extrabold sm:text-4xl">{FINAL_CRUSADE.name}</h3>
			<p class="mt-1 font-display text-lg text-white/85 italic">{FINAL_CRUSADE.tagline}</p>
			<p class="mt-4 max-w-3xl font-body text-sm leading-relaxed text-white/85 sm:text-base">
				{FINAL_CRUSADE.description}
			</p>
			<dl class="mt-6 grid grid-cols-1 gap-4 font-body text-sm sm:grid-cols-3">
				<div class="flex items-start gap-3">
					<Calendar size={20} class="mt-0.5 shrink-0 text-amber-300" />
					<div>
						<dt class="text-white/60">Date</dt>
						<dd class="font-bold">{FINAL_CRUSADE.dates}</dd>
					</div>
				</div>
				<div class="flex items-start gap-3">
					<MapPin size={20} class="mt-0.5 shrink-0 text-amber-300" />
					<div>
						<dt class="text-white/60">Lieu</dt>
						<dd class="font-bold">{FINAL_CRUSADE.venue}, {FINAL_CRUSADE.city}</dd>
					</div>
				</div>
				<div class="flex items-start gap-3">
					<Users size={20} class="mt-0.5 shrink-0 text-amber-300" />
					<div>
						<dt class="text-white/60">Partenaires</dt>
						<dd class="font-bold">{FINAL_CRUSADE.partners}</dd>
					</div>
				</div>
			</dl>
			{#if finalCrusadeHref}
				<a
					href={finalCrusadeHref}
					class="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-body text-sm font-bold text-brand-primary hover:bg-white/95"
				>
					Voir l’événement <ArrowRight size={16} />
				</a>
			{/if}
		</div>

		<!-- Versets fondateurs -->
		<div class="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
			{#each KEY_VERSES as verse (verse.reference)}
				<blockquote class="rounded-3xl border-l-4 border-brand-primary bg-white p-6 shadow-xs">
					<p class="font-display text-base leading-relaxed text-text-primary italic">
						« {verse.text} »
					</p>
					<footer class="mt-3 font-body text-sm font-bold text-brand-primary">
						{verse.reference}
					</footer>
				</blockquote>
			{/each}
		</div>
	</Container>
</section>
