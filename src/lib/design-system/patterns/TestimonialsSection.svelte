<script lang="ts">
	import { onMount } from 'svelte';
	import Container from '../components/Container.svelte';
	import { Quote, Star, CheckCircle2, ArrowRight, MessageSquareQuote } from '@lucide/svelte';
	import type { TestimonialItem, TestimonialsSectionProps } from '../types.js';

	const defaultTestimonials: TestimonialItem[] = [
		{
			id: 'jean-paul',
			name: 'Pasteur Jean-Paul',
			membership: 'Missionnaire ECOFIP',
			quote:
				'« Participer à Cameroun pour Jésus a transformé ma vie et celle de milliers d’âmes. La puissance de Dieu se manifeste à chaque mission. »',
			avatar: '/avatar-jean-pierre.jpg',
			verified: true,
			rating: 5
		},
		{
			id: 'marie-ndongo',
			name: 'Marie Ndongo',
			membership: 'Participante & Équipière',
			quote:
				'« J’ai trouvé Christ lors d’une croisade ECOFIP. Aujourd’hui, je sers avec eux pour amener d’autres personnes à la lumière de l’Évangile. »',
			avatar: '/avatar-marie.jpg',
			verified: true,
			rating: 5
		},
		{
			id: 'jean-pierre',
			name: 'Jean-Pierre (Kribi)',
			membership: 'Témoignage de délivrance',
			quote:
				'« Ancien sorcier, j’ai rencontré Jésus lors de la croisade à Kribi et renoncé publiquement à mes fétiches. Ma vie est totalement restaurée. »',
			avatar: '/avatar-sarah.jpg',
			verified: true,
			rating: 5
		}
	];

	let {
		eyebrow = 'TÉMOIGNAGES',
		title = 'Des vies transformées par la',
		highlightedTitle = 'puissance de l’Évangile',
		description = 'Découvrez les témoignages authentiques d’âmes touchées, restaurées et guéries lors de nos campagnes à travers le Cameroun.',
		testimonials = defaultTestimonials,
		ctaLabel = 'Partager mon témoignage',
		ctaHref = '/contact',
		allHref,
		class: customClass = ''
	}: TestimonialsSectionProps = $props();

	let sectionEl: HTMLElement | null = $state(null);
	let isVisible = $state(false);

	onMount(() => {
		const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (prefersReducedMotion) {
			isVisible = true;
			return;
		}

		if (!sectionEl) {
			isVisible = true;
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						isVisible = true;
						observer.disconnect();
						break;
					}
				}
			},
			{ threshold: 0.15 }
		);

		observer.observe(sectionEl);

		return () => {
			observer.disconnect();
		};
	});
</script>

<!-- Section Témoignages sur Fond Rouge Officiel avec Design Aérien & Glassmorphism -->
<section
	bind:this={sectionEl}
	class="relative overflow-hidden bg-gradient-to-br from-[#b80312] via-brand-primary to-[#7a0008] py-20 text-white sm:py-24 lg:py-32 {customClass}"
	aria-labelledby="testimonials-heading"
