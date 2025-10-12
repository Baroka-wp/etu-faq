# Configuration Cloudinary pour ETU-Bénin

## 🔧 Configuration requise

### Variables d'environnement
Ajoutez ces variables à votre fichier `.env.local` :

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 📸 Upload Preset
Créez un upload preset dans votre dashboard Cloudinary :

1. **Nom du preset** : `etu_bibliotheque`
2. **Signing Mode** : `Unsigned`
3. **Folder** : `etu-bibliotheque`
4. **Transformation** : 
   - **Width** : 400px
   - **Height** : 600px
   - **Crop** : `fit`
   - **Quality** : `auto`

### 🗂️ Structure des dossiers
```
etu-bibliotheque/
├── covers/          # Images de couverture
├── thumbnails/      # Miniatures
└── originals/       # Images originales
```

## 🚀 Utilisation

### Upload d'images
```typescript
// L'API gère automatiquement :
// - Validation du type de fichier (images uniquement)
// - Validation de la taille (max 10MB)
// - Upload vers Cloudinary
// - Retour de l'URL sécurisée
```

### URLs générées
```
https://res.cloudinary.com/[cloud_name]/image/upload/v[version]/etu-bibliotheque/[filename]
```

## 🔒 Sécurité

### Upload Preset sécurisé
- **Unsigned uploads** : Pas besoin de signature côté client
- **Folder restriction** : Images stockées dans `etu-bibliotheque/`
- **Type restriction** : Images uniquement
- **Size limit** : 10MB maximum

### Transformations automatiques
- **Optimisation** : Qualité automatique
- **Redimensionnement** : 400x600px pour les couvertures
- **Format** : WebP pour de meilleures performances

## 📱 Intégration

### Dans l'admin
```typescript
// Upload automatique lors de la sélection d'image
const handleImageUpload = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', 'etu_bibliotheque')
  
  const response = await fetch('/api/admin/bibliotheque/upload', {
    method: 'POST',
    body: formData
  })
}
```

### Dans la bibliothèque publique
```typescript
// Affichage des images optimisées
<img 
  src={book.imageUrl} 
  alt={book.title}
  className="w-full h-full object-cover"
/>
```

## 🎯 Avantages

### Performance
- **CDN global** : Images servies rapidement partout
- **Optimisation automatique** : Formats et tailles adaptés
- **Lazy loading** : Chargement à la demande

### Gestion
- **Interface admin** : Upload facile avec preview
- **Organisation** : Dossier dédié ETU-Bénin
- **Sécurité** : Uploads contrôlés et sécurisés

### Coûts
- **Plan gratuit** : 25GB de stockage
- **Bandwidth** : 25GB de transfert/mois
- **Transformations** : Illimitées
