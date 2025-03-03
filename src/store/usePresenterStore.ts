import { create } from 'zustand';
import { Presenter } from '../types';

interface PresenterState {
  presenters: Presenter[];
  setPresenters: (presenters: Presenter[]) => void;
  addPresenter: (presenter: Presenter) => void;
  updatePresenter: (presenter: Presenter) => void;
  deletePresenter: (presenterId: string) => void;
}

export const usePresenterStore = create<PresenterState>((set) => ({
  presenters: [],
  setPresenters: (presenters) => set({ presenters }),
  addPresenter: (presenter) =>
    set((state) => ({
      presenters: [...state.presenters, presenter],
    })),
  updatePresenter: (updatedPresenter) =>
    set((state) => ({
      presenters: state.presenters.map((presenter) =>
        presenter.id === updatedPresenter.id ? updatedPresenter : presenter
      ),
    })),
  deletePresenter: (presenterId) =>
    set((state) => ({
      presenters: state.presenters.filter((presenter) => presenter.id !== presenterId),
    })),
}));