>
	<!-- Effets d'ambiance lumineux d'arrière-plan -->
	<div
		class="pointer-events-none absolute -top-32 -right-32 h-[420px] w-[420px] rounded-full bg-amber-400/15 blur-3xl"
		aria-hidden="true"
	></div>
	<div
		class="pointer-events-none absolute -bottom-32 -left-32 h-[450px] w-[450px] rounded-full bg-black/30 blur-3xl"
		aria-hidden="true"
	></div>

	<!-- Filigrane discret de guillemet de témoignage -->
	<div
		class="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/[0.03] select-none"
		aria-hidden="true"
	>
		<Quote size={460} strokeWidth={1} />
	</div>

	<Container class="relative z-10">
		<!-- En-tête de section centré -->
		<div
			class="mx-auto max-w-3xl text-center transition-all duration-700 {isVisible
				? 'translate-y-0 opacity-100'
				: 'translate-y-6 opacity-0'}"
		>
			{#if eyebrow}
				<div
					class="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-bold tracking-[0.2em] text-white uppercase shadow-xs backdrop-blur-md sm:text-sm"
				>
					<span>{eyebrow}</span>
				</div>
			{/if}

			<h2
				id="testimonials-heading"
				class="mt-4 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-[46px] lg:leading-[1.18]"
			>
				{title}
				<span class="text-amber-200">{highlightedTitle}</span>
			</h2>

			{#if description}
				<p
					class="mx-auto mt-4 max-w-2xl font-body text-base leading-relaxed text-white/85 sm:text-lg"
				>
					{description}
				</p>
			{/if}
		</div>

		<!-- Grille des 3 Cartes de Témoignages Glassmorphism (masquée tant qu'aucun n'est publié) -->
		<div
			class="mt-12 grid grid-cols-1 gap-6 sm:mt-16 md:grid-cols-2 lg:grid-cols-3 lg:gap-8 {testimonials.length ===
			0
				? 'hidden'
				: ''}"
		>
			{#each testimonials as item, index (item.id)}
				<article
					class="group relative flex flex-col justify-between rounded-2xl border border-white/20 bg-white/[0.09] p-6 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.35)] backdrop-blur-md transition-all duration-500 hover:-translate-y-2 hover:border-white/40 hover:bg-white/[0.14] sm:rounded-3xl sm:p-8 {isVisible
						? 'translate-y-0 opacity-100'
						: 'translate-y-8 opacity-0'}"
					style="transition-delay: {index * 120}ms;"
				>
					<div>
						<!-- Ligne supérieure : Icône Quote & 5 Étoiles dorées -->
						<div class="flex items-center justify-between">
							<div
								class="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-amber-200 shadow-inner"
							>
								<Quote size={20} class="fill-amber-200/40 text-amber-200" aria-hidden="true" />
							</div>

							<!-- Note 5 étoiles -->
							<div
								class="flex items-center gap-1 text-amber-300"
								aria-label="Note : 5 étoiles sur 5"
							>
								{#each [1, 2, 3, 4, 5].slice(0, item.rating || 5) as star (star)}
									<Star size={15} class="fill-amber-300 text-amber-300" aria-hidden="true" />
								{/each}
							</div>
						</div>

						<!-- Citation textuelle du témoignage -->
						<blockquote
							class="mt-6 font-body text-base leading-relaxed text-white/95 italic sm:text-[17px] sm:leading-relaxed"
						>
							{item.quote}
						</blockquote>
					</div>

					<!-- Auteur avec Photo Portrait HD, Rôle & Statut vérifié -->
					<div class="mt-8 flex items-center gap-4 border-t border-white/15 pt-5">
						{#if item.avatar}
							<img
								src={item.avatar}
								alt="Portrait de {item.name}"
								class="h-13 w-13 shrink-0 rounded-full object-cover shadow-md ring-2 ring-white/40 sm:h-14 sm:w-14"
								loading="lazy"
							/>
						{:else}
							<div
								class="flex h-13 w-13 shrink-0 items-center justify-center rounded-full bg-white/20 font-display text-lg font-bold text-white ring-2 ring-white/40 sm:h-14 sm:w-14"
								aria-hidden="true"
							>
								{item.name.charAt(0).toUpperCase()}
							</div>
						{/if}

						<div class="min-w-0">
							<div class="font-display text-base font-bold text-white sm:text-lg">
								{item.name}
							</div>
							<div class="font-body text-xs text-white/75 sm:text-[13px]">
								{item.membership}
							</div>
							{#if item.verified}
								<div class="mt-1 flex items-center gap-1 text-[11px] font-medium text-amber-200/90">
									<CheckCircle2 size={12} class="shrink-0 text-amber-300" aria-hidden="true" />
									<span>Témoignage certifié</span>
								</div>
							{/if}
						</div>
					</div>
				</article>
			{/each}
		</div>

		<!-- Bannière interactive inférieure : Partage de témoignage -->
		{#if ctaLabel}
			<div
				class="mx-auto mt-14 max-w-3xl rounded-2xl border border-white/20 bg-white/[0.08] p-6 text-center shadow-lg backdrop-blur-md transition-all duration-700 sm:mt-16 sm:p-8 {isVisible
					? 'translate-y-0 opacity-100'
					: 'translate-y-6 opacity-0'}"
				style="transition-delay: 400ms;"
			>
				<h3 class="font-display text-xl font-bold text-white sm:text-2xl">
					Dieu a-t-il accompli une merveille dans votre vie ?
				</h3>
				<p
					class="mx-auto mt-2 max-w-xl font-body text-sm leading-relaxed text-white/85 sm:text-base"
				>
					Chaque témoignage est une étincelle qui fortifie la foi de toute l’assemblée.
					Racontez-nous votre histoire.
				</p>
				<div class="mt-5">
					<a
						href={ctaHref}
						class="group inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-brand-primary shadow-md transition-all duration-200 select-none hover:bg-white/95 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:bg-gray-100 sm:text-base"
					>
						<span>{ctaLabel}</span>
						<ArrowRight
							size={16}
							class="transition-transform duration-200 group-hover:translate-x-1"
							aria-hidden="true"
						/>
					</a>
				</div>
				{#if allHref}
					<a
						href={allHref}
						class="mt-4 inline-flex items-center gap-1.5 font-body text-sm font-semibold text-white/90 underline-offset-4 hover:text-white hover:underline"
					>
						<MessageSquareQuote size={16} aria-hidden="true" />
						Lire tous les témoignages, écrits et vidéos
					</a>
				{/if}
			</div>
		{/if}
	</Container>
</section>
