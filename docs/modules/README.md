# 📚 Documentation Technique des Modules - RadioManager SaaS

> Documentation détaillée de chaque module fonctionnel de l'application.

## 🗂️ Index des Modules

| Module | Description | Fichier |
|--------|-------------|---------|
| **Dashboard** | Tableau de bord principal avec statistiques | [dashboard.md](./dashboard.md) |
| **Authentification** | Connexion, déconnexion et permissions | [authentication.md](./authentication.md) |
| **Profil** | Gestion du profil utilisateur | [profile.md](./profile.md) |
| **Conducteurs** | Gestion des plans d'émission | [show-plans.md](./show-plans.md) |
| **Archives** | Recherche et consultation des émissions archivées | [archives.md](./archives.md) |
| **Chat** | Messagerie temps réel (Firebase) | [chat.md](./chat.md) |
| **Tâches** | Gestion des tâches Kanban | [tasks.md](./tasks.md) |
| **Paramètres** | Configuration de l'application | [settings.md](./settings.md) |
| **Invités** | Gestion des invités | [guests.md](./guests.md) |
| **Animateurs** | Gestion des présentateurs | [presenters.md](./presenters.md) |
| **Émissions** | Catalogue des émissions | [emissions.md](./emissions.md) |
| **Équipe** | Gestion de l'équipe | [team.md](./team.md) |
| **Utilisateurs** | Administration des utilisateurs | [users.md](./users.md) |

## 📖 Documentation Business

Pour une vue métier et fonctionnelle de l'application, consultez le dossier [docs/business/](../business/README.md) :
- Authentification et Accès
- Programmation et Planification  
- Émissions et Contenu
- Talents et Collaboration
- Utilisateurs et Permissions

