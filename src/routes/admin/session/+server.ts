import { json, type RequestHandler } from '@sveltejs/kit';

/**
 * État de la session administrateur, utilisé par le minuteur d'inactivité côté client.
 * - GET  : consulte le temps restant sans le prolonger (le hook ne compte pas cet appel comme activité).
 * - POST : signale une activité ; le hook a déjà repoussé l'expiration avant d'arriver ici.
 * Une session absente ou expirée n'atteint jamais ce handler : le hook redirige vers la connexion.
 */
const sessionStatus: RequestHandler = ({ locals }) => {
	if (!locals.admin || !locals.adminSession) {
		return json({ active: false }, { status: 401 });
	}

	return json(
		{
			active: true,
			expiresInMs: Math.max(locals.adminSession.expiresAt - Date.now(), 0),
			canExtend: locals.adminSession.canExtend
		},
		{ headers: { 'cache-control': 'no-store' } }
	);
};

export const GET = sessionStatus;
export const POST = sessionStatus;
