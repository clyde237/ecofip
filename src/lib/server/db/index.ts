import { env } from '$env/dynamic/private';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema.js';
import dns from 'node:dns';

// Sur Linux/Node.js, forcer la résolution IPv4 en priorité pour éviter les timeouts IPv6 ENETUNREACH
try {
	dns.setDefaultResultOrder?.('ipv4first');
} catch {
	// Environnements sans support node:dns
}

const databaseUrl = env.DATABASE_URL;

export const isDbConfigured = Boolean(
	databaseUrl && databaseUrl.trim().length > 0 && !databaseUrl.includes('ep-xxx')
);

// Connexion Drizzle avec le driver serverless HTTP Neon (optimal pour Vercel)
export const db = isDbConfigured && databaseUrl ? drizzle(neon(databaseUrl), { schema }) : null;

export * from './schema.js';
