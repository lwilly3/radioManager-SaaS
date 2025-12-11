# 🎤 Module Invités

> Gestion des invités des émissions : création, recherche, et assignation aux segments.

## 📋 Vue d'ensemble

| Aspect | Valeur |
|--------|--------|
| **Pages** | `guests/GuestList.tsx`, `guests/GuestCreate.tsx`, `guests/GuestEdit.tsx` |
| **Store** | `useGuestStore` |
| **Hook** | `useGuestSearch` |
| **Service API** | `src/services/api/guests.ts` |
| **Permissions** | `can_acces_guests_section`, `can_view_guests`, `can_edit_guests`, `can_delete_guests` |

## 🎯 Fonctionnalités

### 1. Liste des invités

- Affichage paginé
- Recherche par nom
- Filtres par catégorie/expertise
- Vue carte ou liste

### 2. Création d'invité

- Informations personnelles
- Coordonnées de contact
- Biographie
- Domaines d'expertise
- Photo de profil

### 3. Modification

- Mise à jour des informations
- Historique des participations

### 4. Recherche

- Recherche en temps réel
- Suggestions lors de l'ajout à un segment
- Cache des résultats (30 secondes)

## 📁 Structure des fichiers

```
src/
├── pages/
│   └── guests/
│       ├── GuestList.tsx          # Liste des invités
│       ├── GuestCreate.tsx        # Création
│       └── GuestEdit.tsx          # Modification
├── store/
│   └── useGuestStore.ts           # Store Zustand
├── hooks/
│   └── guests/
│       └── useGuestSearch.ts      # Hook recherche
├── services/
│   └── api/
│       └── guests.ts              # Service API
├── components/
│   └── guests/
│       ├── GuestCard.tsx          # Carte invité
│       ├── GuestForm.tsx          # Formulaire
│       ├── GuestSelector.tsx      # Sélecteur pour segments
│       └── GuestSearch.tsx        # Composant recherche
├── types/
│   └── guest.ts                   # Types TypeScript
└── schemas/
    └── guestSchema.ts             # Validation Zod
```

## 🔒 Contraintes et règles métier

### Permissions requises

| Action | Permission |
|--------|------------|
| Accéder à la section | `can_acces_guests_section` |
| Voir la liste | `can_view_guests` |
| Créer un invité | `can_edit_guests` |
| Modifier un invité | `can_edit_guests` |
| Supprimer un invité | `can_delete_guests` |

### Contraintes de données

| Champ | Contrainte |
|-------|------------|
| `name` | Requis, 2-100 caractères |
| `email` | Optionnel, format email valide |
| `phone` | Optionnel, format téléphone |
| `biography` | Optionnel, max 2000 caractères |
| `expertise` | Optionnel, array de tags |
| `profile_picture` | Optionnel, URL ou base64 |

### Règles métier

| Règle | Description |
|-------|-------------|
| Unicité | Pas de doublon email |
| Soft delete | Suppression logique |
| Historique | Conservation des participations |

## 📊 Types TypeScript

### Guest

```typescript
interface Guest {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  biography?: string;
  expertise?: string[];
  profile_picture?: string;
  social_links?: {
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
  created_at: string;
  updated_at: string;
  participations_count?: number;
}
```

### CreateGuestData

```typescript
interface CreateGuestData {
  name: string;
  email?: string;
  phone?: string;
  biography?: string;
  expertise?: string[];
  profile_picture?: string;
  social_links?: {
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
}
```

### GuestSearchResult

```typescript
interface GuestSearchResult {
  id: string;
  name: string;
  email?: string;
  profile_picture?: string;
  expertise?: string[];
}
```

