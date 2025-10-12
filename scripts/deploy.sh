#!/bin/bash

# Script de déploiement pour Vercel
echo "🚀 Démarrage du déploiement..."

# Générer le client Prisma
echo "📦 Génération du client Prisma..."
npx prisma generate

# Build de l'application
echo "🔨 Build de l'application..."
npm run build

echo "✅ Déploiement terminé !"
