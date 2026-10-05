<script lang="ts">
	import { onMount } from 'svelte';
	import Container from '../components/Container.svelte';
	import { MapPin, Phone, Mail, MessageSquare, ArrowUpRight } from '@lucide/svelte';

	let { class: customClass = '' }: { class?: string } = $props();

	let sectionEl: HTMLElement | null = $state(null);
	let isVisible = $state(false);

	const coordinates = [
		{
			id: 'adresse',
			title: 'Adresse',
			icon: MapPin,
			lines: ['Quartier Tamja', 'Bafoussam, Cameroun'],
			linkText: 'Voir sur la carte',
			linkHref: '#localisation',
			accent: 'bg-brand-subtle text-brand-primary border-brand-primary/20'
		},
		{
			id: 'telephone',
			title: 'Téléphone / WhatsApp',
			icon: Phone,
			lines: ['+237 698 352 037', '+237 690 172 939'],
			linkText: 'Appeler maintenant',
			linkHref: 'tel:+237698352037',
			accent: 'bg-emerald-50 text-emerald-700 border-emerald-200'
		},
		{
			id: 'email',
			title: 'Email',
			icon: Mail,
			lines: ['contact@ecofip.cm', 'info@ecofip.cm'],
			linkText: 'Écrire un email',
			linkHref: 'mailto:contact@ecofip.cm',
			accent: 'bg-amber-50 text-amber-800 border-amber-200'
		}
	];

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
	id="coordonnees"
	bind:this={sectionEl}
	class="border-t border-gray-100 bg-white py-16 sm:py-20 lg:py-24 {customClass}"
	aria-labelledby="contact-coordinates-heading"
>
	<Container>
		<!-- En-tête centré -->
		<div
			class="mx-auto max-w-3xl text-center transition-all duration-700 ease-out {isVisible
				? 'translate-y-0 opacity-100'
				: 'translate-y-8 opacity-0'}"
		>
			<div class="mb-3 inline-flex items-center gap-2">
				<span class="h-0.5 w-6 rounded-full bg-brand-primary" aria-hidden="true"></span>
				<span
					class="font-body text-xs font-bold tracking-wider text-brand-primary uppercase sm:text-sm"
				>
					NOS COORDONNÉES
				</span>
				<span class="h-0.5 w-6 rounded-full bg-brand-primary" aria-hidden="true"></span>
			</div>

			<h2
				id="contact-coordinates-heading"
				class="font-display text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl"
			>
				Restons en contact
			</h2>

			<p class="mt-4 font-body text-base text-text-secondary sm:text-lg">
				Nos canaux officiels pour échanger, demander la prière ou soutenir la mission.
			</p>
		</div>

		<!-- Grille des 3 blocs de coordonnées -->
		<div class="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
			{#each coordinates as item, index}
				{@const IconComponent = item.icon}
				<div
					class="group flex flex-col justify-between rounded-3xl border border-gray-200/80 bg-[#f8fafc] p-8 shadow-xs transition-all duration-500 hover:-translate-y-1.5 hover:border-brand-primary/30 hover:bg-white hover:shadow-xl {isVisible
						? 'translate-y-0 opacity-100'
						: 'translate-y-8 opacity-0'}"
					style="transition-delay: {index * 120 + 100}ms;"
				>
					<div>
						<!-- Icône -->
						<div
							class="flex h-14 w-14 items-center justify-center rounded-2xl border shadow-xs transition-transform duration-300 group-hover:scale-110 {item.accent}"
						>
							<IconComponent size={26} />
						</div>

						<!-- Titre du bloc -->
						<h3
							class="mt-6 font-display text-xl font-bold tracking-tight text-text-primary sm:text-2xl"
						>
							{item.title}
						</h3>

						<!-- Lignes de texte -->
						<div class="mt-3 space-y-1 font-body text-base font-semibold text-text-primary">
							{#each item.lines as line}
								<div>{line}</div>
							{/each}
						</div>
					</div>

					<!-- Lien d'action -->
					<div class="mt-8 border-t border-gray-200/70 pt-5">
						<a
							href={item.linkHref}
							class="inline-flex items-center gap-1.5 font-body text-sm font-bold text-brand-primary transition-colors group-hover:underline hover:text-brand-primary-hover"
						>
							<span>{item.linkText}</span>
							<ArrowUpRight size={15} />
						</a>
					</div>
				</div>
			{/each}
		</div>
	</Container>
</section>
