import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft } from 'lucide-react';
import { showPlanSchema } from '../schemas/showPlanSchema';
import { useShowPlanStore } from '../store/useShowPlanStore';
import FormField from '../components/common/FormField';
import NewSegmentForm from '../components/showPlans/segments/NewSegmentForm';
import SegmentList from '../components/showPlans/segments/SegmentList';
import StatusSelect from '../components/showPlans/StatusSelect';
import PresenterManager from '../components/showPlans/presenters/PresenterManager';
import type {
  ShowPlanFormData,
  ShowSegment,
  ShowTitle,
  Status,
  Presenter,
} from '../types';
import { useLocation } from 'react-router-dom';

const showTitles: { value: ShowTitle; label: string }[] = [
  { value: 'matinale', label: 'La Matinale' },
  { value: 'midi-info', label: 'Midi Info' },
  { value: 'journal', label: 'Le Journal' },
  { value: 'club-sport', label: 'Club Sport' },
  { value: 'culture-mag', label: 'Culture Mag' },
  { value: 'debat-soir', label: 'Le Grand Débat du Soir' },
  { value: 'musique-live', label: 'Musique Live' },
  { value: 'interview', label: "L'Interview" },
  { value: 'chronique', label: 'La Chronique' },
  { value: 'autre', label: 'Autre' },
];

const EditShowPlan: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { show: showPlan } = location.state || {};
  const navigate = useNavigate();
  const showPlans = useShowPlanStore((state) => state.showPlans);
  const setShowPlans = useShowPlanStore((state) => state.setShowPlans);

  // const showPlan = showPlans.find((sp) => sp.id === id);

  const [segments, setSegments] = useState<ShowSegment[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<Status | null>(null);
  const [selectedPresenters, setSelectedPresenters] = useState<Presenter[]>([]);
  const [isFormValid, setIsFormValid] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ShowPlanFormData>({
    resolver: zodResolver(showPlanSchema),
    mode: 'onChange',
  });

  // // Load initial data
  // useEffect(() => {
  //   if (showPlan) {
  //     const date = new Date(showPlan.date);
  //     setValue('title', showPlan.title);
  //     setValue('date', date.toISOString().split('T')[0]);
  //     setValue('time', date.toISOString().split('T')[1].substring(0, 5));
  //     setValue('description', showPlan.description || '');
  //     setSegments(showPlan.segments);
  //     setSelectedStatus(showPlan.status);
  //     setSelectedPresenters(showPlan.presenters);
  //   } else {
  //     // navigate('/show-plans');
  //   }
  // }, [showPlan, setValue, navigate]);

  useEffect(() => {
    if (showPlan) {
      const date = new Date(showPlan.date);

      // Vérifiez si les champs sont déjà remplis avant de les réinitialiser
      setValue('title', showPlan.title || watch('title'));
      setValue('date', date.toISOString().split('T')[0] || watch('date'));
      setValue(
        'time',
        date.toISOString().split('T')[1].substring(0, 5) || watch('time')
      );
      setValue('description', showPlan.description || watch('description'));
      setSegments(showPlan.segments || []);
      setSelectedStatus(showPlan.status || null);
      setSelectedPresenters(showPlan.presenters || []);
    }
  }, [showPlan, setValue, navigate]);

  // Surveiller les changements dans le formulaire
  const formValues = watch();

  useEffect(() => {
    // Vérifier si tous les champs requis sont remplis
    const hasRequiredFields = Boolean(
      formValues.title && formValues.date && formValues.time
    );
    const hasSegments = segments.length > 0;
    const hasStatus = selectedStatus !== null;

    setIsFormValid(hasRequiredFields && hasSegments && hasStatus);
  }, [formValues, segments, selectedStatus]);

  const handleAddSegment = (segment: ShowSegment) => {
    // Ajoute un segment sans affecter les champs du formulaire
    setSegments((prevSegments) => [...prevSegments, segment]);

    // setSegments([...segments, segment]);
  };

  const handleReorderSegments = (reorderedSegments: ShowSegment[]) => {
    setSegments(reorderedSegments);
  };

  const handleDeleteSegment = (segmentId: string) => {
    setSegments(segments.filter((segment) => segment.id !== segmentId));
  };

  const handleAddPresenter = (presenter: Presenter) => {
    setSelectedPresenters([...selectedPresenters, presenter]);
  };

  const handleRemovePresenter = (presenterId: string) => {
    setSelectedPresenters(
      selectedPresenters.filter((p) => p.id !== presenterId)
    );
  };

  const handleSetMainPresenter = (presenterId: string) => {
    setSelectedPresenters(
      selectedPresenters.map((p) => ({
        ...p,
        isMainPresenter: p.id === presenterId,
      }))
    );
  };

  const onSubmit = (data: ShowPlanFormData) => {
    if (!isFormValid || !selectedStatus || !showPlan) return;

    const updatedShowPlan = {
      ...showPlan,
      title: data.title,
      date: `${data.date}T${data.time}`,
      description: data.description?.trim() || '',
      status: selectedStatus,
      segments,
      presenters: selectedPresenters,
    };

    setShowPlans(showPlans.map((sp) => (sp.id === id ? updatedShowPlan : sp)));

    // Redirection avec message de succès
    navigate('/show-plans', {
      replace: true,
      state: {
        notification: {
          type: 'success',
          message: 'Le conducteur a été modifié avec succès',
        },
      },
    });
  };

  if (!showPlan) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/show-plans')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className="h-5 w-5" />
          <span>Retour aux conducteurs</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">
            Modifier le conducteur
          </h1>
          <p className="mt-1 text-gray-600">
            Modifiez les informations du conducteur ci-dessous
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid gap-6">
            <div className="grid grid-cols-1 gap-4">
              <FormField
                label="Titre de l'émission"
                error={errors.title?.message}
                required
              >
                <select {...register('title')} className="form-input">
                  <option value="">Sélectionner un titre</option>
                  {showTitles.map((title) => (
                    <option key={title.value} value={title.value}>
                      {title.label}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Date" error={errors.date?.message} required>
                <input
                  type="date"
                  {...register('date')}
                  className="form-input"
                  min={new Date().toISOString().split('T')[0]}
                />
              </FormField>

              <FormField label="Heure" error={errors.time?.message} required>
                <input
                  type="time"
                  {...register('time')}
                  className="form-input"
                />
              </FormField>
            </div>

            <FormField
              label="Description (optionnelle)"
              error={errors.description?.message}
            >
              <textarea
                {...register('description')}
                rows={3}
                className="form-textarea"
                placeholder="Description de l'émission..."
              />
            </FormField>

            <FormField
              label="Statut"
              required
              error={!selectedStatus ? 'Le statut est requis' : undefined}
            >
              <StatusSelect
                selectedStatus={selectedStatus}
                onStatusSelect={setSelectedStatus}
              />
            </FormField>

            <FormField label="Présentateurs">
              <PresenterManager
                selectedPresenters={selectedPresenters}
                onAddPresenter={handleAddPresenter}
                onRemovePresenter={handleRemovePresenter}
                onSetMainPresenter={handleSetMainPresenter}
              />
            </FormField>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">
                Segments de l'émission
              </h2>
              {segments.length === 0 && (
                <p className="text-sm text-amber-600">
                  Ajoutez au moins un segment pour créer le conducteur
                </p>
              )}
            </div>
            <div className="space-y-6">
              <NewSegmentForm onAdd={handleAddSegment} />

              {segments.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Segments ajoutés ({segments.length})
                  </h3>
                  <SegmentList
                    segments={segments}
                    onReorder={handleReorderSegments}
                    onDelete={handleDeleteSegment}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/show-plans')}
              className="btn btn-secondary"
            >
              Annuler
            </button>
            <button
              type="submit"
              className={`btn ${
                isFormValid
                  ? 'btn-primary'
                  : 'btn-primary opacity-50 cursor-not-allowed'
              }`}
              disabled={!isFormValid}
            >
              Enregistrer les modifications
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditShowPlan;
