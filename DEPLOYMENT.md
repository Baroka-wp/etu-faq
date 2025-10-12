# Guide de déploiement sur Vercel

## Variables d'environnement requises

Configurez ces variables dans votre dashboard Vercel :

```
DATABASE_URL=your_database_url_here
ADMIN_PASSWORD=etu2024
NODE_ENV=production
```

## Configuration Prisma

Le projet est configuré pour générer automatiquement le client Prisma lors du build :

- `package.json` : Script `build` modifié pour inclure `prisma generate`
- `vercel.json` : Configuration spécifique pour Vercel
- `postinstall` : Génération automatique après installation

## Base de données

Pour la production, utilisez une base de données PostgreSQL ou MySQL :

1. Créez une base de données sur un service comme PlanetScale, Supabase, ou Railway
2. Configurez la variable `DATABASE_URL` avec l'URL de votre base de données
3. Exécutez `npx prisma db push` pour créer les tables

## Déploiement

1. Connectez votre repository GitHub à Vercel
2. Configurez les variables d'environnement
3. Déployez automatiquement

Le build inclura automatiquement la génération du client Prisma.
