// Configuration par défaut du module Inventaire
import type { InventorySettings, Company, Site } from '../../types/inventory';

/**
 * Configuration par défaut du module inventaire
 */
export const DEFAULT_INVENTORY_SETTINGS: InventorySettings = {
  // ═══════════════════════════════════════════════════════════
  // CATÉGORIES D'ÉQUIPEMENT (Multi-secteurs)
  // ═══════════════════════════════════════════════════════════
  categories: [
    // Informatique (Partagé)
    { id: 'cat-computer', name: 'Ordinateurs', color: '#3B82F6', icon: 'Laptop', order: 1, isActive: true },
    { id: 'cat-printer', name: 'Imprimantes/Scanners', color: '#6366F1', icon: 'Printer', order: 2, isActive: true },
    { id: 'cat-network', name: 'Réseau', color: '#0EA5E9', icon: 'Network', order: 3, isActive: true },
    { id: 'cat-server', name: 'Serveurs', color: '#14B8A6', icon: 'Server', order: 4, isActive: true },
    { id: 'cat-phone', name: 'Téléphonie', color: '#8B5CF6', icon: 'Phone', order: 5, isActive: true },
    
    // Bureautique (Partagé)
    { id: 'cat-furniture', name: 'Mobilier', color: '#84CC16', icon: 'Armchair', order: 6, isActive: true },
    { id: 'cat-office', name: 'Équipement bureau', color: '#A3E635', icon: 'Briefcase', order: 7, isActive: true },
    { id: 'cat-visio', name: 'Visioconférence', color: '#22D3EE', icon: 'Video', order: 8, isActive: true },
    
    // Média (AMG)
    { id: 'cat-mic', name: 'Microphones', color: '#EC4899', icon: 'Mic', order: 9, isActive: true },
    { id: 'cat-console', name: 'Consoles/Mixeurs', color: '#F43F5E', icon: 'Sliders', order: 10, isActive: true },
    { id: 'cat-camera', name: 'Caméras', color: '#DC2626', icon: 'Camera', order: 11, isActive: true },
    { id: 'cat-broadcast', name: 'Diffusion', color: '#EF4444', icon: 'Radio', order: 12, isActive: true },
    { id: 'cat-lighting', name: 'Éclairage', color: '#FBBF24', icon: 'Lightbulb', order: 13, isActive: true },
    { id: 'cat-audio', name: 'Audio', color: '#F97316', icon: 'Headphones', order: 14, isActive: true },
    
    // Transport (Trafric)
    { id: 'cat-vehicle', name: 'Véhicules', color: '#10B981', icon: 'Truck', order: 15, isActive: true },
    { id: 'cat-gps', name: 'GPS/Tracking', color: '#059669', icon: 'MapPin', order: 16, isActive: true },
    { id: 'cat-manutention', name: 'Manutention', color: '#047857', icon: 'Package', order: 17, isActive: true },
    
    // Pétrolier (BAJ)
    { id: 'cat-pompe', name: 'Pompes/Distribution', color: '#7C3AED', icon: 'Fuel', order: 18, isActive: true },
    { id: 'cat-mesure', name: 'Instruments de mesure', color: '#8B5CF6', icon: 'Gauge', order: 19, isActive: true },
    { id: 'cat-securite', name: 'Équipement sécurité', color: '#EF4444', icon: 'ShieldAlert', order: 20, isActive: true },
    
    // Général
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
    // Média (AMG)
    { id: 'mission-reportage', name: 'Reportage', color: '#3B82F6', icon: 'Newspaper', order: 1, isActive: true },
    { id: 'mission-tournage', name: 'Tournage', color: '#8B5CF6', icon: 'Video', order: 2, isActive: true },
    { id: 'mission-evenement', name: 'Événement', color: '#EC4899', icon: 'PartyPopper', order: 3, isActive: true },
    { id: 'mission-interview', name: 'Interview', color: '#06B6D4', icon: 'Mic', order: 4, isActive: true },
    { id: 'mission-emission', name: 'Émission externe', color: '#10B981', icon: 'Radio', order: 5, isActive: true },
    
    // Transport (Trafric)
    { id: 'mission-livraison', name: 'Livraison', color: '#22C55E', icon: 'Truck', order: 6, isActive: true },
    { id: 'mission-demenagement', name: 'Déménagement', color: '#16A34A', icon: 'Package', order: 7, isActive: true },
    
    // Pétrolier (BAJ)
    { id: 'mission-intervention', name: 'Intervention station', color: '#7C3AED', icon: 'Wrench', order: 8, isActive: true },
    { id: 'mission-audit', name: 'Audit/Contrôle', color: '#A855F7', icon: 'ClipboardCheck', order: 9, isActive: true },
    
    // Commun
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
    maxFileSizeMB: 50,
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
    defaultAccessLevel: 'company',
    enableVersioning: true,
  },
  
  // ═══════════════════════════════════════════════════════════
  // OPTIONS GLOBALES
  // ═══════════════════════════════════════════════════════════
  // Référencement automatique
  referencePrefix: 'INV',
  referenceCounter: 0,
  
  defaultWarrantyMonths: 24,
  lowStockThreshold: 5,
  requireApprovalForTransfer: false,
  requireApprovalForCompanyLoan: true,
  requireApprovalForMission: false,
  notifyOnLowStock: true,
  notifyOnOverdueReturn: true,
  overdueThresholdDays: 3,
  
  updatedAt: new Date().toISOString(),
  updatedBy: 'system',
};

