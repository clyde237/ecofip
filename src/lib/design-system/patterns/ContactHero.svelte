<script lang="ts">
	import Container from '../components/Container.svelte';
	import { Home, ChevronRight, Mail, Phone, MapPin, Sparkles, MessageSquare } from '@lucide/svelte';
	import type { ContactHeroProps } from '../types.js';

	let {
		breadcrumbLabel = 'Contact',
		eyebrow = 'Contactez-nous',
		title = 'Restons en Contact',
		subtitle = "Une question ? Une suggestion ? Besoin de prière ? N'hésitez pas à nous contacter. Nous serions ravis d'échanger avec vous !",
		backgroundImage = '/about-mission.jpg',
		class: customClass = ''
	}: ContactHeroProps = $props();

	const contactPills = [
		{
			icon: MapPin,
			label: 'Adresse',
			value: 'Quartier Tamja, Bafoussam, Cameroun',
			href: '#localisation'
		},
		{
			icon: Phone,
			label: 'Téléphone / WhatsApp',
			value: '+237 698 352 037 / +237 690 172 939',
			href: 'tel:+237698352037'
		},
		{
			icon: Mail,
			label: 'Email',
			value: 'contact@ecofip.cm / info@ecofip.cm',
			href: 'mailto:contact@ecofip.cm'
		}
	];
</script>

<section
	class="relative flex w-full flex-col justify-center overflow-hidden bg-[#0d1c1d] pt-28 pb-16 sm:pt-32 sm:pb-20 lg:pt-36 lg:pb-24 {customClass}"
	aria-labelledby="contact-hero-title"
>
	<!-- Arrière-plan avec photo missionnaire et dégradé immersif WCAG AAA -->
	{#if backgroundImage}
		<div
			class="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity"
			style="background-image: url('{backgroundImage}');"
			aria-hidden="true"
		></div>
	{/if}

	<!-- Dégradé riche de marque : bleu nuit vers bordeaux profond ECOFIP -->
	<div
		class="absolute inset-0 bg-gradient-to-b from-[#0d1c1d]/95 via-[#0d1c1d]/85 to-[#171B25]/95 sm:bg-gradient-to-r sm:from-[#0d1c1d]/95 sm:via-[#171B25]/90 sm:to-[#96000A]/70"
		aria-hidden="true"
	></div>

	<!-- Lueurs lumineuses discrètes d'ambiance -->
	<div
		class="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-brand-primary/20 blur-3xl"
		aria-hidden="true"
	></div>
	<div
		class="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-brand-accent/15 blur-3xl"
		aria-hidden="true"
	></div>

	<Container class="relative z-10">
		<div class="mx-auto max-w-3xl text-center">
			<!-- Fil d'Ariane -->
			<nav
				aria-label="Fil d'Ariane"
				class="mb-5 flex items-center justify-center gap-2 font-body text-xs font-semibold text-white/70 sm:text-sm"
			>
				<a
					href="/"
					class="flex items-center gap-1.5 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-brand-accent"
				>
					<Home size={14} class="text-white/80" />
					<span>Accueil</span>
				</a>
				<ChevronRight size={13} class="text-white/40" aria-hidden="true" />
				<span
					class="rounded-md bg-white/10 px-2.5 py-0.5 font-bold text-white shadow-xs backdrop-blur-xs"
					aria-current="page"
				>
					{breadcrumbLabel}
				</span>
			</nav>

			<!-- Badge / Surtitre simple -->
			{#if eyebrow}
				<div class="mb-4 inline-flex items-center justify-center">
					<span
						class="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/30 px-3.5 py-1.5 font-body text-xs font-bold tracking-widest text-brand-accent uppercase shadow-xs backdrop-blur-md"
					>
						<Sparkles size={13} class="text-brand-accent" aria-hidden="true" />
						<span>{eyebrow}</span>
					</span>
				</div>
			{/if}

			<!-- Grand Titre H1 en Playfair Display blanc -->
			<h1
				id="contact-hero-title"
				class="font-display text-3xl leading-[1.15] font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl lg:text-[54px]"
			>
				{title}
			</h1>

			<!-- Sous-titre descriptif en DM Sans -->
			{#if subtitle}
				<p
					class="mt-5 font-body text-sm leading-relaxed text-white/85 sm:text-base sm:leading-relaxed md:text-lg"
				>
					{subtitle}
				</p>
			{/if}

			<!-- Cartes de contact rapide -->
			<div class="mt-8 grid grid-cols-1 gap-3.5 sm:mt-10 sm:grid-cols-3 sm:gap-4">
				{#each contactPills as pill (pill.label)}
					<a
						href={pill.href}
						class="group flex flex-col items-center justify-center rounded-2xl border border-white/15 bg-white/10 p-4 text-center shadow-xs backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/15"
					>
						<div
							class="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary text-white shadow-xs transition-transform duration-200 group-hover:scale-110"
						>
							<pill.icon size={18} />
						</div>
						<span
							class="block font-body text-[11px] font-semibold tracking-wider text-white/60 uppercase"
						>
							{pill.label}
						</span>
						<span
							class="mt-0.5 font-body text-sm font-bold text-white transition-colors group-hover:text-brand-accent"
						>
							{pill.value}
						</span>
					</a>
				{/each}
			</div>

			<!-- Bouton de saut direct au formulaire -->
			<div class="mt-8 flex justify-center sm:mt-10">
				<a
					href="#formulaire"
					class="group inline-flex items-center gap-2 rounded-xl bg-brand-primary px-7 py-3.5 font-body text-sm font-bold text-white shadow-md transition-all duration-200 select-none hover:translate-y-[-1px] hover:bg-brand-primary-hover hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:text-base"
				>
					<MessageSquare size={18} class="text-white" aria-hidden="true" />
					<span>Remplir le formulaire de message</span>
				</a>
			</div>
		</div>
	</Container>
</section>
