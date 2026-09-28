<script lang="ts">
	import { page } from '$app/state';
	import { Heart, Menu, X, ChevronDown } from '@lucide/svelte';
	import Container from '../components/Container.svelte';
	import Modal from '../components/Modal.svelte';
	import Input from '../components/Input.svelte';
	import Button from '../components/Button.svelte';
	import { toast } from '../toast.svelte.js';

	let isScrolled = $state(false);
	let isMobileMenuOpen = $state(false);
	let isDonationModalOpen = $state(false);

	let isAboutDropdownOpen = $state(false);
	let isMobileAboutOpen = $state(true); // ouvert par défaut sur mobile pour la clarté

	let dropdownTimeout: ReturnType<typeof setTimeout> | null = null;

	function openAboutDropdown() {
		if (dropdownTimeout) {
			clearTimeout(dropdownTimeout);
			dropdownTimeout = null;
		}
		isAboutDropdownOpen = true;
	}

	function closeAboutDropdownWithDelay() {
		if (dropdownTimeout) {
			clearTimeout(dropdownTimeout);
		}
		dropdownTimeout = setTimeout(() => {
			isAboutDropdownOpen = false;
		}, 200);
	}

	// Sous-menu "À propos" épuré sans icônes
	const aboutSubLinks = [
		{
			label: 'Vision & Présentation',
			href: '/a-propos',
			description: 'Découvrez notre histoire, vision et valeurs bibliques'
		},
		{
			label: 'Projets & Missions',
			href: '/projets-missions',
			description: 'Nos actions d’évangélisation et d’aide sur le terrain'
		},
		{
			label: 'Nous rejoindre',
			href: '/nous-rejoindre',
			description: 'Engagez-vous comme bénévole, équipier ou donateur'
		}
	];

	function isLinkActive(href: string): boolean {
		const currentPath = page.url.pathname;
		if (href === '/') {
			return currentPath === '/';
		}
		return currentPath.startsWith(href);
	}

	function isAboutActive(): boolean {
		const currentPath = page.url.pathname;
		return (
			currentPath.startsWith('/a-propos') ||
			currentPath.startsWith('/projets-missions') ||
			currentPath.startsWith('/nous-rejoindre')
		);
	}
</script>

<svelte:window onscroll={() => (isScrolled = window.scrollY > 15)} />

<!-- Header fixé au scroll (Fixed at top) avec typographie agrandie et lisible -->
<header
	class="fixed top-0 right-0 left-0 z-50 h-20 transition-all duration-200 {isScrolled
		? 'border-b border-border bg-white/98 shadow-sm backdrop-blur-md'
		: 'border-b border-border/70 bg-white'}"
