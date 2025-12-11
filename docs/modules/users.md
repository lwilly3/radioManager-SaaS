# 👤 Module Utilisateurs

> Administration des comptes utilisateurs, rôles et réinitialisation de mot de passe.

## 📋 Vue d'ensemble

| Aspect | Valeur |
|--------|--------|
| **Pages** | `users/UserList.tsx`, `users/UserCreate.tsx`, `users/UserEdit.tsx`, `users/UserRoles.tsx` |
| **Service API** | `src/services/api/users.ts`, `src/services/api/roles.ts` |
| **Permissions** | `can_acces_users_section`, `can_view_users`, `can_edit_users`, `can_desable_users`, `can_delete_users`, `can_manage_roles`, `can_assign_roles` |

## 🎯 Fonctionnalités

### 1. Liste des utilisateurs

- Affichage paginé
- Recherche par nom/email
- Filtres par rôle/statut
- Export CSV

### 2. Création d'utilisateur

- Informations de compte
- Attribution initiale des rôles
- Envoi d'invitation par email

### 3. Modification

- Mise à jour des informations
- Gestion des rôles
- Historique de connexion

### 4. Réinitialisation de mot de passe

- Génération de token unique
- Lien de réinitialisation
- Expiration du token

### 5. Gestion des rôles

- Attribution/retrait de rôles
- Voir les permissions du rôle
- Rôles multiples par utilisateur

## 📁 Structure des fichiers

```
src/
├── pages/
│   └── users/
│       ├── UserList.tsx           # Liste des utilisateurs
│       ├── UserCreate.tsx         # Création
│       ├── UserEdit.tsx           # Modification
│       └── UserRoles.tsx          # Gestion des rôles
├── services/
│   └── api/
│       ├── users.ts               # Service API utilisateurs
│       └── roles.ts               # Service API rôles
├── types/
│   └── user.ts                    # Types TypeScript
└── schemas/
    └── userSchema.ts              # Validation Zod
```

## 🔒 Contraintes et règles métier

### Permissions requises

| Action | Permission |
|--------|------------|
| Accéder à la section | `can_acces_users_section` |
| Voir la liste | `can_view_users` |
| Créer | `can_edit_users` |
| Modifier | `can_edit_users` |
| Désactiver | `can_desable_users` |
| Supprimer | `can_delete_users` |
| Gérer les rôles | `can_manage_roles` |
| Attribuer des rôles | `can_assign_roles` |

### Contraintes de données

| Champ | Contrainte |
|-------|------------|
| `username` | Requis, unique, 3-50 caractères |
| `email` | Requis, unique, format email |
| `password` | Requis à la création, min 8 caractères |
| `name` | Requis, 2-100 caractères |
| `family_name` | Optionnel, max 100 caractères |
| `phone_number` | Optionnel, format téléphone |

### Règles métier

| Règle | Description |
|-------|-------------|
| Email unique | Deux utilisateurs ne peuvent avoir le même email |
| Username unique | Deux utilisateurs ne peuvent avoir le même username |
| Au moins 1 rôle | Tout utilisateur doit avoir au moins un rôle |
| Admin protégé | Le compte admin principal ne peut être désactivé |
| Reset token | Expire après 24h |

## 📊 Types TypeScript

### Users

```typescript
interface Users {
  id: number;
  username: string;
  email: string;
  name: string;
  family_name?: string;
  phone_number?: string;
  is_active: boolean;
  created_at: string;
  last_login?: string;
  roles: Role[];
}
```

### CreateUserData

```typescript
interface CreateUserData {
  username: string;
  email: string;
  password: string;
  name: string;
  family_name?: string;
  phone_number?: string;
  role_ids: number[];
}
```

### UpdateUserData

```typescript
interface UpdateUserData {
  username?: string;
  email?: string;
  name?: string;
  family_name?: string;
  phone_number?: string;
  is_active?: boolean;
}
```

### Role

```typescript
interface Role {
  id: number;
  name: string;
  description?: string;
  permissions?: UserPermissions;
}
```

