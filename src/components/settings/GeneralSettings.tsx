import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../api/firebase/firebase';
import { useAuthStore } from '../../store/useAuthStore';

interface GeneralSettingsForm {
  stationName: string;
  stationSlogan: string;
  streamUrl: string;
  timezone: string;
  language: string;
  logoUrl: string;
}

const GeneralSettings: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<GeneralSettingsForm>({
    defaultValues: {
      stationName: 'Radio Audace',
      stationSlogan: 'La radio qui vous inspire',
      streamUrl: 'https://radio.audace.ovh/stream.mp3',
      timezone: 'Europe/Paris',
      language: 'fr',
      logoUrl: '',
    },
  });

  const user = useAuthStore((state) => state.user);
  const [lastModifiedBy, setLastModifiedBy] = useState('Default Config'); // État pour le filigrane

  // Charger les données depuis Firestore au montage
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settingsRef = doc(db, 'settings', 'general_settings');
        const docSnap = await getDoc(settingsRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          reset(data); // Remplir le formulaire avec les données Firestore
          // Vérifier si created_by_name existe et n'est pas vide
          setLastModifiedBy(data.created_by_name || 'Default Config');
        } else {
          console.log(
            'Aucune donnée trouvée dans Firestore, utilisation des valeurs par défaut'
          );
          setLastModifiedBy('Default Config'); // Valeur par défaut si aucun document
        }
      } catch (error) {
        console.error(
          'Erreur lors du chargement des paramètres depuis Firestore:',
          error
        );
        setLastModifiedBy('Default Config'); // En cas d'erreur, valeur par défaut
      }
    };

    loadSettings();
  }, [reset]);

  const onSubmit = async (data: GeneralSettingsForm) => {
    try {
      console.log('Saving settings:', data);

      const settingsRef = doc(db, 'settings', 'general_settings');

      const settingsData = {
        ...data,
        updatedAt: new Date().toISOString(),
        created_by: user ? user.id : 'anonymous',
        created_by_name: user
          ? `${user.name} ${user.family_name}`
          : 'anonymous',
      };

      await setDoc(settingsRef, settingsData, { merge: true });

      // Mettre à jour le filigrane après la sauvegarde
      setLastModifiedBy(settingsData.created_by_name);
      console.log(
        'Settings saved to Firestore with created_by:',
        settingsData.created_by
      );
      alert('Paramètres enregistrés avec succès');
    } catch (error) {
      console.error('Error saving settings to Firestore:', error);
      alert('Erreur lors de l’enregistrement des paramètres');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 relative min-h-[calc(100vh-200px)]">
      <h2 className="text-lg font-semibold mb-4">Paramètres généraux</h2>
      <p className="text-gray-600 mb-6">
        Configurez les paramètres généraux de votre station radio.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom de la station
            </label>
            <input
              type="text"
              {...register('stationName', { required: 'Ce champ est requis' })}
              className="form-input"
            />
            {errors.stationName && (
              <p className="mt-1 text-sm text-red-600">
                {errors.stationName.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slogan
            </label>
            <input
              type="text"
              {...register('stationSlogan')}
              className="form-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL du flux audio
            </label>
            <input
              type="url"
              {...register('streamUrl', { required: 'Ce champ est requis' })}
              className="form-input"
            />
            {errors.streamUrl && (
              <p className="mt-1 text-sm text-red-600">
                {errors.streamUrl.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fuseau horaire
            </label>
            <select
              {...register('timezone', { required: 'Ce champ est requis' })}
              className="form-input"
            >
              <option value="Europe/Paris">Europe/Paris</option>
              <option value="Europe/London">Europe/London</option>
              <option value="America/New_York">America/New_York</option>
              <option value="Africa/Douala">Africa/Douala</option>
            </select>
            {errors.timezone && (
              <p className="mt-1 text-sm text-red-600">
                {errors.timezone.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Langue par défaut
            </label>
            <select
              {...register('language', { required: 'Ce champ est requis' })}
              className="form-input"
            >
              <option value="fr">Français</option>
              <option value="en">English</option>
              <option value="es">Español</option>
            </select>
            {errors.language && (
              <p className="mt-1 text-sm text-red-600">
                {errors.language.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL du logo
            </label>
            <input
              type="url"
              {...register('logoUrl')}
              className="form-input"
              placeholder="https://example.com/logo.png"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <button type="submit" className="btn btn-primary">
            Enregistrer les modifications
          </button>
        </div>
      </form>

      {/* Filigrane discret en bas de la page */}
      <div className="absolute bottom-2 left-0 right-0 text-center text-xs text-gray-400 opacity-50">
        Dernière modification par : {lastModifiedBy}
      </div>
    </div>
  );
};

export default GeneralSettings;

// import React from 'react';
// import { useForm } from 'react-hook-form';

// interface GeneralSettingsForm {
//   stationName: string;
//   stationSlogan: string;
//   streamUrl: string;
//   timezone: string;
//   language: string;
//   logoUrl: string;
// }

// const GeneralSettings: React.FC = () => {
//   const { register, handleSubmit, formState: { errors } } = useForm<GeneralSettingsForm>({
//     defaultValues: {
//       stationName: 'Radio Audace',
//       stationSlogan: 'La radio qui vous inspire',
//       streamUrl: 'https://radio.audace.ovh/stream.mp3',
//       timezone: 'Europe/Paris',
//       language: 'fr',
//       logoUrl: '',
//     }
//   });

//   const onSubmit = (data: GeneralSettingsForm) => {
//     console.log('Saving settings:', data);
//     // Implémentation à venir
//     alert('Paramètres enregistrés avec succès');
//   };

//   return (
//     <div className="bg-white rounded-lg shadow p-6">
//       <h2 className="text-lg font-semibold mb-4">Paramètres généraux</h2>
//       <p className="text-gray-600 mb-6">
//         Configurez les paramètres généraux de votre station radio.
//       </p>

//       <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Nom de la station
//             </label>
//             <input
//               type="text"
//               {...register('stationName', { required: 'Ce champ est requis' })}
//               className="form-input"
//             />
//             {errors.stationName && (
//               <p className="mt-1 text-sm text-red-600">{errors.stationName.message}</p>
//             )}
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Slogan
//             </label>
//             <input
//               type="text"
//               {...register('stationSlogan')}
//               className="form-input"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               URL du flux audio
//             </label>
//             <input
//               type="url"
//               {...register('streamUrl', { required: 'Ce champ est requis' })}
//               className="form-input"
//             />
//             {errors.streamUrl && (
//               <p className="mt-1 text-sm text-red-600">{errors.streamUrl.message}</p>
//             )}
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Fuseau horaire
//             </label>
//             <select
//               {...register('timezone', { required: 'Ce champ est requis' })}
//               className="form-input"
//             >
//               <option value="Europe/Paris">Europe/Paris</option>
//               <option value="Europe/London">Europe/London</option>
//               <option value="America/New_York">America/New_York</option>
//               <option value="Africa/Douala">Africa/Douala</option>
//             </select>
//             {errors.timezone && (
//               <p className="mt-1 text-sm text-red-600">{errors.timezone.message}</p>
//             )}
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Langue par défaut
//             </label>
//             <select
//               {...register('language', { required: 'Ce champ est requis' })}
//               className="form-input"
//             >
//               <option value="fr">Français</option>
//               <option value="en">English</option>
//               <option value="es">Español</option>
//             </select>
//             {errors.language && (
//               <p className="mt-1 text-sm text-red-600">{errors.language.message}</p>
//             )}
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               URL du logo
//             </label>
//             <input
//               type="url"
//               {...register('logoUrl')}
//               className="form-input"
//               placeholder="https://example.com/logo.png"
//             />
//           </div>
//         </div>

//         <div className="pt-4 border-t border-gray-200">
//           <button type="submit" className="btn btn-primary">
//             Enregistrer les modifications
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default GeneralSettings;
