// Types pour le module Inventaire
// Architecture : Firebase Direct (comme Quotes, Settings)

// ════════════════════════════════════════════════════════════════
// TYPES DE BASE
// ════════════════════════════════════════════════════════════════

/**
 * Option configurable générique
 * Utilisée pour catégories, statuts, types de mouvement, etc.
 */
export interface ConfigurableOption {
  id: string;
  name: string;
  description?: string | null;
  color?: string | null;           // Code couleur hex pour badges
  icon?: string | null;            // Nom icône Lucide (ex: "Mic", "Monitor")
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
  
  // Informations fichier
  fileName: string;
  displayName: string;
  description?: string;
  type: DocumentType;
  mimeType: string;
  fileSize: number;
  
  // Stockage
  storageUrl: string;
  storagePath: string;
  thumbnailUrl?: string;
  
  // Contrôle d'accès
  accessLevel: DocumentAccessLevel;
  allowedUserIds?: string[];
  allowedRoles?: string[];
  
  // Versioning
  version?: string;
  isLatest: boolean;
  previousVersionId?: string;
  
  // Métadonnées
  tags?: string[];
  language?: string;
  expiresAt?: string;
  
  // Audit
  uploadedAt: string;
  uploadedBy: string;
  uploadedByName: string;
  lastAccessedAt?: string;
  downloadCount: number;
}

// ════════════════════════════════════════════════════════════════
// CONFIGURATION / SETTINGS
// ════════════════════════════════════════════════════════════════

/**
 * Configuration globale du module inventaire
 * Stockée dans Firestore: settings/inventory_settings
 */
export interface InventorySettings {
  // Listes configurables
  categories: ConfigurableOption[];
  equipmentStatuses: ConfigurableOption[];
  movementTypes: ConfigurableOption[];
  missionTypes: ConfigurableOption[];
  conditionStates: ConfigurableOption[];
  documentTypes: ConfigurableOption[];
  
  // Configuration documents
  documents: {
    maxFileSizeMB: number;
    allowedMimeTypes: string[];
    defaultAccessLevel: DocumentAccessLevel;
    enableVersioning: boolean;
  };
  
  // Référencement automatique
  referencePrefix: string;
  referenceCounter: number;
  
  // Options globales
  defaultWarrantyMonths: number;
  lowStockThreshold: number;
  
  // Règles de validation
  requireApprovalForTransfer: boolean;
  requireApprovalForCompanyLoan: boolean;
  requireApprovalForMission: boolean;
  
  // Notifications
  notifyOnLowStock: boolean;
  notifyOnOverdueReturn: boolean;
  overdueThresholdDays: number;
  
  // Audit
  updatedAt: string;
  updatedBy: string;
}

// ════════════════════════════════════════════════════════════════
// ÉQUIPEMENT
// ════════════════════════════════════════════════════════════════

/**
 * Équipement / Item d'inventaire
 */
export interface Equipment {
  id: string;
  
  // Identification
  name: string;
  reference: string;
  serialNumber?: string;
  barcode?: string;
  
  // Classification
  categoryId: string;
  categoryName: string;
  subcategory?: string;
  
  // Fabricant & Modèle
  brand: string;
  model: string;
  manufacturer?: string;
  
  // État & Statut
  statusId: string;
  statusName: string;
  conditionId: string;
  conditionName: string;
  
  // Localisation actuelle
  currentLocation: {
    companyId: string;
    companyName: string;
    siteId: string;
    siteName: string;
    roomId?: string;
    roomName?: string;
    specificLocation?: string;
  };
  
  // Assignation actuelle
  currentAssignment?: {
    userId: string;
    userName: string;
    userEmail: string;
    assignedAt: string;
    assignedBy: string;
    expectedReturnDate?: string;
    notes?: string;
  };
  
  // Acquisition & Valeur
  acquisition: {
    date: string;
    type: 'purchase' | 'donation' | 'lease' | 'transfer' | 'other';
    purchasePrice?: number;
    currentValue?: number;
    supplier?: string;
    invoiceNumber?: string;
    invoiceUrl?: string;
  };
  
  // Garantie
  warranty?: {
    startDate: string;
    endDate: string;
    provider?: string;
    contractNumber?: string;
    notes?: string;
  };
  
  // Configuration technique
  configuration?: {
    settings?: Record<string, string | number | boolean>;
    configNotes?: string;
    lastConfiguredAt?: string;
    lastConfiguredBy?: string;
    firmwareVersion?: string;
    softwareVersion?: string;
  };
  
  // Documentation & Pièces jointes
  documentation: {
    description?: string;
    notes?: string;
    manualUrl?: string;
    photos: string[];
  };
  
  // Documents
  documents: EquipmentDocument[];
  
  // Caractéristiques techniques
  specifications?: Record<string, string | number>;
  
  // Quantité (pour consommables)
  isConsumable: boolean;
  quantity?: number;
  minQuantity?: number;
  unit?: string;
  
