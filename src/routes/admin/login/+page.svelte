<script lang="ts">
	import { enhance } from '$app/forms';
	import { Lock, User, ArrowLeft, ShieldAlert, CheckCircle } from '@lucide/svelte';
	import type { ActionData } from './$types.js';

	let { form }: { form: ActionData } = $props();

	let username = $state('admin');
	let password = $state('admin');
	let isSubmitting = $state(false);

	$effect(() => {
		if (form?.username) {
			username = form.username;
		}
	});
</script>

<svelte:head>
	<title>Connexion Administration — ECOFIP</title>
</svelte:head>

<div class="flex min-h-screen flex-col justify-center bg-[#f4f6fa] px-4 py-12 sm:px-6 lg:px-8">
	<div class="sm:mx-auto sm:w-full sm:max-w-md">
		<!-- Lien retour au site public -->
		<a
			href="/"
			class="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-text-secondary transition-colors hover:text-brand-primary"
		>
			<ArrowLeft size={14} />
			<span>Retour au site public ECOFIP</span>
		</a>

		<!-- Carte Logo et Titre -->
		<div class="text-center">
			<div
				class="mx-auto flex h-20 w-36 items-center justify-center rounded-2xl border border-gray-100 bg-white p-3 shadow-md"
			>
				<img
					src="/logo_ecofip.png"
					alt="Logo officiel ECOFIP"
					class="h-full w-auto object-contain"
				/>
			</div>

			<h1 class="mt-5 font-display text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
				Espace Administration
			</h1>
			<p class="mt-2 text-sm text-text-secondary">
				Gestion des témoignages, événements, articles et mission.
			</p>
		</div>
	</div>

	<div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
		<div class="rounded-2xl border border-gray-200/80 bg-white p-8 shadow-xl">
			<!-- Indication des identifiants par défaut -->
			<div
				class="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 text-xs text-amber-900"
			>
				<CheckCircle size={18} class="mt-0.5 shrink-0 text-amber-600" />
				<div>
					<p class="font-bold">Identifiants configurés par défaut :</p>
					<p class="mt-0.5 font-mono text-[11px] text-amber-800">
						Identifiant : <span class="font-bold underline">admin</span> | Mot de passe :
						<span class="font-bold underline">admin</span>
					</p>
				</div>
			</div>

			<!-- Message d'erreur éventuel -->
			{#if form?.error}
				<div
					class="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-800"
					role="alert"
				>
					<ShieldAlert size={18} class="shrink-0 text-brand-primary" />
					<span>{form.error}</span>
				</div>
			{/if}

			<form
				method="POST"
				use:enhance={() => {
					isSubmitting = true;
					return async ({ update }) => {
						isSubmitting = false;
						await update();
					};
				}}
				class="space-y-5"
			>
				<!-- Champ Identifiant -->
				<div>
					<label for="username" class="block font-body text-sm font-semibold text-text-primary">
						Identifiant administrateur
					</label>
					<div class="relative mt-1.5 flex items-center">
						<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
							<User size={18} class="text-text-disabled" />
						</div>
						<input
							id="username"
							name="username"
							type="text"
							bind:value={username}
							required
							autocomplete="username"
							placeholder="admin"
							class="h-11 w-full rounded-xl border border-border bg-white pr-4 pl-10 text-sm text-text-primary placeholder:text-text-disabled focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 focus:outline-none"
						/>
					</div>
				</div>

				<!-- Champ Mot de passe -->
				<div>
					<label for="password" class="block font-body text-sm font-semibold text-text-primary">
						Mot de passe
					</label>
					<div class="relative mt-1.5 flex items-center">
						<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
							<Lock size={18} class="text-text-disabled" />
						</div>
						<input
							id="password"
							name="password"
							type="password"
							bind:value={password}
							required
							autocomplete="current-password"
							placeholder="••••••••"
							class="h-11 w-full rounded-xl border border-border bg-white pr-4 pl-10 text-sm text-text-primary placeholder:text-text-disabled focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 focus:outline-none"
						/>
					</div>
				</div>

				<!-- Bouton de connexion -->
				<div class="pt-2">
					<button
						type="submit"
						disabled={isSubmitting}
						class="flex w-full cursor-pointer items-center justify-center rounded-xl bg-brand-primary px-4 py-3 text-sm font-bold text-white shadow-md transition-all duration-150 hover:bg-brand-primary-hover hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-secondary active:scale-[0.99] disabled:opacity-50"
					>
						{isSubmitting ? 'Connexion en cours...' : 'Se connecter au panneau admin'}
					</button>
				</div>
			</form>
		</div>

		<!-- Footer de sécurité -->
		<p class="mt-6 text-center text-xs text-text-secondary">
			Protection par cookies HTTPOnly &bull; Données hébergées sur Neon PostgreSQL
		</p>
	</div>
</div>
