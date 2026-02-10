// Service Firestore pour le module Inventaire
// Pattern : Firebase Direct (comme Quotes)

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  QueryConstraint,
  writeBatch,
  setDoc,
  runTransaction,
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { db, storage } from './firebase';
import type {
  Equipment,
  CreateEquipmentData,
  UpdateEquipmentData,
  EquipmentMovement,
  CreateMovementData,
  MaintenanceRecord,
  InventorySettings,
  InventorySearchCriteria,
  MovementSearchCriteria,
  Company,
  Site,
  Room,
  EquipmentDocument,
} from '../../types/inventory';
import { DEFAULT_INVENTORY_SETTINGS, DEFAULT_COMPANIES, DEFAULT_SITES } from '../../utils/inventory/defaultSettings';

// ════════════════════════════════════════════════════════════════
// COLLECTIONS
// ════════════════════════════════════════════════════════════════

const EQUIPMENT_COLLECTION = 'equipment';
const MOVEMENTS_COLLECTION = 'equipment_movements';
const MAINTENANCE_COLLECTION = 'equipment_maintenance';
const COMPANIES_COLLECTION = 'companies';
const SITES_COLLECTION = 'sites';
const ROOMS_COLLECTION = 'rooms';
const SETTINGS_DOC = 'settings/inventory_settings';

// ════════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════════

/**
 * Convertit un timestamp Firestore en string ISO
 */
const timestampToString = (timestamp: unknown): string => {
  if (!timestamp) return new Date().toISOString();
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate().toISOString();
  }
  if (typeof timestamp === 'object' && timestamp !== null && 'toDate' in timestamp) {
    return (timestamp as { toDate: () => Date }).toDate().toISOString();
  }
  return timestamp as string;
};

/**
 * Convertit les données Firestore en Equipment typé
 */
const firestoreToEquipment = (id: string, data: Record<string, unknown>): Equipment => {
  return {
    id,
    name: data.name as string,
    reference: data.reference as string,
    serialNumber: data.serialNumber as string | undefined,
    barcode: data.barcode as string | undefined,
    categoryId: data.categoryId as string,
    categoryName: data.categoryName as string,
    subcategory: data.subcategory as string | undefined,
    brand: data.brand as string,
    model: data.model as string,
    manufacturer: data.manufacturer as string | undefined,
    statusId: data.statusId as string,
    statusName: data.statusName as string,
    conditionId: data.conditionId as string,
    conditionName: data.conditionName as string,
    currentLocation: data.currentLocation as Equipment['currentLocation'],
    currentAssignment: data.currentAssignment as Equipment['currentAssignment'] | undefined,
    acquisition: data.acquisition as Equipment['acquisition'],
    warranty: data.warranty as Equipment['warranty'] | undefined,
    configuration: data.configuration as Equipment['configuration'] | undefined,
    documentation: (data.documentation as Equipment['documentation']) || { photos: [] },
    documents: (data.documents as EquipmentDocument[]) || [],
    specifications: data.specifications as Record<string, string | number> | undefined,
    isConsumable: data.isConsumable as boolean || false,
    quantity: data.quantity as number | undefined,
    minQuantity: data.minQuantity as number | undefined,
    unit: data.unit as string | undefined,
    createdAt: timestampToString(data.createdAt),
    createdBy: data.createdBy as string,
    createdByName: data.createdByName as string,
    updatedAt: timestampToString(data.updatedAt),
    updatedBy: data.updatedBy as string,
    isArchived: data.isArchived as boolean || false,
    archivedAt: data.archivedAt ? timestampToString(data.archivedAt) : undefined,
    archivedReason: data.archivedReason as string | undefined,
  };
};

/**
 * Convertit les données Firestore en Movement typé
 */
const firestoreToMovement = (id: string, data: Record<string, unknown>): EquipmentMovement => {
  return {
    id,
    equipmentId: data.equipmentId as string,
    equipmentRef: data.equipmentRef as string,
    equipmentName: data.equipmentName as string,
    movementTypeId: data.movementTypeId as string,
    movementTypeName: data.movementTypeName as string,
    movementCategory: data.movementCategory as EquipmentMovement['movementCategory'],
    missionId: data.missionId as string | undefined,
    missionTitle: data.missionTitle as string | undefined,
    missionType: data.missionType as EquipmentMovement['missionType'],
    from: data.from as EquipmentMovement['from'],
    to: data.to as EquipmentMovement['to'],
    date: timestampToString(data.date),
    expectedReturnDate: data.expectedReturnDate ? timestampToString(data.expectedReturnDate) : undefined,
    actualReturnDate: data.actualReturnDate ? timestampToString(data.actualReturnDate) : undefined,
    reason: data.reason as string,
    notes: data.notes as string | undefined,
    status: data.status as EquipmentMovement['status'],
    requiresApproval: data.requiresApproval as boolean,
    approvedBy: data.approvedBy as string | undefined,
    approvedByName: data.approvedByName as string | undefined,
    approvedAt: data.approvedAt ? timestampToString(data.approvedAt) : undefined,
    rejectionReason: data.rejectionReason as string | undefined,
    returnCondition: data.returnCondition as EquipmentMovement['returnCondition'],
    attachments: data.attachments as EquipmentMovement['attachments'],
    signatureUrl: data.signatureUrl as string | undefined,
    createdAt: timestampToString(data.createdAt),
    createdBy: data.createdBy as string,
    createdByName: data.createdByName as string,
  };
};

// ════════════════════════════════════════════════════════════════
// SETTINGS / CONFIGURATION
// ════════════════════════════════════════════════════════════════

/**
 * Récupère les paramètres d'inventaire
 */
export const getInventorySettings = async (): Promise<InventorySettings> => {
  const docRef = doc(db, SETTINGS_DOC);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return docSnap.data() as InventorySettings;
  }
  
  // Créer les paramètres par défaut si inexistants
  await setDoc(docRef, DEFAULT_INVENTORY_SETTINGS);
  return DEFAULT_INVENTORY_SETTINGS;
};

/**
 * Met à jour les paramètres d'inventaire
 */
export const updateInventorySettings = async (
  updates: Partial<InventorySettings>,
  userId: string
): Promise<void> => {
  const docRef = doc(db, SETTINGS_DOC);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp(),
    updatedBy: userId,
  });
};

/**
 * Écoute temps réel des paramètres
 */
export const subscribeToInventorySettings = (
  callback: (settings: InventorySettings) => void,
  onError?: (error: Error) => void
): (() => void) => {
  const docRef = doc(db, SETTINGS_DOC);
  
  return onSnapshot(
    docRef,
    async (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data() as InventorySettings);
      } else {
        await setDoc(docRef, DEFAULT_INVENTORY_SETTINGS);
        callback(DEFAULT_INVENTORY_SETTINGS);
      }
    },
    (error) => {
      console.error('Erreur subscription settings:', error);
      onError?.(error);
    }
  );
};

/**
 * Génère la prochaine référence d'équipement de manière atomique
 * Incrémente le compteur dans les paramètres et retourne la référence formatée
 */
export const getNextReference = async (): Promise<string> => {
  const docRef = doc(db, SETTINGS_DOC);
  
  const newRef = await runTransaction(db, async (transaction) => {
    const docSnap = await transaction.get(docRef);
    const settings = docSnap.exists()
      ? (docSnap.data() as InventorySettings)
      : DEFAULT_INVENTORY_SETTINGS;
    
    const prefix = settings.referencePrefix || 'INV';
    const nextCounter = (settings.referenceCounter || 0) + 1;
    
    transaction.update(docRef, {
      referenceCounter: nextCounter,
      updatedAt: serverTimestamp(),
    });
    
    // Format: PREFIX-0001, PREFIX-0002, etc.
    const paddedNumber = String(nextCounter).padStart(4, '0');
    return `${prefix}-${paddedNumber}`;
  });
  
  return newRef;
};

// ════════════════════════════════════════════════════════════════
// EQUIPMENT CRUD
// ════════════════════════════════════════════════════════════════

/**
 * Récupère tous les équipements avec filtres
 */
export const getEquipments = async (
  filters?: InventorySearchCriteria
): Promise<Equipment[]> => {
  try {
    const constraints: QueryConstraint[] = [];

    // Filtres Firestore
    if (filters?.categoryIds?.length) {
      constraints.push(where('categoryId', 'in', filters.categoryIds.slice(0, 10)));
    }
    if (filters?.statusIds?.length) {
      constraints.push(where('statusId', 'in', filters.statusIds.slice(0, 10)));
    }
    if (filters?.companyIds?.length) {
      constraints.push(where('currentLocation.companyId', 'in', filters.companyIds.slice(0, 10)));
    }
    if (filters?.isArchived !== undefined) {
      constraints.push(where('isArchived', '==', filters.isArchived));
    } else {
      // Par défaut, ne pas afficher les archivés
      constraints.push(where('isArchived', '==', false));
    }
    if (filters?.isConsumable !== undefined) {
      constraints.push(where('isConsumable', '==', filters.isConsumable));
    }
    if (filters?.assignedToUserId) {
      constraints.push(where('currentAssignment.userId', '==', filters.assignedToUserId));
    }

    // Tri - Utiliser seulement si pas de filtre isArchived pour éviter problème d'index
    // Note: Si vous avez créé l'index composite isArchived+createdAt, vous pouvez retirer cette condition
    const orderField = filters?.orderBy || 'createdAt';
    const orderDir = filters?.orderDirection || 'desc';
    
    // On ajoute le tri seulement s'il n'y a pas d'autres contraintes where
    // Sinon Firebase requiert un index composite
    if (constraints.length === 0 || constraints.length === 1) {
      constraints.push(orderBy(orderField, orderDir));
    }

    // Limite
    if (filters?.limit) {
      constraints.push(limit(filters.limit));
    }

    const q = query(collection(db, EQUIPMENT_COLLECTION), ...constraints);
    const querySnapshot = await getDocs(q);

    let equipments = querySnapshot.docs.map(doc => 
      firestoreToEquipment(doc.id, doc.data())
    );

    // Filtres côté client
    if (filters?.query) {
      const searchTerms = filters.query.toLowerCase().split(/\s+/);
      equipments = equipments.filter(eq => {
        const searchableText = [
          eq.name,
          eq.reference,
          eq.serialNumber,
          eq.brand,
          eq.model,
          eq.categoryName,
          eq.currentLocation.siteName,
          eq.currentAssignment?.userName,
        ].filter(Boolean).join(' ').toLowerCase();
        
        return searchTerms.every(term => searchableText.includes(term));
      });
    }

    if (filters?.brands?.length) {
      equipments = equipments.filter(eq => 
        filters.brands!.includes(eq.brand)
      );
    }

    if (filters?.siteIds?.length) {
      equipments = equipments.filter(eq => 
        filters.siteIds!.includes(eq.currentLocation.siteId)
      );
    }

    if (filters?.roomIds?.length) {
      equipments = equipments.filter(eq => 
        eq.currentLocation.roomId && filters.roomIds!.includes(eq.currentLocation.roomId)
      );
    }

    if (filters?.lowStock) {
      equipments = equipments.filter(eq => 
        eq.isConsumable && eq.quantity !== undefined && eq.minQuantity !== undefined && eq.quantity <= eq.minQuantity
      );
    }

    return equipments;
  } catch (error) {
    console.error('Erreur getEquipments:', error);
    throw error;
  }
};

/**
 * Récupère un équipement par ID
 */
export const getEquipmentById = async (id: string): Promise<Equipment | null> => {
  try {
    const docRef = doc(db, EQUIPMENT_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    return firestoreToEquipment(docSnap.id, docSnap.data());
  } catch (error) {
    console.error('Erreur getEquipmentById:', error);
    throw error;
  }
};

/**
 * Crée un nouvel équipement
 */
export const createEquipment = async (
  data: CreateEquipmentData,
  userId: string,
  userName: string
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, EQUIPMENT_COLLECTION), {
      ...data,
      documents: [],
      documentation: data.documentation || { photos: [] },
      createdAt: serverTimestamp(),
      createdBy: userId,
      createdByName: userName,
      updatedAt: serverTimestamp(),
      updatedBy: userId,
      isArchived: false,
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Erreur createEquipment:', error);
    throw error;
  }
};

/**
 * Met à jour un équipement
 */
export const updateEquipment = async (
  id: string,
  data: UpdateEquipmentData,
  userId: string
): Promise<void> => {
  try {
    const docRef = doc(db, EQUIPMENT_COLLECTION, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    });
  } catch (error) {
    console.error('Erreur updateEquipment:', error);
    throw error;
  }
};

/**
 * Archive un équipement (soft delete)
 */
export const archiveEquipment = async (
  id: string,
  reason: string,
  userId: string
): Promise<void> => {
  try {
    const docRef = doc(db, EQUIPMENT_COLLECTION, id);
    await updateDoc(docRef, {
      isArchived: true,
      archivedAt: serverTimestamp(),
      archivedReason: reason,
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    });
  } catch (error) {
    console.error('Erreur archiveEquipment:', error);
    throw error;
  }
};

/**
 * Restaure un équipement archivé
 */
export const restoreEquipment = async (
  id: string,
  userId: string
): Promise<void> => {
  try {
    const docRef = doc(db, EQUIPMENT_COLLECTION, id);
    await updateDoc(docRef, {
      isArchived: false,
      archivedAt: null,
      archivedReason: null,
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    });
  } catch (error) {
    console.error('Erreur restoreEquipment:', error);
    throw error;
  }
};

/**
 * Supprime définitivement un équipement
 */
