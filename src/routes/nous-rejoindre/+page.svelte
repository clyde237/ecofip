<script lang="ts">
	import Seo from '$lib/design-system/components/Seo.svelte';
	import PageBanner from '$lib/design-system/patterns/PageBanner.svelte';
	import {
		JoinWhyUsSection,
		JoinRolesSection,
		JoinApplicationSection,
		JoinMembersTestimonials,
		JoinFaqSection,
		DonationCtaSection,
		Modal,
		Button,
		Input
	} from '$lib';
	import { Heart } from '@lucide/svelte';
	import { toast } from '$lib/design-system/toast.svelte.js';

	let selectedPole = $state('evangelisation');
	let isDonationModalOpen = $state(false);
	let selectedDonationCause = $state<'mission' | 'sante' | 'jeunesse'>('mission');
</script>

<Seo
	title="Nous rejoindre — Bénévolat et service missionnaire | ECOFIP"
	description="Engagez-vous avec ECOFIP : évangélisation, intercession, logistique, multimédia, action sociale. Mettez vos dons au service de « Cameroun pour Jésus »."
	breadcrumbs={[{ name: 'Nous rejoindre', path: '/nous-rejoindre' }]}
/>

<div>
	<!-- SECTION 02 — Appel à la mission -->
	<PageBanner
		title="Nous rejoindre"
		subtitle="Le champ est vaste au Cameroun et la moisson est abondante. Nous avons besoin d’ouvriers fidèles, engagés et passionnés pour participer à cette grande œuvre. Quel que soit votre don ou votre disponibilité, il y a une place pour vous dans cette mission."
		backgroundImage="/article-communaute.jpg"
	/>

	<!-- SECTION 03 — Comment s'impliquer ? -->
	<JoinWhyUsSection />

	<!-- SECTION 04 — Nos départements de service -->
	<JoinRolesSection
		onSelectRole={(roleId) => {
			selectedPole = roleId;
		}}
	/>

	<!-- SECTION 05 — Formulaire de candidature / d'intérêt -->
	<JoinApplicationSection bind:selectedPole />

	<!-- SECTION 06 — Témoignages de membres -->
	<JoinMembersTestimonials />

	<!-- Foire aux questions (FAQ) spéciale engagement -->
	<JoinFaqSection />

	<!-- Appel alternatif : semer financièrement -->
	<DonationCtaSection
		eyebrow="VOUS NE POUVEZ PAS PARTIR SUR LE TERRAIN ?"
		title="Soutenez ceux qui vont au front de la mission"
		description="Si vos obligations actuelles ne vous permettent pas d'être déployé sur le terrain, vos dons permettent de financer la logistique, les bibles et les secours médicaux."
		ctaLabel="Semer dans la mission"
		onCtaClick={() => (isDonationModalOpen = true)}
	/>
</div>

<!-- Modal interactive de don alternatif pour la mission -->
<Modal
	bind:open={isDonationModalOpen}
	title="Soutenir les équipes missionnaires de terrain"
	description="« Que chacun donne comme il l'a résolu en son cœur, sans tristesse ni contrainte. »"
>
	<div class="space-y-5 py-2">
		<p class="font-body text-sm font-semibold text-text-primary">
			Sélectionnez l'affectation prioritaire de votre don :
		</p>
		<div class="grid grid-cols-3 gap-2.5">
			<button
				type="button"
				onclick={() => (selectedDonationCause = 'mission')}
				class="cursor-pointer rounded-xl border-2 p-3 text-center transition-all {selectedDonationCause ===
				'mission'
					? 'border-brand-primary bg-brand-subtle'
					: 'border-border bg-white hover:border-brand-primary/50'}"
			>
				<div class="text-xs font-bold text-brand-primary sm:text-sm">Croisades</div>
				<div class="mt-0.5 text-[11px] text-text-secondary">Logistique & Bibles</div>
			</button>
			<button
				type="button"
				onclick={() => (selectedDonationCause = 'sante')}
				class="cursor-pointer rounded-xl border-2 p-3 text-center transition-all {selectedDonationCause ===
				'sante'
					? 'border-brand-primary bg-brand-subtle'
					: 'border-border bg-white hover:border-brand-primary/50'}"
			>
				<div class="text-xs font-bold text-brand-primary sm:text-sm">Médical</div>
				<div class="mt-0.5 text-[11px] text-text-secondary">Soins & Pharmacie</div>
			</button>
			<button
				type="button"
				onclick={() => (selectedDonationCause = 'jeunesse')}
				class="cursor-pointer rounded-xl border-2 p-3 text-center transition-all {selectedDonationCause ===
				'jeunesse'
					? 'border-brand-primary bg-brand-subtle'
					: 'border-border bg-white hover:border-brand-primary/50'}"
			>
				<div class="text-xs font-bold text-brand-primary sm:text-sm">Jeunesse</div>
				<div class="mt-0.5 text-[11px] text-text-secondary">Camps & Éducation</div>
			</button>
		</div>

		<div class="space-y-2">
			<span class="block font-body text-xs font-semibold text-text-secondary">
				Montant suggéré (FCFA)
			</span>
			<div class="grid grid-cols-3 gap-2.5">
				<button
					type="button"
					class="cursor-pointer rounded-xl border border-border bg-white py-2.5 text-center font-body text-sm font-bold text-text-primary hover:border-brand-primary/50 hover:bg-brand-subtle/30"
				>
					10 000 F
				</button>
				<button
					type="button"
					class="cursor-pointer rounded-xl border-2 border-brand-primary bg-brand-subtle py-2.5 text-center font-body text-sm font-bold text-brand-primary"
				>
					25 000 F
				</button>
				<button
					type="button"
					class="cursor-pointer rounded-xl border border-border bg-white py-2.5 text-center font-body text-sm font-bold text-text-primary hover:border-brand-primary/50 hover:bg-brand-subtle/30"
				>
					50 000 F
				</button>
			</div>
		</div>

		<Input label="Montant libre (FCFA)" type="number" placeholder="Ex: 50 000" />
	</div>

	{#snippet actions()}
		<Button variant="outline" size="md" onclick={() => (isDonationModalOpen = false)}>
			Annuler
		</Button>
		<Button
			variant="primary"
			size="md"
			onclick={() => {
				isDonationModalOpen = false;
				toast.success(
					'Merci infiniment pour votre soutien envers l’équipe de terrain !',
					'Don enregistré'
				);
			}}
		>
			<Heart size={16} class="mr-1.5 fill-white text-white" />
			Valider mon don
		</Button>
	{/snippet}
</Modal>
