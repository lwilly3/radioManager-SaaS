import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TeamMember } from '../types';

interface TeamState {
  members: TeamMember[];
  setMembers: (members: TeamMember[]) => void;
  addMember: (member: TeamMember) => void;
  updateMember: (member: TeamMember) => void;
  deleteMember: (memberId: string) => void;
}

export const useTeamStore = create<TeamState>()(
  persist(
    (set) => ({
      members: [],
      setMembers: (members) => set({ members }),
      addMember: (member) => set((state) => ({ 
        members: [...state.members, member] 
      })),
      updateMember: (updatedMember) => set((state) => ({
        members: state.members.map((member) =>
          member.id === updatedMember.id ? updatedMember : member
        ),
      })),
      deleteMember: (memberId) => set((state) => ({
        members: state.members.filter((member) => member.id !== memberId),
      })),
    }),
    {
      name: 'team-storage',
    }
  )
);