export const deleteEquipment = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, EQUIPMENT_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Erreur deleteEquipment:', error);
    throw error;
  }
};

/**
 * Écoute temps réel des équipements
 */
export const subscribeToEquipments = (
  callback: (equipments: Equipment[]) => void,
  filters?: InventorySearchCriteria,
  onError?: (error: Error) => void
): (() => void) => {
  const constraints: QueryConstraint[] = [];
  
  if (filters?.isArchived !== undefined) {
    constraints.push(where('isArchived', '==', filters.isArchived));
  } else {
    constraints.push(where('isArchived', '==', false));
  }
  
  constraints.push(orderBy('createdAt', 'desc'));
  
  if (filters?.limit) {
    constraints.push(limit(filters.limit));
  }
  
  const q = query(collection(db, EQUIPMENT_COLLECTION), ...constraints);
  
  return onSnapshot(
    q,
    (snapshot) => {
      const equipments = snapshot.docs.map(doc => 
        firestoreToEquipment(doc.id, doc.data())
      );
      callback(equipments);
    },
    (error) => {
      console.error('Erreur subscription equipments:', error);
      onError?.(error);
    }
  );
};

// ════════════════════════════════════════════════════════════════
// MOVEMENTS
// ════════════════════════════════════════════════════════════════

/**
 * Récupère les mouvements avec filtres
 */
export const getMovements = async (
  filters?: MovementSearchCriteria
): Promise<EquipmentMovement[]> => {
  try {
    const constraints: QueryConstraint[] = [];

    if (filters?.equipmentId) {
      constraints.push(where('equipmentId', '==', filters.equipmentId));
    }
    if (filters?.status?.length) {
      constraints.push(where('status', 'in', filters.status));
    }

    constraints.push(orderBy('createdAt', filters?.orderDirection || 'desc'));

    if (filters?.limit) {
      constraints.push(limit(filters.limit));
    }

    const q = query(collection(db, MOVEMENTS_COLLECTION), ...constraints);
    const querySnapshot = await getDocs(q);

    let movements = querySnapshot.docs.map(doc => 
      firestoreToMovement(doc.id, doc.data())
    );

    // Filtres côté client
    if (filters?.movementTypes?.length) {
      movements = movements.filter(m => 
        filters.movementTypes!.includes(m.movementCategory)
      );
    }

    if (filters?.dateFrom) {
      movements = movements.filter(m => m.date >= filters.dateFrom!);
    }
    if (filters?.dateTo) {
      movements = movements.filter(m => m.date <= filters.dateTo!);
    }

    return movements;
  } catch (error) {
    console.error('Erreur getMovements:', error);
    throw error;
  }
};

/**
 * Crée un nouveau mouvement
 */
export const createMovement = async (
  data: CreateMovementData,
  userId: string,
  userName: string
): Promise<string> => {
  try {
    const batch = writeBatch(db);
    
    // Créer le mouvement
    const movementRef = doc(collection(db, MOVEMENTS_COLLECTION));
    batch.set(movementRef, {
      ...data,
      status: data.requiresApproval ? 'pending' : 'completed',
      createdAt: serverTimestamp(),
      createdBy: userId,
      createdByName: userName,
    });
    
    // Mettre à jour l'équipement si pas d'approbation requise
    if (!data.requiresApproval) {
      const equipmentRef = doc(db, EQUIPMENT_COLLECTION, data.equipmentId);
      const updateData: Record<string, unknown> = {
        updatedAt: serverTimestamp(),
        updatedBy: userId,
      };
      
      // Mettre à jour la localisation
      if (data.to.companyId || data.to.siteId || data.to.roomId) {
        updateData.currentLocation = {
          companyId: data.to.companyId,
          companyName: data.to.companyName,
          siteId: data.to.siteId,
          siteName: data.to.siteName,
          roomId: data.to.roomId,
          roomName: data.to.roomName,
          specificLocation: data.to.specificLocation,
        };
      }
      
      // Mettre à jour l'assignation
      if (data.movementCategory === 'assignment' || data.movementCategory === 'loan') {
        updateData.currentAssignment = {
          userId: data.to.userId,
          userName: data.to.userName,
          userEmail: '',
          assignedAt: new Date().toISOString(),
          assignedBy: userId,
          expectedReturnDate: data.expectedReturnDate,
          notes: data.notes,
        };
      } else if (data.movementCategory === 'return' || data.movementCategory === 'loan_return') {
        updateData.currentAssignment = null;
      }
      
      batch.update(equipmentRef, updateData);
    }
    
    await batch.commit();
    return movementRef.id;
  } catch (error) {
    console.error('Erreur createMovement:', error);
    throw error;
  }
};

