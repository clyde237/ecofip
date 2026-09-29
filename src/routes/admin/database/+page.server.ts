import { db, isDbConfigured } from '$lib/server/db/index.js';
import { sql } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types.js';

export const load: PageServerLoad = async () => {
	let connectionTest = {
		success: false,
		message: 'Base non configurée. Veuillez ajouter votre DATABASE_URL Neon dans .env',
		serverTime: null as string | null
	};

	if (isDbConfigured && db) {
		try {
			const res = await db.execute(sql`SELECT NOW() AS current_time, version() AS pg_version`);
			const firstRow = res.rows[0] as { current_time?: string; pg_version?: string } | undefined;
			connectionTest = {
				success: true,
				message: `Connexion PostgreSQL Neon réussie !`,
				serverTime: firstRow?.current_time ? String(firstRow.current_time) : null
			};
		} catch (err: unknown) {
			const errorMessage = err instanceof Error ? err.message : String(err);
			connectionTest = {
				success: false,
				message: `Erreur de connexion : ${errorMessage}`,
				serverTime: null
			};
		}
	}

	return {
		isDbConfigured,
		connectionTest
	};
};

export const actions: Actions = {
	test: async () => {
		if (!isDbConfigured || !db) {
			return {
				success: false,
				message: 'DATABASE_URL est manquante dans votre fichier .env'
			};
		}

		try {
			const res = await db.execute(sql`SELECT NOW() AS current_time`);
			const row = res.rows[0] as { current_time?: string } | undefined;
			return {
				success: true,
				message: `Test réussi ! Heure serveur Neon : ${row?.current_time}`
			};
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : String(err);
			return {
				success: false,
				message: `Échec du test : ${msg}`
			};
		}
	}
};
