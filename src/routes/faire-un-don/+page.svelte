<script lang="ts">
	import Seo from '$lib/design-system/components/Seo.svelte';
	import PageBanner from '$lib/design-system/patterns/PageBanner.svelte';
	import Container from '$lib/design-system/components/Container.svelte';
	import MobileMoneyDonation from '$lib/design-system/components/MobileMoneyDonation.svelte';
	import { donationDialog } from '$lib/design-system/donation.svelte.js';
	import { DONATION_RECIPIENT, MOBILE_MONEY_OPERATORS, ussdCode } from '$lib/config/donation.js';
	import {
		Heart,
		ShieldCheck,
		Smartphone,
		Truck,
		Volume2,
		Tv,
		HeartHandshake,
		Home,
		BookOpen,
		Sparkles,
		Quote,
		PhoneCall,
		UserCheck
	} from '@lucide/svelte';

	const whyGiveCards = [
		{
			id: 1,
			title: 'Sauver des âmes',
			description: "Chaque don permet d'organiser des croisades où des milliers trouvent Christ.",
			icon: Sparkles,
			accent: 'bg-brand-subtle text-brand-primary border-brand-primary/20'
		},
		{
			id: 2,
			title: 'Aider les nécessiteux',
			description: 'Vos dons financent nos actions humanitaires auprès des plus vulnérables.',
			icon: HeartHandshake,
			accent: 'bg-emerald-50 text-emerald-700 border-emerald-200'
		},
		{
			id: 3,
			title: 'Former des disciples',
			description: "Participer à la formation et à l'édification des nouveaux convertis.",
			icon: BookOpen,
			accent: 'bg-amber-50 text-amber-800 border-amber-200'
		}
	];

	const currentNeeds = [
		{
			id: 'transport',
			title: 'Transport',
			description: 'Déplacement des équipes vers les 10 régions',
			amount: '2 000 000 FCFA',
			icon: Truck,
			raised: '1 250 000 FCFA',
			percent: 62
		},
		{
			id: 'sono',
			title: 'Matériel Sono',
			description: 'Équipements audio pour les croisades',
			amount: '5 000 000 FCFA',
			icon: Volume2,
			raised: '3 200 000 FCFA',
			percent: 64
		},
		{
			id: 'audiovisuel',
			title: 'Équipement Audio-Visuel',
			description: 'Caméras, projecteurs, écrans LED',
			amount: '4 000 000 FCFA',
			icon: Tv,
			raised: '2 400 000 FCFA',
			percent: 60
		},
		{
			id: 'social',
			title: 'Actions Sociales',
			description: 'Aide alimentaire et assistance médicale',
			amount: '3 000 000 FCFA',
			icon: HeartHandshake,
			raised: '2 100 000 FCFA',
			percent: 70
		},
		{
			id: 'logement',
			title: 'Logement',
			description: 'Hébergement des équipes missionnaires',
			amount: '1 500 000 FCFA',
			icon: Home,
			raised: '950 000 FCFA',
			percent: 63
		},
		{
			id: 'evangelisation',
			title: 'Matériel Évangélisation',
			description: 'Bibles, tracts, livres chrétiens',
			amount: '1 000 000 FCFA',
			icon: BookOpen,
			raised: '800 000 FCFA',
			percent: 80
		}
	];
</script>

<Seo
	title="Faire un don — Soutenir Cameroun pour Jésus | ECOFIP"
	description="Soutenez les campagnes d’évangélisation, de guérison et d’action sociale d’ECOFIP dans les régions du Cameroun. Chaque don porte l’Évangile plus loin."
	breadcrumbs={[{ name: 'Faire un don', path: '/faire-un-don' }]}
/>

