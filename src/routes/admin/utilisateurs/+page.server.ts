import { fail, redirect } from '@sveltejs/kit';
import { db, isDbConfigured } from '$lib/server/db/index.js';
import { admins } from '$lib/server/db/schema.js';
import { eq, desc, sql } from 'drizzle-orm';
import { hashPassword, getAssignableRoles, type AdminUser } from '$lib/server/auth.js';
import type { AdminRole, AdminUserItem } from '$lib/design-system/types.js';
import type { Actions, PageServerLoad } from './$types.js';

export const load: PageServerLoad = async ({ locals }) => {
	const currentAdmin = locals.admin;

	// Seuls le superadmin et l'admin ont accès à la gestion des utilisateurs
	if (!currentAdmin || (currentAdmin.role !== 'superadmin' && currentAdmin.role !== 'admin')) {
		throw redirect(303, '/admin');
	}

	const assignableRoles = getAssignableRoles(currentAdmin.role);

	let usersList: AdminUserItem[] = [];

	if (isDbConfigured && db) {
		try {
			const rows = await db
				.select({
					id: admins.id,
					username: admins.username,
					name: admins.name,
					role: admins.role,
					createdAt: admins.createdAt,
					updatedAt: admins.updatedAt
				})
				.from(admins)
				.orderBy(desc(admins.createdAt));

			usersList = rows.map((r) => ({
				id: r.id,
				username: r.username,
				name: r.name || 'Utilisateur ECOFIP',
				role: (r.role as AdminRole) || 'admin',
				createdAt: r.createdAt,
				updatedAt: r.updatedAt
			}));
		} catch (err) {
			console.error('Erreur récupération utilisateurs:', err);
		}
	}

	// Si aucun utilisateur en base ou DB non connectée, inclure au moins le compte courant
	if (usersList.length === 0) {
		usersList = [
			{
				id: currentAdmin.id || 1,
				username: currentAdmin.username,
				name: currentAdmin.name,
				role: currentAdmin.role,
				createdAt: new Date()
			}
		];
	}

	return {
		users: usersList,
		currentUser: currentAdmin,
		assignableRoles
	};
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		const operator = locals.admin;
		if (!operator || (operator.role !== 'superadmin' && operator.role !== 'admin')) {
			return fail(403, { error: 'Action non autorisée.' });
		}

		const formData = await request.formData();
		const name = String(formData.get('name') ?? '').trim();
		const username = String(formData.get('username') ?? '')
			.trim()
			.toLowerCase();
		const password = String(formData.get('password') ?? '');
		const role = String(formData.get('role') ?? 'admin').trim() as AdminRole;

		if (!name || !username || !password) {
			return fail(400, { error: 'Veuillez remplir tous les champs obligatoires.' });
		}

		// Validation identifiant
		if (!/^[a-z0-9_-]{3,50}$/.test(username)) {
			return fail(400, {
				error:
					'L’identifiant doit contenir entre 3 et 50 caractères (lettres minuscules, chiffres, tirets).'
			});
		}

		// Validation mot de passe
		if (password.length < 6) {
			return fail(400, {
				error: 'Le mot de passe doit comporter au moins 6 caractères.'
			});
		}

		// Contrôle de hiérarchie : l'admin ne peut créer que des rôles inférieurs ou égaux au sien
		const allowedRoles = getAssignableRoles(operator.role);
		if (!allowedRoles.includes(role)) {
			return fail(403, {
				error: `Vous n'avez pas l'autorisation d'attribuer le rôle « ${role} » avec votre niveau d'accès.`
			});
		}

		if (isDbConfigured && db) {
			try {
				// Vérifier l'unicité de l'identifiant
				const existing = await db
					.select({ id: admins.id })
					.from(admins)
					.where(eq(sql`LOWER(${admins.username})`, username))
					.limit(1);

				if (existing.length > 0) {
					return fail(400, {
						error: `L’identifiant « ${username} » est déjà utilisé par un autre compte.`
					});
				}

				const passwordHash = hashPassword(password);

				await db.insert(admins).values({
					username,
					passwordHash,
					name,
					role
				});
			} catch (err: unknown) {
				console.error('Erreur création utilisateur:', err);
				return fail(500, {
					error: 'Erreur lors de l’enregistrement de l’utilisateur dans la base.'
				});
			}
		}

		return { success: true, message: `Utilisateur « ${name} » créé avec succès.` };
	},

	update: async ({ request, locals }) => {
		const operator = locals.admin;
		if (!operator || (operator.role !== 'superadmin' && operator.role !== 'admin')) {
			return fail(403, { error: 'Action non autorisée.' });
		}

		const formData = await request.formData();
		const id = Number(formData.get('id'));
		const name = String(formData.get('name') ?? '').trim();
		const role = String(formData.get('role') ?? '').trim() as AdminRole;
		const newPassword = String(formData.get('newPassword') ?? '').trim();

		if (!id || !name || !role) {
			return fail(400, { error: 'Informations incomplètes.' });
		}

		if (isDbConfigured && db) {
			try {
				const [target] = await db.select().from(admins).where(eq(admins.id, id)).limit(1);
				if (!target) {
					return fail(404, { error: 'Utilisateur introuvable.' });
				}

				// Règle de sécurité : Un simple admin ne peut JAMAIS modifier un superadmin
				if (target.role === 'superadmin' && operator.role !== 'superadmin') {
					return fail(403, {
						error:
							'Vous ne disposez pas des privilèges nécessaires pour modifier un Super Administrateur.'
					});
				}

				// Vérifier que le nouveau rôle est autorisé pour l'opérateur
				const allowedRoles = getAssignableRoles(operator.role);
				if (!allowedRoles.includes(role)) {
					return fail(403, {
						error: `Attribution du rôle « ${role} » non autorisée.`
					});
				}

				// Préparer les données à mettre à jour
				const updateData: {
					name: string;
					role: string;
					updatedAt: Date;
					passwordHash?: string;
				} = {
					name,
					role,
					updatedAt: new Date()
				};

				if (newPassword) {
					if (newPassword.length < 6) {
						return fail(400, {
							error: 'Le nouveau mot de passe doit comporter au moins 6 caractères.'
						});
					}
					updateData.passwordHash = hashPassword(newPassword);
				}

				await db.update(admins).set(updateData).where(eq(admins.id, id));
			} catch (err: unknown) {
				console.error('Erreur mise à jour utilisateur:', err);
				return fail(500, { error: 'Erreur lors de la mise à jour.' });
			}
		}

		return { success: true, message: `Utilisateur « ${name} » mis à jour avec succès.` };
	},

	delete: async ({ request, locals }) => {
		const operator = locals.admin;
		if (!operator || (operator.role !== 'superadmin' && operator.role !== 'admin')) {
			return fail(403, { error: 'Action non autorisée.' });
		}

		const formData = await request.formData();
		const id = Number(formData.get('id'));

		if (!id) {
			return fail(400, { error: 'Identifiant d’utilisateur manquant.' });
		}

		// Règle de sécurité : interdiction absolue de supprimer son propre compte en cours de session
		if (operator.id && operator.id === id) {
			return fail(400, {
				error: 'Vous ne pouvez pas supprimer votre propre compte connecté.'
			});
		}

		if (isDbConfigured && db) {
			try {
				const [target] = await db.select().from(admins).where(eq(admins.id, id)).limit(1);
				if (!target) {
					return fail(404, { error: 'Utilisateur introuvable.' });
				}

				// Protection contre la suppression de son propre username si id n'est pas renseigné
				if (target.username.toLowerCase() === operator.username.toLowerCase()) {
					return fail(400, {
						error: 'Vous ne pouvez pas supprimer votre propre compte.'
					});
				}

				// Un admin ne peut jamais supprimer un superadmin
				if (target.role === 'superadmin' && operator.role !== 'superadmin') {
					return fail(403, {
						error: 'Seul un Super Administrateur peut supprimer un compte Super Administrateur.'
					});
				}

				// Vérifier qu'il reste au moins un superadmin dans le système
				if (target.role === 'superadmin') {
					const otherSuperadmins = await db
						.select({ id: admins.id })
						.from(admins)
						.where(eq(admins.role, 'superadmin'));

					if (otherSuperadmins.length <= 1) {
						return fail(400, {
							error: 'Impossible de supprimer le dernier Super Administrateur du système.'
						});
					}
				}

				await db.delete(admins).where(eq(admins.id, id));
			} catch (err: unknown) {
				console.error('Erreur suppression utilisateur:', err);
				return fail(500, { error: 'Erreur lors de la suppression de l’utilisateur.' });
			}
		}

		return { success: true, message: 'Utilisateur supprimé avec succès.' };
	}
};
