# 📊 Module Dashboard

> Tableau de bord principal affichant les statistiques et le programme du jour.

## 📋 Vue d'ensemble

| Aspect | Valeur |
|--------|--------|
| **Page** | `Dashboard.tsx` |
| **Hook** | `useDashboard` |
| **Store** | Utilise `useAuthStore` |
| **Endpoint** | `GET /dashbord` |
| **Composants** | `LiveShowBanner`, `QuickActions`, Stats cards |

## 🎯 Fonctionnalités

### 1. Statistiques en temps réel

| Statistique | Description | Icône |
|-------------|-------------|-------|
| **Émissions du jour** | Nombre d'émissions programmées aujourd'hui | 📻 |
| **Membres de l'équipe** | Total des membres actifs | 👥 |
| **Heures de direct** | Cumul des heures de diffusion du jour | ⏱️ |
| **Émissions planifiées** | Émissions à venir (prochains jours) | 📅 |

### 2. Programme du jour

- Liste chronologique des émissions du jour
- Affiche pour chaque émission :
  - Titre et émission parente
  - Animateurs assignés
  - Durée
  - Statut (draft, ready, live, done)
  - Segments avec invités

### 3. Bandeau émission en direct

- S'affiche uniquement si une émission est en cours
- Informations : titre, animateur, temps restant
- Lien rapide vers le conducteur

### 4. Actions rapides

Raccourcis vers les fonctionnalités principales :
- Créer un conducteur
- Voir mes conducteurs
- Accéder aux archives
- Gérer les invités

## 📁 Structure des fichiers

```
src/
├── pages/
│   └── Dashboard.tsx              # Page principale
├── hooks/
│   └── dashbord/
│       └── useDashboard.ts        # Hook de récupération données
└── components/
    └── dashboard/
        ├── LiveShowBanner.tsx     # Bandeau émission en cours
        ├── QuickActions.tsx       # Actions rapides
        ├── StatCard.tsx           # Carte statistique
        └── ProgrammeItem.tsx      # Item du programme
```

## 🔒 Contraintes et règles métier

### Accès

| Règle | Description |
|-------|-------------|
| **Authentification** | Requise (token JWT valide) |
| **Permission** | Aucune permission spécifique requise |
| **Redirection** | Vers `/login` si non authentifié |

### Données

| Contrainte | Description |
|------------|-------------|
| **Rafraîchissement** | Au chargement de la page uniquement |
| **Cache** | Pas de cache (données temps réel) |
| **Fallback** | Affiche 0 si données manquantes |

## 📊 Types TypeScript

### DashboardData

```typescript
interface DashboardData {
  emissions_du_jour: number;
  membres_equipe: number;
  heures_direct: number;
  emissions_planifiees: number;
  en_direct_et_a_venir: number;
  programme_du_jour: ProgrammeItem[];
}
```

### ProgrammeItem

```typescript
interface ProgrammeItem {
  id: number;
  emission: string;           // Nom de l'émission parente
  emission_id: number;
  title: string;              // Titre du conducteur
  type: string;               // Type (talk, music, interview...)
  broadcast_date: string;     // Date ISO de diffusion
  duration: number;           // Durée en minutes
  frequency: string;          // daily, weekly, monthly...
  description: string;
  status: string;             // draft, ready, live, done
  presenters: Presenter[];
  segments: Segment[];
  animateur?: string;         // Nom principal (legacy)
}
```

### Presenter

```typescript
interface Presenter {
  id: number;
  name: string;
  contact_info: string | null;
  biography: string | null;
  isMainPresenter: boolean;
}
```

### Segment

```typescript
interface Segment {
  id: number;
  title: string;
  type: string;
  duration: number;
  description: string;
  startTime: string | null;
  position: number;
  technical_notes: string | null;
  guests: Guest[];
}
```

## 🔌 Endpoint API

### GET /dashbord

**Headers requis :**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Réponse :**
```json
{
  "emissions_du_jour": 5,
  "membres_equipe": 12,
  "heures_direct": 8,
  "emissions_planifiees": 15,
  "en_direct_et_a_venir": 2,
  "programme_du_jour": [
    {
      "id": 123,
      "emission": "Matinale Info",
      "emission_id": 1,
      "title": "Matinale du 15 janvier",
      "type": "talk",
      "broadcast_date": "2025-01-15T07:00:00",
      "duration": 180,
      "frequency": "daily",
      "description": "Édition spéciale",
      "status": "ready",
      "presenters": [...],
      "segments": [...]
    }
  ]
}
```

