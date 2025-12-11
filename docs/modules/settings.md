# ⚙️ Module Paramètres

> Configuration de l'application : présentateurs, privilèges, rôles, modèles, audit et versions.

## 📋 Vue d'ensemble

| Aspect | Valeur |
|--------|--------|
| **Page** | `Settings.tsx` |
| **Permission** | `can_manage_settings` |
| **Onglets** | 7 sections de configuration |

## 🎯 Fonctionnalités

### Onglets disponibles

| Onglet | Description | Permission |
|--------|-------------|------------|
| **Général** | Paramètres globaux | `can_manage_settings` |
| **Animateurs** | Gestion des présentateurs | `can_view_presenters` |
| **Privilèges** | Gestion des permissions | `can_manage_roles` |
| **Rôles** | CRUD des rôles | `can_manage_roles` |
| **Modèles** | Templates de conducteurs | `can_manage_settings` |
| **Audit** | Logs d'activité | `can_view_audit_logs` |
| **Versions** | Historique des versions | Tous |

## 📁 Structure des fichiers

```
src/
├── pages/
│   └── Settings.tsx               # Page principale avec tabs
├── components/
│   └── settings/
│       ├── GeneralSettings.tsx    # Onglet général
│       ├── PresenterSettings.tsx  # Onglet animateurs
│       ├── PrivilegeSettings.tsx  # Onglet privilèges
│       ├── RoleSettings.tsx       # Onglet rôles
│       ├── TemplateSettings.tsx   # Onglet modèles
│       ├── AuditSettings.tsx      # Onglet audit
│       └── VersionSettings.tsx    # Onglet versions
├── store/
│   └── useVersionStore.ts         # Store versions
└── hooks/
    └── permissions/
        ├── useRoleTemplates.ts    # Templates de rôles
        ├── useUpdatePermissions.ts # Mise à jour permissions
        └── useUserPermissions.ts  # Permissions utilisateur
```

## 🔒 Contraintes et règles métier

### Permissions par onglet

| Onglet | Permission requise |
|--------|-------------------|
| Général | `can_manage_settings` |
| Animateurs | `can_view_presenters`, `can_edit_presenters` |
| Privilèges | `can_manage_roles` |
| Rôles | `can_manage_roles` |
| Modèles | `can_manage_settings` |
| Audit | `can_view_audit_logs` |
| Versions | Aucune (lecture seule) |

### Règles métier

| Règle | Description |
|-------|-------------|
| Rôle système | Rôles "Admin" et "User" non supprimables |
| Audit | Logs conservés 90 jours |
| Versions | Comparison sémantique (semver) |

---

## 📑 Onglet 1: Général

### Paramètres configurables

| Paramètre | Type | Description |
|-----------|------|-------------|
| Nom de la radio | Texte | Nom affiché dans l'interface |
| Logo | Image | Logo de la radio |
| Fuseau horaire | Select | Timezone pour les dates |
| Langue | Select | Langue de l'interface |
| Format de date | Select | DD/MM/YYYY ou MM/DD/YYYY |

---

## 📑 Onglet 2: Animateurs

### Fonctionnalités

- Liste des présentateurs
- Ajout depuis utilisateurs existants
- Modification des informations
- Suppression (soft delete)

### Actions

| Action | Permission | Description |
|--------|------------|-------------|
| Voir liste | `can_view_presenters` | Liste tous les animateurs |
| Ajouter | `can_edit_presenters` | Promouvoir un utilisateur |
| Modifier | `can_edit_presenters` | Éditer biographie, photo |
| Supprimer | `can_delete_presenters` | Retirer le statut |

### API utilisée

```typescript
// GET /presenters/all - Liste des présentateurs
// POST /presenters/ - Créer un présentateur
// PUT /presenters/update/{id} - Modifier
// DELETE /presenters/del/{id} - Supprimer
```

---

## 📑 Onglet 3: Privilèges

