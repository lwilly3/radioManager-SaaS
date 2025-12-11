# 🎙️ Module Animateurs (Presenters)

> Gestion des présentateurs/animateurs des émissions.

## 📋 Vue d'ensemble

| Aspect | Valeur |
|--------|--------|
| **Pages** | Via `Settings.tsx` (onglet Animateurs) |
| **Store** | `usePresenterStore` |
| **Hook** | `usePresenters` |
| **Service API** | `src/services/api/presenters.ts` |
| **Permissions** | `can_acces_presenters_section`, `can_view_presenters`, `can_edit_presenters`, `can_delete_presenters` |

## 🎯 Fonctionnalités

### 1. Liste des animateurs

- Affichage des présentateurs actifs
- Photo, nom, contact
- Émissions associées

### 2. Création d'animateur

- Promotion d'un utilisateur existant
- Informations complémentaires (bio, photo)

### 3. Assignation aux émissions

- Sélecteur dans le formulaire de conducteur
- Indicateur "animateur principal"

## 📁 Structure des fichiers

```
src/
├── components/
│   └── settings/
│       └── PresenterSettings.tsx  # Gestion dans les paramètres
├── store/
│   └── usePresenterStore.ts       # Store Zustand
├── hooks/
│   └── presenters/
│       └── usePresenters.ts       # Hook React Query
├── services/
│   └── api/
│       └── presenters.ts          # Service API
├── components/
│   └── showPlans/
│       └── presenters/
│           └── PresenterSelector.tsx  # Sélecteur dans conducteurs
└── types/
    └── index.ts                   # Type Presenter
```

## 🔒 Contraintes et règles métier

### Permissions requises

| Action | Permission |
|--------|------------|
| Accéder à la section | `can_acces_presenters_section` |
| Voir la liste | `can_view_presenters` |
| Créer | `can_edit_presenters` |
| Modifier | `can_edit_presenters` |
| Supprimer | `can_delete_presenters` |

### Règles métier

| Règle | Description |
|-------|-------------|
| Utilisateur existant | Un animateur est toujours lié à un utilisateur |
| Animateur principal | Un conducteur a exactement 1 animateur principal |
| Soft delete | Suppression logique uniquement |

## 📊 Types TypeScript

### Presenter

```typescript
interface Presenter {
  id: string;
  user_id: string;
  name: string;
  profilePicture?: string;
  contact?: {
    email?: string;
    phone?: string;
  };
  biography?: string;
  isMainPresenter: boolean;
}
```

### API Response

```typescript
// Réponse brute de l'API
interface ApiPresenterResponse {
  id: number;
  users_id: number;
  name: string;
  profile_picture?: string;
  email?: string;
  phone?: string;
  biography?: string;
}
```

