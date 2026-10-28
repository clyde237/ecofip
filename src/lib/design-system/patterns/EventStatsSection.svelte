<script lang="ts">
	/**
	 * Statistiques d'un événement : le dernier jour publié par défaut, des onglets pour les jours
	 * précédents, le total cumulé et, une fois l'événement terminé, un bilan de tous les jours.
	 */
	import { BarChart3, HeartHandshake, MessageSquareQuote, Sparkles, Users } from '@lucide/svelte';
	import Container from '../components/Container.svelte';
	import type { PublicEventStats, PublicStatLine } from '../types.js';

	interface Props {
		stats: PublicEventStats;
		eventTitle: string;
	}

	let { stats, eventTitle }: Props = $props();

	type Tab = 'bilan' | string;
	let tabs = $derived<Tab[]>([
		...(stats.isFinished ? ['bilan'] : []),
		...stats.days.map((day) => day.date)
	]);
	// Bilan d'abord une fois l'événement terminé, sinon le dernier jour publié
	// svelte-ignore state_referenced_locally
	let selected = $state<Tab>(stats.isFinished ? 'bilan' : (stats.days.at(-1)?.date ?? 'bilan'));
	let selectedDay = $derived(stats.days.find((day) => day.date === selected) ?? null);

	function formatNumber(value: number): string {
		return value.toLocaleString('fr-FR');
	}

	function iconFor(label: string) {
		const key = label.toLowerCase();
		if (key.includes('présent') || key.includes('present')) return Users;
		if (key.includes('converti')) return HeartHandshake;
		if (key.includes('témoign') || key.includes('temoign')) return MessageSquareQuote;
		if (key.includes('miracle') || key.includes('guéri')) return Sparkles;
		return BarChart3;
	}

	function shortDate(date: string): string {
		return new Date(`${date}T12:00:00Z`).toLocaleDateString('fr-FR', {
			day: '2-digit',
			month: '2-digit',
			timeZone: 'UTC'
		});
	}

	function tabLabel(tab: Tab): string {
		if (tab === 'bilan') return 'Bilan';
		const day = stats.days.find((item) => item.date === tab);
		return day?.dayNumber ? `Jour ${day.dayNumber}` : shortDate(tab);
	}

	function onTabKeydown(event: KeyboardEvent, index: number) {
		if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
		event.preventDefault();
		const next = (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
		selected = tabs[next];
		document.getElementById(`stats-tab-${tabs[next]}`)?.focus();
	}

	let showRunningTotal = $derived(!stats.isFinished && stats.days.length > 1);
</script>

{#snippet statValue(stat: PublicStatLine, large: boolean)}
	{#if stat.value !== null}
		<span
			class="font-display leading-none font-extrabold text-brand-primary {large
				? 'text-4xl sm:text-5xl'
				: 'text-2xl'}"
		>
			{formatNumber(stat.value)}
		</span>
		{#if stat.uncounted}
			<span class="mt-1 block text-[11px] font-semibold text-text-secondary"
				>+ sessions non comptées</span
			>
		{/if}
	{:else}
		<span
			class="font-display text-base leading-tight font-bold text-text-primary first-letter:uppercase"
			>{stat.text}</span
		>
	{/if}
{/snippet}

<section
	id="statistiques"
	class="scroll-mt-24 border-b border-gray-200/70 bg-[#f8fafc] py-12 sm:py-16"
	aria-labelledby="stats-heading"
>
	<Container>
		<div class="flex flex-wrap items-end justify-between gap-4">
			<div class="max-w-2xl">
				<p
					class="flex items-center gap-2 font-body text-xs font-bold tracking-wider text-brand-primary uppercase"
				>
					<BarChart3 size={15} />
					{stats.isFinished ? 'Bilan de l’événement' : 'Les chiffres, jour après jour'}
				</p>
				<h2
					id="stats-heading"
					class="mt-2 font-display text-2xl font-bold text-text-primary sm:text-3xl"
				>
					Les fruits de « {eventTitle} »
				</h2>
			</div>

			<div
				class="flex flex-wrap gap-1.5 rounded-2xl bg-white p-1.5 shadow-xs"
				role="tablist"
				aria-label="Jours de l’événement"
			>
				{#each tabs as tab, index (tab)}
					<button
						id="stats-tab-{tab}"
						type="button"
						role="tab"
						aria-selected={selected === tab}
						aria-controls="stats-panel"
						tabindex={selected === tab ? 0 : -1}
						onclick={() => (selected = tab)}
						onkeydown={(event) => onTabKeydown(event, index)}
						class="cursor-pointer rounded-xl px-3.5 py-2 font-body text-sm font-bold transition-colors {selected ===
						tab
							? 'bg-brand-primary text-white'
							: 'text-text-secondary hover:bg-gray-100 hover:text-text-primary'}"
					>
						{tabLabel(tab)}
					</button>
				{/each}
			</div>
		</div>

		{#if showRunningTotal}
			<!-- Total cumulé depuis le premier jour -->
			<div
				class="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-2xl border border-brand-primary/20 bg-white px-5 py-3.5 font-body text-sm"
			>
				<span class="font-bold text-text-primary first-letter:uppercase"
					>Depuis le {stats.firstDateLabel} :</span
				>
				{#each stats.totals.filter((total) => total.value !== null) as total (total.label)}
					<span class="text-text-secondary">
						<strong class="font-display text-base text-brand-primary"
							>{formatNumber(total.value ?? 0)}</strong
						>
						{total.label.toLowerCase()}
					</span>
				{/each}
			</div>
		{/if}

		<div id="stats-panel" role="tabpanel" aria-labelledby="stats-tab-{selected}" class="mt-6">
			{#if selected === 'bilan'}
				<div class="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-xs sm:p-8">
					<p class="font-body text-sm text-text-secondary">
						Sur {stats.totalDays} jour{stats.totalDays > 1 ? 's' : ''}, depuis le {stats.firstDateLabel}
					</p>
					<ul class="mt-5 grid grid-cols-2 gap-5 lg:grid-cols-4">
						{#each stats.totals as total (total.label)}
							{@const Icon = iconFor(total.label)}
							<li class="rounded-2xl bg-[#f8fafc] p-5">
								<Icon size={20} class="text-brand-primary/70" />
								<div class="mt-3">{@render statValue(total, true)}</div>
								<p class="mt-2 font-body text-sm font-semibold text-text-secondary">
									{total.label}
								</p>
							</li>
						{/each}
					</ul>
					<div class="mt-6 flex flex-wrap gap-2">
						{#each stats.days as day (day.date)}
							<button
								type="button"
								onclick={() => (selected = day.date)}
								class="cursor-pointer rounded-xl border border-gray-200 px-3 py-1.5 font-body text-xs font-semibold text-text-secondary hover:border-brand-primary hover:text-brand-primary"
							>
								Détail du {tabLabel(day.date).toLowerCase()}
							</button>
						{/each}
					</div>
				</div>
			{:else if selectedDay}
				<div
					class="grid grid-cols-1 gap-6 {selectedDay.imageUrl
						? 'md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:items-start'
						: ''}"
				>
					{#if selectedDay.imageUrl}
						<img
							src={selectedDay.imageUrl}
							alt="{tabLabel(selectedDay.date)} de « {eventTitle} »"
							loading="lazy"
							class="aspect-[4/3] w-full rounded-3xl border border-gray-200 object-cover shadow-sm md:sticky md:top-28"
						/>
					{/if}
					<div class="space-y-3">
						<p class="font-body text-sm font-semibold text-text-secondary first-letter:uppercase">
							{selectedDay.dateLabel}
						</p>
						{#each selectedDay.sessions as session (session.name)}
							<div class="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-xs">
								<h3 class="font-display text-base font-bold text-text-primary">{session.name}</h3>
								<ul class="mt-3 grid grid-cols-2 gap-x-3 gap-y-3">
									{#each session.stats as stat, index (index)}
										<li>
											{@render statValue(stat, false)}
											<p class="mt-1 font-body text-xs font-semibold text-text-secondary">
												{stat.label}
											</p>
										</li>
									{/each}
								</ul>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	</Container>
</section>
