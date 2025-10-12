# Configuration de déploiement Vercel

## Étapes pour résoudre l'erreur Prisma

### 1. Variables d'environnement dans Vercel

Dans votre dashboard Vercel, ajoutez ces variables :

```
DATABASE_URL=your_production_database_url
ADMIN_PASSWORD=etu2024
NODE_ENV=production
```

### 2. Base de données de production

Pour la production, vous devez utiliser une base de données PostgreSQL ou MySQL :

**Options recommandées :**
- **PlanetScale** (gratuit) : https://planetscale.com
- **Supabase** (gratuit) : https://supabase.com
- **Railway** (gratuit) : https://railway.app
- **Neon** (gratuit) : https://neon.tech

### 3. Configuration du schéma de base de données

Une fois votre base de données créée :

1. Copiez l'URL de connexion
2. Ajoutez-la comme `DATABASE_URL` dans Vercel
3. Exécutez `npx prisma db push` localement pour créer les tables

### 4. Scripts de build

Le projet est maintenant configuré avec :

- `package.json` : Script `build` inclut `prisma generate`
- `vercel.json` : Configuration spécifique pour Vercel
- `postinstall` : Génération automatique du client Prisma

### 5. Déploiement

1. Commitez et poussez vos changements
2. Vercel détectera automatiquement les changements
3. Le build inclura la génération du client Prisma

## Résolution de l'erreur

L'erreur `PrismaClientInitializationError` est maintenant résolue car :

1. ✅ `prisma generate` est exécuté pendant le build
2. ✅ Le client Prisma est généré avec les bonnes dépendances
3. ✅ La configuration Vercel est optimisée pour Prisma

## Test local

Pour tester localement :

```bash
npm run build
npm start
```

Cela simule le processus de build de Vercel.
