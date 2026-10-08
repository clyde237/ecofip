<script lang="ts">
	import { SOCIAL_LINKS } from '$lib/config/social.js';
	import './layout.css';
	import { page } from '$app/state';
	import { Header, Footer, ToastContainer } from '$lib';
	import { env } from '$env/dynamic/public';
	import {
		LOGO_PATH,
		SITE_NAME,
		SITE_URL,
		absoluteUrl,
		jsonLdScriptTag
	} from '$lib/config/site.js';
	import { ORGANIZATION } from '$lib/data/camerounPourJesus.js';

	let { children } = $props();

	const isAdminRoute = $derived(page.url.pathname.startsWith('/admin'));

	// Identité de l'organisation pour Google (fiche de connaissances, logo dans les résultats)
	const organizationJsonLd = jsonLdScriptTag([
		{
			'@context': 'https://schema.org',
			'@type': 'Organization',
			'@id': `${SITE_URL}/#organization`,
			name: ORGANIZATION.name,
			alternateName: ORGANIZATION.legalName,
			url: SITE_URL,
			logo: absoluteUrl(LOGO_PATH),
			description: ORGANIZATION.description,
			parentOrganization: { '@type': 'Organization', name: ORGANIZATION.parentOrganization },
			founder: {
				'@type': 'Person',
				name: ORGANIZATION.founder,
				sameAs: SOCIAL_LINKS.map((social) => social.url)
			},
			areaServed: { '@type': 'Country', name: ORGANIZATION.country },
			address: {
				'@type': 'PostalAddress',
				addressLocality: 'Bafoussam',
				addressRegion: 'Ouest',
				addressCountry: 'CM'
			},
			contactPoint: {
				'@type': 'ContactPoint',
				contactType: 'customer support',
				telephone: '+237698352037',
				email: 'contact@ecofip.cm',
				availableLanguage: ['French', 'English']
			}
		},
		{
			'@context': 'https://schema.org',
			'@type': 'WebSite',
			'@id': `${SITE_URL}/#website`,
			name: SITE_NAME,
			url: SITE_URL,
			inLanguage: 'fr',
			publisher: { '@id': `${SITE_URL}/#organization` }
		}
	]);
</script>

<svelte:head>
	<link rel="icon" type="image/jpeg" href="/logo_ecofip.jpg" />
	<link rel="apple-touch-icon" href="/logo_ecofip.jpg" />
	<meta name="theme-color" content="#c8102e" />
	{#if env.PUBLIC_GOOGLE_SITE_VERIFICATION}
		<meta name="google-site-verification" content={env.PUBLIC_GOOGLE_SITE_VERIFICATION} />
	{/if}
	{#if !isAdminRoute}
		<!-- eslint-disable-next-line svelte/no-at-html-tags -- JSON statique échappé par jsonLdScriptTag -->
		{@html organizationJsonLd}
	{/if}
</svelte:head>

{#if isAdminRoute}
	<div class="min-h-screen bg-[#f8fafc]">
		{@render children()}
	</div>
	<ToastContainer />
{:else}
	<div class="flex min-h-screen flex-col bg-surface/30">
		<Header />
		<main class="flex-1 pt-20">
			{@render children()}
		</main>
		<Footer />
		<ToastContainer />
	</div>
{/if}
