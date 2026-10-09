<script lang="ts">
	/**
	 * Boutique d'un événement : gadgets officiels (t-shirts, polos, casquettes…) vendus pour
	 * soutenir l'œuvre, commandés sur WhatsApp avec un message prérempli.
	 */
	import { MessageCircle, ShoppingBag } from '@lucide/svelte';
	import Container from '../components/Container.svelte';
	import type { PublicMerchandiseItem } from '../types.js';

	interface Props {
		items: PublicMerchandiseItem[];
		eventTitle: string;
		id?: string;
	}

	let { items, eventTitle, id = 'boutique' }: Props = $props();

	// Image affichée pour chaque gadget (les vignettes permettent de voir les autres coloris)
	let activeImage = $state<Record<string, number>>({});
</script>

<section {id} class="scroll-mt-24 border-y border-gray-200/70 bg-white py-12 sm:py-16">
	<Container>
		<div class="max-w-2xl">
			<p
				class="flex items-center gap-2 font-body text-xs font-bold tracking-wider text-brand-primary uppercase"
			>
				<ShoppingBag size={15} /> Boutique officielle
			</p>
			<h2 class="mt-2 font-display text-2xl font-bold text-text-primary sm:text-3xl">
				Portez les couleurs de « {eventTitle} »
			</h2>
			<p class="mt-3 font-body text-sm leading-relaxed text-text-secondary sm:text-base">
				Chaque achat soutient l’œuvre d’évangélisation d’ECOFIP. Commandez ou réservez votre article
				directement sur WhatsApp, avant ou après l’événement.
			</p>
		</div>

		<ul class="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{#each items as item (item.id)}
				{@const current = activeImage[item.id] ?? 0}
				<li
					class="flex flex-col overflow-hidden rounded-3xl border border-gray-200/80 bg-[#f8fafc] shadow-xs"
				>
					<div class="relative aspect-[5/6] bg-gray-100">
						{#if item.images.length > 0}
							<img
								src={item.images[current] ?? item.images[0]}
								alt="{item.name} — {eventTitle}"
								width="900"
								height="1080"
								loading="lazy"
								class="absolute inset-0 h-full w-full object-cover {item.available
									? ''
									: 'opacity-60 grayscale'}"
							/>
						{:else}
							<div class="flex h-full items-center justify-center text-gray-300">
								<ShoppingBag size={48} />
							</div>
						{/if}
						{#if !item.available}
							<span
								class="absolute top-3 left-3 rounded-full bg-gray-900 px-3 py-1 font-body text-xs font-bold text-white"
							>
								Épuisé
							</span>
						{/if}
					</div>

					{#if item.images.length > 1}
						<div class="flex gap-2 px-4 pt-3" role="group" aria-label="Images de {item.name}">
							{#each item.images as image, index (image)}
								<button
									type="button"
									onclick={() => (activeImage[item.id] = index)}
									aria-label="Voir l’image {index + 1} de {item.name}"
									aria-pressed={current === index}
									class="h-14 w-12 cursor-pointer overflow-hidden rounded-lg border-2 transition-colors {current ===
									index
										? 'border-brand-primary'
										: 'border-transparent opacity-70 hover:opacity-100'}"
								>
									<img src={image} alt="" loading="lazy" class="h-full w-full object-cover" />
								</button>
							{/each}
						</div>
					{/if}

					<div class="flex flex-1 flex-col p-5">
						<div class="flex items-baseline justify-between gap-3">
							<h3 class="font-display text-lg leading-snug font-bold text-text-primary">
								{item.name}
							</h3>
							<p class="shrink-0 font-display text-lg font-extrabold text-brand-primary">
								{item.priceLabel}
							</p>
						</div>
						{#if item.description}
							<p class="mt-1.5 font-body text-sm leading-relaxed text-text-secondary">
								{item.description}
							</p>
						{/if}

						<div class="mt-auto pt-5">
							{#if item.available && item.orderUrl}
								<a
									href={item.orderUrl}
									target="_blank"
									rel="noopener noreferrer"
									class="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 font-body text-sm font-bold text-white transition-opacity hover:opacity-90"
								>
									<MessageCircle size={17} /> Commander sur WhatsApp
									<span class="sr-only">(nouvel onglet)</span>
								</a>
							{:else}
								<p
									class="rounded-xl border border-gray-200 bg-white px-4 py-3 text-center font-body text-sm font-semibold text-text-secondary"
								>
									Momentanément indisponible
								</p>
							{/if}
						</div>
					</div>
				</li>
			{/each}
		</ul>
	</Container>
</section>
