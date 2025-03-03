import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { rundownSchema } from '../schemas/rundownSchema';
import { useRundownStore } from '../store/useRundownStore';
import FormField from '../components/common/FormField';
import NewSegmentForm from '../components/rundowns/segments/NewSegmentForm';
import SegmentList from '../components/rundowns/segments/SegmentList';
import type { RundownFormData, ShowSegment, ShowType, ShowTitle } from '../types';

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

const showTypes: { value: ShowType; label: string }[] = [
  { value: 'morning-show', label: 'Matinale' },
  { value: 'news', label: 'Journal' },
  { value: 'talk-show', label: 'Talk-show' },
  { value: 'music-show', label: 'Émission musicale' },
  { value: 'cultural', label: 'Magazine culturel' },
  { value: 'sports', label: 'Sport' },
  { value: 'documentary', label: 'Documentaire' },
  { value: 'entertainment', label: 'Divertissement' },
  { value: 'debate', label: 'Débat' },
  { value: 'other', label: 'Autre' },
];

const CreateRundown: React.FC = () => {
  const navigate = useNavigate();
  const [segments, setSegments] = useState<ShowSegment[]>([]);
  const [isFormValid, setIsFormValid] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RundownFormData>({
    resolver: zodResolver(rundownSchema),
    mode: 'onChange',
  });

  const setRundowns = useRundownStore((state) => state.setRundowns);
  const rundowns = useRundownStore((state) => state.rundowns);

  // Surveiller les changements dans le formulaire
  const formValues = watch();

  useEffect(() => {
    // Vérifier si tous les champs requis sont remplis
    const hasRequiredFields = Boolean(
      formValues.title && 
      formValues.showType &&
      formValues.date && 
      formValues.time
    );
    const hasSegments = segments.length > 0;
    
    setIsFormValid(hasRequiredFields && hasSegments);
  }, [formValues, segments]);

  const handleAddSegment = (segment: ShowSegment) => {
    setSegments([...segments, segment]);
  };

  const handleReorderSegments = (reorderedSegments: ShowSegment[]) => {
    setSegments(reorderedSegments);
  };

  const handleDeleteSegment = (segmentId: string) => {
    setSegments(segments.filter((segment) => segment.id !== segmentId));
  };

  const onSubmit = (data: RundownFormData) => {
    if (!isFormValid) return;

    const newRundown = {
      id: uuidv4(),
      title: data.title,
      showType: data.showType,
      date: `${data.date}T${data.time}`,
      description: data.description?.trim() || '',
      status: 'draft' as const,
      segments,
      guests: [],
    };

    setRundowns([...rundowns, newRundown]);
    
    // Redirection avec message de succès
    navigate('/rundowns', { 
      replace: true,
      state: { 
        notification: {
          type: 'success',
          message: 'Le conducteur a été créé avec succès'
        }
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/rundowns')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className="h-5 w-5" />
          <span>Retour aux conducteurs</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">
            Nouveau conducteur
          </h1>
          <p className="mt-1 text-gray-600">
            Créez un nouveau conducteur en remplissant les informations ci-dessous
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid gap-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField 
                label="Titre de l'émission" 
                error={errors.title?.message}
                required
              >
                <select
                  {...register('title')}
                  className="form-input"
                >
                  <option value="">Sélectionner un titre</option>
                  {showTitles.map(title => (
                    <option key={title.value} value={title.value}>
                      {title.label}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField 
                label="Type d'émission" 
                error={errors.showType?.message}
                required
              >
                <select
                  {...register('showType')}
                  className="form-input"
                >
                  <option value="">Sélectionner un type</option>
                  {showTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField 
                label="Date" 
                error={errors.date?.message}
                required
              >
                <input
                  type="date"
                  {...register('date')}
                  className="form-input"
                  min={new Date().toISOString().split('T')[0]}
                />
              </FormField>

              <FormField 
                label="Heure" 
                error={errors.time?.message}
                required
              >
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
              onClick={() => navigate('/rundowns')}
              className="btn btn-secondary"
            >
              Annuler
            </button>
            <button 
              type="submit" 
              className={`btn ${isFormValid ? 'btn-primary' : 'btn-primary opacity-50 cursor-not-allowed'}`}
              disabled={!isFormValid}
            >
              Créer le conducteur
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRundown;