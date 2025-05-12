import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft } from 'lucide-react';
// import axios from 'axios'; // Importation de la bibliothèque axios pour effectuer des requêtes HTTP
import { guestSchema } from '../../schemas/guestSchema'; // Importation du schéma de validation pour les données du formulaire
import FormField from '../../components/common/FormField'; // Composant personnalisé pour les champs de formulaire
import type { GuestFormData } from '../../schemas/guestSchema'; // Type des données du formulaire
import api from '../../api/api';
import { useAuthStore } from '../../store/useAuthStore';

const CreateGuest: React.FC = () => {
  const token = useAuthStore((state) => state.token);

  const navigate = useNavigate(); // Hook pour naviguer entre les pages

  // Initialisation de React Hook Form avec le schéma de validation Zod
  const {
    register, // Permet de lier les champs du formulaire au gestionnaire de formulaire
    handleSubmit, // Gère la soumission du formulaire
    formState: { errors, isValid }, // Contient les erreurs de validation et l'état de validité du formulaire
  } = useForm<GuestFormData>({
    resolver: zodResolver(guestSchema), // Utilisation de Zod pour valider les données
    mode: 'onChange', // Valide les données à chaque changement de champ
  });

  // Fonction appelée lors de la soumission du formulaire
  const onSubmit = async (data: GuestFormData) => {
    if (!token) return;
    try {
      // Envoi des données du formulaire à l'API backend
      const response = await api.post(
        'guests/',
        {
          name: data.name, // Nom de l'invité
          // contact_info: data.contact_info || '', // Informations de contact (optionnelles)
          biography: data.biography, // Biographie de l'invité
          role: data.role, // Rôle de l'invité (ex : journaliste, artiste, etc.)
          phone: data.contact?.phone || '', // Téléphone (optionnel)
          email: data.contact?.email || '', // Email (optionnel)
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Si la création est réussie, redirection vers la liste des invités avec une notification de succès
      if (response.status === 200) {
        navigate('/guests', {
          replace: true,
          state: {
            notification: {
              type: 'success', // Type de notification : succès
              message: "L'invité a été créé avec succès", // Message de succès
            },
          },
        });
      }
    } catch (error: any) {
      console.error(token, "Erreur lors de la création de l'invité :", error); // Log de l'erreur pour le débogage
      // Notification d'erreur à l'utilisateur
      alert(
        "Une erreur est survenue lors de la création de l'invité. Veuillez réessayer. ${token}"
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {' '}
      {/* Conteneur principal centré */}
      <div className="mb-6">
        {' '}
        {/* Bouton de retour */}
        <button
          onClick={() => navigate('/guests')} // Retour à la liste des invités
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className="h-5 w-5" /> {/* Icône de flèche */}
          <span>Retour aux invités</span>
        </button>
      </div>
      <div className="bg-white rounded-lg shadow">
        {' '}
        {/* Formulaire contenu dans une carte */}
        <div className="p-4 sm:p-6 border-b border-gray-200">
          {' '}
          {/* En-tête du formulaire */}
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Nouvel invité
          </h1>
          <p className="mt-1 text-sm sm:text-base text-gray-600">
            Créez un nouvel invité en remplissant les informations ci-dessous
          </p>
        </div>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-4 sm:p-6 space-y-6"
        >
          <div className="space-y-4">
            {' '}
            {/* Champs du formulaire */}
            <FormField
              label="Nom complet"
              error={errors.name?.message}
              required
            >
              {/* Champ pour le nom de l'invité */}
              <input
                type="text"
                {...register('name')}
                className="form-input"
                placeholder="Ex: Jean Dupont"
              />
            </FormField>
            <FormField label="Rôle" error={errors.role?.message} required>
              {/* Sélecteur pour le rôle de l'invité */}
              <select {...register('role')} className="form-input">
                <option value="">Sélectionner un rôle</option>
                <option value="journalist">Journaliste</option>
                <option value="expert">Expert</option>
                <option value="artist">Artiste</option>
                <option value="politician">Politique</option>
                <option value="athlete">Athlète</option>
                <option value="writer">Écrivain</option>
                <option value="scientist">Scientifique</option>
                <option value="other">Autre</option>
              </select>
            </FormField>
            <FormField
              label="Biographie"
              error={errors.biography?.message}
              required
            >
              {/* Champ pour la biographie de l'invité */}
              <textarea
                {...register('biography')}
                rows={4}
                className="form-textarea"
                placeholder="Biographie de l'invité..."
              />
            </FormField>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {' '}
              {/* Champs pour email et téléphone */}
              <FormField label="Email" error={errors.contact?.email?.message}>
                <input
                  type="email"
                  {...register('contact.email')}
                  className="form-input"
                  placeholder="email@exemple.com"
                />
              </FormField>
              <FormField
                label="Téléphone"
                error={errors.contact?.phone?.message}
              >
                <input
                  type="tel"
                  {...register('contact.phone')}
                  className="form-input"
                  placeholder="+237 677 01 97 95"
                />
              </FormField>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
            {' '}
            {/* Boutons d'action */}
            <button
              type="button"
              onClick={() => navigate('/guests')} // Annuler et revenir à la liste
              className="w-full sm:w-auto btn btn-secondary"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto btn btn-primary"
              disabled={!isValid} // Désactiver le bouton si le formulaire n'est pas valide
            >
              Créer l'invité
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGuest;
