import { create } from 'zustand';

/**
 * Interface defining the audio store state and actions
 */
interface AudioState {
  isPlaying: boolean;      // Current playback state
  volume: number;          // Current volume level (0-1)
  setPlaying: (playing: boolean) => void;  // Toggle playback
  setVolume: (volume: number) => void;     // Adjust volume
}

/**
 * Store for managing audio playback state.
 * Uses Zustand for state management.
 */
export const useAudioStore = create<AudioState>((set) => ({
  // Initial state
  isPlaying: false,
  volume: 1,
  
  // Actions
  setPlaying: (playing) => set({ isPlaying: playing }),
  setVolume: (volume) => set({ volume }),
}));