<script lang="ts">
	import { onMount } from 'svelte';
	import Container from '../components/Container.svelte';
	import {
		Stethoscope,
		Flame,
		Wrench,
		GraduationCap,
		ArrowRight,
		CheckCircle2
	} from '@lucide/svelte';
	import type { JoinRoleItem } from '../types.js';

	const defaultRoles: JoinRoleItem[] = [
		{
			id: 'evangelisation',
			icon: Flame,
			category: 'DÉPARTEMENT 01',
			title: 'Évangélisation',
			description: 'Prédication, témoignage et annonce de l’Évangile sur le terrain.',
			profiles: [
				'Prédicateurs',
				'Témoins de terrain',
				'Évangélistes de rue',
				'Conseillers spirituels'
			],
			badge: 'Terrain'
		},
		{
			id: 'intercession',
			icon: Flame,
			category: 'DÉPARTEMENT 02',
			title: 'Intercession',
			description: 'Prières stratégiques pour les missions et la couverture spirituelle.',
			profiles: ['Sentinelles de prière', 'Veilleurs spirituels', 'Intercesseurs de croisade'],
			badge: 'Prière'
		},
		{
			id: 'logistique',
			icon: Wrench,
			category: 'DÉPARTEMENT 03',
			title: 'Logistique',
			description: 'Organisation, transport, hébergement et coordination des équipes.',
			profiles: ['Coordinateurs transport', 'Gestionnaires hébergement', 'Ravitaillement'],
			badge: 'Organisation'
		},
		{
			id: 'multimedia',
			icon: Wrench,
			category: 'DÉPARTEMENT 04',
			title: 'Multimédia',
			description: 'Sonorisation, vidéo, photographie et communication digitale.',
			profiles: ['Techniciens son', 'Cadreurs & monteurs vidéo', 'Photographes', 'Réseaux sociaux'],
			badge: 'Médias'
		},
		{
			id: 'action-sociale',
			icon: Stethoscope,
			category: 'DÉPARTEMENT 05',
			title: 'Action sociale',
			description: 'Distribution de vivres, assistance médicale et aide humanitaire.',
			profiles: ['Médecins & soignants', 'Distribution de vivres', 'Soutien orphelinats'],
			badge: 'Compassion'
		},
		{
			id: 'formation',
			icon: GraduationCap,
			category: 'DÉPARTEMENT 06',
			title: 'Formation',
			description: 'Enseignement, séminaires et formation des leaders.',
			profiles: ['Enseignants bibliques', 'Mentors de disciples', 'Animateurs d’ateliers'],
			badge: 'Discipulat'
		}
	];

	let {
		eyebrow = 'NOS DÉPARTEMENTS DE SERVICE',
		title = 'Nos départements de service',
		subtitle = 'Trouvez votre place dans l’équipe missionnaire selon vos talents et votre appel.',
		roles = defaultRoles,
		onSelectRole,
		class: customClass = ''
	}: {
		eyebrow?: string;
		title?: string;
		subtitle?: string;
		roles?: JoinRoleItem[];
		onSelectRole?: (roleId: string) => void;
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
	id="poles"
	bind:this={sectionEl}
	class="bg-white py-16 sm:py-20 lg:py-28 {customClass}"
	aria-labelledby="join-roles-heading"
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
				id="join-roles-heading"
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

		<!-- Grille des 4 pôles -->
		<div class="mt-12 grid grid-cols-1 gap-6 sm:mt-16 md:grid-cols-2 lg:gap-8">
			{#each roles as role, index (role.id)}
				<div
					class="group relative flex flex-col justify-between rounded-3xl border border-gray-100 bg-[#f8fafc] p-7 shadow-[0_10px_30px_rgba(0,0,0,0.03)] transition-all duration-500 ease-out hover:-translate-y-1.5 hover:border-gray-200 hover:bg-white hover:shadow-[0_20px_45px_rgba(0,0,0,0.08)] sm:p-9 {isVisible
						? 'translate-y-0 opacity-100'
						: 'translate-y-8 opacity-0'}"
					style="transition-delay: {index * 120}ms;"
				>
					<div>
						<!-- Haut de carte : Icône et badge statut -->
						<div class="flex items-center justify-between">
							<div
								class="flex h-13 w-13 items-center justify-center rounded-2xl bg-brand-subtle text-brand-primary shadow-xs transition-transform duration-300 group-hover:scale-110"
							>
								<role.icon size={24} strokeWidth={2.2} />
							</div>
							<span
								class="rounded-full bg-brand-primary/10 px-3 py-1 font-body text-xs font-bold text-brand-primary"
							>
								{role.badge}
							</span>
						</div>

						<!-- Catégorie & Titre -->
						<span
							class="mt-6 block font-body text-xs font-bold tracking-wider text-text-secondary uppercase"
						>
							{role.category}
						</span>

						<h3 class="mt-1.5 font-display text-2xl font-bold tracking-tight text-text-primary">
							{role.title}
						</h3>

						<!-- Description -->
						<p class="mt-3 font-body text-sm leading-relaxed text-text-secondary">
							{role.description}
						</p>

						<!-- Profils recherchés -->
						<div class="mt-5 border-t border-gray-200/60 pt-4">
							<span
								class="mb-2.5 block font-body text-xs font-bold tracking-wider text-text-primary uppercase"
							>
								Profils recherchés :
							</span>
							<div class="flex flex-wrap gap-2">
								{#each role.profiles as profile (profile)}
									<span
										class="inline-flex items-center gap-1.5 rounded-lg border border-gray-200/80 bg-white px-2.5 py-1 font-body text-xs font-medium text-text-secondary shadow-2xs"
									>
										<CheckCircle2 size={12} class="shrink-0 text-brand-primary" />
										<span>{profile}</span>
									</span>
								{/each}
							</div>
						</div>
					</div>

					<!-- Bouton de sélection / lien vers formulaire -->
					<div class="mt-8 border-t border-gray-200/60 pt-5">
						<a
							href="#postuler"
							onclick={() => onSelectRole?.(role.id)}
							class="group/btn inline-flex items-center gap-2 font-body text-sm font-bold text-brand-primary transition-all duration-200 hover:gap-3 hover:text-brand-primary-hover"
						>
							<span>S’engager dans ce pôle</span>
							<ArrowRight
								size={16}
								class="transition-transform duration-200 group-hover/btn:translate-x-1"
								aria-hidden="true"
							/>
						</a>
					</div>
				</div>
			{/each}
		</div>
	</Container>
</section>
