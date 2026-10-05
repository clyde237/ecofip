<script lang="ts">
	import { onMount } from 'svelte';
	import Container from '$lib/design-system/components/Container.svelte';
	import Button from '$lib/design-system/components/Button.svelte';
	import Modal from '$lib/design-system/components/Modal.svelte';
	import Input from '$lib/design-system/components/Input.svelte';
	import { toast } from '$lib/design-system/toast.svelte.js';
	import {
		Heart,
		ShieldCheck,
		FileText,
		CheckCircle2,
		Smartphone,
		CreditCard,
		Building2,
		Truck,
		Volume2,
		Tv,
		HeartHandshake,
		Home,
		BookOpen,
		Sparkles,
		Quote,
		ArrowRight,
		PhoneCall,
		Copy
	} from '@lucide/svelte';

	let isDonationModalOpen = $state(false);
	let selectedNeed = $state<string>('all');
	let selectedMethod = $state<'momo' | 'card' | 'bank'>('momo');
	let donationAmount = $state<number>(25000);
	let customAmount = $state<string>('');

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

	function copyToClipboard(text: string, label: string) {
		if (typeof window !== 'undefined') {
			navigator.clipboard?.writeText(text);
			toast.success(`${label} copié dans le presse-papiers`, 'Copié');
		}
	}
</script>

<svelte:head>
	<title>Faire un Don — Soutenez la Mission | ECOFIP</title>
	<meta
		name="description"
		content="Votre générosité permet à l'Évangile d'être annoncé dans les coins les plus reculés du Cameroun. Soutenez les 10 régions de la mission Cameroun pour Jésus."
	/>
	<meta property="og:title" content="Faire un Don — ECOFIP" />
	<meta
		property="og:description"
		content="Donnez, et il vous sera donné — Luc 6:38. Participez à l'évangélisation et aux secours humanitaires."
	/>
	<meta property="og:type" content="website" />
</svelte:head>

<div>
	<!-- SECTION 02 — INTRODUCTION AU DON (HERO) -->
	<section
		class="relative flex w-full flex-col justify-center overflow-hidden bg-[#0d1c1d] pt-28 pb-16 sm:pt-32 sm:pb-20 lg:pt-36 lg:pb-24"
		aria-labelledby="don-hero-title"
	>
		<div
			class="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-luminosity"
			style="background-image: url('/donate_mission_bg_1790673652029.jpg');"
			aria-hidden="true"
		></div>

		<div
			class="absolute inset-0 bg-gradient-to-b from-[#0d1c1d]/95 via-[#0d1c1d]/85 to-[#171B25]/95 sm:bg-gradient-to-r sm:from-[#0d1c1d]/95 sm:via-[#171B25]/90 sm:to-[#96000A]/70"
			aria-hidden="true"
		></div>

		<Container class="relative z-10">
			<div class="mx-auto max-w-3xl text-center">
				<div class="mb-4 inline-flex items-center justify-center">
					<span
						class="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/30 px-3.5 py-1.5 font-body text-xs font-bold tracking-widest text-brand-accent uppercase shadow-xs backdrop-blur-md"
					>
						<Sparkles size={13} class="text-brand-accent" aria-hidden="true" />
						<span>Soutenez la mission</span>
					</span>
				</div>

				<h1
					id="don-hero-title"
					class="font-display text-4xl leading-[1.15] font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl"
				>
					Faire un Don
				</h1>

				<p
					class="mt-5 font-body text-base leading-relaxed text-white/85 sm:text-lg sm:leading-relaxed"
				>
					Votre générosité permet à l'Évangile d'être annoncé dans les coins les plus reculés du
					Cameroun. Chaque don, petit ou grand, fait une différence éternelle.
				</p>

				<div class="mt-8 flex flex-wrap items-center justify-center gap-4">
					<button
						type="button"
						onclick={() => (isDonationModalOpen = true)}
						class="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-7 py-3.5 font-body text-base font-bold text-white shadow-lg transition-all hover:scale-102 hover:bg-brand-primary-hover"
					>
						<Heart size={18} class="fill-white" />
						<span>Donner en ligne</span>
					</button>

					<a
						href="#moyens-de-don"
						class="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 font-body text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
					>
						<span>Voir les moyens de don</span>
						<ArrowRight size={16} />
					</a>
				</div>
			</div>
		</Container>
	</section>

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
				{#each whyGiveCards as card}
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
				{#each currentNeeds as need}
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
								onclick={() => {
									selectedNeed = need.id;
									isDonationModalOpen = true;
								}}
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

	<!-- SECTION 06 — MOYENS DE DON -->
	<section
		id="moyens-de-don"
		class="border-t border-gray-100 bg-white py-16 sm:py-20 lg:py-24"
		aria-labelledby="payment-methods-heading"
	>
		<Container>
			<div class="mx-auto max-w-3xl text-center">
				<div class="mb-3 inline-flex items-center gap-2">
					<span class="h-0.5 w-6 rounded-full bg-brand-primary" aria-hidden="true"></span>
					<span
						class="font-body text-xs font-bold tracking-wider text-brand-primary uppercase sm:text-sm"
					>
						FACILITÉ & SÉCURITÉ
					</span>
					<span class="h-0.5 w-6 rounded-full bg-brand-primary" aria-hidden="true"></span>
				</div>

				<h2
					id="payment-methods-heading"
					class="font-display text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl"
				>
					Moyens de don
				</h2>

				<p class="mt-4 font-body text-base text-text-secondary sm:text-lg">
					Choisissez la méthode qui vous convient le mieux.
				</p>
			</div>

			<div class="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
				<!-- Moyen 01 — Mobile Money -->
				<div
					class="flex flex-col justify-between rounded-3xl border border-gray-200/90 bg-[#f8fafc] p-8 shadow-xs"
				>
					<div>
						<div
							class="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-800"
						>
							<Smartphone size={24} />
						</div>

						<h3 class="mt-6 font-display text-2xl font-bold text-text-primary">Mobile Money</h3>

						<p class="mt-2 font-body text-xs text-text-secondary">
							Paiement direct depuis votre téléphone au Cameroun
						</p>

						<div class="mt-6 space-y-4">
							<div class="rounded-2xl border border-gray-200 bg-white p-4">
								<span class="block font-body text-xs font-bold text-amber-600">Orange Money</span>
								<div class="mt-1 flex items-center justify-between">
									<span class="font-body text-sm font-bold text-text-primary">+237 6XX XXX XXX</span
									>
									<button
										type="button"
										onclick={() => copyToClipboard('+237 6XX XXX XXX', 'Numéro Orange Money')}
										class="cursor-pointer text-gray-400 hover:text-brand-primary"
										title="Copier"
									>
										<Copy size={16} />
									</button>
								</div>
							</div>

							<div class="rounded-2xl border border-gray-200 bg-white p-4">
								<span class="block font-body text-xs font-bold text-yellow-600"
									>MTN Mobile Money</span
								>
								<div class="mt-1 flex items-center justify-between">
									<span class="font-body text-sm font-bold text-text-primary">+237 6XX XXX XXX</span
									>
									<button
										type="button"
										onclick={() => copyToClipboard('+237 6XX XXX XXX', 'Numéro MTN Mobile Money')}
										class="cursor-pointer text-gray-400 hover:text-brand-primary"
										title="Copier"
									>
										<Copy size={16} />
									</button>
								</div>
							</div>
						</div>
					</div>

					<div class="mt-8 border-t border-gray-200 pt-4">
						<button
							type="button"
							onclick={() => {
								selectedMethod = 'momo';
								isDonationModalOpen = true;
							}}
							class="w-full cursor-pointer rounded-xl bg-brand-primary py-3 font-body text-sm font-bold text-white shadow-xs transition-colors hover:bg-brand-primary-hover"
						>
							Faire un don par Mobile Money
						</button>
					</div>
				</div>

				<!-- Moyen 02 — Carte bancaire -->
				<div
					class="flex flex-col justify-between rounded-3xl border border-gray-200/90 bg-[#f8fafc] p-8 shadow-xs"
				>
					<div>
						<div
							class="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-subtle text-brand-primary"
						>
							<CreditCard size={24} />
						</div>

						<h3 class="mt-6 font-display text-2xl font-bold text-text-primary">Carte bancaire</h3>

						<p class="mt-2 font-body text-xs text-text-secondary">
							Visa / Mastercard • Paiement sécurisé en ligne
						</p>

						<div class="mt-6 space-y-4">
							<div class="rounded-2xl border border-gray-200 bg-white p-5 text-center">
								<div class="flex items-center justify-center gap-3">
									<span class="font-display text-lg font-black text-blue-700">VISA</span>
									<span class="font-display text-lg font-black text-rose-600">Mastercard</span>
								</div>
								<p class="mt-3 font-body text-xs leading-relaxed text-text-secondary">
									Transaction chiffrée SSL 256 bits, acceptée au Cameroun et à l'international.
								</p>
							</div>
						</div>
					</div>

					<div class="mt-8 border-t border-gray-200 pt-4">
						<button
							type="button"
							onclick={() => {
								selectedMethod = 'card';
								isDonationModalOpen = true;
							}}
							class="w-full cursor-pointer rounded-xl bg-brand-primary py-3 font-body text-sm font-bold text-white shadow-xs transition-colors hover:bg-brand-primary-hover"
						>
							Payer par carte bancaire
						</button>
					</div>
				</div>

				<!-- Moyen 03 — Virement -->
				<div
					class="flex flex-col justify-between rounded-3xl border border-gray-200/90 bg-[#f8fafc] p-8 shadow-xs"
				>
					<div>
						<div
							class="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"
						>
							<Building2 size={24} />
						</div>

						<h3 class="mt-6 font-display text-2xl font-bold text-text-primary">
							Virement bancaire
						</h3>

						<p class="mt-2 font-body text-xs text-text-secondary">
							Comptes officiels BICEC et Afriland First Bank
						</p>

						<div class="mt-6 space-y-4">
							<div class="rounded-2xl border border-gray-200 bg-white p-4">
								<span class="block font-body text-xs font-bold text-text-primary">BICEC</span>
								<div class="mt-1 flex items-center justify-between">
									<span class="font-mono text-xs text-text-secondary"
										>IBAN : CM21 XXXX XXXX XXXX</span
									>
									<button
										type="button"
										onclick={() => copyToClipboard('CM21 XXXX XXXX XXXX', 'IBAN BICEC')}
										class="cursor-pointer text-gray-400 hover:text-brand-primary"
										title="Copier"
									>
										<Copy size={16} />
									</button>
								</div>
							</div>

							<div class="rounded-2xl border border-gray-200 bg-white p-4">
								<span class="block font-body text-xs font-bold text-text-primary"
									>Afriland First Bank</span
								>
								<div class="mt-1 flex items-center justify-between">
									<span class="font-mono text-xs text-text-secondary"
										>IBAN : CM21 XXXX XXXX XXXX</span
									>
									<button
										type="button"
										onclick={() => copyToClipboard('CM21 XXXX XXXX XXXX', 'IBAN Afriland')}
										class="cursor-pointer text-gray-400 hover:text-brand-primary"
										title="Copier"
									>
										<Copy size={16} />
									</button>
								</div>
							</div>
						</div>
					</div>

					<div class="mt-8 border-t border-gray-200 pt-4">
						<button
							type="button"
							onclick={() => {
								selectedMethod = 'bank';
								isDonationModalOpen = true;
							}}
							class="w-full cursor-pointer rounded-xl bg-brand-primary py-3 font-body text-sm font-bold text-white shadow-xs transition-colors hover:bg-brand-primary-hover"
						>
							Obtenir les coordonnées bancaires
						</button>
					</div>
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
						<button
							type="button"
							onclick={() => (isDonationModalOpen = true)}
							class="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-7 py-3.5 font-body text-base font-bold text-white shadow-md transition-all hover:bg-brand-primary-hover hover:shadow-lg"
						>
							<Heart size={18} class="fill-white" />
							<span>Donner en ligne</span>
						</button>

						<a
							href="/contact"
							class="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-7 py-3.5 font-body text-base font-semibold text-text-primary shadow-2xs transition-all hover:border-gray-400 hover:bg-gray-50"
						>
							<PhoneCall size={18} class="text-brand-primary" />
							<span>Contacter pour un don</span>
						</a>
					</div>

					<!-- 3 Garanties officielles -->
					<div class="mt-12 grid grid-cols-1 gap-4 border-t border-gray-100 pt-8 sm:grid-cols-3">
						<div
							class="flex items-center justify-center gap-2 font-body text-xs text-text-secondary sm:text-sm"
						>
							<ShieldCheck size={18} class="shrink-0 text-emerald-600" />
							<span>Paiements 100% sécurisés</span>
						</div>

						<div
							class="flex items-center justify-center gap-2 font-body text-xs text-text-secondary sm:text-sm"
						>
							<CheckCircle2 size={18} class="shrink-0 text-brand-primary" />
							<span>Transparence totale</span>
						</div>

						<div
							class="flex items-center justify-center gap-2 font-body text-xs text-text-secondary sm:text-sm"
						>
							<FileText size={18} class="shrink-0 text-blue-600" />
							<span>Reçu fiscal disponible</span>
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

<!-- Modal interactive de don -->
<Modal
	bind:open={isDonationModalOpen}
	title="Soutenir la mission « Cameroun pour Jésus »"
	description="« Donnez, et il vous sera donné » — Luc 6:38"
>
	<div class="space-y-5 py-2">
		<!-- Montants suggérés -->
		<div class="space-y-2">
			<span class="block font-body text-xs font-semibold text-text-secondary">
				Choisissez un montant (FCFA) :
			</span>
			<div class="grid grid-cols-3 gap-2.5">
				{#each [10000, 25000, 50000, 100000, 250000, 500000] as amount}
					<button
						type="button"
						onclick={() => {
							donationAmount = amount;
							customAmount = '';
						}}
						class="cursor-pointer rounded-xl border py-2.5 text-center font-body text-xs font-bold transition-all {donationAmount ===
							amount && !customAmount
							? 'border-brand-primary bg-brand-subtle text-brand-primary shadow-xs'
							: 'border-border bg-white text-text-primary hover:border-brand-primary/50'}"
					>
						{amount.toLocaleString('fr-FR')} F
					</button>
				{/each}
			</div>
		</div>

		<Input
			label="Ou saisissez un montant libre (FCFA)"
			type="number"
			placeholder="Ex: 75 000"
			bind:value={customAmount}
		/>

		<!-- Mode de versement -->
		<div class="space-y-2">
			<span class="block font-body text-xs font-semibold text-text-secondary">
				Canal de paiement :
			</span>
			<div class="grid grid-cols-3 gap-2">
				<button
					type="button"
					onclick={() => (selectedMethod = 'momo')}
					class="cursor-pointer rounded-xl border p-2 text-center text-xs font-bold transition-all {selectedMethod ===
					'momo'
						? 'border-brand-primary bg-brand-subtle text-brand-primary'
						: 'border-border bg-white'}"
				>
					Mobile Money
				</button>
				<button
					type="button"
					onclick={() => (selectedMethod = 'card')}
					class="cursor-pointer rounded-xl border p-2 text-center text-xs font-bold transition-all {selectedMethod ===
					'card'
						? 'border-brand-primary bg-brand-subtle text-brand-primary'
						: 'border-border bg-white'}"
				>
					Carte bancaire
				</button>
				<button
					type="button"
					onclick={() => (selectedMethod = 'bank')}
					class="cursor-pointer rounded-xl border p-2 text-center text-xs font-bold transition-all {selectedMethod ===
					'bank'
						? 'border-brand-primary bg-brand-subtle text-brand-primary'
						: 'border-border bg-white'}"
				>
					Virement
				</button>
			</div>
		</div>
	</div>

	{#snippet actions()}
		<Button variant="outline" size="md" onclick={() => (isDonationModalOpen = false)}>
			Fermer
		</Button>
		<Button
			variant="primary"
			size="md"
			onclick={() => {
				isDonationModalOpen = false;
				toast.success(
					'Merci infiniment pour votre générosité ! Que Dieu bénisse votre semence.',
					'Don confirmé'
				);
			}}
		>
			<Heart size={16} class="mr-1.5 fill-white text-white" />
			Valider mon don
		</Button>
	{/snippet}
</Modal>
