import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { emissionApi } from '../../services/api/emissions';
import FormField from '../../components/common/FormField';
import { showSchema } from '../../schemas/showSchema';
import type { CreateEmissionData } from '../../types/emission';
import { isAxiosError } from 'axios';

const CreateShow: React.FC = () => {
  const navigate = useNavigate();
  const { token, permissions } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateEmissionData>({
    resolver: zodResolver(showSchema),
  });

  const onSubmit = async (data: CreateEmissionData) => {
    if (!token || !permissions?.can_create_emissions) return;
    
    setIsSubmitting(true);
    setError(null);

    try {
      await emissionApi.create(token, data);
      navigate('/shows', {
        replace: true,
        state: {
          notification: {
            type: 'success',
            message: 'Émission créée avec succès',
          },
        },
      });
    } catch (err) {
      console.error('Failed to create emission:', err);
      
      if (isAxiosError(err)) {
        setError(
          err.response?.data?.message || 
          err.response?.data?.detail || 
          "Une erreur est survenue lors de la création de l'émission"
        );
      } else {
        setError("Erreur de connexion. Veuillez vérifier votre connexion internet et réessayer.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!permissions?.can_create_emissions) {
    navigate('/404');
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/shows')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          Retour aux émissions
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Nouvelle émission
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Créez une nouvelle émission en remplissant les informations ci-dessous
          </p>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border-l-4 border-red-400 text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <FormField
              label="Titre"
              error={errors.title?.message}
              required
            >
              <input
                type="text"
                {...register('title')}
                className="form-input"
                placeholder="Titre de l'émission"
              />
            </FormField>

            <FormField
              label="Synopsis"
              error={errors.synopsis?.message}
              required
            >
              <input
                type="text"
                {...register('synopsis')}
                className="form-input"
                placeholder="Bref résumé de l'émission"
              />
            </FormField>

            <FormField
              label="Type"
              error={errors.type?.message}
              required
            >
              <select {...register('type')} className="form-input">
                <option value="">Sélectionner un type</option>
                <option value="morning-show">Matinale</option>
                <option value="news">Journal</option>
                <option value="talk-show">Talk-show</option>
                <option value="music-show">Émission musicale</option>
                <option value="cultural">Magazine culturel</option>
                <option value="sports">Sport</option>
                <option value="documentary">Documentaire</option>
                <option value="entertainment">Divertissement</option>
                <option value="debate">Débat</option>
                <option value="other">Autre</option>
              </select>
            </FormField>

            <FormField
              label="Durée (minutes)"
              error={errors.duration?.message}
              required
            >
              <input
                type="number"
                {...register('duration', { valueAsNumber: true })}
                className="form-input"
                min="1"
              />
            </FormField>

            <FormField
              label="Fréquence"
              error={errors.frequency?.message}
              required
            >
              <select {...register('frequency')} className="form-input">
                <option value="">Sélectionner une fréquence</option>
                <option value="daily">Quotidienne</option>
                <option value="weekly">Hebdomadaire</option>
                <option value="monthly">Mensuelle</option>
                <option value="special">Spéciale</option>
              </select>
            </FormField>
          </div>

          <FormField
            label="Description"
            error={errors.description?.message}
            required
          >
            <textarea
              {...register('description')}
              rows={4}
              className="form-textarea"
              placeholder="Description détaillée de l'émission..."
            />
          </FormField>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/shows')}
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
              {isSubmitting ? 'Création...' : 'Créer l\'émission'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateShow;