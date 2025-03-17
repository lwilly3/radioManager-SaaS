import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { usersApi } from '../../services/api/users';
import FormField from '../../components/common/FormField';
import { userSchema } from '../../schemas/userSchema';
import type { CreateUserData } from '../../types/user';

const CreateUser: React.FC = () => {
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateUserData>({
    resolver: zodResolver(userSchema),
  });

  const onSubmit = async (data: CreateUserData) => {
    if (!token) return;
    
    setIsSubmitting(true);
    try {
      await usersApi.create(token, data);
      navigate('/users', {
        replace: true,
        state: {
          notification: {
            type: 'success',
            message: 'Utilisateur créé avec succès',
          },
        },
      });
    } catch (err) {
      console.error('Failed to create user:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/users')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          Retour aux utilisateurs
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Nouvel utilisateur
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Créez un nouvel utilisateur en remplissant les informations ci-dessous
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
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
              label="Mot de passe"
              error={errors.password?.message}
              required
            >
              <input
                type="password"
                {...register('password')}
                className="form-input"
                placeholder="••••••••"
              />
            </FormField>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/users')}
              className="btn btn-secondary"
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Création...' : 'Créer l\'utilisateur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUser;