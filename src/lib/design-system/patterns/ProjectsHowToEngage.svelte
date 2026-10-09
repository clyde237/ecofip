<script lang="ts">
	import { onMount } from 'svelte';
	import Container from '../components/Container.svelte';
	import { HeartHandshake, Flame, Heart, ArrowRight } from '@lucide/svelte';

	interface EngagementWay {
		id: string;
		icon: typeof Heart;
		tag: string;
		title: string;
		description: string;
		ctaLabel: string;
		ctaHref: string;
	}

	const engagementWays: EngagementWay[] = [
		{
			id: 'prier',
			icon: Flame,
			tag: 'INTERCESSION',
			title: 'Prier pour les missions',
			description:
				'Portez les équipes missionnaires, les villages visités et les nouveaux convertis dans la prière régulière. Recevez nos sujets d’intercession mensuels.',
			ctaLabel: 'Rejoindre la chaîne de prière',
			ctaHref: '/contact'
		},
		{
			id: 'partir',
			icon: HeartHandshake,
			tag: 'ENGAGEMENT TERRAIN',
			title: 'Devenir bénévole ou équipier',
			description:
				'Médecins, infirmiers, évangélistes, logisticiens ou animateurs : mettez vos compétences et vos talents au service des croisades et des actions communautaires.',
			ctaLabel: 'Postuler comme volontaire',
			ctaHref: '/nous-rejoindre'
		},
		{
			id: 'donner',
			icon: Heart,
			tag: 'SOUTIEN FINANCIER',
			title: 'Financer et semer',
			description:
				'Chaque don permet d’acheter des médicaments, financer la logistique d’une croisade, distribuer des vivres et imprimer des Bibles pour les convertis.',
			ctaLabel: 'Faire un don maintenant',
			ctaHref: '/faire-un-don#don'
		}
	];

	let {
		eyebrow = 'COMMENT PARTICIPER',
		title = 'Trois manières concrètes de soutenir la mission',
		subtitle = 'Chacun peut participer selon la grâce reçue : par la prière, le service bénévole ou la générosité.',
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
	id="comment-participer"
	bind:this={sectionEl}
	class="bg-white py-16 sm:py-20 lg:py-28 {customClass}"
	aria-labelledby="how-to-engage-heading"
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
				id="how-to-engage-heading"
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

		<!-- 3 cartes d'engagement -->
		<div class="mt-12 grid grid-cols-1 gap-6 sm:mt-16 md:grid-cols-3 lg:gap-8">
			{#each engagementWays as way, index (way.id)}
				<div
					class="group relative flex flex-col justify-between rounded-3xl border border-gray-200/80 bg-surface/40 p-7 shadow-xs transition-all duration-500 ease-out hover:-translate-y-1.5 hover:border-brand-primary/30 hover:bg-white hover:shadow-xl sm:p-8 {isVisible
						? 'translate-y-0 opacity-100'
						: 'translate-y-8 opacity-0'}"
					style="transition-delay: {index * 150 + 100}ms;"
				>
					<div>
						<!-- Pastille avec icône -->
						<div
							class="mb-6 flex h-13 w-13 items-center justify-center rounded-2xl bg-brand-subtle text-brand-primary shadow-xs transition-transform duration-300 group-hover:scale-110"
						>
							<way.icon size={24} strokeWidth={2.2} />
						</div>

						<!-- Tag -->
						<span class="font-body text-xs font-bold tracking-wider text-brand-primary uppercase">
							{way.tag}
						</span>

						<!-- Titre -->
						<h3
							class="mt-2 font-display text-xl font-bold tracking-tight text-text-primary sm:text-2xl"
						>
							{way.title}
						</h3>

						<!-- Description -->
						<p
							class="mt-3 font-body text-xs leading-relaxed text-text-secondary sm:text-sm sm:leading-relaxed"
						>
							{way.description}
						</p>
					</div>

					<!-- Lien d'action -->
					<div class="mt-8 border-t border-gray-100 pt-5">
						<a
							href={way.ctaHref}
							class="group/link inline-flex items-center gap-1.5 font-body text-sm font-bold text-brand-primary transition-all duration-200 hover:gap-2.5 hover:text-brand-primary-hover"
						>
							<span>{way.ctaLabel}</span>
							<ArrowRight
								size={15}
								class="transition-transform duration-200 group-hover/link:translate-x-1"
								aria-hidden="true"
							/>
						</a>
					</div>
				</div>
			{/each}
		</div>
	</Container>
</section>
