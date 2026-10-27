<script lang="ts">
	import { page } from '$app/state';
	import {
		LayoutDashboard,
		MessageSquareHeart,
		CalendarDays,
		Newspaper,
		Film,
		Database,
		Users,
		UsersRound,
		Images,
		Clapperboard,
		LogOut,
		X
	} from '@lucide/svelte';
	import { getUserPermissions } from '$lib/design-system/permissions.js';

	interface Props {
		admin?: {
			name?: string | null;
			role?: string | null;
			username?: string | null;
			permissions?: string[] | null;
		} | null;
		isDbConfigured?: boolean;
		mobileOpen?: boolean;
	}

	let { admin = null, isDbConfigured = false, mobileOpen = $bindable(false) }: Props = $props();

	const roleLabelMap: Record<string, string> = {
		superadmin: 'Super Admin',
		admin: 'Administrateur',
		manager: 'Gestionnaire',
		events_manager: 'Gest. Événements',
		articles_manager: 'Gest. Articles',
		testimonials_manager: 'Gest. Témoignages'
	};

	let roleLabel = $derived(
		admin?.role && roleLabelMap[admin.role] ? roleLabelMap[admin.role] : 'Administrateur'
	);

	let userInitials = $derived(
		admin?.name
			? admin.name
					.split(' ')
					.filter(Boolean)
					.map((w) => w[0])
					.slice(0, 2)
					.join('')
					.toUpperCase()
			: 'AD'
	);

	// Navigation adaptée dynamiquement selon les permissions effectives de l'utilisateur
	let navItems = $derived.by(() => {
		const perms = getUserPermissions(admin);
		const isSuperAdmin = admin?.role === 'superadmin';

		const items: Array<{
			href: string;
			label: string;
			icon: typeof LayoutDashboard;
			badge?: string;
			exact?: boolean;
		}> = [
			{
				href: '/admin',
				label: 'Tableau de bord',
				icon: LayoutDashboard,
				exact: true
			}
		];

		if (perms.includes('utilisateurs')) {
			items.push({
				href: '/admin/utilisateurs',
				label: 'Gestion Utilisateurs',
				icon: Users,
				badge: 'Équipe'
			});
		}

		if (perms.includes('videos')) {
			items.push({
				href: '/admin/videos',
				label: 'Vidéos & Temps forts',
				icon: Film,
				badge: 'Homepage'
			});
		}

		if (perms.includes('predications')) {
			items.push({
				href: '/admin/predications',
				label: 'Prédications vidéo',
				icon: Clapperboard
			});
		}

		if (perms.includes('temoignages')) {
			items.push({
				href: '/admin/temoignages',
				label: 'Témoignages',
				icon: MessageSquareHeart,
				badge: 'Validation'
			});
		}

		if (perms.includes('evenements')) {
			items.push({
				href: '/admin/evenements',
				label: 'Événements & Projets',
				icon: CalendarDays
			});
		}

		if (perms.includes('articles')) {
			items.push({
				href: '/admin/articles',
				label: 'Articles & Actualités',
				icon: Newspaper
			});
		}

		if (perms.includes('equipe')) {
			items.push({
				href: '/admin/equipe',
				label: 'Équipe dirigeante',
				icon: UsersRound,
				badge: 'À propos'
			});
		}

		if (perms.includes('galerie')) {
			items.push({
				href: '/admin/galerie',
				label: 'Galerie photos & vidéos',
				icon: Images
			});
		}

		// Base de données Neon : STRICTEMENT réservée au Superadmin !
		if (isSuperAdmin && perms.includes('database')) {
			items.push({
				href: '/admin/database',
				label: 'Base de données Neon',
				icon: Database
			});
		}

		return items;
	});

	/** Fait défiler la liste des rubriques jusqu'à la rubrique active (utile quand elles débordent) */
	function revealWhenActive(node: HTMLElement, active: boolean) {
		const reveal = (isActive: boolean) => {
			if (isActive) node.scrollIntoView({ block: 'nearest' });
		};
		reveal(active);
		return { update: reveal };
	}

	function isItemActive(href: string, exact = false) {
		if (exact) {
			return page.url.pathname === href;
		}
		return page.url.pathname.startsWith(href);
	}
</script>

<!-- ==============================================================================
     SIDEBAR DESKTOP FIXE
     Ancrée à gauche sur toute la hauteur : logo en haut et profil/déconnexion en bas
     restent toujours visibles ; seule la liste des rubriques défile si elle est trop longue.
     ============================================================================== -->
<aside
	class="fixed top-0 bottom-0 left-0 z-30 hidden h-screen w-64 flex-col overflow-hidden border-r border-gray-200/80 bg-white select-none lg:flex"
	aria-label="Navigation principale de l'administration ECOFIP"
>
	<!-- Haut : Logo ECOFIP & Titre Admin (fixe) -->
	<div class="shrink-0">
		<div class="flex h-16 items-center gap-3 border-b border-gray-100 px-6">
			<div
				class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-brand-primary/10 bg-brand-subtle p-1.5"
			>
				<img src="/logo_ecofip.png" alt="Logo ECOFIP" class="h-full w-auto object-contain" />
			</div>
			<div class="min-w-0">
				<span class="block truncate font-display text-base font-bold text-text-primary">ECOFIP</span
				>
				<span class="block text-[10px] font-bold tracking-wider text-brand-primary uppercase">
					Administration
				</span>
			</div>
		</div>
	</div>

	<!-- Milieu : rubriques (défilent quand elles dépassent la hauteur de l'écran) -->
	<nav
		class="min-h-0 flex-1 [scrollbar-width:thin] space-y-1.5 overflow-y-auto overscroll-contain px-3 py-5"
	>
		{#each navItems as item (item.href)}
			{@const active = isItemActive(item.href, item.exact)}
			<a
				href={item.href}
				use:revealWhenActive={active}
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
					<span class="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
						{item.badge}
					</span>
				{/if}
			</a>
		{/each}
	</nav>

	<!-- Bas : Profil Admin & Déconnexion (toujours visible) -->
	<div class="shrink-0 border-t border-gray-100 p-4">
		<div
			class="mb-3 flex items-center gap-3 rounded-xl border border-gray-200/60 bg-gray-50/70 p-3"
		>
			<div
				class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-primary text-xs font-bold text-white shadow-xs"
			>
				{userInitials}
			</div>
			<div class="min-w-0 flex-1">
				<p class="truncate text-xs font-bold text-text-primary">
					{admin?.name || 'Administrateur ECOFIP'}
				</p>
				<p class="flex items-center gap-1.5 truncate text-[10px] font-medium text-emerald-600">
					<span class="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500"></span>
					{roleLabel}
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

<!-- ==============================================================================
     DRAWER MOBILE (AFFICHÉ SUR SMARTPHONE / TABLETTE)
     ============================================================================== -->
{#if mobileOpen}
	<!-- Backdrop flou cliquable -->
	<div
		class="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs transition-opacity lg:hidden"
		onclick={() => (mobileOpen = false)}
		aria-hidden="true"
	></div>

	<!-- Tiroir coulissant latéral -->
	<aside
		class="fixed top-0 bottom-0 left-0 z-50 flex h-dvh w-72 max-w-[85vw] flex-col overflow-hidden border-r border-gray-200 bg-white shadow-2xl lg:hidden"
		aria-label="Menu de navigation mobile"
	>
		<div class="shrink-0">
			<div class="flex h-16 items-center justify-between border-b border-gray-100 px-5">
				<div class="flex items-center gap-3">
					<div
						class="flex h-9 w-9 items-center justify-center rounded-xl border border-brand-primary/10 bg-brand-subtle p-1.5"
					>
						<img src="/logo_ecofip.png" alt="Logo ECOFIP" class="h-full w-auto object-contain" />
					</div>
					<div>
						<span class="font-display text-sm font-bold text-text-primary">ECOFIP Admin</span>
					</div>
				</div>
				<button
					type="button"
					onclick={() => (mobileOpen = false)}
					class="rounded-lg p-1.5 text-text-secondary hover:bg-gray-100"
					aria-label="Fermer le menu"
				>
					<X size={18} />
				</button>
			</div>
		</div>

		<nav class="min-h-0 flex-1 space-y-1.5 overflow-y-auto overscroll-contain p-3">
			{#each navItems as item (item.href)}
				{@const active = isItemActive(item.href, item.exact)}
				<a
					href={item.href}
					onclick={() => (mobileOpen = false)}
					class="flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold {active
						? 'bg-brand-primary text-white shadow-sm'
						: 'text-text-secondary hover:bg-gray-100 hover:text-text-primary'}"
				>
					<div class="flex items-center gap-3">
						<item.icon size={18} />
						<span>{item.label}</span>
					</div>
					{#if item.badge && !active}
						<span class="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
							{item.badge}
						</span>
					{/if}
				</a>
			{/each}
		</nav>

		<div class="shrink-0 border-t border-gray-100 p-4">
			<form method="POST" action="/admin/logout">
				<button
					type="submit"
					class="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-bold text-brand-primary"
				>
					<LogOut size={14} />
					<span>Se déconnecter</span>
				</button>
			</form>
		</div>
	</aside>
{/if}