/**
 * Configuration des entreprises du groupe
 */
export const DEFAULT_COMPANIES: Company[] = [
  {
    id: 'company-baj',
    name: 'BAJ',
    code: 'BAJ',
    type: 'petroleum',
    description: 'Distribution de produits pétroliers',
    isActive: true,
    canShareEquipment: true,
    canBorrowEquipment: true,
    requiresApprovalToLend: true,
    requiresApprovalToBorrow: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'company-trafric',
    name: 'Trafric',
    code: 'TRF',
    type: 'transport',
    description: 'Transport et logistique',
    isActive: true,
    canShareEquipment: true,
    canBorrowEquipment: true,
    requiresApprovalToLend: true,
    requiresApprovalToBorrow: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'company-amg',
    name: 'AMG',
    code: 'AMG',
    type: 'media',
    description: 'Groupe média : Radio, TV, Production audiovisuelle',
    isActive: true,
    canShareEquipment: true,
    canBorrowEquipment: true,
    requiresApprovalToLend: true,
    requiresApprovalToBorrow: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

/**
 * Sites par défaut
 */
export const DEFAULT_SITES: Site[] = [
  {
    id: 'site-siege',
    companyId: 'company-amg',
    companyName: 'AMG',
    name: 'Siège Social',
    code: 'HQ',
    type: 'headquarters',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'site-studio-a',
    companyId: 'company-amg',
    companyName: 'AMG',
    name: 'Studio A',
    code: 'STU-A',
    type: 'studio',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'site-regie',
    companyId: 'company-amg',
    companyName: 'AMG',
    name: 'Régie Principale',
    code: 'REG-1',
    type: 'regie',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

/**
 * Icônes disponibles pour les catégories
 */
export const EQUIPMENT_ICONS = [
  'Laptop', 'Monitor', 'Printer', 'Server', 'Network', 'Phone',
  'Mic', 'Headphones', 'Camera', 'Video', 'Radio', 'Lightbulb',
  'Truck', 'Car', 'Fuel', 'Gauge', 'Wrench', 'Package',
  'Armchair', 'Briefcase', 'Shield', 'Box', 'Settings',
  'CheckCircle', 'XCircle', 'AlertCircle', 'User', 'MapPin',
  'Building', 'Building2', 'Home', 'DoorOpen', 'Calendar',
  'FileText', 'BookOpen', 'Award', 'Receipt', 'Image',
];

/**
 * Couleurs par défaut pour les options
 */
export const DEFAULT_COLORS = [
  '#3B82F6', '#22C55E', '#EF4444', '#F59E0B', '#8B5CF6',
  '#EC4899', '#06B6D4', '#F97316', '#6B7280', '#84CC16',
  '#14B8A6', '#A855F7', '#DC2626', '#10B981', '#7C3AED',
];
