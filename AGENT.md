# 🤖 AGENT.md - Guide pour les Agents IA

> Ce document est destiné aux agents IA (Claude, GPT, Copilot, etc.) travaillant sur le projet RadioManager SaaS.
> Il définit les règles, conventions et bonnes pratiques à respecter pour maintenir la cohérence et la qualité du code.

---

## 📚 Documents de référence

| Document | Description |
|----------|-------------|
| [`AGENT.md`](AGENT.md) | Ce guide - Conventions et règles pour les agents IA |
| [`CHANGELOG.md`](CHANGELOG.md) | **Historique des modifications** - Contexte et décisions |
| [`README.md`](README.md) | Documentation générale du projet |
| [`docs/GIT_WORKFLOW.md`](docs/GIT_WORKFLOW.md) | **🌿 Stratégie de branches** - develop/main, déploiements |
| [`docs/VERSIONING.md`](docs/VERSIONING.md) | **🏷️ Gestion des versions** - SemVer, CHANGELOG |
| [`docs/API_MIGRATION_GUIDE.md`](docs/API_MIGRATION_GUIDE.md) | Guide de migration des URLs API |
| [`docs/modules/`](docs/modules/) | Documentation technique par module |
| [`docs/business/`](docs/business/) | Documentation métier |

> **⚠️ Important :** Consultez `CHANGELOG.md` pour comprendre l'historique et le contexte des modifications récentes avant d'effectuer des changements.
>
> **🌿 Branches :** Consultez `docs/GIT_WORKFLOW.md` pour savoir sur quelle branche travailler (develop = test, main = production).

---

## 🚀 Règle de Push - À LIRE EN PRIORITÉ

```
┌─────────────────────────────────────────────────────────────────────┐
│  ⚠️  QUAND L'UTILISATEUR DIT "POUSSE LE CODE" OU "PUSH"            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  PAR DÉFAUT → Pousser sur develop (serveur TEST)                   │
│                                                                     │
│  git checkout develop                                               │
│  git add -A                                                         │
│  git commit -m "📝 type(scope): Description"                        │
│  git push origin develop                                            │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│  UNIQUEMENT si l'utilisateur dit "sur main" ou "en production" :   │
│                                                                     │
│  git checkout main                                                  │
│  git merge develop                                                  │
│  git push origin main                                               │
│                                                                     │
│  ⚠️ Demander confirmation avant de pousser sur main !               │
└─────────────────────────────────────────────────────────────────────┘
```

---

## ✅ Règle de Confirmation de Fix - AUTOMATIQUE

```
┌─────────────────────────────────────────────────────────────────────┐
│  ⚠️  QUAND L'UTILISATEUR DIT "PROBLÈME RÉSOLU" OU "ÇA MARCHE"      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  L'AGENT DOIT AUTOMATIQUEMENT :                                    │
│                                                                     │
│  1. Faire un résumé rapide du fix appliqué                         │
│  2. Préparer le message de commit descriptif                       │
│  3. DÉTERMINER L'IMPACT SUR LA VERSION (voir règle ci-dessous)     │
│  4. DEMANDER CONFIRMATION : "Voulez-vous que je pousse sur         │
│     develop ? Version X.Y.Z → X.Y.W"                               │
│  5. Si oui → mettre à jour package.json + CHANGELOG.md             │
│  6. Commit et push sur develop                                     │
│                                                                     │
│  EXEMPLE :                                                         │
│  "Fix appliqué. Voulez-vous que je pousse sur develop ?            │
│   Version 1.0.0 → 1.0.1 (patch fix)"                               │
│                                                                     │
│  💡 Toujours demander confirmation avant de push !                  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🏷️ Gestion des Versions - Semantic Versioning (SemVer)

```
┌─────────────────────────────────────────────────────────────────────┐
│  📦 FORMAT DE VERSION : MAJOR.MINOR.PATCH (ex: 1.2.3)              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  🔴 MAJOR (X.0.0) - Changement INCOMPATIBLE                        │
│     → Rupture de l'API existante                                   │
│     → Migration nécessaire pour les utilisateurs                   │
│     → Exemple: Refonte complète d'un module                        │
│                                                                     │
│  🟡 MINOR (0.X.0) - Nouvelle FONCTIONNALITÉ                        │
│     → Ajout de feature rétrocompatible                             │
│     → Nouvelle page, nouveau module, nouvelle API                  │
│     → Exemple: Ajout d'un système de notifications                 │
│                                                                     │
│  🟢 PATCH (0.0.X) - Correction de BUG                              │
│     → Fix de bug sans changement d'API                             │
│     → Amélioration de performance                                  │
│     → Correction de typo, style                                    │
│     → Exemple: Fix de persistance formulaire                       │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│  📝 CORRESPONDANCE EMOJI → VERSION                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  🐛 fix      → PATCH   (+0.0.1)                                    │
│  🔧 chore    → PATCH   (+0.0.1)                                    │
│  ⚡ perf     → PATCH   (+0.0.1)                                    │
│  🎨 style    → PATCH   (+0.0.1)                                    │
│  ♻️  refactor → PATCH   (+0.0.1)                                    │
│  ✨ feat     → MINOR   (+0.1.0) - reset PATCH à 0                  │
│  🆕 new      → MINOR   (+0.1.0)                                    │
│  💥 breaking → MAJOR   (+1.0.0) - reset MINOR et PATCH à 0         │
│  📝 docs     → Pas de changement de version                        │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│  🔄 PROCESSUS DE MISE À JOUR                                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. Lire version actuelle: cat package.json | grep version         │
│  2. Calculer nouvelle version selon le type de changement          │
│  3. Mettre à jour package.json                                     │
│  4. Ajouter entrée dans CHANGELOG.md avec date et description      │
│  5. Commit avec message incluant la nouvelle version               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Fichiers à mettre à jour lors d'un changement de version

