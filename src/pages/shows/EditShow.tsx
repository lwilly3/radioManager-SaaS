import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft } from 'lucide-react';
import { showSchema } from '../../schemas/showSchema';
import { useAuthStore } from '../../store/useAuthStore';
import { emissionApi } from '../../services/api/emissions';
import FormField from '../../components/common/FormField';
import type { UpdateEmissionData, Emission } from '../../types/emission';

const EditShow: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token, permissions } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emission, setEmission] = useState<Emission | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<UpdateEmissionData>({
    resolver: zodResolver(showSchema),
  });

  useEffect(() => {
    const fetchEmission = async () => {
      if (!token || !id) return;
      
      try {
        setIsLoading(true);
        const data = await emissionApi.getAllEmissions(token);
        const foundEmission = data.find(e => e.id === parseInt(id));
        
        if (foundEmission) {
          setEmission(foundEmission);
          setValue('title', foundEmission.title);
          setValue('synopsis', foundEmission.synopsis);
          setValue('type', foundEmission.type);
          setValue('duration', foundEmission.duration);
          setValue('frequency', foundEmission.frequency);
          setValue('description', foundEmission.description);
        } else {
          navigate('/shows');
        }
      } catch (err) {
        console.error('Failed to fetch emission:', err);
        setError('Failed to load emission data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmission();
  }, [token, id, setValue, navigate]);

  const onSubmit = async (data: UpdateEmissionData) => {
    if (!token || !id || !permissions?.can_edit_emissions) return;

    try {
      setIsLoading(true);
      await emissionApi.update(token, parseInt(id), data);
      
      navigate('/shows', {
        replace: true,
        state: {
          notification: {
            type: 'success',
            message: 'Émission mise à jour avec succès',
          },
        },
      });
    } catch (err) {
      console.error('Failed to update emission:', err);
      setError("Erreur lors de la mise à jour de l'émission");
    } finally {
      setIsLoading(false);
    }
  };

  if (!permissions?.can_edit_emissions) {
    navigate('/404');
    return null;
  }

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
          onClick={() => navigate('/shows')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className="h-5 w-5" />
          <span>Retour aux émissions</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">
            Modifier l'émission
          </h1>
          <p className="mt-1 text-gray-600">
            Modifiez les informations de l'émission ci-dessous
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-400 text-red-700">
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

export default EditShow;