## 🔌 Endpoints API

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/guests/` | Liste tous les invités |
| `GET` | `/guests/id/{id}` | Détail d'un invité |
| `GET` | `/guests/search?q={query}` | Recherche par nom |
| `POST` | `/guests/` | Créer un invité |
| `PUT` | `/guests/upd/{id}` | Modifier un invité |
| `DELETE` | `/guests/del/{id}` | Supprimer (soft) |

### Service API (guests.ts)

```typescript
export const guestApi = {
  getAll: async (token: string): Promise<Guest[]> => {
    const response = await api.get('guests/', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  getById: async (token: string, id: string): Promise<Guest> => {
    const response = await api.get(`guests/id/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  search: async (token: string, query: string): Promise<Guest[]> => {
    const response = await api.get(`guests/search`, {
      params: { q: query },
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  create: async (token: string, data: CreateGuestData): Promise<Guest> => {
    const response = await api.post('guests/', data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  update: async (token: string, id: string, data: Partial<CreateGuestData>): Promise<Guest> => {
    const response = await api.put(`guests/upd/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  delete: async (token: string, id: string): Promise<void> => {
    await api.delete(`guests/del/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
};
```

## 🪝 Hook useGuestSearch

```typescript
export const useGuestSearch = (query: string) => {
  const token = useAuthStore((state) => state.token);

  return useQuery({
    queryKey: ['guests', 'search', query],
    queryFn: async (): Promise<Guest[]> => {
      if (!token) throw new Error('No authentication token');
      if (!query.trim()) return [];
      return guestApi.search(token, query);
    },
    enabled: query.length > 0,
    staleTime: 30000, // Cache 30 secondes
  });
};
```

## 🗃️ Store Zustand (useGuestStore)

### État

```typescript
interface GuestState {
  guests: Guest[];
  currentGuest: Guest | null;
  isLoading: boolean;
  error: string | null;
  searchResults: Guest[];
}
```

### Actions

```typescript
interface GuestActions {
  fetchGuests: () => Promise<void>;
  fetchGuest: (id: string) => Promise<void>;
  createGuest: (data: CreateGuestData) => Promise<Guest>;
  updateGuest: (id: string, data: Partial<CreateGuestData>) => Promise<void>;
  deleteGuest: (id: string) => Promise<void>;
  searchGuests: (query: string) => Promise<void>;
  clearSearch: () => void;
}
```

## 🎨 Interface utilisateur

### Liste des invités

```
┌─────────────────────────────────────────────────────────────────┐
│  Invités                                     [+ Nouvel invité]  │
├─────────────────────────────────────────────────────────────────┤
│  🔍 Rechercher un invité...                      [Grid] [List]  │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │ 🖼️              │ │ 🖼️              │ │ 🖼️              │   │
│  │ Jean Dupont     │ │ Marie Martin    │ │ Pierre Durand   │   │
│  │ Économiste      │ │ Journaliste     │ │ Auteur          │   │
│  │ 📧 jean@...     │ │ 📧 marie@...    │ │ 📧 pierre@...   │   │
│  │ [Voir] [Éditer] │ │ [Voir] [Éditer] │ │ [Voir] [Éditer] │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
│                                                                 │
│  [< 1 2 3 ... 10 >]                                            │
└─────────────────────────────────────────────────────────────────┘
```

### Formulaire de création

```
┌─────────────────────────────────────────────────────────────────┐
│  Nouvel invité                                         [Fermer] │
├─────────────────────────────────────────────────────────────────┤
│  Photo de profil                                                │
│  ┌──────────┐                                                   │
│  │  📷      │ [Choisir une image]                              │
│  └──────────┘                                                   │
│                                                                 │
│  Nom *                                                          │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                                                             ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  Email                          Téléphone                       │
│  ┌────────────────────────────┐ ┌────────────────────────────┐ │
│  │                            │ │                            │ │
│  └────────────────────────────┘ └────────────────────────────┘ │
│                                                                 │
│  Biographie                                                     │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                                                             ││
│  │                                                             ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  Domaines d'expertise                                           │
│  [Économie ×] [Politique ×] [+ Ajouter]                        │
│                                                                 │
│                                      [Annuler] [Créer l'invité] │
└─────────────────────────────────────────────────────────────────┘
```

### Sélecteur pour segment

```typescript
// Composant GuestSelector utilisé dans les formulaires de segment
const GuestSelector = ({ selected, onChange }) => {
  const [query, setQuery] = useState('');
  const { data: results, isLoading } = useGuestSearch(query);

  return (
    <div>
      <input 
        type="text"
        placeholder="Rechercher un invité..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      
      {isLoading && <Spinner />}
      
      {results?.map(guest => (
        <div 
          key={guest.id}
          onClick={() => onChange([...selected, guest])}
        >
          {guest.name}
        </div>
      ))}
      
      <div className="mt-2">
        <h4>Invités sélectionnés</h4>
        {selected.map(guest => (
          <Chip 
            key={guest.id}
            label={guest.name}
            onDelete={() => onChange(selected.filter(g => g.id !== guest.id))}
          />
        ))}
      </div>
    </div>
  );
};
```

## 📝 Exemple d'implémentation

### Page GuestList

```tsx
const GuestList = () => {
  const { permissions } = useAuthStore();
  const { guests, isLoading, fetchGuests, deleteGuest } = useGuestStore();
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchGuests();
  }, []);

  if (!permissions?.can_acces_guests_section) {
    return <AccessDenied />;
  }

  const filteredGuests = guests.filter(guest =>
    guest.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <header className="flex justify-between items-center mb-4">
        <h1>Invités</h1>
        {permissions.can_edit_guests && (
          <Link to="/guests/create">
            <Button>+ Nouvel invité</Button>
          </Link>
        )}
      </header>

      <div className="flex gap-4 mb-4">
        <SearchInput 
          value={search}
          onChange={setSearch}
          placeholder="Rechercher un invité..."
        />
        <ViewModeToggle value={viewMode} onChange={setViewMode} />
      </div>

      {isLoading ? (
        <Spinner />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGuests.map(guest => (
            <GuestCard 
              key={guest.id} 
              guest={guest}
              canEdit={permissions.can_edit_guests}
              canDelete={permissions.can_delete_guests}
              onDelete={() => deleteGuest(guest.id)}
            />
          ))}
        </div>
      ) : (
        <GuestTable guests={filteredGuests} />
      )}
    </Layout>
  );
};
```

## ⚠️ Gestion des erreurs

| Erreur | Comportement |
|--------|--------------|
| 401 | Logout + redirect |
| 403 | Message "Accès refusé" |
| 404 | Message "Invité non trouvé" |
| 422 | Afficher erreurs validation |
| Doublon email | Message spécifique |

## 🔄 Validation Zod

```typescript
// schemas/guestSchema.ts
import { z } from 'zod';

export const guestSchema = z.object({
  name: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  email: z.string()
    .email('Email invalide')
    .optional()
    .or(z.literal('')),
  phone: z.string()
    .optional(),
  biography: z.string()
    .max(2000, 'La biographie ne peut pas dépasser 2000 caractères')
    .optional(),
  expertise: z.array(z.string()).optional(),
});
```

## 🧪 Points de test

- [ ] Liste affiche tous les invités
- [ ] Recherche filtre correctement
- [ ] Création avec validation
- [ ] Modification sauvegarde
- [ ] Suppression fonctionne
- [ ] Permissions respectées
- [ ] Sélecteur dans segment fonctionne
- [ ] Cache recherche 30s