### Fonctionnalités

- Matrice permissions/rôles
- Attribution par case à cocher
- Sauvegarde en temps réel

### Structure de la matrice

```
                    │ Admin │ Éditeur │ Animateur │ Invité │
────────────────────┼───────┼─────────┼───────────┼────────┤
can_create_showplan │   ✓   │    ✓    │     ✓     │        │
can_edit_showplan   │   ✓   │    ✓    │     ◐     │        │
can_delete_showplan │   ✓   │         │           │        │
can_view_users      │   ✓   │    ✓    │           │        │
...                 │       │         │           │        │

✓ = Autorisé, ◐ = Partiel (owned only), (vide) = Refusé
```

### Hook useUpdatePermissions

```typescript
const useUpdatePermissions = () => {
  const token = useAuthStore(state => state.token);
  
  const updateRolePermissions = async (
    roleId: number, 
    permissions: Partial<UserPermissions>
  ) => {
    await api.put(`roles/${roleId}/permissions`, permissions, {
      headers: { Authorization: `Bearer ${token}` }
    });
  };
  
  return { updateRolePermissions };
};
```

---

## 📑 Onglet 4: Rôles

### Fonctionnalités

- CRUD des rôles
- Attribution aux utilisateurs
- Rôles par défaut protégés

### API Rôles

```typescript
export const rolesApi = {
  getAll: (token) => api.get('roles/all'),
  getById: (token, id) => api.get(`roles/id/${id}`),
  create: (token, name) => api.post('roles/', { name }),
  update: (token, id, name) => api.put(`roles/update/${id}`, { name }),
  delete: (token, id) => api.delete(`roles/del/${id}`),
  assignRoles: (token, userId, roleIds) => api.post(`roles/assign/${userId}`, { role_ids: roleIds }),
  unassignRoles: (token, userId, roleIds) => api.post(`roles/unassign/${userId}`, { role_ids: roleIds }),
  getUserRoles: (token, userId) => api.get(`roles/all_assigned/${userId}`),
};
```

### Contraintes

| Contrainte | Description |
|------------|-------------|
| Nom unique | Deux rôles ne peuvent avoir le même nom |
| Rôle Admin | Non modifiable, non supprimable |
| Utilisateur min | Tout utilisateur a au moins 1 rôle |

---

## 📑 Onglet 5: Modèles

### Fonctionnalités

- Templates de conducteurs
- Segments prédéfinis
- Duplication rapide

### Structure d'un modèle

```typescript
interface ShowPlanTemplate {
  id: string;
  name: string;
  description: string;
  type: ShowType;
  defaultDuration: number;
  segments: TemplateSegment[];
  createdAt: string;
  createdBy: number;
}

interface TemplateSegment {
  title: string;
  type: SegmentType;
  duration: number;
  description?: string;
}
```

---

## 📑 Onglet 6: Audit

### Fonctionnalités

- Historique des actions
- Filtres par date/utilisateur/action
- Export CSV

### Types d'événements loggés

| Action | Description |
|--------|-------------|
| `LOGIN` | Connexion utilisateur |
| `LOGOUT` | Déconnexion |
| `CREATE_*` | Création d'entité |
| `UPDATE_*` | Modification |
| `DELETE_*` | Suppression |
| `STATUS_CHANGE` | Changement de statut |
| `PERMISSION_CHANGE` | Modification permissions |

### Structure d'un log

```typescript
interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: number;
  userName: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
}
```

### Permission requise

- `can_view_audit_logs` : Voir les logs
- `can_view_login_history` : Voir l'historique de connexion

---

## 📑 Onglet 7: Versions

### Fonctionnalités

- Affichage version actuelle
- Changelog des versions
- Comparaison avec version précédente
- Notification de mise à jour

### Store useVersionStore

```typescript
interface VersionState {
  currentVersion: string;
  latestVersion: string;
  changelog: ChangelogEntry[];
  hasUpdate: boolean;
  isLoading: boolean;
}

interface ChangelogEntry {
  version: string;
  date: string;
  changes: {
    type: 'feature' | 'fix' | 'improvement' | 'breaking';
    description: string;
  }[];
}

const useVersionStore = create<VersionState>()(
  persist(
    (set) => ({
      currentVersion: '1.1.3',
      latestVersion: '1.1.3',
      changelog: [],
      hasUpdate: false,
      isLoading: false,
      
      checkForUpdates: async () => {
        // Appel API pour vérifier nouvelle version
      },
      
      fetchChangelog: async () => {
        // Récupérer historique des versions
      }
    }),
    { name: 'version-storage' }
  )
);
```

### Affichage version

```
┌─────────────────────────────────────────────────────────────────┐
│  RadioManager SaaS                                              │
│  Version 1.1.3                                                  │
├─────────────────────────────────────────────────────────────────┤
│  📋 Changelog                                                   │
│                                                                 │
│  v1.1.3 (15/01/2025)                                           │
│  ├── 🐛 Fix: Réinitialisation mot de passe                     │
│  └── ✨ Amélioration: Affichage version dans le footer          │
│                                                                 │
│  v1.1.2 (10/01/2025)                                           │
│  ├── ✨ Feature: Export PDF archives                           │
│  └── 🐛 Fix: Erreur 401 sur refresh                            │
│                                                                 │
│  v1.1.0 (01/01/2025)                                           │
│  └── ✨ Feature: Système de chat temps réel                    │
└─────────────────────────────────────────────────────────────────┘
```

## 🎨 Interface utilisateur

### Layout principal

```
┌─────────────────────────────────────────────────────────────────┐
│  Paramètres                                                     │
├─────────────────────────────────────────────────────────────────┤
│  [Général] [Animateurs] [Privilèges] [Rôles] [Modèles] [Audit] [Versions]
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Contenu de l'onglet sélectionné                               │
│                                                                 │
│                                                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 📝 Exemple d'implémentation

### Page Settings

```tsx
const Settings = () => {
  const { permissions } = useAuthStore();
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'Général', permission: 'can_manage_settings' },
    { id: 'presenters', label: 'Animateurs', permission: 'can_view_presenters' },
    { id: 'privileges', label: 'Privilèges', permission: 'can_manage_roles' },
    { id: 'roles', label: 'Rôles', permission: 'can_manage_roles' },
    { id: 'templates', label: 'Modèles', permission: 'can_manage_settings' },
    { id: 'audit', label: 'Audit', permission: 'can_view_audit_logs' },
    { id: 'versions', label: 'Versions', permission: null },
  ];

  const visibleTabs = tabs.filter(
    tab => !tab.permission || permissions?.[tab.permission]
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'general': return <GeneralSettings />;
      case 'presenters': return <PresenterSettings />;
      case 'privileges': return <PrivilegeSettings />;
      case 'roles': return <RoleSettings />;
      case 'templates': return <TemplateSettings />;
      case 'audit': return <AuditSettings />;
      case 'versions': return <VersionSettings />;
      default: return null;
    }
  };

  return (
    <Layout>
      <h1>Paramètres</h1>
      
      <nav className="border-b mb-4">
        {visibleTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 ${
              activeTab === tab.id 
                ? 'border-b-2 border-blue-500 text-blue-600' 
                : 'text-gray-500'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="p-4">
        {renderContent()}
      </div>
    </Layout>
  );
};
```

## 🧪 Points de test

- [ ] Onglets visibles selon permissions
- [ ] Sauvegarde paramètres généraux
- [ ] CRUD animateurs fonctionne
- [ ] Matrice privilèges se met à jour
- [ ] CRUD rôles avec contraintes
- [ ] Templates créés/utilisés
- [ ] Logs audit filtrables
- [ ] Version affichée correctement
