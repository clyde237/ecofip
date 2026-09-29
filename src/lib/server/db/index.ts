import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema.js';

const databaseUrl = process.env.DATABASE_URL;

export const isDbConfigured = Boolean(
	databaseUrl && databaseUrl.trim().length > 0 && !databaseUrl.includes('ep-xxx')
);

// Connexion Drizzle avec le driver serverless HTTP Neon (optimal pour Vercel)
export const db = isDbConfigured && databaseUrl ? drizzle(neon(databaseUrl), { schema }) : null;

export * from './schema.js';
