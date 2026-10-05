<script lang="ts">
	import { onMount } from 'svelte';
	import Container from '../components/Container.svelte';
	import Input from '../components/Input.svelte';
	import Select from '../components/Select.svelte';
	import Textarea from '../components/Textarea.svelte';
	import Checkbox from '../components/Checkbox.svelte';
	import Button from '../components/Button.svelte';
	import { toast } from '../toast.svelte.js';
	import {
		Send,
		CheckCircle2,
		ShieldCheck,
		Clock,
		MapPin,
		HeartHandshake,
		PhoneCall
	} from '@lucide/svelte';

	let {
		class: customClass = ''
	}: {
		class?: string;
	} = $props();

	let fullName = $state('');
	let email = $state('');
	let phone = $state('');
	let topic = $state('priere');
	let subject = $state('');
	let message = $state('');
	let callMeBack = $state(true);

	let isSubmitting = $state(false);
	let isSubmitted = $state(false);
	let errors = $state<{ [key: string]: string }>({});

	const topicOptions = [
		{ value: 'priere', label: 'Requête de prière & soutien pastoral confidentiel' },
		{ value: 'mission', label: 'Informations sur les croisades & missions de terrain' },
		{ value: 'partenariat', label: 'Partenariat d’église ou accueil d’une mission locale' },
		{ value: 'benevolat', label: 'Rejoindre une équipe bénévole' },
		{ value: 'don', label: 'Questions relatives aux dons & parrainages' },
		{ value: 'autre', label: 'Autre demande d’information' }
	];

	function validate(): boolean {
		const newErrors: { [key: string]: string } = {};

		if (!fullName.trim()) {
			newErrors.fullName = 'Veuillez saisir votre nom complet.';
		}
		if (!email.trim() || !email.includes('@')) {
			newErrors.email = 'Veuillez renseigner une adresse email valide.';
		}
		if (!subject.trim()) {
			newErrors.subject = 'Veuillez préciser le sujet de votre message.';
		}
		if (!message.trim() || message.length < 5) {
			newErrors.message = 'Veuillez écrire votre message.';
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
		await new Promise((resolve) => setTimeout(resolve, 800));
		isSubmitting = false;
		isSubmitted = true;

		toast.success(
			'Votre message a bien été transmis. Notre équipe vous répondra dans les plus brefs délais.',
			'Message envoyé avec succès'
		);
	}

	function resetForm() {
		fullName = '';
		email = '';
		phone = '';
		subject = '';
		message = '';
		callMeBack = true;
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
	id="formulaire"
	bind:this={sectionEl}
	class="bg-[#f8fafc] py-16 sm:py-20 lg:py-28 {customClass}"
	aria-labelledby="contact-form-heading"
>
	<Container>
		<div class="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-14 xl:gap-16">
			<!-- Colonne Gauche (5 colonnes) : Rassurance, Horaires & Permanence -->
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
						CONTACTEZ-NOUS
					</span>
				</div>

				<h2
					id="contact-form-heading"
					class="font-display text-3xl leading-[1.2] font-extrabold tracking-tight text-text-primary sm:text-4xl"
				>
					Envoyez-nous un message
				</h2>

				<p class="mt-4 font-body text-sm leading-relaxed text-text-secondary sm:text-base">
					Une question ? Une suggestion ? Besoin de prière ? N'hésitez pas à nous contacter. Nous
					serions ravis d'échanger avec vous !
				</p>

				<!-- Blocs d'engagements & Horaires -->
				<div
					class="mt-8 space-y-4 rounded-3xl border border-gray-200/80 bg-white p-6 shadow-xs sm:p-7"
				>
					<div class="flex items-start gap-3.5">
						<div
							class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-subtle text-brand-primary"
						>
							<ShieldCheck size={20} />
						</div>
						<div>
							<h4 class="font-body text-sm font-bold text-text-primary">
								Confidentialité Pastorale
							</h4>
							<p class="mt-0.5 font-body text-xs leading-relaxed text-text-secondary">
								Vos requêtes de prière et sujets personnels restent strictement confidentiels et ne
								sont partagés qu’avec le collège d’intercession.
							</p>
						</div>
					</div>

					<div class="flex items-start gap-3.5 border-t border-gray-100 pt-4">
						<div
							class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-subtle text-brand-primary"
						>
							<Clock size={20} />
						</div>
						<div>
							<h4 class="font-body text-sm font-bold text-text-primary">
								Disponibilité des Bureaux
							</h4>
							<p class="mt-0.5 font-body text-xs leading-relaxed text-text-secondary">
								Du lundi au vendredi de 08h30 à 17h00. Permanence d’urgence téléphonique disponible
								7j/7 pour les temps de crise.
							</p>
						</div>
					</div>

					<div class="flex items-start gap-3.5 border-t border-gray-100 pt-4">
						<div
							class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-subtle text-brand-primary"
						>
							<PhoneCall size={20} />
						</div>
						<div>
							<h4 class="font-body text-sm font-bold text-text-primary">Rappel Personnalisé</h4>
							<p class="mt-0.5 font-body text-xs leading-relaxed text-text-secondary">
								Un membre de notre équipe prendra contact avec vous rapidement par téléphone,
								WhatsApp ou email.
							</p>
						</div>
					</div>
				</div>
			</div>

			<!-- Colonne Droite (7 colonnes) : Le Formulaire Interactif -->
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
								Merci, {fullName} !
							</h3>
							<p
								class="mt-3 max-w-md font-body text-sm leading-relaxed text-text-secondary sm:text-base"
							>
								Votre message concernant « <strong class="text-text-primary">{subject}</strong> » a
								bien été transmis. Nous vous répondrons à l’adresse
								<span class="font-semibold text-brand-primary">{email}</span>.
							</p>
							<div class="mt-8">
								<Button variant="outline" size="md" onclick={resetForm}>
									Envoyer un autre message
								</Button>
							</div>
						</div>
					{:else}
						<!-- Formulaire interactif -->
						<form onsubmit={handleSubmit} class="space-y-5" novalidate>
							<div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
								<Input
									label="Nom complet *"
									placeholder="Ex: Samuel Eboa"
									bind:value={fullName}
									error={errors.fullName}
									required
								/>
								<Input
									label="Email *"
									type="email"
									placeholder="Ex: samuel@example.com"
									bind:value={email}
									error={errors.email}
									required
								/>
							</div>

							<Input
								label="Sujet *"
								placeholder="Ex: Demande de renseignement, requête, etc."
								bind:value={subject}
								error={errors.subject}
								required
							/>

							<Textarea
								label="Message *"
								placeholder="Votre message..."
								rows={5}
								bind:value={message}
								error={errors.message}
								required
							/>

							<div class="pt-3">
								<Button type="submit" variant="primary" size="lg" fullWidth loading={isSubmitting}>
									<Send size={18} class="mr-2" />
									<span>Envoyer le message</span>
								</Button>
							</div>

							<p class="text-center font-body text-xs text-text-secondary">
								En soumettant ce formulaire, vous acceptez que les informations saisies soient
								utilisées par ECOFIP pour vous recontacter.
							</p>
						</form>
					{/if}
				</div>
			</div>
		</div>
	</Container>
</section>
