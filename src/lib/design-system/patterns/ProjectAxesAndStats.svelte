<script lang="ts">
	import Container from '../components/Container.svelte';
	import {
		Sparkles,
		Megaphone,
		BookOpen,
		HeartHandshake,
		Church,
		CheckCircle2
	} from '@lucide/svelte';

	let { class: customClass = '' }: { class?: string } = $props();

	const axes = [
		{
			number: '01',
			title: 'Croisades d’évangélisation',
			icon: Megaphone,
			description:
				'Grandes campagnes publiques d’évangélisation avec prédication de la Parole, louange, prières de guérison et délivrance.'
		},
		{
			number: '02',
			title: 'Séminaires & formations',
			icon: BookOpen,
			description:
				'Enseignements bibliques approfondis, formation de leaders et séminaires thématiques pour l’édification du corps de Christ.'
		},
		{
			number: '03',
			title: 'Actions humanitaires',
			icon: HeartHandshake,
			description:
				'Distribution de vivres, assistance médicale gratuite, soutien aux orphelinats et aide aux personnes vulnérables.'
		},
		{
			number: '04',
			title: 'Collaboration avec les églises locales',
			icon: Church,
			description:
				'Partenariat avec les églises des villes visitées pour l’accompagnement des nouveaux convertis et l’édification du corps de Christ.'
		}
	];

	const stats = [
		{ value: '2', label: 'Ans de prédication' },
		{ value: '10', label: 'Régions visitées' },
		{ value: '14', label: 'Villes touchées' },
		{ value: '15', label: 'Croisades organisées' },
		{ value: '~19 000', label: 'Personnes exposées' },
		{ value: '~5 000', label: 'Convertis' },
		{ value: '~1 000', label: 'Engagés dans les églises' },
		{ value: '>500', label: 'Guérisons enregistrées' }
	];
</script>

<section class="border-b border-gray-100 bg-white py-16 sm:py-20 lg:py-24 {customClass}">
	<Container>
		<!-- 1. Le projet en détail -->
		<div class="mx-auto mb-16 max-w-3xl text-center">
			<div
				class="mb-3 inline-flex items-center gap-2 rounded-full bg-brand-subtle px-3.5 py-1 text-xs font-bold tracking-wider text-brand-primary uppercase"
			>
				<Sparkles size={14} />
				<span>Stratégie Missionnaire Triennale</span>
			</div>
			<h2 class="font-display text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
				Le projet en détail
			</h2>
			<p class="mt-4 text-base leading-relaxed text-text-secondary sm:text-lg">
				« Cameroun pour Jésus » est une stratégie missionnaire sur trois ans (2024-2026) visant à
				toucher systématiquement toutes les régions du pays. Chaque année, nous visitons une ville
				différente dans chacune des 10 régions, organisant des croisades d'évangélisation, des
				séminaires et des actions humanitaires.
			</p>
		</div>

		<!-- 2. Les 4 Axes du Projet -->
		<div class="mb-20 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
			{#each axes as axe (axe.number)}
				<div
					class="rounded-2xl border border-gray-200/80 bg-[#f8fafc] p-6 shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:border-brand-primary/40 hover:bg-white hover:shadow-md"
				>
					<div class="mb-4 flex items-center justify-between">
						<span
							class="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-subtle text-brand-primary"
						>
							<axe.icon size={20} />
						</span>
						<span class="font-mono text-xs font-black text-gray-400">Axe {axe.number}</span>
					</div>
					<h3 class="mb-2 font-display text-lg font-bold text-text-primary">
						{axe.title}
					</h3>
					<p class="text-sm leading-relaxed text-text-secondary">
						{axe.description}
					</p>
				</div>
			{/each}
		</div>

		<!-- 3. Chiffres clés du projet -->
		<div class="rounded-3xl bg-brand-primary-dark p-8 text-white shadow-xl sm:p-12">
			<div class="mb-10 max-w-2xl text-center sm:text-left">
				<span class="text-xs font-bold tracking-widest text-amber-300 uppercase"
					>Impact vérifié sur le terrain</span
				>
				<h3 class="mt-1 font-display text-2xl font-bold sm:text-3xl">Chiffres clés du projet</h3>
				<p class="mt-2 text-sm text-white/80 sm:text-base">
					L'impact de « Cameroun pour Jésus » depuis son lancement dans les 10 régions du pays.
				</p>
			</div>

			<div class="grid grid-cols-2 gap-6 sm:grid-cols-4 sm:gap-8">
				{#each stats as s (s.label)}
					<div class="border-l-2 border-brand-primary/60 pl-4">
						<div
							class="font-display text-2xl font-extrabold text-amber-300 sm:text-3xl lg:text-4xl"
						>
							{s.value}
						</div>
						<div class="mt-1 text-xs font-medium text-white/85 sm:text-sm">
							{s.label}
						</div>
					</div>
				{/each}
			</div>
		</div>
	</Container>
</section>
