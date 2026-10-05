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
		selectedPole = $bindable('evangelisation'),
		class: customClass = ''
	}: {
		selectedPole?: string;
		class?: string;
	} = $props();

	let fullName = $state('');
	let email = $state('');
	let phone = $state('');
	let department = $state(selectedPole || 'evangelisation');
	let engagementType = $state('terrain');
	let message = $state('');

	let isSubmitting = $state(false);
	let isSubmitted = $state(false);
	let errors = $state<{ [key: string]: string }>({});

	// Synchroniser si le parent modifie le département sélectionné
	$effect(() => {
		if (selectedPole) {
			department = selectedPole;
		}
	});

	const departmentOptions = [
		{ value: 'evangelisation', label: 'Évangélisation' },
		{ value: 'intercession', label: 'Intercession' },
		{ value: 'logistique', label: 'Logistique' },
		{ value: 'multimedia', label: 'Multimédia' },
		{ value: 'action-sociale', label: 'Action sociale' },
		{ value: 'formation', label: 'Formation' }
	];

	const engagementOptions = [
		{ value: 'terrain', label: 'Missionnaire de terrain' },
		{ value: 'occasionnel', label: 'Bénévole occasionnel' },
		{ value: 'partenaire', label: 'Partenaire financier' },
		{ value: 'intercesseur', label: 'Intercesseur' }
	];

	function validate(): boolean {
		const newErrors: { [key: string]: string } = {};

		if (!fullName.trim()) {
			newErrors.fullName = 'Veuillez renseigner votre nom complet.';
		}
		if (!email.trim() || !email.includes('@')) {
			newErrors.email = 'Veuillez saisir une adresse email valide.';
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
			'Votre demande a bien été envoyée ! Notre équipe vous contactera très rapidement.',
			'Demande transmise avec succès'
		);
	}

	function resetForm() {
		fullName = '';
		email = '';
		phone = '';
		department = 'evangelisation';
		engagementType = 'terrain';
		message = '';
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
						REJOINDRE L'ÉQUIPE
					</span>
				</div>

				<h2
					id="join-application-heading"
					class="font-display text-3xl leading-[1.2] font-extrabold tracking-tight text-text-primary sm:text-4xl"
				>
					Exprimez votre intérêt
				</h2>

				<p class="mt-4 font-body text-sm leading-relaxed text-text-secondary sm:text-base">
					Remplissez ce formulaire et nous vous contacterons rapidement.
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
								Chaque équipier reçoit un accompagnement adapté aux réalités du terrain
								missionnaire.
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
								Votre engagement s’adapte à votre disponibilité, votre vie de famille et vos
								compétences.
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
								Votre intérêt pour le département <strong class="text-text-primary"
									>{departmentOptions.find((p) => p.value === department)?.label}</strong
								> a bien été enregistré. Notre équipe de coordination vous contactera très rapidement.
							</p>
							<div class="mt-8">
								<Button variant="outline" size="md" onclick={resetForm}>
									Envoyer une autre demande
								</Button>
							</div>
						</div>
					{:else}
						<!-- Formulaire interactif -->
						<form onsubmit={handleSubmit} class="space-y-5" novalidate>
							<div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
								<Input
									label="Nom complet *"
									placeholder="Ex: Jean-Luc Mbarga"
									bind:value={fullName}
									error={errors.fullName}
									required
								/>
								<Input
									label="Email *"
									type="email"
									placeholder="Ex: jeanluc@example.com"
									bind:value={email}
									error={errors.email}
									required
								/>
							</div>

							<div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
								<Input
									label="Téléphone"
									type="tel"
									placeholder="Ex: +237 6XX XX XX XX"
									bind:value={phone}
								/>
								<Select
									label="Département d'intérêt"
									options={departmentOptions}
									bind:value={department}
									required
								/>
							</div>

							<Select
								label="Type d'engagement"
								options={engagementOptions}
								bind:value={engagementType}
								required
							/>

							<Textarea
								label="Message"
								placeholder="Partagez-nous vos motivations, questions ou disponibilités..."
								rows={4}
								bind:value={message}
							/>

							<div class="pt-3">
								<Button type="submit" variant="primary" size="lg" fullWidth loading={isSubmitting}>
									<Send size={18} class="mr-2" />
									<span>Envoyer ma demande</span>
								</Button>
							</div>

							<p class="text-center font-body text-xs text-text-secondary">
								Vos données restent strictement confidentielles et ne sont utilisées que dans le
								cadre des activités de la mission ECOFIP.
							</p>
						</form>
					{/if}
				</div>
			</div>
		</div>
	</Container>
</section>
