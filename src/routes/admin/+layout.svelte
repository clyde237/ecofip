<script lang="ts">
	import { page } from '$app/state';
	import { ExternalLink, Menu, ShieldCheck, AlertTriangle } from '@lucide/svelte';
	import { AdminSidebar } from '$lib';
	import AdminSessionGuard from '$lib/design-system/components/AdminSessionGuard.svelte';
	import type { LayoutData } from './$types.js';

	let { data, children }: { data: LayoutData; children: import('svelte').Snippet } = $props();

	let isMobileMenuOpen = $state(false);

	const isLoginPage = $derived(page.url.pathname === '/admin/login');
</script>

<svelte:head>
	<title>Panneau d'Administration — ECOFIP</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

{#if isLoginPage}
	{@render children()}
{:else}
	<!-- Déconnexion automatique après inactivité (avertissement avant expiration) -->
	{#if data.session}
		<AdminSessionGuard
			expiresInMs={data.session.expiresInMs}
			idleTimeoutMs={data.session.idleTimeoutMs}
		/>
	{/if}

	<div class="min-h-screen bg-[#f8fafc] font-body text-text-primary">
		<!-- Sidebar Fixe Réutilisable (Desktop Fixe non-scrollable + Tiroir Mobile) -->
		<AdminSidebar
			admin={data.admin}
			isDbConfigured={data.isDbConfigured}
			bind:mobileOpen={isMobileMenuOpen}
		/>

		<!-- Zone Principale avec décalage pour la sidebar fixe desktop (lg:pl-64) -->
		<div class="flex min-w-0 flex-1 flex-col lg:pl-64">
			<!-- Topbar -->
			<header
				class="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-gray-200/80 bg-white/95 px-4 backdrop-blur-xs sm:px-8"
			>
				<div class="flex items-center gap-4">
					<!-- Bouton Mobile Drawer -->
					<button
						type="button"
						onclick={() => (isMobileMenuOpen = !isMobileMenuOpen)}
						class="rounded-lg p-2 text-text-secondary hover:bg-gray-100 lg:hidden"
						aria-label="Ouvrir le menu de navigation"
					>
						<Menu size={20} />
					</button>

					<h2 class="font-display text-base font-bold text-text-primary sm:text-xl">
						Tableau d’Administration ECOFIP
					</h2>
				</div>

				<div class="flex items-center gap-3 sm:gap-4">
					<!-- Indicateur État Base de Données Neon -->
					{#if data.isDbConfigured}
						<div
							class="hidden items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 sm:flex"
							title="Connecté à Neon PostgreSQL"
						>
							<ShieldCheck size={14} class="text-emerald-600" />
							<span>Neon PostgreSQL Connecté</span>
						</div>
					{:else if data.admin?.role === 'superadmin'}
						<a
							href="/admin/database"
							class="hidden items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 hover:bg-amber-100 sm:flex"
							title="Configurer DATABASE_URL pour Neon"
						>
							<AlertTriangle size={14} class="text-amber-600" />
							<span>Config Neon en attente</span>
						</a>
					{/if}

					<!-- Lien vers le site public -->
					<a
						href="/"
						target="_blank"
						rel="noopener"
						class="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-bold text-text-primary transition-colors hover:border-brand-primary hover:text-brand-primary"
					>
						<span>Voir le site</span>
						<ExternalLink size={13} />
					</a>
				</div>
			</header>

			<!-- Contenu des pages enfants -->
			<main class="flex-1 p-4 sm:p-6 lg:p-8">
				{@render children()}
			</main>
		</div>
	</div>
{/if}
