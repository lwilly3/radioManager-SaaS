import React from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';
import { useAudioStore } from '../../store/useAudioStore';

/**
 * Radio control component that provides play/pause functionality.
 * Uses the audio store to manage playback state.
 */
const RadioControl: React.FC = () => {
  // Get audio playback state and control function from store
  const { isPlaying, setPlaying } = useAudioStore();

  return (
    <button
      onClick={() => setPlaying(!isPlaying)}
      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
      aria-label={isPlaying ? 'Mettre en pause' : 'Écouter'}
    >
      {/* Dynamic icon based on playback state */}
      {isPlaying ? (
        <Pause className="h-5 w-5" />
      ) : (
        <Play className="h-5 w-5" />
      )}
      <Volume2 className="h-5 w-5" />
      <span className="hidden sm:inline">Écouter en direct</span>
    </button>
  );
};

export default RadioControl;