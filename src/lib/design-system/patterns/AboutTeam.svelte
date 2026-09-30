<script lang="ts">
	import { onMount } from 'svelte';
	import Container from '../components/Container.svelte';
	import type { AboutTeamProps, AboutTeamMember } from '../types.js';

	const defaultMembers: AboutTeamMember[] = [
		{
			id: 'direction',
			tag: 'DIRECTION',
			role: 'Responsable du mouvement',
			description: 'Vision, orientation et coordination générale.',
			image: '/team-member-direction.png',
			imageAlt: 'Responsable du mouvement ECOFIP'
		},
		{
			id: 'mission',
			tag: 'MISSION',
			role: 'Responsable des missions',
			description: 'Coordination des actions d’évangélisation et de terrain.',
			image: '/team-member-missions.png',
			imageAlt: 'Responsable des missions ECOFIP'
		},
		{
			id: 'formation',
			tag: 'FORMATION',
			role: 'Responsable formation',
			description: 'Accompagnement, enseignement et développement des disciples.',
			image: '/team-member-formation.png',
			imageAlt: 'Responsable de la formation des disciples ECOFIP'
		}
	];

	let {
		eyebrow = 'NOTRE ÉQUIPE',
		title = 'Des personnes engagées au service de la mission',
		subtitle = 'Cette section peut présenter les responsables, les équipes et les personnes qui portent les différentes dimensions du mouvement.',
		members = defaultMembers,
		class: customClass = ''
	}: AboutTeamProps = $props();

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
	id="equipe"
	bind:this={sectionEl}
	class="relative overflow-hidden bg-gradient-to-b from-[#a8000a] via-brand-primary to-[#820008] py-16 text-white sm:py-20 lg:py-28 {customClass}"
	aria-labelledby="about-team-heading"
>
	<!-- Effets lumineux d'ambiance pour accentuer l'effet glassmorphism -->
	<div
		class="pointer-events-none absolute -top-32 -left-32 h-[450px] w-[450px] rounded-full bg-white/10 blur-3xl"
		aria-hidden="true"
	></div>
	<div
		class="pointer-events-none absolute -right-32 -bottom-32 h-[450px] w-[450px] rounded-full bg-black/25 blur-3xl"
		aria-hidden="true"
	></div>
	<div
		class="pointer-events-none absolute top-1/2 left-1/2 h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-400/10 blur-3xl"
		aria-hidden="true"
	></div>

	<Container class="relative z-10">
		<!-- En-tête centré fidèle à la maquette -->
		<div
			class="mx-auto max-w-3xl text-center transition-all duration-700 ease-out {isVisible
				? 'translate-y-0 opacity-100'
				: 'translate-y-8 opacity-0'}"
		>
			<!-- Surtitre avec trait blanc/doré centré -->
			{#if eyebrow}
				<div class="mb-3 flex items-center justify-center gap-2.5">
					<span class="h-0.5 w-6 rounded-full bg-amber-300" aria-hidden="true"></span>
					<span
						class="font-body text-xs font-bold tracking-widest text-amber-300 uppercase sm:text-sm"
					>
						{eyebrow}
					</span>
				</div>
			{/if}

			<!-- Grand Titre H2 en Playfair Display blanc -->
			<h2
				id="about-team-heading"
				class="font-display text-3xl leading-[1.2] font-extrabold tracking-tight text-white sm:text-4xl lg:text-[44px]"
			>
				{title}
			</h2>

			<!-- Sous-titre descriptif -->
			{#if subtitle}
				<p class="mt-4 font-body text-sm leading-relaxed text-white/85 sm:text-base">
					{subtitle}
				</p>
			{/if}
		</div>

		<!-- Grille des cartes des membres avec effet Glassmorphism -->
		<div class="mt-12 grid grid-cols-1 gap-6 sm:mt-16 md:grid-cols-3 lg:gap-8">
			{#each members as member, index (member.id)}
				<div
					class="group relative flex flex-col overflow-hidden rounded-3xl border border-white/20 bg-white/12 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.25)] backdrop-blur-xl transition-all duration-500 ease-out hover:-translate-y-2 hover:border-white/40 hover:bg-white/18 hover:shadow-[0_30px_60px_rgba(0,0,0,0.35)] sm:p-5 {isVisible
						? 'translate-y-0 opacity-100'
						: 'translate-y-8 opacity-0'}"
					style="transition-delay: {index * 150 + 100}ms;"
				>
					<!-- Conteneur d'image arrondie avec effet zoom au survol -->
					<div
						class="relative aspect-[16/11] w-full overflow-hidden rounded-2xl border border-white/10 bg-black/25 sm:aspect-[16/10]"
					>
						<img
							src={member.image}
							alt={member.imageAlt || member.role}
							class="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
							loading="lazy"
						/>
						<!-- Voile dégradé doux pour faire le pont avec le fond translucide -->
						<div
							class="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent"
							aria-hidden="true"
						></div>
					</div>

					<!-- Corps textuel de la carte membre -->
					<div class="flex flex-1 flex-col pt-4 pb-2 sm:pt-5">
						<!-- Tag / Département avec effet badge translucide -->
						<span
							class="inline-block self-start rounded-md border border-white/25 bg-white/10 px-2.5 py-1 font-body text-[11px] font-black tracking-widest text-amber-300 uppercase shadow-2xs backdrop-blur-xs"
						>
							{member.tag}
						</span>

						<!-- Rôle principal -->
						<h3
							class="mt-2.5 font-display text-xl leading-snug font-bold tracking-tight text-white sm:text-[22px]"
						>
							{member.role}
						</h3>

						<!-- Description / Responsabilités -->
						<p class="mt-2 font-body text-xs leading-relaxed text-white/80 sm:text-sm">
							{member.description}
						</p>
					</div>
				</div>
			{/each}
		</div>
	</Container>
</section>