<div>
	<!-- SECTION 02 — INTRODUCTION AU DON (HERO) -->
	<PageBanner
		title="Faire un don"
		subtitle="Votre générosité permet à l’Évangile d’être annoncé dans les coins les plus reculés du Cameroun. Chaque don, petit ou grand, fait une différence éternelle."
		backgroundImage="/donate_mission_bg_1790673652029.jpg"
	/>

	<!-- SECTION 03 — VERSET BIBLIQUE -->
	<section class="bg-brand-primary py-10 text-white sm:py-12" aria-label="Fondement biblique">
		<Container>
			<div class="mx-auto max-w-2xl text-center">
				<Quote size={32} class="mx-auto mb-3 text-white/40" />
				<blockquote class="font-display text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
					« Donnez, et il vous sera donné »
				</blockquote>
				<cite
					class="mt-3 block font-body text-sm font-semibold tracking-wider text-brand-accent uppercase not-italic"
				>
					— Luc 6:38
				</cite>
			</div>
		</Container>
	</section>

	<!-- SECTION 04 — POURQUOI DONNER ? -->
	<section class="bg-white py-16 sm:py-20 lg:py-24" aria-labelledby="why-give-heading">
		<Container>
			<div class="mx-auto max-w-3xl text-center">
				<div class="mb-3 inline-flex items-center gap-2">
					<span class="h-0.5 w-6 rounded-full bg-brand-primary" aria-hidden="true"></span>
					<span
						class="font-body text-xs font-bold tracking-wider text-brand-primary uppercase sm:text-sm"
					>
						UN IMPACT ÉTERNEL
					</span>
					<span class="h-0.5 w-6 rounded-full bg-brand-primary" aria-hidden="true"></span>
				</div>

				<h2
					id="why-give-heading"
					class="font-display text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl"
				>
					Pourquoi donner ?
				</h2>

				<p class="mt-4 font-body text-base text-text-secondary sm:text-lg">
					Découvrez les fruits concrets portés par votre générosité dans la vie des âmes et des
					communautés.
				</p>
			</div>

			<div class="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{#each whyGiveCards as card (card.id)}
					{@const IconComponent = card.icon}
					<div
						class="flex flex-col justify-between rounded-3xl border border-gray-200/80 bg-[#f8fafc] p-8 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-brand-primary/30 hover:shadow-lg"
					>
						<div>
							<div
								class="flex h-12 w-12 items-center justify-center rounded-2xl border {card.accent}"
							>
								<IconComponent size={24} />
							</div>
							<h3 class="mt-6 font-display text-xl font-bold tracking-tight text-text-primary">
								{card.title}
							</h3>
							<p class="mt-3 font-body text-sm leading-relaxed text-text-secondary sm:text-base">
								{card.description}
							</p>
						</div>
					</div>
				{/each}
			</div>
		</Container>
	</section>

	<!-- SECTION 05 — NOS BESOINS ACTUELS -->
	<section
		class="border-t border-gray-100 bg-[#f8fafc] py-16 sm:py-20 lg:py-24"
		aria-labelledby="needs-heading"
	>
		<Container>
			<div class="mx-auto max-w-3xl text-center">
				<div class="mb-3 inline-flex items-center gap-2">
					<span class="h-0.5 w-6 rounded-full bg-brand-primary" aria-hidden="true"></span>
					<span
						class="font-body text-xs font-bold tracking-wider text-brand-primary uppercase sm:text-sm"
					>
						TRANSPARENCE & BUDGETS
					</span>
					<span class="h-0.5 w-6 rounded-full bg-brand-primary" aria-hidden="true"></span>
				</div>

				<h2
					id="needs-heading"
					class="font-display text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl"
				>
					Nos besoins actuels
				</h2>

				<p class="mt-4 font-body text-base text-text-secondary sm:text-lg">
					Voici comment vos dons sont utilisés pour la mission.
				</p>
			</div>

			<div class="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{#each currentNeeds as need (need.id)}
					{@const IconComponent = need.icon}
					<div
						class="flex flex-col justify-between rounded-3xl border border-gray-200/80 bg-white p-7 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-brand-primary/30 hover:shadow-md"
					>
						<div>
							<div class="flex items-center justify-between border-b border-gray-100 pb-4">
								<div
									class="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-subtle text-brand-primary"
								>
									<IconComponent size={22} />
								</div>
								<span
									class="rounded-full bg-gray-100 px-3 py-1 font-body text-xs font-bold text-text-secondary"
								>
									Besoin ciblé
								</span>
							</div>

							<h3 class="mt-5 font-display text-xl font-bold tracking-tight text-text-primary">
								{need.title}
							</h3>
							<p class="mt-1 font-body text-sm text-text-secondary">
								{need.description}
							</p>

							<div class="mt-6 rounded-2xl border border-gray-100 bg-[#fafaf8] p-4">
								<div class="flex items-baseline justify-between">
									<span class="font-body text-xs font-bold text-text-secondary uppercase"
										>Budget :</span
									>
									<span class="font-display text-lg font-black text-brand-primary"
										>{need.amount}</span
									>
								</div>
							</div>
						</div>

						<div class="mt-6 border-t border-gray-100 pt-4">
							<button
								type="button"
								onclick={() => donationDialog.show(need.title)}
								class="w-full cursor-pointer rounded-xl bg-brand-subtle py-2.5 text-center font-body text-xs font-bold text-brand-primary transition-colors hover:bg-brand-primary hover:text-white"
							>
								Financer ce besoin
							</button>
						</div>
					</div>
				{/each}
			</div>
		</Container>
	</section>

	<!-- SECTION 06 — DON PAR MOBILE MONEY -->
	<section
		id="don"
		class="scroll-mt-24 border-t border-gray-100 bg-white py-16 sm:py-20 lg:py-24"
		aria-labelledby="donation-heading"
	>
		<Container>
			<div class="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
				<div>
					<div class="mb-3 inline-flex items-center gap-2">
						<span class="h-0.5 w-6 rounded-full bg-brand-primary" aria-hidden="true"></span>
						<span
							class="font-body text-xs font-bold tracking-wider text-brand-primary uppercase sm:text-sm"
						>
							SOUTENEZ L’ŒUVRE
						</span>
					</div>
					<h2
						id="donation-heading"
						class="font-display text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl"
					>
						Donnez par Orange Money ou MTN MoMo
					</h2>
					<p class="mt-4 font-body text-base leading-relaxed text-text-secondary sm:text-lg">
						Choisissez votre montant : sur votre téléphone, le code s’ouvre directement dans
						l’application Téléphone. Il ne reste qu’à appeler puis à valider avec votre code secret.
					</p>

					<ul class="mt-8 space-y-4 font-body text-sm text-text-secondary sm:text-base">
						<li class="flex gap-3">
							<Smartphone size={20} class="mt-0.5 shrink-0 text-brand-primary" />
							<span>
								<strong class="text-text-primary">Sans application ni inscription</strong> : le don passe
								par le menu Mobile Money de votre opérateur.
							</span>
						</li>
						<li class="flex gap-3">
							<UserCheck size={20} class="mt-0.5 shrink-0 text-brand-primary" />
							<span>
								<strong class="text-text-primary">Bénéficiaire : {DONATION_RECIPIENT}</strong>,
								l’association dont ECOFIP est le département d’évangélisation.
							</span>
						</li>
						<li class="flex gap-3">
							<ShieldCheck size={20} class="mt-0.5 shrink-0 text-brand-primary" />
							<span>
								<strong class="text-text-primary">Vous gardez la main</strong> : rien n’est prélevé tant
								que vous n’avez pas validé avec votre code secret.
							</span>
						</li>
					</ul>

					<div class="mt-8 rounded-2xl border border-gray-200 bg-[#f8fafc] p-5 font-body text-sm">
						<p class="font-bold text-text-primary">Vous préférez composer vous-même ?</p>
						<ul class="mt-2 space-y-1 text-text-secondary">
							{#each MOBILE_MONEY_OPERATORS as operator (operator.id)}
								<li>
									{operator.name} :
									<span class="font-mono font-bold text-text-primary"
										>{ussdCode(operator, null)}</span
									>
								</li>
							{/each}
						</ul>
						<p class="mt-3 text-text-secondary">
							Pour un virement, un don en nature ou un partenariat,
							<a href="/contact" class="font-semibold text-brand-primary hover:underline"
								>contactez-nous</a
							>.
						</p>
					</div>
				</div>

				<div class="rounded-3xl border border-gray-200/90 bg-white p-5 shadow-md sm:p-7">
					<MobileMoneyDonation idPrefix="don-page" />
				</div>
			</div>
		</Container>
	</section>

	<!-- SECTION 07 — APPEL AU DON -->
	<section
		class="border-t border-gray-100 bg-[#fafaf8] py-16 sm:py-20 lg:py-28"
		aria-labelledby="cta-donation-heading"
	>
		<Container>
			<div
				class="relative overflow-hidden rounded-3xl border border-gray-200/90 bg-white p-8 shadow-sm sm:p-12 lg:p-16"
			>
				<div class="mx-auto max-w-3xl text-center">
					<h2
						id="cta-donation-heading"
						class="font-display text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl lg:text-5xl"
					>
						Faites un don maintenant
					</h2>

					<p class="mt-5 font-body text-base leading-relaxed text-text-secondary sm:text-lg">
						Votre générosité aujourd'hui peut changer une vie pour l'éternité. Rejoignez-nous dans
						cette mission de foi et participez à l'avancement du Royaume de Dieu au Cameroun.
					</p>

					<!-- Actions -->
					<div class="mt-8 flex flex-wrap items-center justify-center gap-4 sm:mt-10">
						<a
							href="#don"
							class="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-7 py-3.5 font-body text-base font-bold text-white shadow-md transition-all hover:bg-brand-primary-hover hover:shadow-lg"
						>
							<Heart size={18} class="fill-white" />
							<span>Donner par Mobile Money</span>
						</a>

						<a
							href="/contact"
							class="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-7 py-3.5 font-body text-base font-semibold text-text-primary shadow-2xs transition-all hover:border-gray-400 hover:bg-gray-50"
						>
							<PhoneCall size={18} class="text-brand-primary" />
							<span>Contacter pour un don</span>
						</a>
					</div>

					<!-- Ce que le donateur doit savoir -->
					<div class="mt-12 grid grid-cols-1 gap-4 border-t border-gray-100 pt-8 sm:grid-cols-3">
						<div
							class="flex items-center justify-center gap-2 font-body text-xs text-text-secondary sm:text-sm"
						>
							<Smartphone size={18} class="shrink-0 text-brand-primary" />
							<span>Orange Money et MTN MoMo</span>
						</div>

						<div
							class="flex items-center justify-center gap-2 font-body text-xs text-text-secondary sm:text-sm"
						>
							<UserCheck size={18} class="shrink-0 text-emerald-600" />
							<span>Bénéficiaire : {DONATION_RECIPIENT}</span>
						</div>

						<div
							class="flex items-center justify-center gap-2 font-body text-xs text-text-secondary sm:text-sm"
						>
							<ShieldCheck size={18} class="shrink-0 text-blue-600" />
							<span>Validation par votre code secret</span>
						</div>
					</div>

					<!-- Note officielle -->
					<p class="text-text-muted mt-8 font-body text-xs leading-relaxed italic">
						ECOFIP est une organisation chrétienne à but non lucratif. Tous les dons sont utilisés
						exclusivement pour l'œuvre de Dieu.
					</p>
				</div>
			</div>
		</Container>
	</section>
</div>
