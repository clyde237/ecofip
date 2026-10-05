<script lang="ts">
	import { onMount } from 'svelte';
	import Container from '../components/Container.svelte';
	import { PhoneCall, HeartHandshake, Send } from '@lucide/svelte';

	let { class: customClass = '' }: { class?: string } = $props();

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
	id="priere"
	bind:this={sectionEl}
	class="border-t border-gray-100 bg-[#fafaf8] py-16 sm:py-20 lg:py-24 {customClass}"
	aria-labelledby="prayer-request-heading"
>
	<Container>
		<div
			class="relative overflow-hidden rounded-3xl border border-gray-200/90 bg-white p-8 shadow-sm transition-all duration-700 ease-out sm:p-12 lg:p-16 {isVisible
				? 'translate-y-0 opacity-100'
				: 'translate-y-8 opacity-0'}"
		>
			<div
				class="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-brand-primary/10 blur-2xl"
				aria-hidden="true"
			></div>

			<div class="relative z-10 mx-auto max-w-2xl text-center">
				<div class="mb-4 inline-flex items-center justify-center">
					<div
						class="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-subtle text-brand-primary shadow-xs"
					>
						<HeartHandshake size={24} />
					</div>
				</div>

				<h2
					id="prayer-request-heading"
					class="font-display text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl"
				>
					Besoin de prière ?
				</h2>

				<p class="mt-4 font-body text-base leading-relaxed text-text-secondary sm:text-lg">
					Notre équipe d'intercession est disponible pour prier avec vous et pour vos besoins.
					N'hésitez pas à nous partager vos sujets de prière.
				</p>

				<div class="mt-8 flex flex-wrap items-center justify-center gap-4 sm:mt-10">
					<a
						href="tel:+237698352037"
						class="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-6 py-3.5 font-body text-sm font-bold text-white shadow-md transition-all hover:bg-brand-primary-hover hover:shadow-lg focus-visible:outline-2 focus-visible:outline-brand-primary"
					>
						<PhoneCall size={18} />
						<span>Appeler pour la prière</span>
					</a>

					<a
						href="#contact-form-heading"
						class="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3.5 font-body text-sm font-semibold text-text-primary shadow-2xs transition-all hover:border-gray-400 hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-gray-400"
					>
						<Send size={18} class="text-brand-primary" />
						<span>Envoyer une demande</span>
					</a>
				</div>
			</div>
		</div>
	</Container>
</section>
