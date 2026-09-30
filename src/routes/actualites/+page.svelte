<script lang="ts">
	import {
		NewsHero,
		NewsFeaturedArticle,
		NewsListSection,
		NewsNewsletterSection,
		DonationCtaSection,
		Modal,
		Button,
		Input
	} from '$lib';
	import type { DetailedArticleItem } from '$lib/design-system/types.js';
	import { Calendar, Clock, Heart, Share2, CheckCircle2 } from '@lucide/svelte';
	import { toast } from '$lib/design-system/toast.svelte.js';

	let isArticleModalOpen = $state(false);
	let selectedArticle = $state<DetailedArticleItem | null>(null);

	let isDonationModalOpen = $state(false);
	let hasCopiedLink = $state(false);

	function handleOpenArticle(article: DetailedArticleItem) {
		selectedArticle = article;
		hasCopiedLink = false;
		isArticleModalOpen = true;
	}

	function handleShare() {
		if (typeof window !== 'undefined') {
			navigator.clipboard?.writeText(window.location.href);
			hasCopiedLink = true;
			toast.success('Lien copié dans le presse-papiers !', 'Partage');
			setTimeout(() => {
				hasCopiedLink = false;
			}, 3000);
		}
	}
</script>

<svelte:head>
	<title>Actualités & Chroniques — Rapports de Mission & Témoignages | ECOFIP</title>
	<meta
		name="description"
		content="Consultez les dernières nouvelles de la mission ECOFIP : rapports de nos croisades au Cameroun, témoignages de guérisons miraculeuses, enseignements bibliques et actions de santé."
	/>
	<meta property="og:title" content="Actualités & Chroniques de Mission — ECOFIP" />
	<meta
		property="og:description"
		content="Plongez au cœur des actions de foi et de compassion menées par ECOFIP à travers tout le Cameroun."
	/>
	<meta property="og:type" content="website" />
</svelte:head>

<div>
	<!-- 1. Bannière d'introduction avec fil d'ariane et tags -->
	<NewsHero />

	<!-- 2. Grand article à la une (Spotlight reportage de terrain) -->
	<NewsFeaturedArticle onReadArticle={handleOpenArticle} />

	<!-- 3. Catalogue complet avec filtres et recherche instantanée -->
	<NewsListSection onReadArticle={handleOpenArticle} />

	<!-- 4. Boîte d'inscription à la newsletter mensuelle -->
	<NewsNewsletterSection />

	<!-- 5. Appel au don / semence pour financer les missions futures -->
	<DonationCtaSection
		eyebrow="PROPAGER LA BONNE NOUVELLE"
		title="Soutenez l’annonce de l’Évangile et nos prochaines expéditions"
		description="Chaque don que vous faites permet de financer les déplacements missionnaires, d’offrir des bibles et de soigner gratuitement les malades."
		ctaLabel="Soutenir les missions"
		onCtaClick={() => (isDonationModalOpen = true)}
	/>
</div>

<!-- Modal de lecture intégrale d'un article ou témoignage -->
<Modal
	bind:open={isArticleModalOpen}
	title={selectedArticle?.category || 'Publication ECOFIP'}
	description={selectedArticle ? `${selectedArticle.date} • ${selectedArticle.readTime}` : ''}
