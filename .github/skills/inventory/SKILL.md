# 📦 Agent Skill: Module Inventaire & Gestion du Matériel

## Rôle
Guider l'agent dans l'implémentation complète du module de gestion d'inventaire multi-entreprises/multi-sites, incluant le suivi du matériel, les mouvements, la maintenance et les listes configurables.

## Quand utiliser ce skill

### Déclencheurs automatiques
- Création/modification de fonctionnalités liées à l'inventaire
- Gestion d'équipements, consommables, accessoires
- Suivi des mouvements (attributions, transferts, prêts)
- Maintenance et cycle de vie du matériel
- Localisation et recherche d'équipements
- Configuration des listes dynamiques (catégories, statuts, etc.)
- Intégration avec les sites/locaux/entreprises

### Contexte d'utilisation
- **Systématique** : Toute opération sur le module Inventaire
- Création de formulaires d'ajout/modification d'équipement
- Développement de fonctionnalités de recherche et filtrage
- Gestion des mouvements et historique
- Configuration des paramètres d'inventaire

---

## 🏗️ Architecture technique

### Pattern d'accès aux données : Firebase Direct

> **Décision** : Le module Inventaire utilise **Firebase Direct** (comme Quotes, Settings)
> et non l'API Backend (comme Shows, Users).

```
┌─────────────────────────────────────────────────────────────────────┐
│                         ARCHITECTURE HYBRIDE DU PROJET               │
│                                                                      │
│  ┌────────────────────────────┐    ┌─────────────────────────────┐  │
│  │   API BACKEND (Axios)      │    │   FIREBASE DIRECT (SDK)     │  │
│  │                            │    │                             │  │
│  │   • Shows/Émissions        │    │   • Quotes (citations) ✓    │  │
│  │   • Users                  │    │   • Settings (PDF, etc.) ✓  │  │
│  │   • Guests (invités)       │    │   • Chat (temps réel) ✓     │  │
│  │   • Auth (JWT)             │    │   • INVENTAIRE ✓ ← NOUVEAU  │  │
│  └────────────────────────────┘    └─────────────────────────────┘  │
│              │                              │                        │
│              ▼                              ▼                        │
│    api.radio.audace.ovh           Firebase Cloud                    │
│    (Backend Python)               (Firestore + Storage)             │
└─────────────────────────────────────────────────────────────────────┘
```

### Pourquoi Firebase pour l'Inventaire ?

| Critère | API Backend | Firebase ✅ |
|---------|-------------|-------------|
| **Temps réel** | ❌ Polling | ✅ `onSnapshot` natif |
| **Offline** | ❌ Non | ✅ Cache intégré |
| **Documents/Fichiers** | Complexe | ✅ Storage intégré |
| **Relations existantes** | ❌ Pas de lien users/shows | ✅ Standalone |
| **Rapidité dev** | Attendre backend | ✅ Frontend autonome |

### Flux de données

```
┌──────────────────────────────────────────────────────────────────┐
│  COMPONENT                                                        │
│  └─ useEquipment()                                               │
│       └─ inventoryService.getEquipments()                        │
│             └─ Firestore: collection('equipment').where(...)     │
│                   │                                               │
│                   ▼ onSnapshot (temps réel)                      │
│             ┌─────────────────────────────────────────┐          │
│             │  FIREBASE FIRESTORE                     │          │
│             │  ├── equipment/                         │          │
│             │  ├── equipment_movements/               │          │
│             │  ├── equipment_documents/               │          │
│             │  └── settings/inventory_settings        │          │
│             └─────────────────────────────────────────┘          │
│                   │                                               │
│                   ▼ Storage pour fichiers                        │
│             ┌─────────────────────────────────────────┐          │
│             │  FIREBASE STORAGE                       │          │
│             │  └── inventory/{equipmentId}/           │          │
│             │       ├── photos/                       │          │
│             │       └── documents/                    │          │
│             └─────────────────────────────────────────┘          │
└──────────────────────────────────────────────────────────────────┘
```

### Structure des fichiers

```
src/
├── api/firebase/
│   └── inventory.ts              # Service CRUD Firestore
│       ├── getEquipments()
│       ├── createEquipment()
│       ├── updateEquipment()
│       ├── deleteEquipment()
│       ├── getMovements()
│       └── uploadDocument()      # → Firebase Storage
│
├── hooks/inventory/
│   ├── useInventorySettings.ts   # Config → settings/inventory_settings
│   ├── useEquipment.ts           # CRUD équipements
│   ├── useEquipmentMovements.ts  # Historique mouvements
│   ├── useEquipmentDocuments.ts  # Upload/Download docs
│   └── useDocumentAccess.ts      # Contrôle d'accès documents
│
├── components/inventory/
│   ├── EquipmentList.tsx
│   ├── EquipmentDetail.tsx
│   ├── EquipmentForm.tsx
│   ├── MovementHistory.tsx
│   ├── DocumentUploader.tsx
│   └── ...
│
└── pages/Inventory/
    ├── index.tsx                 # Liste principale
    ├── EquipmentDetail.tsx       # Détail équipement
    └── ...
```

---

## 🔐 Système de permissions

### Architecture des permissions (existante)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FLUX DES PERMISSIONS                         │
│                                                                      │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────────┐   │
│  │   BACKEND    │    │   ZUSTAND    │    │   FIRESTORE          │   │
│  │   (API)      │───▶│   STORE      │◀──▶│   (Sync temps réel)  │   │
│  │              │    │              │    │                      │   │
│  │ Source de    │    │ Cache local  │    │ users/{uid}/         │   │
│  │ vérité      │    │ permissions  │    │   permissions        │   │
│  └──────────────┘    └──────────────┘    └──────────────────────┘   │
│                             │                                        │
│                             ▼                                        │
│                     ┌──────────────────────────────────────┐        │
│                     │   COMPOSANTS REACT                    │        │
│                     │   useAuthStore((s) => s.permissions)  │        │
│                     └──────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────────────┘
```

### Fichiers de permissions existants

| Fichier | Rôle |
|---------|------|
| `src/types/permissions.ts` | Définitions : `UserPermissions`, `RoleTemplate`, catégories |
| `src/store/authStore.ts` | Store Zustand : stocke `permissions` |
| `src/hooks/permissions/` | Hooks API : `useUserPermissions`, `useUpdatePermissions` |
| `src/components/auth/ProtectedRoute.tsx` | Garde de route avec `requiredPermission` |

### Permissions Inventaire à ajouter

```typescript
// À AJOUTER dans src/types/permissions.ts

export interface UserPermissions {
  // ... permissions existantes ...
  
  // ═══ INVENTAIRE ═══
  inventory_view: boolean;              // Voir l'inventaire
  inventory_create: boolean;            // Créer un équipement
  inventory_edit: boolean;              // Modifier un équipement
  inventory_delete: boolean;            // Supprimer un équipement
  inventory_move: boolean;              // Effectuer des mouvements
  inventory_manage_settings: boolean;   // Configurer les listes
  inventory_view_all_companies: boolean; // Voir équipements toutes entreprises
  inventory_manage_documents: boolean;  // Gérer les documents/pièces jointes
}

// Ajouter la catégorie dans permissionCategories
{
  id: 'inventory',
  name: 'Inventaire',
  icon: 'Package',
  permissions: [
    { key: 'inventory_view', label: 'Voir l\'inventaire', description: 'Accéder à la liste des équipements' },
    { key: 'inventory_create', label: 'Créer des équipements', description: 'Ajouter de nouveaux équipements' },
    { key: 'inventory_edit', label: 'Modifier des équipements', description: 'Éditer les informations' },
    { key: 'inventory_delete', label: 'Supprimer des équipements', description: 'Retirer définitivement' },
    { key: 'inventory_move', label: 'Gérer les mouvements', description: 'Attributions, transferts, prêts' },
    { key: 'inventory_manage_settings', label: 'Configurer l\'inventaire', description: 'Gérer les listes (catégories, statuts...)' },
    { key: 'inventory_view_all_companies', label: 'Voir toutes les entreprises', description: 'Accès inter-entreprises' },
    { key: 'inventory_manage_documents', label: 'Gérer les documents', description: 'Upload/suppression documents' },
  ],
}
```

### Patterns d'utilisation des permissions

```tsx
// Pattern 1 : Vérification inline
const { permissions } = useAuthStore();

{permissions?.inventory_create && (
  <Button onClick={handleCreate}>Nouvel équipement</Button>
)}

// Pattern 2 : Protection de route
<ProtectedRoute requiredPermission="inventory_view">
  <InventoryPage />
</ProtectedRoute>

// Pattern 3 : Vérification avant action
const handleDelete = async (id: string) => {
  if (!permissions?.inventory_delete) {
    toast.error('Permission refusée');
    return;
  }
  await deleteEquipment(id);
};

