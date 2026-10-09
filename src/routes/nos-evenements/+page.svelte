<script lang="ts">
	import Seo from '$lib/design-system/components/Seo.svelte';
	import PageBanner from '$lib/design-system/patterns/PageBanner.svelte';
	import {
		EventsSpotlight,
		EventsListSection,
		EventsHostCta,
		DonationCtaSection,
		Modal,
		Button,
		Input,
		Select
	} from '$lib';
	import type { DetailedEventItem } from '$lib/design-system/types.js';
	import { Heart, Calendar, CheckCircle2, Ticket } from '@lucide/svelte';
	import { toast } from '$lib/design-system/toast.svelte.js';
	import type { PageData } from './$types.js';

	let { data }: { data: PageData } = $props();

	let isRegisterModalOpen = $state(false);
	let selectedEvent = $state<DetailedEventItem | null>(null);

	let attendeeName = $state('');
	let attendeePhone = $state('');
	let attendeeEmail = $state('');
	let attendeeCity = $state('');
	let attendeeCount = $state('1');
	let isSubmitting = $state(false);
	let errors = $state<{ [key: string]: string }>({});

	let isDonationModalOpen = $state(false);

	const attendeeCountOptions = [
		{ value: '1', label: '1 personne (Moi-même)' },
		{ value: '2', label: '2 personnes' },
		{ value: '3', label: '3 à 5 personnes' },
		{ value: 'group', label: 'Groupe / Délégation d’église (+5 personnes)' }
	];

	function handleOpenRegisterModal(event: DetailedEventItem) {
		selectedEvent = event;
		errors = {};
		isRegisterModalOpen = true;
	}

	function validateRegistration(): boolean {
		const newErrors: { [key: string]: string } = {};
		if (!attendeeName.trim()) {
			newErrors.attendeeName = 'Veuillez saisir votre nom et prénom.';
		}
		if (!attendeePhone.trim() || attendeePhone.length < 8) {
			newErrors.attendeePhone = 'Numéro de téléphone ou WhatsApp valide requis.';
		}
		errors = newErrors;
		return Object.keys(newErrors).length === 0;
	}

	async function handleRegisterSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (!validateRegistration()) {
			toast.error('Veuillez compléter les informations requises.', 'Inscription incomplète');
			return;
		}

		isSubmitting = true;
		await new Promise((resolve) => setTimeout(resolve, 600));
		isSubmitting = false;
		isRegisterModalOpen = false;

		toast.success(
			`Votre participation à « ${selectedEvent?.title} » a bien été enregistrée. Nous vous attendons avec joie !`,
			'Inscription confirmée'
		);

		// Reset form
		attendeeName = '';
		attendeePhone = '';
		attendeeEmail = '';
		attendeeCity = '';
		attendeeCount = '1';
	}
</script>

<Seo
	title="Événements ECOFIP — Croisades et campagnes au Cameroun"
	description="Agenda des croisades et campagnes d’évangélisation d’ECOFIP au Cameroun, dont « Bafoussam pour Jésus » du 27 au 30 octobre 2026 au Stade Omnisport Toket."
	breadcrumbs={[{ name: 'Événements', path: '/nos-evenements' }]}
/>

