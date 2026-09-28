<script lang="ts">
	import { MapPin, Phone, Mail } from '@lucide/svelte';
	import Container from '../components/Container.svelte';
	import { toast } from '../toast.svelte.js';

	let newsletterEmail = $state('');
	let isSubmitting = $state(false);

	// Liens rapides alignés avec la nouvelle arborescence
	const quickLinks = [
		{ label: 'Accueil', href: '/' },
		{ label: 'À propos', href: '/a-propos' },
		{ label: 'Projets & Missions', href: '/projets-missions' },
		{ label: 'Nos événements', href: '/nos-evenements' },
		{ label: 'Actualités', href: '/actualites' },
		{ label: 'Galerie', href: '/galerie' },
		{ label: 'Nous rejoindre', href: '/nous-rejoindre' },
		{ label: 'Contact', href: '/contact' }
	];

	function handleNewsletter(event: Event) {
		event.preventDefault();
		if (!newsletterEmail || !newsletterEmail.includes('@')) {
			toast.error('Veuillez saisir une adresse email valide.', 'Newsletter');
			return;
		}

		isSubmitting = true;
		setTimeout(() => {
			isSubmitting = false;
			toast.success(
				'Merci ! Votre inscription à la newsletter missionnaire a été enregistrée.',
				'Inscription réussie'
			);
			newsletterEmail = '';
		}, 600);
	}
</script>

<footer
	class="bg-brand-primary font-body text-white selection:bg-white selection:text-brand-primary"
