import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft } from 'lucide-react';
import { guestSchema } from '../../schemas/guestSchema';
import { useGuestStore } from '../../store/useGuestStore';
import FormField from '../../components/common/FormField';
import type { GuestFormData } from '../../schemas/guestSchema';
import { useLocation } from 'react-router-dom';
import { guestApi } from '../../api/guests';
import { useAuthStore } from '../../store/useAuthStore';

const EditGuest: React.FC = () => {
  const token = useAuthStore((state) => state.token);

  // Récupération de l'objet `location` pour accéder aux données transmises
  const location = useLocation();
  const { guest: locationGuest } = location.state || {};

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  // const guests = useGuestStore((state) => state.guests);
  // const updateGuest = useGuestStore((state) => state.updateGuest);

  // const guest = guests.find(g => g.id === id);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
  } = useForm<GuestFormData>({
    resolver: zodResolver(guestSchema),
    mode: 'onChange',
  });

  React.useEffect(() => {
    if (locationGuest) {
      setValue('name', locationGuest.name);
      setValue('role', locationGuest.role);
      setValue('biography', locationGuest.biography || '');
      if (locationGuest.contact) {
        setValue('contact.email', locationGuest.contact.email);
        setValue('contact.phone', locationGuest.contact.phone);
      }
    } else {
      navigate('/guests');
    }
  }, [locationGuest, setValue, navigate]);

  const onSubmit = (data: GuestFormData) => {
    console.log('Form data:', data); // Vérifier les données soumises
    console.log('Errors:', errors);
    if (!locationGuest) return;
    if (!token) return;

    const updatedGuest = {
      ...locationGuest,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    const updatedGuestResponse = guestApi.update(token, id, updatedGuest);

    // updateGuest(updatedGuest);

    navigate('/guests', {
      replace: true,
      state: {
        notification: {
          type: 'success',
          message: "L'invité a été modifié avec succès",
        },
      },
    });
  };

  if (!locationGuest) return null;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/guests')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className="h-5 w-5" />
          <span>Retour aux invités</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Modifier l'invité
          </h1>
          <p className="mt-1 text-sm sm:text-base text-gray-600">
            Modifiez les informations de l'invité ci-dessous
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-4 sm:p-6 space-y-6"
        >
          <div className="space-y-4">
            <FormField
              label="Nom complet"
              error={errors.name?.message}
              required
            >
              <input
                type="text"
                {...register('name')}
                className="form-input"
                placeholder="Ex: Jean Dupont"
              />
            </FormField>

            <FormField label="Rôle" error={errors.role?.message} required>
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
              <textarea
                {...register('biography')}
                rows={4}
                className="form-textarea"
                placeholder="Biographie de l'invité..."
              />
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                required
              >
                <input
                  type="tel"
                  {...register('contact.phone')}
                  className="form-input"
                  placeholder="+33 6 12 34 56 78"
                />
              </FormField>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/guests')}
              className="w-full sm:w-auto btn btn-secondary"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto btn btn-primary"
              disabled={!isValid}
            >
              Enregistrer les modifications
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditGuest;