| Fichier | Modification |
|---------|--------------|
| `package.json` | Champ `"version": "X.Y.Z"` |
| `CHANGELOG.md` | Nouvelle entrée avec date, version, description |

### Format d'entrée CHANGELOG.md

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Type de changement
- Description du changement
- Fichiers impactés si pertinent

### Exemples :
## [1.0.1] - 2025-12-12
### 🐛 Corrections
- Fix persistance des champs formulaire ShowPlan lors de l'ajout de segments
- Création du store useShowPlanFormStore

## [1.1.0] - 2025-12-15
### ✨ Nouvelles fonctionnalités
- Ajout du système de notifications en temps réel
- Nouvelle page de gestion des archives
```

---

## 🔴 Qualité du Code - Approche Professionnelle

```
┌─────────────────────────────────────────────────────────────────────┐
│  ⚠️  RÈGLES OBLIGATOIRES POUR TOUT AGENT IA                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. TOUJOURS VÉRIFIER AVANT D'IMPORTER UN TYPE :                   │
│     → grep_search "export.*TypeName|interface TypeName"            │
│     → Ne JAMAIS supposer qu'un type existe dans ../types           │
│     → Vérifier le fichier exact d'export                           │
│                                                                     │
│  2. APRÈS CHAQUE MODIFICATION :                                    │
│     → get_errors sur les fichiers modifiés                         │
│     → Corriger TOUTES les erreurs avant de continuer               │
│                                                                     │
│  3. AVANT DE DIRE "C'EST TERMINÉ" :                                │
│     → npm run build DOIT passer sans erreur                        │
│     → Aucune erreur TypeScript acceptée                            │
│                                                                     │
│  4. SI UNE ERREUR EST SIGNALÉE PAR L'UTILISATEUR :                 │
│     → S'excuser et corriger immédiatement                          │
│     → Ajouter des vérifications pour éviter la récidive            │
│                                                                     │
│  💡 La qualité prime sur la rapidité !                              │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📋 Table des matières

