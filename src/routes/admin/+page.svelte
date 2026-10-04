<script lang="ts">
	import {
		MessageSquareHeart,
		CalendarDays,
		Newspaper,
		ArrowRight,
		CheckCircle,
		AlertCircle,
		Sparkles,
		Database,
		Film,
		Users,
		ShieldCheck
	} from '@lucide/svelte';
	import type { PageData } from './$types.js';

	let { data }: { data: PageData } = $props();

	let userRole = $derived(data.admin?.role || 'admin');
	let canManageUsers = $derived(userRole === 'superadmin' || userRole === 'admin');
	let canManageEvents = $derived(
		userRole === 'superadmin' || userRole === 'admin' || userRole === 'events_manager'
	);
	let canManageArticles = $derived(
		userRole === 'superadmin' || userRole === 'admin' || userRole === 'articles_manager'
	);
	let canManageTestimonials = $derived(
		userRole === 'superadmin' || userRole === 'admin' || userRole === 'testimonials_manager'
	);
	let canManageVideos = $derived(userRole === 'superadmin' || userRole === 'admin');
	let isSuperAdmin = $derived(userRole === 'superadmin');
</script>

<div class="mx-auto max-w-7xl space-y-8">
	<!-- Bannière de bienvenue -->
	<div
		class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-primary via-brand-primary to-[#96000a] p-6 text-white shadow-lg sm:p-8"
	>
		<div class="relative z-10 max-w-2xl">
			<div
				class="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-xs"
			>
				<Sparkles size={14} />
				<span>Centre de gestion missionnaire</span>
			</div>
			<h1 class="mt-3 font-display text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
				Bienvenue, {data.admin?.name || 'Administrateur'}
			</h1>
			<p class="mt-2 text-sm leading-relaxed text-white/90 sm:text-base">
				{#if userRole === 'superadmin'}
					Espace Super Administrateur : Vous disposez d’un accès universel à tous les modules, à la
					gestion des utilisateurs et à l’infrastructure de base de données.
				{:else if userRole === 'admin'}
					Espace Administrateur : Pilotez le contenu, les médias, les événements et les
					collaborateurs de la plateforme ECOFIP.
				{:else if userRole === 'events_manager'}
					Espace Gestionnaire Événements : Planifiez, publiez et mettez en avant les rassemblements,
					croisades et séminaires de la mission.
				{:else if userRole === 'articles_manager'}
					Espace Gestionnaire Articles : Rédigez, éditez et publiez les récits missionnaires,
					éditoriaux et actualités de la foi.
				{:else if userRole === 'testimonials_manager'}
					Espace Gestionnaire Témoignages : Modérez et validez les récits de foi et vies
					transformées envoyés par les fidèles.
				{/if}
			</p>
		</div>
	</div>

	<!-- Grille des statistiques clés & Accès direct selon les rôles -->
	<div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
		<!-- 1. Utilisateurs & Équipe (Superadmin et Admin) -->
		{#if canManageUsers}
			<a
				href="/admin/utilisateurs"
				class="group flex flex-col justify-between rounded-2xl border border-gray-200/80 bg-white p-6 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-purple-300 hover:shadow-md"
			>
				<div>
					<div class="flex items-center justify-between">
						<span class="text-xs font-bold tracking-wider text-text-secondary uppercase">
							Équipe & Accès
						</span>
						<div
							class="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-700"
						>
							<Users size={20} />
						</div>
					</div>
					<div class="mt-4 flex items-baseline gap-2">
						<span class="font-display text-3xl font-bold text-text-primary">
							{data.stats.totalUsers}
						</span>
						<span
							class="rounded-full bg-purple-50 px-2 py-0.5 text-xs font-semibold text-purple-700"
						>
							Comptes
						</span>
					</div>
					<p class="mt-2 text-xs text-text-secondary">
						Gérez les rôles, permissions et accès des administrateurs et gestionnaires.
					</p>
				</div>
				<div class="mt-5 flex items-center gap-1.5 text-xs font-bold text-purple-700">
					<span>Gérer les utilisateurs</span>
					<ArrowRight size={14} class="transition-transform group-hover:translate-x-1" />
				</div>
			</a>
		{/if}

		<!-- 2. Événements -->
		{#if canManageEvents}
			<a
				href="/admin/evenements"
				class="group flex flex-col justify-between rounded-2xl border border-gray-200/80 bg-white p-6 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-brand-primary/40 hover:shadow-md"
			>
				<div>
					<div class="flex items-center justify-between">
						<span class="text-xs font-bold tracking-wider text-text-secondary uppercase">
							Événements & Projets
						</span>
						<div
							class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-brand-secondary"
						>
							<CalendarDays size={20} />
						</div>
					</div>
					<div class="mt-4 flex items-baseline gap-2">
						<span class="font-display text-3xl font-bold text-text-primary">
							{data.stats.totalEvents}
						</span>
						<span class="text-xs font-semibold text-text-secondary"> Événements </span>
					</div>
					<p class="mt-2 text-xs text-text-secondary">
						Planifiez vos croisades, séminaires bibliques et camps de jeunes.
					</p>
				</div>
				<div class="mt-5 flex items-center gap-1.5 text-xs font-bold text-brand-secondary">
					<span>Gérer les événements</span>
					<ArrowRight size={14} class="transition-transform group-hover:translate-x-1" />
				</div>
			</a>
		{/if}

		<!-- 3. Articles & Actualités -->
		{#if canManageArticles}
			<a
				href="/admin/articles"
				class="group flex flex-col justify-between rounded-2xl border border-gray-200/80 bg-white p-6 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-md"
			>
				<div>
					<div class="flex items-center justify-between">
						<span class="text-xs font-bold tracking-wider text-text-secondary uppercase">
							Articles & Actualités
						</span>
						<div
							class="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"
						>
							<Newspaper size={20} />
						</div>
					</div>
					<div class="mt-4 flex items-baseline gap-2">
						<span class="font-display text-3xl font-bold text-text-primary">
							{data.stats.totalArticles}
						</span>
						<span
							class="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-600"
						>
							Articles
						</span>
					</div>
					<p class="mt-2 text-xs text-text-secondary">
						Rédigez et publiez les retours d'actions missionnaires et éditoriaux.
					</p>
				</div>
				<div class="mt-5 flex items-center gap-1.5 text-xs font-bold text-emerald-600">
					<span>Rédiger un article</span>
					<ArrowRight size={14} class="transition-transform group-hover:translate-x-1" />
				</div>
			</a>
		{/if}

		<!-- 4. Témoignages -->
		{#if canManageTestimonials}
			<a
				href="/admin/temoignages"
				class="group flex flex-col justify-between rounded-2xl border border-gray-200/80 bg-white p-6 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-red-300 hover:shadow-md"
			>
				<div>
					<div class="flex items-center justify-between">
						<span class="text-xs font-bold tracking-wider text-text-secondary uppercase">
							Témoignages visiteurs
						</span>
						<div
							class="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-brand-primary"
						>
							<MessageSquareHeart size={20} />
						</div>
					</div>
					<div class="mt-4 flex items-baseline gap-2">
						<span class="font-display text-3xl font-bold text-text-primary">
							{data.stats.pendingTestimonials}
						</span>
						<span class="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-600">
							En attente
						</span>
					</div>
					<p class="mt-2 text-xs text-text-secondary">
						Modérez les récits de foi et vies transformées envoyés par les fidèles.
					</p>
				</div>
				<div class="mt-5 flex items-center gap-1.5 text-xs font-bold text-brand-primary">
					<span>Valider les témoignages</span>
					<ArrowRight size={14} class="transition-transform group-hover:translate-x-1" />
				</div>
			</a>
		{/if}

		<!-- 5. Vidéos & Cloudflare R2 -->
		{#if canManageVideos}
			<a
				href="/admin/videos"
				class="group flex flex-col justify-between rounded-2xl border border-gray-200/80 bg-white p-6 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-purple-300 hover:shadow-md"
			>
				<div>
					<div class="flex items-center justify-between">
						<span class="text-xs font-bold tracking-wider text-text-secondary uppercase">
							Vidéos & R2
						</span>
						<div
							class="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600"
						>
							<Film size={20} />
						</div>
					</div>
					<div class="mt-4 flex items-baseline gap-2">
						<span class="font-display text-3xl font-bold text-text-primary">
							{data.stats.totalVideos}
						</span>
						<span
							class="rounded-full bg-purple-50 px-2 py-0.5 text-xs font-semibold text-purple-600"
						>
							Vidéos
						</span>
					</div>
					<p class="mt-2 text-xs text-text-secondary">
						Publiez vos temps forts en vidéo hébergés sur Cloudflare R2 pour la page d’accueil.
					</p>
				</div>
				<div class="mt-5 flex items-center gap-1.5 text-xs font-bold text-purple-600">
					<span>Gérer les vidéos</span>
					<ArrowRight size={14} class="transition-transform group-hover:translate-x-1" />
				</div>
			</a>
		{/if}
	</div>

	<!-- Carte d'information Connexion Neon PostgreSQL & Vercel (STRICTEMENT réservée au Superadmin) -->
	{#if isSuperAdmin}
		<div class="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-xs sm:p-8">
			<div
				class="flex flex-col gap-4 border-b border-gray-100 pb-5 sm:flex-row sm:items-center sm:justify-between"
			>
				<div class="flex items-center gap-3">
					<div
						class="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-text-primary"
					>
						<Database size={22} />
					</div>
					<div>
						<h3 class="font-display text-lg font-bold text-text-primary">
							Infrastructure Base de Données Neon & Vercel
						</h3>
						<p class="text-xs text-text-secondary">
							PostgreSQL Serverless avec Drizzle ORM — Réservé au Super Administrateur
						</p>
					</div>
				</div>

				<div>
					{#if data.isDbConfigured}
						<span
							class="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-xs font-bold text-emerald-700"
						>
							<CheckCircle size={14} />
							Base connectée
						</span>
					{:else}
						<span
							class="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3.5 py-1 text-xs font-bold text-amber-800"
						>
							<AlertCircle size={14} />
							Configuration attendue
						</span>
					{/if}
				</div>
			</div>

			<div class="mt-6 space-y-4 text-xs leading-relaxed text-text-secondary sm:text-sm">
				<p>
					La structure complète de la base de données est gérée dans <code
						class="rounded bg-gray-100 px-2 py-0.5 font-mono text-text-primary"
						>src/lib/server/db/schema.ts</code
					>
					avec 5 tables dédiées :
					<strong class="text-text-primary">admins</strong>,
					<strong class="text-text-primary">testimonials</strong>,
					<strong class="text-text-primary">events</strong>,
					<strong class="text-text-primary">articles</strong>
					et <strong class="text-text-primary">videos</strong>.
				</p>

				<div
					class="space-y-1.5 rounded-xl border border-gray-200/60 bg-gray-50 p-4 font-mono text-xs text-text-primary"
				>
					<p class="text-text-secondary">// Commandes Drizzle ORM disponibles :</p>
					<p class="font-bold text-brand-primary">
						npm run db:push <span class="font-normal text-text-secondary"
							># Synchronise directement le schéma sur Neon</span
						>
					</p>
					<p class="font-bold text-brand-primary">
						npm run db:generate <span class="font-normal text-text-secondary"
							># Génère les fichiers de migrations SQL</span
						>
					</p>
				</div>
			</div>
		</div>
	{/if}
</div>
