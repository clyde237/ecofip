import { redirect, type RequestHandler } from '@sveltejs/kit';
import { destroyAdminSession } from '$lib/server/auth.js';

export const POST: RequestHandler = async ({ cookies }) => {
	destroyAdminSession(cookies);
	throw redirect(303, '/admin/login');
};

export const GET: RequestHandler = async ({ cookies }) => {
	destroyAdminSession(cookies);
	throw redirect(303, '/admin/login');
};