## 🪝 Hook useDashboard

### Implémentation

```typescript
export const useDashboard = () => {
  const navigate = useNavigate();
  const { token, logout } = useAuthStore((state) => ({
    token: state.token,
    logout: state.logout
  }));
  
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!token) {
        setError("Aucun token d'authentification disponible");
        setIsLoading(false);
        navigate('/login');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await api.get('dashbord', {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });
        setDashboardData(response.data as DashboardData);
      } catch (err: any) {
        if (err.response?.status === 401) {
          logout();
          navigate('/login');
          setError('Session expirée. Veuillez vous reconnecter.');
        } else {
          setError(err.response?.data?.detail || 'Erreur lors de la récupération');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, [token, navigate, logout]);

  return { dashboardData, isLoading, error };
};
```

### Valeurs retournées

| Propriété | Type | Description |
|-----------|------|-------------|
| `dashboardData` | `DashboardData \| null` | Données du tableau de bord |
| `isLoading` | `boolean` | État de chargement |
| `error` | `string \| null` | Message d'erreur éventuel |

## 🎨 Interface utilisateur

### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  [LiveShowBanner] - Si émission en cours                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────┐│
│  │ Émissions    │ │ Équipe       │ │ Heures       │ │ Planifiées││
│  │ du jour: 5   │ │ active: 12   │ │ direct: 8h   │ │ 15       ││
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────┘│
├─────────────────────────────────────────────────────────────────┤
│  [QuickActions] - Liens rapides                                 │
├─────────────────────────────────────────────────────────────────┤
│  Programme du jour                                              │
│  ├── 07:00 - Matinale Info (180 min) [ready]                   │
│  │   └── Animateur: Jean Dupont                                │
│  ├── 10:00 - Magazine Culture (60 min) [draft]                 │
│  │   └── Animateur: Marie Martin                               │
│  └── ...                                                        │
└─────────────────────────────────────────────────────────────────┘
```

### États de chargement

| État | Affichage |
|------|-----------|
| `isLoading: true` | Spinner + skeleton cards |
| `error` | Message d'erreur avec bouton retry |
| `dashboardData: null` | Message "Aucune donnée" |
| Success | Affichage complet |

## ⚠️ Gestion des erreurs

| Erreur | Comportement |
|--------|--------------|
| Token manquant | Redirect `/login` |
| 401 Unauthorized | Logout + redirect `/login` |
| Erreur réseau | Affiche message + retry |
| Données invalides | Log console + fallback |

## 🔄 Dépendances

### Imports

```typescript
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useDashboard } from '../hooks/dashbord/useDashboard';
import api from '../api/api';
```

### Composants utilisés

- `Layout` : Structure de page avec sidebar
- `LiveShowBanner` : Bandeau émission en direct
- `QuickActions` : Grille d'actions rapides
- Composants UI : `Card`, `Spinner`, `Badge`

## 🧪 Points de test

- [ ] Affichage correct des 4 statistiques
- [ ] Programme du jour triés par heure
- [ ] LiveShowBanner visible si émission en cours
- [ ] Gestion erreur 401 (logout)
- [ ] Skeleton pendant chargement
- [ ] Responsive mobile/desktop

## 📝 Exemples d'utilisation

### Page Dashboard

```tsx
const Dashboard = () => {
  const { dashboardData, isLoading, error } = useDashboard();

  if (isLoading) return <DashboardSkeleton />;
  if (error) return <ErrorMessage message={error} />;
  if (!dashboardData) return <EmptyState />;

  return (
    <Layout>
      {dashboardData.en_direct_et_a_venir > 0 && (
        <LiveShowBanner shows={dashboardData.programme_du_jour} />
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Émissions du jour" 
          value={dashboardData.emissions_du_jour} 
          icon={Radio} 
        />
        <StatCard 
          title="Équipe" 
          value={dashboardData.membres_equipe} 
          icon={Users} 
        />
        <StatCard 
          title="Heures de direct" 
          value={`${dashboardData.heures_direct}h`} 
          icon={Clock} 
        />
        <StatCard 
          title="Planifiées" 
          value={dashboardData.emissions_planifiees} 
          icon={Calendar} 
        />
      </div>

      <QuickActions />

      <ProgrammeList items={dashboardData.programme_du_jour} />
    </Layout>
  );
};
```
