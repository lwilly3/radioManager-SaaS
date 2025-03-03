import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft } from 'lucide-react';
import { showSchema } from '../../schemas/showSchema';
import { useShowStore } from '../../store/useShowStore';
import FormField from '../../components/common/FormField';
// import PresenterManager from '../../components/showPlans/presenters/PresenterManager';
import type { ShowFormData, Presenter } from '../../types';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

const EditShow: React.FC = () => {
  const token = useAuthStore((state) => state.token);

  // Récupération de l'objet `location` pour accéder aux données transmises
  const location = useLocation();
  const { show: show } = location.state || {};
  // const token = useAuthStore((state) => state.token);

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  // const shows = useShowStore((state) => state.shows);
  const updateShow = useShowStore((state) => state.updateShow);

  // const show = shows.find(s => s.id === id);
  const [selectedPresenters, setSelectedPresenters] = useState<Presenter[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
  } = useForm<ShowFormData>({
    resolver: zodResolver(showSchema),
    mode: 'onChange',
  });

  useEffect(() => {
    if (show) {
      setValue('title', show.title);
      setValue('type', show.type);
      setValue('duration', show.duration);
      setValue('frequency', show.frequency);
      setValue('description', show.description);
      // setSelectedPresenters(show.presenters);
    } else {
      navigate('/shows');
    }
  }, [show, setValue, navigate]);

  // const handleAddPresenter = (presenter: Presenter) => {
  //   setSelectedPresenters([...selectedPresenters, presenter]);
  // };

  // const handleRemovePresenter = (presenterId: string) => {
  //   setSelectedPresenters(selectedPresenters.filter(p => p.id !== presenterId));
  // };

  // const handleSetMainPresenter = (presenterId: string) => {
  //   setSelectedPresenters(
  //     selectedPresenters.map(p => ({
  //       ...p,
  //       isMainPresenter: p.id === presenterId,
  //     }))
  //   );
  // };

  const onSubmit = (data: ShowFormData) => {
    if (!show) return;

    const updatedShow = {
      ...show,
      ...data,
      // presenters: selectedPresenters,
      updatedAt: new Date().toISOString(),
    };

    updateShow(updatedShow);

    navigate('/shows', {
      replace: true,
      state: {
        notification: {
          type: 'success',
          message: "L'émission a été modifiée avec succès",
        },
      },
    });
  };

  if (!show) return null;

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
            Modifier l'émission
          </h1>
          <p className="mt-1 text-sm sm:text-base text-gray-600">
            Modifiez les informations de l'émission ci-dessous
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-4 sm:p-6 space-y-6"
        >
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
              {/* <PresenterManager
                selectedPresenters={selectedPresenters}
                onAddPresenter={handleAddPresenter}
                onRemovePresenter={handleRemovePresenter}
                onSetMainPresenter={handleSetMainPresenter}
              /> */}
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
              Enregistrer les modifications
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditShow;
