# Configuration Neon Database

## 🚀 Étapes pour configurer Neon

### 1. Créer un compte Neon
- Allez sur https://neon.tech
- Créez un compte (gratuit)
- Connectez votre GitHub si possible

### 2. Créer une base de données
- Cliquez sur "Create Project"
- Nom du projet : `etu-faq-db`
- Région : Europe (Frankfurt) ou US East
- Cliquez sur "Create"

### 3. Récupérer l'URL de connexion
- Dans votre dashboard Neon
- Allez dans "Connection Details"
- Copiez l'URI de connexion
- Format : `postgresql://username:password@host:port/database?sslmode=require`

### 4. Configurer dans Vercel
- Allez dans votre projet Vercel
- Settings > Environment Variables
- Ajoutez :
  ```
  DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
  ADMIN_PASSWORD=etu2024
  NODE_ENV=production
  ```

### 5. Créer les tables
Une fois configuré, exécutez localement :
```bash
npx prisma db push
```

## 🔧 Configuration locale

Créez un fichier `.env.local` avec :
```
DATABASE_URL="votre_url_neon_ici"
ADMIN_PASSWORD="etu2024"
NODE_ENV="development"
```

## ✅ Vérification

Pour tester la connexion :
```bash
npx prisma db push
npx prisma studio
```

Si tout fonctionne, vous verrez vos tables dans Prisma Studio !