/**
 * Approuve un mouvement
 */
export const approveMovement = async (
  movementId: string,
  userId: string,
  userName: string
): Promise<void> => {
  try {
    const movementRef = doc(db, MOVEMENTS_COLLECTION, movementId);
    const movementSnap = await getDoc(movementRef);
    
    if (!movementSnap.exists()) {
      throw new Error('Mouvement non trouvé');
    }
    
    const movement = firestoreToMovement(movementSnap.id, movementSnap.data());
    
    const batch = writeBatch(db);
    
    // Approuver le mouvement
    batch.update(movementRef, {
      status: 'completed',
      approvedBy: userId,
      approvedByName: userName,
      approvedAt: serverTimestamp(),
    });
    
    // Mettre à jour l'équipement
    const equipmentRef = doc(db, EQUIPMENT_COLLECTION, movement.equipmentId);
    const updateData: Record<string, unknown> = {
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    };
    
    if (movement.to.companyId || movement.to.siteId) {
      updateData.currentLocation = {
        companyId: movement.to.companyId,
        companyName: movement.to.companyName,
        siteId: movement.to.siteId,
        siteName: movement.to.siteName,
        roomId: movement.to.roomId,
        roomName: movement.to.roomName,
        specificLocation: movement.to.specificLocation,
      };
    }
    
    if (movement.movementCategory === 'assignment' || movement.movementCategory === 'loan') {
      updateData.currentAssignment = {
        userId: movement.to.userId,
        userName: movement.to.userName,
        userEmail: '',
        assignedAt: new Date().toISOString(),
        assignedBy: userId,
        expectedReturnDate: movement.expectedReturnDate,
        notes: movement.notes,
      };
    }
    
    batch.update(equipmentRef, updateData);
    await batch.commit();
  } catch (error) {
    console.error('Erreur approveMovement:', error);
    throw error;
  }
};

/**
 * Rejette un mouvement
 */
export const rejectMovement = async (
  movementId: string,
  reason: string,
  userId: string
): Promise<void> => {
  try {
    const movementRef = doc(db, MOVEMENTS_COLLECTION, movementId);
    await updateDoc(movementRef, {
      status: 'rejected',
      rejectionReason: reason,
      approvedBy: userId,
      approvedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Erreur rejectMovement:', error);
    throw error;
  }
};

/**
 * Écoute temps réel des mouvements d'un équipement
 */
export const subscribeToEquipmentMovements = (
  equipmentId: string,
  callback: (movements: EquipmentMovement[]) => void,
  onError?: (error: Error) => void
): (() => void) => {
  const q = query(
    collection(db, MOVEMENTS_COLLECTION),
    where('equipmentId', '==', equipmentId),
    orderBy('createdAt', 'desc'),
    limit(50)
  );
  
  return onSnapshot(
    q,
    (snapshot) => {
      const movements = snapshot.docs.map(doc => 
        firestoreToMovement(doc.id, doc.data())
      );
      callback(movements);
    },
    (error) => {
      console.error('Erreur subscription movements:', error);
      onError?.(error);
    }
  );
};

// ════════════════════════════════════════════════════════════════
// COMPANIES / SITES / ROOMS
// ════════════════════════════════════════════════════════════════

/**
 * Récupère les entreprises
 */
export const getCompanies = async (): Promise<Company[]> => {
  try {
    const q = query(
      collection(db, COMPANIES_COLLECTION),
      where('isActive', '==', true)
    );
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      // Initialiser avec les entreprises par défaut
      const batch = writeBatch(db);
      for (const company of DEFAULT_COMPANIES) {
        const docRef = doc(db, COMPANIES_COLLECTION, company.id);
        batch.set(docRef, company);
      }
      await batch.commit();
      return DEFAULT_COMPANIES;
    }
    
    return snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as Company))
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Erreur getCompanies:', error);
    throw error;
  }
};

/**
 * Récupère les sites d'une entreprise
 */
export const getSites = async (companyId?: string): Promise<Site[]> => {
  try {
    const constraints: QueryConstraint[] = [where('isActive', '==', true)];
    if (companyId) {
      constraints.push(where('companyId', '==', companyId));
    }
    const q = query(collection(db, SITES_COLLECTION), ...constraints);
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty && !companyId) {
      // Initialiser avec les sites par défaut
      const batch = writeBatch(db);
      for (const site of DEFAULT_SITES) {
        const docRef = doc(db, SITES_COLLECTION, site.id);
        batch.set(docRef, site);
      }
      await batch.commit();
      return DEFAULT_SITES;
    }
    
    return snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as Site))
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Erreur getSites:', error);
    throw error;
  }
};

