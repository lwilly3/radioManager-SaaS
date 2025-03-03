import { create } from 'zustand';
import { ShowPlan } from '../types';
// import { mockShowPlans } from '../mocks/showPlans';

interface ShowPlanState {
  showPlans: ShowPlan[];
  selectedShowPlan: ShowPlan | null;
  filters: {
    search: string;
    status: string;
    date: string;
  };
  setShowPlans: (showPlans: ShowPlan[]) => void;
  setSelectedShowPlan: (showPlan: ShowPlan | null) => void;
  setFilters: (filters: Partial<ShowPlanState['filters']>) => void;
}

export const useShowPlanStore = create<ShowPlanState>((set) => ({
  showPlans: [], // Utilisation des données fictives
  selectedShowPlan: null,
  filters: {
    search: '',
    status: '',
    date: '',
  },
  setShowPlans: (showPlans) => set({ showPlans }),
  setSelectedShowPlan: (showPlan) => set({ selectedShowPlan: showPlan }),
  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),
}));
