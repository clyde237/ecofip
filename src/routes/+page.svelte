<script lang="ts">
	import {
		Hero,
		StatsBar,
		EventsSpotlight,
		AboutSection,
		EventsSection,
		TestimonialsSection,
		VideoSection,
		MapSection,
		NewsSection,
		DonationCtaSection,
		Modal,
		Button,
		Input,
		toast
	} from '$lib';
	import MissionCountdown from '$lib/design-system/components/MissionCountdown.svelte';
	import TenRegionsSection from '$lib/design-system/patterns/TenRegionsSection.svelte';
	import type { DetailedEventItem } from '$lib/design-system/types.js';
	import type { PageData } from './$types.js';
	import { CheckCircle2 } from '@lucide/svelte';

	let { data }: { data: PageData } = $props();

	// État de la modale de don
	let isModalOpen = $state(false);
	let donationAmount = $state('50');
	let selectedCause = $state<'medical' | 'education'>('medical');

	// État de l'inscription à l'événement en avant
	let isRegisterModalOpen = $state(false);
	let selectedEvent = $state<DetailedEventItem | null>(null);
	let attendeeName = $state('');
	let attendeePhone = $state('');
	let attendeeEmail = $state('');
	let attendeeCount = $state('1');
	let isRegisterSubmitting = $state(false);

	function handleOpenRegisterModal(event: DetailedEventItem) {
		selectedEvent = event;
		isRegisterModalOpen = true;
	}

	async function handleRegisterSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (!attendeeName.trim() || !attendeePhone.trim()) {
			toast.error('Veuillez renseigner votre nom et votre numéro.', 'Champs requis');
			return;
		}
		isRegisterSubmitting = true;
		await new Promise((resolve) => setTimeout(resolve, 600));
		isRegisterSubmitting = false;
		isRegisterModalOpen = false;
		toast.success(
			`Votre participation à « ${selectedEvent?.title} » a été enregistrée avec succès !`,
			'Inscription confirmée'
		);
		attendeeName = '';
		attendeePhone = '';
		attendeeEmail = '';
	}

	function handleConfirmDonation() {
		isModalOpen = false;
		toast.success(
			'Votre promesse de don a été validée avec succès ! Que Dieu vous bénisse.',
			'Merci pour votre soutien'
		);
	}
</script>

<svelte:head>
	<title>ECOFIP — Les Économes Fidèles et Prudents | Cameroun pour Jésus</title>
	<meta
		name="description"
		content="ECOFIP — Les Économes Fidèles et Prudents parcourt les 10 régions du Cameroun pour annoncer l'Évangile, transformer des vies et apporter l'espoir à travers des croisades d'évangélisation et des actions humanitaires."
	/>
</svelte:head>

