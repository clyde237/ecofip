<script lang="ts">
	/**
	 * Don par Mobile Money : le visiteur choisit un montant puis son opérateur.
	 * - Android : le bouton ouvre l'application Téléphone avec le code USSD déjà composé.
	 * - iPhone : Apple interdit de composer un code avec * ou # depuis un site ; le code est copié
	 *   pour être collé dans l'application Téléphone.
	 * - Ordinateur : le code est affiché, à composer sur le téléphone.
	 */
	import { onMount } from 'svelte';
	import { Copy, Phone, ShieldCheck, Check } from '@lucide/svelte';
	import { toast } from '../toast.svelte.js';
	import {
		DONATION_DEFAULT_AMOUNT,
		DONATION_MAX_AMOUNT,
		DONATION_MIN_AMOUNT,
		DONATION_PRESET_AMOUNTS,
		DONATION_RECIPIENT,
		MOBILE_MONEY_OPERATORS,
		parseDonationAmount,
		ussdCode,
		ussdHref,
		type MobileMoneyOperator
	} from '$lib/config/donation.js';

	interface Props {
		/** Objet du don, rappelé au donateur (ex. « Transport des équipes ») */
		purpose?: string | null;
		/** Préfixe des identifiants, pour plusieurs modules sur une même page */
		idPrefix?: string;
	}

	let { purpose = null, idPrefix = 'don' }: Props = $props();

	let presetAmount = $state<number | null>(DONATION_DEFAULT_AMOUNT);
	let customAmount = $state('');
	let device = $state<'android' | 'ios' | 'desktop'>('android');
	let copiedId = $state<string | null>(null);

	let customParsed = $derived(customAmount.trim() ? parseDonationAmount(customAmount) : null);
	let customInvalid = $derived(customAmount.trim() !== '' && customParsed === null);
	let amount = $derived(customAmount.trim() ? customParsed : presetAmount);

	onMount(() => {
		const agent = navigator.userAgent;
		const isIos =
			/iPad|iPhone|iPod/.test(agent) ||
			(navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
		const isMobile = /Android|Mobi/i.test(agent) || window.matchMedia('(pointer: coarse)').matches;
		device = isIos ? 'ios' : isMobile ? 'android' : 'desktop';
	});

	function formatAmount(value: number): string {
		return `${value.toLocaleString('fr-FR')} FCFA`;
	}

	async function copyCode(operator: MobileMoneyOperator) {
		if (!amount) return;
		try {
			await navigator.clipboard.writeText(ussdCode(operator, amount));
			copiedId = operator.id;
			toast.success(
				device === 'ios'
					? 'Code copié : ouvrez l’app Téléphone, collez-le puis appelez.'
					: 'Code copié : composez-le sur votre téléphone.'
			);
			setTimeout(() => (copiedId = null), 3000);
		} catch {
			toast.error('Copie impossible : recopiez le code affiché.');
		}
	}

	const operatorStyles: Record<
		MobileMoneyOperator['id'],
		{ card: string; badge: string; button: string }
	> = {
		orange: {
			card: 'border-[#ff7900]/30',
			badge: 'bg-black text-[#ff7900]',
			button: 'bg-[#ff7900] text-black hover:bg-[#e86e00]'
		},
		mtn: {
			card: 'border-[#ffcb05]/50',
			badge: 'bg-[#004f71] text-[#ffcb05]',
			button: 'bg-[#ffcb05] text-[#00374f] hover:bg-[#f0be00]'
		}
	};
</script>

<div class="space-y-5 font-body">
	{#if purpose}
		<p class="rounded-xl bg-brand-subtle px-3.5 py-2.5 text-sm text-text-primary">
			Votre don pour : <strong>{purpose}</strong>
		</p>
	{/if}

	<!-- 1. Montant -->
	<fieldset>
		<legend class="text-sm font-bold text-text-primary">
			<span class="mr-1.5 text-brand-primary">1.</span>Choisissez le montant
		</legend>
		<div class="mt-2.5 grid grid-cols-3 gap-2">
			{#each DONATION_PRESET_AMOUNTS as preset (preset)}
				{@const selected = !customAmount.trim() && presetAmount === preset}
				<button
					type="button"
					aria-pressed={selected}
					onclick={() => {
						presetAmount = preset;
						customAmount = '';
					}}
					class="cursor-pointer rounded-xl border py-2.5 text-center text-sm font-bold transition-colors {selected
						? 'border-brand-primary bg-brand-subtle text-brand-primary'
						: 'border-gray-200 bg-white text-text-primary hover:border-brand-primary/50'}"
				>
					{preset.toLocaleString('fr-FR')} F
				</button>
			{/each}
		</div>
		<label
			for="{idPrefix}-custom-amount"
			class="mt-3 block text-xs font-semibold text-text-secondary"
		>
			Ou un autre montant (FCFA)
		</label>
		<input
			id="{idPrefix}-custom-amount"
			bind:value={customAmount}
			inputmode="numeric"
			autocomplete="off"
			placeholder="Ex : 15 000"
			aria-invalid={customInvalid}
			aria-describedby={customInvalid ? `${idPrefix}-amount-error` : undefined}
			class="mt-1 h-11 w-full rounded-xl border px-3.5 text-base text-text-primary focus:outline-hidden {customInvalid
				? 'border-red-400 focus:border-red-500'
				: 'border-gray-200 focus:border-brand-primary'}"
		/>
		{#if customInvalid}
			<p id="{idPrefix}-amount-error" class="mt-1 text-xs font-semibold text-red-600">
				Montant entre {DONATION_MIN_AMOUNT.toLocaleString('fr-FR')} et {DONATION_MAX_AMOUNT.toLocaleString(
					'fr-FR'
				)} FCFA, en chiffres.
			</p>
		{/if}
	</fieldset>

	<!-- 2. Opérateur -->
	<div>
		<p class="text-sm font-bold text-text-primary">
			<span class="mr-1.5 text-brand-primary">2.</span>{device === 'android'
				? 'Touchez votre opérateur'
				: device === 'ios'
					? 'Copiez le code de votre opérateur'
					: 'Composez le code sur votre téléphone'}
		</p>
		<div class="mt-2.5 grid grid-cols-1 gap-3 sm:grid-cols-2">
			{#each MOBILE_MONEY_OPERATORS as operator (operator.id)}
				{@const style = operatorStyles[operator.id]}
				{@const code = ussdCode(operator, amount)}
				<div class="flex flex-col rounded-2xl border-2 bg-white p-3.5 {style.card}">
					<span
						class="self-start rounded-lg px-2.5 py-1 text-xs font-extrabold tracking-wide {style.badge}"
					>
						{operator.name}
					</span>
					<p
						class="mt-2.5 font-mono text-lg font-bold tracking-wide break-all text-text-primary"
						aria-label="Code {operator.name}"
					>
						{code}
					</p>
					<div class="mt-3 flex gap-2">
						{#if device === 'android' && amount}
							<a
								href={ussdHref(code)}
								class="flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-extrabold transition-colors {style.button}"
							>
								<Phone size={16} /> Composer · {formatAmount(amount)}
							</a>
						{/if}
						<button
							type="button"
							onclick={() => copyCode(operator)}
							disabled={!amount}
							aria-label="Copier le code {operator.name}"
							class="flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 px-3 py-3 text-sm font-bold text-text-primary transition-colors hover:border-brand-primary hover:text-brand-primary disabled:cursor-default disabled:opacity-40 {device ===
							'android'
								? ''
								: 'flex-1'}"
						>
							{#if copiedId === operator.id}
								<Check size={16} class="text-emerald-600" />
							{:else}
								<Copy size={16} />
							{/if}
							{device === 'android' ? '' : 'Copier le code'}
						</button>
					</div>
				</div>
			{/each}
		</div>
		{#if device === 'ios'}
			<p class="mt-2 text-xs text-text-secondary">
				Sur iPhone, ouvrez l’application Téléphone, collez le code dans le clavier puis appelez.
			</p>
		{/if}
	</div>

	<!-- 3. Validation -->
	<div class="flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3.5">
		<ShieldCheck size={20} class="mt-0.5 shrink-0 text-emerald-700" />
		<p class="text-sm leading-relaxed text-emerald-950">
			<span class="font-bold">3. Validez avec votre code secret Mobile Money.</span>
			Vérifiez que le bénéficiaire affiché est bien <strong>{DONATION_RECIPIENT}</strong>. Le
			paiement se fait uniquement sur votre téléphone : le site ne voit jamais votre code.
		</p>
	</div>
</div>
