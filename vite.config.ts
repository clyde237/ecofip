import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import dns from 'node:dns';
import net from 'node:net';

try {
	dns.setDefaultResultOrder?.('ipv4first');
	net.setDefaultAutoSelectFamily?.(false);
} catch {
	// Ignorer si non supporté
}

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()]
});