>
	{#if selectedArticle}
		<div class="space-y-5 py-1">
			<!-- Image d'en-tête de l'article -->
			<div class="relative h-60 w-full overflow-hidden rounded-2xl bg-gray-100 sm:h-72">
				<img
					src={selectedArticle.image}
					alt={selectedArticle.imageAlt}
					class="h-full w-full object-cover"
				/>
				<div class="absolute bottom-3 left-3">
					<span
						class="rounded-full bg-brand-primary px-3.5 py-1 font-body text-xs font-bold tracking-wider text-white uppercase shadow-md"
					>
						{selectedArticle.category}
					</span>
				</div>
			</div>

			<!-- Titre H3 de l'article -->
			<h3 class="font-display text-2xl leading-snug font-bold text-text-primary sm:text-3xl">
				{selectedArticle.title}
			</h3>

			<!-- Métadonnées Auteur -->
			<div class="flex items-center justify-between border-y border-gray-100 py-3">
				<div class="flex items-center gap-3">
					<div class="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-gray-200">
						<img
							src={selectedArticle.authorAvatar || '/avatar-jean-pierre.jpg'}
							alt={selectedArticle.authorName}
							class="h-full w-full object-cover"
						/>
					</div>
					<div>
						<span class="block font-body text-xs font-bold text-text-primary sm:text-sm">
							{selectedArticle.authorName}
						</span>
						{#if selectedArticle.authorRole}
							<span class="block font-body text-[11px] text-text-secondary">
								{selectedArticle.authorRole}
							</span>
						{/if}
					</div>
				</div>

				<button
					type="button"
					onclick={handleShare}
					class="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-1.5 font-body text-xs font-semibold text-text-secondary transition-colors hover:border-gray-300 hover:text-text-primary"
				>
					{#if hasCopiedLink}
						<CheckCircle2 size={14} class="text-emerald-600" />
						<span class="text-emerald-600">Lien copié</span>
					{:else}
						<Share2 size={14} />
						<span>Partager</span>
					{/if}
				</button>
			</div>

			<!-- Paragraphes de contenu intégral -->
			<div
				class="space-y-4 font-body text-sm leading-relaxed text-text-secondary sm:text-base sm:leading-relaxed"
			>
				{#if selectedArticle.fullContent && selectedArticle.fullContent.length > 0}
					{#each selectedArticle.fullContent as paragraph}
						<p>{paragraph}</p>
					{/each}
				{:else}
					<p>{selectedArticle.excerpt}</p>
				{/if}
			</div>
		</div>
	{/if}

	{#snippet actions()}
		<Button variant="outline" size="md" onclick={() => (isArticleModalOpen = false)}>Fermer</Button>
		<Button
			variant="primary"
			size="md"
			onclick={() => {
				isArticleModalOpen = false;
				isDonationModalOpen = true;
			}}
		>
			<Heart size={16} class="mr-1.5 fill-white text-white" />
			Soutenir cette œuvre
		</Button>
	{/snippet}
</Modal>

<!-- Modal interactive de soutien/don missionnaire -->
<Modal
	bind:open={isDonationModalOpen}
	title="Semer dans l’œuvre missionnaire ECOFIP"
	description="« Vous serez enrichis à tous égards pour toute espèce de libéralités, qui feront produire par nous des actions de grâces à Dieu. »"
>
	<div class="space-y-4 py-2">
		<p class="font-body text-sm font-semibold text-text-primary">
			Sélectionnez l'impact direct de votre don :
		</p>
		<div class="grid grid-cols-3 gap-2.5">
			<div class="rounded-xl border-2 border-brand-primary bg-brand-subtle p-3 text-center">
				<div class="text-xs font-bold text-brand-primary sm:text-sm">Bibles & Livrets</div>
				<div class="mt-0.5 text-[11px] text-text-secondary">Nouveaux convertis</div>
			</div>
			<div class="rounded-xl border border-border bg-white p-3 text-center">
				<div class="text-xs font-bold text-text-primary sm:text-sm">Soins gratuits</div>
				<div class="mt-0.5 text-[11px] text-text-secondary">Cliniques mobiles</div>
			</div>
			<div class="rounded-xl border border-border bg-white p-3 text-center">
				<div class="text-xs font-bold text-text-primary sm:text-sm">Logistique</div>
				<div class="mt-0.5 text-[11px] text-text-secondary">Croisades & Équipes</div>
			</div>
		</div>

		<Input label="Montant du don (FCFA)" type="number" placeholder="Ex: 25 000" />
	</div>

	{#snippet actions()}
		<Button variant="outline" size="md" onclick={() => (isDonationModalOpen = false)}>
			Annuler
		</Button>
		<Button
			variant="primary"
			size="md"
			onclick={() => {
				isDonationModalOpen = false;
				toast.success(
					'Merci de tout cœur pour votre soutien à la propagation de l’Évangile !',
					'Don enregistré'
				);
			}}
		>
			<Heart size={16} class="mr-1.5 fill-white text-white" />
			Valider mon don
		</Button>
	{/snippet}
</Modal>