1. [Présentation du projet](#-présentation-du-projet)
2. [Architecture et structure](#-architecture-et-structure)
3. [Conventions de code](#-conventions-de-code)
4. [Design System et UI](#-design-system-et-ui)
5. [Patterns et bonnes pratiques](#-patterns-et-bonnes-pratiques)
6. [Gestion d'état](#-gestion-détat)
7. [Appels API](#-appels-api)
8. [Système de permissions](#-système-de-permissions)
9. [Gestion des versions](#-gestion-des-versions)
10. [Documentation du code](#-documentation-du-code)
11. [Tests et validation](#-tests-et-validation)
12. [Checklist avant modification](#-checklist-avant-modification)

---

## 🎯 Présentation du projet

### Contexte

**RadioManager SaaS** est une application de gestion pour radios professionnelles permettant :
- La planification d'émissions via des conducteurs (show plans)
- La gestion des équipes (animateurs, invités, techniciens)
- La communication temps réel (chat Firebase)
- La gestion des tâches (Kanban)
- L'administration des utilisateurs et permissions

### Stack technique

| Technologie | Version | Usage |
|-------------|---------|-------|
| React | 18.2.0 | Framework UI |
| TypeScript | 5.2.2 | Typage statique |
| Vite | 5.0.0 | Build tool |
| TailwindCSS | 3.3.5 | Styling |
| Zustand | 4.4.7 | State management |
| React Query | 5.0.0 | Data fetching |
| Firebase | 10.7.1 | Real-time (chat, tasks) |
| Axios | 1.6.2 | HTTP client |
| React Hook Form | 7.48.2 | Forms |
| Zod | 3.22.4 | Validation |
| React Router | 6.21.1 | Routing |
| Lucide React | 0.309.0 | Icons |

### URLs importantes

| Environnement | URL |
|---------------|-----|
| Frontend (prod) | https://app.cloud.audace.ovh |
| API Backend | https://api.cloud.audace.ovh |
| Dokploy | https://cloud.audace.ovh:3000 |

---

## 🏗️ Architecture et structure

### Structure des dossiers

```
src/
├── api/                    # Configuration Axios centralisée
│   ├── api.ts              # Instance Axios avec baseURL
│   ├── auth.ts             # Endpoints authentification
│   └── firebase/           # Configuration Firebase
│
├── components/             # Composants React
│   ├── Layout.tsx          # Layout principal
│   ├── archives/           # Composants archives
│   ├── audio/              # Lecteur radio
│   ├── auth/               # Composants auth
│   ├── chat/               # Composants chat
│   ├── common/             # Composants partagés
│   ├── dashboard/          # Composants dashboard
│   ├── guests/             # Composants invités
│   ├── rundowns/           # Composants rundowns
│   ├── settings/           # Composants paramètres
│   ├── showPlans/          # Composants conducteurs
│   ├── shows/              # Composants émissions
│   ├── sidebar/            # Navigation
│   ├── tasks/              # Composants tâches
│   ├── team/               # Composants équipe
│   ├── ui/                 # Composants UI réutilisables
│   ├── users/              # Composants utilisateurs
│   └── util/               # Composants utilitaires
│
├── hooks/                  # Hooks React personnalisés
│   ├── auth/               # Hooks authentification
│   ├── Chat/               # Hooks chat
│   ├── dashboard/          # Hooks dashboard
│   ├── guests/             # Hooks invités
│   ├── permissions/        # Hooks permissions
│   ├── presenters/         # Hooks animateurs
│   ├── show/               # Hooks émissions
│   ├── shows/              # Hooks conducteurs
│   └── status/             # Hooks statuts
│
├── pages/                  # Pages/Routes
│   ├── guests/             # Pages invités
│   ├── shows/              # Pages émissions
│   ├── team/               # Pages équipe
│   ├── users/              # Pages utilisateurs
│   └── auth/               # Pages auth
│
├── services/api/           # Services d'appels API
│   ├── shows.ts            # API conducteurs
│   ├── emissions.ts        # API émissions
│   ├── guests.ts           # API invités
│   ├── presenters.ts       # API animateurs
│   ├── users.ts            # API utilisateurs
│   ├── roles.ts            # API rôles
│   └── status.ts           # API statuts
│
├── store/                  # Stores Zustand
│   ├── useAuthStore.ts     # État auth + permissions
│   ├── useShowPlanStore.ts # État conducteurs
│   ├── useChatStore.ts     # État chat (Firebase)
│   ├── useTaskStore.ts     # État tâches (Firebase)
│   ├── useGuestStore.ts    # État invités
│   ├── usePresenterStore.ts# État animateurs
│   └── useVersionStore.ts  # État versions
│
├── types/                  # Types TypeScript
│   ├── index.ts            # Types principaux
│   ├── api.ts              # Types API
│   ├── auth.ts             # Types auth
│   ├── emission.ts         # Types émissions
│   ├── guest.ts            # Types invités
│   ├── task.ts             # Types tâches
│   └── chat.ts             # Types chat
│
├── schemas/                # Schemas Zod
│   ├── authSchema.ts
│   ├── guestSchema.ts
│   ├── showPlanSchema.ts
│   └── userSchema.ts
│
├── utils/                  # Utilitaires
├── mocks/                  # Données mock
└── lib/                    # Configurations libs
```

### Pattern de création de module

Pour créer un nouveau module, suivre cet ordre :

1. **Types** → `src/types/newModule.ts`
2. **Schema Zod** → `src/schemas/newModuleSchema.ts`
3. **Service API** → `src/services/api/newModule.ts`
4. **Store Zustand** → `src/store/useNewModuleStore.ts`
5. **Hook** → `src/hooks/newModule/useNewModule.ts`
6. **Composants** → `src/components/newModule/`
7. **Page** → `src/pages/NewModule.tsx`
8. **Route** → Ajouter dans `App.tsx`
9. **Documentation** → `docs/modules/new-module.md`

---

## 📝 Conventions de code

### Nommage

| Élément | Convention | Exemple |
|---------|------------|---------|
| Fichiers composants | PascalCase | `ShowPlanCard.tsx` |
| Fichiers hooks | camelCase avec `use` | `useShows.ts` |
| Fichiers stores | camelCase avec `use...Store` | `useAuthStore.ts` |
| Fichiers services | camelCase | `shows.ts` |
| Fichiers types | camelCase | `showPlan.ts` |
| Composants | PascalCase | `const ShowPlanCard = () => {}` |
| Hooks | camelCase avec `use` | `const useShows = () => {}` |
| Variables | camelCase | `const showPlanData = {}` |
| Constantes | SCREAMING_SNAKE_CASE | `const API_BASE_URL = ''` |
| Types/Interfaces | PascalCase | `interface ShowPlan {}` |
| Enums | PascalCase | `enum ShowStatus {}` |

### Structure d'un composant

```tsx
// 1. Imports - Groupés par catégorie
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock } from 'lucide-react';

// Imports internes
import { useAuthStore } from '../store/useAuthStore';
import { showsApi } from '../services/api/shows';
import type { ShowPlan } from '../types';

// 2. Types/Interfaces locaux
interface ShowPlanCardProps {
  show: ShowPlan;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

// 3. Composant avec JSDoc
/**
 * Carte d'affichage d'un conducteur.
 * Affiche les informations principales et les actions disponibles.
 * 
 * @param show - Données du conducteur
 * @param onEdit - Callback pour l'édition
 * @param onDelete - Callback pour la suppression
 */
const ShowPlanCard: React.FC<ShowPlanCardProps> = ({ 
  show, 
  onEdit, 
  onDelete 
}) => {
  // 4. Hooks en premier
  const navigate = useNavigate();
  const { permissions } = useAuthStore();
  
  // 5. State local
  const [isLoading, setIsLoading] = useState(false);
  
  // 6. Effects
  useEffect(() => {
    // ...
  }, []);
  
  // 7. Handlers
  const handleEdit = () => {
    onEdit?.(show.id);
  };
  
  // 8. Render helpers (optionnel)
  const renderStatus = () => (
    <span className={`badge badge-${show.status}`}>
      {show.status}
    </span>
  );
  
  // 9. Early returns
  if (!show) return null;
  
  // 10. JSX principal
  return (
    <div className="bg-white rounded-lg shadow p-4">
      {/* Contenu */}
    </div>
  );
};

// 11. Export
export default ShowPlanCard;
```

### Structure d'un hook

```tsx
import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { showsApi } from '../services/api/shows';
import type { ShowPlan } from '../types';

/**
 * Hook pour gérer les conducteurs.
 * Fournit les données et actions CRUD.
 * 
 * @returns Données, état de chargement, erreur et actions
 */
export const useShows = () => {
  const token = useAuthStore((state) => state.token);
  
  const [shows, setShows] = useState<ShowPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchShows = useCallback(async () => {
    if (!token) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await showsApi.getAll(token);
      setShows(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur de chargement');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchShows();
  }, [fetchShows]);

  return { 
    shows, 
    isLoading, 
    error, 
    refetch: fetchShows 
  };
};
```

### Structure d'un store Zustand

```tsx
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface MyState {
  // État
  items: Item[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setItems: (items: Item[]) => void;
  addItem: (item: Item) => void;
  updateItem: (id: string, data: Partial<Item>) => void;
  removeItem: (id: string) => void;
  clearError: () => void;
}

export const useMyStore = create<MyState>()(
  persist(
    (set, get) => ({
      // État initial
      items: [],
      isLoading: false,
      error: null,
      
      // Actions
      setItems: (items) => set({ items }),
      
      addItem: (item) => set((state) => ({ 
        items: [...state.items, item] 
      })),
      
      updateItem: (id, data) => set((state) => ({
        items: state.items.map((item) => 
          item.id === id ? { ...item, ...data } : item
        ),
      })),
      
      removeItem: (id) => set((state) => ({
        items: state.items.filter((item) => item.id !== id),
      })),
      
      clearError: () => set({ error: null }),
    }),
    {
      name: 'my-store-storage', // Clé localStorage
      partialize: (state) => ({ 
        items: state.items // Ne persister que certains champs
      }),
    }
  )
);
```

---

## 🎨 Design System et UI

### Couleurs principales

```css
/* Couleur primaire - Indigo */
--primary-50: #eef2ff;
--primary-100: #e0e7ff;
--primary-500: #6366f1;
--primary-600: #4f46e5;  /* Couleur principale */
--primary-700: #4338ca;
--primary-800: #3730a3;

/* Couleurs de fond */
--bg-primary: #f9fafb;   /* gray-50 */
--bg-secondary: #ffffff; /* white */

/* Couleurs de texte */
--text-primary: #111827;   /* gray-900 */
--text-secondary: #6b7280; /* gray-500 */
```

### Classes CSS utilitaires

Utiliser les classes définies dans `src/index.css` :

```css
/* Boutons */
.btn                 /* Base button */
.btn-primary         /* Bouton principal (indigo) */
.btn-secondary       /* Bouton secondaire (gray) */

/* Inputs */
.form-input          /* Input standard */
.form-textarea       /* Textarea standard */

/* Grilles */
.responsive-grid     /* Grid responsive 1/2/3 colonnes */

/* Textes */
.text-responsive     /* Texte adaptatif */
.heading-responsive  /* Titre adaptatif */

/* Espacements */
.padding-responsive  /* Padding adaptatif */
.margin-responsive   /* Margin adaptatif */

/* Flex */
.flex-responsive     /* Flex column sur mobile, row sur desktop */
```

### Composants UI standards

#### Boutons

```tsx
// Bouton primaire
<button className="btn btn-primary">
  Action principale
</button>

// Bouton secondaire
<button className="btn btn-secondary">
  Action secondaire
</button>

// Bouton avec icône
<button className="btn btn-primary flex items-center gap-2">
  <Plus className="w-4 h-4" />
  Ajouter
</button>

// Bouton ghost (transparent)
<button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
  <Settings className="w-5 h-5 text-gray-500" />
</button>
```

#### Cards

```tsx
<div className="bg-white rounded-lg shadow p-4">
  <h3 className="font-semibold text-gray-900">{title}</h3>
  <p className="text-gray-500 text-sm mt-1">{description}</p>
</div>
```

#### Inputs

```tsx
<input
  type="text"
  className="form-input"
  placeholder="Saisir..."
/>

<textarea
  className="form-textarea"
  rows={4}
  placeholder="Description..."
/>
```

#### Badges de statut

```tsx
// Pattern pour les badges de statut
const statusColors = {
  draft: 'bg-gray-100 text-gray-700',
  review: 'bg-yellow-100 text-yellow-700',
  ready: 'bg-green-100 text-green-700',
  live: 'bg-red-100 text-red-700',
  done: 'bg-blue-100 text-blue-700',
  archived: 'bg-purple-100 text-purple-700',
};

<span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[status]}`}>
  {status}
</span>
```

### Layout responsive

```tsx
// Layout principal
<div className="min-h-screen bg-gray-50">
  <Sidebar />
  <main className="pt-16 lg:pt-0 lg:ml-64 p-4 lg:p-8">
    {children}
  </main>
</div>

// Grille responsive
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => <Card key={item.id} />)}
</div>

// Flex responsive
<div className="flex flex-col sm:flex-row gap-4">
  <div className="flex-1">...</div>
  <div className="flex-1">...</div>
</div>
```

### Icônes (Lucide React)

```tsx
import { 
  Calendar, 
  Clock, 
  User, 
  Settings, 
  Plus, 
  Edit, 
  Trash2,
  ChevronRight,
  Search,
  Filter,
  Download,
  Upload
} from 'lucide-react';

// Utilisation standard
<Calendar className="w-5 h-5 text-gray-500" />

// Dans un bouton
<button className="flex items-center gap-2">
  <Plus className="w-4 h-4" />
  Ajouter
</button>
```

### ⚠️ Règles UI à respecter

1. **Ne pas modifier** les classes utilitaires dans `index.css`
2. **Utiliser TailwindCSS** pour tout nouveau styling
3. **Respecter** la palette de couleurs indigo/gray
4. **Conserver** les tailles de boutons (min 44px pour mobile)
5. **Toujours** tester le responsive (mobile first)
6. **Utiliser** Lucide React pour les icônes (pas d'autres librairies)

---

## 🔄 Patterns et bonnes pratiques

### Gestion des erreurs API

```tsx
try {
  const response = await api.get('/endpoint');
  return response.data;
} catch (error: any) {
  // Gestion 401 - Session expirée
  if (error.response?.status === 401) {
    logout();
    navigate('/login');
    return;
  }
  
  // Gestion autres erreurs
  const message = error.response?.data?.detail 
    || error.response?.data?.message 
    || 'Une erreur est survenue';
  
  throw new Error(message);
}
```

### Vérification des permissions

```tsx
const { permissions } = useAuthStore();

// Dans le JSX
{permissions?.can_create_showplan && (
  <button onClick={handleCreate}>Créer</button>
)}

// Ou avec un guard
if (!permissions?.can_acces_showplan_section) {
  return <AccessDenied />;
}
```

### Chargement et états vides

```tsx
// Pattern standard
if (isLoading) {
  return (
    <div className="flex justify-center py-8">
      <div className="spinner" />
    </div>
  );
}

if (error) {
  return (
    <div className="text-center py-8 text-red-600">
      {error}
    </div>
  );
}

if (!data || data.length === 0) {
  return (
    <div className="text-center py-8 text-gray-500">
      Aucun élément trouvé
    </div>
  );
}

return <DataList data={data} />;
```

### Navigation et redirections

```tsx
import { useNavigate, Link } from 'react-router-dom';

// Navigation programmatique
const navigate = useNavigate();
navigate('/show-plans');
navigate(-1); // Retour

// Liens
<Link to="/show-plans/create" className="btn btn-primary">
  Créer
</Link>
```

---

## 💾 Gestion d'état

### Quand utiliser quoi

| Besoin | Solution |
|--------|----------|
| État global persisté | Zustand avec `persist` |
| État global non persisté | Zustand simple |
| État serveur (cache) | React Query |
| État local simple | `useState` |
| État local complexe | `useReducer` |
| Temps réel | Firebase Firestore |

### Stores existants

| Store | Usage | Persisté |
|-------|-------|----------|
| `useAuthStore` | Auth, user, permissions | ✅ |
| `useShowPlanStore` | Conducteur en cours d'édition | ✅ |
| `useChatStore` | Messages, salons (Firebase) | ❌ |
| `useTaskStore` | Tâches (Firebase) | ❌ |
| `useGuestStore` | Invités | ❌ |
| `usePresenterStore` | Animateurs | ❌ |
| `useVersionStore` | Version app | ✅ |
| `useUserPreferencesStore` | Préférences UI | ✅ |

---

## 🔌 Appels API

### Configuration centralisée

```tsx
// src/api/api.ts
import axios from 'axios';

const DEFAULT_API_BASE_URL = 'https://api.cloud.audace.ovh';
const API_BASE_URL = (import.meta.env?.VITE_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/+$/, '');

const api = axios.create({
  baseURL: API_BASE_URL,
});

export { API_BASE_URL };
export default api;
```

### Pattern de service API

```tsx
// src/services/api/myModule.ts
import api from '../../api/api';
import type { MyType } from '../../types/myType';

export const myModuleApi = {
  getAll: async (token: string): Promise<MyType[]> => {
    const response = await api.get('/my-endpoint', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  getById: async (token: string, id: string): Promise<MyType> => {
    const response = await api.get(`/my-endpoint/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  create: async (token: string, data: CreateMyTypeData): Promise<MyType> => {
    const response = await api.post('/my-endpoint', data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  update: async (token: string, id: string, data: UpdateMyTypeData): Promise<MyType> => {
    const response = await api.put(`/my-endpoint/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  delete: async (token: string, id: string): Promise<void> => {
    await api.delete(`/my-endpoint/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};
```

### ⚠️ Règles API

1. **Toujours** utiliser l'instance `api` de `src/api/api.ts`
2. **Ne jamais** hardcoder d'URL
3. **Toujours** passer le token dans les headers
4. **Gérer** les erreurs 401 (logout automatique)

### 🔄 Migration d'URL API

> **📖 Guide complet :** [`docs/API_MIGRATION_GUIDE.md`](docs/API_MIGRATION_GUIDE.md)

Si l'utilisateur demande de changer l'URL de l'API (par exemple de `api.radio.audace.ovh` vers `api.cloud.audace.ovh`), voici les fichiers à modifier :

| Fichier | Modification |
|---------|--------------|
| `src/api/api.ts` | Modifier `DEFAULT_API_BASE_URL` |
| `src/api/auth.ts` | Utiliser l'instance `api` (pas d'URL hardcodée) |
| `src/services/api/emissions.ts` | Supprimer `API_URL` si présente |
| `src/services/api/shows.ts` | Supprimer `API_URL` si présente |

#### Commande rapide pour trouver les URLs hardcodées

```bash
grep -rn "https://api\." src/
```

#### Modification de `src/api/api.ts`

```typescript
// Changer UNIQUEMENT cette ligne :
const DEFAULT_API_BASE_URL = 'https://NOUVELLE_URL_ICI';
```

#### Vérification après modification

```bash
# Vérifier qu'une seule URL existe
grep -rn "api.cloud.audace.ovh\|api.radio.audace.ovh" src/
# Résultat attendu : seulement src/api/api.ts
```

---

## 🔐 Système de permissions

### Liste des 46 permissions

```typescript
interface UserPermissions {
  user_id: number;
  
  // Conducteurs (13)
  can_acces_showplan_broadcast_section: boolean;
  can_acces_showplan_section: boolean;
  can_create_showplan: boolean;
  can_edit_showplan: boolean;
  can_archive_showplan: boolean;
  can_archiveStatusChange_showplan: boolean;
  can_delete_showplan: boolean;
  can_destroy_showplan: boolean;
  can_changestatus_showplan: boolean;
  can_changestatus_owned_showplan: boolean;
  can_changestatus_archived_showplan: boolean;
  can_setOnline_showplan: boolean;
  can_viewAll_showplan: boolean;
  
  // Utilisateurs (7)
  can_acces_users_section: boolean;
  can_view_users: boolean;
  can_edit_users: boolean;
  can_desable_users: boolean;
  can_delete_users: boolean;
  can_manage_roles: boolean;
  can_assign_roles: boolean;
  
  // Invités (4)
  can_acces_guests_section: boolean;
  can_view_guests: boolean;
  can_edit_guests: boolean;
  can_delete_guests: boolean;
  
  // Animateurs (4)
  can_acces_presenters_section: boolean;
  can_view_presenters: boolean;
  can_edit_presenters: boolean;
  can_delete_presenters: boolean;
  
  // Émissions (6)
  can_acces_emissions_section: boolean;
  can_view_emissions: boolean;
  can_create_emissions: boolean;
  can_edit_emissions: boolean;
  can_delete_emissions: boolean;
  can_manage_emissions: boolean;
  
  // Système (5)
  can_view_notifications: boolean;
  can_manage_notifications: boolean;
  can_view_audit_logs: boolean;
  can_view_login_history: boolean;
  can_manage_settings: boolean;
  
  // Messages (6)
  can_view_messages: boolean;
  can_send_messages: boolean;
  can_delete_messages: boolean;
  can_view_files: boolean;
  can_upload_files: boolean;
  can_delete_files: boolean;
  
  granted_at: string;
}
```

### Vérification dans les composants

```tsx
const { permissions } = useAuthStore();

// Conditionnel simple
{permissions?.can_create_showplan && <CreateButton />}

// Guard de route/page
if (!permissions?.can_acces_showplan_section) {
  return <Navigate to="/dashboard" />;
}
```

---

## 📊 Gestion des versions

### Format de version

Utiliser **Semantic Versioning** (SemVer) : `MAJOR.MINOR.PATCH`

- **MAJOR** : Changements incompatibles
- **MINOR** : Nouvelles fonctionnalités rétrocompatibles
- **PATCH** : Corrections de bugs

### Mise à jour de version

1. **Modifier** `package.json` :
   ```json
   {
     "version": "1.2.0"
   }
   ```

2. **Mettre à jour** le changelog dans `README.md`

3. **Créer** une entrée dans `useVersionStore` si nécessaire

4. **Documenter** dans `docs/modules/` si nouvelle fonctionnalité

### Format du changelog

```markdown
### v1.2.0 (Date)
- ✨ Feature: Description de la nouvelle fonctionnalité
- 🐛 Fix: Description du bug corrigé
- 🔧 Chore: Modification technique
- 📝 Docs: Mise à jour documentation
- ♻️ Refactor: Refactorisation de code
- 🎨 Style: Modification UI/CSS
- ⚡ Perf: Amélioration de performance
```

### Emojis pour les commits

| Emoji | Type | Description |
|-------|------|-------------|
| ✨ | feat | Nouvelle fonctionnalité |
| 🐛 | fix | Correction de bug |
| 📝 | docs | Documentation |
| 🎨 | style | Style/CSS |
| ♻️ | refactor | Refactorisation |
| ⚡ | perf | Performance |
| 🔧 | chore | Configuration/maintenance |
| 🔒 | security | Sécurité |
| 🌐 | i18n | Internationalisation |

---

## 📖 Documentation du code

### JSDoc pour les fonctions

```typescript
/**
 * Récupère la liste des conducteurs.
 * 
 * @param token - Token d'authentification JWT
 * @param filters - Filtres optionnels
 * @returns Liste des conducteurs filtrés
 * @throws {Error} Si le token est invalide ou expiré
 * 
 * @example
 * ```ts
 * const shows = await getShows(token, { status: 'ready' });
 * ```
 */
export const getShows = async (
  token: string, 
  filters?: ShowFilters
): Promise<ShowPlan[]> => {
  // ...
};
```

### JSDoc pour les composants

```tsx
/**
 * Carte d'affichage d'un conducteur.
 * 
 * @component
 * @example
 * ```tsx
 * <ShowPlanCard 
 *   show={showData} 
 *   onEdit={(id) => navigate(`/edit/${id}`)} 
 * />
 * ```
 */
interface ShowPlanCardProps {
  /** Données du conducteur à afficher */
  show: ShowPlan;
  /** Callback appelé lors du clic sur éditer */
  onEdit?: (id: string) => void;
  /** Callback appelé lors du clic sur supprimer */
  onDelete?: (id: string) => void;
}
```

### Commentaires dans le code

```tsx
// ✅ BON - Explique le "pourquoi"
// On utilise setTimeout pour laisser le temps à l'animation de se terminer
setTimeout(() => setIsOpen(false), 300);

// ❌ MAUVAIS - Explique le "quoi" (évident)
// Ferme la modal
setIsOpen(false);
```

---

## ✅ Tests et validation

### ⚠️ RÈGLE ABSOLUE - Approche Professionnelle

```
┌─────────────────────────────────────────────────────────────────────┐
│  🔴 OBLIGATOIRE APRÈS CHAQUE MODIFICATION DE CODE                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. VÉRIFIER LES ERREURS TypeScript :                              │
│     → Utiliser get_errors sur les fichiers modifiés                │
│     → Corriger TOUTES les erreurs avant de continuer               │
│                                                                     │
│  2. VÉRIFIER LES IMPORTS :                                         │
│     → Toujours vérifier que les types/interfaces existent          │
│     → Chercher où ils sont exportés (grep_search)                  │
│     → Ne JAMAIS supposer qu'un import existe                       │
│                                                                     │
│  3. LANCER LE BUILD :                                              │
│     → npm run build DOIT passer sans erreur                        │
│     → Si erreur : corriger AVANT de continuer                      │
│                                                                     │
│  4. TESTER L'APPLICATION :                                         │
│     → npm run dev et vérifier visuellement                         │
│     → Tester le scénario utilisateur complet                       │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Workflow de vérification obligatoire

```bash
# 1. Après chaque modification, vérifier les erreurs
# (Dans l'agent, utiliser get_errors sur les fichiers modifiés)

# 2. Vérifier que le build passe
npm run build

# 3. Vérifier les types (optionnel, le build le fait)
npx tsc --noEmit

# 4. Lancer l'application pour tester
npm run dev
```

### Vérification des imports - CRITIQUE

Avant d'utiliser un type ou une interface :

```typescript
// ❌ MAUVAIS - Supposer que le type existe dans index.ts
import type { Emission } from '../types';

// ✅ BON - Vérifier d'abord où le type est exporté
// 1. Chercher : grep_search "export.*Emission|interface Emission"
// 2. Importer depuis le bon fichier :
import type { Emission } from '../types/emission';
```

### Vérification des types Zustand

Lors de la création d'un store Zustand, toujours :

```typescript
// ✅ BON - Types explicites pour l'état initial
const initialState: Pick<MyStoreState, 'data' | 'status'> = {
  data: {
    field: undefined as FieldType | undefined,  // Type explicite
  },
  status: null,
};

// ❌ MAUVAIS - Inférence automatique incorrecte
const initialState = {
  data: {
    field: '',  // Sera inféré comme string, pas comme ShowType | undefined
  },
};
```

### Avant de soumettre du code

1. **Erreurs TypeScript** : `get_errors` sur tous les fichiers modifiés
2. **Build réussi** : `npm run build` sans erreur
3. **Lint propre** : `npm run lint` sans erreur (si disponible)
4. **Test manuel** : Fonctionnalité testée dans le navigateur
5. **Responsive** : Testé sur mobile et desktop (si applicable)

---

## ☑️ Checklist avant modification

### Avant de commencer

- [ ] J'ai lu et compris ce fichier AGENT.md
- [ ] J'ai identifié les fichiers à modifier
- [ ] J'ai vérifié les permissions nécessaires
- [ ] J'ai compris le design system existant

### Pendant le développement

- [ ] Je respecte les conventions de nommage
- [ ] Je respecte la structure des fichiers
- [ ] J'utilise les composants UI existants
- [ ] J'utilise les classes CSS définies
- [ ] Je documente mon code (JSDoc)
- [ ] Je gère les erreurs correctement
- [ ] Je vérifie les permissions si nécessaire

### Avant de terminer

- [ ] `npm run build` passe sans erreur
- [ ] Le code est formaté correctement
- [ ] Les types TypeScript sont corrects
- [ ] J'ai testé sur mobile et desktop
- [ ] J'ai mis à jour la documentation si nécessaire
- [ ] J'ai mis à jour la version si c'est une release

### Pour une nouvelle fonctionnalité

- [ ] Types créés dans `src/types/`
- [ ] Schema Zod créé si formulaire
- [ ] Service API créé dans `src/services/api/`
- [ ] Store Zustand créé si état global
- [ ] Hook créé si logique réutilisable
- [ ] Composants créés dans `src/components/`
- [ ] Page créée dans `src/pages/`
- [ ] Route ajoutée dans `App.tsx`
- [ ] Documentation ajoutée dans `docs/modules/`
- [ ] Version incrémentée dans `package.json`
- [ ] Changelog mis à jour dans `README.md`

---

## 🚨 Ce qu'il ne faut JAMAIS faire

1. **Ne jamais** modifier `src/api/api.ts` sans raison valable
2. **Ne jamais** hardcoder des URLs API
3. **Ne jamais** ignorer les permissions
4. **Ne jamais** modifier les classes CSS dans `index.css` sans concertation
5. **Ne jamais** introduire de nouvelles dépendances sans justification
6. **Ne jamais** supprimer de fichiers sans vérifier les imports
7. **Ne jamais** modifier la structure des stores sans migration
8. **Ne jamais** ignorer les erreurs TypeScript
9. **Ne jamais** committer du code non testé
10. **Ne jamais** oublier de documenter les changements

---

## 📚 Ressources

- [Documentation métier](./docs/business/README.md)
- [Documentation technique](./docs/modules/README.md)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [Zustand Docs](https://docs.pmnd.rs/zustand)
- [React Query Docs](https://tanstack.com/query)
- [Lucide Icons](https://lucide.dev/icons/)

---

> **Note aux agents IA** : En cas de doute, demandez des clarifications plutôt que de faire des suppositions. La stabilité du projet prime sur la rapidité d'exécution.
