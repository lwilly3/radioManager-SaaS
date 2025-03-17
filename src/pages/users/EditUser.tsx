import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft } from 'lucide-react';
import { userSchema } from '../../schemas/userSchema';
import { useAuthStore } from '../../store/useAuthStore';
import { usersApi } from '../../services/api/users';
import FormField from '../../components/common/FormField';
import type { UpdateUserData } from '../../types/user';

const EditUser: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<UpdateUserData>({
    resolver: zodResolver(userSchema),
  });

  useEffect(() => {
    const fetchUser = async () => {
      if (!token || !id) return;
      
      try {
        setIsLoading(true);
        const userData = await usersApi.getById(token, parseInt(id));
        
        setValue('username', userData.username);
        setValue('email', userData.email);
        setValue('name', userData.name);
        setValue('family_name', userData.family_name);
        setValue('phone_number', userData.phone_number || '');
        setValue('profilePicture', userData.profilePicture || '');
        setValue('is_active', userData.is_active);
      } catch (err) {
        console.error('Failed to fetch user:', err);
        setError('Failed to load user data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [token, id, setValue]);

  const onSubmit = async (data: UpdateUserData) => {
    if (!token || !id) return;

    try {
      setIsLoading(true);
      await usersApi.update(token, parseInt(id), data);
      
      navigate('/users', {
        replace: true,
        state: {
          notification: {
            type: 'success',
            message: 'Utilisateur mis à jour avec succès',
          },
        },
      });
    } catch (err) {
      console.error('Failed to update user:', err);
      setError("Erreur lors de la mise à jour de l'utilisateur");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/users')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className="h-5 w-5" />
          <span>Retour aux utilisateurs</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">
            Modifier l'utilisateur
          </h1>
          <p className="mt-1 text-gray-600">
            Modifiez les informations de l'utilisateur ci-dessous
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-400 text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <FormField
              label="Nom d'utilisateur"
              error={errors.username?.message}
              required
            >
              <input
                type="text"
                {...register('username')}
                className="form-input"
                placeholder="johndoe"
              />
            </FormField>

            <FormField
              label="Email"
              error={errors.email?.message}
              required
            >
              <input
                type="email"
                {...register('email')}
                className="form-input"
                placeholder="john.doe@example.com"
              />
            </FormField>

            <FormField
              label="Prénom"
              error={errors.name?.message}
              required
            >
              <input
                type="text"
                {...register('name')}
                className="form-input"
                placeholder="John"
              />
            </FormField>

            <FormField
              label="Nom"
              error={errors.family_name?.message}
              required
            >
              <input
                type="text"
                {...register('family_name')}
                className="form-input"
                placeholder="Doe"
              />
            </FormField>

            <FormField
              label="Téléphone"
              error={errors.phone_number?.message}
            >
              <input
                type="tel"
                {...register('phone_number')}
                className="form-input"
                placeholder="+33 6 12 34 56 78"
              />
            </FormField>

            <FormField
              label="Photo de profil"
              error={errors.profilePicture?.message}
            >
              <input
                type="url"
                {...register('profilePicture')}
                className="form-input"
                placeholder="https://example.com/photo.jpg"
              />
            </FormField>

            <div className="col-span-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register('is_active')}
                  className="form-checkbox h-4 w-4 text-indigo-600"
                />
                <span className="text-sm text-gray-700">Compte actif</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/users')}
              className="btn btn-secondary"
              disabled={isLoading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUser;