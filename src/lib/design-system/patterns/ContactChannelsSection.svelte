<script lang="ts">
	import { onMount } from 'svelte';
	import Container from '../components/Container.svelte';
	import {
		Building2,
		HeartHandshake,
		Flame,
		Radio,
		Phone,
		Mail,
		Clock,
		MessageSquare,
		ArrowRight
	} from '@lucide/svelte';
	import type { ContactChannelItem, ContactChannelsProps } from '../types.js';

	const defaultChannels: ContactChannelItem[] = [
		{
			id: 'secretariat',
			title: 'Secrétariat Général & Direction',
			role: 'Administration, partenariats officiels et informations générales sur le mouvement.',
			phone: '+237 699 00 00 01',
			email: 'direction@ecofip.org',
			whatsapp: '237699000001',
			hours: 'Lun – Ven : 08h30 à 17h00',
			badge: 'Administration'
		},
		{
			id: 'priere',
			title: 'Intercession & Soutien Spirituel',
			role: 'Ligne d’écoute confidentielle, requêtes d’intercession et réconfort pastoral.',
			phone: '+237 699 00 00 02',
			email: 'priere@ecofip.org',
			whatsapp: '237699000002',
			hours: 'Disponible 7j/7 • Permanence 24h',
			badge: 'Ligne Prière'
		},
		{
			id: 'missions',
			title: 'Coordination des Missions Terrain',
			role: 'Organisation des croisades, cliniques mobiles gratuites et accueil de mission.',
			phone: '+237 699 00 00 03',
			email: 'missions@ecofip.org',
			whatsapp: '237699000003',
			hours: 'Lun – Sam : 08h00 à 18h00',
			badge: 'Opérations'
		},
		{
			id: 'media',
			title: 'Pôle Multimédia & Communication',
			role: 'Presse, témoignages, transmission des photos/vidéos et retransmissions directes.',
			phone: '+237 699 00 00 04',
			email: 'media@ecofip.org',
			whatsapp: '237699000004',
			hours: 'Lun – Ven : 09h00 à 18h00',
			badge: 'Audiovisuel'
		}
	];

	let {
		eyebrow = 'DÉPARTEMENTS DÉDIÉS',
		title = 'Adressez-vous directement au bon interlocuteur',
		subtitle = 'Pour un traitement rapide et personnalisé de votre demande, retrouvez les contacts directs de nos départements.',
		channels = defaultChannels,
		class: customClass = ''
	}: ContactChannelsProps = $props();

	function getChannelIcon(id: string) {
		switch (id) {
			case 'secretariat':
				return Building2;
			case 'priere':
				return Flame;
			case 'missions':
				return HeartHandshake;
			case 'media':
				return Radio;
			default:
				return Building2;
		}
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
			{ threshold: 0.15 }
		);

		observer.observe(sectionEl);

		return () => {
			observer.disconnect();
		};
	});
</script>

<section
	bind:this={sectionEl}
	class="bg-white py-16 sm:py-20 lg:py-28 {customClass}"
	aria-labelledby="contact-channels-heading"