// Pattern 4 : Redirection si pas de permission
useEffect(() => {
  if (!isLoading && permissions && !permissions.inventory_view) {
    navigate('/404');
  }
}, [permissions, isLoading, navigate]);
```

### Contrôle d'accès documents (spécifique inventaire)

```typescript
// src/hooks/inventory/useDocumentAccess.ts
export const useDocumentAccess = (document: EquipmentDocument, equipment: Equipment) => {
  const { user, permissions } = useAuthStore();
  
  const canView = useMemo(() => {
    // Vérifier permission globale
    if (!permissions?.inventory_view) return false;
    
    // Vérifier niveau d'accès du document
    switch (document.accessLevel) {
      case 'public':
        return true;
      case 'company':
        return equipment.currentLocation.companyId === user?.companyId;
      case 'team':
        return ['technician', 'engineer', 'admin'].includes(user?.role || '');
      case 'admin':
        return user?.role === 'admin';
      case 'restricted':
        return document.allowedUserIds?.includes(user?.uid || '');
      default:
        return false;
    }
  }, [document, equipment, user, permissions]);
  
  const canEdit = permissions?.inventory_manage_documents && 
    (user?.role === 'admin' || document.uploadedBy === user?.uid);
  
  const canDelete = permissions?.inventory_manage_documents && user?.role === 'admin';
  
  return { canView, canEdit, canDelete };
};
```

---

## 📋 Vue d'ensemble du système

### Objectif métier

Le système d'inventaire permet de :
1. **Référencer** tous les équipements, consommables et accessoires
2. **Localiser** chaque item (site, local, utilisateur assigné)
3. **Tracer** tous les mouvements (attributions, transferts, prêts, retours)
4. **Maintenir** le suivi de maintenance et du cycle de vie
5. **Configurer** les listes dynamiques sans modification de code
6. **Rechercher** par multiples critères (utilisateur, local, site, entreprise)

### Contexte multi-entreprises (Groupe Radio)

> **Contexte réel** : Le groupe comprend plusieurs entreprises de secteurs différents
> qui partagent des ressources matérielles, informatiques et même certains bureaux.
> Un équipement peut être utilisé par plusieurs entreprises, prêté temporairement
> pour des besoins spécifiques, et doit être traçable à tout moment.

```
┌─────────────────────────────────────────────────────────────────────┐
│                     GROUPE MULTI-ACTIVITÉS                          │
│                                                                      │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────┐  │
│  │     BAJ     │   │   TRAFRIC   │   │     AMG     │   │  Autres │  │
│  │ (Pétrolier) │   │ (Transport) │   │   (Média)   │   │   ...   │  │
│  │             │   │             │   │Radio/TV/Prod│   │         │  │
│  └──────┬──────┘   └──────┬──────┘   └──────┬──────┘   └────┬────┘  │
│         │                 │                 │               │        │
│         └─────────────────┼─────────────────┴───────────────┘        │
│                           │                                          │
│                    RESSOURCES PARTAGÉES                              │
│         ┌─────────────────┴─────────────────┐                        │
│         │  💻 Informatique  🔧 Matériel     │                        │
│         │  • Ordinateurs   • Équipements    │                        │
│         │  • Imprimantes   • Outillage      │                        │
│         │  • Serveurs      • Véhicules      │                        │
│         │                                   │                        │
│         │  🏢 Bureaux       👥 Personnel    │                        │
│         │  • Salles réunion • Techniciens   │                        │
│         │  • Open spaces   • IT Support     │                        │
│         └───────────────────────────────────┘                        │
│                           │                                          │
│    ┌──────────────────────┼──────────────────────┐                   │
│    │                      │                      │                   │
│    ▼                      ▼                      ▼                   │
│ ┌──────────┐        ┌──────────┐          ┌──────────┐               │
│ │  SIÈGE   │        │ DÉPÔTS   │          │ TERRAIN  │               │
│ │ ─────────│        │ ─────────│          │ ─────────│               │
│ │ Bureaux  │        │ Stock    │          │ Chantiers│               │
│ │ Salle IT │        │ Garage   │          │ Studios  │               │
│ │ Réunion  │        │ Atelier  │          │ Stations │               │
│ └──────────┘        └──────────┘          └──────────┘               │
└─────────────────────────────────────────────────────────────────────┘
```

### Cas d'usage spécifiques

| Scénario | Exemple | Traçabilité requise |
|----------|---------|---------------------|
| **Prêt inter-entreprises** | Laptop BAJ prêté à AMG pour tournage | Qui, quand, où, retour prévu |
| **Matériel partagé** | Imprimante du siège utilisée par les 3 entreprises | Localisation, disponibilité |
| **Transfert permanent** | Véhicule Trafric transféré à BAJ | Changement de propriétaire tracé |
| **Mission terrain** | Kit informatique pour intervention station-service | Liste équipements, responsable, dates |
| **Maintenance partagée** | Serveur en réparation, indispo pour tous | Statut visible par toutes les entreprises |
| **Bureau partagé** | Salle de réunion équipée (vidéoprojecteur, visio) | Équipements fixes d'un local mutualisé |
| **Prêt véhicule** | Camion Trafric prêté pour déménagement AMG | Kilométrage, état, dates |

### Architecture du flux

```
┌─────────────────────────────────────────────────────────────┐
│                    MODULE INVENTAIRE                         │
│                                                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│  │ Équipements │ │ Mouvements  │ │ Maintenance │            │
│  │   (CRUD)    │ │ (Historique)│ │  (Suivi)    │            │
│  └──────┬──────┘ └──────┬──────┘ └──────┬──────┘            │
│         │               │               │                    │
│         └───────────────┼───────────────┘                    │
│                         │                                    │
│  ┌──────────────────────┴──────────────────────────────────┐│
│  │                    RECHERCHE                             ││
│  │  🔍 Par utilisateur | Par local | Par site | Par statut ││
│  └──────────────────────────────────────────────────────────┘│
└─────────────────────────┼───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    FIREBASE FIRESTORE                        │
│                                                              │
│  equipment/           equipment_movements/    maintenance/   │
│  ├── {equipmentId}    ├── {movementId}       ├── {recordId} │
│  │   └── ...          │   └── from/to        │   └── ...    │
│  │                    │                      │               │
│  settings/            rooms/                 sites/          │
│  └── inventory_       ├── {roomId}           ├── {siteId}   │
│      settings         │   └── siteId         │   └── ...    │
│      ├── categories   │                      │               │
│      ├── statuses     companies/                             │
│      ├── movementTypes├── {companyId}                        │
│      └── conditions   │   └── sites[]                        │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    SETTINGS > INVENTAIRE                     │
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ 📂 Catégories    | 📊 Statuts   | 🔄 Mouvements        ││
│  │ + Microphones    | + En service | + Attribution         ││
│  │ + Consoles       | + En panne   | + Retour              ││
│  │ + Câbles         | + Maintenance| + Prêt                ││
│  │ [+ Ajouter]      | [+ Ajouter]  | [+ Ajouter]           ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Structure des données

### Types de base

```typescript
// src/types/inventory.ts

/**
 * Option configurable générique
 * Utilisée pour catégories, statuts, types de mouvement, etc.
 */
export interface ConfigurableOption {
  id: string;
  name: string;
  description?: string;
  color?: string;           // Code couleur hex pour badges
  icon?: string;            // Nom icône Lucide (ex: "Mic", "Monitor")
  isDefault?: boolean;      // Option sélectionnée par défaut
  isActive: boolean;        // Soft delete
  order: number;            // Ordre d'affichage
  metadata?: Record<string, unknown>;
}

/**
 * Type de document attaché à un équipement
 */
export type DocumentType = 
  | 'manual'               // Manuel utilisateur/fabricant
  | 'configuration'        // Document de configuration
  | 'datasheet'            // Fiche technique
  | 'certificate'          // Certificat (conformité, calibration...)
  | 'warranty'             // Document de garantie
  | 'invoice'              // Facture
  | 'maintenance_report'   // Rapport de maintenance
  | 'other';               // Autre

/**
 * Niveau d'accès pour un document
 */
export type DocumentAccessLevel = 
  | 'public'               // Tous les utilisateurs authentifiés
  | 'company'              // Utilisateurs de l'entreprise propriétaire
  | 'team'                 // Équipe technique uniquement
  | 'admin'                // Administrateurs uniquement
  | 'restricted';          // Liste d'utilisateurs spécifiques

/**
 * Document attaché à un équipement
 * Stocké dans Firebase Storage, métadonnées dans Firestore
 */
export interface EquipmentDocument {
  id: string;
  equipmentId: string;
  
  // ═══════════════════════════════════════════════════════════
  // INFORMATIONS FICHIER
  // ═══════════════════════════════════════════════════════════
  fileName: string;                       // Nom original du fichier
  displayName: string;                    // Nom affiché (personnalisable)
  description?: string;                   // Description du document
  
  type: DocumentType;                     // Type de document
  mimeType: string;                       // Type MIME (application/pdf, etc.)
  fileSize: number;                       // Taille en bytes
  
  // ═══════════════════════════════════════════════════════════
  // STOCKAGE
  // ═══════════════════════════════════════════════════════════
  storageUrl: string;                     // URL Firebase Storage
  storagePath: string;                    // Chemin dans Storage
  thumbnailUrl?: string;                  // Miniature si applicable
  
  // ═══════════════════════════════════════════════════════════
  // CONTRÔLE D'ACCÈS
  // ═══════════════════════════════════════════════════════════
  accessLevel: DocumentAccessLevel;
  allowedUserIds?: string[];              // Si accessLevel = 'restricted'
  allowedRoles?: string[];                // Rôles autorisés (ex: 'technician')
  
  // ═══════════════════════════════════════════════════════════
  // VERSIONING (optionnel)
  // ═══════════════════════════════════════════════════════════
  version?: string;                       // "v1.2", "2024-01"
  isLatest: boolean;                      // Est la version la plus récente
  previousVersionId?: string;             // ID version précédente
  
  // ═══════════════════════════════════════════════════════════
  // MÉTADONNÉES
  // ═══════════════════════════════════════════════════════════
  tags?: string[];                        // Tags pour recherche
  language?: string;                      // "fr", "en"
  expiresAt?: string;                     // Date d'expiration si applicable
  
  // ═══════════════════════════════════════════════════════════
  // AUDIT
  // ═══════════════════════════════════════════════════════════
  uploadedAt: string;
  uploadedBy: string;
  uploadedByName: string;
  lastAccessedAt?: string;
  downloadCount: number;
}

/**
 * Configuration globale du module inventaire
 * Stockée dans Firestore: settings/inventory_settings
 */
export interface InventorySettings {
  // ═══════════════════════════════════════════════════════════
  // LISTES CONFIGURABLES
  // ═══════════════════════════════════════════════════════════
  categories: ConfigurableOption[];        // Microphones, Consoles, Câbles...
  equipmentStatuses: ConfigurableOption[]; // Disponible, Attribué, En mission...
  movementTypes: ConfigurableOption[];     // Attribution, Prêt, Sortie mission...
  missionTypes: ConfigurableOption[];      // Reportage, Tournage, Événement...
  conditionStates: ConfigurableOption[];   // Neuf, Bon, Usé, Endommagé...
  documentTypes: ConfigurableOption[];     // Types de documents configurables
  
  // ═══════════════════════════════════════════════════════════
  // CONFIGURATION DOCUMENTS
  // ═══════════════════════════════════════════════════════════
  documents: {
    maxFileSizeMB: number;                 // Taille max par fichier (ex: 50)
    allowedMimeTypes: string[];            // Types autorisés
    defaultAccessLevel: DocumentAccessLevel;
    enableVersioning: boolean;             // Activer versioning documents
  };
  
  // ═══════════════════════════════════════════════════════════
  // OPTIONS GLOBALES
  // ═══════════════════════════════════════════════════════════
  defaultWarrantyMonths: number;           // Durée garantie par défaut
  lowStockThreshold: number;               // Seuil alerte stock bas
  
  // Règles de validation
  requireApprovalForTransfer: boolean;     // Validation pour transferts inter-sites
  requireApprovalForCompanyLoan: boolean;  // Validation pour prêts inter-entreprises
  requireApprovalForMission: boolean;      // Validation pour sorties mission
  
  // Notifications
  notifyOnLowStock: boolean;               // Alerter quand stock bas
  notifyOnOverdueReturn: boolean;          // Alerter retours en retard
  overdueThresholdDays: number;            // Jours avant alerte retard
  
  // ═══════════════════════════════════════════════════════════
  // AUDIT
  // ═══════════════════════════════════════════════════════════
  updatedAt: string;
  updatedBy: string;
}
```

### Interface Équipement

