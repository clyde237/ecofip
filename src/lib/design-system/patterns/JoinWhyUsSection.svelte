<script lang="ts">
	import { onMount } from 'svelte';
	import Container from '../components/Container.svelte';
	import {
		Sparkles,
		HeartHandshake,
		PhoneCall,
		ShieldCheck,
		Heart,
		ArrowRight
	} from '@lucide/svelte';

	const reasons = [
		{
			icon: Sparkles,
			title: '01. Prier pour nous',
			description:
				'Rejoignez notre réseau d’intercesseurs qui soutiennent chaque mission et croisade par la prière fervente.',
			ctaLabel: 'S’engager dans la prière',
			ctaHref: '/contact'
		},
		{
			icon: Heart,
			title: '02. Faire un don financier',
			description:
				'Soutenez financièrement les croisades, les actions humanitaires d’aide médicale et la logistique missionnaire.',
			ctaLabel: 'Envoyer un don',
			ctaHref: '/faire-un-don'
		},
		{
			icon: HeartHandshake,
			title: '03. Collaborer diversement',
			description:
				'Offrez vos compétences professionnelles, votre temps ou vos ressources matérielles pour soutenir la mission.',
			ctaLabel: 'Proposer une collaboration',
			ctaHref: '#postuler'
		},
		{
			icon: PhoneCall,
			title: '04. Nous contacter',
			description:
				'Discutez directement avec nous de la façon dont vous pouvez participer à la vision de « Cameroun pour Jésus ».',
			ctaLabel: 'Prendre contact',
			ctaHref: '/contact'
		}
	];

	let {
		eyebrow = 'PARTICIPATION & ENGAGEMENT',
		title = 'Comment s’impliquer ?',
		subtitle = 'Plusieurs façons concrètes de participer à la grande moisson de Dieu au Cameroun.',
		class: customClass = ''
	}: {
		eyebrow?: string;
		title?: string;
		subtitle?: string;
		class?: string;
	} = $props();

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

<section
	bind:this={sectionEl}
	class="bg-[#f8fafc] py-16 sm:py-20 lg:py-28 {customClass}"
	aria-labelledby="join-why-heading"
>
	<Container>
		<!-- En-tête centré -->
		<div
			class="mx-auto max-w-3xl text-center transition-all duration-700 ease-out {isVisible
				? 'translate-y-0 opacity-100'
				: 'translate-y-8 opacity-0'}"
		>
			{#if eyebrow}
				<div class="mb-3 flex items-center justify-center gap-2.5">
					<span class="h-0.5 w-6 rounded-full bg-brand-primary" aria-hidden="true"></span>
					<span
						class="font-body text-xs font-bold tracking-wider text-brand-primary uppercase sm:text-sm"
					>
						{eyebrow}
					</span>
				</div>
			{/if}

			<h2
				id="join-why-heading"
				class="font-display text-3xl leading-[1.2] font-extrabold tracking-tight text-text-primary sm:text-4xl lg:text-[44px]"
			>
				{title}
			</h2>

			{#if subtitle}
				<p class="mt-4 font-body text-sm leading-relaxed text-text-secondary sm:text-base">
					{subtitle}
				</p>
			{/if}
		</div>

		<!-- Grille des 4 piliers -->
		<div class="mt-12 grid grid-cols-1 gap-6 sm:mt-16 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
			{#each reasons as reason, index (reason.title)}
				<div
					class="group relative flex flex-col rounded-3xl border border-gray-200/70 bg-white p-7 shadow-[0_10px_30px_rgba(0,0,0,0.03)] transition-all duration-500 ease-out hover:-translate-y-1.5 hover:border-brand-primary/30 hover:shadow-[0_20px_45px_rgba(0,0,0,0.08)] sm:p-8 {isVisible
						? 'translate-y-0 opacity-100'
						: 'translate-y-8 opacity-0'}"
					style="transition-delay: {index * 100}ms;"
				>
					<!-- Icône -->
					<div
						class="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-subtle text-brand-primary shadow-xs transition-transform duration-300 group-hover:scale-110"
					>
						<reason.icon size={22} strokeWidth={2.2} />
					</div>

					<!-- Titre -->
					<h3 class="font-display text-lg font-bold tracking-tight text-text-primary sm:text-xl">
						{reason.title}
					</h3>

					<!-- Trait horizontal rouge -->
					<span class="mt-3 mb-4 block h-0.5 w-6 rounded-full bg-brand-primary" aria-hidden="true"
					></span>

					<!-- Description -->
					<p class="font-body text-xs leading-relaxed text-text-secondary sm:text-sm">
						{reason.description}
					</p>

					<!-- Action spécifique -->
					{#if reason.ctaLabel}
						<div class="mt-5 border-t border-gray-100 pt-3">
							<a
								href={reason.ctaHref}
								class="inline-flex items-center gap-1.5 text-xs font-bold text-brand-primary hover:text-brand-primary-hover hover:underline"
							>
								<span>{reason.ctaLabel}</span>
								<ArrowRight size={13} />
							</a>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</Container>
</section>