## 🔌 Endpoints API

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/presenters/all` | Liste tous les animateurs |
| `GET` | `/presenters/id/{id}` | Détail d'un animateur |
| `POST` | `/presenters/` | Créer un animateur |
| `PUT` | `/presenters/update/{id}` | Modifier |
| `DELETE` | `/presenters/del/{id}` | Supprimer |

### Service API

```typescript
export const presenterApi = {
  getAll: async (token: string): Promise<Presenter[]> => {
    const response = await api.get('/presenters/all', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    return response.data.presenters.map((presenter: ApiPresenterResponse) => ({
      id: String(presenter.id),
      user_id: String(presenter.users_id),
      name: presenter.name,
      profilePicture: presenter.profile_picture,
      contact: {
        email: presenter.email,
        phone: presenter.phone,
      },
      biography: presenter.biography,
      isMainPresenter: false,
    }));
  },

  create: async (token: string, data: CreatePresenterData): Promise<Presenter> => {
    const response = await api.post('/presenters/', data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  update: async (token: string, id: string, data: UpdatePresenterData): Promise<Presenter> => {
    const response = await api.put(`/presenters/update/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  delete: async (token: string, id: string): Promise<void> => {
    await api.delete(`/presenters/del/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
};
```

## 🪝 Hook usePresenters

```typescript
export const usePresenters = () => {
  const token = useAuthStore((state) => state.token);

  return useQuery({
    queryKey: ['presenters'],
    queryFn: async (): Promise<Presenter[]> => {
      if (!token) throw new Error('No authentication token');

      const response = await api.get('/presenters/all', {
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data.presenters.map((presenter: any) => ({
        id: String(presenter.id),
        user_id: String(presenter.users_id),
        name: presenter.name,
        profilePicture: presenter.profile_picture,
        contact: {
          email: presenter.email,
          phone: presenter.phone,
        },
        isMainPresenter: false,
      }));
    },
    enabled: !!token,
  });
};
```

## 🗃️ Store Zustand (usePresenterStore)

### État

```typescript
interface PresenterState {
  presenters: Presenter[];
  isLoading: boolean;
  error: string | null;
}
```

### Actions

```typescript
interface PresenterActions {
  fetchPresenters: () => Promise<void>;
  addPresenter: (data: CreatePresenterData) => Promise<void>;
  updatePresenter: (id: string, data: UpdatePresenterData) => Promise<void>;
  removePresenter: (id: string) => Promise<void>;
}
```

## 🎨 Interface utilisateur

### Dans les paramètres

```
┌─────────────────────────────────────────────────────────────────┐
│  Paramètres > Animateurs                                        │
├─────────────────────────────────────────────────────────────────┤
│                                      [+ Ajouter un animateur]   │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Avatar │ Nom            │ Email          │ Actions          ││
│  ├────────┼────────────────┼────────────────┼──────────────────┤│
│  │ 🖼️     │ Jean Dupont    │ jean@radio.fr  │ [Éditer] [🗑️]   ││
│  │ 🖼️     │ Marie Martin   │ marie@radio.fr │ [Éditer] [🗑️]   ││
│  │ 🖼️     │ Pierre Durand  │ pierre@radio.fr│ [Éditer] [🗑️]   ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### Sélecteur dans conducteur

```typescript
// PresenterSelector.tsx
const PresenterSelector = ({ 
  selected, 
  mainPresenterId,
  onChange, 
  onMainChange 
}) => {
  const { data: presenters, isLoading } = usePresenters();

  return (
    <div>
      <label>Animateurs</label>
      
      {isLoading ? (
        <Spinner />
      ) : (
        <div className="space-y-2">
          {presenters?.map(presenter => (
            <div key={presenter.id} className="flex items-center gap-2">
              <Checkbox
                checked={selected.includes(presenter.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    onChange([...selected, presenter.id]);
                  } else {
                    onChange(selected.filter(id => id !== presenter.id));
                  }
                }}
              />
              <Avatar src={presenter.profilePicture} />
              <span>{presenter.name}</span>
              
              {selected.includes(presenter.id) && (
                <Radio
                  name="mainPresenter"
                  checked={mainPresenterId === presenter.id}
                  onChange={() => onMainChange(presenter.id)}
                  label="Principal"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

### Modal d'ajout

```
┌─────────────────────────────────────────────────────────────────┐
│  Ajouter un animateur                                  [Fermer] │
├─────────────────────────────────────────────────────────────────┤
│  Sélectionner un utilisateur                                    │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 🔍 Rechercher...                                            ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ ○ Sophie Bernard (sophie@radio.fr)                          ││
│  │ ○ Luc Moreau (luc@radio.fr)                                 ││
│  │ ○ Claire Petit (claire@radio.fr)                            ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  Biographie (optionnel)                                         │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                                                             ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│                                      [Annuler] [Ajouter]        │
└─────────────────────────────────────────────────────────────────┘
```

## 📝 Exemple d'implémentation

### PresenterSettings (dans Settings.tsx)

```tsx
const PresenterSettings = () => {
  const { permissions } = useAuthStore();
  const { data: presenters, isLoading, refetch } = usePresenters();
  const [showAddModal, setShowAddModal] = useState(false);

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cet animateur ?')) return;
    
    try {
      await presenterApi.delete(token, id);
      refetch();
    } catch (error) {
      console.error('Erreur suppression', error);
    }
  };

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h2>Animateurs</h2>
        {permissions?.can_edit_presenters && (
          <Button onClick={() => setShowAddModal(true)}>
            + Ajouter un animateur
          </Button>
        )}
      </div>

      {isLoading ? (
        <Spinner />
      ) : (
        <Table>
          <thead>
            <tr>
              <th>Avatar</th>
              <th>Nom</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {presenters?.map(presenter => (
              <tr key={presenter.id}>
                <td>
                  <Avatar src={presenter.profilePicture} />
                </td>
                <td>{presenter.name}</td>
                <td>{presenter.contact?.email}</td>
                <td>
                  {permissions?.can_edit_presenters && (
                    <Button variant="ghost" onClick={() => handleEdit(presenter)}>
                      Éditer
                    </Button>
                  )}
                  {permissions?.can_delete_presenters && (
                    <Button 
                      variant="ghost" 
                      color="red"
                      onClick={() => handleDelete(presenter.id)}
                    >
                      🗑️
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <AddPresenterModal 
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={refetch}
      />
    </div>
  );
};
```

## ⚠️ Gestion des erreurs

| Erreur | Comportement |
|--------|--------------|
| 401 | Logout + redirect |
| 403 | Message "Accès refusé" |
| 404 | Message "Animateur non trouvé" |
| 422 | Erreurs validation |
| Utilisateur déjà animateur | Message spécifique |

## 🔄 Dépendances

### Avec les conducteurs

- Les animateurs sont assignés aux conducteurs
- Un animateur principal est marqué par `isMainPresenter: true`
- Le sélecteur utilise `usePresenters` pour charger la liste

### Avec les utilisateurs

- Création depuis la liste des utilisateurs non-présentateurs
- Endpoint `GET /users/non-presenters` pour filtrer

## 🧪 Points de test

- [ ] Liste affiche tous les animateurs
- [ ] Ajout depuis utilisateur existant
- [ ] Modification des informations
- [ ] Suppression fonctionne
- [ ] Permissions respectées
- [ ] Sélecteur dans conducteur fonctionne
- [ ] Animateur principal sélectionnable
- [ ] Cache React Query fonctionne
