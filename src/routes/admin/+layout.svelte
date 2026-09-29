<script lang="ts">
	import { page } from '$app/state';
	import {
		LayoutDashboard,
		MessageSquareHeart,
		CalendarDays,
		Newspaper,
		Database,
		LogOut,
		ExternalLink,
		Menu,
		X,
		ShieldCheck,
		AlertTriangle
	} from '@lucide/svelte';
	import type { LayoutData } from './$types.js';

	let { data, children }: { data: LayoutData; children: import('svelte').Snippet } = $props();

	let isMobileMenuOpen = $state(false);

	const isLoginPage = $derived(page.url.pathname === '/admin/login');

	const navItems = [
		{
			href: '/admin',
			label: 'Tableau de bord',
			icon: LayoutDashboard,
			exact: true
		},
		{
			href: '/admin/temoignages',
			label: 'Témoignages visiteurs',
			icon: MessageSquareHeart,
			badge: 'Validation'
		},
		{
			href: '/admin/evenements',
			label: 'Événements & Projets',
			icon: CalendarDays
		},
		{
			href: '/admin/articles',
			label: 'Articles & Actualités',
			icon: Newspaper
		},
		{
			href: '/admin/database',
			label: 'Base de données Neon',
			icon: Database
		}
	];

	function isItemActive(href: string, exact = false) {
		if (exact) {
			return page.url.pathname === href;
		}
		return page.url.pathname.startsWith(href);
	}
</script>

<svelte:head>
	<title>Panneau d'Administration — ECOFIP</title>
</svelte:head>

{#if isLoginPage}
	{@render children()}
{:else}
	<div class="flex min-h-screen bg-[#f8fafc] font-body text-text-primary">
		<!-- Sidebar Desktop -->
		<aside
			class="hidden w-64 shrink-0 flex-col border-r border-gray-200/80 bg-white lg:flex"
			aria-label="Navigation principale de l'administration"
		>
			<!-- Logo & En-tête Sidebar -->
			<div class="flex h-20 items-center gap-3 border-b border-gray-100 px-6">
				<div
					class="flex h-11 w-11 items-center justify-center rounded-xl border border-brand-primary/10 bg-brand-subtle p-1.5"
				>
					<img src="/logo_ecofip.png" alt="Logo ECOFIP" class="h-full w-auto object-contain" />
				</div>
				<div>
					<span class="font-display text-base font-bold text-text-primary">ECOFIP</span>
					<span class="block text-[11px] font-semibold tracking-wider text-brand-primary uppercase">
						Administration
					</span>
				</div>
			</div>

			<!-- Navigation Links -->
			<nav class="flex-1 space-y-1.5 px-4 py-6">
				{#each navItems as item (item.href)}
					{@const active = isItemActive(item.href, item.exact)}
					<a
						href={item.href}
						class="group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-150 {active
							? 'bg-brand-primary text-white shadow-sm'
							: 'text-text-secondary hover:bg-gray-100 hover:text-text-primary'}"
					>
						<div class="flex items-center gap-3">
							<item.icon
								size={18}
								class={active ? 'text-white' : 'text-text-secondary group-hover:text-text-primary'}
							/>
							<span>{item.label}</span>
						</div>
						{#if item.badge && !active}
							<span
								class="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800"
							>
								{item.badge}
							</span>
						{/if}
					</a>
				{/each}
			</nav>

			<!-- Profil Admin & Déconnexion en bas de Sidebar -->
			<div class="border-t border-gray-100 p-4">
				<div class="mb-3 flex items-center gap-3 rounded-xl border border-border/60 bg-surface p-3">
					<div
						class="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-primary text-xs font-bold text-white shadow-xs"
					>
						AD
					</div>
					<div class="min-w-0 flex-1">
						<p class="truncate text-xs font-bold text-text-primary">
							{data.admin?.name || 'Admin ECOFIP'}
						</p>
						<p class="flex items-center gap-1 truncate text-[10px] font-medium text-emerald-600">
							<span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
							Connecté (admin)
						</p>
					</div>
				</div>

				<form method="POST" action="/admin/logout">
					<button
						type="submit"
						class="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-xs font-bold text-text-secondary transition-colors hover:border-red-200 hover:bg-red-50 hover:text-brand-primary"
					>
						<LogOut size={14} />
						<span>Se déconnecter</span>
					</button>
				</form>
			</div>
		</aside>

		<!-- Zone Principale avec Header Supérieur -->
		<div class="flex min-w-0 flex-1 flex-col">
			<!-- Topbar -->
			<header
				class="flex h-16 items-center justify-between border-b border-gray-200/80 bg-white px-4 sm:px-8"
			>
				<div class="flex items-center gap-4">
					<!-- Bouton Mobile Drawer -->
					<button
						type="button"
						onclick={() => (isMobileMenuOpen = !isMobileMenuOpen)}
						class="rounded-lg p-2 text-text-secondary hover:bg-gray-100 lg:hidden"
						aria-label="Ouvrir le menu de navigation"
					>
						{#if isMobileMenuOpen}
							<X size={20} />
						{:else}
							<Menu size={20} />
						{/if}
					</button>

					<h2 class="font-display text-lg font-bold text-text-primary sm:text-xl">
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
					{:else}
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

			<!-- Mobile Drawer -->
			{#if isMobileMenuOpen}
				<div
					class="border-b border-gray-200 bg-white p-4 shadow-lg lg:hidden"
					role="dialog"
					aria-modal="true"
				>
					<nav class="space-y-1.5">
						{#each navItems as item (item.href)}
							{@const active = isItemActive(item.href, item.exact)}
							<a
								href={item.href}
								onclick={() => (isMobileMenuOpen = false)}
								class="flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold {active
									? 'bg-brand-primary text-white'
									: 'text-text-secondary hover:bg-gray-100'}"
							>
								<div class="flex items-center gap-3">
									<item.icon size={18} />
									<span>{item.label}</span>
								</div>
								{#if item.badge && !active}
									<span
										class="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800"
									>
										{item.badge}
									</span>
								{/if}
							</a>
						{/each}
					</nav>
					<div class="mt-4 border-t border-gray-100 pt-3">
						<form method="POST" action="/admin/logout">
							<button
								type="submit"
								class="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-brand-primary"
							>
								<LogOut size={14} />
								<span>Se déconnecter</span>
							</button>
						</form>
					</div>
				</div>
			{/if}

			<!-- Contenu des pages enfants -->
			<main class="flex-1 p-4 sm:p-6 lg:p-8">
				{@render children()}
			</main>
		</div>
	</div>
{/if}
