<script lang="ts">
	import { enhance } from '$app/forms';
	import {
		Users,
		UserPlus,
		Shield,
		ShieldCheck,
		CalendarDays,
		Newspaper,
		MessageSquareHeart,
		Key,
		Edit2,
		Trash2,
		Search,
		CheckCircle2,
		AlertTriangle,
		Lock,
		Sparkles
	} from '@lucide/svelte';
	import Modal from '$lib/design-system/components/Modal.svelte';
	import { toast } from '$lib/design-system/toast.svelte.js';
	import type { PageData, ActionData } from './$types.js';
	import type { AdminRole, AdminUserItem } from '$lib/design-system/types.js';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	// Gestion des états locaux
	let searchQuery = $state('');
	let isCreateModalOpen = $state(false);
	let isEditModalOpen = $state(false);
	let isDeleteModalOpen = $state(false);

	let userToEdit = $state<AdminUserItem | null>(null);
	let userToDelete = $state<AdminUserItem | null>(null);

	// Champs du formulaire de création
	let newName = $state('');
	let newUsername = $state('');
	let newPassword = $state('');
	let newRole = $state<AdminRole>('admin');

	// Champs du formulaire de modification
	let editName = $state('');
	let editRole = $state<AdminRole>('admin');
	let editPassword = $state('');

	// Métadonnées et descriptifs des rôles
	const roleMeta: Record<
		AdminRole,
		{ label: string; badgeClass: string; desc: string; icon: typeof Shield }
	> = {
		superadmin: {
			label: 'Super Administrateur',
			badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
			desc: 'Accès total à tous les modules, gestion des utilisateurs et base de données',
			icon: ShieldCheck
		},
		admin: {
			label: 'Administrateur',
			badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
			desc: 'Accès à tous les onglets sauf la Base de données Neon',
			icon: Shield
		},
		events_manager: {
			label: 'Gestionnaire Événements',
			badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
			desc: 'Gestion exclusive des Événements & Projets de la mission',
			icon: CalendarDays
		},
		articles_manager: {
			label: 'Gestionnaire Articles',
			badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
			desc: 'Gestion exclusive des Articles, Récits et Actualités',
			icon: Newspaper
		},
		testimonials_manager: {
			label: 'Gestionnaire Témoignages',
			badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
			desc: 'Modération et validation exclusive des Témoignages visiteurs',
			icon: MessageSquareHeart
		}
	};

	// Filtrage dynamique des utilisateurs
	let filteredUsers = $derived(
		data.users.filter((u) => {
			const query = searchQuery.trim().toLowerCase();
			if (!query) return true;
			const roleLabel = roleMeta[u.role]?.label.toLowerCase() || '';
			return (
				u.name.toLowerCase().includes(query) ||
				u.username.toLowerCase().includes(query) ||
				roleLabel.includes(query)
			);
		})
	);

	// Statistiques d'effectif
	let superadminCount = $derived(data.users.filter((u) => u.role === 'superadmin').length);
	let adminCount = $derived(data.users.filter((u) => u.role === 'admin').length);
	let managersCount = $derived(
		data.users.filter((u) =>
			['events_manager', 'articles_manager', 'testimonials_manager'].includes(u.role)
		).length
	);

	// Réagir aux retours de soumission de formulaires
	$effect(() => {
		if (form?.success && form?.message) {
			toast.success(form.message);
			isCreateModalOpen = false;
			isEditModalOpen = false;
			isDeleteModalOpen = false;
			newName = '';
			newUsername = '';
			newPassword = '';
			editPassword = '';
		} else if (form?.error) {
			toast.error(form.error);
		}
	});

	function openCreateModal() {
		newName = '';
		newUsername = '';
		newPassword = '';
		// Rôle par défaut selon les rôles assignables
		newRole = (data.assignableRoles[0] as AdminRole) || 'admin';
		isCreateModalOpen = true;
	}

	function openEditModal(user: AdminUserItem) {
		userToEdit = user;
		editName = user.name;
		editRole = user.role;
		editPassword = '';
		isEditModalOpen = true;
	}

	function openDeleteModal(user: AdminUserItem) {
		userToDelete = user;
		isDeleteModalOpen = true;
	}

	function getUserInitials(name: string): string {
		return name
			.split(' ')
			.filter(Boolean)
			.map((n) => n[0])
			.slice(0, 2)
			.join('')
			.toUpperCase();
	}
