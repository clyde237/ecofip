<script lang="ts">
	/** Catégories des articles publiés, avec leur nombre ; chaque ligne filtre la page Actualités. */
	interface Props {
		categories: { label: string; slug: string; count: number }[];
		activeSlug?: string | null;
		/** Ajoute « Toutes les catégories » en tête (page Actualités) */
		showAll?: boolean;
		totalCount?: number;
	}

	let { categories, activeSlug = null, showAll = false, totalCount = 0 }: Props = $props();

	const itemClass = (active: boolean) =>
		`flex items-center justify-between py-2.5 text-sm hover:text-brand-primary ${
			active ? 'font-bold text-brand-primary' : 'text-text-secondary'
		}`;
</script>

<div class="rounded-3xl border border-gray-200/80 bg-white p-5 shadow-xs">
	<h2 class="font-display text-base font-bold text-text-primary">Catégories</h2>
	<ul class="mt-3 divide-y divide-gray-100">
		{#if showAll}
			<li>
				<a
					href="/actualites#articles"
					class={itemClass(!activeSlug)}
					aria-current={!activeSlug ? 'page' : undefined}
				>
					<span>Toutes les catégories</span>
					<span class="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-bold"
						>{totalCount}</span
					>
				</a>
			</li>
		{/if}
		{#each categories as category (category.slug)}
			<li>
				<a
					href="/actualites?categorie={category.slug}#articles"
					class={itemClass(category.slug === activeSlug)}
					aria-current={category.slug === activeSlug ? 'page' : undefined}
				>
					<span>{category.label}</span>
					<span class="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-bold"
						>{category.count}</span
					>
				</a>
			</li>
		{/each}
	</ul>
</div>
