# Configuration des Variables d'Environnement

## Variables Requises

### Base URL
Pour que les liens uniques fonctionnent correctement en production, vous devez définir :

```bash
NEXT_PUBLIC_BASE_URL="https://your-domain.vercel.app"
```

### Base de Données
```bash
DATABASE_URL="postgresql://username:password@host:port/database"
```

## Configuration Vercel

1. Allez dans votre projet Vercel
2. Settings → Environment Variables
3. Ajoutez :
   - `NEXT_PUBLIC_BASE_URL` = `https://your-domain.vercel.app`
   - `DATABASE_URL` = votre URL de base de données

## Détection Automatique

Le code utilise uniquement `NEXT_PUBLIC_BASE_URL` :
1. `NEXT_PUBLIC_BASE_URL` (production)
2. `http://localhost:3000` (fallback local uniquement)