## 🏗️ Architecture Technique

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (React + Vite)                        │
├─────────────────────────────────────────────────────────────────────────────┤
│  Pages (src/pages/)                                                         │
│  ├── Dashboard.tsx        → Tableau de bord                                 │
│  ├── ShowPlans.tsx        → Liste des conducteurs                          │
│  ├── MyShowPlans.tsx      → Mes conducteurs                                │
│  ├── CreateShowPlan.tsx   → Création de conducteur                         │
│  ├── EditShowPlan.tsx     → Modification de conducteur                     │
│  ├── ShowPlanDetail.tsx   → Détail d'un conducteur                         │
│  ├── Archives.tsx         → Archives                                        │
│  ├── Chat.tsx             → Messagerie                                      │
│  ├── Tasks.tsx            → Gestion des tâches                             │
│  ├── Settings.tsx         → Paramètres                                      │
│  ├── Profile.tsx          → Profil utilisateur                             │
│  ├── Login.tsx            → Connexion                                       │
│  └── [subdirs]            → guests/, team/, users/, shows/                  │
├─────────────────────────────────────────────────────────────────────────────┤
│  State Management (Zustand - src/store/)                                    │
│  ├── useAuthStore         → État authentification + permissions             │
│  ├── useShowPlanStore     → État des conducteurs                           │
│  ├── useChatStore         → État messagerie (Firebase)                     │
│  ├── useTaskStore         → État des tâches (Firebase)                     │
│  ├── useGuestStore        → État des invités                               │
│  ├── usePresenterStore    → État des animateurs                            │
│  ├── useUserPreferences   → Préférences utilisateur                        │
│  └── useVersionStore      → Gestion des versions                           │
├─────────────────────────────────────────────────────────────────────────────┤
│  Services API (src/services/api/)                                           │
│  ├── shows.ts             → CRUD conducteurs                               │
│  ├── emissions.ts         → CRUD émissions                                 │
│  ├── guests.ts            → CRUD invités                                   │
│  ├── presenters.ts        → CRUD animateurs                                │
│  ├── users.ts             → CRUD utilisateurs                              │
│  ├── roles.ts             → CRUD rôles                                     │
│  └── status.ts            → Gestion des statuts                            │
├─────────────────────────────────────────────────────────────────────────────┤
│  Instance API centralisée (src/api/api.ts)                                  │
│  └── Axios avec baseURL: VITE_API_BASE_URL || https://api.cloud.audace.ovh │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              BACKEND (FastAPI)                              │
│                       https://api.cloud.audace.ovh                          │
├─────────────────────────────────────────────────────────────────────────────┤
│  Endpoints principaux:                                                      │
│  ├── POST /auth/login         → Authentification                           │
│  ├── GET  /dashbord           → Données tableau de bord                    │
│  ├── GET  /showplans/*        → CRUD conducteurs                           │
│  ├── GET  /emissions/*        → CRUD émissions                             │
│  ├── GET  /guests/*           → CRUD invités                               │
│  ├── GET  /presenters/*       → CRUD animateurs                            │
│  ├── GET  /users/*            → CRUD utilisateurs                          │
│  ├── GET  /roles/*            → CRUD rôles                                 │
│  └── GET  /permissions/*      → Gestion permissions                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FIREBASE (Temps réel)                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  Collections Firestore:                                                     │
│  ├── chatRooms/{roomId}       → Salons de discussion                       │
│  ├── messages/{messageId}     → Messages                                   │
│  ├── tasks/{taskId}           → Tâches                                     │
│  ├── permissions/{userId}     → Synchronisation permissions                │
│  └── userPreferences/{userId} → Préférences utilisateur                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 🔐 Système de Permissions

L'application utilise 46 permissions granulaires pour contrôler l'accès aux fonctionnalités.

### Catégories de permissions

| Catégorie | Permissions | Description |
|-----------|-------------|-------------|
| **Conducteurs** | 13 | Accès, création, édition, archivage, suppression, statuts |
| **Utilisateurs** | 7 | Gestion des comptes et rôles |
| **Invités** | 4 | CRUD invités |
| **Animateurs** | 4 | CRUD animateurs |
| **Émissions** | 6 | CRUD catalogue émissions |
| **Messages** | 4 | Chat et fichiers |
| **Système** | 5 | Audit, notifications, paramètres |

### Exemple d'utilisation dans le code

```typescript
// Vérification de permission dans un composant
const { permissions } = useAuthStore();

if (!permissions?.can_create_showplan) {
  return <AccessDenied />;
}
```

## 📦 Gestion d'État (Zustand)

Tous les stores utilisent le middleware `persist` pour la persistance locale.

### Pattern standard

```typescript
interface StoreState {
  data: DataType[];
  isLoading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  create: (item: CreateType) => Promise<void>;
  update: (id: string, item: UpdateType) => Promise<void>;
  delete: (id: string) => Promise<void>;
}

export const useMyStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Implementation
    }),
    { name: 'store-name' }
  )
);
```

## 🌐 Configuration API

### Variables d'environnement

```env
# .env.local (développement)
VITE_API_BASE_URL=https://api.radio.audace.ovh

# .env.production
VITE_API_BASE_URL=https://api.cloud.audace.ovh
```

### Instance Axios centralisée

```typescript
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

## 🔄 Workflow de Développement

### Ajouter un nouveau module

1. **Types** : Créer les types dans `src/types/`
2. **Service API** : Créer le service dans `src/services/api/`
3. **Store Zustand** : Créer le store dans `src/store/`
4. **Hook** : Créer le hook dans `src/hooks/`
5. **Composants** : Créer les composants dans `src/components/`
6. **Page** : Créer la page dans `src/pages/`
7. **Route** : Ajouter la route dans `App.tsx`

### Conventions de nommage

| Type | Convention | Exemple |
|------|------------|---------|
| Store | `use{Feature}Store` | `useGuestStore` |
| Hook | `use{Feature}` | `useGuests` |
| Service | `{feature}Api` | `guestApi` |
| Page | `{Feature}.tsx` | `GuestList.tsx` |
| Composant | `{Feature}{Component}.tsx` | `GuestCard.tsx` |

## 📱 Responsive Design

L'application utilise TailwindCSS avec les breakpoints suivants :

| Breakpoint | Largeur min | Usage |
|------------|-------------|-------|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablette |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Large desktop |
| `2xl` | 1536px | Extra large |

## 🚀 Déploiement

### Docker (Dokploy)

```bash
# Build et déploiement
docker-compose up -d --build

# Forcer rebuild
docker-compose down && docker-compose up -d --build --no-cache
```

### URLs de production

- **Frontend** : https://app.cloud.audace.ovh
- **Backend API** : https://api.cloud.audace.ovh
- **Dokploy** : https://cloud.audace.ovh:3000
