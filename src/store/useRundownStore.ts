import { create } from 'zustand';
import { ShowRundown } from '../types';

interface ShowPlanState {
  showPlans: ShowRundown[];
  selectedShowPlan: ShowRundown | null;
  filters: {
    search: string;
    status: string;
    date: string;
  };
  setShowPlans: (showPlans: ShowRundown[]) => void;
  setSelectedShowPlan: (showPlan: ShowRundown | null) => void;
  setFilters: (filters: Partial<ShowPlanState['filters']>) => void;
}

export const useShowPlanStore = create<ShowPlanState>((set) => ({
  showPlans: [],
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