>
	<Container class="flex h-full items-center justify-between">
		<!-- Extrémité gauche : Logo ECOFIP épuré -->
		<div class="flex min-w-0 flex-1 items-center justify-start">
			<a
				href="/"
				class="group flex items-center gap-2.5 rounded-lg py-1 select-none focus-visible:outline-2 focus-visible:outline-brand-secondary"
			>
				<img
					src="/logo_ecofip.png"
					alt="Logo ECOFIP"
					class="h-9 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
					width="36"
					height="36"
				/>
				<span class="font-display text-xl font-black tracking-tight text-brand-primary sm:text-2xl">
					ECOFIP
				</span>
			</a>
		</div>

		<!-- Centre : Menu de navigation -->
		<nav
			class="hidden shrink-0 items-center justify-center gap-5 font-body lg:flex xl:gap-7"
			aria-label="Navigation principale"
		>
			<!-- Accueil -->
			<a
				href="/"
				aria-current={isLinkActive('/') ? 'page' : undefined}
				class="relative py-2 text-sm font-semibold transition-colors duration-150 xl:text-[15px] {isLinkActive(
					'/'
				)
					? 'font-bold text-brand-primary'
					: 'text-text-primary hover:text-brand-primary'}"
			>
				Accueil
				{#if isLinkActive('/')}
					<span
						class="absolute right-0 -bottom-2 left-0 h-[2.5px] rounded-full bg-brand-primary"
						aria-hidden="true"
					></span>
				{/if}
			</a>

			<!-- À propos avec Sous-menu déroulant (Dropdown) -->
			<div
				class="relative py-2"
				role="none"
				onmouseenter={openAboutDropdown}
				onmouseleave={closeAboutDropdownWithDelay}
			>
				<button
					type="button"
					aria-expanded={isAboutDropdownOpen}
					aria-haspopup="true"
					onclick={() => (isAboutDropdownOpen = !isAboutDropdownOpen)}
					class="relative inline-flex cursor-pointer items-center gap-1 rounded-sm py-1 text-sm font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-brand-secondary xl:text-[15px] {isAboutActive()
						? 'font-bold text-brand-primary'
						: 'text-text-primary hover:text-brand-primary'}"
				>
					<span>À propos</span>
					<ChevronDown
						size={15}
						class="transition-transform duration-200 {isAboutDropdownOpen
							? 'rotate-180 text-brand-primary'
							: 'text-text-secondary'}"
						aria-hidden="true"
					/>
					{#if isAboutActive()}
						<span
							class="absolute right-0 -bottom-2 left-0 h-[2.5px] rounded-full bg-brand-primary"
							aria-hidden="true"
						></span>
					{/if}
				</button>

				<!-- Panneau déroulant du sous-menu avec pont invisible anti-décrochage et sans icônes -->
				{#if isAboutDropdownOpen}
					<div
						role="menu"
						class="animate-in fade-in-0 zoom-in-95 absolute top-full left-1/2 z-50 w-72 -translate-x-1/2 pt-2 duration-150"
					>
						<div class="rounded-xl border border-border bg-white p-2 shadow-xl">
							{#each aboutSubLinks as sublink (sublink.href)}
								{@const active = isLinkActive(sublink.href)}
								<a
									href={sublink.href}
									role="menuitem"
									onclick={() => (isAboutDropdownOpen = false)}
									class="flex flex-col rounded-lg px-3.5 py-2.5 transition-colors duration-150 {active
										? 'bg-brand-subtle text-brand-primary'
										: 'text-text-primary hover:bg-surface'}"
								>
									<span
										class="text-sm font-bold {active ? 'text-brand-primary' : 'text-text-primary'}"
									>
										{sublink.label}
									</span>
									<span class="mt-0.5 text-xs leading-normal text-text-secondary">
										{sublink.description}
									</span>
								</a>
							{/each}
						</div>
					</div>
				{/if}
			</div>

			<!-- Nos événements -->
			<a
				href="/nos-evenements"
				aria-current={isLinkActive('/nos-evenements') ? 'page' : undefined}
				class="relative py-2 text-sm font-semibold transition-colors duration-150 xl:text-[15px] {isLinkActive(
					'/nos-evenements'
				)
					? 'font-bold text-brand-primary'
					: 'text-text-primary hover:text-brand-primary'}"
			>
				Nos événements
				{#if isLinkActive('/nos-evenements')}
					<span
						class="absolute right-0 -bottom-2 left-0 h-[2.5px] rounded-full bg-brand-primary"
						aria-hidden="true"
					></span>
				{/if}
			</a>

			<!-- Actualités (placé avant Galerie selon vos souhaits) -->
			<a
				href="/actualites"
				aria-current={isLinkActive('/actualites') ? 'page' : undefined}
				class="relative py-2 text-sm font-semibold transition-colors duration-150 xl:text-[15px] {isLinkActive(
					'/actualites'
				)
					? 'font-bold text-brand-primary'
					: 'text-text-primary hover:text-brand-primary'}"
			>
				Actualités
				{#if isLinkActive('/actualites')}
					<span
						class="absolute right-0 -bottom-2 left-0 h-[2.5px] rounded-full bg-brand-primary"
						aria-hidden="true"
					></span>
				{/if}
			</a>

			<!-- Galerie -->
			<a
				href="/galerie"
				aria-current={isLinkActive('/galerie') ? 'page' : undefined}
				class="relative py-2 text-sm font-semibold transition-colors duration-150 xl:text-[15px] {isLinkActive(
					'/galerie'
				)
					? 'font-bold text-brand-primary'
					: 'text-text-primary hover:text-brand-primary'}"
			>
				Galerie
				{#if isLinkActive('/galerie')}
					<span
						class="absolute right-0 -bottom-2 left-0 h-[2.5px] rounded-full bg-brand-primary"
						aria-hidden="true"
					></span>
				{/if}
			</a>

			<!-- Contact -->
			<a
				href="/contact"
				aria-current={isLinkActive('/contact') ? 'page' : undefined}
				class="relative py-2 text-sm font-semibold transition-colors duration-150 xl:text-[15px] {isLinkActive(
					'/contact'
				)
					? 'font-bold text-brand-primary'
					: 'text-text-primary hover:text-brand-primary'}"
			>
				Contact
				{#if isLinkActive('/contact')}
					<span
						class="absolute right-0 -bottom-2 left-0 h-[2.5px] rounded-full bg-brand-primary"
						aria-hidden="true"
					></span>
				{/if}
			</a>
		</nav>

		<!-- Extrémité droite : Bouton Faire un don & Menu Mobile -->
		<div class="flex flex-1 items-center justify-end gap-3">
			<!-- CTA Button Faire un don -->
			<button
				type="button"
				onclick={() => (isDonationModalOpen = true)}
				class="hidden cursor-pointer items-center gap-1.5 rounded-lg bg-brand-primary px-4 py-2 text-sm font-bold text-white shadow-xs transition-all duration-200 hover:bg-brand-primary-hover hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-secondary active:bg-[#a6000a] sm:inline-flex"
			>
				<Heart size={15} class="fill-white text-white" />
				<span>Faire un don</span>
			</button>

			<!-- Mobile Hamburger Button -->
			<button
				type="button"
				onclick={() => (isMobileMenuOpen = !isMobileMenuOpen)}
				aria-expanded={isMobileMenuOpen}
				aria-label={isMobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
				class="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-primary hover:bg-surface focus-visible:outline-2 focus-visible:outline-brand-secondary lg:hidden"
			>
				{#if isMobileMenuOpen}
					<X size={20} />
				{:else}
					<Menu size={20} />
				{/if}
			</button>
		</div>
	</Container>

	<!-- Mobile Navigation Drawer avec sous-menu déroulant et typographie large -->
	{#if isMobileMenuOpen}
		<div
			class="animate-in slide-in-from-top-2 fixed inset-x-0 top-20 max-h-[calc(100vh-5rem)] overflow-y-auto border-b border-border bg-white p-6 font-body shadow-xl duration-200 lg:hidden"
		>
			<nav class="flex flex-col gap-2" aria-label="Navigation mobile">
				<!-- Accueil -->
				<a
					href="/"
					onclick={() => (isMobileMenuOpen = false)}
					class="flex items-center justify-between rounded-lg p-3 text-base font-semibold transition-colors {isLinkActive(
						'/'
					)
						? 'bg-brand-subtle text-brand-primary'
						: 'text-text-primary hover:bg-surface'}"
				>
					<span>Accueil</span>
				</a>

				<!-- Accordéon À propos -->
				<div class="overflow-hidden rounded-lg border border-border/80">
					<button
						type="button"
						onclick={() => (isMobileAboutOpen = !isMobileAboutOpen)}
						class="flex w-full items-center justify-between bg-surface/40 p-3 text-base font-semibold text-text-primary hover:bg-surface"
					>
						<span>À propos</span>
						<ChevronDown
							size={18}
							class="transition-transform duration-200 {isMobileAboutOpen
								? 'rotate-180 text-brand-primary'
								: ''}"
						/>
					</button>

					{#if isMobileAboutOpen}
						<div class="flex flex-col border-t border-border/60 bg-white py-1">
							{#each aboutSubLinks as sublink (sublink.href)}
								<a
									href={sublink.href}
									onclick={() => (isMobileMenuOpen = false)}
									class="flex items-center justify-between px-4 py-2.5 text-base font-medium {isLinkActive(
										sublink.href
									)
										? 'bg-brand-subtle/50 font-bold text-brand-primary'
										: 'text-text-secondary hover:bg-surface hover:text-text-primary'}"
								>
									<span>{sublink.label}</span>
								</a>
							{/each}
						</div>
					{/if}
				</div>

				<!-- Nos événements -->
				<a
					href="/nos-evenements"
					onclick={() => (isMobileMenuOpen = false)}
					class="flex items-center justify-between rounded-lg p-3 text-base font-semibold transition-colors {isLinkActive(
						'/nos-evenements'
					)
						? 'bg-brand-subtle text-brand-primary'
						: 'text-text-primary hover:bg-surface'}"
				>
					<span>Nos événements</span>
				</a>

				<!-- Actualités -->
				<a
					href="/actualites"
					onclick={() => (isMobileMenuOpen = false)}
					class="flex items-center justify-between rounded-lg p-3 text-base font-semibold transition-colors {isLinkActive(
						'/actualites'
					)
						? 'bg-brand-subtle text-brand-primary'
						: 'text-text-primary hover:bg-surface'}"
				>
					<span>Actualités</span>
				</a>

				<!-- Galerie -->
				<a
					href="/galerie"
					onclick={() => (isMobileMenuOpen = false)}
					class="flex items-center justify-between rounded-lg p-3 text-base font-semibold transition-colors {isLinkActive(
						'/galerie'
					)
						? 'bg-brand-subtle text-brand-primary'
						: 'text-text-primary hover:bg-surface'}"
				>
					<span>Galerie</span>
				</a>

				<!-- Contact -->
				<a
					href="/contact"
					onclick={() => (isMobileMenuOpen = false)}
					class="flex items-center justify-between rounded-lg p-3 text-base font-semibold transition-colors {isLinkActive(
						'/contact'
					)
						? 'bg-brand-subtle text-brand-primary'
						: 'text-text-primary hover:bg-surface'}"
				>
					<span>Contact</span>
				</a>

				<!-- Bouton de Don Mobile -->
				<div class="mt-4 border-t border-border pt-4">
					<button
						type="button"
						onclick={() => {
							isMobileMenuOpen = false;
							isDonationModalOpen = true;
						}}
						class="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-primary py-3.5 text-base font-bold text-white shadow-md active:bg-[#a6000a]"
					>
						<Heart size={18} class="fill-white text-white" />
						<span>Faire un don maintenant</span>
					</button>
				</div>
			</nav>
		</div>
	{/if}
