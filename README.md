# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project
npx sv create my-app
```

To recreate this project with the same configuration:

```sh
# recreate this project
npx sv@0.17.1 create --template minimal --types ts --add prettier eslint tailwindcss="plugins:typography,forms" --install npm ./
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

## Déploiement sur Vercel

Le projet utilise `@sveltejs/adapter-vercel`. Aucun `vercel.json` personnalisé n'est nécessaire pour le déploiement standard.

1. Importer le dépôt dans Vercel et laisser le framework SvelteKit détecter la configuration. La commande de build est `npm run build`.
2. Dans **Project Settings > Environment Variables**, configurer les variables suivantes pour chaque environnement concerné :

   - `DATABASE_URL` : URL Neon **pooled**, utilisée par l'application.
   - `ADMIN_USERNAME` : identifiant administrateur choisi.
   - `ADMIN_PASSWORD` : mot de passe administrateur unique et robuste.
   - `ADMIN_SECRET` : valeur aléatoire d'au moins 32 caractères, utilisée pour signer les sessions.

3. Utiliser une base Neon et des identifiants distincts pour les déploiements Preview et Production. Ne pas ajouter `DATABASE_URL_UNPOOLED` aux variables du runtime Vercel.
4. Avant la première mise en production, appliquer les migrations avec l'URL Neon directe : `DATABASE_URL_UNPOOLED="..." npm run db:migrate`.
5. Déployer, puis vérifier la page d'accueil, `/admin/login` et les fonctions qui utilisent la base.

Pour le développement local, copier `.env.example` vers `.env` et remplacer tous les exemples par des valeurs locales. Les variables d'environnement Vercel ne sont pas fournies automatiquement à une exécution locale.

Ne jamais committer `.env`. Si une chaîne de connexion ou un secret a été partagé, le révoquer et le remplacer avant le déploiement.
