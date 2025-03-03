import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { showSchema } from '../../schemas/showSchema';
import { useShowStore } from '../../store/useShowStore';
import FormField from '../../components/common/FormField';
import PresenterManager from '../../components/showPlans/presenters/PresenterManager';
import type { ShowFormData, Presenter } from '../../types';

const CreateShow: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPresenters, setSelectedPresenters] = useState<Presenter[]>([]);
  const addShow = useShowStore((state) => state.addShow);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ShowFormData>({
    resolver: zodResolver(showSchema),
    mode: 'onChange',
  });

  const handleAddPresenter = (presenter: Presenter) => {
    setSelectedPresenters([...selectedPresenters, presenter]);
  };

  const handleRemovePresenter = (presenterId: string) => {
    setSelectedPresenters(selectedPresenters.filter(p => p.id !== presenterId));
  };

  const handleSetMainPresenter = (presenterId: string) => {
    setSelectedPresenters(
      selectedPresenters.map(p => ({
        ...p,
        isMainPresenter: p.id === presenterId,
      }))
    );
  };

  const onSubmit = (data: ShowFormData) => {
    const newShow = {
      id: uuidv4(),
      ...data,
      presenters: selectedPresenters,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addShow(newShow);
    
    navigate('/shows', { 
      replace: true,
      state: { 
        notification: {
          type: 'success',
          message: 'L\'émission a été créée avec succès'
        }
      }
    });
  };

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
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Nouvelle émission
          </h1>
          <p className="mt-1 text-sm sm:text-base text-gray-600">
            Créez une nouvelle émission en remplissant les informations ci-dessous
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4 sm:p-6 space-y-6">
          <div className="space-y-4">
            <FormField 
              label="Titre de l'émission" 
              error={errors.title?.message}
              required
            >
              <input
                type="text"
                {...register('title')}
                className="form-input"
                placeholder="Ex: La Matinale"
              />
            </FormField>

            <FormField 
              label="Type d'émission"
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  placeholder="Ex: 120"
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
                placeholder="Description de l'émission..."
              />
            </FormField>

            <FormField
              label="Présentateurs"
              description="Sélectionnez un ou plusieurs présentateurs pour cette émission"
            >
              <PresenterManager
                selectedPresenters={selectedPresenters}
                onAddPresenter={handleAddPresenter}
                onRemovePresenter={handleRemovePresenter}
                onSetMainPresenter={handleSetMainPresenter}
              />
            </FormField>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/shows')}
              className="w-full sm:w-auto btn btn-secondary"
            >
              Annuler
            </button>
            <button 
              type="submit"
              className="w-full sm:w-auto btn btn-primary"
              disabled={!isValid}
            >
              Créer l'émission
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateShow;