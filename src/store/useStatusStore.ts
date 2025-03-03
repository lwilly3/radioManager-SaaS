import { create } from 'zustand';
import { Status } from '../types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Interface defining the status store state and actions
 */
interface StatusState {
  statuses: Status[]; // List of all status options
  setStatuses: (statuses: Status[]) => void; // Replace all statuses
  addStatus: (status: Status) => void; // Add a new status
  updateStatus: (status: Status) => void; // Update existing status
  deleteStatus: (statusId: string) => void; // Remove a status
  getNextStatus: (currentStatusId: string) => Status | null; // Get next valid status
  getStatusById: (currentStatusId: string) => Status | null;
  getstatusNameById: () => Record<string, string[]>;
}

/**
 * Defines allowed status transitions
 * Key: current status, Value: array of allowed next statuses
 */
const statusTransitions: Record<string, string[]> = {
  preparation: ['attente-diffusion'],
  'attente-diffusion': ['en-cours'],
  'en-cours': ['termine'],
  termine: ['archive'],
};

const statusNameById: Record<string, string[]> = {
  preparation: ['En préparation'],
  'attente-diffusion': ['En attente de diffusion'],
  'en-cours': ['En cours'],
  termine: ['Terminé'],
};

// utiliser dans la liste de selection de status dans la section archives
const statusNameById_listeSelection: Record<string, string[]> = {
  preparation: ['En préparation'],
  'attente-diffusion': ['En attente de diffusion'],
  'en-cours': ['En cours'],
  termine: ['Terminé'],
  archive: ['Archives'],
};
/**
 * Default status configurations with priorities
 */
const defaultStatuses: Status[] = [
  {
    id: 'preparation',
    name: 'En préparation',
    color: '#FCD34D',
    priority: 1,
  },
  {
    id: 'attente-diffusion',
    name: 'En attente de diffusion',
    color: '#F97316',
    priority: 2,
  },
  {
    id: 'en-cours',
    name: 'En cours',
    color: '#EF4444',
    priority: 3,
  },
  {
    id: 'termine',
    name: 'Terminé',
    color: '#34D399',
    priority: 4,
  },
  {
    id: 'archive',
    name: 'Archivé',
    color: '#9CA3AF',
    priority: 5,
  },
];

/**
 * Store for managing show status states and transitions.
 * Handles CRUD operations and status workflow logic.
 */
export const useStatusStore = create<StatusState>((set, get) => ({
  // Initial state
  statuses: defaultStatuses,

  getstatusNameById: () => {
    return statusNameById_listeSelection;
  },
  // Actions
  setStatuses: (statuses) => set({ statuses }),

  addStatus: (status) =>
    set((state) => ({
      statuses: [...state.statuses, { ...status, id: uuidv4() }],
    })),

  updateStatus: (updatedStatus) =>
    set((state) => ({
      statuses: state.statuses.map((status) =>
        status.id === updatedStatus.id ? updatedStatus : status
      ),
    })),

  deleteStatus: (statusId) =>
    set((state) => ({
      statuses: state.statuses.filter((status) => status.id !== statusId),
    })),

  getNextStatus: (currentStatusId) => {
    const nextStatusIds = statusTransitions[currentStatusId] || [];
    if (nextStatusIds.length === 0) return null;

    const statuses = get().statuses;
    const result =
      statuses.find((status) => status.id === nextStatusIds[0]) || null;
    // console.log('resulta de reponse de statut:', statuses, nextStatusIds);
    // console.log('resulta :', result[0]);

    // // consol.log(`resulta de reponse de statut ${result}`);
    // return result[0];
    if (result) {
      console.log('getNextStatus Result:', result);
      return result; // Return the `id` of the next status
    } else {
      console.log('No matching status found');
      return null;
    }
  },

  getStatusById: (currentStatusId) => {
    const StatusName = statusNameById[currentStatusId] || [];
    if (StatusName.length === 0) return null;

    const statuses = get().statuses;
    const result =
      statuses.find((status) => status.name === StatusName[0]) || null;
    // console.log('resulta de reponse de statut:', statuses, StatusName);
    // console.log('resulta :', result[0]);

    // // consol.log(`resulta de reponse de statut ${result}`);
    // return result[0];
    if (result) {
      console.log('getStatusById Result:', result);
      return result; // Return the `id` of the next status
    } else {
      console.log('No matching status found');
      return null;
    }
  },
}));
