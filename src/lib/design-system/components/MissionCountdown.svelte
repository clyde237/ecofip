<script lang="ts">
	import { onMount } from 'svelte';
	import Container from './Container.svelte';
	import { Calendar, Clock, Sparkles } from '@lucide/svelte';

	let {
		title = 'Prochaine mission dans...',
		targetDate = '2026-11-15T18:00:00',
		class: customClass = ''
	}: {
		title?: string;
		targetDate?: string;
		class?: string;
	} = $props();

	let days = $state(0);
	let hours = $state(0);
	let minutes = $state(0);
	let seconds = $state(0);

	function updateCountdown() {
		const target = new Date(targetDate).getTime();
		const now = Date.now();
		const diff = Math.max(0, target - now);

		days = Math.floor(diff / (1000 * 60 * 60 * 24));
		hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
		minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
		seconds = Math.floor((diff % (1000 * 60)) / 1000);
	}

	onMount(() => {
		updateCountdown();
		const interval = setInterval(updateCountdown, 1000);
		return () => clearInterval(interval);
	});
</script>

<div class="relative z-20 -mt-10 mb-8 sm:-mt-14 {customClass}">
	<Container>
		<div
			class="mx-auto max-w-4xl rounded-2xl border border-border/80 bg-white/95 p-5 shadow-xl backdrop-blur-md sm:p-7"
		>
			<div
				class="flex flex-col items-center justify-between gap-5 text-center sm:flex-row sm:text-left"
			>
				<div class="space-y-1">
					<div class="flex items-center justify-center gap-2 text-brand-primary sm:justify-start">
						<Clock size={18} />
						<span class="text-xs font-bold tracking-wider uppercase">Compte à rebours</span>
					</div>
					<h3 class="font-display text-xl font-bold text-text-primary sm:text-2xl">
						{title}
					</h3>
				</div>

				<!-- Compteurs interactifs -->
				<div class="grid grid-cols-4 gap-2.5 sm:gap-4">
					<!-- Jours -->
					<div
						class="flex min-w-[64px] flex-col items-center justify-center rounded-xl border border-border/60 bg-surface p-2 shadow-2xs sm:min-w-[80px] sm:p-3"
					>
						<span class="font-display text-2xl font-extrabold text-brand-primary sm:text-3xl">
							{String(days).padStart(2, '0')}
						</span>
						<span
							class="mt-0.5 text-[10px] font-bold tracking-wider text-text-secondary uppercase sm:text-xs"
						>
							Jours
						</span>
					</div>

					<!-- Heures -->
					<div
						class="flex min-w-[64px] flex-col items-center justify-center rounded-xl border border-border/60 bg-surface p-2 shadow-2xs sm:min-w-[80px] sm:p-3"
					>
						<span class="font-display text-2xl font-extrabold text-text-primary sm:text-3xl">
							{String(hours).padStart(2, '0')}
						</span>
						<span
							class="mt-0.5 text-[10px] font-bold tracking-wider text-text-secondary uppercase sm:text-xs"
						>
							Heures
						</span>
					</div>

					<!-- Minutes -->
					<div
						class="flex min-w-[64px] flex-col items-center justify-center rounded-xl border border-border/60 bg-surface p-2 shadow-2xs sm:min-w-[80px] sm:p-3"
					>
						<span class="font-display text-2xl font-extrabold text-text-primary sm:text-3xl">
							{String(minutes).padStart(2, '0')}
						</span>
						<span
							class="mt-0.5 text-[10px] font-bold tracking-wider text-text-secondary uppercase sm:text-xs"
						>
							Minutes
						</span>
					</div>

					<!-- Secondes -->
					<div
						class="flex min-w-[64px] flex-col items-center justify-center rounded-xl border border-border/60 bg-surface p-2 shadow-2xs sm:min-w-[80px] sm:p-3"
					>
						<span class="font-display text-2xl font-extrabold text-brand-secondary sm:text-3xl">
							{String(seconds).padStart(2, '0')}
						</span>
						<span
							class="mt-0.5 text-[10px] font-bold tracking-wider text-text-secondary uppercase sm:text-xs"
						>
							Secondes
						</span>
					</div>
				</div>
			</div>
		</div>
	</Container>
</div>
