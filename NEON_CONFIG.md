# Configuration Neon Database

## 🚀 Étapes pour configurer Neon

### 1. Créer un compte Neon
1. Allez sur https://neon.tech
2. Créez un compte (gratuit)
3. Connectez votre GitHub si possible

### 2. Créer une base de données
1. Cliquez sur "Create Project"
2. Nom du projet : `etu-faq-db`
3. Région : Europe (Frankfurt) ou US East
4. Cliquez sur "Create"

### 3. Récupérer l'URL de connexion
1. Dans votre dashboard Neon
2. Allez dans "Connection Details"
3. Copiez l'URI de connexion
4. Format : `postgresql://username:password@host:port/database?sslmode=require`

### 4. Configurer localement
Créez un fichier `.env.local` avec :
```
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"
ADMIN_PASSWORD="etu2024"
NODE_ENV="development"
```

### 5. Créer les tables
```bash
npx prisma db push
```

### 6. Vérifier avec Prisma Studio
```bash
npx prisma studio
```

## 🔧 Configuration Vercel

Dans votre dashboard Vercel :
1. Settings > Environment Variables
2. Ajoutez :
   ```
   DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
   ADMIN_PASSWORD=etu2024
   NODE_ENV=production
   ```

## ✅ Test de connexion

Pour tester si tout fonctionne :
```bash
npx prisma db push
npx prisma studio
```

Si vous voyez vos tables dans Prisma Studio, c'est que tout fonctionne !
