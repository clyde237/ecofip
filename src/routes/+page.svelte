<script lang="ts">
	import {
		Button,
		Link,
		Card,
		Container,
		Input,
		Textarea,
		Select,
		Checkbox,
		RadioGroup,
		Avatar,
		Alert,
		Modal,
		toast,
		Hero
	} from '$lib';
	import { FileText, User, Bell } from '@lucide/svelte';

	// État pour tester les composants
	let isModalOpen = $state(false);

	// États du formulaire de test
	let testName = $state('Emmanuel Koffi');
	let testEmail = $state('');
	let testRole = $state('donateur');
	let testMessage = $state('Je souhaite m’engager activement auprès de votre mission.');
	let testConsent = $state(true);
	let testRadio = $state('mensuel');

	const roleOptions = [
		{ value: 'benevole', label: 'Bénévole sur le terrain' },
		{ value: 'donateur', label: 'Donateur partenaire' },
		{ value: 'pasteur', label: 'Responsable d’église' }
	];

	const donationFrequencyOptions = [
		{
			value: 'ponctuel',
			label: 'Don ponctuel',
			description: 'Soutien direct à une action spécifique'
		},
		{
			value: 'mensuel',
			label: 'Don mensuel régulier',
			description: 'Assure la continuité de nos missions humanitaires'
		}
	];

	function triggerToast(type: 'success' | 'warning' | 'danger' | 'info') {
		if (type === 'success') {
			toast.success('Votre inscription au programme a été enregistrée avec succès.', 'Succès');
		} else if (type === 'warning') {
			toast.warning('Veuillez vérifier les informations de votre profil.', 'Attention');
		} else if (type === 'danger') {
			toast.error('Impossible de se connecter au serveur distant.', 'Erreur technique');
		} else {
			toast.info('Nouvelle mise à jour disponible sur le portail.', 'Information');
		}
	}
</script>

<svelte:head>
	<title>ECOFIP Design System — v1.0 (Phase 1 & Phase 2)</title>
	<meta
		name="description"
		content="Documentation interactive et composants du Design System ECOFIP v1.0"
	/>
</svelte:head>

