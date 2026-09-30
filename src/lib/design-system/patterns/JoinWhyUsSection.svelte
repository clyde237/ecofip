<script lang="ts">
	import { onMount } from 'svelte';
	import Container from '../components/Container.svelte';
	import { Sparkles, Users, Award, ShieldCheck } from '@lucide/svelte';

	const reasons = [
		{
			icon: Sparkles,
			title: 'Croissance spirituelle profonde',
			description:
				'Participer aux missions transforme votre propre foi. Vous vivez des temps forts de prière, d’intercession et voyez la puissance de Dieu à l’œuvre.'
		},
		{
			icon: Users,
			title: 'Une vraie famille fraternelle',
			description:
				'Rejoindre ECOFIP, c’est intégrer une communauté unie où règnent l’amour fraternel, l’entraide mutuelle et la joie de servir ensemble.'
		},
		{
			icon: Award,
			title: 'Un impact direct et mesurable',
			description:
				'Chaque heure consacrée, chaque soin dispensé ou chaque parole partagée touche directement des personnes et des familles réelles.'
		},
		{
			icon: ShieldCheck,
			title: 'Fidélité, intégrité & rigueur',
			description:
				'Nous travaillons dans l’ordre, la transparence et le respect des dons confiés, avec le désir de glorifier Dieu en toute circonstance.'
		}
	];

	let {
		eyebrow = 'NOTRE CADRE DE SERVICE',
		title = 'Ce que vous vivrez au sein de l’équipe',
		subtitle = 'Servir dans la mission est une aventure transformatrice pour ceux qui reçoivent, mais tout autant pour ceux qui donnent.',
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
				</div>
			{/each}
		</div>
	</Container>
</section>
