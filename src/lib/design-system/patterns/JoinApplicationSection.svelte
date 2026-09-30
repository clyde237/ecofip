<script lang="ts">
	import { onMount } from 'svelte';
	import Container from '../components/Container.svelte';
	import Input from '../components/Input.svelte';
	import Select from '../components/Select.svelte';
	import Textarea from '../components/Textarea.svelte';
	import Button from '../components/Button.svelte';
	import { toast } from '../toast.svelte.js';
	import { Send, CheckCircle2, HeartHandshake, ShieldCheck } from '@lucide/svelte';

	let {
		selectedPole = $bindable('sante'),
		class: customClass = ''
	}: {
		selectedPole?: string;
		class?: string;
	} = $props();

	let fullName = $state('');
	let email = $state('');
	let phone = $state('');
	let city = $state('');
	let poleChoice = $state(selectedPole || 'sante');
	let availability = $state('croisades');
	let skills = $state('');
	let motivation = $state('');

	let isSubmitting = $state(false);
	let isSubmitted = $state(false);
	let errors = $state<{ [key: string]: string }>({});

	// Synchroniser si le parent modifie le pôle sélectionné
	$effect(() => {
		if (selectedPole) {
			poleChoice = selectedPole;
		}
	});

	const poleOptions = [
		{ value: 'sante', label: 'Pôle Médical & Secours (Santé, Soins)' },
		{ value: 'evangelisation', label: 'Pôle Moisson & Discipulat (Évangélisation, Prière)' },
		{ value: 'technique', label: 'Pôle Technique & Communication (Régie, Médias, Son)' },
		{ value: 'jeunesse', label: 'Pôle Jeunesse & Enseignement (Camps, Enfants, Mentorat)' },
		{ value: 'autre', label: 'Autre domaine / Compétences polyvalentes' }
	];

	const availabilityOptions = [
		{ value: 'croisades', label: 'Ponctuelle (lors des grandes croisades & campagnes)' },
		{ value: 'mensuelle', label: 'Régulière (1 à 2 week-ends par mois)' },
		{ value: 'hebdomadaire', label: 'Active (plusieurs heures chaque semaine)' },
		{ value: 'missionnaire', label: 'Volontariat à plein temps' }
	];

	function validate(): boolean {
		const newErrors: { [key: string]: string } = {};

		if (!fullName.trim()) {
			newErrors.fullName = 'Veuillez renseigner votre nom et prénom.';
		}
		if (!email.trim() || !email.includes('@')) {
			newErrors.email = 'Veuillez saisir une adresse email valide.';
		}
		if (!phone.trim() || phone.length < 8) {
			newErrors.phone = 'Veuillez fournir un numéro de téléphone ou WhatsApp valide.';
		}
		if (!city.trim()) {
			newErrors.city = 'Veuillez indiquer votre ville de résidence.';
		}
		if (!motivation.trim() || motivation.length < 15) {
			newErrors.motivation =
				'Veuillez partager quelques mots sur votre motivation (au moins 15 caractères).';
		}

		errors = newErrors;
		return Object.keys(newErrors).length === 0;
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();

		if (!validate()) {
			toast.error(
				'Veuillez compléter correctement les champs obligatoires.',
				'Formulaire incomplet'
			);
			return;
		}

		isSubmitting = true;

		// Simulation d'envoi serveur fluide
		await new Promise((resolve) => setTimeout(resolve, 800));

		isSubmitting = false;
		isSubmitted = true;

		toast.success(
			'Votre candidature bénévole a bien été transmise ! Notre équipe vous contactera très prochainement.',
			'Candidature envoyée avec succès'
		);
	}

	function resetForm() {
		fullName = '';
		email = '';
		phone = '';
		city = '';
		skills = '';
		motivation = '';
		isSubmitted = false;
		errors = {};
	}

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
			{ threshold: 0.1 }
		);

		observer.observe(sectionEl);

		return () => {
			observer.disconnect();
		};
	});
</script>

<section
	id="postuler"
	bind:this={sectionEl}
	class="bg-white py-16 sm:py-20 lg:py-28 {customClass}"
	aria-labelledby="join-application-heading"