```typescript
/**
 * Équipement / Item d'inventaire
 */
export interface Equipment {
  id: string;
  
  // ═══════════════════════════════════════════════════════════
  // IDENTIFICATION
  // ═══════════════════════════════════════════════════════════
  name: string;                           // Nom de l'équipement
  reference: string;                      // Référence interne unique
  serialNumber?: string;                  // Numéro de série fabricant
  barcode?: string;                       // Code-barres/QR code
  
  // ═══════════════════════════════════════════════════════════
  // CLASSIFICATION (liée aux ConfigurableOption)
  // ═══════════════════════════════════════════════════════════
  categoryId: string;                     // ID catégorie (ConfigurableOption)
  categoryName: string;                   // Nom dénormalisé pour affichage
  subcategory?: string;                   // Sous-catégorie libre
  
  // ═══════════════════════════════════════════════════════════
  // FABRICANT & MODÈLE
  // ═══════════════════════════════════════════════════════════
  brand: string;                          // Marque/Fabricant
  model: string;                          // Modèle
  manufacturer?: string;                  // Fabricant si différent de marque
  
  // ═══════════════════════════════════════════════════════════
  // ÉTAT & STATUT
  // ═══════════════════════════════════════════════════════════
  statusId: string;                       // ID statut (ConfigurableOption)
  statusName: string;                     // Nom dénormalisé
  conditionId: string;                    // ID condition (ConfigurableOption)
  conditionName: string;                  // Nom dénormalisé
  
  // ═══════════════════════════════════════════════════════════
  // LOCALISATION ACTUELLE
  // ═══════════════════════════════════════════════════════════
  currentLocation: {
    companyId: string;
    companyName: string;
    siteId: string;
    siteName: string;
    roomId?: string;
    roomName?: string;
    specificLocation?: string;            // "Étagère 3", "Rack B2"
  };
  
  // ═══════════════════════════════════════════════════════════
  // ASSIGNATION ACTUELLE
  // ═══════════════════════════════════════════════════════════
  currentAssignment?: {
    userId: string;
    userName: string;
    userEmail: string;
    assignedAt: string;
    assignedBy: string;
    expectedReturnDate?: string;
    notes?: string;
  };
  
  // ═══════════════════════════════════════════════════════════
  // ACQUISITION & VALEUR
  // ═══════════════════════════════════════════════════════════
  acquisition: {
    date: string;                         // Date d'acquisition
    type: 'purchase' | 'donation' | 'lease' | 'transfer' | 'other';
    purchasePrice?: number;
    currentValue?: number;                // Valeur actuelle estimée
    supplier?: string;
    invoiceNumber?: string;
    invoiceUrl?: string;                  // Lien vers facture (Storage)
  };
  
  // ═══════════════════════════════════════════════════════════
  // GARANTIE
  // ═══════════════════════════════════════════════════════════
  warranty?: {
    startDate: string;
    endDate: string;
    provider?: string;
    contractNumber?: string;
    notes?: string;
  };
  
  // ═══════════════════════════════════════════════════════════
  // CONFIGURATION TECHNIQUE (optionnel)
  // ═══════════════════════════════════════════════════════════
  configuration?: {
    // Paramètres actuels de l'équipement
    settings?: Record<string, string | number | boolean>;
    // Notes de configuration (texte libre)
    configNotes?: string;
    // Dernière mise à jour config
    lastConfiguredAt?: string;
    lastConfiguredBy?: string;
    // Version firmware/software si applicable
    firmwareVersion?: string;
    softwareVersion?: string;
  };
  
  // ═══════════════════════════════════════════════════════════
  // DOCUMENTATION & PIÈCES JOINTES
  // ═══════════════════════════════════════════════════════════
  documentation: {
    description?: string;
    notes?: string;
    manualUrl?: string;                   // Lien vers manuel fabricant
    photos: string[];                     // URLs photos (Storage)
  };
  
  // Documents et pièces jointes (gérés séparément pour permissions)
  documents: EquipmentDocument[];
  
  // ═══════════════════════════════════════════════════════════
  // CARACTÉRISTIQUES TECHNIQUES
  // ═══════════════════════════════════════════════════════════
  specifications?: Record<string, string | number>;
  
  // ═══════════════════════════════════════════════════════════
  // QUANTITÉ (pour consommables)
  // ═══════════════════════════════════════════════════════════
  isConsumable: boolean;
  quantity?: number;
  minQuantity?: number;                   // Seuil alerte stock bas
  unit?: string;                          // "pièce", "mètre", "lot"
  
  // ═══════════════════════════════════════════════════════════
  // AUDIT
  // ═══════════════════════════════════════════════════════════
  createdAt: string;
  createdBy: string;
  createdByName: string;
  updatedAt: string;
  updatedBy: string;
  isArchived: boolean;
  archivedAt?: string;
  archivedReason?: string;
}
```

### Interface Mouvement

```typescript
/**
 * Types de mouvement d'équipement
 * 
 * IMPORTANT: Ces mouvements permettent de tracer TOUT le cycle de vie
 * d'un équipement, y compris les prêts inter-entreprises (BAJ → Trafric)
 * et les sorties pour missions (reportages, tournages).
 */
export type MovementType =
  // ─── Assignations utilisateur ───
  | 'assignment'           // Attribution à un utilisateur
  | 'return'               // Retour de l'utilisateur
  
  // ─── Prêts et missions ───
  | 'loan'                 // Prêt temporaire à une personne
  | 'loan_return'          // Retour de prêt
  | 'mission_checkout'     // Sortie pour mission (reportage/tournage)
  | 'mission_checkin'      // Retour de mission
  
  // ─── Prêts inter-entreprises ───
  | 'company_loan'         // Prêt à une autre entreprise (BAJ → Trafric)
  | 'company_loan_return'  // Retour du prêt inter-entreprises
  | 'transfer_company'     // Transfert PERMANENT de propriété
  
  // ─── Déplacements physiques ───
  | 'transfer_site'        // Transfert entre sites
  | 'transfer_room'        // Déplacement entre locaux/pièces
  
  // ─── Maintenance & Réparation ───
  | 'maintenance_out'      // Envoi en maintenance
  | 'maintenance_in'       // Retour de maintenance
  | 'repair_out'           // Envoi en réparation externe
  | 'repair_in'            // Retour de réparation
  
  // ─── Cycle de vie ───
  | 'initial_entry'        // Entrée initiale dans l'inventaire
  | 'disposal'             // Mise au rebut
  | 'loss'                 // Perte/Vol déclaré
  | 'found'                // Équipement retrouvé
  | 'inventory_check'      // Vérification/Audit inventaire
  
  // ─── Autre ───
  | 'other';

/**
 * Mouvement d'équipement avec historique complet
 * 
 * Chaque mouvement enregistre l'état AVANT (from) et APRÈS (to)
 * pour permettre une traçabilité totale.
 */
export interface EquipmentMovement {
  id: string;
  equipmentId: string;
  equipmentRef: string;                   // Référence équipement (pour affichage)
  equipmentName: string;                  // Nom équipement (dénormalisé)
  
  // ═══════════════════════════════════════════════════════════
  // TYPE DE MOUVEMENT
  // ═══════════════════════════════════════════════════════════
  movementTypeId: string;                 // ID ConfigurableOption ou type système
  movementTypeName: string;               // Nom dénormalisé
  movementCategory: MovementType;         // Catégorie système
  
  // ═══════════════════════════════════════════════════════════
  // LIEN MISSION (optionnel)
  // ═══════════════════════════════════════════════════════════
  missionId?: string;                     // Si lié à une mission
  missionTitle?: string;
  missionType?: 'reportage' | 'tournage' | 'evenement' | 'autre';
  
  // ═══════════════════════════════════════════════════════════
  // ORIGINE (avant mouvement)
  // ═══════════════════════════════════════════════════════════
  from: {
    companyId?: string;
    companyName?: string;
    siteId?: string;
    siteName?: string;
    roomId?: string;
    roomName?: string;
    userId?: string;
    userName?: string;
    specificLocation?: string;
  };
  
  // ═══════════════════════════════════════════════════════════
  // DESTINATION (après mouvement)
  // ═══════════════════════════════════════════════════════════
  to: {
    companyId?: string;
    companyName?: string;
    siteId?: string;
    siteName?: string;
    roomId?: string;
    roomName?: string;
    userId?: string;
    userName?: string;
    specificLocation?: string;
    // Pour les missions terrain
    externalLocation?: string;            // "Festival Jazz, Montreux"
  };
  
  // ═══════════════════════════════════════════════════════════
  // DÉTAILS
  // ═══════════════════════════════════════════════════════════
  date: string;                           // Date du mouvement
  expectedReturnDate?: string;            // Date retour prévue (prêts/missions)
  actualReturnDate?: string;              // Date retour effective
  reason: string;                         // Motif du mouvement
  notes?: string;
  
  // ═══════════════════════════════════════════════════════════
  // VALIDATION
  // ═══════════════════════════════════════════════════════════
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  requiresApproval: boolean;              // Selon les règles (inter-entreprises, etc.)
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: string;
  rejectionReason?: string;
  
  // ═══════════════════════════════════════════════════════════
  // ÉTAT AU RETOUR (pour prêts/missions)
  // ═══════════════════════════════════════════════════════════
  returnCondition?: {
    conditionId: string;
    conditionName: string;
    notes?: string;
    issues?: string[];                    // Problèmes constatés
    photosUrls?: string[];
  };
  
  // ═══════════════════════════════════════════════════════════
  // DOCUMENTS
  // ═══════════════════════════════════════════════════════════
  attachments?: {
    name: string;
    url: string;
    type: string;
  }[];
  signatureUrl?: string;                  // Signature de réception/remise
  
  // ═══════════════════════════════════════════════════════════
  // AUDIT
  // ═══════════════════════════════════════════════════════════
  createdAt: string;
  createdBy: string;
  createdByName: string;
}
```

### Interface Maintenance

```typescript
/**
 * Type de maintenance
 */
export type MaintenanceType =
  | 'preventive'        // Maintenance préventive planifiée
  | 'corrective'        // Réparation suite à panne
  | 'inspection'        // Inspection/Contrôle
  | 'calibration'       // Calibration/Étalonnage
  | 'cleaning'          // Nettoyage
  | 'upgrade'           // Mise à niveau
  | 'other';

/**
 * Enregistrement de maintenance
 */
export interface MaintenanceRecord {
  id: string;
  equipmentId: string;
  equipmentRef: string;
  equipmentName: string;
  
  // Type et description
  type: MaintenanceType;
  title: string;
  description: string;
  
  // Planification
  scheduledDate?: string;
  startDate?: string;
  endDate?: string;
  estimatedDuration?: number;             // En heures
  actualDuration?: number;
  
  // Intervenant
  performedBy?: {
    type: 'internal' | 'external';
    userId?: string;
    userName?: string;
    company?: string;
    contact?: string;
  };
  
  // Coûts
  costs?: {
    labor?: number;
    parts?: number;
    other?: number;
    total: number;
    currency: string;
  };
  
  // Pièces utilisées
  partsUsed?: {
    name: string;
    quantity: number;
    unitCost?: number;
  }[];
  
  // Résultat
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  result?: 'success' | 'partial' | 'failed';
  findings?: string;
  recommendations?: string;
  nextMaintenanceDate?: string;
  
  // Documents
  attachments?: {
    name: string;
    url: string;
    type: string;
  }[];
  
  // Audit
  createdAt: string;
  createdBy: string;
  createdByName: string;
  updatedAt: string;
}
```

