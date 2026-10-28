<script lang="ts">
	import { enhance } from '$app/forms';
	import { ArrowLeft, BarChart3, ChevronDown, ExternalLink, Trash2 } from '@lucide/svelte';
	import Modal from '$lib/design-system/components/Modal.svelte';
	import Button from '$lib/design-system/components/Button.svelte';
	import { toast } from '$lib/design-system/toast.svelte.js';
	import StatDayEditor from './StatDayEditor.svelte';
	import type { PageData } from './$types.js';

	let { data }: { data: PageData } = $props();

	// Jour ouvert par défaut : aujourd'hui pendant l'événement, sinon le premier jour à remplir
	const today = new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 10);
	// svelte-ignore state_referenced_locally
	let openDay = $state<string | null>(
		data.days.find((day) => day.date === today)?.date ??
			data.days.find((day) => !day.record)?.date ??
			data.days.at(-1)?.date ??
			null
	);

	let dayToDelete = $state<string | null>(null);
	let isDeleteOpen = $state(false);

	function presentCount(sessions: { stats: { label: string; value: string }[] }[]): number | null {
		let total = 0;
		let found = false;
		for (const stat of sessions.flatMap((session) => session.stats)) {
			if (/présent/i.test(stat.label) && /^\d+$/.test(stat.value)) {
				total += Number(stat.value);
				found = true;
			}
		}
		return found ? total : null;
	}
</script>

<svelte:head>
	<title>Statistiques — {data.event.title} — Administration ECOFIP</title>
</svelte:head>

<div class="mx-auto max-w-5xl space-y-6">
	<div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
		<div>
			<a
				href="/admin/evenements"
				class="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-brand-primary"
			>
				<ArrowLeft size={14} /> Tous les événements
			</a>
			<h1
				class="mt-2 flex items-center gap-2 font-display text-2xl font-bold text-text-primary sm:text-3xl"
			>
				<BarChart3 size={26} class="text-brand-primary" /> Statistiques
			</h1>
			<p class="mt-1 text-sm text-text-secondary">
				{data.event.title} · un bloc par jour de l’événement. Le site affiche le dernier jour publié,
				avec des onglets pour les jours précédents et un bilan à la fin.
			</p>
		</div>
		{#if data.event.isPublished}
			<a
				href="/nos-evenements/{data.event.slug}#statistiques"
				target="_blank"
				class="inline-flex items-center gap-1.5 self-start rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-bold text-text-primary hover:border-brand-primary hover:text-brand-primary"
			>
				<ExternalLink size={14} /> Voir sur le site
			</a>
		{/if}
	</div>

	{#if data.days.length === 0}
		<p class="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
			Cet événement n’a pas de date : renseignez ses dates pour saisir des statistiques.
		</p>
	{/if}

	<div class="space-y-4">
		{#each data.days as day (day.date)}
			{@const isOpen = openDay === day.date}
			{@const present = day.record ? presentCount(day.record.sessions) : null}
			<section class="overflow-hidden rounded-2xl border border-gray-200 bg-white">
				<button
					type="button"
					onclick={() => (openDay = isOpen ? null : day.date)}
					aria-expanded={isOpen}
					class="flex w-full cursor-pointer items-center justify-between gap-3 px-5 py-4 text-left hover:bg-[#f8fafc]"
				>
					<span class="min-w-0">
						<span class="block font-display text-lg font-bold text-text-primary">
							Jour {day.dayNumber}
						</span>
						<span class="block text-xs text-text-secondary first-letter:uppercase"
							>{day.dateLabel}</span
						>
					</span>
					<span class="flex shrink-0 items-center gap-2.5">
						{#if present !== null}
							<span class="hidden text-xs font-semibold text-text-secondary sm:inline">
								{present.toLocaleString('fr-FR')} présents
							</span>
						{/if}
						<span
							class="rounded-full px-2.5 py-0.5 text-[11px] font-bold {day.record?.isPublished
								? 'bg-emerald-100 text-emerald-800'
								: day.record
									? 'bg-gray-100 text-text-secondary'
									: 'border border-dashed border-gray-300 text-text-secondary'}"
						>
							{day.record?.isPublished ? 'Publié' : day.record ? 'Brouillon' : 'À remplir'}
						</span>
						<ChevronDown
							size={18}
							class="text-text-secondary transition-transform {isOpen ? 'rotate-180' : ''}"
						/>
					</span>
				</button>

				{#if isOpen}
					<div class="border-t border-gray-100 px-5 py-5">
						{#key day.record?.updatedAt}
							<StatDayEditor
								date={day.date}
								record={day.record}
								isR2Configured={data.isR2Configured}
							/>
						{/key}
						{#if day.record}
							<button
								type="button"
								onclick={() => {
									dayToDelete = day.date;
									isDeleteOpen = true;
								}}
								class="mt-3 inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-red-600 hover:underline"
							>
								<Trash2 size={13} /> Supprimer les statistiques de ce jour
							</button>
						{/if}
					</div>
				{/if}
			</section>
		{/each}
	</div>
</div>

<Modal bind:open={isDeleteOpen} title="Supprimer les statistiques de ce jour ?">
	<p class="text-sm text-text-secondary">
		Les chiffres et l’image de cette journée seront supprimés définitivement.
	</p>
	{#snippet actions()}
		<Button variant="outline" size="md" onclick={() => (isDeleteOpen = false)}>Annuler</Button>
		<form
			method="POST"
			action="?/deleteDay"
			use:enhance={() =>
				async ({ result, update }) => {
					isDeleteOpen = false;
					if (result.type === 'success') toast.success('Statistiques du jour supprimées.');
					else if (result.type === 'failure')
						toast.error(String(result.data?.error ?? 'Suppression impossible.'));
					await update();
				}}
		>
			<input type="hidden" name="dayDate" value={dayToDelete ?? ''} />
			<Button type="submit" variant="primary" size="md">Supprimer</Button>
		</form>
	{/snippet}
</Modal>
