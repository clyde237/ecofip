<script lang="ts">
	import { enhance } from '$app/forms';
	import { CheckCircle2, XCircle, Trash2, MapPin, Sparkles } from '@lucide/svelte';
	import type { PageData, ActionData } from './$types.js';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let filter = $state<'all' | 'pending' | 'approved'>('all');

	const filteredTestimonials = $derived(
		data.testimonials.filter((t) => {
			if (filter === 'pending') return !t.isApproved;
			if (filter === 'approved') return t.isApproved;
			return true;
		})
	);
</script>

<div class="mx-auto max-w-7xl space-y-6">
	<!-- En-tête -->
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h1 class="font-display text-2xl font-bold text-text-primary sm:text-3xl">
				Modération des Témoignages
			</h1>
			<p class="mt-1 text-sm text-text-secondary">
				Validez les témoignages envoyés par les visiteurs avant leur publication sur le site public.
			</p>
		</div>

		<!-- Filtres -->
		<div
			class="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white p-1 text-xs font-semibold shadow-xs"
		>
			<button
				type="button"
				onclick={() => (filter = 'all')}
				class="rounded-lg px-3 py-1.5 transition-colors {filter === 'all'
					? 'bg-brand-primary text-white'
					: 'text-text-secondary hover:text-text-primary'}"
			>
				Tous ({data.testimonials.length})
			</button>
			<button
				type="button"
				onclick={() => (filter = 'pending')}
				class="rounded-lg px-3 py-1.5 transition-colors {filter === 'pending'
					? 'bg-amber-600 text-white'
					: 'text-text-secondary hover:text-text-primary'}"
			>
				En attente ({data.testimonials.filter((t) => !t.isApproved).length})
			</button>
			<button
				type="button"
				onclick={() => (filter = 'approved')}
				class="rounded-lg px-3 py-1.5 transition-colors {filter === 'approved'
					? 'bg-emerald-600 text-white'
					: 'text-text-secondary hover:text-text-primary'}"
			>
				Validés ({data.testimonials.filter((t) => t.isApproved).length})
			</button>
		</div>
	</div>

	<!-- Message de retour action -->
	{#if form?.message}
		<div
			class="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-800"
		>
			<CheckCircle2 size={16} class="text-emerald-600" />
			<span>{form.message}</span>
		</div>
	{/if}

	<!-- Grille des témoignages -->
	<div class="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
		{#each filteredTestimonials as item (item.id)}
			<div
				class="flex flex-col justify-between rounded-2xl border bg-white p-6 shadow-xs transition-all {item.isApproved
					? 'border-emerald-200/80 shadow-[0_4px_16px_-4px_rgba(16,185,129,0.1)]'
					: 'border-amber-200/80 shadow-[0_4px_16px_-4px_rgba(245,158,11,0.1)]'}"
			>
				<div>
					<!-- Header Carte Témoignage -->
					<div class="flex items-start justify-between gap-3">
						<div class="flex items-center gap-3">
							{#if item.avatarUrl}
								<img
									src={item.avatarUrl}
									alt={item.authorName}
									class="h-11 w-11 rounded-full border border-gray-200 object-cover"
								/>
							{:else}
								<div
									class="flex h-11 w-11 items-center justify-center rounded-full bg-brand-subtle text-sm font-bold text-brand-primary"
								>
									{item.authorName.slice(0, 2).toUpperCase()}
								</div>
							{/if}
							<div>
								<h3 class="font-display text-sm leading-tight font-bold text-text-primary">
									{item.authorName}
								</h3>
								<p class="mt-0.5 text-xs text-text-secondary">{item.authorRole || 'Fidèle'}</p>
								{#if item.authorCity}
									<p class="mt-0.5 flex items-center gap-1 text-[11px] text-text-disabled">
										<MapPin size={11} />
										<span>{item.authorCity}</span>
									</p>
								{/if}
							</div>
						</div>

						<!-- Statut Badge -->
						{#if item.isApproved}
							<span
								class="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700"
							>
								<CheckCircle2 size={11} />
								Validé
							</span>
						{:else}
							<span
								class="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-700"
							>
								<Sparkles size={11} />
								À valider
							</span>
						{/if}
					</div>

					<!-- Contenu du témoignage -->
					<blockquote
						class="mt-4 rounded-xl border border-gray-100 bg-gray-50/70 p-3.5 text-xs leading-relaxed text-text-secondary italic sm:text-sm"
					>
						"{item.content}"
					</blockquote>
				</div>

				<!-- Barre d'actions -->
				<div class="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
					<form method="POST" action="?/delete" use:enhance>
						<input type="hidden" name="id" value={item.id} />
						<button
							type="submit"
							onclick={(e) => {
								if (!confirm('Êtes-vous sûr de vouloir supprimer ce témoignage ?'))
									e.preventDefault();
							}}
							class="flex cursor-pointer items-center gap-1 text-xs font-semibold text-text-disabled transition-colors hover:text-brand-primary"
						>
							<Trash2 size={13} />
							<span>Supprimer</span>
						</button>
					</form>

					<div class="flex items-center gap-2">
						{#if !item.isApproved}
							<form method="POST" action="?/approve" use:enhance>
								<input type="hidden" name="id" value={item.id} />
								<button
									type="submit"
									class="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition-colors hover:bg-emerald-700"
								>
									<CheckCircle2 size={13} />
									<span>Approuver</span>
								</button>
							</form>
						{:else}
							<form method="POST" action="?/reject" use:enhance>
								<input type="hidden" name="id" value={item.id} />
								<button
									type="submit"
									class="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800 transition-colors hover:bg-amber-100"
								>
									<XCircle size={13} />
									<span>Désactiver</span>
								</button>
							</form>
						{/if}
					</div>
				</div>
			</div>
		{/each}
	</div>
</div>
