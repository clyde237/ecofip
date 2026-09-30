<script lang="ts">
	import { onMount } from 'svelte';
	import Container from '../components/Container.svelte';
	import { ChevronDown, HelpCircle, MessageCircleQuestion } from '@lucide/svelte';
	import type { JoinFaqProps, JoinFaqItem } from '../types.js';

	const defaultFaq: JoinFaqItem[] = [
		{
			id: 'denomination',
			question: 'Faut-il être membre d’une dénomination particulière pour s’engager ?',
			answer:
				'Non. ECOFIP est une œuvre missionnaire interconfessionnelle centrée sur la foi vivante en Jésus-Christ, l’autorité des Saintes Écritures et la compassion envers notre prochain. Tous les chrétiens désireux de servir le Royaume dans l’amour et l’intégrité sont accueillis avec joie.'
		},
		{
			id: 'experience',
			question:
				'Je n’ai pas de formation médicale ou d’expérience missionnaire, puis-je quand même être utile ?',
			answer:
				'Absolument ! Une mission de grande ampleur nécessite une multitude de dons : accueil des foules, logistique, sonorisation, projection, prière d’intercession, soutien administratif, écoute ou distribution de vivres. De plus, une formation pratique et un encadrement bienveillant sont assurés pour chaque nouvel équipier.'
		},
		{
			id: 'disponibilite',
			question: 'Quelle est la disponibilité minimale exigée pour un bénévole ?',
			answer:
				'Votre engagement s’adapte à votre situation personnelle, professionnelle et familiale. Vous pouvez choisir d’intervenir ponctuellement lors de nos croisades de terrain (3 à 5 jours par an), ou vous impliquer de manière plus régulière au sein d’une commission thématique.'
		},
		{
			id: 'frais',
			question: 'Y a-t-il des frais financiers à ma charge lors des déplacements en mission ?',
			answer:
				'Lors des campagnes de terrain officielles organisées par ECOFIP hors de votre ville, la prise en charge collective de l’hébergement, du transport et des repas sur place est organisée et couverte par la mission grâce aux dons de nos partenaires.'
		},
		{
			id: 'processus',
			question: 'Comment se déroule le processus après l’envoi de mon formulaire ?',
			answer:
				'Dès réception de votre candidature, notre responsable de la coordination des bénévoles vous contacte sous 48 à 72 heures par téléphone ou WhatsApp pour faire connaissance, échanger sur vos aspirations et valider votre intégration dans le pôle adéquat.'
		},
		{
			id: 'changement-pole',
			question: 'Est-il possible de changer de pôle d’action au fil du temps ?',
			answer:
				'Tout à fait. Nous croyons que le service chrétien est un chemin d’apprentissage constant. Si vous découvrez de nouveaux centres d’intérêt ou développez de nouvelles compétences, vous pourrez facilement évoluer vers un autre pôle lors des missions suivantes.'
		}
	];

	let {
		eyebrow = 'QUESTIONS FRÉQUENTES',
		title = 'Tout ce qu’il faut savoir avant de nous rejoindre',
		subtitle = 'Retrouvez ici les réponses aux interrogations les plus courantes sur l’engagement bénévole et missionnaire avec ECOFIP.',
		items = defaultFaq,
		class: customClass = ''
	}: JoinFaqProps = $props();

	let openItemIds = $state<string[]>([]);

	$effect(() => {
		if (openItemIds.length === 0 && items.length > 0) {
			openItemIds = [items[0].id];
		}
	});

	function toggleItem(id: string) {
		if (openItemIds.includes(id)) {
			openItemIds = openItemIds.filter((itemId) => itemId !== id);
		} else {
			openItemIds = [...openItemIds, id];
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
			{ threshold: 0.1 }
		);

		observer.observe(sectionEl);

		return () => {
			observer.disconnect();
		};
	});
</script>

<section
	id="faq"
	bind:this={sectionEl}
	class="bg-[#f8fafc] py-16 sm:py-20 lg:py-28 {customClass}"
	aria-labelledby="join-faq-heading"
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
				id="join-faq-heading"
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

		<!-- Liste en accordéon -->
		<div
			class="mx-auto mt-12 max-w-3xl space-y-4 transition-all duration-700 ease-out sm:mt-16 {isVisible
				? 'translate-y-0 opacity-100'
				: 'translate-y-8 opacity-0'}"
			style="transition-delay: 150ms;"
		>
			{#each items as item (item.id)}
				{@const isOpen = openItemIds.includes(item.id)}
				<div
					class="overflow-hidden rounded-2xl border transition-all duration-300 {isOpen
						? 'border-brand-primary/40 bg-white shadow-md'
						: 'border-gray-200/80 bg-white shadow-2xs hover:border-gray-300'}"
				>
					<button
						type="button"
						onclick={() => toggleItem(item.id)}
						class="flex w-full cursor-pointer items-center justify-between gap-4 p-5 text-left font-display text-base font-bold text-text-primary transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary sm:p-6 sm:text-lg"
						aria-expanded={isOpen}
						aria-controls="faq-answer-{item.id}"
						id="faq-button-{item.id}"
					>
						<span class="flex items-center gap-3">
							<span
								class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg {isOpen
									? 'bg-brand-primary text-white'
									: 'bg-brand-subtle text-brand-primary'}"
							>
								<HelpCircle size={16} />
							</span>
							<span class="leading-snug">{item.question}</span>
						</span>
						<span
							class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-transform duration-300 {isOpen
								? 'rotate-180 bg-brand-subtle text-brand-primary'
								: ''}"
							aria-hidden="true"
						>
							<ChevronDown size={18} />
						</span>
					</button>

					{#if isOpen}
						<div
							id="faq-answer-{item.id}"
							role="region"
							aria-labelledby="faq-button-{item.id}"
							class="border-t border-gray-100 px-5 pt-3 pb-6 font-body text-sm leading-relaxed text-text-secondary sm:px-6 sm:pb-7 sm:text-base sm:leading-relaxed"
						>
							<p>{item.answer}</p>
						</div>
					{/if}
				</div>
			{/each}
		</div>

		<!-- Reassurance additionnelle & contact direct -->
		<div
			class="mx-auto mt-12 max-w-xl rounded-2xl border border-gray-200/70 bg-white p-6 text-center shadow-2xs transition-all duration-700 ease-out sm:p-8 {isVisible
				? 'translate-y-0 opacity-100'
				: 'translate-y-8 opacity-0'}"
			style="transition-delay: 250ms;"
		>
			<div
				class="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-subtle text-brand-primary"
			>
				<MessageCircleQuestion size={22} />
			</div>
			<h3 class="font-display text-lg font-bold text-text-primary">
				Vous avez une autre question spécifique ?
			</h3>
			<p class="mt-1.5 font-body text-xs text-text-secondary sm:text-sm">
				Notre équipe pastorale et administrative est disponible pour vous renseigner et vous
				orienter.
			</p>
			<div class="mt-4 flex flex-wrap items-center justify-center gap-3">
				<a
					href="mailto:contact@ecofip.org"
					class="inline-flex items-center gap-1.5 font-body text-xs font-bold text-brand-primary hover:underline sm:text-sm"
				>
					contact@ecofip.org
				</a>
				<span class="text-gray-300">•</span>
				<a
					href="tel:+237699000000"
					class="inline-flex items-center gap-1.5 font-body text-xs font-bold text-brand-primary hover:underline sm:text-sm"
				>
					+237 699 00 00 00
				</a>
			</div>
		</div>
	</Container>
</section>