</header>

<!-- Modal de donation rapide -->
<Modal
	bind:open={isDonationModalOpen}
	title="Soutenez la mission ECOFIP"
	description="« Semez dans l'œuvre de Dieu pour annoncer l'Évangile à travers le Cameroun. »"
>
	<div class="space-y-5 py-2">
		<p class="text-base leading-relaxed text-text-secondary">
			Chaque contribution participe directement au déploiement des équipes sur le terrain et aux
			actions sociales d'aide humanitaire.
		</p>
		<div class="grid grid-cols-3 gap-3">
			<button
				type="button"
				class="cursor-pointer rounded-xl border-2 border-brand-primary bg-brand-subtle py-3 text-center text-base font-bold text-brand-primary transition-colors sm:text-lg"
			>
				10 000 FCFA
			</button>
			<button
				type="button"
				class="cursor-pointer rounded-xl border border-border bg-white py-3 text-center text-base font-semibold text-text-primary transition-colors hover:border-brand-primary/50 hover:bg-brand-subtle/30 sm:text-lg"
			>
				25 000 FCFA
			</button>
			<button
				type="button"
				class="cursor-pointer rounded-xl border border-border bg-white py-3 text-center text-base font-semibold text-text-primary transition-colors hover:border-brand-primary/50 hover:bg-brand-subtle/30 sm:text-lg"
			>
				50 000 FCFA
			</button>
		</div>
		<Input label="Autre montant libre (FCFA)" type="number" placeholder="Ex: 15 000" />
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
					'Merci infiniment ! Votre intention de don a été transmise avec succès.',
					'Don initié'
				);
			}}
		>
			<Heart size={18} class="mr-1.5 fill-white text-white" />
			Valider le don
		</Button>
	{/snippet}
</Modal>
