import { create } from 'zustand';
import type { Guest } from '../types';

interface GuestState {
  guests: Guest[];
  setGuests: (guests: Guest[]) => void;
  addGuest: (guest: Guest) => void;
  updateGuest: (guest: Guest) => void;
  deleteGuest: (guestId: string) => void;
}

export const useGuestStore = create<GuestState>((set) => ({
  guests: [],
  setGuests: (guests) => set({ guests }),
  addGuest: (guest) => set((state) => ({ guests: [...state.guests, guest] })),
  updateGuest: (updatedGuest) => set((state) => ({
    guests: state.guests.map((guest) =>
      guest.id === updatedGuest.id ? updatedGuest : guest
    ),
  })),
  deleteGuest: (guestId) => set((state) => ({
    guests: state.guests.filter((guest) => guest.id !== guestId),
  })),
}));