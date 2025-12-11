# 👤 Module Profil

> Gestion du profil utilisateur connecté et de ses préférences.

## 📋 Vue d'ensemble

| Aspect | Valeur |
|--------|--------|
| **Page** | `Profile.tsx` |
| **Store** | `useUserPreferencesStore`, `useAuthStore` |
| **Firebase** | Synchronisation préférences |

## 🎯 Fonctionnalités

### 1. Informations personnelles

- Affichage des données du compte
- Modification du nom, prénom
- Photo de profil

### 2. Changement de mot de passe

- Ancien mot de passe requis
- Validation du nouveau mot de passe
- Confirmation

### 3. Préférences d'affichage

- Mode de vue (grille/liste)
- Préférences sauvegardées en Firebase

## 📁 Structure des fichiers

```
src/
├── pages/
│   └── Profile.tsx                # Page profil
├── store/
│   └── useUserPreferencesStore.ts # Store préférences
└── components/
    └── profile/
        ├── ProfileInfo.tsx        # Informations
        ├── PasswordChange.tsx     # Changement mdp
        └── ViewPreferences.tsx    # Préférences vue
```

## 🔒 Contraintes et règles métier

### Changement de mot de passe

| Règle | Description |
|-------|-------------|
| Ancien mot de passe | Requis pour changer |
| Nouveau mot de passe | Min 8 caractères |
| Confirmation | Doit correspondre |

## 📊 Types TypeScript

### UserPreferences

```typescript
interface UserPreferences {
  viewMode: 'grid' | 'list';
  theme?: 'light' | 'dark';
  language?: string;
  notifications?: {
    email: boolean;
    push: boolean;
  };
}
```

## 🗃️ Store (useUserPreferencesStore)

```typescript
interface UserPreferencesState {
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  syncToFirebase: () => Promise<void>;
  loadFromFirebase: () => Promise<void>;
}

export const useUserPreferencesStore = create<UserPreferencesState>()(
  persist(
    (set, get) => ({
      viewMode: 'grid',
      
      setViewMode: (mode) => {
        set({ viewMode: mode });
        get().syncToFirebase();
      },
      
      syncToFirebase: async () => {
        const userId = useAuthStore.getState().user?.id;
        if (!userId) return;
        
        const prefRef = doc(db, 'userPreferences', String(userId));
        await setDoc(prefRef, {
          viewMode: get().viewMode,
          updatedAt: serverTimestamp()
        }, { merge: true });
      },
      
      loadFromFirebase: async () => {
        const userId = useAuthStore.getState().user?.id;
        if (!userId) return;
        
        const prefRef = doc(db, 'userPreferences', String(userId));
        const snapshot = await getDoc(prefRef);
        
        if (snapshot.exists()) {
          const data = snapshot.data();
          set({ viewMode: data.viewMode || 'grid' });
        }
      }
    }),
    { name: 'user-preferences' }
  )
);
```

## 🎨 Interface utilisateur

### Page Profil

```
┌─────────────────────────────────────────────────────────────────┐
│  Mon profil                                                     │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────┐                                                   │
│  │          │  Jean Dupont                                      │
│  │   🖼️     │  jean.dupont@radio.fr                            │
│  │          │  Animateur                                        │
│  └──────────┘  Membre depuis: 01/01/2024                       │
│                                                                 │
│  [Modifier la photo]                                            │
├─────────────────────────────────────────────────────────────────┤
│  Informations                                      [Modifier]   │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Prénom       : Jean                                         ││
│  │ Nom          : Dupont                                       ││
│  │ Email        : jean.dupont@radio.fr                         ││
│  │ Téléphone    : +33 6 12 34 56 78                           ││
│  └─────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────┤
│  Sécurité                                                       │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Mot de passe : ••••••••              [Changer le mot de passe]│
│  │ Dernière connexion : 15/01/2025 à 10:30                     ││
│  └─────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────┤
│  Préférences d'affichage                                        │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Mode de vue : ◉ Grille  ○ Liste                             ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### Modal changement mot de passe

```
┌─────────────────────────────────────────────────────────────────┐
│  Changer le mot de passe                               [Fermer] │
├─────────────────────────────────────────────────────────────────┤
│  Mot de passe actuel *                                          │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ ••••••••                                          [👁️]     ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  Nouveau mot de passe *                                         │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ ••••••••                                          [👁️]     ││
│  └─────────────────────────────────────────────────────────────┘│
│  ℹ️ Minimum 8 caractères, 1 majuscule, 1 chiffre               │
│                                                                 │
│  Confirmer le mot de passe *                                    │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ ••••••••                                          [👁️]     ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│                              [Annuler] [Changer le mot de passe]│
└─────────────────────────────────────────────────────────────────┘
```

## 📝 Exemple d'implémentation

### Page Profile

```tsx
const Profile = () => {
  const { user, permissions } = useAuthStore();
  const { viewMode, setViewMode } = useUserPreferencesStore();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  return (
    <Layout>
      <h1>Mon profil</h1>

      <Card className="mb-4">
        <div className="flex items-center gap-4">
          <Avatar size="lg" src={user?.avatar} />
          <div>
            <h2>{user?.name} {user?.family_name}</h2>
            <p className="text-gray-500">{user?.email}</p>
            <p className="text-sm text-gray-400">
              Membre depuis: {formatDate(user?.created_at)}
            </p>
          </div>
        </div>
      </Card>

      <Card className="mb-4">
        <div className="flex justify-between items-center mb-4">
          <h3>Informations</h3>
          <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? 'Annuler' : 'Modifier'}
          </Button>
        </div>

        {isEditing ? (
          <ProfileEditForm 
            user={user}
            onSave={() => setIsEditing(false)}
          />
        ) : (
          <ProfileInfoDisplay user={user} />
        )}
      </Card>

      <Card className="mb-4">
        <h3>Sécurité</h3>
        <div className="flex justify-between items-center">
          <div>
            <p>Mot de passe : ••••••••</p>
            <p className="text-sm text-gray-400">
              Dernière connexion: {formatDateTime(user?.last_login)}
            </p>
          </div>
          <Button onClick={() => setShowPasswordModal(true)}>
            Changer le mot de passe
          </Button>
        </div>
      </Card>

      <Card>
        <h3>Préférences d'affichage</h3>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="viewMode"
              checked={viewMode === 'grid'}
              onChange={() => setViewMode('grid')}
            />
            Grille
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="viewMode"
              checked={viewMode === 'list'}
              onChange={() => setViewMode('list')}
            />
            Liste
          </label>
        </div>
      </Card>

      <PasswordChangeModal
        open={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </Layout>
  );
};
```

## 🔥 Structure Firestore

```
firestore/
└── userPreferences/
    └── {userId}/
        ├── viewMode: string ('grid' | 'list')
        ├── theme: string ('light' | 'dark')
        └── updatedAt: timestamp
```

## 🧪 Points de test

- [ ] Affichage informations utilisateur
- [ ] Modification prénom/nom
- [ ] Changement mot de passe avec validation
- [ ] Préférence vue grille/liste sauvegardée
- [ ] Sync Firebase fonctionne
- [ ] Préférences restaurées au login
