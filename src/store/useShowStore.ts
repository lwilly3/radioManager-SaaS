import { create } from 'zustand';
import type { Show } from '../types';

interface ShowState {
  shows: Show[];
  setShows: (shows: Show[]) => void;
  addShow: (show: Show) => void;
  updateShow: (show: Show) => void;
  deleteShow: (showId: string) => void;
  currentShow: Show | null;
  setCurrentShow: (show: Show | null) => void;
}

export const useShowStore = create<ShowState>((set) => ({
  shows: [],
  currentShow: null,
  setShows: (shows) => set({ shows }),
  addShow: (show) => set((state) => ({ shows: [...state.shows, show] })),
  updateShow: (updatedShow) => set((state) => ({
    shows: state.shows.map((show) =>
      show.id === updatedShow.id ? updatedShow : show
    ),
  })),
  deleteShow: (showId) => set((state) => ({
    shows: state.shows.filter((show) => show.id !== showId),
  })),
  setCurrentShow: (show) => set({ currentShow: show }),
}));