### Structures de localisation

```typescript
/**
 * Entreprise/Société du groupe
 * 
 * Contexte: Groupe multi-activités avec partage de ressources
 * - BAJ : Produits pétroliers (stations-service, dépôts)
 * - Trafric : Transport et logistique (véhicules, entrepôts)
 * - AMG : Groupe média (radio, TV, production)
 * 
 * Les entreprises partagent : informatique, bureaux, certains équipements
 */
export interface Company {
  id: string;
  name: string;                           // "BAJ", "Trafric", "AMG"
  code: string;                           // Code court: "BAJ", "TRF", "AMG"
  type: CompanyType;                      // Secteur d'activité
  description?: string;                   // Description de l'activité
  
  // Coordonnées
  address?: string;
  phone?: string;
  email?: string;
  logo?: string;
  
  // Partage de ressources
  canShareEquipment: boolean;             // Peut prêter du matériel
  canBorrowEquipment: boolean;            // Peut emprunter du matériel
  requiresApprovalToLend: boolean;        // Prêts sortants nécessitent validation
  requiresApprovalToBorrow: boolean;      // Emprunts nécessitent validation
  
  // Relations
  parentCompanyId?: string;               // Entreprise parente (groupe)
  childCompanyIds?: string[];             // Filiales
  
  // Audit
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Types de secteurs d'activité
 */
export type CompanyType = 
  | 'petroleum'      // Produits pétroliers (BAJ)
  | 'transport'      // Transport et logistique (Trafric)
  | 'media'          // Média: Radio, TV, Production (AMG)
  | 'it_services'    // Services informatiques
  | 'holding'        // Société de holding
  | 'other';         // Autre

/**
 * Site/Établissement
 * 
 * Types adaptés aux différents secteurs :
 * - Pétrolier: station_service, depot
 * - Transport: garage, entrepot
 * - Média: studio, regie
 * - Commun: headquarters, office, warehouse
 */
export interface Site {
  id: string;
  companyId: string;
  companyName: string;
  name: string;
  code: string;                           // Code court (ex: "HQ", "STU1")
  type: SiteType;
  address?: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  phone?: string;
  email?: string;
  manager?: {
    userId: string;
    userName: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Types de sites adaptés aux différents secteurs
 */
export type SiteType = 
  // ─── Sites communs ───
  | 'headquarters'       // Siège social
  | 'office'             // Bureau
  | 'warehouse'          // Entrepôt/Stock
  | 'shared_space'       // Espace partagé (salle réunion, etc.)
  
  // ─── Secteur Pétrolier (BAJ) ───
  | 'station_service'    // Station-service
  | 'depot_carburant'    // Dépôt de carburant
  
  // ─── Secteur Transport (Trafric) ───
  | 'garage'             // Garage/Atelier mécanique
  | 'parking'            // Parc véhicules
  | 'hub_logistique'     // Hub logistique
  
  // ─── Secteur Média (AMG) ───
  | 'studio'             // Studio radio/TV
  | 'regie'              // Régie
  | 'salle_montage'      // Salle de montage
  | 'plateau_tv'         // Plateau TV
  
  // ─── Autres ───
  | 'external'           // Site externe/client
  | 'mobile'             // Unité mobile
  | 'other';             // Autre

/**
 * Local/Pièce
 */
export interface Room {
  id: string;
  siteId: string;
  siteName: string;
  companyId: string;
  name: string;
  code: string;                           // Code court (ex: "STU-A", "REG-1")
  type: 'studio' | 'control_room' | 'office' | 'storage' | 'technical' | 'other';
  floor?: string;
  building?: string;
  capacity?: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Missions / Projets (Reportages, Tournages)

```typescript
/**
 * Type de mission
 */
export type MissionType =
  | 'reportage'         // Reportage terrain
  | 'tournage'          // Tournage vidéo
  | 'evenement'         // Couverture événement
  | 'interview'         // Interview externe
  | 'emission_externe'  // Émission hors studio
  | 'formation'         // Formation/Workshop
  | 'autre';

/**
 * Mission/Projet nécessitant du matériel
 * Permet de regrouper plusieurs équipements pour une sortie
 */
export interface Mission {
  id: string;
  
  // ═══════════════════════════════════════════════════════════
  // IDENTIFICATION
  // ═══════════════════════════════════════════════════════════
  title: string;                          // "Reportage Festival Jazz"
  reference: string;                      // "MIS-2026-0042"
  type: MissionType;
  description?: string;
  
  // ═══════════════════════════════════════════════════════════
  // ENTREPRISES IMPLIQUÉES
  // ═══════════════════════════════════════════════════════════
  requestingCompanyId: string;            // Entreprise demandeuse (ex: Trafric)
  requestingCompanyName: string;
  providingCompanyIds: string[];          // Entreprises fournissant le matériel
  
  // ═══════════════════════════════════════════════════════════
  // DATES & LIEU
  // ═══════════════════════════════════════════════════════════
  startDate: string;
  endDate: string;
  location: {
    name: string;                         // "Palais des Congrès"
    address?: string;
    city?: string;
    coordinates?: { lat: number; lng: number };
  };
  
  // ═══════════════════════════════════════════════════════════
  // ÉQUIPE
  // ═══════════════════════════════════════════════════════════
  teamLeader: {
    userId: string;
    userName: string;
    userEmail: string;
    phone?: string;
  };
  teamMembers: {
    userId: string;
    userName: string;
    role?: string;                        // "Cadreur", "Journaliste", "Technicien"
  }[];
  
  // ═══════════════════════════════════════════════════════════
  // ÉQUIPEMENTS RÉSERVÉS
  // ═══════════════════════════════════════════════════════════
  equipment: {
    equipmentId: string;
    equipmentRef: string;
    equipmentName: string;
    categoryName: string;
    ownerCompanyId: string;               // Propriétaire du matériel
    ownerCompanyName: string;
    checkoutMovementId?: string;          // Mouvement de sortie
    checkinMovementId?: string;           // Mouvement de retour
    status: 'reserved' | 'checked_out' | 'returned' | 'issue';
    notes?: string;
    returnCondition?: string;             // État au retour
  }[];
  
  // ═══════════════════════════════════════════════════════════
  // STATUT
  // ═══════════════════════════════════════════════════════════
  status: 'draft' | 'pending_approval' | 'approved' | 'in_progress' | 'completed' | 'cancelled';
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: string;
  
  // ═══════════════════════════════════════════════════════════
  // DOCUMENTS & NOTES
  // ═══════════════════════════════════════════════════════════
  notes?: string;
  attachments?: {
    name: string;
    url: string;
    type: string;
  }[];
  
  // ═══════════════════════════════════════════════════════════
  // AUDIT
  // ═══════════════════════════════════════════════════════════
  createdAt: string;
  createdBy: string;
  createdByName: string;
  updatedAt: string;
}

/**
 * Réservation de matériel (pour calendrier)
 */
export interface EquipmentReservation {
  id: string;
  equipmentId: string;
  equipmentRef: string;
  equipmentName: string;
  
  // Lien mission (optionnel - peut être réservation simple)
  missionId?: string;
  missionTitle?: string;
  
  // Période
  startDate: string;
  endDate: string;
  
  // Demandeur
  requestedBy: string;
  requestedByName: string;
  requestedByCompany: string;
  
  // Statut
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  
  // Audit
  createdAt: string;
  notes?: string;
}
```

### Critères de recherche

```typescript
/**
 * Critères de recherche d'équipements
 */
export interface InventorySearchCriteria {
  // Recherche texte
  query?: string;                         // Recherche globale
  
  // Filtres d'identification
  reference?: string;
  serialNumber?: string;
  barcode?: string;
  
  // Filtres de classification
  categoryIds?: string[];
  brands?: string[];
  
  // Filtres de statut
  statusIds?: string[];
  conditionIds?: string[];
  isArchived?: boolean;
  
  // Filtres de localisation
  companyIds?: string[];
  siteIds?: string[];
  roomIds?: string[];
  
  // Filtres d'assignation
  assignedToUserId?: string;
  isAssigned?: boolean;
  
  // Filtres de valeur
  minValue?: number;
  maxValue?: number;
  
  // Filtres de garantie
  warrantyStatus?: 'active' | 'expired' | 'expiring_soon';
  warrantyExpiringBefore?: string;
  
  // Filtres consommables
  isConsumable?: boolean;
  lowStock?: boolean;
  
  // Filtres de date
  acquiredAfter?: string;
  acquiredBefore?: string;
  
  // Pagination
  limit?: number;
  offset?: number;
  cursor?: string;
  
  // Tri
  orderBy?: 'name' | 'reference' | 'createdAt' | 'updatedAt' | 'categoryName' | 'statusName';
  orderDirection?: 'asc' | 'desc';
}

/**
 * Critères de recherche de mouvements
 */
export interface MovementSearchCriteria {
  equipmentId?: string;
  equipmentRef?: string;
  movementTypes?: MovementType[];
  
  // Recherche par origine/destination
  fromCompanyId?: string;
  fromSiteId?: string;
  fromRoomId?: string;
  fromUserId?: string;
  toCompanyId?: string;
  toSiteId?: string;
  toRoomId?: string;
  toUserId?: string;
  
  // Filtres
  status?: ('pending' | 'approved' | 'rejected' | 'completed')[];
  dateFrom?: string;
  dateTo?: string;
  
  // Pagination
  limit?: number;
  cursor?: string;
  orderDirection?: 'asc' | 'desc';
}
```

---

## 🔧 Valeurs par défaut des listes configurables

```typescript
// src/utils/inventory/defaultSettings.ts

