<script lang="ts">
	import { enhance } from '$app/forms';
	import { Database, RefreshCw, Terminal, Cloud } from '@lucide/svelte';
	import type { PageData, ActionData } from './$types.js';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let isTesting = $state(false);
</script>

<div class="mx-auto max-w-5xl space-y-6">
	<div>
		<h1 class="font-display text-2xl font-bold text-text-primary sm:text-3xl">
			Configuration Base de Données Neon & Vercel
		</h1>
		<p class="mt-1 text-sm text-text-secondary">
			État de la connexion PostgreSQL Serverless et commandes de migration Drizzle ORM.
		</p>
	</div>

	<!-- Carte État Actuel -->
	<div
		class="rounded-2xl border bg-white p-6 shadow-xs {data.connectionTest.success
			? 'border-emerald-200'
			: 'border-amber-200'}"
	>
		<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			<div class="flex items-center gap-3">
				<div
					class="flex h-12 w-12 items-center justify-center rounded-xl {data.connectionTest.success
						? 'bg-emerald-50 text-emerald-600'
						: 'bg-amber-50 text-amber-600'}"
				>
					<Database size={24} />
				</div>
				<div>
					<h3 class="font-display text-base font-bold text-text-primary">
						{data.connectionTest.success ? 'Connexion Neon Active' : 'Configuration requise'}
					</h3>
					<p class="mt-0.5 text-xs text-text-secondary">
						{data.connectionTest.message}
					</p>
					{#if data.connectionTest.serverTime}
						<p class="mt-1 font-mono text-[11px] text-emerald-700">
							Horodatage PostgreSQL : {data.connectionTest.serverTime}
						</p>
					{/if}
				</div>
			</div>

			<form
				method="POST"
				action="?/test"
				use:enhance={() => {
					isTesting = true;
					return async ({ update }) => {
						isTesting = false;
						await update();
					};
				}}
			>
				<button
					type="submit"
					disabled={isTesting}
					class="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-text-primary shadow-xs transition-colors hover:border-brand-primary hover:text-brand-primary disabled:opacity-50"
				>
					<RefreshCw size={14} class={isTesting ? 'animate-spin' : ''} />
					<span>Tester la connexion</span>
				</button>
			</form>
		</div>

		{#if form?.message}
			<div
				class="mt-4 rounded-xl p-3 text-xs font-bold {form.success
					? 'border border-emerald-200 bg-emerald-50 text-emerald-800'
					: 'border border-red-200 bg-red-50 text-red-800'}"
			>
				{form.message}
			</div>
		{/if}
	</div>

	<!-- Guide pour connecter Neon & Déployer sur Vercel -->
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<!-- Étape 1 : Variables d'environnement -->
		<div class="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-xs">
			<div class="flex items-center gap-2.5 font-display text-base font-bold text-text-primary">
				<Terminal size={18} class="text-brand-primary" />
				<h3>1. Variables dans le fichier .env</h3>
			</div>
			<p class="mt-2 text-xs leading-relaxed text-text-secondary">
				Ajoutez vos clés de connexion Neon obtenues sur <a
					href="https://console.neon.tech"
					target="_blank"
					rel="noopener"
					class="text-brand-primary underline">console.neon.tech</a
				>
				dans votre fichier <code class="rounded bg-gray-100 px-1 py-0.5 font-mono">.env</code> :
			</p>

			<pre
				class="mt-3 overflow-x-auto rounded-xl bg-gray-900 p-3.5 font-mono text-[11px] leading-normal text-gray-200">
DATABASE_URL="postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require"
DATABASE_URL_UNPOOLED="postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"
			</pre>
		</div>

		<!-- Étape 2 : Déploiement Vercel -->
		<div class="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-xs">
			<div class="flex items-center gap-2.5 font-display text-base font-bold text-text-primary">
				<Cloud size={18} class="text-brand-secondary" />
				<h3>2. Déploiement Vercel</h3>
			</div>
			<p class="mt-2 text-xs leading-relaxed text-text-secondary">
				Sur Vercel, ajoutez ces mêmes variables dans <strong
					>Settings &rarr; Environment Variables</strong
				> :
			</p>
			<ul class="mt-3 list-inside list-disc space-y-1.5 text-xs text-text-secondary">
				<li>
					<strong class="text-text-primary">DATABASE_URL</strong> : Mode pooled (serverless HTTP Neon).
				</li>
				<li>
					<strong class="text-text-primary">DATABASE_URL_UNPOOLED</strong> : Pour les migrations Drizzle.
				</li>
				<li>
					Le driver HTTP Neon est 100% compatible avec les fonctions Edge & Serverless Vercel sans
					risque d'épuisement de connexions.
				</li>
			</ul>
		</div>
	</div>

	<!-- Commandes Drizzle ORM -->
	<div class="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-xs">
		<h3 class="font-display text-base font-bold text-text-primary">
			Commandes de gestion des tables (Drizzle ORM)
		</h3>
		<p class="mt-1 text-xs text-text-secondary">
			Une fois votre <code class="font-mono">DATABASE_URL_UNPOOLED</code> renseignée, exécutez ces commandes
			depuis votre terminal :
		</p>

		<div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
			<div class="rounded-xl border border-gray-100 bg-gray-50 p-3">
				<p class="font-mono text-xs font-bold text-brand-primary">npm run db:generate</p>
				<p class="mt-1 text-[11px] text-text-secondary">
					Génère les migrations SQL dans <code class="font-mono">./drizzle</code>
				</p>
			</div>
			<div class="rounded-xl border border-gray-100 bg-gray-50 p-3">
				<p class="font-mono text-xs font-bold text-brand-primary">npm run db:migrate</p>
				<p class="mt-1 text-[11px] text-text-secondary">Applique les tables sur Neon PostgreSQL</p>
			</div>
			<div class="rounded-xl border border-gray-100 bg-gray-50 p-3">
				<p class="font-mono text-xs font-bold text-brand-primary">npm run db:studio</p>
				<p class="mt-1 text-[11px] text-text-secondary">
					Ouvre l'interface visuelle Drizzle Studio
				</p>
			</div>
		</div>
	</div>
</div>