<div>
	<!-- 1. Bannière d'introduction avec fil d'ariane et badges -->
	<PageBanner
		title="Rejoignez les grands rendez-vous de la mission"
		subtitle="Croisades d’évangélisation, séminaires de formation de disciples, cliniques mobiles et camps bibliques de jeunesse. Venez vivre des temps puissants de visitation et d’impact au Cameroun."
		breadcrumbLabel="Nos événements"
		backgroundImage="/event-croisade.jpg"
	/>

	<!-- 2. Événement Phare à la Une (Section pleine largeur sous la Hero avec Grande Image & Compte à Rebours mécanique) -->
	{#if data.featuredEvent}
		<EventsSpotlight event={data.featuredEvent} onRegister={handleOpenRegisterModal} />
	{/if}

	<!-- 3. Catalogue complet avec filtres interactifs temporels et catégoriels -->
	<EventsListSection events={data.events} onRegister={handleOpenRegisterModal} />

	<!-- 4. Section Partenariat pour accueillir une mission locale -->
	<EventsHostCta />

	<!-- 5. Appel à semer pour parrainer une croisade -->
	<DonationCtaSection
		eyebrow="PARRAINEZ UN RASSEMBLEMENT"
		title="Financez le déploiement d’une croisade de salut"
		description="Votre soutien permet d’installer la sonorisation, d’affréter les équipes soignantes et d’offrir des bibles à tous les nouveaux convertis."
		ctaLabel="Parrainer un rassemblement"
		onCtaClick={() => (isDonationModalOpen = true)}
	/>
</div>

<!-- Modal d'inscription rapide et gratuite aux événements -->
<Modal
	bind:open={isRegisterModalOpen}
	title={selectedEvent ? `Inscription : ${selectedEvent.title}` : 'Inscription à l’événement'}
	description="Entrée libre et gratuite. Réservez votre place pour nous aider à calibrer la logistique et l'accueil."
>
	<form onsubmit={handleRegisterSubmit} class="space-y-4 py-2" novalidate>
		{#if selectedEvent}
			<div class="rounded-2xl border border-brand-primary/20 bg-brand-subtle/50 p-4">
				<div class="flex items-center gap-3">
					<div
						class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary text-white"
					>
						<Ticket size={20} />
					</div>
					<div>
						<h4 class="line-clamp-1 font-display text-sm font-bold text-text-primary">
							{selectedEvent.title}
						</h4>
						<p class="font-body text-xs text-text-secondary">
							{selectedEvent.dateDay}
							{selectedEvent.dateMonth}
							{selectedEvent.dateYear} • {selectedEvent.location}, {selectedEvent.city}
						</p>
					</div>
				</div>
			</div>
		{/if}

		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
			<Input
				label="Nom et Prénom"
				placeholder="Ex: Samuel Eboa"
				bind:value={attendeeName}
				error={errors.attendeeName}
				required
			/>
			<Input
				label="Téléphone ou WhatsApp"
				type="tel"
				placeholder="Ex: +237 6XX XX XX XX"
				bind:value={attendeePhone}
				error={errors.attendeePhone}
				required
			/>
		</div>

		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
			<Input
				label="Email (facultatif)"
				type="email"
				placeholder="Ex: samuel@example.com"
				bind:value={attendeeEmail}
			/>
			<Input label="Ville / Quartier" placeholder="Ex: Yaoundé (Mvan)" bind:value={attendeeCity} />
		</div>

		<Select
			label="Nombre de places souhaité"
			options={attendeeCountOptions}
			bind:value={attendeeCount}
		/>

		<div class="pt-2">
			<Button type="submit" variant="primary" size="lg" fullWidth loading={isSubmitting}>
				<CheckCircle2 size={18} class="mr-2" />
				<span>Confirmer ma réservation gratuite</span>
			</Button>
		</div>
	</form>
</Modal>

<!-- Modal interactive de soutien/parrainage d'une croisade -->
<Modal
	bind:open={isDonationModalOpen}
	title="Parrainer une campagne d’évangélisation ECOFIP"
	description="« Semez dans la bonne terre pour moissonner des âmes pour l'éternité. »"
>
	<div class="space-y-4 py-2">
		<p class="font-body text-sm font-semibold text-text-primary">
			Sélectionnez le poste logistique que vous souhaitez parrainer :
		</p>
		<div class="grid grid-cols-3 gap-2.5">
			<div class="rounded-xl border-2 border-brand-primary bg-brand-subtle p-3 text-center">
				<div class="text-xs font-bold text-brand-primary sm:text-sm">Bibles & Livrets</div>
				<div class="mt-0.5 text-[11px] text-text-secondary">Nouveaux convertis</div>
			</div>
			<div class="rounded-xl border border-border bg-white p-3 text-center">
				<div class="text-xs font-bold text-text-primary sm:text-sm">Pharmacie mobile</div>
				<div class="mt-0.5 text-[11px] text-text-secondary">Médicaments gratuits</div>
			</div>
			<div class="rounded-xl border border-border bg-white p-3 text-center">
				<div class="text-xs font-bold text-text-primary sm:text-sm">Régie & Scène</div>
				<div class="mt-0.5 text-[11px] text-text-secondary">Son et éclairage</div>
			</div>
		</div>

		<Input label="Montant du parrainage (FCFA)" type="number" placeholder="Ex: 50 000" />
	</div>

	{#snippet actions()}
		<Button variant="outline" size="md" onclick={() => (isDonationModalOpen = false)}>
			Annuler
		</Button>
		<Button
			variant="primary"
			size="md"
			onclick={() => {
				isDonationModalOpen = false;
				toast.success(
					'Merci infiniment pour votre générosité envers les croisades missionnaires !',
					'Parrainage validé'
				);
			}}
		>
			<Heart size={16} class="mr-1.5 fill-white text-white" />
			Valider mon don
		</Button>
	{/snippet}
</Modal>