export const DEFAULT_INVENTORY_SETTINGS: InventorySettings = {
  // ═══════════════════════════════════════════════════════════
  // CATÉGORIES D'ÉQUIPEMENT (Multi-secteurs)
  // ═══════════════════════════════════════════════════════════
  categories: [
    // ─── Informatique (Partagé) ───
    { id: 'cat-computer', name: 'Ordinateurs', color: '#3B82F6', icon: 'Laptop', order: 1, isActive: true },
    { id: 'cat-printer', name: 'Imprimantes/Scanners', color: '#6366F1', icon: 'Printer', order: 2, isActive: true },
    { id: 'cat-network', name: 'Réseau', color: '#0EA5E9', icon: 'Network', order: 3, isActive: true },
    { id: 'cat-server', name: 'Serveurs', color: '#14B8A6', icon: 'Server', order: 4, isActive: true },
    { id: 'cat-phone', name: 'Téléphonie', color: '#8B5CF6', icon: 'Phone', order: 5, isActive: true },
    
    // ─── Bureautique (Partagé) ───
    { id: 'cat-furniture', name: 'Mobilier', color: '#84CC16', icon: 'Armchair', order: 6, isActive: true },
    { id: 'cat-office', name: 'Équipement bureau', color: '#A3E635', icon: 'Briefcase', order: 7, isActive: true },
    { id: 'cat-visio', name: 'Visioconférence', color: '#22D3EE', icon: 'Video', order: 8, isActive: true },
    
    // ─── Média (AMG) ───
    { id: 'cat-mic', name: 'Microphones', color: '#EC4899', icon: 'Mic', order: 9, isActive: true },
    { id: 'cat-console', name: 'Consoles/Mixeurs', color: '#F43F5E', icon: 'Sliders', order: 10, isActive: true },
    { id: 'cat-camera', name: 'Caméras', color: '#DC2626', icon: 'Camera', order: 11, isActive: true },
    { id: 'cat-broadcast', name: 'Diffusion', color: '#EF4444', icon: 'Radio', order: 12, isActive: true },
    { id: 'cat-lighting', name: 'Éclairage', color: '#FBBF24', icon: 'Lightbulb', order: 13, isActive: true },
    { id: 'cat-audio', name: 'Audio', color: '#F97316', icon: 'Headphones', order: 14, isActive: true },
    
    // ─── Transport (Trafric) ───
    { id: 'cat-vehicle', name: 'Véhicules', color: '#10B981', icon: 'Truck', order: 15, isActive: true },
    { id: 'cat-gps', name: 'GPS/Tracking', color: '#059669', icon: 'MapPin', order: 16, isActive: true },
    { id: 'cat-manutention', name: 'Manutention', color: '#047857', icon: 'Package', order: 17, isActive: true },
    
    // ─── Pétrolier (BAJ) ───
    { id: 'cat-pompe', name: 'Pompes/Distribution', color: '#7C3AED', icon: 'Fuel', order: 18, isActive: true },
    { id: 'cat-mesure', name: 'Instruments de mesure', color: '#8B5CF6', icon: 'Gauge', order: 19, isActive: true },
    { id: 'cat-securite', name: 'Équipement sécurité', color: '#EF4444', icon: 'ShieldAlert', order: 20, isActive: true },
    
    // ─── Général ───
    { id: 'cat-outillage', name: 'Outillage', color: '#78716C', icon: 'Wrench', order: 21, isActive: true },
    { id: 'cat-accessory', name: 'Accessoires', color: '#6B7280', icon: 'Box', order: 22, isActive: true },
    { id: 'cat-consumable', name: 'Consommables', color: '#A1A1AA', icon: 'Package', order: 23, isActive: true },
  ],
  
  // ═══════════════════════════════════════════════════════════
  // STATUTS D'ÉQUIPEMENT
  // ═══════════════════════════════════════════════════════════
  equipmentStatuses: [
    { id: 'status-available', name: 'Disponible', color: '#22C55E', icon: 'CheckCircle', isDefault: true, order: 1, isActive: true },
    { id: 'status-assigned', name: 'Attribué', color: '#3B82F6', icon: 'User', order: 2, isActive: true },
    { id: 'status-on-mission', name: 'En mission', color: '#8B5CF6', icon: 'MapPin', order: 3, isActive: true },
    { id: 'status-loaned', name: 'Prêté', color: '#06B6D4', icon: 'ArrowRightLeft', order: 4, isActive: true },
    { id: 'status-maintenance', name: 'En maintenance', color: '#F59E0B', icon: 'Wrench', order: 5, isActive: true },
    { id: 'status-repair', name: 'En réparation', color: '#F97316', icon: 'Tool', order: 6, isActive: true },
    { id: 'status-broken', name: 'Hors service', color: '#EF4444', icon: 'XCircle', order: 7, isActive: true },
    { id: 'status-reserved', name: 'Réservé', color: '#A855F7', icon: 'Calendar', order: 8, isActive: true },
    { id: 'status-disposed', name: 'Mis au rebut', color: '#6B7280', icon: 'Trash2', order: 9, isActive: true },
  ],
  
  // ═══════════════════════════════════════════════════════════
  // TYPES DE MOUVEMENT
  // ═══════════════════════════════════════════════════════════
  movementTypes: [
    // Assignations
    { id: 'mvt-assign', name: 'Attribution', color: '#3B82F6', icon: 'UserPlus', order: 1, isActive: true },
    { id: 'mvt-return', name: 'Retour', color: '#22C55E', icon: 'RotateCcw', order: 2, isActive: true },
    // Prêts
    { id: 'mvt-loan', name: 'Prêt personnel', color: '#8B5CF6', icon: 'ArrowRightLeft', order: 3, isActive: true },
    { id: 'mvt-company-loan', name: 'Prêt inter-entreprises', color: '#A855F7', icon: 'Building2', order: 4, isActive: true },
    // Missions
    { id: 'mvt-mission-out', name: 'Sortie mission', color: '#06B6D4', icon: 'MapPin', order: 5, isActive: true },
    { id: 'mvt-mission-in', name: 'Retour mission', color: '#14B8A6', icon: 'Home', order: 6, isActive: true },
    // Transferts
    { id: 'mvt-transfer-site', name: 'Transfert site', color: '#F59E0B', icon: 'Building', order: 7, isActive: true },
    { id: 'mvt-transfer-room', name: 'Déplacement local', color: '#EAB308', icon: 'DoorOpen', order: 8, isActive: true },
    { id: 'mvt-transfer-company', name: 'Transfert propriété', color: '#DC2626', icon: 'RefreshCw', order: 9, isActive: true },
    // Maintenance
    { id: 'mvt-maintenance-out', name: 'Envoi maintenance', color: '#F97316', icon: 'Wrench', order: 10, isActive: true },
    { id: 'mvt-maintenance-in', name: 'Retour maintenance', color: '#FB923C', icon: 'CheckSquare', order: 11, isActive: true },
    { id: 'mvt-repair-out', name: 'Envoi réparation', color: '#EF4444', icon: 'Hammer', order: 12, isActive: true },
    { id: 'mvt-repair-in', name: 'Retour réparation', color: '#F87171', icon: 'CheckSquare', order: 13, isActive: true },
  ],
  
  // ═══════════════════════════════════════════════════════════
  // TYPES DE MISSION (Multi-secteurs)
  // ═══════════════════════════════════════════════════════════
  missionTypes: [
    // ─── Média (AMG) ───
    { id: 'mission-reportage', name: 'Reportage', color: '#3B82F6', icon: 'Newspaper', order: 1, isActive: true },
    { id: 'mission-tournage', name: 'Tournage', color: '#8B5CF6', icon: 'Video', order: 2, isActive: true },
    { id: 'mission-evenement', name: 'Événement', color: '#EC4899', icon: 'PartyPopper', order: 3, isActive: true },
    { id: 'mission-interview', name: 'Interview', color: '#06B6D4', icon: 'Mic', order: 4, isActive: true },
    { id: 'mission-emission', name: 'Émission externe', color: '#10B981', icon: 'Radio', order: 5, isActive: true },
    
    // ─── Transport (Trafric) ───
    { id: 'mission-livraison', name: 'Livraison', color: '#22C55E', icon: 'Truck', order: 6, isActive: true },
    { id: 'mission-demenagement', name: 'Déménagement', color: '#16A34A', icon: 'Package', order: 7, isActive: true },
    
    // ─── Pétrolier (BAJ) ───
    { id: 'mission-intervention', name: 'Intervention station', color: '#7C3AED', icon: 'Wrench', order: 8, isActive: true },
    { id: 'mission-audit', name: 'Audit/Contrôle', color: '#A855F7', icon: 'ClipboardCheck', order: 9, isActive: true },
    
    // ─── Commun ───
    { id: 'mission-formation', name: 'Formation', color: '#F59E0B', icon: 'GraduationCap', order: 10, isActive: true },
    { id: 'mission-installation', name: 'Installation', color: '#F97316', icon: 'Settings', order: 11, isActive: true },
    { id: 'mission-maintenance', name: 'Maintenance terrain', color: '#EF4444', icon: 'Hammer', order: 12, isActive: true },
  ],
  
  // ═══════════════════════════════════════════════════════════
  // ÉTATS DE CONDITION
  // ═══════════════════════════════════════════════════════════
  conditionStates: [
    { id: 'cond-new', name: 'Neuf', color: '#22C55E', order: 1, isActive: true },
    { id: 'cond-excellent', name: 'Excellent', color: '#3B82F6', order: 2, isActive: true },
    { id: 'cond-good', name: 'Bon', color: '#06B6D4', order: 3, isActive: true, isDefault: true },
    { id: 'cond-fair', name: 'Correct', color: '#F59E0B', order: 4, isActive: true },
    { id: 'cond-poor', name: 'Usé', color: '#F97316', order: 5, isActive: true },
    { id: 'cond-damaged', name: 'Endommagé', color: '#EF4444', order: 6, isActive: true },
  ],
  
  // ═══════════════════════════════════════════════════════════
  // TYPES DE DOCUMENTS
  // ═══════════════════════════════════════════════════════════
  documentTypes: [
    { id: 'doc-manual', name: 'Manuel utilisateur', color: '#3B82F6', icon: 'BookOpen', order: 1, isActive: true },
    { id: 'doc-config', name: 'Configuration', color: '#8B5CF6', icon: 'Settings', order: 2, isActive: true },
    { id: 'doc-datasheet', name: 'Fiche technique', color: '#06B6D4', icon: 'FileText', order: 3, isActive: true },
    { id: 'doc-certificate', name: 'Certificat', color: '#22C55E', icon: 'Award', order: 4, isActive: true },
    { id: 'doc-warranty', name: 'Garantie', color: '#10B981', icon: 'Shield', order: 5, isActive: true },
    { id: 'doc-invoice', name: 'Facture', color: '#F59E0B', icon: 'Receipt', order: 6, isActive: true },
    { id: 'doc-maintenance', name: 'Rapport maintenance', color: '#F97316', icon: 'Wrench', order: 7, isActive: true },
    { id: 'doc-photo', name: 'Photo', color: '#EC4899', icon: 'Image', order: 8, isActive: true },
    { id: 'doc-schematic', name: 'Schéma/Plan', color: '#A855F7', icon: 'FileCode', order: 9, isActive: true },
    { id: 'doc-other', name: 'Autre', color: '#6B7280', icon: 'File', order: 10, isActive: true },
  ],
  
  // ═══════════════════════════════════════════════════════════
  // CONFIGURATION UPLOAD DOCUMENTS
  // ═══════════════════════════════════════════════════════════
  documents: {
    maxFileSizeMB: 50,                    // 50 Mo max par fichier
    allowedMimeTypes: [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
    ],
    defaultAccessLevel: 'company',         // Par défaut visible par l'entreprise propriétaire
    enableVersioning: true,                // Activer le versioning
  },
  
  // ═══════════════════════════════════════════════════════════
  // OPTIONS GLOBALES
  // ═══════════════════════════════════════════════════════════
  defaultWarrantyMonths: 24,
  lowStockThreshold: 5,
  requireApprovalForTransfer: false,
  requireApprovalForCompanyLoan: true,    // Prêts inter-entreprises nécessitent validation
  
  updatedAt: new Date().toISOString(),
  updatedBy: 'system',
};