<div>
	<!-- SECTION 02 — HERO / MISSION NATIONALE : Cameroun pour Jésus -->
	<Hero />

	<!-- SECTION 03 — COMPTEUR DE LA PROCHAINE MISSION (Jours, Heures, Minutes, Secondes) -->
	<MissionCountdown />

	<!-- SECTION 04 — CHIFFRES CLÉS / NOTRE IMPACT (10 Régions, 50K+ Vies touchées, 3 ans Projet national) -->
	<StatsBar />

	<!-- SECTION 05 — 10 RÉGIONS, 1 MESSAGE (Adamaoua, Centre, Est, Extrême-Nord, Littoral, Nord, Nord-Ouest, Ouest, Sud, Sud-Ouest) -->
	<TenRegionsSection />

	<!-- SECTION 06 — TÉMOIGNAGES (Des vies transformées par la puissance de l'Évangile) -->
	<TestimonialsSection />

	<!-- SECTION 07 — À PROPOS D'ECOFIP (Les Économes Fidèles et Prudents — Notre vision & Direction) -->
	<AboutSection />

	<!-- SECTION 08 — CARTE DES MISSIONS (Villes visitées et à venir) -->
	<MapSection />

	<!-- SECTION 09 — NOS PROJETS & MISSIONS (Croisades, Actions humanitaires, Séminaires) -->
	<EventsSection events={data.events && data.events.length > 0 ? data.events : undefined} />

	<!-- Événement Mis en Avant (si configuré) -->
	{#if data.featuredEvent}
		<EventsSpotlight
			event={data.featuredEvent}
			eyebrow="PROCHAIN GRAND RENDEZ-VOUS À LA UNE"
			onRegister={handleOpenRegisterModal}
		/>
	{/if}

	<!-- SECTION 11 — GALERIE PHOTOS & VIDÉOS (Revivez les moments forts de nos missions) -->
	<VideoSection chapters={data.videos && data.videos.length > 0 ? data.videos : undefined} />

	<!-- SECTION 12 — ACTUALITÉS & TÉMOIGNAGES (Dernières nouvelles de la moisson) -->
	<NewsSection />

	<!-- SECTION 10 — REJOIGNEZ LA MISSION (Participer à la mission ou Faire un don) -->
	<DonationCtaSection
		eyebrow="REJOIGNEZ LA MISSION"
		title="Soyez partie prenante de cette grande œuvre !"
		description="Participez comme missionnaire, volontaire ou partenaire financier pour soutenir l'avancement du Royaume de Dieu au Cameroun."
		ctaLabel="Participer à la mission"
		ctaHref="/nous-rejoindre"
		secondaryCtaLabel="Faire un don"
		secondaryCtaHref="/faire-un-don"
		onCtaClick={() => (isModalOpen = true)}
	/>
</div>

<!-- Modale de don interactive -->
<Modal
	bind:open={isModalOpen}
	title="Faire un don à la mission ECOFIP"
	description="Votre générosité permet de financer les croisades d'évangélisation, les soins médicaux et l'aide aux orphelins."
>
	<div class="space-y-5 py-2">
		<p class="font-body text-sm font-semibold text-text-primary">
			Sélectionnez l'action que vous souhaitez soutenir en priorité :
		</p>
		<div class="grid grid-cols-2 gap-3">
			<button
				type="button"
				onclick={() => (selectedCause = 'medical')}
				class="cursor-pointer rounded-xl border-2 p-3.5 text-center transition-all {selectedCause ===
				'medical'
					? 'border-brand-primary bg-brand-subtle'
					: 'border-border bg-white hover:border-brand-primary/50'}"
			>
				<div class="text-sm font-bold text-brand-primary">Missions Médicales</div>
				<div class="mt-1 text-xs text-text-secondary">Équipements et soins</div>
			</button>
			<button
				type="button"
				onclick={() => (selectedCause = 'education')}
				class="cursor-pointer rounded-xl border-2 p-3.5 text-center transition-all {selectedCause ===
				'education'
					? 'border-brand-primary bg-brand-subtle'
					: 'border-border bg-white hover:border-brand-primary/50'}"
			>
				<div class="text-sm font-bold text-text-primary">Éducation & Écoles</div>
				<div class="mt-1 text-xs text-text-secondary">Fournitures scolaires</div>
			</button>
		</div>
		<Input
			label="Montant du don (€)"
			type="number"
			bind:value={donationAmount}
			placeholder="50"
			required
		/>
	</div>

	{#snippet actions()}
		<Button variant="outline" size="md" onclick={() => (isModalOpen = false)}>Annuler</Button>
		<Button variant="primary" size="md" onclick={handleConfirmDonation}>Confirmer le don</Button>
	{/snippet}
</Modal>

<!-- Modale d'inscription gratuite à l'événement en avant -->
{#if selectedEvent}
	<Modal
		bind:open={isRegisterModalOpen}
		title={`Inscription : ${selectedEvent.title}`}
		description="Entrée 100% libre et gratuite. Réservez votre place pour nous aider à calibrer la logistique et l'accueil."
	>
		<form onsubmit={handleRegisterSubmit} class="space-y-4 py-2" novalidate>
			<div
				class="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5 text-xs text-emerald-800"
			>
				<div class="flex items-center gap-2 font-bold text-emerald-900">
					<CheckCircle2 size={15} class="text-emerald-600" />
					<span>Accès 100% Gratuit — Tout le monde est bienvenu</span>
				</div>
				<p class="mt-1 text-[11px] text-emerald-700">
					Date : <strong
						>{selectedEvent.dateDay} {selectedEvent.dateMonth} {selectedEvent.dateYear}</strong
					>
					· Horaires : <strong>{selectedEvent.time}</strong>
				</p>
			</div>

			<div>
				<label for="home-att-name" class="block text-xs font-bold text-text-primary">
					Nom complet *
				</label>
				<input
					id="home-att-name"
					type="text"
					bind:value={attendeeName}
					placeholder="Ex: Jean Paul Nguemo"
					required
					class="mt-1 h-10 w-full rounded-xl border border-gray-200 px-3 text-xs text-text-primary focus:border-brand-primary focus:outline-hidden"
				/>
			</div>

			<div>
				<label for="home-att-phone" class="block text-xs font-bold text-text-primary">
					Numéro de téléphone / WhatsApp *
				</label>
				<input
					id="home-att-phone"
					type="tel"
					bind:value={attendeePhone}
					placeholder="Ex: +237 6 77 00 00 00"
					required
					class="mt-1 h-10 w-full rounded-xl border border-gray-200 px-3 text-xs text-text-primary focus:border-brand-primary focus:outline-hidden"
				/>
			</div>

			<div>
				<label for="home-att-email" class="block text-xs font-bold text-text-primary">
					Adresse e-mail (facultatif)
				</label>
				<input
					id="home-att-email"
					type="email"
					bind:value={attendeeEmail}
					placeholder="Ex: jean.paul@example.com"
					class="mt-1 h-10 w-full rounded-xl border border-gray-200 px-3 text-xs text-text-primary focus:border-brand-primary focus:outline-hidden"
				/>
			</div>

			<div>
				<label for="home-att-count" class="block text-xs font-bold text-text-primary">
					Nombre de personnes
				</label>
				<select
					id="home-att-count"
					bind:value={attendeeCount}
					class="mt-1 h-10 w-full rounded-xl border border-gray-200 px-3 text-xs text-text-primary focus:border-brand-primary focus:outline-hidden"
				>
					<option value="1">1 personne (Moi-même)</option>
					<option value="2">2 personnes</option>
					<option value="3">3 à 5 personnes</option>
					<option value="group">Groupe / Délégation (+5 personnes)</option>
				</select>
			</div>

			<div class="flex items-center justify-end gap-3 border-t border-gray-100 pt-3">
				<button
					type="button"
					onclick={() => (isRegisterModalOpen = false)}
					class="rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-text-secondary hover:bg-gray-50"
				>
					Annuler
				</button>
				<button
					type="submit"
					disabled={isRegisterSubmitting}
					class="rounded-xl bg-brand-primary px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-brand-primary-hover disabled:opacity-50"
				>
					{isRegisterSubmitting ? 'Validation...' : 'Confirmer mon inscription'}
				</button>
			</div>
		</form>
	</Modal>
{/if}