>
	<Container>
		<!-- En-tête centré -->
		<div
			class="mx-auto max-w-3xl text-center transition-all duration-700 ease-out {isVisible
				? 'translate-y-0 opacity-100'
				: 'translate-y-8 opacity-0'}"
		>
			{#if eyebrow}
				<div class="mb-3 flex items-center justify-center gap-2.5">
					<span class="h-0.5 w-6 rounded-full bg-brand-primary" aria-hidden="true"></span>
					<span
						class="font-body text-xs font-bold tracking-wider text-brand-primary uppercase sm:text-sm"
					>
						{eyebrow}
					</span>
				</div>
			{/if}

			<h2
				id="contact-channels-heading"
				class="font-display text-3xl leading-[1.2] font-extrabold tracking-tight text-text-primary sm:text-4xl lg:text-[42px]"
			>
				{title}
			</h2>

			{#if subtitle}
				<p class="mt-4 font-body text-sm leading-relaxed text-text-secondary sm:text-base">
					{subtitle}
				</p>
			{/if}
		</div>

		<!-- Grille des 4 pôles -->
		<div class="mt-12 grid grid-cols-1 gap-6 sm:mt-16 md:grid-cols-2 lg:gap-8">
			{#each channels as channel, index (channel.id)}
				{@const IconComponent = getChannelIcon(channel.id)}
				<div
					class="group flex flex-col justify-between rounded-3xl border border-gray-100 bg-[#f8fafc] p-7 shadow-[0_10px_30px_rgba(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-1.5 hover:border-gray-200 hover:bg-white hover:shadow-[0_20px_45px_rgba(0,0,0,0.08)] sm:p-9 {isVisible
						? 'translate-y-0 opacity-100'
						: 'translate-y-8 opacity-0'}"
					style="transition-delay: {index * 100}ms;"
				>
					<div>
						<!-- Haut de carte avec Icône et Badge -->
						<div class="flex items-center justify-between">
							<div
								class="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-subtle text-brand-primary shadow-xs transition-transform duration-300 group-hover:scale-110"
							>
								<IconComponent size={24} />
							</div>
							<span
								class="rounded-full bg-brand-primary/10 px-3 py-1 font-body text-xs font-bold text-brand-primary"
							>
								{channel.badge}
							</span>
						</div>

						<!-- Titre et rôle -->
						<h3
							class="mt-5 font-display text-xl font-bold tracking-tight text-text-primary sm:text-2xl"
						>
							{channel.title}
						</h3>

						<p class="mt-2.5 font-body text-sm leading-relaxed text-text-secondary">
							{channel.role}
						</p>

						<!-- Coordonnées directes -->
						<div
							class="mt-6 space-y-2.5 border-t border-gray-200/70 pt-4 font-body text-xs sm:text-sm"
						>
							<div class="flex items-center gap-2.5 text-text-secondary">
								<Phone size={15} class="shrink-0 text-brand-primary" />
								<a
									href="tel:{channel.phone.replace(/\s+/g, '')}"
									class="font-semibold text-text-primary hover:text-brand-primary hover:underline"
								>
									{channel.phone}
								</a>
							</div>

							<div class="flex items-center gap-2.5 text-text-secondary">
								<Mail size={15} class="shrink-0 text-brand-primary" />
								<a href="mailto:{channel.email}" class="hover:text-brand-primary hover:underline">
									{channel.email}
								</a>
							</div>

							<div class="flex items-center gap-2.5 text-text-secondary">
								<Clock size={15} class="shrink-0 text-gray-400" />
								<span class="text-xs text-text-secondary">{channel.hours}</span>
							</div>
						</div>
					</div>

					<!-- Bouton direct WhatsApp / message -->
					<div class="mt-8 flex items-center justify-between border-t border-gray-200/70 pt-5">
						{#if channel.whatsapp}
							<a
								href="https://wa.me/{channel.whatsapp}?text=Bonjour%20ECOFIP,%20je%20vous%20contacte%20concernant%20le%20pôle%20{encodeURIComponent(
									channel.title
								)}"
								target="_blank"
								rel="noopener noreferrer"
								class="inline-flex items-center gap-2 font-body text-xs font-bold text-emerald-600 transition-colors hover:text-emerald-700"
							>
								<MessageSquare size={15} />
								<span>Écrire sur WhatsApp</span>
							</a>
						{/if}

						<a
							href="#formulaire"
							class="group/link inline-flex items-center gap-1.5 font-body text-xs font-bold text-brand-primary transition-colors hover:text-brand-primary-hover"
						>
							<span>Formulaire</span>
							<ArrowRight size={13} class="transition-transform group-hover/link:translate-x-0.5" />
						</a>
					</div>
				</div>
			{/each}
		</div>
	</Container>
</section>