## 🔌 Endpoints API

### Utilisateurs

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/users/users` | Liste tous les utilisateurs |
| `GET` | `/users/non-presenters` | Utilisateurs non animateurs |
| `GET` | `/search_users/id/{id}` | Détail d'un utilisateur |
| `POST` | `/users/users` | Créer un utilisateur |
| `PUT` | `/users/updte/{id}` | Modifier un utilisateur |
| `DELETE` | `/users/del/{id}` | Supprimer un utilisateur |

### Réinitialisation mot de passe

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `POST` | `/auth/generate-reset-token` | Générer token reset |
| `GET` | `/auth/reset-token/validate` | Valider token |
| `POST` | `/auth/reset-password` | Reset le mot de passe |

### Rôles

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/roles/all` | Liste tous les rôles |
| `GET` | `/roles/id/{id}` | Détail d'un rôle |
| `POST` | `/roles/` | Créer un rôle |
| `PUT` | `/roles/update/{id}` | Modifier un rôle |
| `DELETE` | `/roles/del/{id}` | Supprimer un rôle |
| `POST` | `/roles/assign/{userId}` | Attribuer des rôles |
| `POST` | `/roles/unassign/{userId}` | Retirer des rôles |
| `GET` | `/roles/all_assigned/{userId}` | Rôles d'un utilisateur |

### Service API (users.ts)

```typescript
export const usersApi = {
  getAll: async (token: string): Promise<Users[]> => {
    const response = await api.get('users/users', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  getNonPresenters: async (token: string): Promise<{ total: number; users: Users[] }> => {
    const response = await api.get('users/non-presenters', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  getById: async (token: string, id: number): Promise<any> => {
    const response = await api.get(`search_users/id/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  create: async (token: string, userData: CreateUserData): Promise<Users> => {
    const response = await api.post('users/users', userData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  update: async (token: string, userId: number, userData: UpdateUserData): Promise<Users> => {
    const response = await api.put(`users/updte/${userId}`, userData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  delete: async (token: string, userId: number): Promise<void> => {
    await api.delete(`users/del/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // Réinitialisation mot de passe
  generateResetToken: async (token: string, userId: number): Promise<{ reset_token: string; expires_at: string }> => {
    const response = await api.post(
      'auth/generate-reset-token',
      { user_id: userId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  validateResetToken: async (resetToken: string): Promise<{ valid: boolean; user_id: number }> => {
    const response = await api.get(`auth/reset-token/validate?token=${resetToken}`);
    return response.data;
  },

  resetPassword: async (resetToken: string, newPassword: string): Promise<{ message: string }> => {
    const response = await api.post('auth/reset-password', {
      token: resetToken,
      new_password: newPassword
    });
    return response.data;
  }
};
```

### Service API (roles.ts)

```typescript
export const rolesApi = {
  getAll: async (token: string): Promise<Role[]> => {
    const response = await api.get('roles/all', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  create: async (token: string, name: string): Promise<Role> => {
    const response = await api.post('roles/', { name }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  update: async (token: string, roleId: number, name: string): Promise<Role> => {
    const response = await api.put(`roles/update/${roleId}`, { name }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  delete: async (token: string, roleId: number): Promise<void> => {
    await api.delete(`roles/del/${roleId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  assignRoles: async (token: string, userId: number, roleIds: number[]): Promise<void> => {
    await api.post(`roles/assign/${userId}`, { role_ids: roleIds }, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  unassignRoles: async (token: string, userId: number, roleIds: number[]): Promise<void> => {
    await api.post(`roles/unassign/${userId}`, { role_ids: roleIds }, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  getUserRoles: async (token: string, userId: number): Promise<Role[]> => {
    const response = await api.get(`roles/all_assigned/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  }
};
```

## 🎨 Interface utilisateur

### Liste des utilisateurs

```
┌─────────────────────────────────────────────────────────────────┐
│  Utilisateurs                              [+ Nouvel utilisateur]│
├─────────────────────────────────────────────────────────────────┤
│  🔍 Rechercher...              [Rôle ▼] [Statut ▼] [📥 Export]  │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Avatar│ Nom         │ Email           │ Rôles    │ Actions  ││
│  ├───────┼─────────────┼─────────────────┼──────────┼──────────┤│
│  │ 🖼️    │ Jean Dupont │ jean@radio.fr   │ Admin    │ ✏️ 🔑 🗑️ ││
│  │ 🖼️    │ Marie Martin│ marie@radio.fr  │ Éditeur  │ ✏️ 🔑 🗑️ ││
│  │ 🖼️    │ Pierre D.   │ pierre@radio.fr │ Animateur│ ✏️ 🔑 🗑️ ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  [< 1 2 3 ... 10 >]                                            │
└─────────────────────────────────────────────────────────────────┘
```

### Formulaire de création

```
┌─────────────────────────────────────────────────────────────────┐
│  Nouvel utilisateur                                    [Fermer] │
├─────────────────────────────────────────────────────────────────┤
│  Nom d'utilisateur *                                            │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                                                             ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  Email *                                                        │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                                                             ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  Mot de passe *                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ ••••••••                                          [👁️]     ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  Prénom *                        Nom de famille                 │
│  ┌────────────────────────────┐ ┌────────────────────────────┐ │
│  │                            │ │                            │ │
│  └────────────────────────────┘ └────────────────────────────┘ │
│                                                                 │
│  Téléphone                                                      │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                                                             ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  Rôles *                                                        │
│  [✓] Admin  [ ] Éditeur  [✓] Animateur  [ ] Invité             │
│                                                                 │
│                                      [Annuler] [Créer]          │
└─────────────────────────────────────────────────────────────────┘
```

### Gestion des rôles utilisateur

```
┌─────────────────────────────────────────────────────────────────┐
│  Rôles de Jean Dupont                                  [Fermer] │
├─────────────────────────────────────────────────────────────────┤
│  Rôles actuels:                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ [Admin ×] [Éditeur ×]                                       ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  Ajouter un rôle:                                               │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ [ ] Animateur                                               ││
│  │ [ ] Technicien                                              ││
│  │ [ ] Invité                                                  ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│                                      [Annuler] [Enregistrer]    │
└─────────────────────────────────────────────────────────────────┘
```

### Réinitialisation mot de passe

```
┌─────────────────────────────────────────────────────────────────┐
│  Réinitialiser le mot de passe                         [Fermer] │
├─────────────────────────────────────────────────────────────────┤
│  Utilisateur: Jean Dupont (jean@radio.fr)                       │
│                                                                 │
│  Un lien de réinitialisation sera généré.                       │
│  Ce lien expirera dans 24 heures.                               │
│                                                                 │
│  ⚠️ L'utilisateur devra définir un nouveau mot de passe.       │
│                                                                 │
│                        [Annuler] [Générer le lien]              │
└─────────────────────────────────────────────────────────────────┘

// Après génération :
┌─────────────────────────────────────────────────────────────────┐
│  Lien de réinitialisation généré                       [Fermer] │
├─────────────────────────────────────────────────────────────────┤
│  ✅ Le lien a été généré avec succès.                          │
│                                                                 │
│  Lien:                                                          │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ https://app.cloud.audace.ovh/reset?token=abc123...         ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                  [📋 Copier]    │
│                                                                 │
│  Expire le: 16/01/2025 à 14:30                                  │
│                                                                 │
│  Envoyez ce lien à l'utilisateur par un canal sécurisé.        │
│                                                                 │
│                                              [Fermer]           │
└─────────────────────────────────────────────────────────────────┘
```

## 📝 Exemple d'implémentation

### Page UserList

```tsx
const UserList = () => {
  const token = useAuthStore(state => state.token);
  const { permissions } = useAuthStore();
  const [users, setUsers] = useState<Users[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<number | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Users | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await usersApi.getAll(token);
      setUsers(data);
    } catch (error) {
      console.error('Erreur', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateResetLink = async (user: Users) => {
    try {
      const { reset_token, expires_at } = await usersApi.generateResetToken(token, user.id);
      const resetUrl = `${window.location.origin}/reset?token=${reset_token}`;
      // Afficher le lien dans une modal
      setResetLink({ url: resetUrl, expiresAt: expires_at });
    } catch (error) {
      console.error('Erreur génération token', error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = !roleFilter || user.roles.some(r => r.id === roleFilter);
    return matchesSearch && matchesRole;
  });

  if (!permissions?.can_acces_users_section) {
    return <AccessDenied />;
  }

  return (
    <Layout>
      <header className="flex justify-between mb-4">
        <h1>Utilisateurs</h1>
        {permissions.can_edit_users && (
          <Link to="/users/create">
            <Button>+ Nouvel utilisateur</Button>
          </Link>
        )}
      </header>

      <div className="flex gap-4 mb-4">
        <SearchInput value={search} onChange={setSearch} />
        <RoleSelect value={roleFilter} onChange={setRoleFilter} />
        <Button variant="outline" onClick={handleExport}>
          📥 Export
        </Button>
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
              <th>Rôles</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id}>
                <td><Avatar src={user.avatar} /></td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  {user.roles.map(role => (
                    <Badge key={role.id}>{role.name}</Badge>
                  ))}
                </td>
                <td>
                  {permissions.can_edit_users && (
                    <Link to={`/users/edit/${user.id}`}>
                      <Button variant="ghost">✏️</Button>
                    </Link>
                  )}
                  {permissions.can_assign_roles && (
                    <Link to={`/users/roles/${user.id}`}>
                      <Button variant="ghost">🔑</Button>
                    </Link>
                  )}
                  {permissions.can_edit_users && (
                    <Button 
                      variant="ghost"
                      onClick={() => handleGenerateResetLink(user)}
                    >
                      🔄
                    </Button>
                  )}
                  {permissions.can_delete_users && (
                    <Button 
                      variant="ghost" 
                      color="red"
                      onClick={() => handleDelete(user.id)}
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

      <ResetPasswordModal 
        open={showResetModal}
        user={selectedUser}
        onClose={() => setShowResetModal(false)}
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
| 404 | Message "Utilisateur non trouvé" |
| 422 | Erreurs validation |
| Email dupliqué | Message "Cet email est déjà utilisé" |
| Username dupliqué | Message "Ce nom d'utilisateur existe déjà" |
| Token expiré | Message "Le lien a expiré" |

## 🔄 Validation Zod

```typescript
// schemas/userSchema.ts
import { z } from 'zod';

export const createUserSchema = z.object({
  username: z.string()
    .min(3, 'Le nom d\'utilisateur doit contenir au moins 3 caractères')
    .max(50, 'Le nom d\'utilisateur ne peut pas dépasser 50 caractères'),
  email: z.string()
    .email('Email invalide'),
  password: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  name: z.string()
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .max(100, 'Le prénom ne peut pas dépasser 100 caractères'),
  family_name: z.string()
    .max(100, 'Le nom ne peut pas dépasser 100 caractères')
    .optional(),
  phone_number: z.string().optional(),
  role_ids: z.array(z.number()).min(1, 'Au moins un rôle est requis'),
});

export const updateUserSchema = createUserSchema.partial().omit({ password: true });

export const resetPasswordSchema = z.object({
  new_password: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre'),
  confirm_password: z.string(),
}).refine(data => data.new_password === data.confirm_password, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirm_password'],
});
```

## 🧪 Points de test

- [ ] Liste affiche tous les utilisateurs
- [ ] Recherche par nom/email
- [ ] Filtre par rôle
- [ ] Création avec validation
- [ ] Modification sauvegarde
- [ ] Attribution de rôles
- [ ] Génération token reset
- [ ] Reset mot de passe fonctionne
- [ ] Token expiré rejeté
- [ ] Permissions respectées
- [ ] Export CSV fonctionne
