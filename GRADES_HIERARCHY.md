# Hiérarchie des Grades ETU-Bénin

## 🎓 Système de Grades

### 1. **EXPLORATEUR** (Grade d'entrée)
- **Description** : Ici il se prépare à commencer sa quête
- **Attribution** : Automatique lors de l'inscription
- **Statut** : Nouveau membre

### 2. **NÉOPHYTE**
- **Description** : Premier niveau d'initiation
- **Prérequis** : Avoir complété le grade Explorateur

### 3. **CONSTRUCTEUR**
- **Description** : Niveau de construction et d'édification
- **Prérequis** : Avoir complété le grade Néophyte

### 4. **NAVIGATEUR**
- **Description** : Niveau de navigation et de guidance
- **Prérequis** : Avoir complété le grade Constructeur

### 5. **ALCHIMISTE**
- **Description** : Niveau le plus élevé de transformation
- **Prérequis** : Avoir complété le grade Navigateur

## 🔄 Processus d'Attribution

### Inscription Automatique
- **Tous les nouveaux inscrits** reçoivent automatiquement le grade **"Explorateur"**
- **Aucune exception** - c'est le point de départ obligatoire
- **Base de données** : Grade par défaut configuré dans Prisma schema

### Progression
- **Manuelle** : L'administrateur peut modifier le grade via le dashboard
- **Séquentielle** : Les grades doivent être obtenus dans l'ordre
- **Validation** : Chaque progression doit être validée par l'administration

## 📚 Matériel de Formation

### PDF par Grade
- **Tous les grades** utilisent actuellement le même PDF : `cours_explorateur_yod.pdf`
- **Évolutif** : Possibilité d'ajouter des PDFs spécifiques par grade
- **Fallback** : Si le grade n'est pas reconnu, utilise le PDF par défaut

## 🛠️ Configuration Technique

### Base de Données
```sql
grade String @default("Explorateur")
```

### API d'Inscription
```typescript
grade: 'Explorateur'  // Forcé dans le code
```

### Mapping des PDFs
```typescript
const gradeToPdfMap = {
  'EXPLORATEUR': 'cours_explorateur_yod.pdf',
  'NÉOPHYTE': 'cours_explorateur_yod.pdf',
  'CONSTRUCTEUR': 'cours_explorateur_yod.pdf',
  'NAVIGATEUR': 'cours_explorateur_yod.pdf',
  'ALCHIMISTE': 'cours_explorateur_yod.pdf'
}
```
