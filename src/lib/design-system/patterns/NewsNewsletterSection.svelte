<script lang="ts">
	import { onMount } from 'svelte';
	import Container from '../components/Container.svelte';
	import { Mail, Send, CheckCircle2, ShieldCheck } from '@lucide/svelte';
	import { toast } from '../toast.svelte.js';

	let {
		eyebrow = 'LETTRE DE NOUVELLES DE LA MOISSON',
		title = 'Recevez les témoignages et rapports directement par email',
		description = 'Inscrivez-vous à notre lettre mensuelle pour ne rien manquer des nouvelles du front missionnaire, des sujets d’intercession et des dates de nos prochains passages.',
		class: customClass = ''
	}: {
		eyebrow?: string;
		title?: string;
		description?: string;
		class?: string;
	} = $props();

	let email = $state('');
	let isSubmitting = $state(false);
	let isSuccess = $state(false);

	async function handleSubscribe(e: SubmitEvent) {
		e.preventDefault();
		if (!email.trim() || !email.includes('@')) {
			toast.error('Veuillez saisir une adresse email valide.', 'Newsletter');
			return;
		}

		isSubmitting = true;
		await new Promise((resolve) => setTimeout(resolve, 600));
		isSubmitting = false;
		isSuccess = true;

		toast.success(
			'Merci ! Votre inscription à la newsletter missionnaire ECOFIP est confirmée.',
			'Abonnement réussi'
		);
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
	class="bg-white py-16 sm:py-20 lg:py-24 {customClass}"
	aria-labelledby="news-newsletter-heading"
>
	<Container>
		<div
			class="relative overflow-hidden rounded-3xl border border-gray-200/80 bg-gradient-to-br from-[#0d1c1d] to-[#171b25] p-8 text-white shadow-xl transition-all duration-700 ease-out sm:p-12 lg:p-16 {isVisible
				? 'translate-y-0 opacity-100'
				: 'translate-y-8 opacity-0'}"
		>
			<!-- Lueurs en arrière plan -->
			<div
				class="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-brand-primary/20 blur-3xl"
				aria-hidden="true"
			></div>
			<div
				class="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-brand-accent/15 blur-3xl"
				aria-hidden="true"
			></div>

			<div class="relative z-10 mx-auto max-w-2xl text-center">
				{#if eyebrow}
					<div class="mb-3 inline-flex items-center justify-center gap-2">
						<span class="h-0.5 w-6 rounded-full bg-brand-accent" aria-hidden="true"></span>
						<span class="font-body text-xs font-bold tracking-widest text-brand-accent uppercase">
							{eyebrow}
						</span>
						<span class="h-0.5 w-6 rounded-full bg-brand-accent" aria-hidden="true"></span>
					</div>
				{/if}

				<h2
					id="news-newsletter-heading"
					class="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl"
				>
					{title}
				</h2>

				{#if description}
					<p class="mt-4 font-body text-sm leading-relaxed text-white/80 sm:text-base">
						{description}
					</p>
				{/if}

				{#if isSuccess}
					<div
						class="mt-8 flex items-center justify-center gap-2.5 rounded-2xl border border-emerald-500/40 bg-emerald-950/60 p-5 text-emerald-300"
					>
						<CheckCircle2 size={20} class="shrink-0" />
						<span class="font-body text-sm font-semibold">
							Votre adresse email est enregistrée. Que Dieu vous bénisse !
						</span>
					</div>
				{:else}
					<form
						onsubmit={handleSubscribe}
						class="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
					>
						<div class="relative flex-1">
							<Mail
								size={18}
								class="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-white/40"
							/>
							<input
								type="email"
								bind:value={email}
								placeholder="Votre adresse email (ex: disciple@gmail.com)"
								required
								class="w-full rounded-xl border border-white/20 bg-white/10 py-3.5 pr-4 pl-11 font-body text-sm text-white placeholder-white/50 backdrop-blur-xs transition-colors focus:border-white focus:bg-white/15 focus:outline-hidden"
							/>
						</div>

						<button
							type="submit"
							disabled={isSubmitting}
							class="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand-primary px-7 py-3.5 font-body text-sm font-bold text-white shadow-md transition-all hover:bg-brand-primary-hover hover:shadow-lg focus-visible:outline-2 focus-visible:outline-white disabled:opacity-70"
						>
							{#if isSubmitting}
								<span>Inscription...</span>
							{:else}
								<span>S’abonner</span>
								<Send size={16} />
							{/if}
						</button>
					</form>

					<p class="mt-4 flex items-center justify-center gap-1.5 font-body text-xs text-white/60">
						<ShieldCheck size={14} class="text-brand-accent" />
						<span>Zéro spam. Vous pouvez vous désinscrire en un clic à tout moment.</span>
					</p>
				{/if}
			</div>
		</div>
	</Container>
</section>