>
	<Container class="pt-16 pb-10">
		<!-- Top 4 Columns Grid avec typographie renforcée et lisible -->
		<div class="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-10">
			<!-- Column 1: Brand & Presentation -->
			<div class="flex flex-col gap-5">
				<!-- White card container for logo -->
				<div class="flex h-24 w-40 items-center justify-center rounded-xl bg-white p-3 shadow-md">
					<img
						src="/logo_ecofip.png"
						alt="Logo officiel ECOFIP"
						class="h-full w-auto object-contain"
						width="140"
						height="80"
					/>
				</div>

				<p class="max-w-xs text-base leading-relaxed font-normal text-white/95">
					Les Économes Fidèles et Prudents — annoncer l'Évangile à travers tout le Cameroun pour la
					gloire de Dieu.
				</p>

				<!-- Social Networks Circular Outlines -->
				<div class="mt-1 flex items-center gap-3">
					<a
						href="https://facebook.com"
						target="_blank"
						rel="noopener noreferrer"
						aria-label="Facebook ECOFIP"
						class="flex h-9 w-9 items-center justify-center rounded-full border border-white/60 text-white transition-all hover:border-white hover:bg-white hover:text-brand-primary focus-visible:outline-2 focus-visible:outline-white"
					>
						<svg class="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
							<path
								d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"
							/>
						</svg>
					</a>

					<a
						href="https://instagram.com"
						target="_blank"
						rel="noopener noreferrer"
						aria-label="Instagram ECOFIP"
						class="flex h-9 w-9 items-center justify-center rounded-full border border-white/60 text-white transition-all hover:border-white hover:bg-white hover:text-brand-primary focus-visible:outline-2 focus-visible:outline-white"
					>
						<svg
							class="h-4 w-4 fill-none stroke-current"
							viewBox="0 0 24 24"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							aria-hidden="true"
						>
							<rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
							<path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
							<line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
						</svg>
					</a>

					<a
						href="https://youtube.com"
						target="_blank"
						rel="noopener noreferrer"
						aria-label="Chaîne YouTube ECOFIP"
						class="flex h-9 w-9 items-center justify-center rounded-full border border-white/60 text-white transition-all hover:border-white hover:bg-white hover:text-brand-primary focus-visible:outline-2 focus-visible:outline-white"
					>
						<svg class="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
							<path
								d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
							/>
						</svg>
					</a>

					<a
						href="/actualites/podcast"
						aria-label="Podcast et Radio ECOFIP"
						class="flex h-9 w-9 items-center justify-center rounded-full border border-white/60 text-white transition-all hover:border-white hover:bg-white hover:text-brand-primary focus-visible:outline-2 focus-visible:outline-white"
					>
						<svg
							class="h-4 w-4 fill-none stroke-current"
							viewBox="0 0 24 24"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							aria-hidden="true"
						>
							<path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9" />
							<path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5" />
							<circle cx="12" cy="12" r="2" />
							<path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5" />
							<path d="M19.1 4.9C23 8.8 23 15.1 19.1 19" />
						</svg>
					</a>
				</div>
			</div>

			<!-- Column 2: Liens rapides -->
			<div>
				<h3 class="mb-5 text-lg font-bold tracking-wide text-white">Liens rapides</h3>
				<ul class="flex flex-col space-y-3 text-base text-white/90">
					{#each quickLinks as link (link.href)}
						<li>
							<a
								href={link.href}
								class="font-medium transition-colors hover:text-white hover:underline focus-visible:outline-2 focus-visible:outline-white"
							>
								{link.label}
							</a>
						</li>
					{/each}
				</ul>
			</div>

			<!-- Column 3: Contact -->
			<div>
				<h3 class="mb-5 text-lg font-bold tracking-wide text-white">Contact</h3>
				<ul class="flex flex-col space-y-4 text-base text-white/95">
					<li class="flex items-start gap-3.5">
						<MapPin size={20} class="mt-0.5 shrink-0 text-white" aria-hidden="true" />
						<span class="font-medium">Bafoussam, Cameroun</span>
					</li>
					<li class="flex items-center gap-3.5">
						<Phone size={20} class="shrink-0 text-white" aria-hidden="true" />
						<a
							href="tel:+237698352037"
							class="font-medium hover:text-white hover:underline focus-visible:outline-2 focus-visible:outline-white"
						>
							+237 698 352 037
						</a>
					</li>
					<li class="flex items-center gap-3.5">
						<Mail size={20} class="shrink-0 text-white" aria-hidden="true" />
						<a
							href="mailto:contact@ecofip.cm"
							class="font-medium hover:text-white hover:underline focus-visible:outline-2 focus-visible:outline-white"
						>
							contact@ecofip.cm
						</a>
					</li>
				</ul>
			</div>

			<!-- Column 4: Newsletter Missionnaire -->
			<div>
				<h3 class="mb-2 text-lg font-bold tracking-wide text-white">Newsletter Missionnaire</h3>
				<p class="mb-4 text-base leading-relaxed font-medium text-white/95">
					Recevez nos actualités et témoignages
				</p>

				<form onsubmit={handleNewsletter} class="flex items-center">
					<input
						type="email"
						bind:value={newsletterEmail}
						placeholder="Votre email"
						required
						aria-label="Adresse email pour la newsletter"
						class="h-12 w-full rounded-l-lg border-0 bg-white px-4 text-base text-text-primary placeholder:text-text-disabled focus:outline-none"
					/>
					<button
						type="submit"
						disabled={isSubmitting}
						class="h-12 cursor-pointer rounded-r-lg border-2 border-white bg-brand-primary px-6 text-base font-bold tracking-wider text-white uppercase transition-colors hover:bg-brand-primary-hover active:bg-[#a6000a] disabled:opacity-50"
					>
						OK
					</button>
				</form>
			</div>
		</div>

		<!-- Bottom Bar / Legal & Copyright -->
		<div
			class="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/20 pt-7 text-sm text-white/85 sm:flex-row"
		>
			<p class="font-medium">© 2026 ECOFIP. Tous droits réservés. | Cameroun pour Jésus</p>
			<div class="flex items-center gap-6 font-medium">
				<a href="/mentions-legales" class="hover:text-white hover:underline"> Mentions légales </a>
				<a href="/politique-de-confidentialite" class="hover:text-white hover:underline">
					Politique de confidentialité
				</a>
			</div>
		</div>
	</Container>
</footer>