/**
 * Récupère les locaux d'un site
 */
export const getRooms = async (siteId?: string): Promise<Room[]> => {
  try {
    const constraints: QueryConstraint[] = [where('isActive', '==', true)];
    if (siteId) {
      constraints.push(where('siteId', '==', siteId));
    }
    const q = query(collection(db, ROOMS_COLLECTION), ...constraints);
    
    const snapshot = await getDocs(q);
    return snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as Room))
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Erreur getRooms:', error);
    throw error;
  }
};

/**
 * Crée une entreprise
 */
export const createCompany = async (
  data: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, COMPANIES_COLLECTION), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Erreur createCompany:', error);
    throw error;
  }
};

/**
 * Crée un site
 */
export const createSite = async (
  data: Omit<Site, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, SITES_COLLECTION), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Erreur createSite:', error);
    throw error;
  }
};

/**
 * Crée un local
 */
export const createRoom = async (
  data: Omit<Room, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, ROOMS_COLLECTION), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Erreur createRoom:', error);
    throw error;
  }
};

/**
 * Met à jour une entreprise
 */
export const updateCompany = async (
  id: string,
  data: Partial<Omit<Company, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> => {
  try {
    const docRef = doc(db, COMPANIES_COLLECTION, id);
    // Nettoyer les undefined pour Firebase
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      cleaned[key] = value === undefined ? null : value;
    }
    await updateDoc(docRef, {
      ...cleaned,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Erreur updateCompany:', error);
    throw error;
  }
};

/**
 * Vérifie les dépendances d'une entreprise avant suppression
 * Retourne le nombre de sites, équipements et mouvements liés
 */
export const checkCompanyDependencies = async (companyId: string): Promise<{
  sites: number;
  equipment: number;
}> => {
  const [sitesSnap, equipmentSnap] = await Promise.all([
    getDocs(query(
      collection(db, SITES_COLLECTION),
      where('companyId', '==', companyId),
      limit(50)
    )),
    getDocs(query(
      collection(db, EQUIPMENT_COLLECTION),
      where('currentLocation.companyId', '==', companyId),
      limit(50)
    )),
  ]);
  return {
    sites: sitesSnap.size,
    equipment: equipmentSnap.size,
  };
};

/**
 * Supprime une entreprise (soft delete)
 * Bloque si des équipements ou sites sont encore liés
 */
export const deleteCompany = async (id: string): Promise<void> => {
  const deps = await checkCompanyDependencies(id);
  if (deps.equipment > 0) {
    throw new Error(`Impossible de supprimer : ${deps.equipment} équipement(s) rattaché(s) à cette entreprise.`);
  }
  if (deps.sites > 0) {
    throw new Error(`Impossible de supprimer : ${deps.sites} site(s) rattaché(s) à cette entreprise. Supprimez-les d'abord.`);
  }
  try {
    const docRef = doc(db, COMPANIES_COLLECTION, id);
    await updateDoc(docRef, {
      isActive: false,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Erreur deleteCompany:', error);
    throw error;
  }
};

/**
 * Met à jour un site
 */
export const updateSite = async (
  id: string,
  data: Partial<Omit<Site, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> => {
  try {
    const docRef = doc(db, SITES_COLLECTION, id);
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      cleaned[key] = value === undefined ? null : value;
    }
    await updateDoc(docRef, {
      ...cleaned,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Erreur updateSite:', error);
    throw error;
  }
};

/**
 * Vérifie les dépendances d'un site avant suppression
 */
export const checkSiteDependencies = async (siteId: string): Promise<{
  rooms: number;
  equipment: number;
}> => {
  const [roomsSnap, equipmentSnap] = await Promise.all([
    getDocs(query(
      collection(db, ROOMS_COLLECTION),
      where('siteId', '==', siteId),
      limit(50)
    )),
    getDocs(query(
      collection(db, EQUIPMENT_COLLECTION),
      where('currentLocation.siteId', '==', siteId),
      limit(50)
    )),
  ]);
  return {
    rooms: roomsSnap.size,
    equipment: equipmentSnap.size,
  };
};

/**
 * Supprime un site (soft delete)
 * Bloque si des équipements ou locaux sont encore liés
 */
export const deleteSite = async (id: string): Promise<void> => {
  const deps = await checkSiteDependencies(id);
  if (deps.equipment > 0) {
    throw new Error(`Impossible de supprimer : ${deps.equipment} équipement(s) rattaché(s) à ce site.`);
  }
  if (deps.rooms > 0) {
    throw new Error(`Impossible de supprimer : ${deps.rooms} local/locaux rattaché(s) à ce site. Supprimez-les d'abord.`);
  }
  try {
    const docRef = doc(db, SITES_COLLECTION, id);
    await updateDoc(docRef, {
      isActive: false,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Erreur deleteSite:', error);
    throw error;
  }
};

/**
 * Met à jour un local
 */
export const updateRoom = async (
  id: string,
  data: Partial<Omit<Room, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> => {
  try {
    const docRef = doc(db, ROOMS_COLLECTION, id);
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      cleaned[key] = value === undefined ? null : value;
    }
    await updateDoc(docRef, {
      ...cleaned,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Erreur updateRoom:', error);
    throw error;
  }
};

/**
 * Vérifie les dépendances d'un local avant suppression
 */
export const checkRoomDependencies = async (roomId: string): Promise<{
  equipment: number;
}> => {
  const equipmentSnap = await getDocs(query(
    collection(db, EQUIPMENT_COLLECTION),
    where('currentLocation.roomId', '==', roomId),
    limit(50)
  ));
  return {
    equipment: equipmentSnap.size,
  };
};

/**
 * Supprime un local (soft delete)
 * Bloque si des équipements sont encore liés
 */
export const deleteRoom = async (id: string): Promise<void> => {
  const deps = await checkRoomDependencies(id);
  if (deps.equipment > 0) {
    throw new Error(`Impossible de supprimer : ${deps.equipment} équipement(s) rattaché(s) à ce local.`);
  }
  try {
    const docRef = doc(db, ROOMS_COLLECTION, id);
    await updateDoc(docRef, {
      isActive: false,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Erreur deleteRoom:', error);
    throw error;
  }
};

// ════════════════════════════════════════════════════════════════
// DOCUMENTS / FILES
// ════════════════════════════════════════════════════════════════

/**
 * Upload un document pour un équipement
 */
export const uploadEquipmentDocument = async (
  equipmentId: string,
  file: File,
  metadata: {
    displayName: string;
    type: EquipmentDocument['type'];
    description?: string;
    accessLevel: EquipmentDocument['accessLevel'];
  },
  userId: string,
  userName: string
): Promise<EquipmentDocument> => {
  try {
    const timestamp = Date.now();
    const storagePath = `inventory/${equipmentId}/documents/${timestamp}_${file.name}`;
    const storageRef = ref(storage, storagePath);
    
    // Upload le fichier
    await uploadBytes(storageRef, file);
    const storageUrl = await getDownloadURL(storageRef);
    
    const document: EquipmentDocument = {
      id: `doc-${timestamp}`,
      equipmentId,
      fileName: file.name,
      displayName: metadata.displayName,
      description: metadata.description,
      type: metadata.type,
      mimeType: file.type,
      fileSize: file.size,
      storageUrl,
      storagePath,
      accessLevel: metadata.accessLevel,
      isLatest: true,
      uploadedAt: new Date().toISOString(),
      uploadedBy: userId,
      uploadedByName: userName,
      downloadCount: 0,
    };
    
    // Ajouter le document à l'équipement
    const equipmentRef = doc(db, EQUIPMENT_COLLECTION, equipmentId);
    const equipmentSnap = await getDoc(equipmentRef);
    
    if (equipmentSnap.exists()) {
      const equipment = equipmentSnap.data();
      const documents = equipment.documents || [];
      documents.push(document);
      
      await updateDoc(equipmentRef, {
        documents,
        updatedAt: serverTimestamp(),
        updatedBy: userId,
      });
    }
    
    return document;
  } catch (error) {
    console.error('Erreur uploadEquipmentDocument:', error);
    throw error;
  }
};

/**
 * Supprime un document d'un équipement
 */
export const deleteEquipmentDocument = async (
  equipmentId: string,
  documentId: string,
  storagePath: string,
  userId: string
): Promise<void> => {
  try {
    // Supprimer du storage
    const storageRef = ref(storage, storagePath);
    await deleteObject(storageRef);
    
    // Supprimer de Firestore
    const equipmentRef = doc(db, EQUIPMENT_COLLECTION, equipmentId);
    const equipmentSnap = await getDoc(equipmentRef);
    
    if (equipmentSnap.exists()) {
      const equipment = equipmentSnap.data();
      const documents = (equipment.documents || []).filter(
        (d: EquipmentDocument) => d.id !== documentId
      );
      
      await updateDoc(equipmentRef, {
        documents,
        updatedAt: serverTimestamp(),
        updatedBy: userId,
      });
    }
  } catch (error) {
    console.error('Erreur deleteEquipmentDocument:', error);
    throw error;
  }
};

/**
 * Upload une photo pour un équipement
 */
export const uploadEquipmentPhoto = async (
  equipmentId: string,
  file: File,
  userId: string
): Promise<string> => {
  try {
    const timestamp = Date.now();
    const storagePath = `inventory/${equipmentId}/photos/${timestamp}_${file.name}`;
    const storageRef = ref(storage, storagePath);
    
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    
    // Ajouter l'URL à l'équipement
    const equipmentRef = doc(db, EQUIPMENT_COLLECTION, equipmentId);
    const equipmentSnap = await getDoc(equipmentRef);
    
    if (equipmentSnap.exists()) {
      const equipment = equipmentSnap.data();
      const photos = equipment.documentation?.photos || [];
      photos.push(url);
      
      await updateDoc(equipmentRef, {
        'documentation.photos': photos,
        updatedAt: serverTimestamp(),
        updatedBy: userId,
      });
    }
    
    return url;
  } catch (error) {
    console.error('Erreur uploadEquipmentPhoto:', error);
    throw error;
  }
};

// ════════════════════════════════════════════════════════════════
// MAINTENANCE
// ════════════════════════════════════════════════════════════════

/**
 * Récupère les maintenances d'un équipement
 */
export const getMaintenanceRecords = async (
  equipmentId: string
): Promise<MaintenanceRecord[]> => {
  try {
    const q = query(
      collection(db, MAINTENANCE_COLLECTION),
      where('equipmentId', '==', equipmentId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: timestampToString(doc.data().createdAt),
      updatedAt: timestampToString(doc.data().updatedAt),
      scheduledDate: doc.data().scheduledDate ? timestampToString(doc.data().scheduledDate) : undefined,
      startDate: doc.data().startDate ? timestampToString(doc.data().startDate) : undefined,
      endDate: doc.data().endDate ? timestampToString(doc.data().endDate) : undefined,
    } as MaintenanceRecord));
  } catch (error) {
    console.error('Erreur getMaintenanceRecords:', error);
    throw error;
  }
};

/**
 * Crée un enregistrement de maintenance
 */
export const createMaintenanceRecord = async (
  data: Omit<MaintenanceRecord, 'id' | 'createdAt' | 'updatedAt'>,
  userId: string,
  userName: string
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, MAINTENANCE_COLLECTION), {
      ...data,
      createdAt: serverTimestamp(),
      createdBy: userId,
      createdByName: userName,
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Erreur createMaintenanceRecord:', error);
    throw error;
  }
};

/**
 * Met à jour un enregistrement de maintenance
 */
export const updateMaintenanceRecord = async (
  id: string,
  data: Partial<MaintenanceRecord>
): Promise<void> => {
  try {
    const docRef = doc(db, MAINTENANCE_COLLECTION, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Erreur updateMaintenanceRecord:', error);
    throw error;
  }
};

// ════════════════════════════════════════════════════════════════
// STATISTIQUES
// ════════════════════════════════════════════════════════════════

/**
 * Récupère les statistiques de l'inventaire
 */
export const getInventoryStats = async (companyId?: string): Promise<{
  total: number;
  byStatus: Record<string, number>;
  byCategory: Record<string, number>;
  lowStock: number;
  inMaintenance: number;
  assigned: number;
}> => {
  try {
    const filters: InventorySearchCriteria = { isArchived: false };
    if (companyId) {
      filters.companyIds = [companyId];
    }
    
    const equipments = await getEquipments(filters);
    
    const stats = {
      total: equipments.length,
      byStatus: {} as Record<string, number>,
      byCategory: {} as Record<string, number>,
      lowStock: 0,
      inMaintenance: 0,
      assigned: 0,
    };
    
    for (const eq of equipments) {
      // Par statut
      stats.byStatus[eq.statusName] = (stats.byStatus[eq.statusName] || 0) + 1;
      
      // Par catégorie
      stats.byCategory[eq.categoryName] = (stats.byCategory[eq.categoryName] || 0) + 1;
      
      // Stock bas
      if (eq.isConsumable && eq.quantity !== undefined && eq.minQuantity !== undefined && eq.quantity <= eq.minQuantity) {
        stats.lowStock++;
      }
      
      // En maintenance
      if (eq.statusName === 'En maintenance' || eq.statusName === 'En réparation') {
        stats.inMaintenance++;
      }
      
      // Attribués
      if (eq.currentAssignment) {
        stats.assigned++;
      }
    }
    
    return stats;
  } catch (error) {
    console.error('Erreur getInventoryStats:', error);
    throw error;
  }
};
