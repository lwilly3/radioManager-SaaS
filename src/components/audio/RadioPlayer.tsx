import React, { useEffect, useRef } from 'react';
import { useAudioStore } from '../../store/useAudioStore';

// Stream URL for the radio broadcast
const STREAM_URL = 'https://radio.audace.ovh/stream.mp3';

/**
 * Hidden audio player component that handles the actual audio playback.
 * Manages audio element state based on the audio store.
 */
const RadioPlayer: React.FC = () => {
  // Reference to the HTML audio element
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Get playback state and controls from store
  const { isPlaying, volume, setPlaying } = useAudioStore();

  // Effect to handle audio playback state changes
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        // Attempt to play audio and handle any errors
        audioRef.current.play().catch((error) => {
          console.error('Error playing audio:', error);
          setPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
      // Update volume
      audioRef.current.volume = volume;
    }
  }, [isPlaying, volume, setPlaying]);

  return (
    <audio
      ref={audioRef}
      src={STREAM_URL}
      preload="none"
      onError={() => setPlaying(false)}
    />
  );
};

export default RadioPlayer;