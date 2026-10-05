import { env } from '$env/dynamic/private';
import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema.js';
import dns from 'node:dns';
import net from 'node:net';

// Sur Linux/Node.js, forcer la résolution IPv4 et désactiver autoSelectFamily (Happy Eyeballs)
// pour éliminer définitivement les erreurs "fetch failed (ETIMEDOUT / ENETUNREACH)" vers Neon.
try {
	dns.setDefaultResultOrder?.('ipv4first');
} catch {
	// Environnements sans support node:dns
}

try {
	net.setDefaultAutoSelectFamily?.(false);
} catch {
	// Environnements sans support net.setDefaultAutoSelectFamily
}

// Wrapper fetch résilient avec 3 retries automatiques face aux micro-coupures réseau
neonConfig.fetchFunction = async (input: RequestInfo | URL, init?: RequestInit) => {
	let lastError: unknown;
	for (let attempt = 1; attempt <= 3; attempt++) {
		try {
			return await fetch(input, init);
		} catch (err) {
			lastError = err;
			if (attempt < 3) {
				await new Promise((resolve) => setTimeout(resolve, attempt * 150));
			}
		}
	}
	throw lastError;
};

const databaseUrl = env.DATABASE_URL;

export const isDbConfigured = Boolean(
	databaseUrl && databaseUrl.trim().length > 0 && !databaseUrl.includes('ep-xxx')
);

// Connexion Drizzle avec le driver serverless HTTP Neon (optimal pour Vercel)
export const db = isDbConfigured && databaseUrl ? drizzle(neon(databaseUrl), { schema }) : null;

export * from './schema.js';
