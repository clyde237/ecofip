<script lang="ts">
	import Container from '../components/Container.svelte';
	import { Sparkles, Heart, Activity, Flame, ShieldAlert, CheckCircle2 } from '@lucide/svelte';

	let { class: customClass = '' }: { class?: string } = $props();

	const categories = [
		{
			number: '01',
			title: 'Conversion',
			subtitle: 'Des âmes sauvées de l’obscurité vers la lumière de Christ.',
			icon: Flame,
			accentColor: 'from-amber-500/20 to-brand-primary/10',
			items: [
				'Ancien sorcier devenu évangéliste',
				'Musulman converti après une vision',
				'Jeune délinquant transformé'
			]
		},
		{
			number: '02',
			title: 'Pardon',
			subtitle: 'Des cœurs brisés restaurés par la grâce divine.',
			icon: Heart,
			accentColor: 'from-rose-500/20 to-brand-primary/10',
			items: [
				'Réconciliation familiale miraculeuse',
				'Libération de 20 ans d’amertume',
				'Pardon entre communautés'
			]
		},
		{
			number: '03',
			title: 'Guérison',
			subtitle: 'La puissance de Dieu manifestée dans les corps.',
			icon: Activity,
			accentColor: 'from-emerald-500/20 to-teal-500/10',
			items: [
				'Paralysie de 12 ans guérie',
				'Cancer disparu après prière',
				'Vue retrouvée instantanément'
			]
		},
		{
			number: '04',
			title: 'Transformation du ministère',
			subtitle: 'Des pasteurs et leaders renouvelés dans leur appel.',
			icon: Sparkles,
			accentColor: 'from-blue-500/20 to-indigo-500/10',
			items: [
				'Pasteur découragé retrouve sa vision',
				'Église stagnante devient florissante',
				'Leader formé devient planteur d’églises'
			]
		}
	];
</script>

<section class="border-b border-gray-100 bg-[#f8fafc] py-16 sm:py-20 lg:py-24 {customClass}">
	<Container>
		<div class="mx-auto mb-16 max-w-3xl text-center">
			<div
				class="mb-3 inline-flex items-center gap-2 rounded-full bg-brand-subtle px-3.5 py-1 text-xs font-bold tracking-wider text-brand-primary uppercase"
			>
				<Sparkles size={14} />
				<span>Témoignages Vivants</span>
			</div>
			<h2 class="font-display text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
				Catégories de témoignages
			</h2>
			<p class="mt-3 text-base leading-relaxed text-text-secondary sm:text-lg">
				Des vies transformées dans tous les aspects par la puissance de l’Évangile.
			</p>
		</div>

		<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
			{#each categories as cat (cat.number)}
				<div
					class="flex flex-col justify-between rounded-2xl border border-gray-200/80 bg-white p-6 shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:border-brand-primary/40 hover:shadow-lg"
				>
					<div>
						<div class="mb-4 flex items-center justify-between">
							<span
								class="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-subtle text-brand-primary"
							>
								<cat.icon size={22} />
							</span>
							<span class="font-mono text-xs font-bold text-gray-400">Catégorie {cat.number}</span>
						</div>
						<h3 class="mb-2 font-display text-xl font-bold text-text-primary">
							{cat.title}
						</h3>
						<p class="mb-5 text-xs leading-relaxed text-text-secondary">
							{cat.subtitle}
						</p>

						<ul class="space-y-2.5 border-t border-gray-100 pt-4">
							{#each cat.items as item}
								<li class="flex items-start gap-2 text-xs font-medium text-text-primary">
									<CheckCircle2 size={14} class="mt-0.5 shrink-0 text-brand-primary" />
									<span>{item}</span>
								</li>
							{/each}
						</ul>
					</div>
				</div>
			{/each}
		</div>
	</Container>
</section>
