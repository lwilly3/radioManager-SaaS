import React, { useEffect, useRef, useState } from 'react';
import { useAudioStore } from '../../store/useAudioStore';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../api/firebase/firebase';

// Valeur par défaut pour STREAM_URL
const DEFAULT_STREAM_URL = 'https://radio.audace.ovh/stream.mp3';

/**
 * Hidden audio player component that handles the actual audio playback.
 * Manages audio element state based on the audio store and fetches stream URL from Firebase.
 */
const RadioPlayer: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { isPlaying, volume, setPlaying } = useAudioStore();

  // État pour stocker l'URL du flux audio
  const [streamUrl, setStreamUrl] = useState(DEFAULT_STREAM_URL);

  // Charger STREAM_URL depuis Firebase au montage
  useEffect(() => {
    const fetchStreamUrl = async () => {
      try {
        const settingsRef = doc(db, 'settings', 'general_settings');
        const docSnap = await getDoc(settingsRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          // Vérifier si streamUrl existe dans les données Firestore
          if (data.streamUrl) {
            setStreamUrl(data.streamUrl);
          } else {
            console.log(
              'Aucun streamUrl trouvé dans Firestore, utilisation de la valeur par défaut'
            );
          }
        } else {
          console.log(
            'Aucun document trouvé dans Firestore, utilisation de la valeur par défaut'
          );
        }
      } catch (error) {
        console.error(
          'Erreur lors de la récupération de streamUrl depuis Firestore:',
          error
        );
        // En cas d'erreur, conserver la valeur par défaut
      }
    };

    fetchStreamUrl();
  }, []); // Pas de dépendances, exécuté une seule fois au montage

  // Gérer les changements d'état de lecture et de volume
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch((error) => {
          console.error('Error playing audio:', error);
          setPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
      audioRef.current.volume = volume;
    }
  }, [isPlaying, volume, setPlaying]);

  return (
    <audio
      ref={audioRef}
      src={streamUrl} // Utilise l'état dynamique au lieu de la constante statique
      preload="none"
      onError={() => setPlaying(false)}
    />
  );
};

export default RadioPlayer;

// import React, { useEffect, useRef } from 'react';
// import { useAudioStore } from '../../store/useAudioStore';

// // Stream URL for the radio broadcast
// const STREAM_URL = 'https://radio.audace.ovh/stream.mp3';

// /**
//  * Hidden audio player component that handles the actual audio playback.
//  * Manages audio element state based on the audio store.
//  */
// const RadioPlayer: React.FC = () => {
//   // Reference to the HTML audio element
//   const audioRef = useRef<HTMLAudioElement | null>(null);

//   // Get playback state and controls from store
//   const { isPlaying, volume, setPlaying } = useAudioStore();

//   // Effect to handle audio playback state changes
//   useEffect(() => {
//     if (audioRef.current) {
//       if (isPlaying) {
//         // Attempt to play audio and handle any errors
//         audioRef.current.play().catch((error) => {
//           console.error('Error playing audio:', error);
//           setPlaying(false);
//         });
//       } else {
//         audioRef.current.pause();
//       }
//       // Update volume
//       audioRef.current.volume = volume;
//     }
//   }, [isPlaying, volume, setPlaying]);

//   return (
//     <audio
//       ref={audioRef}
//       src={STREAM_URL}
//       preload="none"
//       onError={() => setPlaying(false)}
//     />
//   );
// };

// export default RadioPlayer;
