<script lang="ts">
	import {
		Calendar,
		Clock,
		MapPin,
		Users,
		Share2,
		ArrowLeft,
		CheckCircle2,
		ShieldCheck,
		HeartHandshake,
		Sparkles,
		MessageCircle,
		Copy,
		Check,
		ListChecks
	} from '@lucide/svelte';
	import Container from '$lib/design-system/components/Container.svelte';
	import FlipCountdown from '$lib/design-system/components/FlipCountdown.svelte';
	import LinkifiedText from '$lib/design-system/components/LinkifiedText.svelte';
	import Modal from '$lib/design-system/components/Modal.svelte';
	import { toast } from '$lib/design-system/toast.svelte.js';
	import type { PageData } from './$types.js';

	let { data }: { data: PageData } = $props();

	let event = $derived(data.event);

	interface ProgramStep {
		indexStr: string;
		title: string;
		description: string;
	}

	const parsedProgramSteps = $derived.by<ProgramStep[]>(() => {
		if (!event.program || !event.program.trim()) {
			return [
				{
					indexStr: '01',
					title: 'Accueil & Installation',
					description:
						"Ouverture des portes dès 1 heure avant le début officiel. Des équipes d'accueil sont à votre disposition."
				},
				{
					indexStr: '02',
					title: 'Louange & Prédication',
					description:
						'Temps fort d’adoration, proclamation puissante de la Parole de Dieu et ministère pour les besoins.'
				},
				{
					indexStr: '03',
					title: 'Communion & Distribution',
					description:
						'Distribution gratuite de bibles, entretiens spirituels personnalisés et actions de grâce.'
				}
			];
		}

		const lines = event.program
			.split('\n')
			.map((l) => l.trim())
			.filter(Boolean);

		return lines.map((line, idx) => {
			let cleanLine = line;
			const leadingNumMatch = cleanLine.match(/^(\d+)[\.\-\)]\s*(.*)$/);
			let customNum = '';
			if (leadingNumMatch) {
				customNum = String(leadingNumMatch[1]).padStart(2, '0');
				cleanLine = leadingNumMatch[2].trim();
			}

			const indexStr = customNum || String(idx + 1).padStart(2, '0');

			let title = cleanLine;
			let description = '';

			const colonIndex = cleanLine.indexOf(':');
			if (colonIndex !== -1) {
				title = cleanLine.slice(0, colonIndex).trim();
				description = cleanLine.slice(colonIndex + 1).trim();
			} else {
				const dashIndex = cleanLine.indexOf(' - ');
				if (dashIndex !== -1) {
					title = cleanLine.slice(0, dashIndex).trim();
					description = cleanLine.slice(dashIndex + 3).trim();
				}
			}

			return {
				indexStr,
				title,
				description
			};
		});
	});

	let isRegisterModalOpen = $state(false);
	let isSubmitting = $state(false);
	let attendeeName = $state('');
	let attendeePhone = $state('');
	let attendeeEmail = $state('');
	let attendeeCount = $state('1');
	let errors = $state<{ [key: string]: string }>({});

	let isCopied = $state(false);

	function copyEventLink() {
		if (typeof window !== 'undefined') {
			navigator.clipboard.writeText(window.location.href);
			isCopied = true;
			toast.success('Le lien de l’événement a été copié dans votre presse-papiers.');
			setTimeout(() => {
				isCopied = false;
			}, 2500);
		}
	}

	function shareOnWhatsApp() {
		if (typeof window !== 'undefined') {
			const text = encodeURIComponent(
				`Rejoignez-nous pour « ${event.title} » organisé par ECOFIP ! Infos et inscriptions : ${window.location.href}`
			);
			window.open(`https://wa.me/?text=${text}`, '_blank');
		}
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
			`Votre participation à « ${event.title} » a bien été enregistrée. Nous vous attendons avec joie !`,
			'Inscription confirmée'
		);

		attendeeName = '';
		attendeePhone = '';
		attendeeEmail = '';
		attendeeCount = '1';
	}
</script>

<svelte:head>
	<title>{event.title} — Événement ECOFIP</title>
	<meta name="description" content={event.description} />
	<meta property="og:title" content="{event.title} — ECOFIP" />
	<meta property="og:description" content={event.description} />
	<meta property="og:image" content={event.image} />
	<meta property="og:type" content="article" />
</svelte:head>

<div class="min-h-screen bg-[#f8fafc] pb-24">
	<!-- 1. FIL D'ARIANE & BANNIÈRE HAUTE -->
	<div class="border-b border-gray-200/80 bg-white">
		<Container>
			<div class="flex items-center justify-between py-4 text-xs font-semibold text-text-secondary">
				<a
					href="/nos-evenements"
					class="inline-flex items-center gap-1.5 text-brand-primary transition-colors hover:text-brand-primary-hover"
				>
					<ArrowLeft size={14} />
					<span>Tous les événements</span>
				</a>

				<div class="flex items-center gap-2">
					<button
						type="button"
						onclick={shareOnWhatsApp}
						class="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-emerald-800 transition-colors hover:bg-emerald-100"
					>
						<MessageCircle size={13} />
						<span class="hidden sm:inline">Partager WhatsApp</span>
					</button>

					<button
						type="button"
						onclick={copyEventLink}
						class="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-text-secondary transition-colors hover:bg-gray-50"
					>
						{#if isCopied}
							<Check size={13} class="text-emerald-600" />
							<span class="text-emerald-600">Lien copié</span>
						{:else}
							<Copy size={13} />
							<span class="hidden sm:inline">Copier le lien</span>
						{/if}
					</button>
				</div>
			</div>
		</Container>
	</div>

	<!-- 2. SECTION HAUTE : HERO DE L'ÉVÉNEMENT AVEC GRANDE IMAGE & COMPTE À REBOURS FLIP -->
	<section class="relative bg-[#070e17] py-12 text-white sm:py-16">
		<Container>
			<div class="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
				<!-- Grande Image en avant-plan -->
				<div class="lg:col-span-5">
					<div
						class="relative overflow-hidden rounded-3xl border border-white/15 bg-white/5 p-2 shadow-2xl"
					>
						<div class="relative h-72 w-full overflow-hidden rounded-2xl sm:h-96 md:h-[440px]">
							<img
								src={event.image}
								alt={event.imageAlt || event.title}
								class="h-full w-full object-cover"
							/>
							<div
								class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
							></div>

							<!-- Badge Date -->
							<div
								class="absolute top-4 left-4 flex flex-col items-center justify-center rounded-2xl border border-white/20 bg-black/75 px-4 py-2.5 text-center shadow-lg backdrop-blur-md"
							>
								<span class="font-display text-2xl leading-none font-black text-brand-accent">
									{event.dateDay}
								</span>
								<span class="mt-0.5 text-[10px] font-extrabold tracking-wider text-white uppercase">
									{event.dateMonth}
									{event.dateYear}
								</span>
							</div>

							<!-- Catégorie -->
							<div class="absolute top-4 right-4">
								<span
									class="rounded-full bg-brand-primary px-3 py-1 text-xs font-bold text-white uppercase shadow-md"
								>
									{event.categoryLabel}
								</span>
							</div>

							<!-- Lieu -->
							<div
								class="absolute inset-x-4 bottom-4 flex items-center justify-between text-xs text-white/90"
							>
								<div class="flex items-center gap-1.5 font-semibold">
									<MapPin size={15} class="text-brand-accent" />
									<span>{event.location}, {event.city}</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Titre & Compte à Rebours Flip Calendar -->
				<div class="flex flex-col justify-center lg:col-span-7">
					<div class="flex flex-wrap items-center gap-2">
						<span
							class="rounded-full bg-brand-primary px-3 py-0.5 text-xs font-bold text-white uppercase"
						>
							{event.categoryLabel}
						</span>
						{#if event.isFree}
							<span
								class="inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-950/60 px-3 py-0.5 text-xs font-bold text-emerald-300"
							>
								<ShieldCheck size={13} />
								<span>Entrée 100% Libre</span>
							</span>
						{/if}
						{#if event.isFeatured}
							<span
								class="inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-500/20 px-3 py-0.5 text-xs font-bold text-amber-300"
							>
								<Sparkles size={13} class="fill-amber-400" />
								<span>Événement à la Une</span>
							</span>
						{/if}
					</div>

					<h1
						class="mt-4 font-display text-3xl leading-tight font-black tracking-tight text-white sm:text-4xl lg:text-5xl"
					>
						{event.title}
					</h1>

					<!-- Lieu & Horaires -->
					<div class="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
						<div
							class="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-xs"
						>
							<div
								class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary/25 text-brand-accent"
							>
								<MapPin size={18} />
							</div>
							<div>
								<span class="block text-[10px] font-bold tracking-wider text-white/60 uppercase">
									Lieu
								</span>
								<span class="block font-body text-xs font-bold text-white sm:text-sm">
									{event.location}, {event.city}
								</span>
							</div>
						</div>

						<div
							class="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-xs"
						>
							<div
								class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary/25 text-brand-accent"
							>
								<Clock size={18} />
							</div>
							<div>
								<span class="block text-[10px] font-bold tracking-wider text-white/60 uppercase">
									Horaires
								</span>
								<span class="block font-body text-xs font-bold text-white sm:text-sm">
									{event.time}
								</span>
							</div>
						</div>
					</div>

					<!-- WIDGET COMPTE À REBOURS FLIP CALENDAR ÉLÉGANT -->
					<div
						class="mt-6 rounded-2xl border border-white/20 bg-white/95 p-4 text-slate-900 shadow-xl backdrop-blur-md sm:p-5"
					>
						<div class="mb-3 flex items-center justify-between border-b border-slate-200/80 pb-2">
							<span
								class="flex items-center gap-2 text-xs font-bold tracking-wider text-brand-primary uppercase"
							>
								<Clock size={14} class="animate-pulse" />
								<span>Compte à rebours officiel</span>
							</span>
							<span
								class="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700"
							>
								<span class="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500"></span>
								<span>Temps réel</span>
							</span>
						</div>

						<FlipCountdown
							targetDate={event.targetDate}
							size="detail"
							theme="light"
							showSummaryBanner={true}
						/>
					</div>

					<!-- Bouton d'action principal -->
					<div class="mt-8 flex flex-wrap items-center gap-4">
						<button
							type="button"
							onclick={() => (isRegisterModalOpen = true)}
							class="inline-flex cursor-pointer items-center gap-2.5 rounded-xl bg-brand-primary px-7 py-3.5 font-body text-base font-bold text-white shadow-lg transition-all hover:scale-[1.02] hover:bg-brand-primary-hover hover:shadow-xl"
						>
							<HeartHandshake size={18} />
							<span>Participer / S'inscrire gratuitement</span>
						</button>
					</div>
				</div>
			</div>
		</Container>
	</section>

	<!-- 3. CONTENU DÉTAILLÉ DE L'ÉVÉNEMENT -->
	<section class="py-12 sm:py-16">
		<Container>
			<div class="grid grid-cols-1 gap-12 lg:grid-cols-12">
				<!-- Colonne de gauche (8 cols) : Description avec liens cliquables, programme -->
				<div class="space-y-10 lg:col-span-8">
					<!-- Description complète -->
					<div class="rounded-3xl border border-gray-200/80 bg-white p-7 shadow-xs sm:p-10">
						<h2 class="font-display text-2xl font-bold text-text-primary">
							À propos de cet événement
						</h2>

						<div class="mt-6 space-y-4 text-sm leading-relaxed text-text-secondary sm:text-base">
							<LinkifiedText text={event.description} />
						</div>

						{#if event.speakers && event.speakers.length > 0}
							<div class="mt-8 border-t border-gray-100 pt-6">
								<div
									class="flex items-center gap-2 text-xs font-bold text-text-secondary uppercase"
								>
									<Users size={16} class="text-brand-primary" />
									<span>Intervenants & Orateurs</span>
								</div>
								<div class="mt-3 flex flex-wrap gap-2">
									{#each event.speakers as speaker}
										<span
											class="rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-1.5 text-xs font-bold text-text-primary"
										>
											{speaker}
										</span>
									{/each}
								</div>
							</div>
						{/if}
					</div>

					<!-- Programme indicatif / Déroulé -->
					<div class="rounded-3xl border border-gray-200/80 bg-white p-7 shadow-xs sm:p-10">
						<div class="flex items-center gap-2.5">
							<div
								class="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary"
							>
								<ListChecks size={18} />
							</div>
							<h3 class="font-display text-xl font-bold text-text-primary">
								Déroulement & Organisation
							</h3>
						</div>

						<div class="mt-6 space-y-4">
							{#each parsedProgramSteps as step}
								<div
									class="flex items-start gap-4 rounded-2xl border border-gray-100 bg-[#f8fafc] p-4 transition-colors hover:border-gray-200 hover:bg-slate-50/80"
								>
									<div
										class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary/10 font-mono text-sm font-bold text-brand-primary shadow-2xs"
									>
										{step.indexStr}
									</div>
									<div class="min-w-0 flex-1">
										<h4 class="text-sm font-bold text-text-primary">{step.title}</h4>
										{#if step.description}
											<p class="mt-1 text-xs leading-relaxed text-text-secondary">
												{step.description}
											</p>
										{/if}
									</div>
								</div>
							{/each}
						</div>
					</div>
				</div>

				<!-- Colonne de droite (4 cols) : Carte récapitulative & Infos pratiques -->
				<div class="space-y-6 lg:col-span-4">
					<div class="sticky top-24 rounded-3xl border border-gray-200/80 bg-white p-6 shadow-xs">
						<h3 class="font-display text-lg font-bold text-text-primary">Informations Pratiques</h3>

						<div class="mt-6 space-y-4 text-xs">
							<div class="flex items-start gap-3">
								<Calendar size={18} class="mt-0.5 shrink-0 text-brand-primary" />
								<div>
									<span class="block font-bold text-text-primary">Dates :</span>
									<span class="text-text-secondary"
										>{event.dateDay} {event.dateMonth} {event.dateYear}</span
									>
								</div>
							</div>

							<div class="flex items-start gap-3">
								<Clock size={18} class="mt-0.5 shrink-0 text-brand-primary" />
								<div>
									<span class="block font-bold text-text-primary">Horaires :</span>
									<span class="text-text-secondary">{event.time}</span>
								</div>
							</div>

							<div class="flex items-start gap-3">
								<MapPin size={18} class="mt-0.5 shrink-0 text-brand-primary" />
								<div>
									<span class="block font-bold text-text-primary">Lieu :</span>
									<span class="text-text-secondary">{event.location}, {event.city}</span>
								</div>
							</div>

							<div class="flex items-start gap-3">
								<ShieldCheck size={18} class="mt-0.5 shrink-0 text-emerald-600" />
								<div>
									<span class="block font-bold text-text-primary">Tarif :</span>
									<span class="font-semibold text-emerald-700">Entrée 100% Libre et Gratuite</span>
								</div>
							</div>
						</div>

						<div class="mt-8 border-t border-gray-100 pt-6">
							<button
								type="button"
								onclick={() => (isRegisterModalOpen = true)}
								class="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand-primary py-3 text-xs font-bold text-white shadow-xs transition-all hover:bg-brand-primary-hover hover:shadow-md"
							>
								<HeartHandshake size={16} />
								<span>S'inscrire à cet événement</span>
							</button>
						</div>
					</div>
				</div>
			</div>
		</Container>
	</section>
</div>

<!-- MODALE D'INSCRIPTION RAPIDE -->
<Modal
	bind:open={isRegisterModalOpen}
	title={`Inscription : ${event.title}`}
	description="Entrée libre et gratuite. Réservez votre place pour nous aider à calibrer la logistique et l'accueil."
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
				Date : <strong>{event.dateDay} {event.dateMonth} {event.dateYear}</strong> · Horaires :
				<strong>{event.time}</strong>
			</p>
		</div>

		<div>
			<label for="att-name" class="block text-xs font-bold text-text-primary">
				Nom complet *
			</label>
			<input
				id="att-name"
				type="text"
				bind:value={attendeeName}
				placeholder="Ex: Jean Paul Nguemo"
				required
				class="mt-1 h-10 w-full rounded-xl border border-gray-200 px-3 text-xs text-text-primary focus:border-brand-primary focus:outline-hidden"
			/>
			{#if errors.attendeeName}
				<p class="mt-1 text-[11px] font-semibold text-red-600">{errors.attendeeName}</p>
			{/if}
		</div>

		<div>
			<label for="att-phone" class="block text-xs font-bold text-text-primary">
				Numéro de téléphone / WhatsApp *
			</label>
			<input
				id="att-phone"
				type="tel"
				bind:value={attendeePhone}
				placeholder="Ex: +237 6 77 00 00 00"
				required
				class="mt-1 h-10 w-full rounded-xl border border-gray-200 px-3 text-xs text-text-primary focus:border-brand-primary focus:outline-hidden"
			/>
			{#if errors.attendeePhone}
				<p class="mt-1 text-[11px] font-semibold text-red-600">{errors.attendeePhone}</p>
			{/if}
		</div>

		<div>
			<label for="att-email" class="block text-xs font-bold text-text-primary">
				Adresse e-mail (facultatif)
			</label>
			<input
				id="att-email"
				type="email"
				bind:value={attendeeEmail}
				placeholder="Ex: jean.paul@example.com"
				class="mt-1 h-10 w-full rounded-xl border border-gray-200 px-3 text-xs text-text-primary focus:border-brand-primary focus:outline-hidden"
			/>
		</div>

		<div>
			<label for="att-count" class="block text-xs font-bold text-text-primary">
				Nombre de personnes
			</label>
			<select
				id="att-count"
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
				disabled={isSubmitting}
				class="rounded-xl bg-brand-primary px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-brand-primary-hover disabled:opacity-50"
			>
				{isSubmitting ? 'Validation...' : 'Confirmer mon inscription'}
			</button>
		</div>
	</form>
</Modal>