</script>

<div class="mx-auto max-w-7xl space-y-8">
	<!-- 1. En-tête de la page avec résumé du rôle de l'opérateur connecté -->
	<div
		class="flex flex-col gap-4 rounded-3xl border border-gray-200/80 bg-white p-6 shadow-xs sm:flex-row sm:items-center sm:justify-between sm:p-8"
	>
		<div class="space-y-1.5">
			<div class="flex items-center gap-2 text-xs font-bold text-brand-primary uppercase">
				<ShieldCheck size={16} />
				<span>Gestion des Accès & Rôles</span>
			</div>
			<h1 class="font-display text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
				Utilisateurs de l’Administration
			</h1>
			<p class="text-xs text-text-secondary sm:text-sm">
				{#if data.currentUser.role === 'superadmin'}
					Vous êtes connecté en tant que <strong class="text-purple-700"
						>Super Administrateur</strong
					> (accès universel et attribution de tous les rôles).
				{:else}
					Vous êtes connecté en tant qu’<strong class="text-blue-700">Administrateur</strong> (création
					d'utilisateurs de niveau administrateur ou gestionnaires dédiés).
				{/if}
			</p>
		</div>

		<div>
			<button
				type="button"
				onclick={openCreateModal}
				class="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-brand-primary px-5 py-3 text-xs font-bold text-white shadow-xs transition-all hover:bg-brand-primary-hover hover:shadow-sm sm:text-sm"
			>
				<UserPlus size={16} />
				<span>Créer un utilisateur</span>
			</button>
		</div>
	</div>

	<!-- 2. Cartes d'indicateurs d'effectif -->
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
		<div class="rounded-2xl border border-purple-100 bg-purple-50/50 p-5 shadow-2xs">
			<div class="flex items-center justify-between">
				<span class="text-xs font-bold text-purple-900 uppercase">Super Administrateurs</span>
				<div
					class="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-700"
				>
					<ShieldCheck size={18} />
				</div>
			</div>
			<div class="mt-3 flex items-baseline gap-2">
				<span class="font-display text-2xl font-black text-purple-950">{superadminCount}</span>
				<span class="text-[11px] text-purple-700">Accès intégral</span>
			</div>
		</div>

		<div class="rounded-2xl border border-blue-100 bg-blue-50/50 p-5 shadow-2xs">
			<div class="flex items-center justify-between">
				<span class="text-xs font-bold text-blue-900 uppercase">Administrateurs</span>
				<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
					<Shield size={18} />
				</div>
			</div>
			<div class="mt-3 flex items-baseline gap-2">
				<span class="font-display text-2xl font-black text-blue-950">{adminCount}</span>
				<span class="text-[11px] text-blue-700">Gestion générale (hors DB)</span>
			</div>
		</div>

		<div class="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5 shadow-2xs">
			<div class="flex items-center justify-between">
				<span class="text-xs font-bold text-emerald-900 uppercase">Gestionnaires Dédiés</span>
				<div
					class="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700"
				>
					<Users size={18} />
				</div>
			</div>
			<div class="mt-3 flex items-baseline gap-2">
				<span class="font-display text-2xl font-black text-emerald-950">{managersCount}</span>
				<span class="text-[11px] text-emerald-700">Événements, Articles, Témoignages</span>
			</div>
		</div>
	</div>

	<!-- 3. Liste des utilisateurs avec barre de recherche -->
	<div class="overflow-hidden rounded-3xl border border-gray-200/80 bg-white shadow-xs">
		<!-- Barre d'outils du tableau -->
		<div
			class="flex flex-col gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"
		>
			<div class="flex items-center gap-2">
				<Users size={18} class="text-brand-primary" />
				<h2 class="font-display text-base font-bold text-text-primary sm:text-lg">
					Comptes Actifs ({data.users.length})
				</h2>
			</div>

			<div class="relative w-full sm:w-72">
				<Search size={15} class="absolute top-1/2 left-3.5 -translate-y-1/2 text-gray-400" />
				<input
					type="search"
					placeholder="Rechercher par nom, identifiant..."
					bind:value={searchQuery}
					class="h-9 w-full rounded-xl border border-gray-200 bg-[#f8fafc] pr-3 pl-9 text-xs text-text-primary placeholder:text-gray-400 focus:border-brand-primary focus:bg-white focus:outline-hidden"
				/>
			</div>
		</div>

		<!-- Tableau des utilisateurs -->
		<div class="overflow-x-auto">
			<table class="w-full text-left text-xs sm:text-sm">
				<thead
					class="border-b border-gray-100 bg-gray-50/80 text-[11px] font-bold text-text-secondary uppercase"
				>
					<tr>
						<th class="px-6 py-3.5">Utilisateur & Identifiant</th>
						<th class="px-6 py-3.5">Rôle & Permissions</th>
						<th class="hidden px-6 py-3.5 md:table-cell">Créé le</th>
						<th class="px-6 py-3.5 text-right">Actions</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-100">
					{#if filteredUsers.length === 0}
						<tr>
							<td colspan="4" class="py-12 text-center text-text-secondary">
								Aucun utilisateur ne correspond à votre recherche.
							</td>
						</tr>
					{:else}
						{#each filteredUsers as user (user.id)}
							{@const meta = roleMeta[user.role] || roleMeta.admin}
							{@const isSelf =
								user.username.toLowerCase() === data.currentUser.username.toLowerCase()}
							{@const canModifyThisUser =
								data.currentUser.role === 'superadmin' ||
								(data.currentUser.role === 'admin' && user.role !== 'superadmin')}

							<tr class="transition-colors hover:bg-gray-50/60">
								<!-- Nom & Identifiant -->
								<td class="px-6 py-4">
									<div class="flex items-center gap-3">
										<div
											class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-slate-700 shadow-2xs"
										>
											{getUserInitials(user.name)}
										</div>
										<div class="min-w-0">
											<div class="flex items-center gap-2">
												<span class="truncate font-bold text-text-primary">
													{user.name}
												</span>
												{#if isSelf}
													<span
														class="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700"
													>
														Vous
													</span>
												{/if}
											</div>
											<span class="block font-mono text-[11px] text-text-secondary">
												@{user.username}
											</span>
										</div>
									</div>
								</td>

								<!-- Rôle & Badge -->
								<td class="px-6 py-4">
									<div class="space-y-1">
										<span
											class="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-bold {meta.badgeClass}"
										>
											<meta.icon size={13} />
											<span>{meta.label}</span>
										</span>
										<p class="hidden text-[11px] text-text-secondary lg:block">
											{meta.desc}
										</p>
									</div>
								</td>

								<!-- Date de création -->
								<td class="hidden px-6 py-4 text-xs text-text-secondary md:table-cell">
									{#if user.createdAt}
										{new Date(user.createdAt).toLocaleDateString('fr-FR', {
											day: 'numeric',
											month: 'short',
											year: 'numeric'
										})}
									{:else}
										—
									{/if}
								</td>

								<!-- Actions -->
								<td class="px-6 py-4 text-right">
									<div class="flex items-center justify-end gap-2">
										{#if canModifyThisUser}
											<button
												type="button"
												onclick={() => openEditModal(user)}
												class="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-text-primary transition-colors hover:border-brand-primary hover:text-brand-primary"
												title="Modifier l'utilisateur"
											>
												<Edit2 size={13} />
												<span class="hidden sm:inline">Modifier</span>
											</button>

											{#if !isSelf}
												<button
													type="button"
													onclick={() => openDeleteModal(user)}
													class="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-red-200 bg-red-50/60 px-2.5 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100"
													title="Supprimer l'utilisateur"
												>
													<Trash2 size={13} />
													<span class="hidden sm:inline">Supprimer</span>
												</button>
											{/if}
										{:else}
											<span
												class="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] font-medium text-gray-400"
												title="Les comptes Super Administrateur sont protégés"
											>
												<Lock size={12} />
												<span>Protégé</span>
											</span>
										{/if}
									</div>
								</td>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>
	</div>
</div>

<!-- ==============================================================================
     MODALE 1 : CRÉATION D'UN UTILISATEUR
     ============================================================================== -->
<Modal
	bind:open={isCreateModalOpen}
	title="Créer un nouvel utilisateur"
	description="Configurez les identifiants et le niveau de permissions pour le nouveau collaborateur."
>
	<form method="POST" action="?/create" use:enhance class="space-y-4 py-2">
		<!-- Nom complet -->
		<div>
			<label for="create-name" class="block text-xs font-bold text-text-primary uppercase">
				Nom complet *
			</label>
			<input
				id="create-name"
				name="name"
				type="text"
				bind:value={newName}
				required
				placeholder="Ex: Frère Samuel Eboa"
				class="mt-1 h-10 w-full rounded-xl border border-gray-200 bg-[#f8fafc] px-3.5 text-xs text-text-primary placeholder:text-gray-400 focus:border-brand-primary focus:bg-white focus:outline-hidden sm:text-sm"
			/>
		</div>

		<!-- Identifiant unique -->
		<div>
			<div class="flex items-center justify-between">
				<label for="create-username" class="block text-xs font-bold text-text-primary uppercase">
					Identifiant de connexion *
				</label>
				<span class="text-[10px] text-text-secondary">Minuscules, chiffres, tirets</span>
			</div>
			<div class="relative mt-1">
				<span class="absolute top-1/2 left-3 -translate-y-1/2 font-mono text-xs text-gray-400"
					>@</span
				>
				<input
					id="create-username"
					name="username"
					type="text"
					bind:value={newUsername}
					required
					pattern={'^[a-z0-9_-]{3,50}$'}
					placeholder="seboa"
					class="h-10 w-full rounded-xl border border-gray-200 bg-[#f8fafc] pr-3 pl-7 font-mono text-xs text-text-primary placeholder:text-gray-400 focus:border-brand-primary focus:bg-white focus:outline-hidden sm:text-sm"
				/>
			</div>
		</div>

		<!-- Mot de passe -->
		<div>
			<div class="flex items-center justify-between">
				<label for="create-password" class="block text-xs font-bold text-text-primary uppercase">
					Mot de passe initial *
				</label>
				<span class="text-[10px] text-text-secondary">Au moins 6 caractères</span>
			</div>
			<div class="relative mt-1">
				<Key size={14} class="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
				<input
					id="create-password"
					name="password"
					type="password"
					bind:value={newPassword}
					required
					minlength="6"
					placeholder="••••••••"
					class="h-10 w-full rounded-xl border border-gray-200 bg-[#f8fafc] pr-3 pl-8 text-xs text-text-primary placeholder:text-gray-400 focus:border-brand-primary focus:bg-white focus:outline-hidden sm:text-sm"
				/>
			</div>
		</div>

		<!-- Sélection du rôle -->
		<div class="space-y-2 pt-2">
			<span class="block text-xs font-bold text-text-primary uppercase">
				Rôle & Niveau d'Accès *
			</span>

			<div class="grid grid-cols-1 gap-2.5">
				{#each data.assignableRoles as r}
					{@const meta = roleMeta[r]}
					<label
						class="flex cursor-pointer items-start gap-3 rounded-2xl border p-3.5 transition-all {newRole ===
						r
							? 'border-brand-primary bg-brand-primary/5 shadow-2xs'
							: 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/60'}"
					>
						<input
							type="radio"
							name="role"
							value={r}
							bind:group={newRole}
							class="mt-0.5 text-brand-primary focus:ring-brand-primary"
						/>
						<div class="min-w-0 flex-1">
							<div class="flex items-center gap-2">
								<span class="text-xs font-bold text-text-primary sm:text-sm">
									{meta.label}
								</span>
								<span class="rounded-md border px-2 py-0.5 text-[10px] font-bold {meta.badgeClass}">
									{r}
								</span>
							</div>
							<p class="mt-1 text-xs leading-relaxed text-text-secondary">
								{meta.desc}
							</p>
						</div>
					</label>
				{/each}
			</div>
		</div>

		<!-- Boutons -->
		<div class="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
			<button
				type="button"
				onclick={() => (isCreateModalOpen = false)}
				class="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-text-secondary hover:bg-gray-50"
			>
				Annuler
			</button>
			<button
				type="submit"
				class="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-brand-primary px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-brand-primary-hover"
			>
				<UserPlus size={15} />
				<span>Enregistrer l'utilisateur</span>
			</button>
		</div>
	</form>
</Modal>

<!-- ==============================================================================
     MODALE 2 : MODIFICATION D'UN UTILISATEUR
     ============================================================================== -->
<Modal
	bind:open={isEditModalOpen}
	title="Modifier l'utilisateur"
	description={userToEdit ? `Mise à jour des informations pour @${userToEdit.username}` : ''}
>
	{#if userToEdit}
		<form method="POST" action="?/update" use:enhance class="space-y-4 py-2">
			<input type="hidden" name="id" value={userToEdit.id} />

			<div>
				<label for="edit-name" class="block text-xs font-bold text-text-primary uppercase">
					Nom complet *
				</label>
				<input
					id="edit-name"
					name="name"
					type="text"
					bind:value={editName}
					required
					class="mt-1 h-10 w-full rounded-xl border border-gray-200 bg-[#f8fafc] px-3.5 text-xs text-text-primary focus:border-brand-primary focus:bg-white focus:outline-hidden sm:text-sm"
				/>
			</div>

			<!-- Rôle -->
			<div class="space-y-2 pt-1">
				<span class="block text-xs font-bold text-text-primary uppercase"> Rôle attribué * </span>
				<div class="grid grid-cols-1 gap-2">
					{#each data.assignableRoles as r}
						{@const meta = roleMeta[r]}
						<label
							class="flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-all {editRole ===
							r
								? 'border-brand-primary bg-brand-primary/5 shadow-2xs'
								: 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/60'}"
						>
							<input
								type="radio"
								name="role"
								value={r}
								bind:group={editRole}
								class="mt-0.5 text-brand-primary focus:ring-brand-primary"
							/>
							<div class="min-w-0 flex-1">
								<span class="text-xs font-bold text-text-primary sm:text-sm">
									{meta.label}
								</span>
								<p class="text-[11px] text-text-secondary">
									{meta.desc}
								</p>
							</div>
						</label>
					{/each}
				</div>
			</div>

			<!-- Nouveau mot de passe (optionnel) -->
			<div class="border-t border-gray-100 pt-2">
				<div class="flex items-center justify-between">
					<label for="edit-password" class="block text-xs font-bold text-text-primary uppercase">
						Nouveau mot de passe
					</label>
					<span class="text-[10px] text-text-secondary">Laisser vide pour ne pas changer</span>
				</div>
				<div class="relative mt-1">
					<Key size={14} class="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
					<input
						id="edit-password"
						name="newPassword"
						type="password"
						bind:value={editPassword}
						minlength="6"
						placeholder="•••••••• (inchangé si vide)"
						class="h-10 w-full rounded-xl border border-gray-200 bg-[#f8fafc] pr-3 pl-8 text-xs text-text-primary focus:border-brand-primary focus:bg-white focus:outline-hidden sm:text-sm"
					/>
				</div>
			</div>

			<!-- Boutons -->
			<div class="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
				<button
					type="button"
					onclick={() => (isEditModalOpen = false)}
					class="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-text-secondary hover:bg-gray-50"
				>
					Annuler
				</button>
				<button
					type="submit"
					class="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-brand-primary px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-brand-primary-hover"
				>
					<CheckCircle2 size={15} />
					<span>Enregistrer les modifications</span>
				</button>
			</div>
		</form>
	{/if}
</Modal>

<!-- ==============================================================================
     MODALE 3 : CONFIRMATION DE SUPPRESSION
     ============================================================================== -->
<Modal
	bind:open={isDeleteModalOpen}
	title="Supprimer l'utilisateur"
	description="Cette action est irréversible et révoquera immédiatement tous les accès de cet utilisateur."
>
	{#if userToDelete}
		<form method="POST" action="?/delete" use:enhance class="space-y-4 py-2">
			<input type="hidden" name="id" value={userToDelete.id} />

			<div class="rounded-2xl border border-red-200 bg-red-50/70 p-4">
				<div class="flex items-start gap-3">
					<AlertTriangle size={20} class="mt-0.5 shrink-0 text-red-600" />
					<div class="text-xs leading-relaxed text-red-900">
						Confirmez-vous la suppression du compte de <strong>{userToDelete.name}</strong>
						(@{userToDelete.username}) avec le rôle
						<strong>{roleMeta[userToDelete.role]?.label || userToDelete.role}</strong> ?
					</div>
				</div>
			</div>

			<div class="flex items-center justify-end gap-3 pt-2">
				<button
					type="button"
					onclick={() => (isDeleteModalOpen = false)}
					class="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-text-secondary hover:bg-gray-50"
				>
					Annuler
				</button>
				<button
					type="submit"
					class="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-red-700"
				>
					<Trash2 size={15} />
					<span>Confirmer la suppression</span>
				</button>
			</div>
		</form>
	{/if}
</Modal>
