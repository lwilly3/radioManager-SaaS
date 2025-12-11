# 📺 Module Émissions

> Gestion du catalogue des émissions (programmes récurrents).

## 📋 Vue d'ensemble

| Aspect | Valeur |
|--------|--------|
| **Pages** | Via Settings ou pages dédiées |
| **Service API** | `src/services/api/emissions.ts` |
| **Permissions** | `can_acces_emissions_section`, `can_view_emissions`, `can_create_emissions`, `can_edit_emissions`, `can_delete_emissions`, `can_manage_emissions` |

## 🎯 Fonctionnalités

### 1. Catalogue des émissions

- Liste des émissions de la radio
- Informations : titre, synopsis, type, durée, fréquence
- Base pour créer les conducteurs

### 2. CRUD Émissions

- Création d'une nouvelle émission
- Modification des informations
- Suppression (soft delete)

### 3. Types d'émission

| Type | Description |
|------|-------------|
| `Débat` | Émission de discussion |
| `Musique` | Programme musical |
| `Actualités` | Journal/News |
| `Interview` | Format interview |
| `Mixte` | Format varié |

### 4. Fréquences

| Fréquence | Description |
|-----------|-------------|
| `daily` | Quotidienne |
| `weekly` | Hebdomadaire |
| `biweekly` | Bihebdomadaire |
| `monthly` | Mensuelle |
| `special` | Événement spécial |

## 📁 Structure des fichiers

```
src/
├── services/
│   └── api/
│       └── emissions.ts           # Service API
├── types/
│   └── emission.ts                # Types TypeScript
└── components/
    └── showPlans/
        └── forms/
            └── EmissionSelect.tsx # Sélecteur d'émission
```

## 🔒 Contraintes et règles métier

### Permissions requises

| Action | Permission |
|--------|------------|
| Accéder à la section | `can_acces_emissions_section` |
| Voir la liste | `can_view_emissions` |
| Créer | `can_create_emissions` |
| Modifier | `can_edit_emissions` |
| Supprimer | `can_delete_emissions` |
| Gérer (admin) | `can_manage_emissions` |

### Contraintes de données

| Champ | Contrainte |
|-------|------------|
| `title` | Requis, 1-200 caractères, unique |
| `synopsis` | Optionnel, max 500 caractères |
| `type` | Requis, valeur enum |
| `duration` | Requis, en minutes, > 0 |
| `frequency` | Requis, valeur enum |
| `description` | Optionnel, max 2000 caractères |

### Règles métier

| Règle | Description |
|-------|-------------|
| Titre unique | Deux émissions ne peuvent avoir le même titre |
| Soft delete | Suppression logique uniquement |
| Conducteurs liés | Une émission supprimée garde ses conducteurs existants |

## 📊 Types TypeScript

### Emission

```typescript
interface Emission {
  id: number;
  title: string;
  synopsis: string;
  type: string;
  duration: number;
  frequency: string;
  description: string;
}
```

### CreateEmissionData

```typescript
interface CreateEmissionData {
  title: string;
  synopsis: string;
  type: string;
  duration: number;
  frequency: string;
  description: string;
}
```

### UpdateEmissionData

```typescript
interface UpdateEmissionData {
  title: string;
  synopsis: string;
  type: string;
  duration: number;
  frequency: string;
  description: string;
}
```

## 🔌 Endpoints API

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/emissions` | Liste toutes les émissions |
| `GET` | `/emissions/{id}` | Détail d'une émission |
| `POST` | `/emissions/` | Créer une émission |
| `PUT` | `/emissions/upd/{id}` | Modifier une émission |
| `DELETE` | `/emissions/softDel/{id}` | Supprimer (soft) |

### Service API (emissions.ts)

```typescript
export const emissionApi = {
  getAllEmissions: async (token: string): Promise<Emission[]> => {
    try {
      const response = await api.get('emissions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch emissions:', error);
      throw error;
    }
  },

  create: async (token: string, data: CreateEmissionData): Promise<Emission> => {
    try {
      const response = await api.post('emissions/', {
        title: data.title,
        synopsis: data.synopsis,
        type: data.type,
        duration: data.duration,
        frequency: data.frequency,
        description: data.description,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to create emission:', error);
      throw error;
    }
  },

  update: async (
    token: string,
    emissionId: number,
    data: UpdateEmissionData
  ): Promise<Emission> => {
    try {
      const response = await api.put(`emissions/upd/${emissionId}`, {
        title: data.title,
        synopsis: data.synopsis,
        type: data.type,
        duration: data.duration,
        frequency: data.frequency,
        description: data.description,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to update emission:', error);
      throw error;
    }
  },

  delete: async (token: string, emissionId: number): Promise<void> => {
    try {
      await api.delete(`emissions/softDel/${emissionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error('Failed to delete emission:', error);
      throw error;
    }
  },
};
```

## 🎨 Interface utilisateur

### Sélecteur d'émission (dans CreateShowPlan)

```typescript
// EmissionSelect.tsx
const EmissionSelect = ({ value, onChange, disabled }) => {
  const token = useAuthStore(state => state.token);
  const [emissions, setEmissions] = useState<Emission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEmissions = async () => {
      try {
        const data = await emissionApi.getAllEmissions(token);
        setEmissions(data);
      } catch (error) {
        console.error('Erreur chargement émissions', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (token) fetchEmissions();
  }, [token]);

  if (isLoading) return <Spinner />;

  return (
    <Select
      label="Émission"
      value={value}
      onChange={onChange}
      disabled={disabled}
      required
    >
      <option value="">Sélectionner une émission</option>
      {emissions.map(emission => (
        <option key={emission.id} value={emission.id}>
          {emission.title} ({emission.duration} min - {emission.frequency})
        </option>
      ))}
    </Select>
  );
};
```

### Liste des émissions

```
┌─────────────────────────────────────────────────────────────────┐
│  Émissions                                  [+ Nouvelle émission]│
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Titre          │ Type      │ Durée │ Fréquence │ Actions   ││
│  ├────────────────┼───────────┼───────┼───────────┼───────────┤│
│  │ La Matinale    │ Débat     │ 180m  │ daily     │ ✏️ 🗑️     ││
│  │ Jazz Hour      │ Musique   │ 60m   │ daily     │ ✏️ 🗑️     ││
│  │ Le Grand JT    │ Actualités│ 30m   │ daily     │ ✏️ 🗑️     ││
│  │ Culture Club   │ Interview │ 90m   │ weekly    │ ✏️ 🗑️     ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### Formulaire création/édition

```
┌─────────────────────────────────────────────────────────────────┐
│  Nouvelle émission                                     [Fermer] │
├─────────────────────────────────────────────────────────────────┤
│  Titre *                                                        │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                                                             ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  Synopsis                                                       │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                                                             ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  Type *                           Durée (minutes) *             │
│  ┌────────────────────────────┐  ┌────────────────────────────┐│
│  │ Débat                    ▼ │  │ 60                         ││
│  └────────────────────────────┘  └────────────────────────────┘│
│                                                                 │
│  Fréquence *                                                    │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ ○ Quotidienne  ○ Hebdomadaire  ○ Mensuelle  ○ Spéciale     ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  Description                                                    │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                                                             ││
│  │                                                             ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│                                      [Annuler] [Créer]          │
└─────────────────────────────────────────────────────────────────┘
```

## 📝 Exemple d'implémentation

### Page de gestion des émissions

```tsx
const EmissionsPage = () => {
  const token = useAuthStore(state => state.token);
  const { permissions } = useAuthStore();
  const [emissions, setEmissions] = useState<Emission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEmission, setEditingEmission] = useState<Emission | null>(null);

  useEffect(() => {
    fetchEmissions();
  }, []);

  const fetchEmissions = async () => {
    setIsLoading(true);
    try {
      const data = await emissionApi.getAllEmissions(token);
      setEmissions(data);
    } catch (error) {
      console.error('Erreur', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (data: CreateEmissionData) => {
    try {
      await emissionApi.create(token, data);
      fetchEmissions();
      setShowModal(false);
    } catch (error) {
      console.error('Erreur création', error);
    }
  };

  const handleUpdate = async (data: UpdateEmissionData) => {
    if (!editingEmission) return;
    try {
      await emissionApi.update(token, editingEmission.id, data);
      fetchEmissions();
      setEditingEmission(null);
    } catch (error) {
      console.error('Erreur mise à jour', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cette émission ?')) return;
    try {
      await emissionApi.delete(token, id);
      fetchEmissions();
    } catch (error) {
      console.error('Erreur suppression', error);
    }
  };

  if (!permissions?.can_acces_emissions_section) {
    return <AccessDenied />;
  }

  return (
    <Layout>
      <header className="flex justify-between mb-4">
        <h1>Émissions</h1>
        {permissions.can_create_emissions && (
          <Button onClick={() => setShowModal(true)}>
            + Nouvelle émission
          </Button>
        )}
      </header>

      {isLoading ? (
        <Spinner />
      ) : (
        <Table>
          <thead>
            <tr>
              <th>Titre</th>
              <th>Type</th>
              <th>Durée</th>
              <th>Fréquence</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {emissions.map(emission => (
              <tr key={emission.id}>
                <td>{emission.title}</td>
                <td>{emission.type}</td>
                <td>{emission.duration} min</td>
                <td>{emission.frequency}</td>
                <td>
                  {permissions.can_edit_emissions && (
                    <Button 
                      variant="ghost" 
                      onClick={() => setEditingEmission(emission)}
                    >
                      ✏️
                    </Button>
                  )}
                  {permissions.can_delete_emissions && (
                    <Button 
                      variant="ghost"
                      color="red"
                      onClick={() => handleDelete(emission.id)}
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

      <EmissionModal
        open={showModal || !!editingEmission}
        emission={editingEmission}
        onClose={() => {
          setShowModal(false);
          setEditingEmission(null);
        }}
        onSubmit={editingEmission ? handleUpdate : handleCreate}
      />
    </Layout>
  );
};
```

## ⚠️ Gestion des erreurs

| Erreur | Comportement |
|--------|--------------|
| 401 | Logout + redirect |
| 403 | Message "Accès refusé" |
| 404 | Message "Émission non trouvée" |
| 422 | Erreurs validation |
| Titre dupliqué | Message "Cette émission existe déjà" |

## 🔄 Relations

### Avec les conducteurs

- Un conducteur est toujours lié à une émission (`emission_id`)
- L'émission définit les valeurs par défaut du conducteur
- Lors de la création d'un conducteur, l'émission est obligatoire

### Sélecteur EmissionSelect

Le composant `EmissionSelect` est utilisé dans :
- `CreateShowPlan.tsx` : Création de conducteur
- `EditShowPlan.tsx` : Modification de conducteur

## 🧪 Points de test

- [ ] Liste affiche toutes les émissions
- [ ] Création avec tous les champs requis
- [ ] Modification sauvegarde correctement
- [ ] Suppression (soft delete)
- [ ] Validation titre unique
- [ ] Permissions respectées
- [ ] Sélecteur dans conducteur charge la liste
- [ ] Valeurs par défaut appliquées au conducteur