<div class="pb-16">
	<!-- Hero Pattern officiel ECOFIP -->
	<Hero />

	<main class="mt-12 space-y-16">
		<!-- 1. Form Controls (Input, Textarea, Select, Checkbox, Radio) -->
		<section id="forms">
			<Container>
				<div class="mb-6 flex items-center justify-between border-b border-border pb-4">
					<div class="flex items-center gap-2">
						<FileText class="text-brand-secondary" size={22} />
						<h2 class="font-display text-2xl font-bold text-text-primary">
							1. Form Controls (Sections 16, 17, 18, 19)
						</h2>
					</div>
					<span class="text-sm font-medium text-text-secondary"
						>Focus #1559EF & Validation WCAG</span
					>
				</div>

				<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
					<!-- Form Elements Demo -->
					<Card variant="standard" padding="lg">
						<h3 class="mb-4 font-display text-lg font-bold text-text-primary">
							Champs de saisie & Sélection
						</h3>

						<div class="space-y-4">
							<Input
								label="Nom complet"
								required
								bind:value={testName}
								placeholder="Ex: Jean Dupont"
								helperText="Nom tel qu'il apparaîtra sur vos reçus fiscaux."
							/>

							<Input
								label="Adresse email avec erreur"
								type="email"
								bind:value={testEmail}
								placeholder="email@exemple.com"
								error="Veuillez renseigner une adresse email valide."
							/>

							<Select
								label="Rôle dans la mission"
								options={roleOptions}
								bind:value={testRole}
								helperText="Permet d'adapter les communications envoyées."
							/>

							<Textarea
								label="Message ou intention de prière"
								bind:value={testMessage}
								rows={3}
								placeholder="Partagez votre message..."
							/>
						</div>
					</Card>

					<!-- Checkbox & RadioGroup Demo -->
					<Card variant="standard" padding="lg">
						<h3 class="mb-4 font-display text-lg font-bold text-text-primary">
							Choix multiples & Sélecteurs
						</h3>

						<div class="space-y-6">
							<RadioGroup
								name="donation-frequency"
								label="Fréquence de soutien"
								options={donationFrequencyOptions}
								bind:value={testRadio}
							/>

							<div class="space-y-3 border-t border-border pt-4">
								<Checkbox
									label="Recevoir la lettre de nouvelles mensuelle"
									description="Restez informé des témoignages et avancées de nos équipes terrain."
									bind:checked={testConsent}
								/>
								<Checkbox
									label="Option désactivée d'exemple"
									description="Ce champ n'est pas modifiable pour le moment."
									disabled
								/>
							</div>
						</div>
					</Card>
				</div>
			</Container>
		</section>

		<!-- 2. Feedback (Alerts, Toast, Modal) -->
		<section id="feedback">
			<Container>
				<div class="mb-6 flex items-center justify-between border-b border-border pb-4">
					<div class="flex items-center gap-2">
						<Bell class="text-brand-accent" size={22} />
						<h2 class="font-display text-2xl font-bold text-text-primary">
							2. Retours Utilisateur (Alerts, Toasts, Modal)
						</h2>
					</div>
					<span class="text-sm font-medium text-text-secondary">Sections 25, 26, 27</span>
				</div>

				<div class="space-y-6">
					<!-- Alerts Grid -->
					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						<Alert variant="success" title="Mission accomplie">
							Votre don a bien été réceptionné. Un reçu fiscal vous sera délivré sous 48h.
						</Alert>

						<Alert variant="info" title="Information importante">
							La prochaine conférence des bénévoles débutera ce samedi à 14h00 UTC.
						</Alert>

						<Alert variant="warning" title="Période de maintenance" dismissible>
							Le module de téléversement des rapports sera indisponible cette nuit entre 02h et 04h.
						</Alert>

						<Alert variant="danger" title="Accréditation requise" dismissible>
							Vous devez valider vos informations de coordinateur pour accéder à cette zone.
						</Alert>
					</div>

					<!-- Toast Triggers -->
					<Card variant="standard" padding="lg">
						<div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
							<div>
								<h3 class="font-display text-lg font-bold text-text-primary">
									Système de Toasts réactifs (Section 27)
								</h3>
								<p class="text-sm text-text-secondary">
									Notifications temporaires non bloquantes avec auto-dismiss (3.5 secondes).
								</p>
							</div>
							<div class="flex flex-wrap items-center gap-2">
								<Button variant="outline" size="sm" onclick={() => triggerToast('success')}>
									Toast Succès
								</Button>
								<Button variant="outline" size="sm" onclick={() => triggerToast('info')}>
									Toast Info
								</Button>
								<Button variant="outline" size="sm" onclick={() => triggerToast('warning')}>
									Toast Warning
								</Button>
								<Button variant="outline" size="sm" onclick={() => triggerToast('danger')}>
									Toast Erreur
								</Button>
							</div>
						</div>
					</Card>
				</div>
			</Container>
		</section>

		<!-- 3. Avatar, Links & Buttons -->
		<section>
			<Container>
				<div class="mb-6 flex items-center justify-between border-b border-border pb-4">
					<div class="flex items-center gap-2">
						<User class="text-brand-primary" size={22} />
						<h2 class="font-display text-2xl font-bold text-text-primary">
							3. Avatars & Liens (Sections 14, 24)
						</h2>
					</div>
					<span class="text-sm font-medium text-text-secondary"
						>Initiales dynamiques & Typologie de liens</span
					>
				</div>

				<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
					<!-- Avatars -->
					<Card variant="standard" padding="lg">
						<h3 class="mb-2 font-display text-lg font-bold text-text-primary">Composant Avatar</h3>
						<p class="mb-6 text-sm text-text-secondary">
							Tailles normalisées : XS (28px), SM (36px), MD (44px), LG (64px), XL (96px).
						</p>

						<div class="flex items-end gap-4">
							<div class="flex flex-col items-center gap-2">
								<Avatar size="xs" name="Marie Claire" />
								<span class="text-xs font-semibold text-text-disabled">XS</span>
							</div>
							<div class="flex flex-col items-center gap-2">
								<Avatar size="sm" name="David Ndong" />
								<span class="text-xs font-semibold text-text-disabled">SM</span>
							</div>
							<div class="flex flex-col items-center gap-2">
								<Avatar size="md" name="Pasteur Paul" />
								<span class="text-xs font-semibold text-text-disabled">MD</span>
							</div>
							<div class="flex flex-col items-center gap-2">
								<Avatar size="lg" name="Sarah Koné" />
								<span class="text-xs font-semibold text-text-disabled">LG</span>
							</div>
							<div class="flex flex-col items-center gap-2">
								<Avatar size="xl" name="Emmanuel Koffi" />
								<span class="text-xs font-semibold text-text-disabled">XL</span>
							</div>
						</div>
					</Card>

					<!-- Links -->
					<Card variant="standard" padding="lg">
						<h3 class="mb-2 font-display text-lg font-bold text-text-primary">Composant Link</h3>
						<p class="mb-6 text-sm text-text-secondary">
							Support des états actifs en rouge ECOFIP, liens internes et liens externes sécurisés.
						</p>

						<div class="space-y-4">
							<div class="flex items-center gap-4 text-base">
								<Link href="#active" variant="navigation" active>Navigation Active</Link>
								<Link href="#inactive" variant="navigation">Navigation Standard</Link>
							</div>

							<div class="text-base">
								<Link href="#details" variant="inline">
									Lien éditorial en ligne avec soulignement
								</Link>
							</div>

							<div class="text-base">
								<Link href="https://svelte.dev" variant="navigation" external>
									Documentation SvelteKit officielle
								</Link>
							</div>
						</div>
					</Card>
				</div>
			</Container>
		</section>
	</main>
</div>

<!-- Modal Interactive Demo -->
<Modal
	bind:open={isModalOpen}
	title="Faire un don à la mission ECOFIP"
	description="Votre générosité permet de financer les projets d'aide et d'évangélisation."
>
	<div class="space-y-5 py-2">
		<p class="text-base text-text-primary">
			Sélectionnez le projet que vous souhaitez soutenir en priorité :
		</p>
		<div class="grid grid-cols-2 gap-3">
			<div class="rounded-xl border-2 border-brand-primary bg-brand-subtle p-3.5 text-center">
				<div class="text-sm font-bold text-brand-primary">Missions Médicales</div>
				<div class="mt-1 text-xs text-text-secondary">Équipements et soins</div>
			</div>
			<div
				class="cursor-pointer rounded-xl border border-border bg-white p-3.5 text-center hover:border-brand-primary/50"
			>
				<div class="text-sm font-bold text-text-primary">Éducation & Écoles</div>
				<div class="mt-1 text-xs text-text-secondary">Fournitures scolaires</div>
			</div>
		</div>
		<Input label="Montant du don (€)" type="number" placeholder="50" required />
	</div>

	{#snippet actions()}
		<Button variant="outline" size="md" onclick={() => (isModalOpen = false)}>Annuler</Button>
		<Button
			variant="primary"
			size="md"
			onclick={() => {
				isModalOpen = false;
				toast.success('Votre promesse de don a été validée avec succès !', 'Merci');
			}}
		>
			Confirmer le don
		</Button>
	{/snippet}
</Modal>
