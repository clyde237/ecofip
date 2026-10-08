<script lang="ts">
	import { SOCIAL_LINKS } from '$lib/config/social.js';
	import { onMount } from 'svelte';
	import Container from '../components/Container.svelte';
	import { ArrowUpRight } from '@lucide/svelte';

	let {
		eyebrow = 'COMMUNAUTÉ DIGITALE',
		title = 'Plus de contenu sur nos réseaux',
		description = 'Suivez-nous sur Facebook, Instagram et YouTube pour ne rien manquer de nos missions et témoignages.',
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
	class="border-t border-gray-100 bg-white py-16 sm:py-20 lg:py-24 {customClass}"
	aria-labelledby="gallery-social-heading"
>
	<Container>
		<div
			class="relative overflow-hidden rounded-3xl border border-gray-200/90 bg-[#f8fafc] p-8 shadow-xs transition-all duration-700 ease-out sm:p-12 lg:p-16 {isVisible
				? 'translate-y-0 opacity-100'
				: 'translate-y-8 opacity-0'}"
		>
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
					id="gallery-social-heading"
					class="font-display text-2xl font-bold tracking-tight text-text-primary sm:text-3xl lg:text-4xl"
				>
					{title}
				</h2>

				{#if description}
					<p class="mt-4 font-body text-sm leading-relaxed text-text-secondary sm:text-base">
						{description}
					</p>
				{/if}

				<!-- Réseaux sociaux -->
				<div class="mt-8 flex flex-wrap items-center gap-4 sm:mt-10">
					{#each SOCIAL_LINKS as social (social.name)}
						<a
							href={social.url}
							target="_blank"
							rel="noopener noreferrer"
							aria-label={social.label}
							class="inline-flex items-center gap-2.5 rounded-2xl {social.color} px-6 py-3.5 font-body text-sm font-bold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-brand-primary"
						>
							<svg class="h-4 w-4 fill-white" viewBox="0 0 24 24" aria-hidden="true">
								<path d={social.iconPath} />
							</svg>
							<span>Suivre sur {social.name}</span>
							<ArrowUpRight size={15} />
						</a>
					{/each}
				</div>
			</div>
		</div>
	</Container>
</section>
