# 👥 Module Équipe

> Gestion des membres de l'équipe de la radio.

## 📋 Vue d'ensemble

| Aspect | Valeur |
|--------|--------|
| **Pages** | `team/TeamList.tsx`, `team/TeamCreate.tsx`, `team/TeamEdit.tsx` |
| **Store** | `useTeamStore` |
| **Lien utilisateurs** | Gestion séparée des comptes |

## 🎯 Fonctionnalités

### 1. Liste de l'équipe

- Affichage des membres
- Recherche par nom
- Filtres par rôle/fonction

### 2. Gestion des membres

- Ajout de nouveaux membres
- Modification des informations
- Désactivation/suppression

## 📁 Structure des fichiers

```
src/
├── pages/
│   └── team/
│       ├── TeamList.tsx           # Liste des membres
│       ├── TeamCreate.tsx         # Création
│       └── TeamEdit.tsx           # Modification
├── store/
│   └── useTeamStore.ts            # Store Zustand
└── schemas/
    └── teamSchema.ts              # Validation Zod
```

## 🔒 Contraintes et règles métier

### Permissions

L'accès à l'équipe utilise les mêmes permissions que les utilisateurs :
- `can_acces_users_section`
- `can_view_users`
- `can_edit_users`
- `can_delete_users`

## 📊 Types TypeScript

### TeamMember

```typescript
interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone?: string;
  avatar?: string;
  department?: string;
  joinedAt: string;
  isActive: boolean;
}
```

## 🎨 Interface utilisateur

### Liste de l'équipe

```
┌─────────────────────────────────────────────────────────────────┐
│  Équipe                                        [+ Nouveau membre]│
├─────────────────────────────────────────────────────────────────┤
│  🔍 Rechercher...                            [Tous ▼] [Actifs ▼]│
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │ 🖼️ Jean Dupont  │ │ 🖼️ Marie Martin │ │ 🖼️ Pierre D.    │   │
│  │ Animateur       │ │ Technicienne    │ │ Producteur      │   │
│  │ 📧 jean@...     │ │ 📧 marie@...    │ │ 📧 pierre@...   │   │
│  │ ✅ Actif        │ │ ✅ Actif        │ │ ⏸️ Inactif      │   │
│  │ [Voir] [Éditer] │ │ [Voir] [Éditer] │ │ [Voir] [Éditer] │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## 🗃️ Store Zustand (useTeamStore)

### État

```typescript
interface TeamState {
  members: TeamMember[];
  isLoading: boolean;
  error: string | null;
}
```

### Actions

```typescript
interface TeamActions {
  fetchMembers: () => Promise<void>;
  addMember: (data: CreateTeamMemberData) => Promise<void>;
  updateMember: (id: string, data: UpdateTeamMemberData) => Promise<void>;
  removeMember: (id: string) => Promise<void>;
  toggleActive: (id: string) => Promise<void>;
}
```

## 📝 Exemple d'implémentation

### Page TeamList

```tsx
const TeamList = () => {
  const { permissions } = useAuthStore();
  const { members, isLoading, fetchMembers } = useTeamStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    fetchMembers();
  }, []);

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' 
      || (filter === 'active' && member.isActive)
      || (filter === 'inactive' && !member.isActive);
    return matchesSearch && matchesFilter;
  });

  return (
    <Layout>
      <header className="flex justify-between mb-4">
        <h1>Équipe</h1>
        {permissions?.can_edit_users && (
          <Link to="/team/create">
            <Button>+ Nouveau membre</Button>
          </Link>
        )}
      </header>

      <div className="flex gap-4 mb-4">
        <SearchInput value={search} onChange={setSearch} />
        <Select value={filter} onChange={setFilter}>
          <option value="all">Tous</option>
          <option value="active">Actifs</option>
          <option value="inactive">Inactifs</option>
        </Select>
      </div>

      {isLoading ? (
        <Spinner />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map(member => (
            <TeamMemberCard key={member.id} member={member} />
          ))}
        </div>
      )}
    </Layout>
  );
};
```

## 🧪 Points de test

- [ ] Liste affiche tous les membres
- [ ] Recherche filtre correctement
- [ ] Filtre actif/inactif fonctionne
- [ ] Création de membre
- [ ] Modification des informations
- [ ] Désactivation membre
- [ ] Permissions respectées
