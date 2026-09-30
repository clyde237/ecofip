<script lang="ts">
	import { onMount } from 'svelte';
	import Container from '../components/Container.svelte';
	import { MapPin, Mail, Phone, CheckCircle2, ArrowRight } from '@lucide/svelte';

	let {
		eyebrow = 'EXTENSION DE LA MOISSON',
		title = 'Vous souhaitez accueillir une mission ECOFIP dans votre localité ?',
		description = 'Pasteurs, responsables d’églises et comités communautaires : nous unissons nos forces avec le corps du Christ local pour organiser des croisades en plein air et des cliniques mobiles partout au Cameroun.',
		class: customClass = ''
	}: {
		eyebrow?: string;
		title?: string;
		description?: string;
		class?: string;
	} = $props();

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
	class="bg-white py-16 sm:py-20 lg:py-24 {customClass}"
	aria-labelledby="events-host-heading"
>
	<Container>
		<div
			class="relative overflow-hidden rounded-3xl border border-gray-200/90 bg-[#f8fafc] p-8 shadow-xs transition-all duration-700 ease-out sm:p-12 lg:p-16 {isVisible
				? 'translate-y-0 opacity-100'
				: 'translate-y-8 opacity-0'}"
		>
			<!-- Décoration d'angle discrète -->
			<div
				class="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-brand-primary/5 blur-2xl"
				aria-hidden="true"
			></div>

			<div class="relative z-10 max-w-3xl">
				{#if eyebrow}
					<div class="mb-3 flex items-center gap-2.5">
						<span class="h-0.5 w-6 rounded-full bg-brand-primary" aria-hidden="true"></span>
						<span
							class="font-body text-xs font-bold tracking-wider text-brand-primary uppercase sm:text-sm"
						>
							{eyebrow}
						</span>
					</div>
				{/if}

				<h2
					id="events-host-heading"
					class="font-display text-2xl font-bold tracking-tight text-text-primary sm:text-3xl lg:text-4xl"
				>
					{title}
				</h2>

				{#if description}
					<p class="mt-4 font-body text-sm leading-relaxed text-text-secondary sm:text-base">
						{description}
					</p>
				{/if}

				<!-- 3 engagements de partenariat -->
				<div class="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
					<div
						class="flex items-start gap-2.5 rounded-2xl border border-gray-100 bg-white p-4 shadow-2xs"
					>
						<CheckCircle2 size={18} class="mt-0.5 shrink-0 text-brand-primary" />
						<div>
							<strong class="block font-body text-xs font-bold text-text-primary">
								Unité & Fraternité
							</strong>
							<span class="font-body text-[11px] leading-normal text-text-secondary">
								Collaboration étroite avec les pasteurs et responsables locaux.
							</span>
						</div>
					</div>

					<div
						class="flex items-start gap-2.5 rounded-2xl border border-gray-100 bg-white p-4 shadow-2xs"
					>
						<CheckCircle2 size={18} class="mt-0.5 shrink-0 text-brand-primary" />
						<div>
							<strong class="block font-body text-xs font-bold text-text-primary">
								Logistique Clé en Main
							</strong>
							<span class="font-body text-[11px] leading-normal text-text-secondary">
								Sonorisation de grande envergure, scène, projecteurs et régie.
							</span>
						</div>
					</div>

					<div
						class="flex items-start gap-2.5 rounded-2xl border border-gray-100 bg-white p-4 shadow-2xs"
					>
						<CheckCircle2 size={18} class="mt-0.5 shrink-0 text-brand-primary" />
						<div>
							<strong class="block font-body text-xs font-bold text-text-primary">
								Suivi & Discipulat
							</strong>
							<span class="font-body text-[11px] leading-normal text-text-secondary">
								Transmission des fiches de convertis aux églises hôtes partenaires.
							</span>
						</div>
					</div>
				</div>

				<!-- Actions de contact -->
				<div class="mt-8 flex flex-wrap items-center gap-4 sm:mt-10">
					<a
						href="/contact"
						class="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-6 py-3.5 font-body text-sm font-bold text-white shadow-md transition-all duration-200 hover:translate-y-[-1px] hover:bg-brand-primary-hover hover:shadow-lg focus-visible:outline-2 focus-visible:outline-brand-primary"
					>
						<MapPin size={17} />
						<span>Proposer votre localité / Nous contacter</span>
						<ArrowRight size={16} />
					</a>

					<a
						href="tel:+237699000000"
						class="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-3.5 font-body text-sm font-semibold text-text-primary shadow-2xs transition-colors hover:border-gray-400 hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-gray-400"
					>
						<Phone size={17} class="text-brand-primary" />
						<span>+237 699 00 00 00</span>
					</a>
				</div>
			</div>
		</div>
	</Container>
</section>