  // Audit
  createdAt: string;
  createdBy: string;
  createdByName: string;
  updatedAt: string;
  updatedBy: string;
  isArchived: boolean;
  archivedAt?: string;
  archivedReason?: string;
}

/**
 * Données pour créer un équipement
 */
export interface CreateEquipmentData {
  name: string;
  reference: string;
  serialNumber?: string;
  barcode?: string;
  categoryId: string;
  categoryName: string;
  subcategory?: string;
  brand: string;
  model: string;
  manufacturer?: string;
  statusId: string;
  statusName: string;
  conditionId: string;
  conditionName: string;
  currentLocation: Equipment['currentLocation'];
  acquisition: Equipment['acquisition'];
  warranty?: Equipment['warranty'];
  configuration?: Equipment['configuration'];
  documentation?: Partial<Equipment['documentation']>;
  specifications?: Equipment['specifications'];
  isConsumable: boolean;
  quantity?: number;
  minQuantity?: number;
  unit?: string;
}

/**
 * Données pour mettre à jour un équipement
 */
export type UpdateEquipmentData = Partial<Omit<Equipment, 'id' | 'createdAt' | 'createdBy' | 'createdByName'>>;

// ════════════════════════════════════════════════════════════════
// MOUVEMENTS
// ════════════════════════════════════════════════════════════════

/**
 * Types de mouvement d'équipement
 */
export type MovementType =
  // Assignations utilisateur
  | 'assignment'
  | 'return'
  // Prêts et missions
  | 'loan'
  | 'loan_return'
  | 'mission_checkout'
  | 'mission_checkin'
  // Prêts inter-entreprises
  | 'company_loan'
  | 'company_loan_return'
  | 'transfer_company'
  // Déplacements physiques
  | 'transfer_site'
  | 'transfer_room'
  // Maintenance & Réparation
  | 'maintenance_out'
  | 'maintenance_in'
  | 'repair_out'
  | 'repair_in'
  // Cycle de vie
  | 'initial_entry'
  | 'disposal'
  | 'loss'
  | 'found'
  | 'inventory_check'
  // Autre
  | 'other';

/**
 * Mouvement d'équipement avec historique complet
 */
export interface EquipmentMovement {
  id: string;
  equipmentId: string;
  equipmentRef: string;
  equipmentName: string;
  
  // Type de mouvement
  movementTypeId: string;
  movementTypeName: string;
  movementCategory: MovementType;
  
  // Lien mission
  missionId?: string;
  missionTitle?: string;
  missionType?: 'reportage' | 'tournage' | 'evenement' | 'autre';
  
  // Origine
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
  
  // Destination
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
    externalLocation?: string;
  };
  
  // Détails
  date: string;
  expectedReturnDate?: string;
  actualReturnDate?: string;
  reason: string;
  notes?: string;
  
  // Validation
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  requiresApproval: boolean;
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: string;
  rejectionReason?: string;
  
  // État au retour
  returnCondition?: {
    conditionId: string;
    conditionName: string;
    notes?: string;
    issues?: string[];
    photosUrls?: string[];
  };
  
  // Documents
  attachments?: {
    name: string;
    url: string;
    type: string;
  }[];
  signatureUrl?: string;
  
  // Audit
  createdAt: string;
  createdBy: string;
  createdByName: string;
}

/**
 * Données pour créer un mouvement
 */
export interface CreateMovementData {
  equipmentId: string;
  equipmentRef: string;
  equipmentName: string;
  movementTypeId: string;
  movementTypeName: string;
  movementCategory: MovementType;
  missionId?: string;
  missionTitle?: string;
  missionType?: 'reportage' | 'tournage' | 'evenement' | 'autre';
  from: EquipmentMovement['from'];
  to: EquipmentMovement['to'];
  date: string;
  expectedReturnDate?: string;
  reason: string;
  notes?: string;
  requiresApproval: boolean;
}

// ════════════════════════════════════════════════════════════════
// MAINTENANCE
// ════════════════════════════════════════════════════════════════

/**
 * Type de maintenance
 */
export type MaintenanceType =
  | 'preventive'
  | 'corrective'
  | 'inspection'
  | 'calibration'
  | 'cleaning'
  | 'upgrade'
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
  estimatedDuration?: number;
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

// ════════════════════════════════════════════════════════════════
// LOCALISATION
// ════════════════════════════════════════════════════════════════

/**
 * Types de secteurs d'activité
 */
export type CompanyType = 
  | 'petroleum'
  | 'transport'
  | 'media'
  | 'it_services'
  | 'holding'
  | 'other';

/**
 * Entreprise/Société du groupe
 */
