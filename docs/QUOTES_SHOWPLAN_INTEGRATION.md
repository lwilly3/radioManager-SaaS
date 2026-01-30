# 🔗 Intégration Citations ↔ Conducteurs

## Vue d'ensemble

Cette fonctionnalité permet de créer des citations **directement depuis un conducteur**, avec récupération automatique du contexte et des invités.

---

## 📍 Point d'entrée : ShowPlanDetail

### Bouton "Nouvelle citation"

**Localisation** : Header de la page détails du conducteur  
**Condition** : Visible uniquement si `permissions.quotes_create === true`  
**Action** : Navigue vers `/quotes/create` avec le contexte du conducteur

```tsx
<button
  onClick={() => navigate('/quotes/create', { 
    state: { showPlan } 
  })}
  className="btn bg-indigo-600 hover:bg-indigo-700 text-white"
>
  <Quote className="h-5 w-5" />
  <span>Nouvelle citation</span>
</button>
```

---

## 📝 Page CreateQuote : Pré-remplissage automatique

### 1. Récupération du contexte

```tsx
const showPlanContext = location.state?.showPlan;
```

**Données disponibles du conducteur :**
- `id` : ID du conducteur
- `title` : Titre du conducteur
- `emission` : Nom de l'émission
- `emission_id` : ID de l'émission
- `broadcast_date` / `date` : Date de diffusion
- `guests[]` : Liste des invités avec leurs informations complètes

### 2. Pré-remplissage du formulaire

**Champs automatiquement remplis :**
```tsx
{
  showName: showPlanContext.emission || showPlanContext.title,
  date: format(new Date(showDate), 'yyyy-MM-dd')
}
```

### 3. Sélecteur d'invités

**Interface** : Liste déroulante des invités du conducteur

```
┌─────────────────────────────────────────────────┐
│ Sélectionner un invité du conducteur           │
│ ┌─────────────────────────────────────────────┐ │
│ │ -- Saisir manuellement --                   │ │
│ │ Marie Lambert (Journaliste)                 │ │
│ │ Pierre Durand (Artiste)                     │ │
│ │ Sophie Martin (Expert)                      │ │
│ └─────────────────────────────────────────────┘ │
│ Les invités proviennent du conducteur          │
└─────────────────────────────────────────────────┘
```

**Comportement** :
- Sélection d'un invité → pré-remplit `authorName`, `authorRole`, `authorAvatar`
- Option "Saisir manuellement" → champs vides pour saisie libre

---

## 💾 Données sauvegardées

### Structure de la citation créée

```typescript
{
  content: "Cette interview était passionnante !",
  author: {
    name: "Marie Lambert",      // Depuis l'invité sélectionné
    role: "Journaliste",         // Depuis l'invité sélectionné
    avatar: "https://..."        // Depuis l'invité sélectionné
  },
  context: {
    showId: "123",               // ✅ ID du conducteur
    showPlanId: "123",           // ✅ ID du conducteur
    showName: "Morning Show",    // Pré-rempli
    emissionId: "5",             // ✅ ID de l'émission
    date: "2026-01-12",          // Pré-remplie
    timestamp: "01:23:45"        // Saisi manuellement
  },
  source: {
    type: "manual"
  },
  status: "draft",
  createdBy: "user123",
  createdAt: "2026-01-12T14:30:00Z"
}
```

**Champs critiques pour la liaison :**
- `context.showId` : Permet de retrouver le conducteur d'origine
- `context.showPlanId` : Identique à showId (redondance pour clarté)
- `context.emissionId` : Permet de filtrer par émission
- `context.showName` : Lisible par l'utilisateur

---

## 🔄 Flux complet

```
┌─────────────────┐
│  Conducteur     │
│  (ShowPlan)     │
└────────┬────────┘
         │
         │ Clic "Nouvelle citation"
         │ (permissions.quotes_create)
         ↓
┌─────────────────────────────────┐
│  CreateQuote                    │
│  ┌───────────────────────────┐  │
│  │ Contexte pré-rempli :     │  │
│  │  • Nom émission           │  │
│  │  • Date                   │  │
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │ Invités disponibles :     │  │
│  │  [Sélecteur dropdown]     │  │
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │ Formulaire complet        │  │
│  └───────────────────────────┘  │
└────────┬────────────────────────┘
         │
         │ Soumission
         ↓
┌─────────────────────────────────┐
│  Firebase Firestore             │
│  Collection: quotes             │
│  {                              │
│    context: {                   │
│      showPlanId: "123",         │
│      emissionId: "5",           │
│      ...                        │
│    }                            │
│  }                              │
└────────┬────────────────────────┘
         │
         │ Redirection
         ↓
┌─────────────────┐
│  Liste          │
│  Citations      │
│  (/quotes)      │
└─────────────────┘
```

---

## 🎯 Cas d'usage

### Scénario 1 : Citation d'un invité pendant l'émission

1. **Contexte** : Animateur écoute l'émission en direct
2. **Action** : Ouvre le conducteur en cours → Clic "Nouvelle citation"
3. **Résultat** : 
   - Contexte auto-rempli (émission, date)
   - Sélection rapide de l'invité qui vient de parler
   - Saisie de la citation
   - Sauvegarde avec liaison complète

### Scénario 2 : Préparation de citations après l'émission

1. **Contexte** : Production veut extraire les meilleures phrases
2. **Action** : Consulte les archives → Ouvre un conducteur passé
3. **Résultat** : 
   - Création de plusieurs citations depuis le même conducteur
   - Toutes liées automatiquement
   - Contexte cohérent pour toutes

### Scénario 3 : Citation sans conducteur

1. **Contexte** : Citation spontanée non liée à une émission
2. **Action** : Aller directement sur `/quotes` → "Nouvelle citation"
3. **Résultat** : 
   - Formulaire vierge
   - Saisie manuelle de tous les champs
   - Pas de liaison à un conducteur

---

## 📊 Avantages de l'intégration

### ✅ Pour l'utilisateur

- **Gain de temps** : Pas de ressaisie du contexte
- **Cohérence** : Données exactes du conducteur
- **Simplicité** : Sélection rapide des invités
- **Traçabilité** : Lien clair entre citation et émission

### ✅ Pour les données

- **Intégrité** : Relations claires entre entités
- **Requêtes** : Filtrage par émission/conducteur possible
- **Statistiques** : Comptage de citations par émission
- **Audit** : Historique complet

---

## 🔮 Évolutions futures possibles

1. **Filtrage dans la liste des citations**
   - Par émission
   - Par conducteur
   - Par invité

2. **Onglet Citations dans ShowPlanDetail**
   - Afficher toutes les citations liées au conducteur
   - Créer directement depuis cet onglet

3. **Export PDF du conducteur avec citations**
   - Inclure les citations marquantes
   - Section dédiée dans le PDF

4. **Suggestions automatiques**
   - IA détecte les phrases intéressantes dans la transcription
   - Propose des citations pré-remplies

5. **Statistiques par émission**
   - Nombre de citations par émission
   - Invités les plus cités
   - Catégories populaires

---

## 🧪 Tests à effectuer

### Test d'intégration complet

1. ✅ Créer un conducteur avec 2-3 invités
2. ✅ Ouvrir les détails du conducteur
3. ✅ Vérifier la présence du bouton "Nouvelle citation"
4. ✅ Cliquer et vérifier le pré-remplissage
5. ✅ Sélectionner chaque invité → vérifier l'auto-remplissage
6. ✅ Créer la citation
7. ✅ Vérifier dans Firestore :
   - `context.showPlanId` == ID du conducteur
   - `context.emissionId` == ID de l'émission
   - `context.showName` == Nom correct
8. ✅ Retourner sur le conducteur → créer une 2e citation
9. ✅ Vérifier que les deux citations ont le même contexte

### Test de permissions

1. ✅ Utilisateur SANS `quotes_create` → bouton invisible
2. ✅ Utilisateur AVEC `quotes_create` → bouton visible

### Test de robustesse

1. ✅ Conducteur sans invités → sélecteur non affiché
2. ✅ Conducteur sans date → champ date vide
3. ✅ Modification manuelle après sélection invité → OK

---

## 📝 Notes techniques

### Types modifiés

```typescript
// context.ts
interface Context {
  showId?: string;         // Ajouté
  showPlanId?: string;     // Ajouté
  showName?: string;       // Ajouté
  emissionId?: string;     // Existait déjà
  date?: string;
  timestamp?: string;
}
```

### Composants modifiés

1. **ShowPlanDetail.tsx**
   - Import de `Quote` icon
   - Import de `useAuthStore`
   - Ajout du bouton conditionnel

2. **CreateQuote.tsx**
   - Récupération de `location.state.showPlan`
   - `useEffect` pour pré-remplissage
   - Passage de `showPlanGuests` au formulaire
   - Enrichissement du contexte avec IDs

3. **QuoteForm.tsx**
   - Prop `showPlanGuests` optionnelle
   - Sélecteur d'invités conditionnel
   - Handler `handleGuestSelect`

---

## 🎉 Résultat

Une intégration fluide qui transforme la création de citations en un processus **contextuel**, **rapide** et **cohérent** !
