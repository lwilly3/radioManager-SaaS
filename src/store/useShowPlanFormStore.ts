import { create } from 'zustand';
import type { ShowPlanFormData, ShowSegment, Status, Presenter, ShowType } from '../types';

interface ShowPlanFormState {
  // Données du formulaire
  formData: Partial<ShowPlanFormData>;
  selectedEmission: number | null;
  selectedStatus: Status | null;
  selectedPresenters: Presenter[];
  segments: ShowSegment[];

  // Actions
  setFormData: (data: Partial<ShowPlanFormData>) => void;
  updateFormData: (data: Partial<ShowPlanFormData>) => void;
  setSelectedEmission: (emissionId: number | null) => void;
  setSelectedStatus: (status: Status | null) => void;
  setSelectedPresenters: (presenters: Presenter[]) => void;
  addPresenter: (presenter: Presenter) => void;
  removePresenter: (presenterId: string) => void;
  setMainPresenter: (presenterId: string) => void;
  setSegments: (segments: ShowSegment[]) => void;
  addSegment: (segment: ShowSegment) => void;
  removeSegment: (segmentId: string) => void;
  reorderSegments: (segments: ShowSegment[]) => void;

  // Réinitialiser tout le formulaire
  resetForm: () => void;
}

const initialState: Pick<ShowPlanFormState, 'formData' | 'selectedEmission' | 'selectedStatus' | 'selectedPresenters' | 'segments'> = {
  formData: {
    title: '',
    showType: undefined as ShowType | undefined,
    date: '',
    time: '',
    description: '',
  },
  selectedEmission: null,
  selectedStatus: null,
  selectedPresenters: [],
  segments: [],
};

export const useShowPlanFormStore = create<ShowPlanFormState>((set) => ({
  ...initialState,

  setFormData: (data) => set({ formData: data }),

  updateFormData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data },
    })),

  setSelectedEmission: (emissionId) => set({ selectedEmission: emissionId }),

  setSelectedStatus: (status) => set({ selectedStatus: status }),

  setSelectedPresenters: (presenters) => set({ selectedPresenters: presenters }),

  addPresenter: (presenter) =>
    set((state) => ({
      selectedPresenters: [
        ...state.selectedPresenters,
        {
          ...presenter,
          isMainPresenter: state.selectedPresenters.length === 0,
        },
      ],
    })),

  removePresenter: (presenterId) =>
    set((state) => ({
      selectedPresenters: state.selectedPresenters.filter(
        (p) => p.id !== presenterId
      ),
    })),

  setMainPresenter: (presenterId) =>
    set((state) => ({
      selectedPresenters: state.selectedPresenters.map((p) => ({
        ...p,
        isMainPresenter: p.id === presenterId,
      })),
    })),

  setSegments: (segments) => set({ segments }),

  addSegment: (segment) =>
    set((state) => ({
      segments: [
        ...state.segments,
        { ...segment, id: `temp-${Date.now()}` },
      ],
    })),

  removeSegment: (segmentId) =>
    set((state) => ({
      segments: state.segments.filter((s) => s.id !== segmentId),
    })),

  reorderSegments: (segments) => set({ segments }),

  resetForm: () => set(initialState),
}));