export interface Company {
  id: string;
  name: string;
  code: string;
  type: CompanyType;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  logo?: string;
  canShareEquipment: boolean;
  canBorrowEquipment: boolean;
  requiresApprovalToLend: boolean;
  requiresApprovalToBorrow: boolean;
  parentCompanyId?: string;
  childCompanyIds?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Types de sites
 */
export type SiteType = 
  // Sites communs
  | 'headquarters'
  | 'office'
  | 'warehouse'
  | 'shared_space'
  // Secteur Pétrolier
  | 'station_service'
  | 'depot_carburant'
  // Secteur Transport
  | 'garage'
  | 'parking'
  | 'hub_logistique'
  // Secteur Média
  | 'studio'
  | 'regie'
  | 'salle_montage'
  | 'plateau_tv'
  // Autres
  | 'external'
  | 'mobile'
  | 'other';

/**
 * Site/Établissement
 */
export interface Site {
  id: string;
  companyId: string;
  companyName: string;
  name: string;
  code: string;
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
 * Types de locaux
 */
export type RoomType = 
  | 'studio'
  | 'control_room'
  | 'office'
  | 'storage'
  | 'technical'
  | 'meeting_room'
  | 'other';

/**
 * Local/Pièce
 */
export interface Room {
  id: string;
  siteId: string;
  siteName: string;
  companyId: string;
  name: string;
  code: string;
  type: RoomType;
  floor?: string;
  building?: string;
  capacity?: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ════════════════════════════════════════════════════════════════
// MISSIONS
// ════════════════════════════════════════════════════════════════

/**
 * Type de mission
 */
export type MissionType =
  | 'reportage'
  | 'tournage'
  | 'evenement'
  | 'interview'
  | 'emission_externe'
  | 'formation'
  | 'livraison'
  | 'demenagement'
  | 'intervention'
  | 'audit'
  | 'installation'
  | 'maintenance_terrain'
  | 'autre';

/**
 * Mission/Projet nécessitant du matériel
 */
export interface Mission {
  id: string;
  
  // Identification
  title: string;
  reference: string;
  type: MissionType;
  description?: string;
  
  // Entreprises impliquées
  requestingCompanyId: string;
  requestingCompanyName: string;
  providingCompanyIds: string[];
  
  // Dates & Lieu
  startDate: string;
  endDate: string;
  location: {
    name: string;
    address?: string;
    city?: string;
    coordinates?: { lat: number; lng: number };
  };
  
  // Équipe
  teamLeader: {
    userId: string;
    userName: string;
    userEmail: string;
    phone?: string;
  };
  teamMembers: {
    userId: string;
    userName: string;
    role?: string;
  }[];
  
  // Équipements réservés
  equipment: {
    equipmentId: string;
    equipmentRef: string;
    equipmentName: string;
    categoryName: string;
    ownerCompanyId: string;
    ownerCompanyName: string;
    checkoutMovementId?: string;
    checkinMovementId?: string;
    status: 'reserved' | 'checked_out' | 'returned' | 'issue';
    notes?: string;
    returnCondition?: string;
  }[];
  
  // Statut
  status: 'draft' | 'pending_approval' | 'approved' | 'in_progress' | 'completed' | 'cancelled';
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: string;
  
  // Documents & Notes
  notes?: string;
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

// ════════════════════════════════════════════════════════════════
// RECHERCHE / FILTRES
// ════════════════════════════════════════════════════════════════

/**
 * Critères de recherche d'équipements
 */
export interface InventorySearchCriteria {
  query?: string;
  reference?: string;
  serialNumber?: string;
  barcode?: string;
  categoryIds?: string[];
  brands?: string[];
  statusIds?: string[];
  conditionIds?: string[];
  isArchived?: boolean;
  companyIds?: string[];
  siteIds?: string[];
  roomIds?: string[];
  assignedToUserId?: string;
  isAssigned?: boolean;
  minValue?: number;
  maxValue?: number;
  warrantyStatus?: 'active' | 'expired' | 'expiring_soon';
  warrantyExpiringBefore?: string;
  isConsumable?: boolean;
  lowStock?: boolean;
  acquiredAfter?: string;
  acquiredBefore?: string;
  limit?: number;
  offset?: number;
  cursor?: string;
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
  fromCompanyId?: string;
  fromSiteId?: string;
  fromRoomId?: string;
  fromUserId?: string;
  toCompanyId?: string;
  toSiteId?: string;
  toRoomId?: string;
  toUserId?: string;
  status?: ('pending' | 'approved' | 'rejected' | 'completed')[];
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  cursor?: string;
  orderDirection?: 'asc' | 'desc';
}

// ════════════════════════════════════════════════════════════════
// RÉSERVATIONS
// ════════════════════════════════════════════════════════════════

/**
 * Réservation de matériel
 */
export interface EquipmentReservation {
  id: string;
  equipmentId: string;
  equipmentRef: string;
  equipmentName: string;
  missionId?: string;
  missionTitle?: string;
  startDate: string;
  endDate: string;
  requestedBy: string;
  requestedByName: string;
  requestedByCompany: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
  notes?: string;
}
