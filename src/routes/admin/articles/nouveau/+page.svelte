<script lang="ts">
	import { ArrowLeft } from '@lucide/svelte';
	import ArticleEditor from '../ArticleEditor.svelte';
	import type { PageData } from './$types.js';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Nouvel article — Administration ECOFIP</title>
</svelte:head>

<div class="space-y-5">
	<div>
		<a
			href="/admin/articles"
			class="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-brand-primary"
		>
			<ArrowLeft size={14} /> Tous les articles
		</a>
		<h1 class="mt-2 font-display text-2xl font-bold text-text-primary sm:text-3xl">
			Nouvel article
		</h1>
	</div>
	{#if !data.usingNeonDb}
		<p
			class="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
			role="alert"
		>
			La base de données Neon est indisponible : l’article ne pourra pas être enregistré.
		</p>
	{/if}
	<ArticleEditor
		action=""
		submitLabel="Créer l’article"
		categories={data.categories}
		eventChoices={data.eventChoices}
		isR2Configured={data.isR2Configured}
	/>
</div>