>
	<Container>
		<div class="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-14 xl:gap-16">
			<!-- Colonne Gauche (5 colonnes) : Rassurance et explications -->
			<div
				class="transition-all duration-700 ease-out lg:col-span-5 {isVisible
					? 'translate-y-0 opacity-100'
					: 'translate-y-8 opacity-0'}"
			>
				<div class="mb-3 flex items-center gap-2.5">
					<span class="h-0.5 w-6 rounded-full bg-brand-primary" aria-hidden="true"></span>
					<span
						class="font-body text-xs font-bold tracking-wider text-brand-primary uppercase sm:text-sm"
					>
						FORMULAIRE DE CANDIDATURE
					</span>
				</div>

				<h2
					id="join-application-heading"
					class="font-display text-3xl leading-[1.2] font-extrabold tracking-tight text-text-primary sm:text-4xl"
				>
					Faites le pas, rejoignez les rangs des serviteurs
				</h2>

				<p class="mt-4 font-body text-sm leading-relaxed text-text-secondary sm:text-base">
					Remplissez ce formulaire pour nous faire part de vos compétences, de vos disponibilités et
					du pôle qui résonne le plus avec votre cœur.
				</p>

				<!-- 3 engagements de notre part -->
				<div class="mt-8 space-y-5 rounded-3xl border border-gray-100 bg-[#f8fafc] p-6 sm:p-7">
					<div class="flex items-start gap-3.5">
						<div
							class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-subtle text-brand-primary"
						>
							<HeartHandshake size={18} />
						</div>
						<div>
							<h4 class="font-body text-sm font-bold text-text-primary">Accueil personnalisé</h4>
							<p class="mt-0.5 font-body text-xs text-text-secondary">
								Un responsable prend contact avec vous sous 48h pour échanger sur vos motivations.
							</p>
						</div>
					</div>

					<div class="flex items-start gap-3.5">
						<div
							class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-subtle text-brand-primary"
						>
							<ShieldCheck size={18} />
						</div>
						<div>
							<h4 class="font-body text-sm font-bold text-text-primary">Orientation & Formation</h4>
							<p class="mt-0.5 font-body text-xs text-text-secondary">
								Chaque nouvel équipier reçoit une formation d'accueil adaptée aux réalités du
								terrain.
							</p>
						</div>
					</div>

					<div class="flex items-start gap-3.5">
						<div
							class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-subtle text-brand-primary"
						>
							<CheckCircle2 size={18} />
						</div>
						<div>
							<h4 class="font-body text-sm font-bold text-text-primary">
								Respect de vos disponibilités
							</h4>
							<p class="mt-0.5 font-body text-xs text-text-secondary">
								Votre engagement s’adapte à votre vie professionnelle, familiale et vos études.
							</p>
						</div>
					</div>
				</div>
			</div>

			<!-- Colonne Droite (7 colonnes) : Le Formulaire interactif -->
			<div
				class="transition-all duration-700 ease-out lg:col-span-7 {isVisible
					? 'translate-y-0 opacity-100'
					: 'translate-y-8 opacity-0'}"
				style="transition-delay: 150ms;"
			>
				<div
					class="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-[0_20px_50px_rgba(0,0,0,0.06)] sm:p-10"
				>
					{#if isSubmitted}
						<!-- Écran de confirmation après envoi -->
						<div class="flex flex-col items-center py-10 text-center">
							<div
								class="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 shadow-xs"
							>
								<CheckCircle2 size={36} />
							</div>
							<h3 class="font-display text-2xl font-bold text-text-primary sm:text-3xl">
								Merci infiniment, {fullName} !
							</h3>
							<p
								class="mt-3 max-w-md font-body text-sm leading-relaxed text-text-secondary sm:text-base"
							>
								Votre proposition d’engagement pour le pôle <strong class="text-text-primary"
									>{poleOptions.find((p) => p.value === poleChoice)?.label}</strong
								> a bien été enregistrée. Notre équipe de coordination va vous recontacter par WhatsApp
								ou téléphone.
							</p>
							<div class="mt-8">
								<Button variant="outline" size="md" onclick={resetForm}>
									Envoyer une autre candidature
								</Button>
							</div>
						</div>
					{:else}
						<!-- Formulaire interactif -->
						<form onsubmit={handleSubmit} class="space-y-5" novalidate>
							<div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
								<Input
									label="Nom complet"
									placeholder="Ex: Jean-Luc Mbarga"
									bind:value={fullName}
									error={errors.fullName}
									required
								/>
								<Input
									label="Email de contact"
									type="email"
									placeholder="Ex: jeanluc@example.com"
									bind:value={email}
									error={errors.email}
									required
								/>
							</div>

							<div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
								<Input
									label="Téléphone ou WhatsApp"
									type="tel"
									placeholder="Ex: +237 6XX XX XX XX"
									bind:value={phone}
									error={errors.phone}
									required
								/>
								<Input
									label="Ville / Région de résidence"
									placeholder="Ex: Douala, Yaoundé, Bafoussam..."
									bind:value={city}
									error={errors.city}
									required
								/>
							</div>

							<div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
								<Select
									label="Pôle d’engagement souhaité"
									options={poleOptions}
									bind:value={poleChoice}
									required
								/>
								<Select
									label="Votre disponibilité"
									options={availabilityOptions}
									bind:value={availability}
									required
								/>
							</div>

							<Input
								label="Métier ou compétences clés (facultatif)"
								placeholder="Ex: Médecin généraliste, Ingénieur son, Enseignant, Chauffeur..."
								bind:value={skills}
							/>

							<Textarea
								label="Vos motivations & votre parcours"
								placeholder="Dites-nous ce qui vous pousse à rejoindre l'aventure ECOFIP et comment vous aimeriez servir..."
								rows={4}
								bind:value={motivation}
								error={errors.motivation}
								required
							/>

							<div class="pt-3">
								<Button type="submit" variant="primary" size="lg" fullWidth loading={isSubmitting}>
									<Send size={18} class="mr-2" />
									<span>Envoyer ma candidature bénévole</span>
								</Button>
							</div>

							<p class="text-center font-body text-xs text-text-secondary">
								Vos données restent strictement confidentielles et ne sont utilisées que dans le
								cadre de votre engagement au sein du mouvement ECOFIP.
							</p>
						</form>
					{/if}
				</div>
			</div>
		</div>
	</Container>
</section>