/**
 * Configuration des entreprises du groupe
 * Secteurs d'activité différents mais ressources partagées
 */
export const DEFAULT_COMPANIES: Company[] = [
  {
    id: 'company-baj',
    name: 'BAJ',
    code: 'BAJ',
    type: 'petroleum',                    // Produits pétroliers
    description: 'Distribution de produits pétroliers',
    isActive: true,
    canShareEquipment: true,              // Peut prêter à d'autres entreprises
    canReceiveEquipment: true,            // Peut recevoir des prêts
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'company-trafric',
    name: 'Trafric',
    code: 'TRF',
    type: 'transport',                    // Transport et logistique
    description: 'Transport et logistique',
    isActive: true,
    canShareEquipment: true,
    canReceiveEquipment: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'company-amg',
    name: 'AMG',
    code: 'AMG',
    type: 'media',                        // Groupe média (Radio, TV, Production)
    description: 'Groupe média : Radio, TV, Production audiovisuelle',
    isActive: true,
    canShareEquipment: true,
    canReceiveEquipment: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
```

---

## 🔧 Hook de configuration

```typescript
// src/hooks/inventory/useInventorySettings.ts

import { useState, useEffect, useCallback } from 'react';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/api/firebase/firebase';
import type { InventorySettings, ConfigurableOption } from '@/types/inventory';
import { DEFAULT_INVENTORY_SETTINGS } from '@/utils/inventory/defaultSettings';

const SETTINGS_DOC = 'settings/inventory_settings';

export const useInventorySettings = () => {
  const [settings, setSettings] = useState<InventorySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Écoute temps réel des paramètres
  useEffect(() => {
    const settingsRef = doc(db, SETTINGS_DOC);
    
    const unsubscribe = onSnapshot(
      settingsRef,
      async (docSnap) => {
        if (docSnap.exists()) {
          setSettings(docSnap.data() as InventorySettings);
        } else {
          // Créer les paramètres par défaut si inexistants
          await setDoc(settingsRef, DEFAULT_INVENTORY_SETTINGS);
          setSettings(DEFAULT_INVENTORY_SETTINGS);
        }
        setIsLoading(false);
      },
      (err) => {
        console.error('Erreur chargement paramètres inventaire:', err);
        setError('Impossible de charger les paramètres');
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Mise à jour d'une liste spécifique
  const updateList = useCallback(async (
    listName: keyof Pick<InventorySettings, 'categories' | 'equipmentStatuses' | 'movementTypes' | 'conditionStates'>,
    items: ConfigurableOption[],
    userId: string
  ) => {
    setIsSaving(true);
    try {
      const settingsRef = doc(db, SETTINGS_DOC);
      await updateDoc(settingsRef, {
        [listName]: items,
        updatedAt: new Date().toISOString(),
        updatedBy: userId,
      });
    } catch (err) {
      console.error(`Erreur mise à jour ${listName}:`, err);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, []);

  // Ajouter une option à une liste
  const addOption = useCallback(async (
    listName: keyof Pick<InventorySettings, 'categories' | 'equipmentStatuses' | 'movementTypes' | 'conditionStates'>,
    option: Omit<ConfigurableOption, 'id' | 'order'>,
    userId: string
  ) => {
    if (!settings) return;
    
    const currentList = settings[listName];
    const newOption: ConfigurableOption = {
      ...option,
      id: `${listName.slice(0, 3)}-${Date.now()}`,
      order: currentList.length + 1,
      isActive: true,
    };
    
    await updateList(listName, [...currentList, newOption], userId);
  }, [settings, updateList]);

  // Supprimer (soft delete) une option
  const removeOption = useCallback(async (
    listName: keyof Pick<InventorySettings, 'categories' | 'equipmentStatuses' | 'movementTypes' | 'conditionStates'>,
    optionId: string,
    userId: string
  ) => {
    if (!settings) return;
    
    const currentList = settings[listName];
    const updatedList = currentList.map(opt =>
      opt.id === optionId ? { ...opt, isActive: false } : opt
    );
    
    await updateList(listName, updatedList, userId);
  }, [settings, updateList]);

  // Réordonner une liste
  const reorderList = useCallback(async (
    listName: keyof Pick<InventorySettings, 'categories' | 'equipmentStatuses' | 'movementTypes' | 'conditionStates'>,
    orderedIds: string[],
    userId: string
  ) => {
    if (!settings) return;
    
    const currentList = settings[listName];
    const reorderedList = orderedIds.map((id, index) => {
      const option = currentList.find(opt => opt.id === id);
      return option ? { ...option, order: index + 1 } : null;
    }).filter(Boolean) as ConfigurableOption[];
    
    await updateList(listName, reorderedList, userId);
  }, [settings, updateList]);

  // Helpers pour accéder aux listes actives
  const getActiveCategories = useCallback(() =>
    settings?.categories.filter(c => c.isActive).sort((a, b) => a.order - b.order) || []
  , [settings]);

  const getActiveStatuses = useCallback(() =>
    settings?.equipmentStatuses.filter(s => s.isActive).sort((a, b) => a.order - b.order) || []
  , [settings]);

  const getActiveMovementTypes = useCallback(() =>
    settings?.movementTypes.filter(m => m.isActive).sort((a, b) => a.order - b.order) || []
  , [settings]);

  const getActiveConditions = useCallback(() =>
    settings?.conditionStates.filter(c => c.isActive).sort((a, b) => a.order - b.order) || []
  , [settings]);

  return {
    settings,
    isLoading,
    error,
    isSaving,
    
    // Mutations
    updateList,
    addOption,
    removeOption,
    reorderList,
    
    // Helpers
    getActiveCategories,
    getActiveStatuses,
    getActiveMovementTypes,
    getActiveConditions,
  };
};
```

---

## 🎨 Composants UI

### Structure des composants

```
src/components/
├── inventory/
│   ├── EquipmentList.tsx           # Liste avec filtres
│   ├── EquipmentCard.tsx           # Carte équipement
│   ├── EquipmentDetail.tsx         # Vue détaillée
│   ├── EquipmentForm.tsx           # Formulaire ajout/édition
│   ├── EquipmentFilters.tsx        # Panneau filtres
│   ├── MovementHistory.tsx         # Historique mouvements
│   ├── MovementForm.tsx            # Formulaire mouvement
│   ├── MaintenanceList.tsx         # Liste maintenances
│   ├── MaintenanceForm.tsx         # Formulaire maintenance
│   ├── LocationBreadcrumb.tsx      # Fil d'Ariane localisation
│   ├── StatusBadge.tsx             # Badge statut coloré
│   ├── CategoryBadge.tsx           # Badge catégorie
│   ├── ConditionIndicator.tsx      # Indicateur état
│   └── QuickSearch.tsx             # Recherche rapide
├── settings/
│   └── InventorySettings.tsx       # Configuration inventaire
│       ├── CategoryManager.tsx     # Gestion catégories
│       ├── StatusManager.tsx       # Gestion statuts
│       ├── MovementTypeManager.tsx # Gestion types mouvement
│       └── ConditionManager.tsx    # Gestion états
└── common/
    └── ConfigurableListManager.tsx # Composant générique réutilisable
```

### Composant ConfigurableListManager (générique)

```tsx
// src/components/common/ConfigurableListManager.tsx

import { useState } from 'react';
import { Plus, GripVertical, Pencil, Trash2, Check, X } from 'lucide-react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ConfigurableOption } from '@/types/inventory';

interface ConfigurableListManagerProps {
  title: string;
  description?: string;
  items: ConfigurableOption[];
  onAdd: (item: Omit<ConfigurableOption, 'id' | 'order'>) => Promise<void>;
  onUpdate: (items: ConfigurableOption[]) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
  onReorder: (orderedIds: string[]) => Promise<void>;
  showColor?: boolean;
  showIcon?: boolean;
  iconOptions?: string[];
  colorOptions?: string[];
  isLoading?: boolean;
}

export const ConfigurableListManager = ({
  title,
  description,
  items,
  onAdd,
  onUpdate,
  onRemove,
  onReorder,
  showColor = true,
  showIcon = false,
  iconOptions = [],
  colorOptions = DEFAULT_COLORS,
  isLoading = false,
}: ConfigurableListManagerProps) => {
  // ... implémentation avec drag & drop, formulaire inline
};

const DEFAULT_COLORS = [
  '#3B82F6', '#22C55E', '#EF4444', '#F59E0B', '#8B5CF6',
  '#EC4899', '#06B6D4', '#F97316', '#6B7280', '#84CC16',
];
```

---

## ⚙️ Personnalisation des paramètres et menus

### Vue d'ensemble

L'interface de configuration permet aux administrateurs de personnaliser **toutes les listes** du module inventaire sans intervention technique. Chaque liste est entièrement paramétrable :

```
┌─────────────────────────────────────────────────────────────────────┐
│              SETTINGS > INVENTAIRE > CONFIGURATION                  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  📂 CATÉGORIES  │ 📊 STATUTS │ 🔄 MOUVEMENTS │ 🎯 MISSIONS  │   │
│  │  📄 DOCUMENTS   │ 🔧 CONDITIONS │ 🏢 ENTREPRISES │ 📍 SITES │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                     CATÉGORIES D'ÉQUIPEMENT                  │   │
│  │  ─────────────────────────────────────────────────────────── │   │
│  │  Personnalisez les catégories disponibles dans les menus     │   │
│  │                                                               │   │
│  │  ≡  🔵 Ordinateurs           [✏️] [🗑️] [⭐ Défaut]           │   │
│  │  ≡  🟢 Véhicules              [✏️] [🗑️]                      │   │
│  │  ≡  🟣 Microphones            [✏️] [🗑️]                      │   │
│  │  ≡  🔴 Pompes/Distribution    [✏️] [🗑️]                      │   │
│  │  ≡  ⚫ ⊘ Ancienne catégorie   [Désactivé]        [Réactiver] │   │
│  │                                                               │   │
│  │  [+ Ajouter une catégorie]                                   │   │
│  │                                                               │   │
│  │  ────────────────────────────────────────────────────────────│   │
│  │  💡 Glissez-déposez pour réordonner                          │   │
│  │  ⚠️ Désactiver plutôt que supprimer pour garder l'historique │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### Listes personnalisables

| Liste | Propriétés configurables | Impact |
|-------|--------------------------|--------|
| **Catégories** | Nom, couleur, icône, ordre, défaut | Menus création/filtre équipements |
| **Statuts** | Nom, couleur, icône, ordre, défaut | Badge équipement, filtres |
| **Types mouvement** | Nom, couleur, icône, ordre | Formulaire mouvement |
| **Types mission** | Nom, couleur, icône, ordre | Création de missions |
| **États condition** | Nom, couleur, ordre, défaut | Sélection état équipement |
| **Types document** | Nom, couleur, icône, ordre | Upload documents |
| **Entreprises** | Nom, code, type, partage | Filtres, attributions |
| **Sites** | Nom, code, type, entreprise | Localisation équipements |
| **Locaux** | Nom, type, site | Localisation fine |

### Interface InventorySettings

```tsx
// src/components/settings/InventorySettings.tsx

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, Activity, ArrowRightLeft, Target, FileText, 
  Gauge, Building2, MapPin, DoorOpen, Settings 
} from 'lucide-react';
import { ConfigurableListManager } from '@/components/common/ConfigurableListManager';
import { useInventorySettings } from '@/hooks/inventory/useInventorySettings';
import type { ConfigurableOption } from '@/types/inventory';

// Onglets de configuration
const CONFIG_TABS = [
  { id: 'categories', label: 'Catégories', icon: Package },
  { id: 'statuses', label: 'Statuts', icon: Activity },
  { id: 'movements', label: 'Mouvements', icon: ArrowRightLeft },
  { id: 'missions', label: 'Missions', icon: Target },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'conditions', label: 'Conditions', icon: Gauge },
  { id: 'companies', label: 'Entreprises', icon: Building2 },
  { id: 'sites', label: 'Sites', icon: MapPin },
  { id: 'rooms', label: 'Locaux', icon: DoorOpen },
  { id: 'global', label: 'Options', icon: Settings },
] as const;

export const InventorySettings = () => {
  const [activeTab, setActiveTab] = useState('categories');
  const { 
    settings, 
    isLoading,
    updateCategories,
    updateStatuses,
    updateMovementTypes,
    updateMissionTypes,
    updateDocumentTypes,
    updateConditions,
    updateGlobalSettings,
  } = useInventorySettings();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Configuration de l'inventaire</h2>
        <p className="text-muted-foreground">
          Personnalisez les listes, catégories et options du module inventaire
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap gap-1">
          {CONFIG_TABS.map(tab => (
            <TabsTrigger key={tab.id} value={tab.id} className="gap-2">
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Catégories */}
        <TabsContent value="categories">
          <ConfigurableListManager
            title="Catégories d'équipement"
            description="Les catégories apparaissent dans les menus de création et les filtres"
            items={settings?.categories || []}
            onUpdate={updateCategories}
            showColor
            showIcon
            iconOptions={EQUIPMENT_ICONS}
            features={{
              canSetDefault: true,
              canDisable: true,      // Soft delete
              canReorder: true,       // Drag & drop
              canAddDescription: true,
            }}
          />
        </TabsContent>

        {/* Statuts */}
        <TabsContent value="statuses">
          <ConfigurableListManager
            title="Statuts d'équipement"
            description="Définissez les différents états possibles pour un équipement"
            items={settings?.equipmentStatuses || []}
            onUpdate={updateStatuses}
            showColor
            showIcon
            features={{
              canSetDefault: true,    // Statut par défaut à la création
              canDisable: true,
              canReorder: true,
            }}
          />
        </TabsContent>

        {/* ... autres onglets ... */}

        {/* Options globales */}
        <TabsContent value="global">
          <GlobalSettingsForm 
            settings={settings}
            onUpdate={updateGlobalSettings}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Icônes disponibles pour les catégories
const EQUIPMENT_ICONS = [
  'Laptop', 'Monitor', 'Printer', 'Server', 'Network', 'Phone',
  'Mic', 'Headphones', 'Camera', 'Video', 'Radio', 'Lightbulb',
  'Truck', 'Car', 'Fuel', 'Gauge', 'Wrench', 'Package',
  'Armchair', 'Briefcase', 'Shield', 'Box', 'Settings',
];
```

### Options globales configurables

```tsx
// src/components/settings/GlobalSettingsForm.tsx

interface GlobalSettingsFormProps {
  settings: InventorySettings | null;
  onUpdate: (updates: Partial<InventorySettings>) => Promise<void>;
}

export const GlobalSettingsForm = ({ settings, onUpdate }: GlobalSettingsFormProps) => {
  return (
    <div className="space-y-8">
      {/* ═══ Valeurs par défaut ═══ */}
      <section>
        <h3 className="text-lg font-medium mb-4">Valeurs par défaut</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            label="Durée de garantie par défaut"
            type="number"
            value={settings?.defaultWarrantyMonths}
            onChange={(v) => onUpdate({ defaultWarrantyMonths: v })}
            suffix="mois"
          />
          <FormField
            label="Seuil d'alerte stock bas"
            type="number"
            value={settings?.lowStockThreshold}
            onChange={(v) => onUpdate({ lowStockThreshold: v })}
            suffix="unités"
          />
        </div>
      </section>

      {/* ═══ Règles de validation ═══ */}
      <section>
        <h3 className="text-lg font-medium mb-4">Règles de validation</h3>
        <div className="space-y-3">
          <SwitchField
            label="Validation requise pour les transferts inter-sites"
            description="Un administrateur doit approuver les transferts entre sites"
            checked={settings?.requireApprovalForTransfer}
            onChange={(v) => onUpdate({ requireApprovalForTransfer: v })}
          />
          <SwitchField
            label="Validation requise pour les prêts inter-entreprises"
            description="Un responsable doit approuver les prêts vers d'autres entreprises"
            checked={settings?.requireApprovalForCompanyLoan}
            onChange={(v) => onUpdate({ requireApprovalForCompanyLoan: v })}
          />
          <SwitchField
            label="Validation requise pour les sorties mission"
            description="Approbation nécessaire avant sortie d'équipement pour mission"
            checked={settings?.requireApprovalForMission}
            onChange={(v) => onUpdate({ requireApprovalForMission: v })}
          />
        </div>
      </section>

      {/* ═══ Notifications ═══ */}
      <section>
        <h3 className="text-lg font-medium mb-4">Notifications</h3>
        <div className="space-y-3">
          <SwitchField
            label="Alerter quand stock bas"
            checked={settings?.notifyOnLowStock}
            onChange={(v) => onUpdate({ notifyOnLowStock: v })}
          />
          <SwitchField
            label="Alerter pour retours en retard"
            checked={settings?.notifyOnOverdueReturn}
            onChange={(v) => onUpdate({ notifyOnOverdueReturn: v })}
          />
          <FormField
            label="Délai avant alerte retard"
            type="number"
            value={settings?.overdueThresholdDays}
            onChange={(v) => onUpdate({ overdueThresholdDays: v })}
            suffix="jours"
            disabled={!settings?.notifyOnOverdueReturn}
          />
        </div>
      </section>

      {/* ═══ Documents ═══ */}
      <section>
        <h3 className="text-lg font-medium mb-4">Configuration documents</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            label="Taille maximale par fichier"
            type="number"
            value={settings?.documents?.maxFileSizeMB}
            onChange={(v) => onUpdate({ documents: { ...settings?.documents, maxFileSizeMB: v } })}
            suffix="Mo"
          />
          <SelectField
            label="Niveau d'accès par défaut"
            value={settings?.documents?.defaultAccessLevel}
            options={[
              { value: 'public', label: 'Public (tous les utilisateurs)' },
              { value: 'company', label: 'Entreprise propriétaire' },
              { value: 'team', label: 'Équipe technique' },
              { value: 'admin', label: 'Administrateurs uniquement' },
            ]}
            onChange={(v) => onUpdate({ documents: { ...settings?.documents, defaultAccessLevel: v } })}
          />
          <SwitchField
            label="Activer le versioning des documents"
            description="Conserver l'historique des versions de chaque document"
            checked={settings?.documents?.enableVersioning}
            onChange={(v) => onUpdate({ documents: { ...settings?.documents, enableVersioning: v } })}
          />
        </div>
      </section>
    </div>
  );
};
```

### Fonctionnalités du ConfigurableListManager

```typescript
interface ConfigurableListFeatures {
  // Gestion des items
  canAdd: boolean;              // Ajouter de nouveaux items
  canEdit: boolean;             // Modifier les items existants
  canDisable: boolean;          // Désactiver (soft delete) plutôt que supprimer
  canDelete: boolean;           // Supprimer définitivement (attention!)
  
  // Valeur par défaut
  canSetDefault: boolean;       // Marquer un item comme défaut
  
  // Personnalisation
  canReorder: boolean;          // Drag & drop pour réordonner
  canAddDescription: boolean;   // Champ description optionnel
  canAddMetadata: boolean;      // Données personnalisées (JSON)
  
  // Affichage
  showColor: boolean;           // Sélecteur de couleur
  showIcon: boolean;            // Sélecteur d'icône
  showUsageCount: boolean;      // Nombre d'équipements utilisant cette option
}
```

### Synchronisation temps réel

```typescript
// Les modifications sont synchronisées en temps réel via Firestore onSnapshot

// Hook useInventorySettings - extrait
const [settings, setSettings] = useState<InventorySettings | null>(null);

useEffect(() => {
  const settingsRef = doc(db, 'settings', 'inventory_settings');
  
  // Écoute temps réel - tous les onglets/utilisateurs voient les changements
  const unsubscribe = onSnapshot(settingsRef, (snapshot) => {
    if (snapshot.exists()) {
      setSettings(snapshot.data() as InventorySettings);
    } else {
      // Première utilisation : créer avec valeurs par défaut
      setDoc(settingsRef, DEFAULT_INVENTORY_SETTINGS);
      setSettings(DEFAULT_INVENTORY_SETTINGS);
    }
  });

  return () => unsubscribe();
}, []);
```

### Gestion des items désactivés vs supprimés

```typescript
/**
 * IMPORTANT : Préférer la désactivation à la suppression
 * 
 * Pourquoi ?
 * - L'historique des équipements référence les catégories/statuts par ID
 * - Supprimer une catégorie casserait les références
 * - Un item désactivé (isActive: false) n'apparaît plus dans les menus
 *   mais reste lisible dans l'historique
 */

// Quand un admin "supprime" une catégorie
const handleRemove = async (id: string) => {
  const usageCount = await getUsageCount(id);
  
  if (usageCount > 0) {
    // Catégorie utilisée → désactiver seulement
    await updateCategory(id, { isActive: false });
    toast.info(`Catégorie désactivée (utilisée par ${usageCount} équipements)`);
  } else {
    // Jamais utilisée → suppression possible
    const confirmed = await confirmDelete(
      "Cette catégorie n'a jamais été utilisée. Supprimer définitivement ?"
    );
    if (confirmed) {
      await deleteCategory(id);
    }
  }
};
```

---

## 🔐 Permissions requises

```typescript
// À ajouter dans le système de permissions existant

export const INVENTORY_PERMISSIONS = {
  // Lecture
  'inventory.view': 'Voir l\'inventaire',
  'inventory.view_all_sites': 'Voir l\'inventaire de tous les sites',
  'inventory.view_values': 'Voir les valeurs/prix',
  
  // Création/Modification
  'inventory.create': 'Ajouter des équipements',
  'inventory.edit': 'Modifier les équipements',
  'inventory.delete': 'Supprimer/Archiver des équipements',
  
  // Mouvements
  'inventory.movements.create': 'Créer des mouvements',
  'inventory.movements.approve': 'Approuver les transferts',
  'inventory.movements.view_history': 'Voir l\'historique complet',
  
  // Maintenance
  'inventory.maintenance.create': 'Créer des maintenances',
  'inventory.maintenance.manage': 'Gérer les maintenances',
  
  // Configuration
  'inventory.settings.manage': 'Configurer les listes (catégories, statuts...)',
  'inventory.locations.manage': 'Gérer les sites et locaux',
} as const;
```

---

## 📁 Structure Firestore

```
firestore/
├── settings/
│   └── inventory_settings          # Configuration listes
│       ├── categories[]
│       ├── equipmentStatuses[]
│       ├── movementTypes[]
│       ├── missionTypes[]
│       ├── documentTypes[]          # Types de documents configurables
│       ├── conditionStates[]
│       └── documents{}              # Config upload (maxSize, mimeTypes...)
│
├── equipment/                      # Collection équipements
│   └── {equipmentId}
│       ├── name, reference, serialNumber...
│       ├── currentLocation{}
│       ├── currentAssignment{}
│       ├── configuration{}          # Paramètres techniques
│       ├── documents[]              # Métadonnées documents (léger)
│       └── ...
│
├── equipment_documents/            # Collection documents (détaillée)
│   └── {documentId}
│       ├── equipmentId
│       ├── fileName, displayName
│       ├── type, mimeType, fileSize
│       ├── storageUrl, storagePath
│       ├── accessLevel
│       ├── allowedUserIds[], allowedRoles[]
│       ├── version, isLatest
│       └── uploadedAt, uploadedBy...
│
├── equipment_movements/            # Collection mouvements
│   └── {movementId}
│       ├── equipmentId
│       ├── from{}, to{}
│       └── ...
│
├── maintenance_records/            # Collection maintenances
│   └── {recordId}
│       ├── equipmentId
│       ├── type, status
│       └── ...
│
├── companies/                      # Collection entreprises
│   └── {companyId}
│       └── name, code, ...
│
├── sites/                          # Collection sites
│   └── {siteId}
│       ├── companyId
│       └── name, type, address...
│
└── rooms/                          # Collection locaux
    └── {roomId}
        ├── siteId
        └── name, type, ...
```

---

## 📂 Structure Firebase Storage

```
storage/
└── inventory/
    └── {equipmentId}/
        ├── photos/
        │   ├── main.jpg              # Photo principale
        │   ├── photo-1.jpg
        │   └── photo-2.jpg
        │
        ├── documents/
        │   ├── manual/
        │   │   └── user-manual-v1.pdf
        │   ├── configuration/
        │   │   ├── config-2024-01.pdf
        │   │   └── config-2024-06.pdf  # Versioning
        │   ├── datasheet/
        │   │   └── specs.pdf
        │   ├── certificate/
        │   │   └── calibration-2024.pdf
        │   └── maintenance_report/
        │       ├── repair-2024-03.pdf
        │       └── repair-2024-09.pdf
        │
        └── invoices/
            └── invoice-{invoiceNumber}.pdf
```

### Règles de nommage Storage

```javascript
// Pattern: inventory/{equipmentId}/{folder}/{filename}
const storagePath = `inventory/${equipmentId}/documents/${documentType}/${fileName}`;

// Exemple concret
"inventory/eq-123/documents/configuration/shure-sm58-config-2024.pdf"
```

---

## 🔐 Contrôle d'accès documents

### Niveaux d'accès

| Niveau | Description | Qui peut voir |
|--------|-------------|---------------|
| `public` | Accès libre | Tous les utilisateurs authentifiés |
| `company` | Entreprise propriétaire | Utilisateurs de la même company que l'équipement |
| `team` | Équipe technique | Rôles: technician, engineer, admin |
| `admin` | Administration | Rôles: admin uniquement |
| `restricted` | Liste contrôlée | Utilisateurs listés dans `allowedUserIds` |

### Hook de vérification

```typescript
// src/hooks/inventory/useDocumentAccess.ts
export const useDocumentAccess = (document: EquipmentDocument, equipment: Equipment) => {
  const { user, userRoles } = useAuth();
  
  const canView = useMemo(() => {
    switch (document.accessLevel) {
      case 'public':
        return true;
      case 'company':
        return equipment.currentLocation.companyId === user?.companyId;
      case 'team':
        return ['technician', 'engineer', 'admin'].some(r => userRoles.includes(r));
      case 'admin':
        return userRoles.includes('admin');
      case 'restricted':
        return document.allowedUserIds?.includes(user?.uid || '') ||
               document.allowedRoles?.some(r => userRoles.includes(r));
      default:
        return false;
    }
  }, [document, equipment, user, userRoles]);
  
  const canEdit = useMemo(() => {
    return userRoles.includes('admin') || 
           document.uploadedBy === user?.uid;
  }, [document, user, userRoles]);
  
  const canDelete = useMemo(() => {
    return userRoles.includes('admin');
  }, [userRoles]);
  
  return { canView, canEdit, canDelete };
};
```

---

## ✅ Checklist d'implémentation

### Phase 1 : Fondations
- [ ] Créer `src/types/inventory.ts` avec tous les types
- [ ] Créer `src/schemas/inventorySchema.ts` (validation Zod)
- [ ] Créer `src/utils/inventory/defaultSettings.ts`
- [ ] Créer `src/hooks/inventory/useInventorySettings.ts`

### Phase 2 : Configuration & Personnalisation (Settings)
- [ ] Créer `src/components/common/ConfigurableListManager.tsx` (générique réutilisable)
- [ ] Créer `src/components/settings/InventorySettings.tsx` (onglets de config)
- [ ] Créer `src/components/settings/GlobalSettingsForm.tsx` (options globales)
- [ ] Ajouter onglet "Inventaire" dans `src/pages/Settings.tsx`
- [ ] Implémenter drag & drop pour réordonner les listes (@dnd-kit)
- [ ] Gérer soft delete (désactivation vs suppression)
- [ ] Afficher compteur d'utilisation avant suppression
- [ ] Synchronisation temps réel des paramètres (onSnapshot)

### Phase 3 : Localisation
- [ ] Créer `src/hooks/inventory/useCompanies.ts`
- [ ] Créer `src/hooks/inventory/useSites.ts`
- [ ] Créer `src/hooks/inventory/useRooms.ts`
- [ ] Créer composants de gestion sites/locaux
- [ ] Intégrer dans InventorySettings (onglets Entreprises, Sites, Locaux)

### Phase 4 : Équipements (CRUD)
- [ ] Créer `src/hooks/inventory/useEquipment.ts`
- [ ] Créer `src/api/firebase/inventory.ts` (service Firestore)
- [ ] Créer composants liste/détail/formulaire
- [ ] Lier les menus de formulaire aux listes configurables

### Phase 5 : Documents & Configuration technique
- [ ] Créer `src/hooks/inventory/useEquipmentDocuments.ts`
- [ ] Créer `src/hooks/inventory/useDocumentAccess.ts` (contrôle d'accès)
- [ ] Créer `src/components/inventory/DocumentUploader.tsx`
- [ ] Créer `src/components/inventory/DocumentList.tsx`
- [ ] Créer `src/components/inventory/DocumentViewer.tsx` (preview intégré)
- [ ] Créer `src/components/inventory/ConfigurationEditor.tsx`
- [ ] Configurer Firebase Storage rules pour permissions
- [ ] Implémenter versioning documents (optionnel)

### Phase 6 : Mouvements
- [ ] Créer `src/hooks/inventory/useEquipmentMovements.ts`
- [ ] Créer composants historique/formulaire mouvement
- [ ] Types de mouvement liés aux listes configurables

### Phase 7 : Maintenance
- [ ] Créer `src/hooks/inventory/useMaintenance.ts`
- [ ] Créer composants liste/formulaire maintenance

### Phase 8 : Recherche avancée
- [ ] Implémenter recherche multi-critères
- [ ] Créer exports (PDF, Excel)

---

## ⚠️ Anti-patterns à éviter

### ❌ NE PAS FAIRE

```typescript
// ❌ Hardcoder les catégories
const CATEGORIES = ['Microphones', 'Consoles', 'Câbles'];

// ❌ Stocker les IDs sans dénormalisation
equipment: {
  categoryId: 'cat-123', // Sans categoryName
}

// ❌ Mouvement sans origine/destination complète
movement: {
  location: 'Studio A', // Où était l'équipement avant ?
}

// ❌ Ignorer le multi-tenant (entreprises)
equipment: {
  siteId: 'site-1', // Quelle entreprise ?
}
```

### ✅ BONNES PRATIQUES

```typescript
// ✅ Utiliser les listes configurables
const { getActiveCategories } = useInventorySettings();

// ✅ Dénormaliser les noms pour affichage
equipment: {
  categoryId: 'cat-123',
  categoryName: 'Microphones', // Pour affichage sans jointure
}

// ✅ Mouvement avec historique complet
movement: {
  from: { siteId: 'site-1', siteName: 'Siège', roomId: 'room-1', roomName: 'Stock' },
  to: { siteId: 'site-2', siteName: 'Studio', roomId: 'room-5', roomName: 'Régie 1' },
}

// ✅ Toujours inclure la hiérarchie complète
equipment: {
  currentLocation: {
    companyId: 'comp-1',
    companyName: 'Radio FM',
    siteId: 'site-1',
    siteName: 'Siège',
    roomId: 'room-1',
    roomName: 'Studio A',
  }
}
```

---

## 🔗 Intégrations futures

- **Conducteurs** : Lier équipement requis à un segment
- **Tâches** : Créer une tâche depuis une alerte maintenance
- **Chat** : Notifier équipe technique pour maintenance urgente
- **Archives** : Inclure équipements utilisés dans export émission
- **Dashboard** : Widgets statistiques inventaire

---

## 📚 Ressources

- [Firebase Firestore](https://firebase.google.com/docs/firestore)
- [DnD Kit](https://dndkit.com/) - Drag & drop pour réordonnancement
- [Lucide Icons](https://lucide.dev/icons/) - Icônes catégories/statuts
